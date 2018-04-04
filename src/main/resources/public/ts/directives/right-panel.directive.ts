import {ng} from 'entcore';

export const rightPanel = ng.directive('rightPanel', function () {
    return {
        restrict: "E",
        templateUrl: "/diary/public/template/progression/right-panel/right-panel.html",
        scope: {
            label : '@',
            contentUrl : '='
        },
        controller: 'RightPanelController'
    };
});
