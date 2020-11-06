import {Behaviours, model} from 'entcore';
import {Audiences, Courses, DateUtils, Homeworks, Sessions, Students, Subjects, Teachers} from './index';
import {Eventer} from 'entcore-toolkit';
import {Personnels} from './Personnel';
import {SessionTypes} from './session';
import {Groups} from "./group";

declare let window: any;

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
    groups: Groups;
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
        this.types = new SessionTypes(this.id);
        this.audiences = new Audiences();
        this.courses = new Courses(this);
        this.sessions = new Sessions(this);
        this.homeworks = new Homeworks(this);
        this.teachers = new Teachers();
        this.personnels = new Personnels();
        this.students = new Students(this);
        this.groups = new Groups();
    }

    /**
     * Synchronize structure information. Audiences and Subjects need to be synchronized to start courses
     * synchronization.
     * @returns {Promise<any>|Promise}
     */
    async sync() {
        let hasTeacherStudentWorkflow: boolean = true;

        // boolean that check if relative or children we do not fetch all classes
        if (DateUtils.isAChildOrAParent(model.me.type)) {
            hasTeacherStudentWorkflow = false;
        }

        const promises: Promise<void>[] = [];
        promises.push(this.types.sync());
        promises.push(this.audiences.sync(this.id, hasTeacherStudentWorkflow));
        promises.push(this.teachers.sync(this));
        promises.push(this.personnels.sync(this));
        await Promise.all(promises).then(async () => {
            const promises: Promise<void>[] = [];
            window.audiences = this.audiences;
            if (model.me.hasWorkflow(Behaviours.applicationsBehaviours.diary.rights.workflow.accessChildData)) {
                promises.push(this.groups.sync(this.audiences.getIds()));
                promises.push(this.students.sync());
            }
            await Promise.all(promises);
        });
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


    /**
     * Returns current structure we are using with window.structure
     * @returns {Structure} structure
     */
    getCurrentStructure(): Structure {
        if (window.structure) {
            return this.all.find((structure: Structure) => structure.id === window.structure.id);
        }
    }
}