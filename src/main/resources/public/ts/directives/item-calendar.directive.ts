import {ng} from 'entcore';
export const itemCalendar = ng.directive('itemCalendar', function () {
    return {
        restrict : 'E',
        templateUrl : '/diary/public/template/directives/item-calendar/item-calendar.template.html'
    };
});

