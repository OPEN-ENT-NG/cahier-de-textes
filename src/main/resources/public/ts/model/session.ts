import {model, moment, _, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import { Subject, Structure, Teacher, Group, Utils} from './index';

const colors = ['grey'];

export class Session {
    id: string;
    subject: Subject;
    structure: Structure;
    audience: any;
    title: string;
    color: string = _.first(colors);
    date: any = moment().toDate();
    startTime: any = (moment().set({'hour': '08', 'minute':'00'})).seconds(0).millisecond(0).toDate();
    endTime: any = (moment().set({'hour': '10', 'minute': '00'})).seconds(0).millisecond(0).toDate();
    description: string = "";
    annotation: string = "";
    state: string = "draft";
    attachments: any = [];
    room: string = "99";


    constructor(structure) {
        this.structure = structure;
    }

    toJSON() {
        return {
            subject_id: this.subject.id,
            school_id: this.structure.id,
            lesson_title: this.title,
            lesson_color: this.color,
            lesson_date: this.date,
            lesson_start_time: moment(this.startTime).format("hh:mm"),
            lesson_end_time: moment(this.endTime).format("hh:mm"),
            lesson_description: this.description,
            lesson_annotation: this.annotation,
            lesson_state: this.state,
            audience_id: this.audience.id,
            audience_type: this.audience.type_groupe == 0 ? 'class' : 'group',
            attachments: this.attachments,
            lesson_room: this.room
        };
    }

    async save() {
        return await this.create();
    }

    async create() {
        try {
            console.log('createSession', this.toJSON());
            return await http.post('/diary/lesson', this.toJSON());
        } catch (e) {
            notify.error('cdt.notify.create.err');
            console.error(e);
            throw e;
        }
    }

    async sync(): Promise<void> {
        let {data} = await http.get('/diary/lesson/' + this.id);
    }
}
