import { model, moment, _, notify } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';
import { Structure,  Utils} from './index';
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
        let response = await http.post('/diary/visa', this.toJSON());
        return Utils.setToastMessage(response, 'visa.created','visa.created.error');
    }

    async update () {
        let response = await http.put(`/diary/visa/${this.id}`, this.toJSON());
        return Utils.setToastMessage(response, 'visa.updated','visa.updated.error');
    }

    async delete() {
        let response = await http.delete('/diary/visa/' + this.id);
        return Utils.setToastMessage(response, 'visa.deleted','visa.deleted.error');
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
