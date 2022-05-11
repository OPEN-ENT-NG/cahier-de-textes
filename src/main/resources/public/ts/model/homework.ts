import {idiom as lang, model, moment, notify} from 'entcore';
import http, {AxiosResponse} from 'axios';
import {Mix} from 'entcore-toolkit';
import {Structure, Teacher, DateUtils, ToastUtils, Visas} from './index';
import {Subject} from './subject';
import {PEDAGOGIC_TYPES} from '../core/const/pedagogicTypes';
import {Session} from './session';
import {USER_TYPES} from '../core/const/user-types';
import {FORMAT} from '../core/const/dateFormat';

export class Homework {
    id: string;
    editedId?: string; // trick for drag & drop session with homeworks that will be created (to prevent form to PUT since we want a POST)
    progression_homework_id?: string;
    description: string = '';
    title: string = '';
    plainTextDescription: string = '';
    dueDate: Date = moment().toDate();
    color: string;
    dateDisplayed;
    idTemp: number;
    session_id: number;
    from_session_id: number;
    session_date: string;
    workloadDay: WorkloadDay;
    structure: Structure;
    type: HomeworkType;
    visas: Visas;
    teacher: Teacher;
    subject: Subject;
    exceptional_label?: string;
    audience: any;
    audiences: any[];
    session: Session;
    sessions: Session[] = [];
    workload: number;
    startMoment: any;
    endMoment: any;
    isPublished: boolean = true;
    opened: boolean = false;
    isNewField: boolean = false;
    is_periodic: boolean = false;
    locked: boolean = true;
    due_date;
    pedagogicType: number = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
    attachedToSession: boolean = true;
    attachedToDate: boolean = false;
    isDone: boolean;
    isDeleted: boolean = false;
    estimatedTime: number = 0;
    publishDate ?: any;
    publishedChanged: boolean = false;
    courseId: string = null;

    static HOMEWORK_STATE_TODO: number = 1;
    static HOMEWORK_STATE_DONE: number = 2;
    alreadyValidate: boolean = false;

    constructor(structure: Structure) {
        this.structure = structure;
        this.color = '#ff9700';
        this.dueDate = moment().toDate();
    }

    toSendFormat(): any {
        return {
            subject_id: this.subject.id,
            type_id: this.type.id,
            exceptional_label: this.exceptional_label,
            teacher_id: model.me.userId,
            structure_id: this.structure.id,
            session_id: this.session ? this.session.id : null,
            from_session_id: this.from_session_id,
            audience_id: this.audience.id,
            estimatedTime: this.estimatedTime ? this.estimatedTime : 0,
            due_date: DateUtils.getFormattedDate(this.dueDate),
            description: DateUtils.htmlToXhtml(this.description),
            color: this.color,
            is_published: this.isPublished,
            workload: this.workload,
            detachFromSession: (!this.session || !this.session.id)
        };
    }

    /**
     * Format due date for display.
     */
    formatDateToDisplay(): void {
        this.dateDisplayed = moment(this.dueDate).format(FORMAT.displayDate);
    }

    copyHomework(homework: Homework): void {
        this.description = homework.description;
        this.type = homework.type;
        this.estimatedTime = homework.estimatedTime;
        if (homework.attachedToDate) {
            this.dueDate = homework.dueDate;
        } else {
            this.session = homework.session;
        }
        this.attachedToDate = homework.attachedToDate;
        this.attachedToSession = homework.attachedToSession;
        this.subject = homework.subject;
        this.exceptional_label = homework.exceptional_label;
    }

    getSubjectTitle(): string {
        if (this.subject && this.subject.id && !this.exceptional_label) {
            return this.subject.name ? this.subject.name : this.subject.label;
        }
        else {
            return this.exceptional_label;
        }
    }

    static formatSqlDataToModel(data: any): any {
        return {
            audience: data.audience,
            teacher: data.teacher,
            subject: data.subject,
            exceptional_label: data.exceptional_label,
            session_id: data.session_id,
            from_session_id: data.from_session_id,
            session_date: data.session_date,
            id: data.id,
            session: (data.session && typeof data.session === 'string') ? JSON.parse(data.session) : data.session,
            type: (data.type && typeof data.type === 'string') ? JSON.parse(data.type) : data.type,
            visas: data.visas && data.visas !== '[null]' ? JSON.parse(data.visas) : [],
            title: data.title,
            color: data.color,
            estimatedTime: data.estimatedtime,
            dueDate: DateUtils.getFormattedDate(data.due_date),
            description: data.description,
            isPublished: data.is_published,
            workload: data.workload,
            isDone: data.progress ? data.progress.state_label === 'done' : undefined,
            publishDate: moment(data.publish_date).format(FORMAT.displayDate)
        };
    }

    async save(): Promise<void> {
        if (this.id) {
            return await this.update();
        } else {
            return await this.create();
        }
    }

