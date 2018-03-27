import { angular, ng, model } from 'entcore';


export const calendarDailyEvents = ng.directive('calendarDailyEvents', function () {
    return {
        scope: {
            ngModel: '=',
            bShowCalendar : '=',
            bShowHomeworks : '=',
            bShowHomeworksMinified : '='
        },
        restrict: 'E',
        templateUrl: '/diary/public/template/directives/calendar-daily-events/calendar-daily-events.template.html',
        controller: 'CalendarDailyEventsController',

        link: function(scope, element, attributes) {

            $('body').on('click', function(e) {
                if (e.target !== element[0] && element.find(e.target).length === 0) {
                    model.calendar.days.forEach(function(day) {
                        day.openDailyEvents = false;
                    });
                    scope.$apply();
                }
            });
        }
    };
});
