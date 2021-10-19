import {_, moment, notify} from 'entcore';
import http from 'axios';
import {Mix} from 'entcore-toolkit';
import {Course, Structure, Subject, Teacher, DateUtils, ToastUtils} from './index';
import {PEDAGOGIC_TYPES} from '../core/const/pedagogicTypes';
import {FORMAT} from '../core/const/dateFormat';
import {EXCEPTIONAL} from '../core/const/exceptional-subject';
import {Visa} from './visa';
import {Homework, Homeworks} from './homework';
import {ProgressionSession} from './Progression';
import {Moment} from 'moment';

const colors = ['#7E7E7E', '#00ab6f', '#ff9700'];

export class Session {
    id: number | string;
    subject: Subject;
    subject_id?: string;
    exceptional_label?: string;
    type: SessionType;
    type_id?: number;
    structure: Structure;
    teacher: Teacher;
    audience: any;
    title: string;
    color: string = colors[0];
    date: Date = moment().toDate();
    startTime: any = (moment().set({'hour': '08', 'minute': '00'})).seconds(0).millisecond(0).toDate();
    endTime: any = (moment().set({'hour': '10', 'minute': '00'})).seconds(0).millisecond(0).toDate();
    description: string = '';
    plainTextDescription: string = '';
    annotation: string = '';
    homeworks: Homework[] = [];
    from_homeworks: Homework[] = [];
    room: string = '';
    courseId: string = null;
    isPublished: boolean = true;
    visas: Visa[] = [];
    opened: boolean = false;
    startMoment: Moment;
    endMoment: Moment;
    startDisplayDate: string;
    startDisplayTime: string;
    one_visa ?: boolean;
    endDisplayDate: string;
    endDisplayTime: string;
    isDisplayed: boolean = false;
    is_periodic: boolean = false;
    locked: boolean = true;
    is_empty: boolean = true;
    firstText?: string = '';
    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_SESSION;
    string: string = '';

    constructor(structure: Structure, course?: Course, progression?: ProgressionSession) {
        this.structure = structure;
        if (course && progression) {
            this.setFromCourseAndProgression(progression, course);
            this.init(structure);
        } else if (course) {
            this.setFromCourse(course);
            this.init(structure);
            this.title = 'Séance du ' + this.startDisplayDate + ' (' + this.startDisplayTime + ':' + this.endDisplayTime + ')';
        }
    }

    static formatSqlDataToModel(data: any, structure: Structure) {
        return {
            audience: data.audience,
            teacher: data.teacher,
            subject: data.subject,
            type: structure.types.all.find(t => t.id === data.type_id),
            subject_id: data.subject_id,
            exceptional_label: data.exceptional_label,
            id: data.id,
            title: data.title,
            room: data.room,
            color: data.color,
            isPublished: data.is_published,
            date: DateUtils.getFormattedDate(data.date),
            startTime: data.start_time,
            endTime: data.end_time,
            description: data.description,
            annotation: data.annotation,
            homeworks: data.homeworks ? Homeworks.formatSqlDataToModel(data.homeworks) : [],
            from_homeworks: data.from_homeworks ? Homeworks.formatSqlDataToModel(data.from_homeworks) : [],
            visas: data.visas && data.visas !== '[null]' ? JSON.parse(data.visas) : [],
            courseId: data.course_id ? data.course_id : null,
            modified: data.modified,
            created: data.created,
            one_visa: data.one_visa,
            is_empty: data.is_empty
        };
    }

    toSendFormat(placeholder?: string) {

        return {
            id: this.id ? this.id : null,
            subject_id: this.subject.id ? this.subject.id : this.subject_id,
            exceptional_label: this.exceptional_label,
            type_id: this.type.id,
            structure_id: this.structure.id,
            title: this.title ? this.title : placeholder,
            color: this.color,
            date: DateUtils.getFormattedDate(this.date),
            start_time: DateUtils.getFormattedTime(this.startTime),
            end_time: DateUtils.getFormattedTime(this.endTime),
            description: DateUtils.htmlToXhtml(this.description),
            annotation: this.annotation,
            is_published: this.isPublished,
            audience_id: this.audience.id,
            room: (this.room) ? this.room : '',
            course_id: this.courseId,
            is_empty: this.is_empty
        };
    }