    async setProgress(stateId: number): Promise<void> {

        let state: string = stateId === Homework.HOMEWORK_STATE_DONE ? 'done' : 'todo';
        let response: AxiosResponse = await http.post(`/diary/homework/progress/${this.id}/${state}`);

        return ToastUtils.setToastMessage(response, 'homework.setProgress', 'homework.setProgress.error');
    }

    async create(): Promise<void> {
        let response: AxiosResponse = await http.post('/diary/homework', this.toSendFormat());
        return ToastUtils.setToastMessage(response, 'homework.created', 'homework.created.error');
    }

    async update(): Promise<void> {
        let response: AxiosResponse = await http.put(`/diary/homework/${this.id}/${this.publishedChanged} `, this.toSendFormat());
        return ToastUtils.setToastMessage(response, 'homework.updated', 'homework.updated.error');
    }

    async delete(): Promise<void> {
        let response: AxiosResponse = await http.delete('/diary/homework/' + this.id);
        return ToastUtils.setToastMessage(response, 'homework.deleted', 'homework.deleted.error');
    }

    async publish(): Promise<void> {
        let response: AxiosResponse = await http.post('/diary/homework/publish/' + this.id);
        return ToastUtils.setToastMessage(response, 'homework.published', 'homework.published.error');
    }


    async unpublish(): Promise<void> {
        let response: AxiosResponse = await http.post('/diary/homework/unpublish/' + this.id);
        return ToastUtils.setToastMessage(response, 'homework.unpublished', 'homework.unpublished.error');
    }

    async sync(): Promise<void> {
        if (model.me.type === USER_TYPES.teacher || model.me.type === USER_TYPES.personnel) {
            let {data}: AxiosResponse = await http.get('/diary/homework/' + this.id);
            Mix.extend(this, Homework.formatSqlDataToModel(data));
        } else {
            let studentId: string;

            if (model.me.type === USER_TYPES.student) {
                studentId = model.me.userId;
            } else {
                studentId = 'stop';
            }
            let {data}: AxiosResponse = await http.get('/diary/homework/' + this.id + '/' + studentId);
            Mix.extend(this, Homework.formatSqlDataToModel(data));
        }

        this.init();

    }

    init(): void {
        this.type = Mix.castAs(HomeworkType, this.type);
        //if the session is not null, the homework must be detached from its previous session.
        //if the session is null, the homework is not attached to any session, so we do nothing.
        this.session = this.session ? Mix.castAs(Session, this.type) : this.session;
        this.dueDate = moment(this.dueDate).toDate();
        if (this.session_id && this.session_date) {
            this.startMoment = moment(this.session_date);
        } else {
            this.startMoment = moment(this.dueDate);
        }

        this.workloadDay = new WorkloadDay(this.structure, this.audience, this.dueDate, this.isPublished);
        this.plainTextDescription = DateUtils.convertHtmlToPlainText(this.description);
    }


    isValidForm = (): boolean => {
        let validSessionOrDueDate: boolean = false;
        if (this.attachedToDate && this.dueDate) {
            validSessionOrDueDate = true;
        } else if (this.attachedToSession && this.session) {
            validSessionOrDueDate = true;
        }
        return this
            && this.structure
            && this.subject
            && this.estimatedTime >= 0
            && this.audience
            && validSessionOrDueDate
            && this.type
            && this.description
            && this.description.length
            && this.description.length !== 0;
    }


}

export class Homeworks {
    all: Homework[];
    origin: Homework[];
    structure: Structure;

    constructor(structure: Structure) {
        this.structure = structure;
        this.all = [];
        this.origin = [];
    }

    static formatSqlDataToModel(data: any): any[] {
        let dataModel: any[] = [];
        data.forEach(i => dataModel.push(Homework.formatSqlDataToModel(i)));
        return dataModel;
    }

    async syncOwnHomeworks(structure: any, startMoment: any, endMoment: any, subjectId?: string, teacherId?: string, audienceIds?: string[]): Promise<void> {
        let startDate: string = DateUtils.getFormattedDate(startMoment);
        let endDate: string = DateUtils.getFormattedDate(endMoment);

        let filter: string = subjectId || teacherId || audienceIds ? '?' : '';
        if (teacherId) filter += `teacherId=${teacherId}&`;
        if (audienceIds) filter += audienceIds.map((id: string) => `audienceId=${id}`).join('&') + '&';
        if (subjectId) filter += `subjectId=${subjectId}&`;

        let url: string = `/diary/homeworks/own/${startDate}/${endDate}/${this.structure.id}${filter.slice(0, -1)}`;

        await this.syncHomeworks(url);
    }

    async syncExternalHomeworks(startMoment: any, endMoment: any, teacherId?: string, audienceIds?: string[], subjectId?: string): Promise<void> {
        let startDate: string = DateUtils.getFormattedDate(startMoment);
        let endDate: string = DateUtils.getFormattedDate(endMoment);

        let filter: string = teacherId || audienceIds ? '?' : '';
        if (teacherId) filter += `teacherId=${teacherId}&`;
        if (audienceIds) filter += audienceIds.map((id: string) => `audienceId=${id}`).join('&') + '&';
        if (subjectId) filter += `subjectId=${subjectId}&`;

        let url: string = `/diary/homeworks/external/${startDate}/${endDate}${filter.slice(0, -1)}`;

        await this.syncHomeworks(url);
    }

