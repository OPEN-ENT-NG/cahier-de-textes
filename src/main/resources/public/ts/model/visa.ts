import http, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {Structure, Teacher, DateUtils, Homework, ToastUtils, User} from './index';
import {idiom as lang, model, moment} from 'entcore';
import {INotebook} from './Notebook';
import {NOTEBOOK_TYPE} from '../core/const/notebook-type';
import {FORMAT} from '../core/const/dateFormat';

export interface IVisa {
    id?: number;
    comment?: string;
    created?: string;
    modified?: string;
    nb_sessions?: number;
    owner_id?: string;
    owner_type?: string;
    pdf_details?: string;
    structure_id?: string;
    teacher_id?: string;

    displayDwlName?: string;
}

export class Visa {

    id: number;
    comment: string = null;
    sessionIds: Array<number> = [];
    homeworkIds: Array<number> = [];
    sessions: any = [];
    structure: Structure;
    teacher: Teacher;
    nb_sessions: number = 0;

    created: string;
    modified: string;
    owner_id?: string;
    owner_type?: string;
    pdf_details?: string;
    structure_id?: string;
    teacher_id?: string;

    displayDwlName?: string;

    constructor(structure: Structure) {
        this.structure = structure;
    }

    init(structure?: Structure) {
        if (structure) {
            this.structure = structure;
        }
    }

    buildVisaData(visa: IVisa, displayTeacherInfo: string): void {
        this.id = visa.id;
        this.comment = visa.comment;
        this.created = visa.created;
        this.modified = visa.modified;
        this.nb_sessions = visa.nb_sessions;
        this.owner_id = visa.owner_id;
        this.owner_type = visa.owner_type;
        this.pdf_details = visa.pdf_details;
        this.structure_id = visa.structure_id;
        this.teacher_id = visa.teacher_id;

        this.displayDwlName = displayTeacherInfo;
    }


    toSendFormat(): any {
        this.created = moment().format(FORMAT['YEAR/MONTH/DAY']);
        const subjectLabel = this.sessions[0].subject.name ? this.sessions[0].subject.name :
            (this.sessions[0].subject.label ? this.sessions[0].subject.label : this.sessions[0].exceptional_label);

        return {
            comment: this.comment,
            sessionIds: this.sessionIds,
            homeworkIds: this.homeworkIds,
            user: model.me.username,
            audience: this.sessions[0].audience.name,
            subject: subjectLabel,
            teacher: this.sessions[0].teacher.displayName,
            structureName: this.structure.name,
            sessions: this.sessions.map((n) => {
                const homeworks: any = n.homeworks ? n.homeworks : [];
                const nLabel: string = n.subject ? n.subject.name : '';
                return {
                    audience: n.audience.name,
                    subject: nLabel,
                    teacher: n.teacher.displayName,
                    title: n.title,
                    type: n.diaryType.label,
                    startDate: n.date,
                    startDisplayDate: DateUtils.formatDate(n.date, FORMAT.displayDate),
                    startDisplayTime: n.type === NOTEBOOK_TYPE.HOMEWORK ? null :
                        DateUtils.formatDate(moment(moment().format(FORMAT.formattedDate) + ' ' + n.start_time), FORMAT.displayTime),
                    endDisplayTime: n.type === NOTEBOOK_TYPE.HOMEWORK ? null :
                        DateUtils.formatDate(moment(moment().format(FORMAT.formattedDate) + ' ' + n.end_time), FORMAT.displayTime),
                    hasDescription: ($.parseHTML(n.description) && $.parseHTML(n.description).length !== 0),
                    description: DateUtils.htmlToXhtml(n.description),
                    annotation: n.type === NOTEBOOK_TYPE.HOMEWORK ? null : n.annotation,

                    homeworks: homeworks.map(h => {
                        return {
                            estimatedTime: (h.estimatedTime && h.estimatedTime !== 0) ? h.estimatedTime : lang.translate('homework.no.workload'),
                            hasEstimatedTime: (h.estimatedTime && h.estimatedTime !== 0),
                            due_date: DateUtils.getFormattedDate(h.date),
                            description: DateUtils.htmlToXhtml(h.description),
                            type: h.diaryType.label,
                            color: h.color,
                            is_published: h.is_published,
                            workload: h.workload
                        };
                    }),
                    hasHomeworks: homeworks.length > 0
                };
            }).sort((sessionA, sessionB) => {
                return new Date(sessionB.startDate).getTime() - new Date(sessionA.startDate).getTime();
            }),
            structure_id: this.structure.id,
            teacher_id: this.teacher.id,
            nb_sessions: this.nb_sessions,
            created: moment(this.created).format(FORMAT.displayDate) + ' ' +
                lang.translate('at') + ' ' + moment(this.created).format(FORMAT.displayTime),
            modified: this.modified
        };
    }

    mapFormData(contentNotebooks: Array<INotebook>, comment: string): void {
        let homeworks: Array<INotebook> = [];
        this.comment = comment;
        this.teacher = new Teacher(contentNotebooks[0].teacher);
        contentNotebooks.forEach((notebook: INotebook) => {
            if (notebook.type === NOTEBOOK_TYPE.SESSION) {
                notebook.homeworks = [];
                this.sessionIds.push(notebook.id);
            } else if (notebook.type === NOTEBOOK_TYPE.HOMEWORK) {
                homeworks.push(notebook);
                this.homeworkIds.push(notebook.id);
            }
        });
        contentNotebooks
            .filter((notebook: INotebook) => notebook.type === NOTEBOOK_TYPE.SESSION)
            .forEach((notebook: INotebook) => {
            homeworks.forEach((homework: INotebook) => {
                if (homework.session_id === notebook.id) {
                    notebook.homeworks.push(homework);
                }
            });
        });
        this.sessions = [...contentNotebooks.filter((notebook: INotebook) => notebook.type === NOTEBOOK_TYPE.SESSION),
            ...homeworks.filter((homework: INotebook) => homework.session_id === null)];
        this.nb_sessions = contentNotebooks.length;
    }

    async downloadPdf(): Promise<void> {
        window.location.href = `/diary/visa/${this.id}/pdf`;
    }
}

export class Visas {
    all: Visa[];
    structure: Structure;

    constructor(structure: Structure) {
        this.structure = structure;
        this.all = [];
    }

    toSendFormat(): {structure_id: string, visas: any} {
        return {
            structure_id: this.structure.id,
            visas: this.all.map((n: Visa) => n.toSendFormat())
        };
    }

    async getPDF(callback) {
        let visasList = this.toSendFormat()["visas"];
        if (visasList && visasList.length) {
            let promiseArray = [];
            for (let i = 0, imax = visasList.length; i < imax; i++) {
                let config: AxiosRequestConfig = {
                    responseType: 'arraybuffer',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/pdf'
                    }
                };
                promiseArray.push((http.post(`/diary/visas/topdf`, {visas: visasList[i]}, config)));
            }
            Promise.all(promiseArray).then((reponses: AxiosResponse[]) => {
                for (let response of reponses) {
                    console.log(response)
                    let filename = DateUtils.getFileNameByContentDisposition(response.headers['content-disposition']);
                    const url = window.URL.createObjectURL(new Blob([response['data']]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename); //or any other extension
                    document.body.appendChild(link);
                    link.click();
                }
                callback();
            });
        }
    }

    async save() {
        return await this.create();
    }

    async create() {
        let response = await http.post('/diary/visas', this.toSendFormat());
        return ToastUtils.setToastMessage(response, 'visas.created', 'visas.created.error');
    }

}
