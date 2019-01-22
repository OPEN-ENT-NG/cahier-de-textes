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


export class ProgressionSession{
    id: string;
    subject: Subject;
    title: string;
    description: string = "";
    plainTextDescription: string = "";
    annotation: string = "";
    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_SESSION;
    owner ;

    p_homeworks: ProgressionHomework[] = [];

    constructor(){
        this.subject=new Subject();
        this.title= "";
    }
    async create(){
        console.log(this);
        let response = await http.post('/diary/progression/create' , this.toJson());

    }

    init(){

    }
    static formatSqlDataToModel(data: any){

        return {
            id: data.id,
            title: data.title,
            room: data.room,
            description: data.description,
            p_homeworks: data.homeworks ? ProgressionHomework.formatSqlDataToModel(data.homeworks) : [],
        };
    }

    async get() {
        try {
            let {data} = await http.get('/diary/progression' + this.id);
            Mix.extend(this, ProgressionSession.formatSqlDataToModel(data));
            this.init();
        } catch (e) {
            notify.error('session.sync.err');
        }
    }

    private toJson() {
        return {
            description: this.description,
            subject_id: this.subject.id,
            title : this.title,
            annotation : this.annotation,
            owner_id: this.owner["id"]

        }
    }
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

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
    attachedToSession: boolean = true;

    static formatSqlDataToModel(homeworks: Homeworks | Homework[] | any[] | boolean | any) {
        
    }
}

export class ProgressionSessions{
    all: Session[];
    origin: Session[];
    structure: Structure;

    constructor (structure: Structure) {
        this.structure = structure;
        this.all = [];
        this.origin = [];
    }
}