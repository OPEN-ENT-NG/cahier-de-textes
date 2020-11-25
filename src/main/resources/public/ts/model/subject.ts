import {notify} from 'entcore';
import http from 'axios';
import {subjectService} from '../services';
import {EXCEPTIONAL} from '../core/const/exceptional-subject';

export interface ISubject {
    id?: string;
    externalId?: string;
    name?: string;
    rank?: number;
}

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
            this.mapping = {};
            if (teacherId !== undefined) url += `?teacherId=${teacherId}`;
            let subjects = await http.get(url);
            subjects.data.forEach((subject) => {
                if (Object.keys(this.mapping).indexOf(subject.subjectId) === -1) {
                    this.initSubject(subject);
                }
            });
            await this.initExceptionalSubject(structureId);
            return;
        } catch (e) {
            notify.error('app.notify.e500');
        }
    }

    private initSubject(subject: any): void {
        this.all.push(new Subject(subject.subjectId, subject.subjectLabel, subject.subjectCode, subject.teacherId));
        this.mapping[subject.subjectId] = subject.subjectLabel;
    }

    private async initExceptionalSubject(structureId: string): Promise<void> {

        let exceptionalLabels: string[] = await subjectService.getExceptionalLabels(structureId);

        exceptionalLabels.forEach((label: string) => {
            this.all.push(new Subject(EXCEPTIONAL.subjectId, label));
        });
    }

}