    init(structure: Structure) {
        this.type = Mix.castAs(SessionType, this.type);
        this.structure = structure;
        this.date = moment(this.date).toDate();
        this.startMoment = moment(DateUtils.getFormattedDateTime(this.date, moment(this.startTime, FORMAT.formattedTime)));
        this.startTime = moment(this.startTime, FORMAT.formattedTime).toDate();
        this.startDisplayDate = DateUtils.getDisplayDate(this.startMoment);
        this.startDisplayTime = DateUtils.getDisplayTime(this.startMoment);

        this.endMoment = moment(DateUtils.getFormattedDateTime(this.date, moment(this.endTime, FORMAT.formattedTime)));
        this.endTime = moment(this.endTime, FORMAT.formattedTime).toDate();
        this.endDisplayDate = DateUtils.getDisplayTime(this.endMoment);
        this.endDisplayTime = DateUtils.getDisplayTime(this.endMoment);


        if (this.visas.every(v => v === null)) {
            this.visas = [];
        } else {
            this.visas = Mix.castArrayAs(Visa, this.visas);
            this.visas.forEach(v => v.init(this.structure));
        }

        if (this.homeworks.every(v => v === null)) {
            this.homeworks = [];
        }
        if (this.homeworks) {
            this.homeworks = Mix.castArrayAs(Homework, this.homeworks);
            this.homeworks.forEach((h: Homework) => {
                h.structure = this.structure;
                h.session = this;
                h.session_date = DateUtils.getFormattedDate(this.date);
                h.init();
            });
        }
        if (this.from_homeworks) {
            this.from_homeworks = Mix.castArrayAs(Homework, this.from_homeworks);
            this.from_homeworks.forEach((h: Homework) => {
                h.structure = this.structure;
                h.init();
            });
        }

        this.plainTextDescription = DateUtils.convertHtmlToPlainText(this.description);

        if (this.courseId) {
            if (this.is_empty && this.homeworks && this.homeworks.length > 0) {
                this.color = colors[2]; // ORANGE
            } else {
                this.color = colors[1]; // GREEN
            }
        }
    }

    async setFromCourse(course: Course): Promise<void> {
        this.courseId = course._id;
        this.teacher = course.teachers[0];
        this.room = (course.rooms && course.rooms.length > 0) ? course.rooms[0] : '';
        this.subject = course.subject;
        if (course.exceptionnal) {
            this.subject.id = EXCEPTIONAL.subjectId;
            this.subject.label = EXCEPTIONAL.subjectCode;
            this.exceptional_label = course.exceptionnal;
        }
        this.date = this.startTime = course.startMoment.toDate();
        this.endTime = course.endMoment.toDate();
        this.audience = course.audiences.all[0];
        this.color = colors[1];
    }

    async save(placeholder?) {
        if (this.id) {
            let response = await http.put('/diary/session/' + this.id, this.toSendFormat(placeholder));
            return ToastUtils.setToastMessage(response, 'session.updated', 'session.updated.error');

        } else {
            let response = await http.post('/diary/session', this.toSendFormat(placeholder));
            this.id = response.data.id;

            return ToastUtils.setToastMessage(response, 'session.created', 'session.created.error');

        }
    }

    async delete() {
        let response = await http.delete('/diary/session/' + this.id);
        return ToastUtils.setToastMessage(response, 'session.deleted', 'session.deleted.error');
    }

    async publish() {
        let response = await http.post('/diary/session/publish/' + this.id);
        return ToastUtils.setToastMessage(response, 'session.published', 'session.published.error');
    }

