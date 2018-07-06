import { model, moment, _, notify } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';
import {USER_TYPES, Structure, Teacher, Group, Utils, Subject} from './index';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {Session} from "./session";
import {Visa} from "./visa";

const colors = ['cyan', 'green', 'orange', 'pink', 'yellow', 'purple', 'grey'];

export class Course {
    _id: string;
    structureId: string;
    startDate: string | object;
    endDate: string | object;
    dayOfWeek: number;
    teacherIds: string[];
    subjectId: string;
    roomLabels: string[];
    classes: string[];
    groups: string[];
    color: string;
    locked: boolean = true;
    is_periodic: boolean;
    startMoment: any;
    startDisplayDate: string;
    startDisplayTime: string;

    endMoment: any;
    endDisplayDate: string;
    endDisplayTime: string;
    subjectLabel: string;
    teachers: Teacher[];
    originalStartMoment?: any;
    originalEndMoment?: any;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_COURSE;

    constructor (obj: object, startDate?: string | object, endDate?: string | object) {
        if (obj instanceof Object) {
            for (let key in obj) {
                this[key] = obj[key];
            }
        }
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.is_periodic = false;

        if (startDate) {
            this.startMoment = moment(startDate);
            this.startDisplayDate = Utils.getDisplayDate(this.startMoment);
            this.startDisplayTime = Utils.getDisplayTime(this.startMoment);
        }
        if (endDate) {
            this.endMoment = moment(endDate);
            this.endDisplayDate = Utils.getDisplayDate(this.endMoment);
            this.endDisplayTime = Utils.getDisplayTime(this.endMoment);
        }
    }

    async save () {
        await this.create();
        return;
    }

    async create () {
        try {
            let arr = [];
            this.teacherIds = Utils.getValues(this.teachers, 'id');
            this.startDate = moment(this.startMoment).format('YYYY-MM-DDTHH:mm:ss');
            this.endDate = moment(this.endMoment).format('YYYY-MM-DDTHH:mm:ss');
            this.classes = Utils.getValues(_.where(this.groups, { type_groupe: Utils.getClassGroupTypeMap()['CLASS']}), 'name');
            this.groups = Utils.getValues(_.where(this.groups, { type_groupe: Utils.getClassGroupTypeMap()['FUNCTIONAL_GROUP']}), 'name');
            this.startDate = Utils.mapStartMomentWithDayOfWeek(this.startDate, this.dayOfWeek);
            arr.push(this.toJSON());
            await http.post('/edt/course', arr);
            return;
        } catch (e) {
            notify.error('notify.create.err');
            console.error(e);
            throw e;
        }
    }

    static formatSqlDataToModel(data: any, structure: Structure) {
        let course = new Course(data, data.startDate, data.endDate);
        course.subjectLabel = structure.subjects.mapping[data.subjectId];
        course.teachers = _.map(data.teacherIds, (ids) => {
            return _.findWhere(structure.teachers.all, {id: ids});
        });
        return course;
    }

    toJSON () {
        let o: any = {
            structureId: this.structureId,
            subjectId: this.subjectId,
            teacherIds: this.teacherIds,
            classes: this.classes,
            groups: this.groups,
            endDate: this.endDate,
            startDate: this.startDate,
            roomLabels: this.roomLabels,
            dayOfWeek: this.dayOfWeek,
            manual: true
        };
        if (this._id) {
            o._id = this._id;
        }
        return o;
    }

    async sync(structure?: Structure) {
        if(!this._id)
            return;
        let course = structure.courses.all.find(t => t._id === this._id);
        if(course){
            Mix.extend(this, course);
        }
        else {
            try {
                let {data} = await http.get('/viescolaire/common/course/' + this._id);
                Mix.extend(this, Course.formatSqlDataToModel(data, structure));

            } catch (e) {
                notify.error('session.sync.err');
            }
        }
    }
}

export class Courses {
    all: Course[];
    origin: Course[];

    constructor () {
        this.all = [];
        this.origin = [];
    }

    /**
     * Synchronize courses.
     * @param structure structure
     * @param teacher teacher. Can be null. If null, group need to be provide.
     * @param group group. Can be null. If null, teacher needs to be provide.
     * @returns {Promise<void>} Returns a promise.
     */
    async sync(structure: Structure, teacher: Teacher | null, group: Group | null, startMoment: any, endMoment: any): Promise<void> {
        if (teacher === null && group === null)
            return;

        let firstDate = Utils.getFormattedDate(startMoment);
        let endDate =  Utils.getFormattedDate(endMoment);
        let filter = '';

        if (group === null)
            filter += `teacherId=${model.me.type === USER_TYPES.personnel ? teacher.id : model.me.userId}`;
        if (teacher === null && group !== null)
            filter += `group=${group.name}`;
        let uri = `/viescolaire/common/courses/${structure.id}/${firstDate}/${endDate}?${filter}`;

        let courses = await http.get(uri);
        if (courses.data.length > 0) {
            this.all = _.map(courses.data, (course) => {
                return Course.formatSqlDataToModel(course, structure);
            });
            this.origin = Mix.castArrayAs(Course, courses.data);
        }
        return;
    }
}