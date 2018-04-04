import { ng } from 'entcore';


export const diaryMultiCalendarFilter = ng.directive('diaryMultiCalendarFilter', function () {
    return {
        restrict: "E",
        templateUrl: "/diary/public/template/directives/diary-multi-calendar-filter/diary-multi-calendar-filter.template.html",
        scope: {
            structure: '=',
            audience: '=',
            teacher: '='
        },
        controller: 'diaryMultiCalendarFilterController as diaryMultiCalendarFilterCtrl'
    };
});