    async unpublish() {
        let response = await http.post('/diary/session/unpublish/' + this.id);
        return ToastUtils.setToastMessage(response, 'session.unpublished', 'session.unpublished.error');
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

    setFromProgression(progression) {
        this.title = progression.title;
        this.description = progression.description;

    }

    setFromCourseAndProgression(progression: ProgressionSession, course: Course) {
        this.title = progression.title;
        this.courseId = course._id;
        this.teacher = (course.teachers && course.teachers.length > 0) ? course.teachers[0] : null;
        this.room = (course.rooms && course.rooms.length > 0) ? course.rooms[0] : '';
        this.date = this.startTime = course.startMoment.toDate();
        this.endTime = course.endMoment.toDate();
        this.audience = course.audiences.all[0];
        this.color = colors[1];
        this.description = progression.description;

    }

    getStartMoment(): Moment {
        return this.startMoment ? this.startMoment : moment(this.startTime);
    }

    getSubjectTitle(): string {
        // if there is a suject or an excptional_label, display it
        if (this.subject || this.exceptional_label) {
            if (this.subject.id && this.subject.id !== EXCEPTIONAL.subjectId) {
                return this.subject.name ? this.subject.name : this.subject.label;
            } else {
                return this.exceptional_label ? this.exceptional_label : this.subject.label;
            }
        }
    }

    /**
     * Returns the session info text.
     */
    getSessionString = (): string => {
        return this.audience.name + ' - ' + this.getSubjectTitle() + ' - '
            + moment.weekdays(true)[moment(this.startDisplayDate, FORMAT.displayDate).weekday()] + ' '
            + this.startDisplayDate + ' ' + this.startDisplayTime
            + ' - ' + this.endDisplayTime;
    }

    getSessionInfo(session: Session): void {

        this.subject = new Subject();
        this.subject.id = session.subject.id;
        this.subject.name = session.getSubjectTitle();
        this.title = session.title ? session.title : '';

        session.homeworks.map((homework: Homework) => {
            homework.due_date = this.date;
            homework.editedId = homework.id; // trick for drag & drop session with homeworks that will be created (to prevent form to PUT)
            delete homework.id;
            delete homework.session;
            homework.subject = session.subject;
            homework.teacher = session.teacher;
            homework.audience = session.audience;

            this.homeworks.push(homework);
        });
        this.type = session.type;
        this.teacher = session.teacher;
        this.color = session.color;
        this.opened = true;
        this.room = session.room;
        this.description = session.description;
    }

    setFromCourseAndSession(course: Course, sessionDrag: Session): void {
        this.teacher = sessionDrag.teacher;
        this.room = sessionDrag.room;
        this.type = sessionDrag.type;
        this.title = sessionDrag.title ? sessionDrag.title : '';
        this.date = this.startTime = course.startMoment.toDate();
        this.endTime = course.endMoment.toDate();
        this.color = sessionDrag.color;
        this.description = sessionDrag.description;
        this.courseId = course._id;
        this.subject = new Subject();
        this.audience = course.audiences.all[0];
        if (course.exceptionnal) {
            this.subject.id = EXCEPTIONAL.subjectId;
            this.subject.label = EXCEPTIONAL.subjectCode;
            this.exceptional_label = course.exceptionnal;
        } else {
            this.subject.id = course.subject ? course.subject.id : null;
            this.subject.label = course.subject.name ? course.subject.name : course.subject.label;
        }
        this.duplicateHomeworks(sessionDrag);
    }

    duplicateHomeworks(sessionDrag: Session): void {
        if (sessionDrag.homeworks) {
            sessionDrag.homeworks.map((h: Homework) => {
                h.editedId = h.id; // trick for drag & drop session with homeworks that will be created (to prevent form to PUT)
                delete h.id;
                delete h.session;
                h.dueDate = this.date;
                h.audience = this.audience;
                h.subject = this.subject;
                h.teacher = this.teacher;
                this.homeworks.push(h);
            });
        }
    }

    isSameSession(session: Session): boolean {
        let currentSessionTime: Moment = moment(this.date).add(moment(this.startTime).hour(), 'hours').add(moment(this.startTime).minutes(), 'minutes');
        let otherSessionTime: Moment = moment(session.date).add(moment(session.startTime).hour(), 'hours').add(moment(session.startTime).minutes(), 'minutes');

        return (moment(otherSessionTime).isSame(moment(currentSessionTime)));
    }

}

export class Sessions {
    all: Session[];
    origin: Session[];
    structure: Structure;

    constructor(structure: Structure) {
        this.structure = structure;
        this.all = [];
        this.origin = [];
    }

    static formatSqlDataToModel(data: any, structure: Structure) {
        let dataModel = [];
        data.forEach(i => dataModel.push(Session.formatSqlDataToModel(i, structure)));
        return dataModel;
    }

    static groupByLevelANdSubject(sessions) {
        return _.groupBy(sessions, function (item) {
            let temp = (item.audience) ? item.audience.id : item.audience_id;
            temp += "#";
            temp += (item.subject) ? item.subject.id : item.subject_id;
            temp += "#";
            temp += (item.teacher) ? item.teacher.id : item.teacher_id;
            return temp
        })
    }

    async syncWithAudienceAndSubject(startMoment: any, endMoment: any, typeId?: string, type?: string): Promise<void> {
        let startDate = DateUtils.getFormattedDate(startMoment);
        let endDate = DateUtils.getFormattedDate(endMoment);

        let url = `/diary/lesson/${this.structure.id}/${startDate}/${endDate}/null`;

        await this.syncSessions(url);
    }

    async syncOwnSessions(structure: any, startMoment: any, endMoment: any, audienceIds?: string[], subjectId?: string): Promise<void> {
        let startDate = DateUtils.getFormattedDate(startMoment);
        let endDate = DateUtils.getFormattedDate(endMoment);

        let url = `/diary/sessions/own/${startDate}/${endDate}/${this.structure.id}`;

        if (audienceIds) {
            audienceIds.forEach(id => url += id ? `&audienceId=${id}` : '');
        }

        if (subjectId) {
            url += `&subjectId=${subjectId}`;
        }
        url = url.replace('&', '?');

        await this.syncSessions(url);
    }

