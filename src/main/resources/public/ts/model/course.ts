import {_, angular, model, moment, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import {Audience, Audiences, Structure, Subject, Teacher, Teachers, USER_TYPES, Utils} from './index';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';

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

    constructor (structure: Structure, id: string) {
        this.structure = structure;
        this._id = id;
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

    async sync(startDate, endDate, teacherId?) {
        let url = `/viescolaire/common/courses/${this.structure.id}/${startDate}/${endDate}`;
        url += `?teacherId=${model.me.type === USER_TYPES.personnel ? teacherId : model.me.userId}`;

        let {data} = await http.get(url);
        let courses = Mix.castArrayAs(Course, Courses.formatSqlDataToModel(data, this.structure));
        let course = courses.find(c => c._id === this._id);
        Mix.extend(this, course);
        this.init(this.structure);
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
        let firstDate = Utils.getFormattedDate(startMoment);
        let endDate =  Utils.getFormattedDate(endMoment);
        let filter = '';

        if (audience === null)
            filter += `teacherId=${model.me.type === USER_TYPES.personnel && teacher? teacher.id : model.me.userId}`;
        if (teacher === null && audience !== null)
            filter += `group=${audience.name}`;
        if (model.me.type === USER_TYPES.student && model.me.classes && model.me.classes.length)
            filter = `group=${model.me.classes[0]}`;
        let uri = `/viescolaire/common/courses/${structure.id}/${firstDate}/${endDate}?${filter}`;

        let { data } = await http.get(uri);
        this.all = Mix.castArrayAs(Course, Courses.formatSqlDataToModel(data, this.structure));
        this.all.forEach(i => {
            i.init(this.structure);
        });
    }
}