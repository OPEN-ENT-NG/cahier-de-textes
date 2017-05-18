(function() {
    'use strict';

    class ModelWeekService {

        constructor($http,$q,constants,CourseService) {
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.CourseService = CourseService;
        }

        setModelWeek(alias,date){
            let dateParam = moment(date).format(this.constants.CAL_DATE_PATTERN);
            let url = `/diary/modelweek/${alias}/${dateParam}`;
            return this.$http.post(url);
        }

        getModelWeeks(){
            let url = `/diary/modelweek/list`;
            return this.$http.get(url).then((result)=>{
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

        invertModelsWeek(){
            let url = `/diary/modelweek/invert`;
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
                course.startDate = moment(course.startDate);
                course.endDate = moment(course.endDate);
                this.CourseService.mappCourse(course);
                course.subject = model.subjects.findWhere({id: course.subjectId});
                course.subject.subjectLabel = course.subjectLabel;
                course.subjectId = course.subjectId;
            });

            return courses;
        }

    }

    AngularExtensions.addModuleConfig(function(module) {
        module.service("ModelWeekService",ModelWeekService);
    });

})();
