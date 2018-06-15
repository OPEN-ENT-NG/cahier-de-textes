import { model, moment, _, notify } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';
import { USER_TYPES, Structure, Teacher, Group, Utils} from './index';
import {Subject} from './subject';
import {FORMAT} from '../utils/const/dateFormat';
import {Course} from './course';

export class Homework {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    color: string;
    state: any;

    structure: Structure;
    type: HomeworkType;
    teacher: Teacher;
    subject: Subject;
    audience: any;
    lesson: any;
    attachments: any[];

    startMoment: any;
    endMoment: any;
    is_periodic: boolean;

    constructor (structure?: Structure) {
        if(!!structure)
        {
            this.structure = structure;
        }
        this.color = 'pink';
        this.type = new HomeworkType();
        this.dueDate = moment().toDate();
    }

    toJson () {
        return {
            homework_title: this.title,
            subject_id: this.subject.id,
            homework_type_id: this.type.id,
            teacher_id: model.me.userId,
            school_id: this.structure.id,
            audience_id: this.audience.id,
            homework_due_date: Utils.getFormatedDate(this.dueDate),
            homework_description: this.description,
            homework_color: this.color,
            homework_state: this.state,
            audience_type: this.audience.type_groupe == 0 ? 'class': 'group',
            audience_name: this.audience.name,
            attachments: this.attachments

        };
    }

    formatSqlDataToModel(data: any){

        let subject = new Subject();
        subject.id = data.subject_id;
        subject.label = data.subject_label;

        let type = new HomeworkType();
        type.label = data.homework_type_label;
        type.id = data.homework_type_id;

        return {
            audience: this.structure.groups.all.find(t => t.id === data.audience_id),
            teacher: this.structure.teachers.all.find(t => t.id === data.teacher_id),
            subject: this.structure.subjects.all.find(t => t.id === data.subject_id),
            id: data.id,
            type: type,
            title: data.homework_title,
            color: data.homework_color,
            dueDate: moment(data.homework_due_date).toDate(),
            description: data.homework_description,
            state: data.homework_state,
        };
    }

    async save () {
        return await this.create();
    }

    async sync (): Promise<void> {
        let { data } = await http.get('/diary/homework/' + this.id);
        Mix.extend(this, this.formatSqlDataToModel(data));
    }

    async create () {
        try {
            console.log('createHomework', this.toJson());
            return await http.post('/diary/homework', this.toJson());
        } catch (e) {
            notify.error('cdt.notify.create.err');
            console.error(e);
            throw e;
        }
    }
}

export class Homeworks {
    all: Homework[];
    origin: Homework[];

    constructor () {
        this.all = [];
        this.origin = [];
    }

    async sync(structure: Structure, teacher: Teacher | null, group: Group | null): Promise<void> {

        return;
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