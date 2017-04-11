(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){


		module.directive('diaryCalendar', function($compile) {
		    return {
		        restrict: 'E',
						templateUrl: '/diary/public/js/directives/calendar/calendar.template.html',
						scope : {
							items : '=',
							itemTemplate : '@',
							readOnly : '=',
							displayTemplate : '=',
							onCreateOpenAction :  '&'
						},
 
		        controller: 'DiaryCalendarController',
						controllerAs:"DiaryCalendarCtrl",
								/*
		            var refreshCalendar = function() {
		                model.calendar.clearScheduleItems();

		                $scope.items = _.where(_.map($scope.items, function(item) {
		                    item.beginning = item.startMoment;
		                    item.end = item.endMoment;
		                    return item;
		                }), {
		                    is_periodic: false
		                });

		                model.calendar.addScheduleItems($scope.items);
		                $scope.calendar = model.calendar;
		                $scope.moment = moment;
		                $scope.display.editItem = false;
		                $scope.display.createItem = false;

		                $scope.editItem = function(item) {
		                    $scope.calendarEditItem = item;
		                    $scope.display.editItem = true;
		                };

		                $scope.createItem = function(day, timeslot) {
		                    $scope.newItem = {};
		                    var year = model.calendar.year;
		                    if (day.index < model.calendar.firstDay.dayOfYear()) {
		                        year++;
		                    }
		                    $scope.newItem.beginning = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.start);
		                    $scope.newItem.end = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.end);
		                    model.calendar.newItem = $scope.newItem;
		                    $scope.onCreateOpen();
		                };

		                $scope.closeCreateWindow = function() {
		                    $scope.display.createItem = false;
		                    $scope.onCreateClose();
		                };

		                $scope.updateCalendarWeek = function() {
		                    //annoying new year workaround
		                    if (moment(model.calendar.dayForWeek).week() === 1 && moment(model.calendar.dayForWeek).dayOfYear() > 7) {
		                        model.calendar = new calendar.Calendar({
		                            week: moment(model.calendar.dayForWeek).week(),
		                            year: moment(model.calendar.dayForWeek).year() + 1
		                        });
		                    } else if (moment(model.calendar.dayForWeek).week() === 53 && moment(model.calendar.dayForWeek).dayOfYear() < 7) {
		                        model.calendar = new calendar.Calendar({
		                            week: moment(model.calendar.dayForWeek).week(),
		                            year: moment(model.calendar.dayForWeek).year() - 1
		                        });
		                    } else {
		                        model.calendar = new calendar.Calendar({
		                            week: moment(model.calendar.dayForWeek).week(),
		                            year: moment(model.calendar.dayForWeek).year()
		                        });
		                    }
		                    model.trigger('calendar.date-change');
		                    refreshCalendar();
		                };

		                $scope.previousTimeslots = function() {
		                    calendar.startOfDay--;
		                    calendar.endOfDay--;
		                    model.calendar = new calendar.Calendar({
		                        week: moment(model.calendar.dayForWeek).week(),
		                        year: moment(model.calendar.dayForWeek).year()
		                    });
		                    refreshCalendar();
		                };

		                $scope.nextTimeslots = function() {
		                    calendar.startOfDay++;
		                    calendar.endOfDay++;
		                    model.calendar = new calendar.Calendar({
		                        week: moment(model.calendar.dayForWeek).week(),
		                        year: moment(model.calendar.dayForWeek).year()
		                    });
		                    refreshCalendar();
		                };
		            };

		            calendar.setCalendar = function(cal) {
		                model.calendar = cal;

		                refreshCalendar();
		            };

		            $timeout(function() {
		                refreshCalendar();
		                $scope.$watchCollection('items', refreshCalendar);
		            }, 0);
		            $scope.refreshCalendar = refreshCalendar;
								*/
		        link: function(scope, element, attributes) {
							/*
		            var allowCreate;
		            scope.display = {};
		            scope.display.readonly = false;
		            attributes.$observe('createTemplate', function() {
		                if (attributes.createTemplate) {
		                    template.open('schedule-create-template', attributes.createTemplate);
		                    allowCreate = true;
		                }
		                if (attributes.displayTemplate) {
		                    template.open('schedule-display-template', attributes.displayTemplate);
		                }
		            });
		            attributes.$observe('readonly', function(){
		                if(attributes.readonly && attributes.readonly !== 'false'){
		                    scope.display.readonly = true;
		                }
		                if(attributes.readonly && attributes.readonly == 'false'){
		                    scope.display.readonly = false;
		                }
		            });

		            scope.items = scope.$eval(attributes.items);
		            scope.onCreateOpen = function() {
		                if (!allowCreate) {
		                    return;
		                }
		                scope.$eval(attributes.onCreateOpen);
		                scope.display.createItem = true;
		            };
		            scope.onCreateClose = function() {
		                scope.$eval(attributes.onCreateClose);
		            };
		            scope.$watch(function() {
		                return scope.$eval(attributes.items)
		            }, function(newVal) {
		                scope.items = newVal;
		            });
								*/
		        }
		    };
		});

	});

})();
