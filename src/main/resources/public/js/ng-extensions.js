var AngularExtensions = {
    addDirectives: function(module){
        module.directive('calendarDailyEvents', function(){
            return {
                scope: {
                    ngModel: '='
                },
                restrict: 'E',
                template: '<div class="days">' +
                    '<div class="day" ng-repeat="day in calendar.days.all">' +
                        '<div class="opener" ng-if="day.dailyEvents.length" ng-click="day.openDailyEvents = !day.openDailyEvents"><i18n>daily.event</i18n></div>' +
                        '<div class="daily-events" ng-class="{ show: day.openDailyEvents }">' +
                            '<div class="item [[dailyEvent.color]]" ng-repeat="dailyEvent in day.dailyEvents">' + 
                                '<container template="daily-event-details"></container>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
                link: function(scope, element, attributes){
                    scope.calendar = model.calendar;
                    
                    function placeTimeslots(){
                        setTimeout(function(){
                            var timeslots = $('.timeslots');
                            if(timeslots.length === 8 && timeslots.offset().top > 0){
                                timeslots.offset({ top: timeslots.offset().top + 40 });
                                $('.schedule .days').height(587);
                            }
                            else{
                                placeTimeslots();
                            }
                        }, 10);
                    }
                    
                    placeTimeslots();
                    
                    function setDaysContent() {
                        model.calendar.days.forEach(function (day) {
                            day.dailyEvents = [];
                        });
                        scope.ngModel.forEach(function(item){
                            var refDay = moment(model.calendar.dayForWeek).day(1);
                            model.calendar.days.forEach(function(day){
                                if(item.date.format('YYYY-MM-DD') === refDay.format('YYYY-MM-DD')){
                                    day.dailyEvents.push(item);
                                }
                                
                                refDay.add('day', 1);
                            });
                        });
                        
                        scope.calendar = model.calendar;
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