    async syncExternalSessions(startMoment: any, endMoment: any, teacherId?: string, audienceId?: string, subjectId?: string): Promise<void> {
        let startDate = DateUtils.getFormattedDate(startMoment);
        let endDate = DateUtils.getFormattedDate(endMoment);

        let filter = teacherId || audienceId ? '?' : '';
        if (teacherId) filter += `teacherId=${teacherId}&`;
        if (audienceId) filter += `audienceId=${audienceId}&`;
        if (subjectId) filter += `&subjectId=${subjectId}`;
        let url = `/diary/sessions/external/${startDate}/${endDate}${filter.slice(0, -1)}`;

        await this.syncSessions(url);
    }

    async syncChildSessions(startMoment: any, endMoment: any, childId?: string, subjectId?: string): Promise<void> {
        let startDate = DateUtils.getFormattedDate(startMoment);
        let endDate = DateUtils.getFormattedDate(endMoment);
        let url = `/diary/sessions/child/${startDate}/${endDate}/${childId}`;

        if (subjectId) {
            url += `&subjectId=${subjectId}`;
        }
        url = url.replace('&', '?');

        await this.syncSessions(url);
    }

    async syncSessionsWithVisa(startMoment: any,
                               endMoment: any,
                               structureId: string,
                               teachersId?: string,
                               audiencesId?: string,
                               vised?: boolean,
                               notVised?: boolean,
                               archived?: boolean,
                               sharedWithMe?: boolean,
                               published?: boolean,
                               notPublished?: boolean,
                               homeworks?: Homeworks): Promise<void> {

        let startDate = DateUtils.getFormattedDate(startMoment);
        let endDate = DateUtils.getFormattedDate(endMoment);

        let filter = (structureId || teachersId || audiencesId || vised || notVised ||
            archived || sharedWithMe || published || notPublished) ? '?' : '';

        if (structureId) filter += `structureId=${structureId}&`;
        if (teachersId) filter += `teachersId=${teachersId}&`;
        if (audiencesId) filter += `audienceId=${audiencesId}&`;
        if (vised) filter += `vised=${vised}&`;
        if (notVised) filter += `notVised=${notVised}&`;
        if (published) filter += `published=${published}&`;
        if (notPublished) filter += `notPublished=${notPublished}&`;

        let url = `/diary/sessions/visa/${startDate}/${endDate}${filter.slice(0, -1)}`;

        homeworks ? await this.syncSessionsWithHomeworks(url, homeworks) : await this.syncSessions(url);
    }

    async syncSessions(url: string) {
        let {data} = await http.get(url);
        data = data.filter(s => s.structure_id === this.structure.id);
        this.all = Mix.castArrayAs(Session, Sessions.formatSqlDataToModel(data, this.structure));
        this.all.forEach(i => {
            i.init(this.structure);
        });
    }

    syncSessionsWithHomeworks = async (url: string, homeworks: Homeworks): Promise<void> => {
        let {data} = await http.get(url);
        homeworks.all = Mix.castArrayAs(Homework, Homeworks.formatSqlDataToModel(data.filter(h => h.is_homework)));
        homeworks.all.forEach(i => {
            i.init();
        });
        this.all = Mix.castArrayAs(Session, Sessions.formatSqlDataToModel(data.filter(s => !s.is_homework), this.structure));
        this.all.forEach(i => {
            i.init(this.structure);
        });
    }


}

export interface ISessionType {
    id?: number;
    structure_id?: string;
    label?: string;
    rank?: number;
    type?: string;
}

export class SessionType {
    id: number;
    structure_id: string;
    label: string;
    rank: number;

    constructor(id_structure?: string) {
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
        let response = await http.post(`/diary/session-type`, this.toJson());
        return ToastUtils.setToastMessage(response, 'cdt.session.type.create', 'cdt.session.type.create.error')
    }

    async update() {
        let response = await http.put(`/diary/session-type/${this.id}`, this.toJson());
        return ToastUtils.setToastMessage(response, 'cdt.session.type.update', 'cdt.session.type.update.error')
    }

    async delete() {
        let {data} = await http.delete(`/diary/session-type/${this.id}/${this.structure_id}`);
        if (data.id != undefined) {
            let response = await http.put(`/diary/session-type/${this.id}`, this.toJson());
            return ToastUtils.setToastMessage(response, 'cdt.session.type.deleted', 'cdt.session.type.delete.error')
        } else {
            notify.error('cdt.session.type.delete.impossible')
        }
    }
}

export class SessionTypes {
    all: SessionType[] = [];
    id: number;
    structure_id: string;
    label: string;

    constructor(id_structure?: string) {
        if (id_structure) this.structure_id = id_structure;
    }

    async sync(): Promise<void> {
        let {data} = await http.get(`/diary/session-types?idStructure=${this.structure_id}`);
        this.all = Mix.castArrayAs(SessionType, data);
        this.id = data.id;
        this.label = data.label;
    }
}
