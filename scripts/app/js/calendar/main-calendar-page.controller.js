(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("MainCalendarPageController", controller);

        function controller($scope, $timeout,$rootScope, $q, $location, constants, SecureService, UtilsService, LessonService, HomeworkService,ModelWeekService) {

            let vm = this;

            $timeout(init);
            function init(){
                $scope.getModel();
            }

            $scope.goToListView = function() {
                $location.path('/listView');
            };

            $scope.goToCalendarView = function() {
                $location.path('/calendarView/' + moment(model.mondayOfWeek).format(constants.CAL_DATE_PATTERN));
            };


            $scope.setModel = function(alias) {
                ModelWeekService.setModelWeek(alias,model.mondayOfWeek).then((modelWeek) => {
                    $rootScope.$broadcast('calendar.refreshCalendar');
                    $scope.getModel();
                });

                notify.info(lang.translate('diary.model.week.choice.effective') + " " + alias);

            };

            $scope.invert = function() {
                ModelWeekService.invertModelsWeek().then(() => {
                    $rootScope.$broadcast('calendar.refreshCalendar');
                    $scope.getModel();
                });
            };

            $scope.getModel = function(){
                if (SecureService.hasRight(constants.RIGHTS.MANAGE_MODEL_WEEK)) {                    
                    ModelWeekService.getModelWeeks().then((modelweeks)=>{
                        $scope.modelWeeks = modelweeks;
                    });
                }
            };
        }
    });
})();
