import {AngularExtensions} from '../app';
import {_, moment, model} from 'entcore';

import CourseService from "./courses.service";


export default class ModelWeekService {
    $http:any;
    $q:any;
    constants: any;
    promiseGetmodelWeek: any;
    CourseService:any;

    constructor($http,$q,constants) {
        this.$http = $http;
        this.$q = $q;
        this.constants = constants;
        this.promiseGetmodelWeek = undefined;

        this.CourseService = new CourseService(this.$http, this.$q, this.constants);
    }

    setModelWeek(alias,date){
        let dateParam = moment(date).format(this.constants.CAL_DATE_PATTERN);
        let url = `/diary/modelweek/${alias}/${dateParam}`;
        this.promiseGetmodelWeek = undefined;
        return this.$http.post(url);
    }

    getModelWeeks(){
        let url = `/diary/modelweek/list`;
        if ( !this.promiseGetmodelWeek){
            this.promiseGetmodelWeek = this.$http.get(url).then((result)=>{
                let modelWeeks = result.data;
                _.each(modelWeeks,modelWeek =>{
                    modelWeek.startDate = moment(modelWeek.startDate).toDate();
                    modelWeek.endDate = moment(modelWeek.endDate).toDate();
                });

                let transformedResult = {
                    "A" : _.findWhere(modelWeeks,{"weekAlias":"A"}),
                    "B" : _.findWhere(modelWeeks,{"weekAlias":"B"}),
                };
                return transformedResult;
            });

        }
        return this.promiseGetmodelWeek;
    }

    invertModelsWeek(){
        let url = `/diary/modelweek/invert`;
        this.promiseGetmodelWeek = undefined;
        return this.$http.post(url).then((result)=>{
            return result.data;
        });
    }

    getCoursesModel(date){
        let dateParam = moment(date).format(this.constants.CAL_DATE_PATTERN);
        let url = `/diary/modelweek/items/${dateParam}`;

        return this.$http.get(url).then((result)=>{
            let courses=result.data;
            if (!courses){
                courses=[];
            }
            this.mappModelWeekToCourse(courses);
            return courses;
        });
    }

    mappModelWeekToCourse(courses){
        _.each(courses,course =>{

            let date = moment(course.date);
            let begin = moment(date);

            begin.set('hour', Number(course.startHour.split(":")[0]));
            begin.set('minute', Number(course.startHour.split(":")[1]));
            begin.set('second', Number(course.startHour.split(":")[2]));

            let end = moment(date);

            end.set('hour', Number(course.endHour.split(":")[0]));
            end.set('minute', Number(course.endHour.split(":")[1]));
            end.set('second', Number(course.endHour.split(":")[2]));

            course.startDate = begin.toDate();
            course.endDate = end.toDate();

            this.CourseService.mappCourse(course);
            course.subject = model.subjects.findWhere({id: course.subjectId});
            course.subject.subjectLabel = course.subjectLabel;
            course.subjectId = course.subjectId;
        });

        return courses;
    }

}

(function () {
    'use strict';
    AngularExtensions.addModuleConfig(function(module) {
        module.service("ModelWeekService",ModelWeekService);
    });

})();
