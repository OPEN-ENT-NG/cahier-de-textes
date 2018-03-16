import {AngularExtensions} from '../app';
import { moment, model, _} from 'entcore';
import SubjectService from "./subject.service";

/*
* Course service as class
* used to manipulate Course model
*/
export default class CourseService {

    $http: any;
    $q: any;
    constants: any;
    context: any;
    SubjectService: any;

    constructor($http, $q, constants) {
        this.$http = $http;
        this.$q = $q;
        this.constants = constants;
        this.context = {};
        this.SubjectService = new SubjectService(this.$http, this.$q, this.constants);
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

    mappCourse(course){
        course.date = moment(course.startDate);
        course.date.week(model.calendar.week);

        course.startMoment = this.recalc(moment(course.startDate));
        course.endMoment = this.recalc(moment(course.endDate));

        course.startTime = moment(course.startDate).format('HH:mm:ss');
        course.endTime = moment(course.endDate).format('HH:mm:ss');

        course.calendarType = "shadow";
        course.locked=true;
        course.is_periodic =false;
        course.notShowOnCollision=true;
    }

    recalc(date){
        // multi week gestion
        //https://groups.google.com/forum/#!topic/entcore/ne1ODPHQabE
        let diff = date.diff(model.mondayOfWeek,'days');
        if ( diff < 0 ||  diff > 6){
            let weekDay = date.weekday();
            date.dayOfYear(model.mondayOfWeek.dayOfYear());
            date.weekday(weekDay);
        }
        return date;
    }

    mappingCourses(courses,subjects){
        _.each(courses,course =>{
            course.subject = subjects[course.subjectId];
            this.mappCourse(course);
        });
        return courses;
    }

    getScheduleCourses(structureId, teacherId, firstDayOfWeek) {
        let begin = moment(firstDayOfWeek).format(this.constants.CAL_DATE_PATTERN);
        let end = moment(firstDayOfWeek).add(6, 'd').format(this.constants.CAL_DATE_PATTERN);

        let url = `/directory/timetable/courses/${structureId}/${begin}/${end}`;
        let config = {
            params : {
                teacherId : teacherId
            }
        };
        return this.$http.get(url,config).then(result =>{
            return result.data;
        });
    }

};

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        module.service("CourseService",CourseService);
    });

})();
