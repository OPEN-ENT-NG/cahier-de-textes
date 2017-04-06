(function() {
    'use strict';

    class LessonService {


        constructor($http,$q) {
            this.$http = $http;
            this.$q = $q;
            this.context = {
                'dateFormat' : 'YYYY-MM-DD'
            };
        }

        getMergeCourses(structureId, teacherId, firstDayOfWeek){
            return this.$q.all([
                    this.getScheduleCourses(structureId, teacherId, firstDayOfWeek),
                    this.getSubjects(structureId)
                ]).then(results =>{
                    let courses = results[0];
                    let subjects = results[1];
                    return this.mappingCourses(courses,subjects);
             });
        }

        mappingCourses(courses,subjects){
            _.each(courses,course =>{
                course.subject = subjects[course.subjectId];
            });
            return courses;
        }

        getScheduleCourses(structureId, teacherId, firstDayOfWeek) {
            let begin = moment(firstDayOfWeek);
            let end = moment(firstDayOfWeek).add(6, 'd');

            let url = `/directory/timetable/teacher/${structureId}/${teacherId}`;
            let params = {
                begin: begin.format(this.context.dateFormat),
                end: end.format(this.context.dateFormat)
            };
            return this.$http.get(url,params).then(result =>{
                return result.data;
            });
        }

        getSubjects(structureId){
            if (!this.context.subjectPromise){
                var url = `/directory/timetable/subjects/${structureId}`;
                this.context.subjectPromise = this.$http.get(url).then(subjects =>{
                    //create a indexed array
                    let results = {};
                    _.each(subjects,subject=>{
                        results[subject.subjectId] = subject;
                    });
                    return results;
                });
            }
            return this.context.subjectPromise.then(result =>{
                return result.data;
            });
        }
    }

    AngularExtensions.addModuleConfig(function(module) {

        module.service("LessonService", LessonService);
    });

})();
