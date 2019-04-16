///<reference path="session.ts"/>
import {_, model, moment, notify} from 'entcore';
import http from 'axios';
import {Eventer, Mix, Selectable, Selection} from 'entcore-toolkit';
import {Course, Structure, Subject, Teacher, Utils} from './index';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {FORMAT} from '../utils/const/dateFormat';
import {Visa} from './visa';
import {Homework, Homeworks, HomeworkType, WorkloadWeek} from './homework';
import {Session,SessionType} from "./session";
import {subscript} from "entcore/types/src/ts/editor/options";
import forEach = require("core-js/fn/array/for-each");


export class ProgressionSession implements  Selectable{
    selected: boolean;
    id: string;
    subject: Subject;
    title: string;
    description: string = "";
    plainTextDescription: string = "";
    annotation: string = "";
    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_SESSION;
    owner ;
    class: string;
    owner_id;
    subject_id;
    type_id;
    homeworks;
    eventer: Eventer;
    type:SessionType;

    progression_homeworks: ProgressionHomework[] = [];

    constructor(){
        this.subject = new Subject();
        this.type = new SessionType();
        this.eventer = new Eventer();
        this.title= "";
        this.class = "";
    }
    async create(){
        let response = await http.post('/diary/progression/create' , this.toJson());
        return Utils.setToastMessage(response, 'progression.session.create','progression.session.create.error');

    }

    async update(){
        let response = await  http.put(`/diary/progression/update/${this.id}`, this.toJson());
        return Utils.setToastMessage(response, 'progression.session.update','progression.session.update.error');

    }

    public setSubject(subject: Subject){
        this.subject = subject;
    }

    public setType (type: SessionType){
        this.type = type;
    }

    init(){
        if(this.subject_id)
            this.subject.id = this.subject_id;
        if(this.type_id)
            this.type.id = this.type_id;
    }


    async get() {
        if(!this.title) {
            try {

                let {data} = await http.get('/diary/progression/' + this.id);
                Mix.extend(this, data[0]);
                this.progression_homeworks = [] ;

                let json = JSON.parse(this.homeworks.toString());
                json.forEach(i => this.progression_homeworks.push(Mix.castAs(ProgressionHomework, ProgressionHomework.formatSqlDataToModel(i))));
                this.progression_homeworks.forEach(i => i.initType());
                this.eventer.trigger(`get:end`);
            } catch (e) {
                //     notify.error('session.sync.err');
            }
        }

    }
    private  homeworksToJson(owner_id?) {
        let json = [];
        this.progression_homeworks.map(p => {
            let jsonLine = p.toJson(this.owner ? this.owner.id : owner_id);
            if(jsonLine){
                json.push(jsonLine);
            }
        });
        return json;
    }
    private toJson() {

        return {
            description: this.description,
            subject_id: this.subject.id ? this.subject.id : this.subject_id,
            title : this.title,
            class : this.class,
            annotation : this.annotation,
            owner_id: this.owner ? this.owner.id : this.owner_id,
            type_id : this.type.id ? this.type.id : this.type_id,
            progression_homeworks: this.homeworksToJson(this.owner ? this.owner.id : this.owner_id)

        };
    }
    isValidForm = () => {
        let validSessionOrDueDate = false;
        return this
            && this.title
            && this.subject.id
            && this.type.id
            && this.description
            && this.description.length;
    };

    setOwnerId(owner_id: any) {

        this.owner_id = owner_id;

    }

    static formatSqlDataToModel(data: any) {


        return {
            id: data.id,
            title: data.title,
            class: data.class,
            description: data.description,
            owner_id: data.owner_id,
            subject_id : data.subject_id,
            type_id : data.type_id,
            progression_homeworks: data.homeworks != "[null]" ? ProgressionHomeworks.formatSqlDataToModel(data.homeworks) : [],
            modified: data.modified,
            created: data.created
        };
    }





    async delete() {
        try {
            let response = await http.delete(`/diary/progression/${this.id}`);
            return Utils.setToastMessage(response, 'progression.session.delete','progression.session.delete.error');

        }catch (e){
            console.error(e);
        }
    }

    async toSession(idSession){
        let response = await http.put(`/diary/progression/to/session/${this.id}/${idSession}` , this.toJson());
        return Utils.setToastMessage(response, 'session.updated','session.updated.error');

    }
}


export class ProgressionSessions extends Selection<ProgressionSession>{
    owner_id;
    constructor (owner_id) {
        super([]);
        this.owner_id = owner_id;

    }

    async sync(){
        let {data} = await http.get('/diary/progressions/' + this.owner_id);
        this.all = Mix.castArrayAs(ProgressionSession, ProgressionSessions.formatSqlDataToModel(data));
        this.all.forEach(i => {
            i.init();
            i.setOwnerId(this.owner_id);
        });
    }

    private static formatSqlDataToModel(data: any) {
        let dataModel = [];
        data.forEach(i => dataModel.push(ProgressionSession.formatSqlDataToModel(i)));
        return dataModel;
    }
}

export class ProgressionHomework{
    id: string;
    description: string = '';
    plainTextDescription: string = '';
    p_session_id: number;
    type: HomeworkType;
    type_id;
    type_label;
    alreadyValidate: boolean = false;
    subject: Subject;
    subject_id;
    p_session: ProgressionSession;
    estimatedTime: number=0;
    isNewField: boolean=false;
    opened: boolean;
    owner;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
    attachedToSession: boolean = true;


    initType(){
        if(this.type_label && this.type_id){
            this.type = new HomeworkType();
            this.type.id = this.type_id;
            this.type.label = this.type_label;
        }
    }

    toJson(ownerId) {
        if(this.description.length)
            return {
                id: this.id || null ,
                description: this.description,
                subject_id: this.subject ? this.subject.id : this.subject_id,
                type_id: this.type ? this.type.id : this.type_id,
                estimatedTime: this.estimatedTime ? this.estimatedTime : 0,
                owner_id: ownerId,

            };
    }

    isValidForm = () => {
        let validSessionOrDueDate = false;
        return this

            && this.subject
            && this.estimatedTime >= 0
            && this.type
            && this.description
            && this.description.length;
    };

    static formatSqlDataToModel(data) {
        let result={
            id: data.id,
            type_id : data.type_id,
            subject_id:data.subject_id,
            type_label : data.type_label,
            description: data.description,
            estimatedTime: data.estimatedtime,
            modified: data.modified,
            created: data.created
        };

        return result;
    }

    async delete() {
        try {
            let response = await http.delete(`/diary/progression/homework/${this.id}`);
            return Utils.setToastMessage(response, 'homework.deleted','homework.deleted.error');

        }catch (e){
            console.error(e);
        }
    }
}
export class ProgressionHomeworks{
    all: ProgressionHomework[];

    static formatSqlDataToModel(data: any){
        let dataModel = [];

        let json = JSON.parse(data.toString());
        json.forEach(i => dataModel.push(Mix.castAs(ProgressionHomework,ProgressionHomework.formatSqlDataToModel(i))));
        dataModel.forEach(i => i.initType());
        return dataModel;
    }
}