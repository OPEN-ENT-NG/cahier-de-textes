import {_, moment, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import {Course, Structure, Subject, Teacher, Utils} from './index';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {FORMAT} from '../utils/const/dateFormat';
import {Visa} from './visa';
import {Homework, Homeworks} from './homework';
import {ProgressionSession,ProgressionHomework} from "./Progression";

const colors = ['grey', 'green'];

export class Session {
    id: string;
    subject: Subject;
    structure: Structure;
    teacher: Teacher;
    audience: any;
    title: string;
    color: string = _.first(colors);
    date: Date = moment().toDate();
    startTime: any = (moment().set({'hour': '08', 'minute':'00'})).seconds(0).millisecond(0).toDate();
    endTime: any = (moment().set({'hour': '10', 'minute': '00'})).seconds(0).millisecond(0).toDate();
    description: string = "";
    plainTextDescription: string = "";
    annotation: string = "";
    homeworks: Homework[] = [];
    room: string = "";
    courseId: string = null;
    isPublished: boolean;
    visas: Visa[] = [];
    opened: boolean;
    startMoment: any;
    endMoment: any;

    startDisplayDate: string;
    startDisplayTime: string;

    endDisplayDate: string;
    endDisplayTime: string;

    is_periodic: boolean = false;
    locked: boolean = true;

    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_SESSION;

    constructor(structure: Structure, course?: Course, progression?: ProgressionSession) {
        this.structure = structure;
        if(course){
            this.setFromCourse(course);
            this.init(structure);
            this.title = 'Séance du ' + this.startDisplayDate + ' (' + this.startDisplayTime + ':' + this.endDisplayTime + ')';
        }if(course && progression){
            this.setFromCourseAndProgression(progression,course);
            this.init(structure);
        }
    }

    static formatSqlDataToModel(data: any, structure: Structure){

        return {
            audience: structure.audiences.all.find(t => t.id === data.audience_id),
            teacher: structure.teachers.all.find(t => t.id === data.teacher_id),
            subject: structure.subjects.all.find(t => t.id === data.subject_id),
            id: data.id,
            title: data.title,
            room: data.room,
            color: data.color,
            isPublished: data.is_published,
            date: Utils.getFormattedDate(data.date),
            startTime: data.start_time,
            endTime: data.end_time,
            description: data.description,
            annotation: data.annotation,
            homeworks: data.homeworks ? Homeworks.formatSqlDataToModel(data.homeworks, structure) : [],
            visas: data.visas && data.visas !== "[null]" ? JSON.parse(data.visas) : [],
            courseId: data.course_id ? data.course_id: null,
            modified: data.modified,
            created: data.created
        };
    }

    toSendFormat(placeholder?) {
        return {
            id: this.id ? this.id : null,
            subject_id: this.subject.id,
            structure_id: this.structure.id,
            title: this.title ?  this.title : placeholder,
            color: this.color,
            date: Utils.getFormattedDate(this.date),
            start_time: Utils.getFormattedTime(this.startTime),
            end_time: Utils.getFormattedTime(this.endTime),
            description: this.description,
            annotation: this.annotation,
            is_published: this.isPublished,
            audience_id: this.audience.id,
            room: this.room,
            course_id: this.courseId
        };
    }

    init(structure: Structure){
        this.structure = structure;
        this.date = moment(this.date).toDate();
        this.startMoment = moment(Utils.getFormattedDateTime(this.date, moment(this.startTime, FORMAT.formattedTime)));
        this.startTime = moment(this.startTime, FORMAT.formattedTime).toDate();
        this.startDisplayDate = Utils.getDisplayDate(this.startMoment);
        this.startDisplayTime = Utils.getDisplayTime(this.startMoment);

        this.endMoment = moment(Utils.getFormattedDateTime(this.date, moment(this.endTime, FORMAT.formattedTime)));
        this.endTime = moment(this.endTime, FORMAT.formattedTime).toDate();
        this.endDisplayDate = Utils.getDisplayTime(this.endMoment);
        this.endDisplayTime = Utils.getDisplayTime(this.endMoment);

        if(this.courseId){
            this.color = colors[1];
        }

        if (this.visas.every(v => v === null)) {
            this.visas = [];
        } else {
            this.visas = Mix.castArrayAs(Visa, this.visas);
            this.visas.forEach(v => v.init(this.structure));
        }

        if(this.homeworks.every(v => v === null)){
            this.homeworks = [];
        }
        if(this.homeworks){
            this.homeworks = Mix.castArrayAs(Homework, this.homeworks);
            this.homeworks.forEach(h => {
                h.structure = this.structure;
                h.session = this;
                h.session_date = Utils.getFormattedDate(this.date);
                h.init();
            });
        }

        this.plainTextDescription = Utils.convertHtmlToPlainText(this.description);
    }

    async mapFromCourse() {
        if(!this.courseId)
            return;
        let course:any = this.structure.courses.all.find(i => i._id === this.courseId);
        if (!course)
            return;
        if (course.teachers && course.teachers.all && course.teachers.all.length > 0)
            this.teacher = course.teachers[0];
        if (course.rooms && course.rooms.length > 0)
            this.room = course.rooms[0];
        if (course.subject)
            this.subject = course.subject;
        if (course.beginning)
            this.date = this.startTime = course.beginning.toDate();
        if (course.end)
            this.endTime = course.end.toDate();
        if (course.audiences && course.audiences.all && course.audiences.all.length > 0)
            this.audience = course.audiences.all[0];
        this.color = colors[1];
    }

    async setFromCourse(course: Course) {
        this.courseId = course._id;
        this.teacher = course.teachers[0];
        this.room = course.rooms[0];
        this.subject = course.subject;
        this.date = this.startTime = course.startMoment.toDate();
        this.endTime = course.endMoment.toDate();
        this.audience = course.audiences.all[0];
        this.color = colors[1];
    }

    async save(placeholder?) {
        if(this.id) {
            let response = await http.put('/diary/session/' + this.id, this.toSendFormat(placeholder));
            return Utils.setToastMessage(response, 'session.updated','session.updated.error');

        } else {
            let response = await http.post('/diary/session', this.toSendFormat(placeholder));
            this.id=response.data.id;

            return Utils.setToastMessage(response, 'session.created','session.created.error');

        }
    }

    async delete() {
        let response = await http.delete('/diary/session/' + this.id);
        return Utils.setToastMessage(response, 'session.deleted','session.deleted.error');
    }

    async publish() {
        //console.log("Publier");
        let response = await http.post('/diary/session/publish/' + this.id);
        return Utils.setToastMessage(response, 'session.published','session.published.error');
    }

    async unpublish() {
        let response = await http.post('/diary/session/unpublish/' + this.id);
        return Utils.setToastMessage(response, 'session.unpublished','session.unpublished.error');
    }

    async sync() {
        try {
            let {data} = await http.get('/diary/session/' + this.id);
            Mix.extend(this, Session.formatSqlDataToModel(data, this.structure));
            this.init(this.structure);
        } catch (e) {
            notify.error('session.sync.err');
        }
    }

    setFromCourseAndProgression(progression: ProgressionSession,course: Course) {
        this.subject = progression.subject;
        this.title = progression.title;
        this.courseId = course._id;
        this.teacher = course.teachers[0];
        this.room = course.rooms[0];
        this.date = this.startTime = course.startMoment.toDate();
        this.endTime = course.endMoment.toDate();
        this.audience = course.audiences.all[0];
        this.color = colors[1];

    }
    async duplicateHomework(session){
        this.homeworks.map(async homework =>  {
          await  homework.duplicate(session.id,session.date);
        });
    }

    getSessionInfo(session: Session) {
        this.subject = session.subject;
        this.homeworks = session.homeworks;
        this.teacher = session.teacher;
        this.color = session.color;
        this.audience = session.audience;
        this.opened = true;
        this.room = session.room;
        this.description = session.description;
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

    static visaListingShuffle(sessions) {
        let final = [];
        sessions.forEach(function (sessionItem) {
            var index = _.findLastIndex(final, {
                teacherId: sessionItem.teacher.id,
                subjectId: sessionItem.subject.id,
                audienceId: sessionItem.audience.id,
                visaNeeded: sessionItem.visas && !sessionItem.visas.length
            });
            if (index > -1 && final[index] && final[index].sessions) {
                final[index].sessions.push(sessionItem);
            }
            else {
                final.push({
                    teacherId: sessionItem.teacher.id,
                    subjectId: sessionItem.subject.id,
                    audienceId: sessionItem.audience.id,
                    visaNeeded: sessionItem.visas && !sessionItem.visas.length,
                    sessions: [sessionItem]
                })
            }
        });

        final = final.map(function(item){
            if(!item || !item.sessions || !item.sessions[0])
                return item;
            let firstSession = item.sessions[0];
            return {
                teacher: firstSession.teacher,
                subject: firstSession.subject,
                audience: firstSession.audience,
                visas: !item.visaNeeded ? _.flatten(_.pluck(item.sessions, 'visas')) : null,
                sessions: item.sessions,
                sessionIds: _.pluck(item.sessions, 'id'),
                nbSessions: item.sessions.length,
                lastEdit: moment(
                    _.chain(item.sessions)
                        .pluck('modified')
                        .max(function (dateString) {
                            return new Date(dateString).getTime();
                        })
                        .value()
                ).format("DD-MM-YYYY HH:mm")
            }
        });
        return final;
    }

    async syncWithAudienceAndSubject(startMoment: any, endMoment: any, typeId?: string, type?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/lesson/${this.structure.id}/${startDate}/${endDate}/null`;

        await this.syncSessions(url);
    }

    async syncOwnSessions(startMoment: any, endMoment: any, audienceId?: string, subjectId?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/sessions/own/${startDate}/${endDate}`;

        if (audienceId) {
            url += `&audienceId=${audienceId}`;
        }
        if (subjectId) {
            url += `&subjectId=${subjectId}`;
        }
        url = url.replace('&', '?');

        await this.syncSessions(url);
    }

    async syncExternalSessions(startMoment: any, endMoment: any, type?: string, typeId?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/sessions/external/${startDate}/${endDate}/${type}/${typeId}`;

        await this.syncSessions(url);
    }

    async syncChildSessions(startMoment: any, endMoment: any, childId?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/sessions/child/${startDate}/${endDate}/${childId}`;

        await this.syncSessions(url);
    }

    async syncSessionsWithVisa(startMoment: any, endMoment: any, teacherId?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/sessions/visa/${startDate}/${endDate}/${teacherId}`;

        await this.syncSessions(url);
    }

    async syncSessions (url: string){
        let { data } = await http.get(url);

        this.all = Mix.castArrayAs(Session, Sessions.formatSqlDataToModel(data, this.structure));
        this.all.forEach(i => {
            i.init(this.structure);
        });
    }
}