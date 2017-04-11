(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        module.directive('diaryScheduleItem', function($compile) {
            return {
                restrict: 'E',
                require: '^diary-calendar',
                template: `<div class="schedule-item" resizable horizontal-resize-lock draggable>
                                <container template="schedule-display-template" class="absolute"></container>
                            </div>`,
                controller: function($scope,$element,$timeout) {


                  console.log("new controller");
                  var vm = this;

                  $scope.item.$element = $element;
                  console.log("element : ",$scope.item.$element);

                  var parentSchedule = $element.parents('.schedule');
                  var scheduleItemEl = $element.children('.schedule-item');
                  scheduleItemEl.find('container').append($compile($scope.displayTemplate)($scope));

                  var dayWidth = parentSchedule.find('.day').width();

                  if ($scope.item.beginning.dayOfYear() !== $scope.item.end.dayOfYear() || $scope.item.locked) {
                      scheduleItemEl.removeAttr('resizable');
                      scheduleItemEl.removeAttr('draggable');
                      scheduleItemEl.unbind('mouseover');
                      scheduleItemEl.unbind('click');
                      scheduleItemEl.data('lock', true);
                  }


                  vm.getTimeFromBoundaries = function() {
                    console.log("getTimeFromBoundaries");
                      // compute element positon added to heiht of 7 hours ao avoid negative value side effect
                      var topPos = scheduleItemEl.position().top + (calendar.dayHeight * calendar.startOfDay);
                      var startTime = moment();//.utc();
                      startTime.hour(Math.floor(topPos / calendar.dayHeight));
                      startTime.minute((topPos % calendar.dayHeight) * 60 / calendar.dayHeight);

                      var endTime = moment();//.utc();
                      endTime.hour(Math.floor((topPos + scheduleItemEl.height()) / calendar.dayHeight));
                      endTime.minute(((topPos + scheduleItemEl.height()) % calendar.dayHeight) * 60 / calendar.dayHeight);

                      startTime.year(model.calendar.year);
                      endTime.year(model.calendar.year);

                      var days = $element.parents('.schedule').find('.day');
                      var center = scheduleItemEl.offset().left + scheduleItemEl.width() / 2;
                      var dayWidth = days.first().width();
                      days.each(function(index, item) {
                          var itemLeft = $(item).offset().left;
                          if (itemLeft < center && itemLeft + dayWidth > center) {
                              var day = index + 1;
                              var week = model.calendar.week;
                              endTime.week(week);
                              startTime.week(week);
                              if (day === 7) {
                                  day = 0;
                                  endTime.week(week + 1);
                                  startTime.week(week + 1);
                              }
                              endTime.day(day);
                              startTime.day(day);
                          }
                      });
                      return {
                          startTime: startTime,
                          endTime: endTime
                      };
                  };

                  scheduleItemEl.on('stopResize', function() {
                      console.log("stopResize called");
                      var newTime = vm.getTimeFromBoundaries();
                      $scope.item.beginning = newTime.startTime;
                      $scope.item.end = newTime.endTime;

                      //$scope.item.date = newTime.startTime;
                      $scope.item.startMoment = newTime.startTime;
                      $scope.item.endMoment = moment(newTime.endTime);

                      $scope.item.data.beginning = newTime.startTime;
                      $scope.item.data.end = newTime.endTime;
                      $scope.item.data.date = newTime.startTime;
                      $scope.item.data.startMoment = newTime.startTime;
                      $scope.item.data.endMoment = moment(newTime.endTime);

                      $scope.item.startTime = moment(newTime.startTime).format('HH:mm:ss');
                      $scope.item.endTime = moment(newTime.endTime).format('HH:mm:ss');

                      $scope.$emit('calendar.refreshItems');

                  });

                  scheduleItemEl.on('stopDrag', function() {
                      console.log("stopDrag called");
                      var newTime = vm.getTimeFromBoundaries();
                      console.log(newTime);
                      $scope.item.beginning = newTime.startTime;
                      $scope.item.end = newTime.endTime;

                      $scope.item.date = newTime.startTime;
                      $scope.item.startMoment = newTime.startTime;
                      $scope.item.endMoment = moment(newTime.endTime);

                      $scope.item.data.beginning = newTime.startTime;
                      $scope.item.data.end = newTime.endTime;
                      $scope.item.data.date = newTime.startTime;
                      $scope.item.data.startMoment = newTime.startTime;
                      $scope.item.data.endMoment = moment(newTime.endTime);

                      console.log($scope.item.data);

                      $scope.item.startTime = moment(newTime.startTime).format('HH:mm:ss');
                      console.log(moment(newTime.startTime).format('HH:mm:ss'));
                      $scope.item.endTime = moment(newTime.endTime).format('HH:mm:ss');

                      $timeout(function(){
                          $scope.$emit('calendar.refreshItems');
                      });

                  });


                },

                link: function(scope, element, attributes) {
                }
            };
        });


    });

})();
