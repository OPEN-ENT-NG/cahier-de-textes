(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("MainCalendarPageController", controller);

        function controller($scope, $timeout,$q,$location,constants,SecureService,UtilsService,LessonService,HomeworkService) {
            $scope.goToListView = function(){
                  $location.path('/listView');
                  //model.selectedViewMode = '/diary/public/js/calendar/list-view.template.html';
              };

              $scope.goToCalendarView = function(){
                  $location.path('/calendarView/' + moment($scope.mondayOfWeek).format(constants.CAL_DATE_PATTERN));
                  //model.selectedViewMode = '/diary/public/js/calendar/calendar-view.template.html';
              };
        }
    });
})();
