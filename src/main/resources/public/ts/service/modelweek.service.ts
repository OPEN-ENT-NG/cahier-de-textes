import {_, moment, model, $http} from 'entcore';
import {CONSTANTS} from "../tools";
import {CourseService} from "./courses.service";


export class ModelWeekService {
    static promiseGetmodelWeek:any;

    static setModelWeek(alias,date){
        let dateParam = moment(date).format(CONSTANTS.CAL_DATE_PATTERN);
        let url = `/diary/modelweek/${alias}/${dateParam}`;
        this.promiseGetmodelWeek = undefined;
        return $http.post(url);
    }

    static getModelWeeks(){
        let url = `/diary/modelweek/list`;
        if ( !this.promiseGetmodelWeek){
            this.promiseGetmodelWeek = $http.get(url).then((result)=>{
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

    static invertModelsWeek(){
        let url = `/diary/modelweek/invert`;
        this.promiseGetmodelWeek = undefined;
        return $http.post(url).then((result)=>{
            return result.data;
        });
    }

    static getCoursesModel(date){
        let dateParam = moment(date).format(CONSTANTS.CAL_DATE_PATTERN);
        let url = `/diary/modelweek/items/${dateParam}`;

        return $http.get(url).then((result)=>{
            let courses=result.data;
            if (!courses){
                courses=[];
            }
            this.mappModelWeekToCourse(courses);
            return courses;
        });
    }

    static mappModelWeekToCourse(courses){
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

            CourseService.mappCourse(course);
            course.subject = model.subjects.findWhere({id: course.subjectId});
            course.subject.subjectLabel = course.subjectLabel;
            course.subjectId = course.subjectId;
        });

        return courses;
    }

}
