import {_, moment, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import {Course, Structure, Subject, Teacher, Utils} from './index';
import {PEDAGOGIC_TYPES} from '../utils/const/pedagogicTypes';
import {FORMAT} from '../utils/const/dateFormat';
import {Visa} from './visa';
import {Homework, Homeworks} from './homework';
import {ProgressionSession} from "./Progression";

const colors = ['grey', 'green'];

export class Session {
    id: string;
    subject: Subject;
    type: SessionType;
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
    isPublished: boolean = true;
    visas: Visa[] = [];
    opened: boolean = false;
    startMoment: any;
    endMoment: any;
    startDisplayDate: string;
    startDisplayTime: string;
    one_visa ?:boolean;
    endDisplayDate: string;
    endDisplayTime: string;
    isDisplayed:boolean = false;
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
            type: structure.types.all.find(t => t.id === data.type_id),

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
            created: data.created,
            one_visa : data.one_visa
        };
    }

    toSendFormat(placeholder?) {

        return {
            id: this.id ? this.id : null,
            subject_id: this.subject.id,
            type_id: this.type.id,
            structure_id: this.structure.id,
            title: this.title ?  this.title : placeholder,
            color: this.color,
            date: Utils.getFormattedDate(this.date),
            start_time: Utils.getFormattedTime(this.startTime),
            end_time: Utils.getFormattedTime(this.endTime),
            description: Utils.htmlToXhtml(this.description),
            annotation: this.annotation,
            is_published: this.isPublished,
            audience_id: this.audience.id,
            room: (this.room)? this.room : '',
            course_id: this.courseId
        };
    }

    init(structure: Structure){
        this.type = Mix.castAs(SessionType, this.type);
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
        if(!this.subject)
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
    setFromProgression (progression){
        this.subject = progression.subject;
        this.title = progression.title;
        this.type = progression.type;
        this.description = progression.description;

    }
    setFromCourseAndProgression(progression: ProgressionSession,course: Course) {
        this.subject = progression.subject;
        this.title = progression.title;
        this.type = progression.type;
        this.courseId = course._id;
        this.teacher = course.teachers[0];
        this.room = course.rooms[0];
        this.date = this.startTime = course.startMoment.toDate();
        this.endTime = course.endMoment.toDate();
        this.audience = course.audiences.all[0];
        this.color = colors[1];
        this.description = progression.description;

    }
    //  duplicateHomework(session){
    //     this.homeworks.map(async homework =>  {
    //          homework.duplicate(session.id,session.date);
    //     });
    // }

    getSessionInfo(session: Session) {

        this.subject = new Subject();
        this.subject.id = session.subject.id;

        session.homeworks.map( homework =>  {
            homework.due_date = this.date;
            delete homework.id ;
            delete homework.session ;
            homework.subject = session.subject;
            homework.teacher = session.teacher;
            homework.audience = session.audience;

            this.homeworks.push(homework);
        });
        this.type = session.type;
        this.teacher = session.teacher;
        this.color = session.color;
        this.audience = session.audience;
        this.opened = true;
        this.room = session.room;
        this.description = session.description;

    }

    setFromCourseAndSession(course: Course, sessionDrag: Session) {
        this.courseId = course._id;
        this.teacher = sessionDrag.teacher;
        this.room = sessionDrag.room;
        this.type = sessionDrag.type;
        this.subject = new Subject();
        this.subject.id = sessionDrag.subject.id;

        this.date = this.startTime = course.startMoment.toDate();
        this.endTime = course.endMoment.toDate();
        this.audience = course.audiences.all[0];
        this.color = sessionDrag.color;
        this.description = sessionDrag.description;
        this.duplicateHomeworks(sessionDrag);
    }

    duplicateHomeworks(sessionDrag){
        sessionDrag.homeworks.map( h =>{
            delete h.id ;
            delete h.session;
            h.dueDate = this.date;
            h.audience = this.audience;
            h.subject = this.subject;
            h.teacher = this.teacher;
            this.homeworks.push(h);
        })
    }

    isSameSession(session : Session){
        let currentSessionTime = moment(this.date).add(moment(this.startTime).hour(),'hours').add(moment(this.startTime).minutes(),'minutes');
        let otherSessionTime = moment(session.date).add(moment(session.startTime).hour(),'hours').add(moment(session.startTime).minutes(),'minutes');

        return (moment(otherSessionTime).isSame(moment(currentSessionTime)))

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

    static groupByLevelANdSubject(sessions) {
        return _.groupBy(sessions, function (item) {
            if(item.audience && item.audience.id){
                let temp =  item.audience.id + "#"
                temp +=  (item.subject)? item.subject.id : item.subject_id
                return temp
            }else{
                let temp =  item.audience_id + "#"
                temp +=  (item.subject)? item.subject.id : item.subject_id
                return temp
            }
        });
    }

    async syncWithAudienceAndSubject(startMoment: any, endMoment: any, typeId?: string, type?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/lesson/${this.structure.id}/${startDate}/${endDate}/null`;

        await this.syncSessions(url);
    }

    async syncOwnSessions(strutcture: any,startMoment: any, endMoment: any, audienceId?: string, subjectId?: string): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);

        let url = `/diary/sessions/own/${startDate}/${endDate}/${this.structure.id}`;

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

    async syncSessionsWithVisa(startMoment: any, endMoment: any, structureId:string ,teacherId?: string,
                               subjectsId?: string, audiencesId?: string,
                               vised?:boolean ,notVised?:boolean): Promise<void> {
        let startDate = Utils.getFormattedDate(startMoment);
        let endDate = Utils.getFormattedDate(endMoment);
        let filter = (structureId ||teacherId ||audiencesId || subjectsId || vised || notVised) ? '?' : '';
        if(structureId){
            if (filter.length > 1) {
                filter += `&structureId=${structureId}`;
            } else {
                filter += `structureId=${structureId}`;
            }
        }
        if(teacherId){
            if (filter.length > 1) {
                filter += `&teacherId=${teacherId}`;
            } else {
                filter += `teacherId=${teacherId}`;
            }
        }
        if (subjectsId) {
            if (filter.length > 1) {
                filter += `&subjectsId=${subjectsId}`;
            } else {
                filter += `subjectsId=${subjectsId}`;
            }
        }
        if (audiencesId) {
            if (filter.length > 1) {
                filter += `&audienceId=${audiencesId}`;
            } else {
                filter += `audienceId=${audiencesId}`;
            }
        }
        if (vised) {
            if (filter.length > 1) {
                filter += `&vised=${vised}`;
            } else {
                filter += `vised=${vised}`;
            }
        }
        if (notVised) {
            if (filter.length > 1) {
                filter += `&notVised=${notVised}`;
            } else {
                filter += `notVised=${notVised}`;
            }
        }
        let url = `/diary/sessions/visa/${startDate}/${endDate}${filter}`;
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

export class SessionType {
    id: number;
    structure_id: string;
    label: string;
    rank: number;

    constructor (id_structure?: string) {
        if (id_structure) this.structure_id = id_structure;
    }

    toJson() {
        return {
            id: this.id,
            structure_id: this.structure_id,
            label: this.label,
            rank: this.rank
        }
    }

    async create() {
        let response = await http.post(`/diary/session-type` , this.toJson());
        return Utils.setToastMessage(response,'cdt.session.type.create', 'cdt.session.type.create.error')
    }

    async update() {
        let response = await http.put(`/diary/session-type/${this.id}`, this.toJson());
        return Utils.setToastMessage(response,'cdt.session.type.update', 'cdt.session.type.update.error')
    }

    async delete() {
        let {data} = await http.delete(`/diary/session-type/${this.id}/${this.structure_id}`);
        if (data.id != undefined) {
            let response = await http.put(`/diary/session-type/${this.id}`, this.toJson());
            return Utils.setToastMessage(response,'cdt.session.type.deleted', 'cdt.session.type.delete.error')
        }
        else {
            notify.error('cdt.session.type.delete.impossible')
        }
    }
}

export class SessionTypes {
    all: SessionType[] = [];
    id: number;
    structure_id: string;
    label: string;

    constructor (id_structure?: string) {
        if (id_structure) this.structure_id = id_structure;
    }

    async sync (): Promise<void> {
        let { data } = await http.get(`/diary/session-types?idStructure=${this.structure_id}`);
        this.all = Mix.castArrayAs(SessionType, data);
        this.id = data.id;
        this.label = data.label;
    }
}
