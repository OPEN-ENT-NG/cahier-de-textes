import {ng} from 'entcore'
import http from 'axios';
import {Subject} from "../model";

export interface SubjectService {
    getTeacherSubjects(structureId: string, teacherId: string): Promise<Subject[]>
}

export const SubjectService = ng.service('SubjectService', (): SubjectService => ({
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
    }
}));
