(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.config(function($routeProvider) {
            $routeProvider
                // go to create new lesson view
                .when('/progressionManagerView', {
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
    });
})();
