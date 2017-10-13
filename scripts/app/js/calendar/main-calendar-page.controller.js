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
                vm.isUserParent = model.isUserParent();
                $scope.child = model.child;
                $scope.children = model.childs;
            }

            $scope.showCalendarForChild = function(childd){
                console.log("broadcast");
                $scope.children.forEach(function(theChild) {
                    theChild.selected = (theChild.id === childd.id);
                });

                childd.selected = true;
                $scope.child = childd;
                model.child = childd;
                $rootScope.$broadcast('show-child',childd);
            }

            $scope.goToListView = function() {
                $location.path('/listView');
            };

            $scope.goToCalendarView = function() {
                $location.path('/calendarView/' + moment(model.mondayOfWeek).format(constants.CAL_DATE_PATTERN));
            };


            $scope.setModel = function(alias) {
                ModelWeekService.setModelWeek(alias,model.mondayOfWeek).then((modelWeek) => {
                    $scope.modelWeekCurrentWeek = alias;
                    $scope.isModelWeek = true;
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
