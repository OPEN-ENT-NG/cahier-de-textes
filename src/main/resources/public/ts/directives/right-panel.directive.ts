import {ng} from 'entcore';

export const rightPanel = ng.directive('rightPanel', function () {
    return {
        restrict: "E",
        templateUrl: "/diary/public/template/progression/right-panel/right-panel.html",
        scope: {
            label : '@',
            contentUrl : '='
        },
        controller : function ($scope, $rootScope) {
            $rootScope.currentRightPanelVisible = undefined;
            let id = Date.now();
            var vm = this;
            $scope.panelVisible = false;

            // $('.mainDiaryContainer').width('84%');
            //$('.quick-search').width('16%');
            $scope.$watch(() => {
                return $rootScope.currentRightPanelVisible;
            }, (n) => {
                $scope.currentRightPanelVisible = n;
            });

            $scope.toggle = function (show) {
                if (show) {
                    $rootScope.currentRightPanelVisible = show;
                } else {
                    $rootScope.currentRightPanelVisible = undefined;
                }
            }
        }
    };
});
