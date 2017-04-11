(function() {
    'use strict';

    /*
    * Course service as class
    * used to manipulate Course model
    */
    class CourseService {


        constructor($http,$q) {
          console.log("instantiate courseService");
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
                course.date = moment(course.startDate);
                course.date.week(model.calendar.week);
                //course.beginning = moment(course.startDate);
                //course.end = moment(course.endDate);
                course.startMoment = moment(course.startDate);
                course.endMoment = moment(course.endDate);

                course.startTime = moment(course.startDate).format('HH:mm:ss');
                course.endTime = moment(course.endDate).format('HH:mm:ss');

                course.type = "schedule";
                course.is_periodic =false;
            });
            return courses;
        }

        getScheduleCourses(structureId, teacherId, firstDayOfWeek) {
            let begin = moment(firstDayOfWeek);
            let end = moment(firstDayOfWeek).add(6, 'd');

            let url = `/directory/timetable/teacher/${structureId}/${teacherId}`;
            let config = {
                params : {
                    begin: begin.format(this.context.dateFormat),
                    end: end.format(this.context.dateFormat),
                }
            };
            return this.$http.get(url,config).then(result =>{
                return result.data;
            });
        }

        getSubjects(structureId){
            if (!this.context.subjectPromise){
                var url = `/directory/timetable/subjects/${structureId}`;
                this.context.subjectPromise = this.$http.get(url).then(result =>{
                    //create a indexed array
                    let subjects = result.data;
                    let results = {};
                    _.each(subjects,subject=>{
                        results[subject.subjectId] = subject;
                    });
                    return results;
                });
            }
            return this.context.subjectPromise;
        }
    }
    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("CourseService",CourseService);
    });

})();
