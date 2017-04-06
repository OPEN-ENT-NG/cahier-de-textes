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
                ]).then(function(results){
                    let courses = results[0];
                    let subjects = results[1];
                    return mappingCourses(courses,subjects);
             });
        }

        mappingCourses(courses,subjects){
            _.each(courses,function(course){
                course.subject = subjects[course.subjectId];
            });
            return result;
        }

        getScheduleCourses(structureId, teacherId, firstDayOfWeek) {
            let begin = moment(firstDayOfWeek);
            let end = moment(firstDayOfWeek).add(6, 'd');

            let url = `/directory/timetable/teacher/${structureId}/${teacherId}`;
            let params = {
                begin: begin.format(this.context.dateFormat),
                end: end.format(this.context.dateFormat)
            };
            return this.$http.get(url,params);
        }

        getSubjects(structureId){
            if (!this.context.subjectPromise){
                var url = `/directory/timetable/subjects/${structureId}`;
                this.context.subjectPromise = this.$http.get(url).then(function(subjects){
                    //create a indexed array
                    let results = {};
                    _.each(subjects,function(subject){
                        results[subject.subjectId] = subject;
                    });
                    return results;
                });
            }
            return this.context.subjectPromise;
        }
    }

    AngularExtensions.addModuleConfig(function(module) {

        module.service("LessonService", LessonService);
    });

})();
