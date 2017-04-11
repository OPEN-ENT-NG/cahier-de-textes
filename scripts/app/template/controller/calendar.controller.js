(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

      console.log("CalendarController initialized");
      function controller($scope,$timeout,CourseService){
        console.log("CalendarController called");


          $timeout(init);

          function init(){
              console.log(model.lessons.all);
              CourseService.getMergeCourses(model.me.structures[0],model.me.userId,moment('2017-04-03')).then(function(courses){
                  $scope.itemsCalendar = [].concat(model.lessons.all).concat(courses);
                  /*$scope.itemsCalendar = [{
                    "obj1" : "obj2"
                  }];*/
                  console.log($scope.itemsCalendar);
              });
          }

          /**
           * Opens the next week view of calendar
           */
          $scope.nextWeek = function () {
              var nextMonday = moment(model.calendar.firstDay).add(7, 'day');
              //TODO dont call the parent
              $scope.$parent.goToCalendarView(nextMonday.format(CAL_DATE_PATTERN));
          };

          /**
           * Opens the previous week view of calendar
           */
          $scope.previousWeek = function () {
              var prevMonday = moment(model.calendar.firstDay).add(-7, 'day');
              //TODO dont call the parent
              $scope.$parent.goToCalendarView(prevMonday.format(CAL_DATE_PATTERN));
          };
      }
      module.controller("CalendarController",controller);
    });


  })();
