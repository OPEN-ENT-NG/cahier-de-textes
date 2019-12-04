import http from 'axios';
import {Structure, Teacher, DateUtils, Homework} from './index';
import {idiom as lang, model, moment} from 'entcore';

export class Visa {

    id: number;
    comment: string = null;
    sessionIds: any = [];
    sessions: any = [];
    structure: Structure;
    teacher: Teacher;
    nb_sessions: number = 0;

    created: string;
    modified: string;

    constructor(structure: Structure) {
        this.structure = structure;
    }

    init(structure?: Structure) {
        if (structure) {
            this.structure = structure;
        }
    }


    toSendFormat() {
        this.created = moment().format("YYYY/MM/DD");
        const subjectLabel = this.sessions[0].subject ? this.sessions[0].subject.label : '';

        return {
            comment: this.comment,
            sessionIds: this.sessionIds,
            user: model.me.username,
            audience: this.sessions[0].audience.name,// n.audience.name,
            subject: subjectLabel,
            teacher: this.sessions[0].teacher.toString(),
            stuctureName: this.structure.name,
            sessions: this.sessions.map((n) => {
                const homeworks = n.homeworks ? n.homeworks : [];
                const nLabel = n.subject ? n.subject.label : '';
                return {
                    audience: n.audience.name,
                    subject: nLabel,
                    teacher: n.teacher.toString(),
                    title: n.title,
                    type: n.type.label,
                    startDisplayDate: DateUtils.formatDate((n instanceof Homework ? n.dueDate : n.startMoment), 'DD/MM/YYYY'),
                    startDisplayTime: n instanceof Homework ? null : DateUtils.formatDate(n.startMoment, 'HH:mm'),
                    endDisplayTime: n instanceof Homework ? null : DateUtils.formatDate(n.endDisplayTime, 'HH:mm'),
                    hasDescription: ($.parseHTML(n.description) && $.parseHTML(n.description).length !== 0) ? true : false,
                    description: DateUtils.htmlToXhtml(n.description),
                    annotation: n instanceof Homework ? null : n.annotation,

                    homeworks: homeworks.map(h => {
                        return {
                            estimatedTime: (h.estimatedTime && h.estimatedTime !== 0) ? h.estimatedTime : lang.translate("homework.no.workload"),
                            hasEstimatedTime: (h.estimatedTime && h.estimatedTime !== 0) ? true : false,
                            due_date: DateUtils.getFormattedDate(h.dueDate),
                            description: DateUtils.htmlToXhtml(h.description),
                            type: h.type.label,
                            color: h.color,
                            is_published: h.isPublished,
                            workload: h.workload
                        }
                    }),
                    hasHomeworks: homeworks.length > 0
                }
            }),
            structure_id: this.structure.id,
            teacher_id: this.teacher.id,
            nb_sessions: this.nb_sessions,
            created: moment(this.created).format("DD/MM/YYYY à hh:mm"),
            modified: this.modified
        };
    }

    mapFormData(FormData, comment) {
        this.comment = comment;
        this.sessions = FormData;
        this.teacher = FormData[0].teacher;
        FormData.forEach(vs => {
            if(!(vs instanceof Homework)) {
                this.sessionIds.push(vs.id);
            }
        });
        this.nb_sessions = FormData.length

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

    toSendFormat() {
        return {
            structure_id: this.structure.id,
            visas: this.all.map((n) => n.toSendFormat())
        };
    }

    async getPDF(callback) {
        let visasList = this.toSendFormat()["visas"];
        if (visasList && visasList.length) {
            let promiseArray = [];
            for (let i = 0, imax = visasList.length; i < imax; i++) {
                let config = {
                    url: `/diary/visas/topdf`,
                    method: 'post',
                    data: {visas: visasList[i]},
                    responseType: 'arraybuffer',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/pdf'
                    }
                };
                promiseArray.push((http(config)));
            }
            Promise.all(promiseArray).then(reponses => {
                for (let j = 0, jmax = reponses.length; j < jmax; j++) {
                    (function (response) {
                        let filename = DateUtils.getFileNameByContentDisposition(response.headers['content-disposition']);
                        const url = window.URL.createObjectURL(new Blob([response['data']]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', filename); //or any other extension
                        document.body.appendChild(link);
                        link.click();
                    })
                    (reponses[j]);
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
        return DateUtils.setToastMessage(response, 'visas.created', 'visas.created.error');
    }

}
