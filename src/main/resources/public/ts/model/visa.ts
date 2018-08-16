import {_, model, moment, notify} from 'entcore';
import http from 'axios';
import {Structure, Teacher, Utils} from './index';

export class Visa {

    id: number;
    comment: string = null;
    sessionIds: object = [];
    sessions: any = [];
    structure: Structure;
    teacher: Teacher;
    nb_sessions: number = 0;

    created: string;
    modified: string;

    constructor (structure: Structure) {
        this.structure = structure;
    }

    init(structure?: Structure) {
        if(structure){
            this.structure = structure;
        }
    }

    toSendFormat() {
        return {
            comment: this.comment,
            sessionIds: this.sessionIds,
            sessions: this.sessions.map((n) => {
                return {
                    audience: n.audience.name,
                    subject: n.subject.label,
                    teacher: n.teacher,
                    title: n.title,
                    startDisplayDate: n.startDisplayDate,
                    startDisplayTime: n.startDisplayTime,
                    endDisplayTime: n.endDisplayTime,
                    description: n.description,
                    annotation: n.annotation
                }
            }),
            structure_id: this.structure.id,
            teacher_id: this.teacher.id,
            nb_sessions: this.nb_sessions,
            created: this.created,
            modified: this.modified
        };
    }

    mapFormData(FormData) {
        this.comment = FormData.comment;
        this.sessionIds = FormData.sessionIds;
        this.sessions = FormData.sessions;
        this.teacher = FormData.teacher;
        this.nb_sessions = FormData.nb_sessions;
        this.created = FormData.created;
        this.modified = FormData.modified;
    }

    async downloadPdf(): Promise<void> {
        window.location.href = `/diary/visa/${this.id}/pdf`;
    }
}


export class Visas {
    all: Visa[];
    structure: Structure;

    constructor (structure: Structure) {
        this.structure = structure;
        this.all = [];
    }

    toSendFormat () {
        return {
            structure_id: this.structure.id,
            visas: this.all.map((n) => n.toSendFormat())
        };
    }

    async save() {
        return await this.create();
    }

    async create() {
        let response = await http.post('/diary/visas', this.toSendFormat());
        return Utils.setToastMessage(response, 'visas.created','visas.created.error');
    }

}
