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

    fileId: string;
    moment: any;
    created: string;
    modified: string;

    displayDate: string;

    constructor (structure: Structure) {
        this.structure = structure;
    }

    init(structure?: Structure) {
        if(structure){
            this.structure = structure;
        }
        this.displayDate = Utils.getDisplayDateTime(this.created);
        this.moment = moment(this.created);
    }

    toSendFormat() {
        return {
            comment: this.comment,
            sessionIds: this.sessionIds,
            structure_id: this.structure.id,
            teacher_id: this.teacher.id,
            fileId: this.fileId,
            nb_sessions: this.nb_sessions,
            created: this.created,
            modified: this.modified
        };
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
