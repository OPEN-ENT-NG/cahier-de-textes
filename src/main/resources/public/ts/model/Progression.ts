///<reference path="session.ts"/>
import {_, model, moment, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import {Course, Structure, Subject, Teacher, Utils} from './index';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {FORMAT} from '../utils/const/dateFormat';
import {Visa} from './visa';
import {Homework, Homeworks, HomeworkType, WorkloadWeek} from './homework';
import {Session} from "./session";
import {subscript} from "entcore/types/src/ts/editor/options";
import forEach = require("core-js/fn/array/for-each");


export class ProgressionSession{
    id: string;
    subject: Subject;
    title: string;
    description: string = "";
    plainTextDescription: string = "";
    annotation: string = "";
    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_SESSION;
    owner ;
    subject_id;

    progression_homeworks: ProgressionHomework[] = [];

    constructor(){
        this.subject = new Subject();
        this.title= "";
    }
    async create(){
        let response = await http.post('/diary/progression/create' , this.toJson());

    }

    public setSubject(subject: Subject){
        this.subject = subject;
    }

    init(){

    }


    async get() {
        try {
            let {data} = await http.get('/diary/progression' + this.id);
            Mix.extend(this,data);
            this.init();
        } catch (e) {
            notify.error('session.sync.err');
        }
    }
    private  homeworksToJson() {
        let json = [];
        this.progression_homeworks.map(p => {
            let jsonLine = p.toJson(this.owner.id);
            if(jsonLine){
                json.push(jsonLine);
            }
        })
        return json;
    }
    private toJson() {

        return {
            description: this.description,
            subject_id: this.subject.id,
            title : this.title,
            annotation : this.annotation,
            owner_id: this.owner.id,
            progression_homeworks: this.homeworksToJson()

        }
    }
    isValidForm = () => {
        let validSessionOrDueDate = false;
        return this
            && this.title
            && this.subject.id
            && this.description
            && this.description.length;
    };



    static formatSqlDataToModel(data: any) {

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            subject_id : data.subject_id,
            progression_homeworks: data.homeworks != "[null]" ? ProgressionHomeworks.formatSqlDataToModel(data.homeworks) : [],
            modified: data.modified,
            created: data.created
        }
    }
}


export class ProgressionSessions{
    all: ProgressionSession[];
    origin: ProgressionSession[];
    owner_id;
    constructor (owner_id) {
        this.owner_id = owner_id;
        this.all = [];
        this.origin = [];
    }

    async sync(){
        let {data} = await http.get('/diary/progressions/' + this.owner_id);
        this.all = Mix.castArrayAs(ProgressionSession, ProgressionSessions.formatSqlDataToModel(data))
        this.all.forEach(i => {
            i.init();
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
    subject: Subject;
    p_session: ProgressionSession;
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
                description: this.description,
                subject_id: this.subject.id,
                owner_id: ownerId,
                type_id: this.type.id

            }
    }

    isValidForm = () => {
        let validSessionOrDueDate = false;
        return this

            && this.subject

            && this.type
            && this.description
            && this.description.length;
    };

    static formatSqlDataToModel(data) {
        let result={
            id: data.id,
            type_id : data.type_id,
            type_label : data.type_label,
            description: data.description,
            modified: data.modified,
            created: data.created
        }

        return result
    }
}
export class ProgressionHomeworks{
    all: ProgressionHomework[];

    static formatSqlDataToModel(data: any){
        let dataModel = [];

        let json = JSON.parse(data.toString())
        console.log(json);
        json.forEach(i => dataModel.push(Mix.castAs(ProgressionHomework,ProgressionHomework.formatSqlDataToModel(i))));
        dataModel.forEach(i => i.initType());
        return dataModel;
    }
}