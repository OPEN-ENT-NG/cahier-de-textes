import { Structure } from './structure';
import { Mix } from 'entcore-toolkit';
import http from 'axios';

export class Teacher {
    id: string;
    displayName: string;
    externalId: string;
    firstName: string;
    lastName: string;

    constructor (o?: any) {
        if (o && typeof o === 'object') {
            for (let key in o) {
                this[key] = o[key];
            }
        }
    }

    toString () {
        return (this.displayName) ? this.displayName : this.firstName + " " +  this.lastName;
    }
}

export class Teachers {
    all: Teacher[];

    constructor (teachers?: Teacher[]) {
        this.all = teachers || [];
    }

    /**
     * Synchronize structure teachers
     * @param structure structure
     * @returns {Promise<void>}
     */
    async sync (structure: Structure) {
        try {
            let teachers = await http.get('/viescolaire/user/list?profile=Teacher&structureId=' + structure.id);
            this.all = Mix.castArrayAs(Teacher, teachers.data);
        } catch (e) {
            throw e;
        }
    }

    public set(teachers: Teacher[]): Teachers {
        this.all = teachers;
        return this;
    }

    getTeachers = (teacherIds: string[]): Teacher[] =>
        this.all.filter((teacher: Teacher) => teacherIds.indexOf(teacher.id) != -1);

}