import { model, moment, _, notify, idiom as lang } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';
import { Structure, Teacher, Utils} from './index';
import {Subject} from './subject';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {Session, Sessions} from './session';

export class Homework {
    id: string;
    title: string = '';
    description: string = '';
    dueDate: Date = moment().toDate();
    color: string;

    session_id: number;
    workloadWeek: WorkloadWeek;
    structure: Structure;
    type: HomeworkType;
    teacher: Teacher;
    subject: Subject;
    audience: any;
    session: Session;
    attachments: any = [];
    workload: number;
    startMoment: any;
    endMoment: any;
    isPublished: boolean;
    opened: boolean;
    is_periodic: boolean = false;
    locked: boolean = true;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_HOMEWORK;

    constructor (structure: Structure) {
        this.structure = structure;
        this.color = 'pink';
        this.dueDate = moment().toDate();
    }

    toSendFormat () {
        return {
            title: this.title,
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
            id: data.id,
            type: JSON.parse(data.type),
            title: data.title,
            color: data.color,
            dueDate: Utils.getFormattedDate(data.due_date),
            description: data.description,
            isPublished: data.is_published,
            workload: data.workload,
        };
    }

    async save () {
        if (this.id) {
            return await this.update();
        } else {
            return await this.create();
        }
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
        this.startMoment = moment(this.dueDate);
        this.workloadWeek = new WorkloadWeek(this.audience);
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
        console.log('syncHomeworks');
        let { data } = await http.get(url);

        this.all = Mix.castArrayAs(Homework, Homeworks.formatSqlDataToModel(data, this.structure));
        this.all.forEach(i => {
            i.init();
        });
    }
}

export class HomeworkType {
    id: number;
    label: string;
}

export class HomeworkTypes {
    all: HomeworkType[] = [];

    async  sync (): Promise<void> {
        let { data } = await http.get('/diary/homework-types');

        this.all = Mix.castArrayAs(HomeworkType, this.formatSqlDataToModel(data));
    }

    formatSqlDataToModel(data: any){
        let dataModel = [];
        data.forEach(i => {
            dataModel.push({
                id: i.id,
                label: i.label
            });
        });
        return dataModel;
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