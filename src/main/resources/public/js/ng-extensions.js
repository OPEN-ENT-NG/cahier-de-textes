var AngularExtensions = {
    addDirectives: function(module){
        module.directive('calendarDailyEvents', function(){
            return {
                scope: {
                    ngModel: '='
                },
                restrict: 'E',
                // ng-controller="DiaryController"
                template: '<div class="days" style="z-index: 1000;">' +
                    '<div class="day" ng-repeat="day in calendar.days.all" style="height: 120px;">' +
                        // <= 3 homeworks for current day
                        '<div class="test" ng-if="day.dailyEvents.length && day.dailyEvents.length <= 3">' +
                            '<div ng-repeat="dailyEvent in day.dailyEvents">' +
                            '<container template="daily-event-item" style="padding-bottom: 1px;"></container>' +
                            '</div>' +
                        '</div>' +
                        // > 3 homeworks for current day
                        '<div class="opener" ng-if="day.dailyEvents.length && day.dailyEvents.length > 3" ' +
                            'ng-click="day.openDailyEvents = !day.openDailyEvents">' +
                            '<i18n>daily.event</i18n>' +
                        '</div>' +
                        '<div class="test daily-events" style="z-index: 1000;" ng-click="day.openDailyEvents = !day.openDailyEvents" ng-class="{ show: day.openDailyEvents && day.dailyEvents.length > 3 }">' +
                            '<div ng-repeat="dailyEvent in day.dailyEvents">' +
                            '<container template="daily-event-item" style="padding-bottom: 1px;"></container>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
                link: function(scope, element, attributes){
                    scope.calendar = model.calendar;

                    /**
                     * Create the homeworks area in calendar view
                     * @param timeslots Elements with 'timeslot' css class (hour legend tag + 7 day slots)
                     */
                    model.placeTimeslots = function (timeslots) {

                        var show = model.showHomeworkPanel;

                        if (typeof model.initialTimeSlotsOffset === 'undefined') {
                            model.initialTimeSlotsOffset = timeslots.offset().top;
                        }

                        // used to display homeworks in calendar view
                        const OFFSET = 120;
                        var extraTimeSlotsOffset = 0;
                        var currentTimeSlotsOffset = (typeof timeslots.offset() === 'undefined') ? 0 : timeslots.offset().top;

                        // tricky way to not apply extra offset twice
                        if (show && ((currentTimeSlotsOffset < model.initialTimeSlotsOffset + OFFSET) && timeslots.offset().top > 0)) {
                            extraTimeSlotsOffset = OFFSET;
                        }
                        // only reverse offset if homework panel is unfolded
                        else if (!show && (model.initialTimeSlotsOffset != currentTimeSlotsOffset)) {
                            extraTimeSlotsOffset = -OFFSET;
                        }

                        if (extraTimeSlotsOffset != 0) {
                            timeslots.offset({top: timeslots.offset().top + extraTimeSlotsOffset});

                            // apply same offset to the next hours bar in calendar view
                            var nextTimeSlots = $('.next-timeslots');
                            nextTimeSlots.offset({top: nextTimeSlots.offset().top + extraTimeSlotsOffset});
                        }

                        $('.schedule-item').css("margin-top", show ? OFFSET : 0);
                        $('.schedule .days').height(587 + (show ? OFFSET : 0))
                    }

                    
                    function setDaysContent() {

                        model.calendar.days.forEach(function (day) {
                            day.dailyEvents = [];
                        });
                        scope.ngModel.forEach(function(item){
                            var refDay = moment(model.calendar.dayForWeek).day(1);
                            model.calendar.days.forEach(function(day){
                                if(item.dueDate && item.dueDate.format('YYYY-MM-DD') === refDay.format('YYYY-MM-DD')){
                                    day.dailyEvents.push(item);
                                }
                                
                                refDay.add('day', 1);
                            });
                        });
                        
                        scope.calendar = model.calendar;

                        var timeslots = $('.timeslots');

                        if (timeslots.length === 8) {
                            model.placeTimeslots(timeslots);
                        }
                        // if days timeslots are not yet positioned
                        // wait until they are to create the homework panel
                        else {
                            var timerOccurences = 0;
                            var timer = setInterval(
                                function () {
                                    timeslots = $('.timeslots');
                                    if (timeslots.length === 8) {
                                        clearInterval(timer);
                                        model.placeTimeslots(timeslots);
                                    }
                                    timerOccurences++;
                                    // 5s should be far than enough to have all timeslots loaded
                                    if (timerOccurences > 50) {
                                        clearInterval(timer);
                                    }
                                }, 100);
                        }
                    }
                    
                    model.on('calendar.date-change', function(){
                        setDaysContent();
                        scope.$apply();
                    });
                    
                    scope.$watchCollection('ngModel', function(newVal){
                        setDaysContent()
                    });
                    
                    $('body').on('click', function(e){
                        if(e.target !== element[0] && element.find(e.target).length === 0){
                            model.calendar.days.forEach(function(day){
                                day.openDailyEvents = false;
                            });
                            scope.$apply();
                        }
                    });
                }
            }    
        });

        module.directive('timePicker', function () {
            return {
                scope: {
                    ngModel: '=',
                    ngChange: '&'
                },
                transclude: true,
                replace: true,
                restrict: 'E',
                template: "<input type='text' />",
                link: function (scope, element, attributes) {
                    var hideFunction = function (e) {
                        var timepicker = element.data('timepicker');
                        if (!timepicker || element[0] === e.target || $('.bootstrap-timepicker-widget').find(e.target).length !== 0) {
                            return;
                        }
                        timepicker.hideWidget();
                    };
                    $('body, lightbox').on('click', hideFunction);
                    $('body, lightbox').on('focusin', hideFunction);
                    if (!$.fn.timepicker) {
                        $.fn.timepicker = function () { };
                        loader.asyncLoad('/' + infraPrefix + '/public/js/bootstrap-timepicker.js', function () {
                            // does not seem to work properly
                            element.timepicker({
                                showMeridian: false,
                                defaultTime: 'current'
                            });
                        });
                    }

                    scope.$watch('ngModel', function (newVal) {
                        if (!newVal) {
                            return;
                        }
                        element.val(newVal.format("HH:mm"));
                    });

                    element.on('focus', function () {
                        element.timepicker({
                            showMeridian: false,
                            defaultTime: 'current',
                            minuteStep: 5
                        });
                    });

                    element.on('change', function () {
                        var time = element.val().split(':');
                        if(scope.ngModel && scope.ngModel.hour){
                            scope.ngModel.set('hour', time[0]);
                            scope.ngModel.set('minute', time[1]);
                            scope.$apply('ngModel');
                            scope.$parent.$eval(scope.ngChange);
                            scope.$parent.$apply();
                        }
                    });

                    element.on('show.timepicker', function () {
                        element.parents().find('lightbox').on('click.timepicker', function (e) {
                            if (!(element.parent().find(e.target).length ||
                                timepicker.$widget.is(e.target) ||
                                timepicker.$widget.find(e.target).length)) {
                                timepicker.hideWidget();
                            }
                        });
                    });
                }
            }
        });

    },
    init: function (module) {
        this.addDirectives(module);
    }
}