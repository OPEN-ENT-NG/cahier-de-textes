(function() {
    'use strict';

    /*
    * Progression service as class
    * used to manipulate Progression model
    */
    class ProgressionService {

        constructor($http,$q,constants) {
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
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
              return _.map(result.data,this.mapApiToLesson);
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
            let lesson = angular.copy(apiLesson);
            lesson.subject = JSON.parse(lesson.subject);
            lesson.attachments = JSON.parse(lesson.attachments);
            lesson.homeworks = JSON.parse(lesson.homeworks);
            _.each(lesson.homeworks,(homework)=>{
                homework.attachments = JSON.parse(homework.attachments);
            });
            return lesson;
        }

        mapLessonToApi(lesson){
            let lessonApi = angular.copy(lesson);
            _.each(lessonApi.homeworks,(homework)=>{
                homework.attachments = JSON.stringify(homework.attachments);
            });
            lessonApi.homeworks = JSON.stringify(lessonApi.homeworks);
            lessonApi.attachments = JSON.stringify(lessonApi.attachments);
            lessonApi.subject = JSON.stringify(lessonApi.subject);
            return lessonApi;
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
