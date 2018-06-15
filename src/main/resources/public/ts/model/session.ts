import {model, moment, _, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import {USER_TYPES, Structure, Teacher, Group, Utils} from './index';

const colors = [/*'cyan', 'green', 'orange', 'pink', 'yellow', 'purple',*/ 'grey'];

export class Session {
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
    startMomentDate: string;
    startMomentTime: string;
    startCalendarHour: Date;
    endCalendarHour: Date;
    endMoment: any;
    endMomentDate: string;
    endMomentTime: string;
    subjectLabel: string;
    teachers: Teacher[];
    originalStartMoment?: any;
    originalEndMoment?: any;


    subject_id: "2";
    school_id: "c82df58d-b036-465c-ab11-fddf6826e8cd";
    audience_id: "dabc2e8d-9dbb-422b-88c9-eb41c4c2c803";
    lesson_title: "Séance";
    lesson_color: "#ff0000";
    lesson_date: "2018-06-12";
    lesson_start_time: "11:00";
    lesson_end_time: "12:00";
    lesson_description: "<div>Seance de test de couleur rouge le 12 juin 2018 de 11 a 12h en salle 99 avec les 3eme en cours de physique&nbsp;</div>";
    lesson_annotation: "<div>Annotation de séance de test&nbsp;</div>";
    lesson_state: "draft";
    audience_type: "class";
    audience_name: "3ème";
    attachments: [];
    lesson_room: "99";


    constructor(obj: object, startDate?: string | object, endDate?: string | object) {
        if (obj instanceof Object) {
            for (let key in obj) {
                this[key] = obj[key];
            }
        }
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.is_periodic = false;

        if (startDate) {
            this.startMoment = moment(startDate);
            this.startCalendarHour = this.startMoment.seconds(0).millisecond(0).toDate();
            this.startMomentDate = this.startMoment.format('DD/MM/YYYY');
            this.startMomentTime = this.startMoment.format('hh:mm');
        }
        if (endDate) {
            this.endMoment = moment(endDate);
            this.endCalendarHour = this.endMoment.seconds(0).millisecond(0).toDate();
            this.endMomentDate = this.endMoment.format('DD/MM/YYYY');
            this.endMomentTime = this.endMoment.format('hh:mm');
        }
    }

    async save() {
        await this.create();
        return;
    }

    async create() {
        try {
            let arr = [];
            this.teacherIds = Utils.getValues(this.teachers, 'id');
            this.startDate = moment(this.startMoment).format('YYYY-MM-DDTHH:mm:ss');
            this.endDate = moment(this.endMoment).format('YYYY-MM-DDTHH:mm:ss');
            this.classes = Utils.getValues(_.where(this.groups, {type_groupe: Utils.getClassGroupTypeMap()['CLASS']}), 'name');
            this.groups = Utils.getValues(_.where(this.groups, {type_groupe: Utils.getClassGroupTypeMap()['FUNCTIONAL_GROUP']}), 'name');
            this.startDate = Utils.mapStartMomentWithDayOfWeek(this.startDate, this.dayOfWeek);
            arr.push(this.toJSON());
            await http.post('/edt/course', arr);
            return;
        } catch (e) {
            notify.error('cdt.notify.create.err');
            console.error(e);
            throw e;
        }
    }

    toJSON() {
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
}

export class Courses {
    all: Course[];
    origin: Course[];

    constructor() {
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
    async sync(structure: Structure, teacher: Teacher | null, group: Group | null): Promise<void> {
        if (teacher === null && group === null) return;
        let firstDate = moment(model.calendar.dayForWeek).hour(0).minute(0).format('YYYY-MM-DD');
        let endDate = moment(model.calendar.dayForWeek).add(7, 'day').hour(0).minute(0).format('YYYY-MM-DD');
        let filter = '';
        if (group === null) filter += `teacherId=${model.me.type === USER_TYPES.personnel ? teacher.id : model.me.userId}`;
        if (teacher === null && group !== null) filter += `group=${group.name}`;
        let uri = `/viescolaire/common/courses/${structure.id}/${firstDate}/${endDate}?${filter}`;
        let courses = await http.get(uri);
        if (courses.data.length > 0) {
            this.all = _.map(courses.data, (course) => {
                course = new Course(course, course.startDate, course.endDate);
                course.subjectLabel = structure.subjects.mapping[course.subjectId];
                course.teachers = _.map(course.teacherIds, (ids) => {
                    return _.findWhere(structure.teachers.all, {id: ids});
                });
                return course;
            });
            this.origin = Mix.castArrayAs(Course, courses.data);
        }
        return;
    }
}