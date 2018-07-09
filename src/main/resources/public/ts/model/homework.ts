import { model, moment, _, notify } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';
import { USER_TYPES, Structure, Teacher, Group, Utils} from './index';
import {Subject} from './subject';
import {FORMAT} from '../utils/const/dateFormat';
import {Course} from './course';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {Session} from './session';

export class Homework {
    id: string;
    title: string = '';
    description: string = '';
    dueDate: Date = moment().toDate();
    color: string;
    state: string = "draft";

    session_id: number;

    structure: Structure;
    type: HomeworkType;
    teacher: Teacher;
    subject: Subject;
    audience: any;
    session: Session;
    attachments: any = [];

    startMoment: any;
    endMoment: any;

    opened: boolean;
    is_periodic: boolean = false;
    locked: boolean = true;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_HOMEWORK;

    constructor (structure: Structure) {
        this.structure = structure;
        this.color = 'pink';
        this.type = new HomeworkType();
        this.dueDate = moment().toDate();
    }

    toSendFormat () {
        return {
            homework_title: this.title,
            subject_id: this.subject.id,
            homework_type_id: this.type.id,
            teacher_id: model.me.userId,
            school_id: this.structure.id,
            lesson_id: this.session ? this.session.id : undefined,
            audience_id: this.audience.id,
            homework_due_date: Utils.getFormattedDate(this.dueDate),
            homework_description: this.description,
            homework_color: this.color,
            homework_state: this.state,
            audience_type: this.audience.type_groupe == 0 ? 'class': 'group',
            audience_name: this.audience.name,
            attachments: this.attachments

        };
    }

    static formatSqlDataToModel(data: any, structure: Structure){

        let subject = new Subject();
        subject.id = data.subject_id;
        subject.label = data.subject_label;

        let type = new HomeworkType();
        type.label = data.homework_type_label;
        type.id = data.homework_type_id;

        return {
            audience: structure.groups.all.find(t => t.id === data.audience_id),
            teacher: structure.teachers.all.find(t => t.id === data.teacher_id),
            subject: structure.subjects.all.find(t => t.id === data.subject_id),
            session_id: data.lesson_id,
            id: data.id,
            type: type,
            title: data.homework_title,
            color: data.homework_color,
            dueDate: Utils.getFormattedDate(data.homework_due_date),
            description: data.homework_description,
            state: data.homework_state,
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
        let response = await http.post('/diary/publishHomeworks', {ids:[this.id]});
        return Utils.setToastMessage(response, 'homework.published','homework.published.error');
    }


    async unpublish() {
        try {
            return await http.post('/diary/unPublishHomeworks', {ids:[this.id]});
        } catch (e) {
            notify.error('notify.create.err');
            console.error(e);
            throw e;
        }
    }

    async sync(): Promise<void> {
        let {data} = await http.get('/diary/homework/' + this.id);
        Mix.extend(this, Homework.formatSqlDataToModel(data, this.structure));
        this.initDates();
    }

    initDates(){
        this.dueDate = moment(this.dueDate).toDate();
        this.startMoment = moment(this.dueDate);
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

    async sync(startMoment: any, endMoment: any, typeId?: string, type?: string){
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = '';
        if(!!typeId && !!type){
            url = `/diary/homework/external/${this.structure.id}/${startDate}/${endDate}/${type}/${typeId}`;
        } else {
            url = `/diary/homework/${this.structure.id}/${startDate}/${endDate}/null`;
        }

        let { data } = await http.get(url);

        this.all = Mix.castArrayAs(Homework, Homeworks.formatSqlDataToModel(data, this.structure));
        this.all.forEach(i => {
            i.initDates();
        });
    }

}

export class HomeworkType {
    id: number;
    label: string;
    category: string;
}

export class HomeworkTypes {
    all: HomeworkType[] = [];
    origin: HomeworkType[] = [];

    async  sync (): Promise<void> {
        let { data } = await http.get('/diary/homeworktype/initorlist');

        this.all = Mix.castArrayAs(HomeworkType, this.formatSqlDataToModel(data));
    }

    formatSqlDataToModel(data: any){
        let dataModel = [];
        data.forEach(i => {
            dataModel.push({
                id: i.id,
                structureId: i.school_id,
                label: i.homework_type_label,
                category: i.homework_type_category,
            });
        });
        return dataModel;
    }
}