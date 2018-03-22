import { moment, model, _ } from 'entcore';
import { CONSTANTS} from '../tools';
import {SubjectService} from "./subject.service";
import http from 'axios';

/*
* Course service as class
* used to manipulate Course model
*/
export class CourseService {

   static getMergeCourses(structureId, teacherId, firstDayOfWeek){
        return Promise.all([
            this.getScheduleCourses(structureId, teacherId, firstDayOfWeek),
            SubjectService.getStructureSubjectsAsMap(structureId)
        ]).then(results =>{
            let courses = results[0];
            let subjects = results[1];
            return this.mappingCourses(courses,subjects);
        });
    }

    static mappCourse(course){
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

    static recalc(date){
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

    static mappingCourses(courses,subjects){
        _.each(courses,course =>{
            course.subject = subjects[course.subjectId];
            this.mappCourse(course);
        });
        return courses;
    }

    static getScheduleCourses(structureId, teacherId, firstDayOfWeek) {
        let begin = moment(firstDayOfWeek).format(CONSTANTS.CAL_DATE_PATTERN);
        let end = moment(firstDayOfWeek).add(6, 'd').format(CONSTANTS.CAL_DATE_PATTERN);

        let url = `/directory/timetable/courses/${structureId}/${begin}/${end}`;
        let config = {
            params : {
                teacherId : teacherId
            }
        };
        return http.get(url,config).then(result =>{
            return result.data;
        });
    }

};

