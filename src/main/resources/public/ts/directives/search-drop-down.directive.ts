import {ng, angular} from 'entcore';

export const searchDropDown = ng.directive('searchDropDown', function () {
    return {
        restrict: "E",
        templateUrl: "/diary/public/template/directives/search-drop-down/search-drop-down.template.html",
        scope: {
            items: '=',
            showExpression : '@',
            selectedItem: '=',
            placeHolder : '@',
            freeField : '='
        },
        controller: 'SearchDropDownController'


    };
});



