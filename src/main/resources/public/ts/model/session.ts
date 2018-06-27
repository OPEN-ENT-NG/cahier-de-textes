import {model, moment, _, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import { Subject, Structure, Teacher, Group, Utils} from './index';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {FORMAT} from '../utils/const/dateFormat';
import {Visa} from './visa';

const colors = ['grey'];

export class Session {
    id: string;
    subject: Subject;
    structure: Structure;
    audience: any;
    title: string;
    color: string = _.first(colors);
    date: Date = moment().toDate();
    startTime: any = (moment().set({'hour': '08', 'minute':'00'})).seconds(0).millisecond(0).toDate();
    endTime: any = (moment().set({'hour': '10', 'minute': '00'})).seconds(0).millisecond(0).toDate();
    description: string = "";
    annotation: string = "";
    state: string = "draft";
    attachments: any = [];
    homeworkIds: any = [];
    room: string = "";

    visas: Visa[];

    startMoment: any;
    endMoment: any;

    startDisplayDate: string;
    startDisplayTime: string;

    endDisplayDate: string;
    endDisplayTime: string;

    is_periodic: boolean = false;
    locked: boolean = true;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_SESSION;

    constructor(structure: Structure) {
        this.structure = structure;
    }

    static formatSqlDataToModel(data: any, structure: Structure){

        let subject = new Subject();
        subject.id = data.subject_id;
        subject.label = data.subject_label;

        return {
            audience: structure.groups.all.find(t => t.id === data.audience_id),
            teacher: structure.teachers.all.find(t => t.id === data.teacher_id),
            subject: structure.subjects.all.find(t => t.id === data.subject_id),
            id: data.lesson_id,
            title: data.lesson_title,
            room: data.lesson_room,
            color: data.lesson_color,
            state: data.lesson_state,
            date: Utils.getFormattedDate(data.lesson_date),
            startTime: data.lesson_start_time,
            endTime: data.lesson_end_time,
            description: data.lesson_description,
            annotation: data.lesson_annotation,
            attachments: data.attachments,
            homeworkIds: data.homework_ids,
            visas: JSON.parse(data.visas)
        };
    }

    toJSON() {
        return {
            lesson_id: this.id ? this.id : null,
            subject_id: this.subject.id,
            school_id: this.structure.id,
            lesson_title: this.title,
            lesson_color: this.color,
            lesson_date: Utils.getFormattedDate(this.date),
            lesson_start_time: Utils.getFormattedTime(this.startTime),
            lesson_end_time: Utils.getFormattedTime(this.endTime),
            lesson_description: this.description,
            lesson_annotation: this.annotation,
            lesson_state: this.state,
            audience_id: this.audience.id,
            audience_type: this.audience.type_groupe == 0 ? 'class' : 'group',
            attachments: this.attachments ? this.attachments : [],
            lesson_room: this.room
        };
    }


    initDates(){
        this.date = moment(this.date).toDate();
        this.startMoment = moment(Utils.getFormattedDateTime(this.date, moment(this.startTime, FORMAT.formattedTime)));
        this.startTime = moment(this.startTime, FORMAT.formattedTime).toDate();
        this.startDisplayDate = Utils.getDisplayDate(this.startMoment);
        this.startDisplayTime = Utils.getDisplayTime(this.startMoment);

        this.endMoment = moment(Utils.getFormattedDateTime(this.date, moment(this.endTime, FORMAT.formattedTime)));
        this.endTime = moment(this.endTime, FORMAT.formattedTime).toDate();
        this.endDisplayDate = Utils.getDisplayTime(this.endMoment);
        this.endDisplayTime = Utils.getDisplayTime(this.endMoment);
    }

    async save() {
        return await this.createOrUpdate();
    }

    async createOrUpdate() {
        try {
            if(this.id)
                return await http.put('/diary/lesson/' + this.id, this.toJSON());
            else
                return await http.post('/diary/lesson', this.toJSON());
        } catch (e) {
            notify.error('notify.create.err');
            console.error(e);
            throw e;
        }
    }

    async delete() {
        try {
            return await http.delete('/diary/lesson/' + this.id);
        } catch (e) {
            notify.error('notify.create.err');
            console.error(e);
            throw e;
        }
    }

    async publish() {
        try {
            return await http.post('/diary/lesson/publish', this.toJSON());
        } catch (e) {
            notify.error('notify.create.err');
            console.error(e);
            throw e;
        }
    }


    async unpublish() {
        try {
            return await http.post('/diary/lesson/unpublish', this.toJSON());
        } catch (e) {
            notify.error('notify.create.err');
            console.error(e);
            throw e;
        }
    }

    async sync() {
        try {
            let {data} = await http.get('/diary/lesson/' + this.id);
            Mix.extend(this, Session.formatSqlDataToModel(data, this.structure));
            this.initDates();
            this.visas = Mix.castArrayAs(Visa, this.visas);
            this.visas.forEach(v => v.init(this.structure));

        } catch (e) {
            notify.error('session.sync.err');
        }
    }
}

export class Sessions {
    all: Session[];
    origin: Session[];
    structure: Structure;

    constructor (structure: Structure) {
        this.structure = structure;
        this.all = [];
        this.origin = [];
    }

    static formatSqlDataToModel(data: any, structure: Structure){
        let dataModel = [];
        data.forEach(i => dataModel.push(Session.formatSqlDataToModel(i, structure)));
        return dataModel;
    }

    async sync (startMoment: any, endMoment: any, typeId?: string, type?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);


        let url = '';
        if(!!typeId && !!type){
            url = `/diary/lesson/external/${this.structure.id}/${startDate}/${endDate}/${type}/${typeId}`;
        } else {
            url = `/diary/lesson/${this.structure.id}/${startDate}/${endDate}/null`;
        }

        let { data } = await http.get(url);

        this.all = Mix.castArrayAs(Session, Sessions.formatSqlDataToModel(data, this.structure));
        this.all.forEach(i => {
            i.initDates();
            if(!!i.visas){
                i.visas = Mix.castArrayAs(Visa, i.visas);
                i.visas.forEach(v => {
                    v.init(this.structure);
                });
            }
        });

    }
}