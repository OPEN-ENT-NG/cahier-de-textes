import { angular, model, moment, _, notify } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';
import {USER_TYPES, Structure, Teacher, Teachers, Audiences, Audience, Utils, Subject} from './index';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {Session, Sessions} from "./session";
import {Visa} from "./visa";
import {Homework, Homeworks} from "./homework";
import {FORMAT} from "../utils/const/dateFormat";
import includes = require('core-js/fn/array/includes');

const colors = ['cyan', 'green', 'orange', 'pink', 'yellow', 'purple', 'grey'];

export class Course {

    _id: string;
    audiences: Audiences;
    structure: Structure;
    teachers: Teachers;
    subject: Subject;

    dayOfWeek: any;
    rooms: any;
    color: any;

    startDate: any;
    startMoment: any;
    startDisplayDate: string;
    startDisplayTime: string;

    endDate: any;
    endMoment: any;
    endDisplayDate: string;
    endDisplayTime: string;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_COURSE;

    //required for calendar
    is_periodic: boolean = false;
    locked: boolean = true;

    constructor (structure: Structure) {
        this.structure = structure;
    }

    static formatSqlDataToModel(data: any, structure: Structure) {

        let audiences = new Audiences();
        let audienceNameArray = data.classes.concat(data.groups);
        audiences.all = structure.audiences.all.filter(t => audienceNameArray.includes(t.name))
        return {
            _id: data._id,
            audiences: audiences,
            dayOfWeek: data.dayOfWeek,
            endDate: data.endDate,
            rooms: data.roomLabels,
            startDate: data.startDate,
            teachers: structure.teachers.all.filter(t => data.teacherIds.includes(t.id)),
            subject: structure.subjects.all.find(t => t.id === data.subjectId),
            color: data.color ? data.color :colors[Math.floor(Math.random() * colors.length)],
        };
    }

    init(structure: Structure) {
        this.structure = structure;
        if (this.startDate) {
            this.startMoment = moment(this.startDate);
            this.startDate = this.startMoment.toDate();
            this.startDisplayDate = Utils.getDisplayDate(this.startMoment);
            this.startDisplayTime = Utils.getDisplayTime(this.startMoment);
        }
        if (this.endDate) {
            this.endMoment = moment(this.endDate);
            this.endDate = this.endMoment.toDate();
            this.endDisplayDate = Utils.getDisplayDate(this.endMoment);
            this.endDisplayTime = Utils.getDisplayTime(this.endMoment);
        }
    }


    async sync(structure?: Structure) {
        try {
            let {data} = await http.get('/viescolaire/common/course/' + this._id);
            Mix.extend(this, Course.formatSqlDataToModel(data, this.structure));
            this.init(this.structure);
        } catch (e) {
            notify.error('session.sync.err');
        }
    }
}

export class Courses {
    all: Course[];
    origin: Course[];
    structure: Structure;

    constructor (structure: Structure) {
        this.structure = structure;
        this.all = [];
        this.origin = [];
    }

    static formatSqlDataToModel(data: any, structure: Structure) {
        let dataModel = [];
        data.forEach(i => dataModel.push(Course.formatSqlDataToModel(i, structure)));
        return dataModel;
    }

    /**
     * Synchronize courses.
     * @param structure structure
     * @param teacher teacher. Can be null. If null, group need to be provide.
     * @param group group. Can be null. If null, teacher needs to be provide.
     * @returns {Promise<void>} Returns a promise.
     */
    async sync(structure: Structure, teacher: Teacher | null, audience: Audience | null, startMoment: any, endMoment: any): Promise<void> {
        if (teacher === null && audience === null)
            return;

        let firstDate = Utils.getFormattedDate(startMoment);
        let endDate =  Utils.getFormattedDate(endMoment);
        let filter = '';

        if (audience === null)
            filter += `teacherId=${model.me.type === USER_TYPES.personnel ? teacher.id : model.me.userId}`;
        if (teacher === null && audience !== null)
            filter += `group=${audience.name}`;
        let uri = `/viescolaire/common/courses/${structure.id}/${firstDate}/${endDate}?${filter}`;

        let { data } = await http.get(uri);
        this.all = Mix.castArrayAs(Course, Courses.formatSqlDataToModel(data, this.structure));
        this.all.forEach(i => {
            i.init(this.structure);
        });
    }
}