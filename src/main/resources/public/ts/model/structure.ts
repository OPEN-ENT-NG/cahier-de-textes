import { model } from 'entcore';
import { Courses, Subjects, Sessions, Homeworks, Audiences, Teachers, Students, USER_TYPES } from './index';
import { Eventer } from 'entcore-toolkit';
import {Personnels} from './Personnel';

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

    /**
     * Structure constructor. Can take an id and a name in parameter
     * @param id structure id
     * @param name structure name
     */
    constructor (id?: string, name?: string) {
        if (typeof id === 'string') { this.id = id; }
        if (typeof name === 'string') { this.name = name; }
        this.subjects = new Subjects();
        this.audiences = new Audiences();
        this.courses = new Courses(this);
        this.sessions = new Sessions(this);
        this.homeworks = new Homeworks(this);
        this.teachers = new Teachers();
        this.personnels = new Personnels();
        if (model.me.type === USER_TYPES.relative) {
            this.students = new Students();
        }
    }

    /**
     * Synchronize structure information. Audiences and Subjects need to be synchronized to start courses
     * synchronization.
     * @returns {Promise<T>|Promise}
     */
    sync (): Promise<any> {
        return new Promise((resolve, reject) => {
            let syncedCollections = {
                subjects: false,
                audiences: false,
                teachers: false,
                personnels: false,
                students: model.me.type !== USER_TYPES.relative
            };

            let endSync = () => {
                let _b: boolean = syncedCollections.subjects
                && syncedCollections.audiences
                && syncedCollections.teachers
                && syncedCollections.personnels
                && syncedCollections.students;
                if (_b) {
                    resolve();
                    this.eventer.trigger('refresh');
                }
            };

            this.subjects.sync(this.id).then(() => { syncedCollections.subjects = true; endSync(); });
            this.audiences.sync(this.id).then(() => { syncedCollections.audiences = true; endSync(); });
            this.teachers.sync(this).then(() => { syncedCollections.teachers = true; endSync(); });
            this.personnels.sync(this).then(() => { syncedCollections.personnels = true; endSync(); });

            if (model.me.type === USER_TYPES.relative) {
                this.students.sync().then(() => { syncedCollections.students = true; endSync(); });
            }
        });
    }
}

export class Structures {
    all: Structure[];

    constructor (arr?: Structure[]) {
        this.all = [];
        if (arr instanceof Structure) { this.all = arr; }
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
    first (): Structure {
        return this.all[0];
    }
}