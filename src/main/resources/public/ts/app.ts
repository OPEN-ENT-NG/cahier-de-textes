import { angular, ng, model, moment, _, calendar, Model, routes } from 'entcore';
import {DiaryController} from './controller';
import * as controllers from './controller/index';

declare let module: any;

ng.controllers.push(DiaryController);
for (let controller in controllers) {
    ng.controllers.push(controllers[controller]);
}

export const AngularExtensions = {
    moduleConfigs : [],
    addModuleConfig : function(callBack){
        this.moduleConfigs.push(callBack);
    },
    init: function (module) {
        angular.forEach(this.moduleConfigs,function(moduleConfig){
            moduleConfig.apply(this,[module]);

        });
    }
};

routes.define(($routeProvider) => {
    $routeProvider
    //show history
        .when('/showHistoryView', {
            action: 'showHistoryView'
        })
        // manage visa
        .when('/manageVisaView/:teacherId', {
            action: 'manageVisaView'
        })
        // go to create new lesson view
        .when('/progressionManagerView/:selectedProgressionId', {
            action: 'progressionManagerView'
        })
        .when('/progressionEditLesson/:progressionId/:editProgressionLessonId', {
            action: 'editLessonView'
        })
        // go to create new lesson view
        .when('/createLessonView/:timeFromCalendar', {
            action: 'createLessonView'
        })
        // go to create/update homework view
        .when('/createHomeworkView', {
            action: 'createHomeworkView'
        })
        .when('/editLessonView/:idLesson', {
            action: 'editLessonView'
        })
        .when('/showLessonView/:idLesson', {
            action: 'showLessonView'
        })
        // opens lesson and set default tab view to homeworks one
        .when('/editLessonView/:idLesson/:idHomework', {
            action: 'editLessonView'
        })
        .when('/editHomeworkView/:idHomework', {
            action: 'editHomeworkView'
        })
        .when('/editHomeworkView/:idHomework/:idLesson', {
            action: 'editHomeworkView'
        })
        .when('/calendarView/:mondayOfWeek', {
            action: 'calendarView'
        })
        .when('/listView', {
            action: 'listView'
        })
        .when('/mainView', {
            action: 'mainView'
        })
        // default view
        .otherwise({
            action: 'calendarView'
        });
});