import {notify, idiom as lang} from 'entcore';
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

    /**
     * Group by current teacher subjects, or not, or exceptional.
     */
    groupByTeacherBelonging = (): String => {
        if (this.teacherId !== undefined) {
            return lang.translate('subjects.teacher');
        } else if (this.id !== EXCEPTIONAL.subjectId) {
            return lang.translate('subjects.structure');
        } else {
            return lang.translate('subjects.exceptional');
        }
    };
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

    /**
     * Mainly used when you want to set teacherId on each subject if the current teacher logged possesses them
     * (else let teacherId as null).
     */
    public setLinkedTeacherById = async (structureId: string, teacherId: string): Promise<void> => {
        subjectService.getTeacherSubjects(structureId, teacherId).then((subjectsList: Subject[]) => {
            subjectsList.filter(subjects => subjects).forEach((subject: Subject) => {
                if (Object.keys(this.mapping).indexOf(subject.id) === -1) {
                    this.all.push(subject);
                    this.mapping[subject.id] = subject.label;
                } else if (subject.teacherId !== undefined) {
                    const subjectIndex: number = this.all.findIndex((s: Subject) => s.id === subject.id);
                    this.all[subjectIndex].teacherId = subject.teacherId;
                }
            });
        });
    };

    public sort = (): void => {
        this.all = this.all.sort((s1: Subject, s2: Subject) => s1.label > s2.label ? 1 : -1);
    }

}