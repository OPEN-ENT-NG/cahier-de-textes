import { model, moment, _, notify } from 'entcore';
import http from 'axios';
import { Mix } from 'entcore-toolkit';
import { Structure,  DateUtils} from './index';
import {Personnel} from './Personnel';

export class Inspector {

    id: string;
    displayName: string;
    structure: Structure;
    habilitations: InspectorHabilitations;

    constructor (structure: Structure, personnel: Personnel) {
        this.structure = structure;

        this.id = personnel.id;
        this.displayName = personnel.firstName + ' ' + personnel.lastName;
        this.habilitations = new InspectorHabilitations();
    }

    init(structure?: Structure) {
        if(structure){
            this.structure = structure;
        }
    }

    /**
     * Sync the inspector habilitations
     * @returns {Promise<void>}
     */
    async sync(){
        await this.habilitations.sync(this.id, this.structure);
    }
}

export class InspectorHabilitation {
    inspector: Inspector;
    teacher: any;
    structure: Structure;

    async create () {
        let response = await http.post(`/diary/inspector-habilitation`, this.toSendingFormat());
        return DateUtils.setToastMessage(response, 'inspector.habilitation.created','inspector.habilitation.created.error');
    }

    async delete() {
        let response = await http.delete(`/diary/inspector-habilitation/${this.inspector.id}/${this.teacher.id}/${this.structure.id}`);
        return DateUtils.setToastMessage(response, 'inspector.habilitation.deleted','inspector.habilitation.deleted.error');
    }

    constructor (inspector: Inspector, teacher: any, structure: Structure) {
        this.inspector = inspector;
        this.teacher = teacher;
        this.structure = structure;
    }

    toSendingFormat(){
        return {
            inspectorId: this.inspector.id,
            teacherId: this.teacher.id,
            structureId: this.structure.id
        }
    }

    static formatSqlDataToModel(data: any, structure: Structure){
        return {
            inspector: structure.personnels.all.find(t => t.id === data.inspector_id),
            teacher: structure.teachers.all.find(t => t.id === data.teacher_id),
            structure: {id: structure.id},
        };
    }
}

export class InspectorHabilitations {
    all: InspectorHabilitation[];

    constructor () {
        this.all = [];
    }

    static formatSqlDataToModel(data: any, structure: Structure){
        let dataModel = [];
        data.forEach(i => dataModel.push(InspectorHabilitation.formatSqlDataToModel(i, structure)));
        return dataModel;
    }

    async sync(inspectorId: string, structure: Structure){
        let url = `/diary/inspector-habilitations/${inspectorId}/${structure.id}`;

        let { data } = await http.get(url);
        this.all = Mix.castArrayAs(InspectorHabilitation, InspectorHabilitations.formatSqlDataToModel(data, structure));
    }
}
