(function() {
    'use strict';

    /*
    * Course service as class
    * used to manipulate Course model
    */
    class CourseService {
        constructor($http,$q,constants,SubjectService) {

           console.log("create new CourseService");
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.context = {};
            this.SubjectService = SubjectService;
        }


        getMergeCourses(structureId, teacherId, firstDayOfWeek){
            return this.$q.all([
                    this.getScheduleCourses(structureId, teacherId, firstDayOfWeek),
                    this.SubjectService.getStructureSubjectsAsMap(structureId)
                ]).then(results =>{
                    let courses = results[0];
                    let subjects = results[1];
                    return this.mappingCourses(courses,subjects);
             });
        }

        mappingCourses(courses,subjects){
            _.each(courses,course =>{
                course.subject = subjects[course.subjectId];
                course.date = moment(course.startDate);
                course.date.week(model.calendar.week);
                //course.beginning = moment(course.startDate);
                //course.end = moment(course.endDate);
                course.startMoment = moment(course.startDate);
                course.endMoment = moment(course.endDate);

                course.startTime = moment(course.startDate).format('HH:mm:ss');
                course.endTime = moment(course.endDate).format('HH:mm:ss');
                course.calendarType = "shadow";
                course.locked=true;
                course.is_periodic =false;
                course.notShowOnCollision=true;
            });
            return courses;
        }

        getScheduleCourses(structureId, teacherId, firstDayOfWeek) {
            let begin = moment(firstDayOfWeek);
            let end = moment(firstDayOfWeek).add(6, 'd');

            let url = `/directory/timetable/courses/teacher/${structureId}`;
            let config = {
                params : {
                    begin: begin.format(this.constants.CAL_DATE_PATTERN),
                    end: end.format(this.constants.CAL_DATE_PATTERN),
                    teacherId : teacherId
                }
            };
            return this.$http.get(url,config).then(result =>{
                return result.data;
            });
        }

    }

    AngularExtensions.addModuleConfig(function(module) {
        module.service("CourseService",CourseService);
    });

})();
