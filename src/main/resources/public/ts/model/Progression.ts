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

    progression_homeworks: ProgressionHomework[] = [];

    constructor(){
        this.subject=new Subject();
        this.title= "";
    }
    async create(){
        let response = await http.post('/diary/progression/create' , this.toJson());

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
    private  homeWorkstoJson() {
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
            progression_homeworks: this.homeWorkstoJson()

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


}

export class ProgressionHomework{
    id: string;
    description: string = '';
    plainTextDescription: string = '';
    p_session_id: number;
    type: HomeworkType;
    subject: Subject;
    p_session: ProgressionSession;
    isNewField: boolean=false;
    opened: boolean;
    owner;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
    attachedToSession: boolean = true;



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

}

export class ProgressionSessions{
    all: Session[];
    origin: Session[];
    owner;
    constructor (owner) {
        this.all = [];
        this.origin = [];
    }

    async sync(){

    }
}