import { model, moment, _, notify } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';
import { USER_TYPES, Structure, Teacher, Group, Utils} from './index';
import {Personnel} from './Personnel';

export class Visa {

    id: number;
    comment: string = '';
    created: string;
    modified: string;
    session_id: number;
    structure: Structure;
    owner_id: string;
    owner: Personnel;
    moment: any;
    displayDateTime: string;

    isBeingUpdated: boolean;

    constructor (structure: Structure) {
        this.structure = structure;
    }

    init(structure?: Structure) {
        if(structure){
            this.structure = structure;
        }

        this.owner = this.structure.personnels.all.find(p => p.id === this.owner_id);
        this.moment = moment(this.created);
        this.displayDateTime = Utils.getDisplayDateTime(this.moment);
    }

    toJSON () {
        return {
            comment: this.comment,
            session_id: this.session_id,
            structure_id: this.structure.id
        };
    }

    async save () {
        if (this.id) {
            return await this.update();
        } else {
            return await this.create();
        }
    }

    async create () {
        try {
            return await http.post('/diary/visa', this.toJSON());
        } catch (e) {
            notify.error('visa.create.err');
        }
    }

    async update () {
        try {
            return await http.put(`/diary/visa/${this.id}`, this.toJSON());
        } catch (e) {
            notify.error('visa.update.err');
            throw e;
        }
    }

    async delete() {
        try {
            return await http.delete('/diary/visa/' + this.id);
        } catch (e) {
            notify.error('visa.delete.err');
            console.error(e);
            throw e;
        }
    }

    async sync(): Promise<void> {
        let {data} = await http.get('/diary/visa/' + this.id);
        Mix.extend(this, data);
    }
}

export class Visas {
    all: Visa[];
    origin: Visa[];
    structure: Structure;

    constructor (structure: Structure) {
        this.structure = structure;
        this.all = [];
        this.origin = [];
    }

    async sync(sessionId? : string){
        let url = `/diary/visa/${this.structure.id}/${sessionId}`;

        let { data } = await http.get(url);
        this.all = Mix.castArrayAs(Visa, data);
    }
}
