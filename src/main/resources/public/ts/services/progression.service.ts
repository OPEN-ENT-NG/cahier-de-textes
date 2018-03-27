import {angular, model, moment, _, notify, $http, $q, $sce, Collection} from 'entcore';

export class ProgressionService {
    constructor() {
    }

    static getProgressions() {
        let url = `/diary/progression`;
        return $http.get(url).then(result => {
            let progressions = result.data;
            _.each(progressions, (progression) => {
                progression.lessons = _.map(progression.lessons, this.mapApiToLesson);
            });
            return progressions;
        });
    }

    static saveProgression(progression) {
        let progressionLight = angular.copy(progression);
        let lessonItems = progressionLight.lessonItems;
        let nbLessons = progressionLight.nbLessons;
        delete progressionLight.lessonItems;
        delete progressionLight.nbLessons;


        let url = `/diary/progression`;
        return $http({
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

    static deleteProgression(progressionId) {
        let url = `/diary/progression/${progressionId}`;

        return $http({
            url: url,
            method: 'DELETE'
        }).then(result => {
            return result.data;
        });
    }

    static deleteLessons(lessons) {

        let lessonsIds = _.map(lessons, lesson => {
            return lesson.id;
        });

        let url = `/diary/progression/lessons`;

        return $http({
            url: url,
            method: 'DELETE',
            data: lessonsIds
        }).then(result => {
            return result.data;
        });
    }

    static saveLessonProgression(lesson) {
        let url = `/diary/progression/lesson`;

        let subjectPromise = $q.when();
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

            return $http({
                url: url,
                method: 'POST',
                data: this.mapLessonToApi(lesson)
            }).then(result => {
                return result.data;
            });
        });
    }

    static getLessonsProgression(progressionId) {

        let url = `/diary/progression/${progressionId}/lessons`;
        var that = this;
        return $http.get(url).then(result => {
            return _.map(result.data, (lesson) => that.mapApiToLesson(lesson));
        });
    }

    static getLessonProgression(lessonId) {
        let url = `/diary/progression/lesson/${lessonId}`;
        var that =  this;
        return $http.get(url).then(result => {
            return that.mapApiToLesson(result.data);
        });
    }

    static saveLessonOrder(progression) {
        let url = `/diary/progression/order`;

        return $http({
            url: url,
            method: 'POST',
            data: this.extractOrderInformations(progression)
        });
    }

    static mapApiToLesson(apiLesson) {
        let lesson = apiLesson; //angular.copy(apiLesson);
        lesson.subject = JSON.parse(lesson.subject);
        lesson.type_item = 'progression';
        if (lesson.description) {
            lesson.descriptionTrusted = $sce.trustAsHtml(lesson.description);
        }


        lesson.homeworks = JSON.parse(lesson.homeworks);
        _.each(lesson.homeworks, (homework) => {
            if (homework.description) {
                homework.descriptionTrusted = $sce.trustAsHtml(homework.description);
            }
            homework.type = _.find(model.homeworkTypes.all,{'label':homework.type.label});
        });

        let homeworks = new Collection();
        homeworks.all = lesson.homeworks;
        lesson.homeworks = homeworks;
        return lesson;
    }

    static mapHomeworkToApi(homework) {
        return JSON.stringify(homework.data);
    }

    static mapAttachementsToApi(attachment) {
        return attachment;
    }

    static mapLessonToApi(lesson) {

        let result:any = {
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

    static mapObject(obj) {
        obj.toJSON = undefined;
        return obj;
    }

    static extractOrderInformations(progression) {
        let lessonsOrder = [];
        _.each(progression.lessonItems, (lesson) => {
            lessonsOrder.push({
                id: lesson.id,
                orderIndex: lesson.orderIndex
            });
        });
        return lessonsOrder;
    }
};
