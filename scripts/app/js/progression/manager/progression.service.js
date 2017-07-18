(function() {
    'use strict';

    /*
     * Progression service as class
     * used to manipulate Progression model
     */
    class ProgressionService {

        constructor($http, $q, constants, $sce,SubjectService) {
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.$sce = $sce;
            this.SubjectService = SubjectService;          
        }

        getProgressions() {
            let url = `/diary/progression`;
            return this.$http.get(url).then(result => {
                let progressions = result.data;
                _.each(progressions, (progression) => {
                    progression.lessons = _.map(progression.lessons, this.mapApiToLesson);
                });
                return progressions;
            });
        }

        saveProgression(progression) {
            let progressionLight = angular.copy(progression);
            let lessonItems = progressionLight.lessonItems;
            let nbLessons = progressionLight.nbLessons;
            delete progressionLight.lessonItems;
            delete progressionLight.nbLessons;


            let url = `/diary/progression`;
            return this.$http({
                url: url,
                method: 'POST',
                data: progressionLight
            }).then(result => {
                if (!lessonItems && !nbLessons) {
                    nbLessons = 0;
                }
                result.data.lessonItems = lessonItems;
                result.data.nbLessons = nbLessons;

                return result.data;
            });
        }

        deleteProgression(progressionId) {
            let url = `/diary/progression/${progressionId}`;

            return this.$http({
                url: url,
                method: 'DELETE'
            }).then(result => {
                return result.data;
            });
        }

        deleteLessons(lessons) {

            let lessonsIds = _.map(lessons, lesson => {
                return lesson.id;
            });

            let url = `/diary/progression/lessons`;

            return this.$http({
                url: url,
                method: 'DELETE',
                data: lessonsIds
            }).then(result => {
                return result.data;
            });
        }

        saveLessonProgression(lesson) {
            let url = `/diary/progression/lesson`;

            let subjectPromise = this.$q.when();
            if(!lesson.subject.id){
                subjectPromise = lesson.subject.save().then((subject)=>{
                    subject.data = {
                        id : subject.id,
                        label : subject.label,
                        school_id : subject.school_id
                    };
                });
            }
            return subjectPromise.then(()=>{

                return this.$http({
                    url: url,
                    method: 'POST',
                    data: this.mapLessonToApi(lesson)
                }).then(result => {
                    return result.data;
                });
            });
        }

        getLessonsProgression(progressionId) {

            let url = `/diary/progression/${progressionId}/lessons`;

            return this.$http.get(url).then(result => {
                return _.map(result.data, (lesson) => this.mapApiToLesson(lesson));
            });
        }

        getLessonProgression(lessonId) {
            let url = `/diary/progression/lesson/${lessonId}`;

            return this.$http.get(url).then(result => {
                return this.mapApiToLesson(result.data);
            });
        }

        saveLessonOrder(progression) {
            let url = `/diary/progression/order`;

            return this.$http({
                url: url,
                method: 'POST',
                data: this.extractOrderInformations(progression)
            });
        }

        mapApiToLesson(apiLesson) {
            let lesson = apiLesson; //angular.copy(apiLesson);
            lesson.subject = JSON.parse(lesson.subject);
            lesson.type_item = 'progression';
            if (lesson.description) {
                lesson.descriptionTrusted = this.$sce.trustAsHtml(lesson.description);
            }


            lesson.homeworks = JSON.parse(lesson.homeworks);
            _.each(lesson.homeworks, (homework) => {
                if (homework.description) {
                    homework.descriptionTrusted = this.$sce.trustAsHtml(homework.description);
                }
            });

            let homeworks = new Collection();
            homeworks.all = lesson.homeworks;
            lesson.homeworks = homeworks;
            return lesson;
        }

        mapHomeworkToApi(homework) {
            return JSON.stringify(homework.data);
        }
        mapAttachementsToApi(attachment) {
            return attachment;
        }
        mapLessonToApi(lesson) {

            let result = {
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                subjectLabel: lesson.subject.label,
                color: lesson.color,
                annotations: lesson.annotations,
                orderIndex: lesson.orderIndex,
                //subject: lesson.subject,
                progressionId: lesson.progressionId,
                homeworks: lesson.homeworks && lesson.homeworks.all ? _.map(lesson.homeworks.all, this.mapHomeworkToApi) : [],
            };

            if (lesson.homeworks) {
                result.homeworks = JSON.stringify(_.map(lesson.homeworks.all, this.mapObject));
            }
            //let subject = lesson.subject.data.label ? lesson.subject.data : lesson.subject;
            result.subject = JSON.stringify(lesson.subject.data);
            return result;
        }

        mapObject(obj) {
            obj.toJSON = undefined;
            return obj;
        }

        extractOrderInformations(progression) {
            let lessonsOrder = [];
            _.each(progression.lessonItems, (lesson) => {
                lessonsOrder.push({
                    id: lesson.id,
                    orderIndex: lesson.orderIndex
                });
            });
            return lessonsOrder;
        }

    }

    AngularExtensions.addModuleConfig(function(module) {
        module.service("ProgressionService", ProgressionService);
    });

})();
