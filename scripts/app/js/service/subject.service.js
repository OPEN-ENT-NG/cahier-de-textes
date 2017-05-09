(function() {
    'use strict';

    /*
     * Subject service as class
     * used to manipulate Subject model
     */
    class SubjectService {


        constructor($http, $q, constants,UtilsService) {
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.UtilsService=UtilsService;
            this.context = {
                subjectPromise : []
            };
        }

        /*
        *   Get all subject from a structureId as map
        *   used to map a course from the subject id
        */
        getStructureSubjectsAsMap(structureId){
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
        getStructureSubjects(structureId){
            if (!this.context.subjectPromise[structureId]){
                var url = `/directory/timetable/subjects/${structureId}`;
                this.context.subjectPromise[structureId] = this.$http.get(url).then(result =>{
                    return result.data;
                });
            }
            return this.context.subjectPromise[structureId];
        }


        /*
        *   get subjects created by the teacher
        *   used to edit a lesson
        */
        getCustomSubjects(isTeacher){
            let urlGetSubjects = '';
            if (isTeacher) {
                urlGetSubjects = '/diary/subject/initorlist';
            }else{
                urlGetSubjects = '/diary/subject/list/' + this.UtilsService.getUserStructuresIdsAsString();
            }

            return this.$http.get(urlGetSubjects).then((result)=>{
                return result.data;
            });
        }

        /*
        * map original subject to diary subject
        */
        mapToDiarySubject(subject){
            let result = new Subject();

            result.id = null;
            result.school_id = subject.school_id;
            result.label = subject.subjectLabel;
            result.originalsubjectid = subject.subjectId;
            result.teacher_id = subject.teacher_id;
            return result;
        }
    }

    AngularExtensions.addModuleConfig(function(module) {
        module.service("SubjectService", SubjectService);
    });

})();
