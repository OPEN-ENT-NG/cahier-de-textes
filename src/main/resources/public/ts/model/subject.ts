import {notify} from 'entcore';
import http from 'axios';

export class Subject {
    id: string;
    label: string;
    code: string;
    teacherId: string;
    externalId?: string;
    name?: string;
    rank?: number;

    constructor(subjectId?: string, subjectLabel?: string, subjectCode?: string, teacherId?: string) {
        this.id = subjectId;
        this.label = subjectLabel;
        this.code = subjectCode;
        this.teacherId = teacherId;
    }

    toString() {
        return this.label;
    }
}

export class Subjects {
    all: Subject[];
    mapping: any;

    constructor() {
        this.all = [];
        this.mapping = {};
    }

    /**
     * Synchronize subjects provided by the structure
     * @param structureId structure id
     * @param teacherId
     * @returns {Promise<void>}
     */
    async sync(structureId: string, teacherId?: string): Promise<void> {
        try {
            let url = `/directory/timetable/subjects/${structureId}`;
            this.all = [];
            if (teacherId !== undefined) url += `?teacherId=${teacherId}`;
            let subjects = await http.get(url);
            subjects.data.forEach((subject) => {
                if (Object.keys(this.mapping).indexOf(subject.subjectId) === -1) {
                    this.initSubject(subject);
                }
            });
            return;
        } catch (e) {
            notify.error('app.notify.e500');
        }
    }

    private initSubject(subject: any) {
        this.all.push(new Subject(subject.subjectId, subject.subjectLabel, subject.subjectCode, subject.teacherId));
        this.mapping[subject.subjectId] = subject.subjectLabel;
    }
}