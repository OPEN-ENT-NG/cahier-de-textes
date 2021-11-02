import http from 'axios';
import { Mix } from 'entcore-toolkit';
import {Audience, Audiences, Structure} from './index';
import {Group, Groups} from "./group";
import {ArrayUtils} from "../utils/array.utils";

export class Student {
    id: string;
    displayName: string;
    audience: any;
    audiences: Audiences;
    groups: Groups;
    groupId: string;
    classId?: string;
    structureId: string



    static formatSqlDataToModel(data: any, structure?: Structure){
        return {
            audience: structure ? structure.audiences.all.find(t => t.id === data.classId) : null,
            audiences: new Audiences(),
            groupId: data.groupId,
            groups: new Groups(),
            id: data.id,
            displayName: data.displayName,
            structureId: data.structureId,
            classId: data.classId
        };
    }

    addAudience(audience: Audience): void {
        if (this.audiences) this.audiences.add(audience);
    }

    addGroup(group: Group): void {
        if (this.groups) this.groups.add(group);
    }
}

export class Students {
    all: Student[] = [];
    structure: Structure;

    constructor(structure: Structure) {
        this.structure = structure;
    }

    static formatSqlDataToModel(data: any, structure?: Structure){
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

    get = (studentId: string): Student => this.all.find((s: Student) => s.id == studentId);

    set = (students: Student[]): Students => {
        this.all = students;
        return this;
    }

    add(student: Student): Students {
        if(!this.all.find((s: Student) => s.id === student.id)) this.all.push(student);
        return this;
    }

    getAudiences(): Audience[] {
        let audiences: Audience[][] = this.all.map((student: Student) => student.audiences.all);
        return ArrayUtils.propertyDistinct(ArrayUtils.flat(audiences), "id");
    }

    getGroups(): Group[] {
        let groups: Group[][] = this.all.map((student: Student) => student.groups.all);
        return ArrayUtils.propertyDistinct(ArrayUtils.flat(groups), "id_classe");
    }
}