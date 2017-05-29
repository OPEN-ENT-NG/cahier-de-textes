(function() {
    'use strict';

    /*
    * Progression service as class
    * used to manipulate Progression model
    */
    class ProgressionService {

        constructor($http,$q,constants,$sce) {
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.$sce = $sce;
            console.log(this.$sce);
        }

        getProgressions(){
            let url = `/diary/progression`;
            return this.$http.get(url).then(result =>{
                let progressions = result.data;
                _.each(progressions,(progression)=>{
                    progression.lessons = _.map(progression.lessons,this.mapApiToLesson);
                });
                return progressions;
            });
        }

        saveProgression(progression){
            let progressionLight = angular.copy(progression);
            delete progressionLight.lessonItems;
            let url = `/diary/progression`;
            return this.$http({
                url : url,
                method : 'POST',
                data : progressionLight
            }).then(result =>{
                return result.data;
            });
        }

        saveLessonProgression(lesson){
            let url = `/diary/progression/lesson`;

            return this.$http({
                url : url,
                method : 'POST',
                data : this.mapLessonToApi(lesson)
            }).then(result =>{
                return result.data;
            });
        }

        getLessonsProgression(progressionId){

          let url = `/diary/progression/${progressionId}/lessons`;

          return this.$http.get(url).then(result =>{
              return _.map(result.data,(lesson)=>this.mapApiToLesson(lesson));
          });
        }

        getLessonProgression(lessonId){
            let url = `/diary/progression/lesson/${lessonId}`;

            return this.$http.get(url).then(result =>{
                return this.mapApiToLesson(result.data);
            });
        }

        saveLessonOrder(progression){
            let url = `/diary/progression/lesson/order`;

            return this.$http({
                url : url,
                method : 'POST',
                data : this.extractOrderInformations(progression)
            });
        }

        mapApiToLesson(apiLesson){
            let lesson = apiLesson;//angular.copy(apiLesson);
            lesson.subject = JSON.parse(lesson.subject);
            lesson.description = this.$sce.trustAsHtml(lesson.description);
            //lesson.attachments = JSON.parse(lesson.attachments);
            lesson.homeworks = JSON.parse(lesson.homeworks);
            _.each(lesson.homeworks,(homework)=>{
                homework.description = this.$sce.trustAsHtml(homework.description);                
            });

            return lesson;
        }

        mapHomeworkToApi(homework){
            let result =  {
                title : homework.title,
                type : JSON.stringify({
                    id : homework.type.id,
                    label:homework.type.label,
                    structureId : homework.type.structureId,
                    category : homework.type.category
                }),
                description : homework.description,
                color : homework.color,
                state : homework.state,
                //attachments : homework.attachments && homework.attachments.all ? _.map(homework.attachments.all,mapAttachementsToApi) : []
            };
            return result;
        }
        mapAttachementsToApi(attachment){
            return attachment;
        }
        mapLessonToApi(lesson){
            //let lessonApi = lesson;//angular.copy(lesson);
            let result  = {
                id : lesson.id,
                title : lesson.title,
                description : lesson.description,
                subjectLabel : lesson.subject.subject_label,
                color : lesson.color,
                annotation : lesson.annotations,
                orderIndex : lesson.orderIndex,
                subject : lesson.subject,
                progressionId : lesson.progressionId,
                homeworks : lesson.homeworks && lesson.homeworks.all ? _.map(lesson.homeworks.all,this.mapHomeworkToApi) : [],
                //attachments : lesson.attachments && lesson.attachments.all ? _.map(lesson.attachments.all,this.mapAttachementsToApi) : []
            };
            /*if (result.homeworks.length > 0){
                _.each(result.homeworks,(homework)=>{
                    if (homework.attachments){
                        homework.attachments = JSON.stringify(homework.attachments);
                    }
                });
            }*/
            if (result.homeworks){
                result.homeworks = JSON.stringify(result.homeworks);
            }
            /*if (result.attachments){
                result.attachments = JSON.stringify(result.attachments);
            }*/
            result.subject = JSON.stringify(result.subject);
            return result;
        }

        extractOrderInformations(progression){
            let lessonsOrder=[];
            _.each(progression.lessons,(lesson)=>{
                lessonsOrder.push({
                    id : lesson.id,
                    orderIndex :lesson.orderIndex
                });
            });
            return lessonsOrder;
        }

    }

    AngularExtensions.addModuleConfig(function(module) {
        module.service("ProgressionService",ProgressionService);
    });

})();
