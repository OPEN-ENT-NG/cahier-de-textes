import http from 'axios';
import { Mix } from 'entcore-toolkit';
import {Structure} from './index';

export class Student {
    id: string;
    displayName: string;
    audience: any;

    static formatSqlDataToModel(data: any, structure: Structure){
        return {
            audience: structure.audiences.all.find(t => t.id === data.classId),
            id: data.id,
            displayName: data.displayName
        };
    }
}

export class Students {
    all: Student[] = [];
    structure: Structure;

    constructor(structure: Structure) {
        this.structure = structure;
    }

    static formatSqlDataToModel(data: any, structure: Structure){
        let dataModel = [];
        data.forEach(i => dataModel.push(Student.formatSqlDataToModel(i, structure)));
        return dataModel;
    }

    async sync (): Promise<void> {
        let url = '/diary/children/list';

        let { data } = await http.get(url);
        this.all = Mix.castArrayAs(Student, Students.formatSqlDataToModel(data, this.structure));
        return;
    }
}