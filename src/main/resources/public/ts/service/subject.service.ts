import { BaseMode, _ } from 'entcore';
import { Subject} from "../model/Subject.model";
import {UtilsService} from "./utils.service";
import http from 'axios';

/*
 * Subject service as class
 * used to manipulate Subject model
 */
export class SubjectService {
    static context = {
        subjectPromise: []
    };
    /*
    *   Get all subject from a structureId as map
    *   used to map a course from the subject id
    */
    static getStructureSubjectsAsMap(structureId){
        return this.getStructureSubjects(structureId).then((result)=>{
            let subjects = result;
            let results = {};
            _.each(subjects,subject=>{
                results[subject.subjectId] = subject;
            });
            return results;
        });
    }

    /*
    *   Get all subject from a structureId
    *   used to map a course from the subject id
    */
    static getStructureSubjects(structureId){
        if (!this.context.subjectPromise[structureId]){
            var url = `/directory/timetable/subjects/${structureId}`;
            this.context.subjectPromise[structureId] = http.get(url).then(result =>{
                return result.data;
            });
        }
        return this.context.subjectPromise[structureId];
    }


    /*
    *   get subjects created by the teacher
    *   used to edit a lesson
    */
    static getCustomSubjects(isTeacher){
        let urlGetSubjects = '';
        if (isTeacher) {
            urlGetSubjects = '/diary/subject/initorlist';
        }else{
            urlGetSubjects = '/diary/subject/list/' + UtilsService.getUserStructuresIdsAsString();
        }

        return http.get(urlGetSubjects).then((result)=>{
            return _.map(result.data, (sub)=> {
               return new Subject(sub);
            });
        });
    }

    /*
    * map original subject to diary subject
    */
    static mapToDiarySubject(subject){
        let result = new Subject();

        result.id = null;
        result.school_id = subject.school_id;
        result.label = subject.subjectLabel;
        result.originalsubjectid = subject.subjectId;
        result.teacher_id = subject.teacher_id;
        return result;
    }
}
