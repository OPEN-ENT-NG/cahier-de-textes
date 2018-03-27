import { angular, ng, model, moment, _, calendar, Model, routes } from 'entcore';
import { DiaryController } from './controller';
import * as controllers from './controllers/index';
import * as directives from './directives/index';
import * as filters from './filters/index';
import {InitBuild} from './model';
import {AudienceService} from "./services/audiences.service";
declare let module: any;

for (let controller in controllers) {
    ng.controllers.push(controllers[controller]);
}

for (let directive in directives) {
    ng.directives.push(directives[directive]);
}

for (let filter in filters) {
    ng.filters.push(filters[filter]);
}
model.build = InitBuild;

ng.controllers.push(DiaryController);

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