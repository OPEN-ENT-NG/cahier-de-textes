import {model, moment} from 'entcore';
import http, {AxiosResponse} from 'axios';
import {Mix} from 'entcore-toolkit';
import {Group, Groups} from "./group";
import {Audience, Audiences, Structure, Subject, Teacher, Teachers, USER_TYPES, DateUtils} from './index';
import {PEDAGOGIC_TYPES} from '../core/const/pedagogicTypes';
import {Moment} from "moment";

const colors = ['cyan', 'green', 'orange', 'pink', 'yellow', 'purple', 'grey'];

declare let window: any;

export class Course {

    _id: string;
    classNames: string[];
    groupNames: string[];
    audiences: Audiences;
    structure: Structure;
    teacherIds: string[];
    teachers: Teachers | any;
    subject: Subject;
    subject_id?: string;
    exceptionnal ?: string;

    dayOfWeek: any;
    rooms: any;
    color: any;

    startDate: any;
    startMoment: Moment;
    startDisplayDate: string;
    startDisplayTime: string;
    endCourse: any;
    endDate: any;
    endMoment: Moment;
    endDisplayDate: string;
    endDisplayTime: string;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_COURSE;

    //required for calendar
    is_periodic: boolean = false;
    locked: boolean = true;

    constructor(structure: Structure, id: string) {
        this.structure = structure;
        this._id = id;
    }

    static formatSqlDataToModel(data: any, structure?: Structure) {

        let audiences = new Audiences();
        let audienceNameArray = data && data.classes && data.classes.concat ? data.classes : [];
        if (data && data.groups) {
            audienceNameArray = audienceNameArray.concat(data.groups);
        }
        audiences.all = structure ? structure.audiences.all.filter(t => audienceNameArray.includes(t.name)) : [];

        let subject: Subject = data.subject;
        subject.label = subject.name;

        return {
            _id: data._id,
            audiences: audiences,
            classNames: data.classes,
            groupNames: data.groups,
            dayOfWeek: data.dayOfWeek,
            endDate: data.endDate,
            endCourse: data.endCourse,
            rooms: data.roomLabels,
            exceptionnal: data.exceptionnal,
            startDate: data.startDate,
            teacherIds: data.teacherIds,
            teachers: structure ? structure.teachers.all.filter(t => data.teacherIds.includes(t.id)) : new Teachers(),
            subject: subject,
            structure: null,
            subject_id: data.subjectId,
            color: data.color ? data.color : colors[Math.floor(Math.random() * colors.length)],
        };
    }

    setTeachers(teachers: Teacher[]): void {
        this.teachers = new Teachers(teachers);
    }

    /*
        WARNING: This init method is used for a second mapping after the Mix.castArray mapping.
        Param of type Moment are loosing their type when we cast object thanks Mix.castArray.
        That's why we need this second treatment.
     */
    init(structure: Structure) {
        this.structure = structure;
        if (this.startDate) {
            this.startMoment = moment(this.startDate);
            this.startDate = this.startMoment.toDate();
            this.startDisplayDate = DateUtils.getDisplayDate(this.startMoment);
            this.startDisplayTime = DateUtils.getDisplayTime(this.startMoment);
        }
        if (this.endDate) {
            this.endMoment = moment(this.endDate);
            this.endDate = this.endMoment.toDate();
            this.endDisplayDate = DateUtils.getDisplayDate(this.endMoment);
            this.endDisplayTime = DateUtils.getDisplayTime(this.endMoment);
        }
    }

    async sync(startDate, endDate, teacherId?) {
        let url = `/viescolaire/common/courses/${this.structure.id}/${startDate}/${endDate}`;
        url += `?teacherId=${model.me.type === USER_TYPES.personnel ? teacherId : model.me.userId}`;

        let {data} = await http.get(url);
        data = data.filter((d) => d.teacherIds);
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

    constructor(structure: Structure) {
        this.structure = structure;
        this.all = [];
        this.origin = [];
    }

    static formatSqlDataToModel = (data: any, structure?: Structure): Course[] =>
        data.map((c) => Course.formatSqlDataToModel(c, structure))

    async syncWithParams(structure: Structure, teachers: (Teacher | string)[] | null, audiences: Audience[] | null,
                         startMoment: any, endMoment: any, groups?: Groups): Promise<void> {
        let firstDate: string = DateUtils.getFormattedDate(startMoment);
        let endDate: string = DateUtils.getFormattedDate(endMoment);
        let filter: string = '';
        if (model.me.type !== USER_TYPES.student && model.me.type !== USER_TYPES.relative) {
            if (teachers) teachers.forEach((teacher: Teacher | string) => filter += `teacherId=${typeof teacher !== 'string' ? teacher.id : teacher}`);
            if (audiences) audiences.forEach((audience: Audience) => filter += `&group=${audience.name ? audience.name : audience.groupName}`);
        } else if (model.me.classes && model.me.classes.length) {
            if (audiences) {
                audiences.forEach((audience: Audience) => filter += `&group=${audience.name ? audience.name : audience.groupName}`);
                if (groups) {
                    let selectedGroups: Group[] = groups.all.filter((group: Group) => audiences.map(audience => audience.id).indexOf(group.id_classe) != -1);
                    if (selectedGroups) selectedGroups.forEach((group: Group) => group.name_groups.forEach((name: String) => filter += `&group=${name}`));
                }
            } else if (window.audiences && window.audiences.all.length > 0) {
                window.audiences.all.forEach((audience: Audience) =>
                    filter += `&group=${audience.name ? audience.name : audience.groupName}`);
            }
        }

        if (filter.substr(filter.length - 1) === "?") filter = filter.slice(0, -1);
        let uri: string = `/viescolaire/common/courses/${structure.id}/${firstDate}/${endDate}?${filter}`;

        let {data}: AxiosResponse = await http.get(uri);
        data = data.filter((d) => d.teacherIds);
        this.all = Mix.castArrayAs(Course, Courses.formatSqlDataToModel(data, structure ? structure : this.structure));
        this.all.forEach((i: Course) => {
            i.init(this.structure);
            i.subject.label = i.subject.name;
        });
    }

    /**
     * Synchronize courses.
     * @param structure structure
     * @param teacher teacher. Can be null. If null, group need to be provide.
     * @param audience
     * @param startMoment
     * @param endMoment
     * @param groups
     * @returns {Promise<void>} Returns a promise.
     */
    async sync(structure: Structure, teacher: Teacher | string | null, audience: Audience | null,
               startMoment: any, endMoment: any, groups?: Groups): Promise<void> {
        await this.syncWithParams(structure, teacher ? [teacher] : null, audience ? [audience] : null, startMoment, endMoment, groups ? groups : null)
    }

    public set(courses: Course[]): Courses {
        this.all = courses;
        return this;
    }
}