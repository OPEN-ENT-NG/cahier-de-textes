import {idiom as lang, model, moment, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import {Structure, Teacher, Utils} from './index';
import {Subject} from './subject';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {Session} from './session';

export class Homework {
    id: string;
    description: string = '';
    plainTextDescription: string = '';
    dueDate: Date = moment().toDate();
    color: string;

    session_id: number;
    session_date: string;
    workloadWeek: WorkloadWeek;
    structure: Structure;
    type: HomeworkType;
    teacher: Teacher;
    subject: Subject;
    audience: any;
    session: Session;
    workload: number;
    startMoment: any;
    endMoment: any;
    isPublished: boolean = false;
    opened: boolean;
    isNewField: boolean=false;
    is_periodic: boolean = false;
    locked: boolean = true;
    due_date;
    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
    attachedToSession: boolean = true;
    attachedToDate: boolean = false;
    isDone: boolean;

    static HOMEWORK_STATE_TODO : number = 1;
    static HOMEWORK_STATE_DONE : number = 2;

    constructor (structure: Structure) {
        this.structure = structure;
        this.color = 'pink';
        this.dueDate = moment().toDate();
    }

    toSendFormat () {
        return {
            subject_id: this.subject.id,
            type_id: this.type.id,
            teacher_id: model.me.userId,
            structure_id: this.structure.id,
            session_id: this.session ? this.session.id : null,
            audience_id: this.audience.id,
            due_date: Utils.getFormattedDate(this.dueDate),
            description: this.description,
            color: this.color,
            is_published: this.isPublished,
            workload: this.workload
        };
    }

    static formatSqlDataToModel(data: any, structure: Structure){

        let subject = new Subject();
        subject.id = data.subject_id;
        subject.label = data.subject_label;

        return {
            audience: structure.audiences.all.find(t => t.id === data.audience_id),
            teacher: structure.teachers.all.find(t => t.id === data.teacher_id),
            subject: structure.subjects.all.find(t => t.id === data.subject_id),
            session_id: data.session_id,
            session_date: data.session_date,
            id: data.id,
            type: data.type ? data.type : data.type,
            title: data.title,
            color: data.color,
            dueDate: Utils.getFormattedDate(data.due_date),
            description: data.description,
            isPublished: data.is_published,
            workload: data.workload,
            isDone: data.progress ? data.progress.state_label === 'done' : undefined
        };
    }

    async save () {
        if (this.id) {
            return await this.update();
        } else {
            return await this.create();
        }
    }

    async setProgress (stateId: number) {

        let state = stateId == Homework.HOMEWORK_STATE_DONE ? 'done' : 'todo';
        let response = await http.post(`/diary/homework/progress/${this.id}/${state}`);

        return Utils.setToastMessage(response, 'homework.setProgress','homework.setProgress.error');


    }

    async create () {
        let response = await http.post('/diary/homework', this.toSendFormat());
        return Utils.setToastMessage(response, 'homework.created','homework.created.error');
    }

    async update () {
        let response = await http.put('/diary/homework/' + this.id, this.toSendFormat());
        return Utils.setToastMessage(response, 'homework.updated','homework.updated.error');
    }

    async delete() {
        let response = await http.delete('/diary/homework/' + this.id);
        return Utils.setToastMessage(response, 'homework.deleted','homework.deleted.error');
    }

    async publish() {
        let response = await http.post('/diary/homework/publish/' + this.id);
        return Utils.setToastMessage(response, 'homework.published','homework.published.error');
    }


    async unpublish() {
        let response = await http.post('/diary/homework/unpublish/' + this.id);
        return Utils.setToastMessage(response, 'homework.unpublished','homework.unpublished.error');
    }

    async sync(): Promise<void> {
        let {data} = await http.get('/diary/homework/' + this.id);
        Mix.extend(this, Homework.formatSqlDataToModel(data, this.structure));
        this.init();
    }

    init(){
        this.type = Mix.castAs(HomeworkType, this.type);
        this.dueDate = moment(this.dueDate).toDate();
        if(this.session_id && this.session_date){
            this.startMoment = moment(this.session_date);
        } else {
            this.startMoment = moment(this.dueDate);
        }

        this.workloadWeek = new WorkloadWeek(this.audience);
        this.plainTextDescription = Utils.convertHtmlToPlainText(this.description);
    }


    isValidForm = () => {
        let validSessionOrDueDate = false;
        if(this.attachedToDate && this.dueDate){
            validSessionOrDueDate = true;
        } else if (this.attachedToSession && this.session) {
            validSessionOrDueDate = true;
        }
        return this
            && this.structure
            && this.subject
            && this.audience
            && validSessionOrDueDate
            && this.type
            && this.description
            && this.description.length;
    };

    async duplicate(idSession: any,date) {
        this.session.id = idSession;
        this.due_date = date;
        await this.create();
    }
}

export class Homeworks {
    all: Homework[];
    origin: Homework[];
    structure: Structure;

    constructor (structure: Structure) {
        this.structure = structure;
        this.all = [];
        this.origin = [];
    }

    static formatSqlDataToModel(data: any, structure: Structure){
        let dataModel = [];
        data.forEach(i => dataModel.push(Homework.formatSqlDataToModel(i, structure)));
        return dataModel;
    }

    async syncOwnHomeworks(startMoment: any, endMoment: any): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/homeworks/own/${startDate}/${endDate}`;

        await this.syncHomeworks(url);
    }

    async syncExternalHomeworks(startMoment: any, endMoment: any, type?: string, typeId?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/homeworks/external/${startDate}/${endDate}/${type}/${typeId}`;

        await this.syncHomeworks(url);
    }

    async syncChildHomeworks(startMoment: any, endMoment: any, childId?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/homeworks/child/${startDate}/${endDate}/${childId}`;

        await this.syncHomeworks(url);
    }

    async syncHomeworks (url: string){
        let { data } = await http.get(url);

        this.all = Mix.castArrayAs(Homework, Homeworks.formatSqlDataToModel(data, this.structure));
        this.all.forEach(i => {
            i.init();
        });
    }
}

export class HomeworkType {
    id: number;
    structure_id: string;
    label: string;
    rank: number;

    constructor (id_structure?: string) {
        if (id_structure) this.structure_id = id_structure;
    }

    toJson() {
        return {
            id: this.id,
            structure_id: this.structure_id,
            label: this.label,
            rank: this.rank
        }
    }

    async create() {
        let response = await http.post(`/diary/homework-type` , this.toJson());
        return Utils.setToastMessage(response,'cdt.homework.type.create', 'cdt.homework.type.create.error')
    }

    async update() {
        let response = await http.put(`/diary/homework-type/${this.id}`, this.toJson());
        return Utils.setToastMessage(response,'cdt.homework.type.update', 'cdt.homework.type.update.error')
    }

    async delete() {
        let {data} = await http.delete(`/diary/homework-type/${this.id}`);
        if (data.id != undefined) {
            let response = await http.put(`/diary/homework-type/${this.id}`, this.toJson());
            return Utils.setToastMessage(response,'cdt.homework.type.delete', 'cdt.homework.type.delete.error')
        }
        else {
            notify.error('cdt.homework.type.delete.impossible')
        }
    }
}

export class HomeworkTypes {
    all: HomeworkType[] = [];
    id: number;
    structure_id: string;
    label: string;

    constructor (id_structure?: string) {
        if (id_structure) this.structure_id = id_structure;
    }

    async  sync (): Promise<void> {
        let { data } = await http.get(`/diary/homework-types/${this.structure_id}`);
        this.all = Mix.castArrayAs(HomeworkType, data);
        this.id = data.id;
        this.label = data.label;
    }
}

export class Workload {
    total: number = 0;
    count: number = 0;
    day: any;
    shortDayString: string;
    numDayString;
    color: string;
    description: string;

    static getWorkloadColor(workload: number){
        if (0 < workload && workload <= 2) {
            return 'green';
        } else if (2 < workload && workload <= 4) {
            return 'yellow';
        } else if (4 < workload) {
            return 'red';
        }
    }

    getDescription(){
        return this.count + ' ' + (this.count > 0 ? lang.translate('homeworks') : lang.translate('homework'));
    }

    init(){
        this.shortDayString = moment(this.day).format('dddd').substring(0, 1).toUpperCase(); // 'lundi' -> 'lu' -> 'L'
        this.numDayString = moment(this.day).format('DD'); // 15
        this.color = Workload.getWorkloadColor(this.count);
        this.description = this.getDescription();
    }
}

export class WorkloadWeek {
    all: Workload[];
    audience: any;

    constructor(audience: any) {
        this.audience = audience;
    }

    static formatSqlDataToModel(data: any[]) {
        let dataModel = [];
        data.forEach(i => {
            dataModel.push({
                total: +i.total,
                count: +i.count,
                day: i.day
            });
        });
        return dataModel;
    };

    async sync(dateInWeek: any): Promise<void> {
        let {data} = await http.get(`/diary/workload-week/${Utils.getFormattedDate(dateInWeek)}/${this.audience.id}`);
        this.all = Mix.castArrayAs(Workload, WorkloadWeek.formatSqlDataToModel(data));
        this.all.forEach(w => w.init());
    }
}