    async syncChildHomeworks(startMoment: any, endMoment: any, childId?: string, subjectId?: string): Promise<void> {
        let startDate: string = DateUtils.getFormattedDate(startMoment);
        let endDate: string = DateUtils.getFormattedDate(endMoment);

        let filter: string = subjectId ? '?' : '';
        if (subjectId) filter += `subjectId=${subjectId}&`;

        let url: string = `/diary/homeworks/child/${startDate}/${endDate}/${childId}/${this.structure.id}${filter.slice(0, -1)}`;

        await this.syncHomeworks(url);
    }

    async syncHomeworks(url: string): Promise<void> {
        let {data}: AxiosResponse = await http.get(url);
        this.all = Mix.castArrayAs(Homework, Homeworks.formatSqlDataToModel(data));
        this.all.forEach(i => {
            i.init();
        });
    }
}

export interface IHomeworkType {
    id?: number;
    structure_id?: string;
    label?: string;
    rank?: number;
    type?: string;
}

export class HomeworkType {
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
        };
    }

    async create(): Promise<void> {
        let response: AxiosResponse = await http.post(`/diary/homework-type`, this.toJson());
        return ToastUtils.setToastMessage(response, 'cdt.homework.type.create', 'cdt.homework.type.create.error');
    }

    async update(): Promise<void> {
        let response: AxiosResponse = await http.put(`/diary/homework-type/${this.id}`, this.toJson());
        return ToastUtils.setToastMessage(response, 'cdt.homework.type.update', 'cdt.homework.type.update.error');
    }

    async delete(): Promise<void> {
        let {data}: AxiosResponse = await http.delete(`/diary/homework-type/${this.id}/${this.structure_id}`);
        if (data.id !== undefined) {
            let response: AxiosResponse = await http.put(`/diary/homework-type/${this.id}`, this.toJson());
            return ToastUtils.setToastMessage(response, 'cdt.homework.type.delete', 'cdt.homework.type.delete.error');
        } else {
            notify.error('cdt.homework.type.delete.impossible');
        }
    }
}

export class HomeworkTypes {
    all: HomeworkType[] = [];
    id: number;
    structure_id: string;
    label: string;

    constructor(id_structure?: string) {
        if (id_structure) this.structure_id = id_structure;
    }

    async sync(): Promise<void> {
        let {data}: AxiosResponse = await http.get(`/diary/homework-types/${this.structure_id}`);
        this.all = Mix.castArrayAs(HomeworkType, data);
        this.id = data.id;
        this.label = data.label;
    }
}

export class Workload {
    total: number = 0;
    count: number = 0;
    day: any;
    shortDayString: string;
    numDayString;
    color: string;
    Title: string;
    title: string;

    static getWorkloadColor(workload: number): string {
        if (0 <= workload && workload <= 2) {
            return 'green-text';
        } else if (2 < workload && workload <= 4) {
            return 'yellow-text';
        } else if (4 < workload) {
            return 'red-text';
        }
    }

    getHomeworkTitle(): string {
        return (this.count > 0 ? lang.translate('Homeworks') : lang.translate('Homework'));
    }

    getHomeworktitle(): string {
        return (this.count > 0 ? lang.translate('homeworks') : lang.translate('homework'));
    }


    init(): void {
        this.shortDayString = moment(this.day).format('dddd').substring(0, 1).toUpperCase(); // 'lundi' -> 'lu' -> 'L'
        this.numDayString = moment(this.day).format('DD'); // 15
        this.color = Workload.getWorkloadColor(this.count);
        this.Title = this.getHomeworkTitle();
        this.title = this.getHomeworktitle();
    }
}

export class WorkloadDay {
    all: Workload[];
    structure: any;
    audience: any;
    dueDate: any;
    isPublished: boolean;

    constructor(structure: any, audience: any, dueDate: any, isPublished: any) {
        this.structure = structure;
        this.dueDate = dueDate;
        this.audience = audience;
        this.isPublished = isPublished;
    }

    static formatSqlDataToModel(data: any[]): any[] {
        let dataModel: any[] = [];
        data.forEach(i => {
            dataModel.push({
                total: +i.total,
                count: +i.count,
                day: i.day
            });
        });
        return dataModel;
    }

    async sync(date: any): Promise<void> {
        let {data}: AxiosResponse = await http.get(`/diary/workload/${this.structure.id}/${this.audience.id}/${DateUtils.getFormattedDate(date)}/${this.isPublished}`);
        this.all = Mix.castArrayAs(Workload, WorkloadDay.formatSqlDataToModel(data));
        this.all.forEach(w => w.init());
    }
}