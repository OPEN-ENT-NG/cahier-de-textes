import {Behaviours, model} from 'entcore';
import {Audiences, Courses, Homeworks, Sessions, Students, Subjects, Teachers} from './index';
import {Eventer} from 'entcore-toolkit';
import {Personnels} from './Personnel';
import {SessionTypes} from './session';

export class Structure {
    id: string;
    name: string;
    courses: Courses;
    sessions: Sessions;
    homeworks: Homeworks;
    subjects: Subjects;
    audiences: Audiences;
    teachers: Teachers;
    students: Students;
    personnels: Personnels;
    eventer: Eventer = new Eventer();
    types: SessionTypes;

    /**
     * Structure constructor. Can take an id and a name in parameter
     * @param id structure id
     * @param name structure name
     */
    constructor(id?: string, name?: string) {
        if (typeof id === 'string') {
            this.id = id;
        }
        if (typeof name === 'string') {
            this.name = name;
        }
        this.subjects = new Subjects();
        this.types = new SessionTypes(this.id);
        this.audiences = new Audiences();
        this.courses = new Courses(this);
        this.sessions = new Sessions(this);
        this.homeworks = new Homeworks(this);
        this.teachers = new Teachers();
        this.personnels = new Personnels();
        this.students = new Students(this);
    }

    /**
     * Synchronize structure information. Audiences and Subjects need to be synchronized to start courses
     * synchronization.
     * @returns {Promise<T>|Promise}
     */
    async sync() {
        await this.subjects.sync(this.id);
        await this.types.sync();
        await this.audiences.sync(this.id);
        if (model.me.hasWorkflow(Behaviours.applicationsBehaviours.diary.rights.workflow.accessChildData)) {
            await this.students.sync();
        }
        await this.teachers.sync(this);
        await this.personnels.sync(this);

    }
}

export class Structures {
    all: Structure[];

    constructor(arr?: Structure[]) {
        this.all = [];
        if (arr instanceof Structure) {
            this.all = arr;
        }
    }

    sync() {
        for (let i = 0; i < model.me.structures.length; i++) {
            this.all.push(new Structure(model.me.structures[i], model.me.structureNames[i]));
        }
        return;
    }

    /**
     * Returns first structure occurrence in the class
     * @returns {Structure} first structure contained in 'all' array
     */
    first(): Structure {
        return this.all[0];
    }
}