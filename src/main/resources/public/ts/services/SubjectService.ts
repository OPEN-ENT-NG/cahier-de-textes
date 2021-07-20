import {ng} from 'entcore';
import http, {AxiosResponse} from 'axios';
import {Subject} from '../model';

export interface SubjectService {
    getTeacherSubjects(structureId: string, teacherId: string): Promise<Subject[]>;

    getExceptionalLabels(structureId): Promise<string[]>;

    getTimetableSubjects(structureId: string): Promise<Subject[]>;
}

export const subjectService: SubjectService = {
    getTeacherSubjects: async (structureId, teacherId) => {
        try {
            const {data} = await http.get(`/directory/timetable/subjects/${structureId}?teacherId=${teacherId}`);
            let res: Subject[] = [];
            data.forEach((subject) => {
                res.push(new Subject(subject.subjectId, subject.subjectLabel, subject.subjectCode, subject.teacherId));
            });
            return res;
        } catch (e) {
            throw e;
        }
    },

    getExceptionalLabels: async (structureId): Promise<string[]> => {
        try {
            const {data}: AxiosResponse = await http.get(`/diary/subjects/exceptional/${structureId}`);
            return data.values;
        } catch (e) {
            throw e;
        }
    },

    getTimetableSubjects: async (structureId: string): Promise<Subject[]> => {
        try {
            const {data}: AxiosResponse = await http.get(`/diary/timetableSubjects/${structureId}`)
            return data.map((subject) => new Subject(subject.id, subject.name))
        } catch (e) {
            throw e;
        }
    }
};


export const SubjectService = ng.service('SubjectService', (): SubjectService => subjectService);