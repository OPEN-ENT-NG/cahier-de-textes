import {ng, module, model} from 'entcore';

export const RightPanelController = ng.controller('RightPanelController',
    ['$scope', '$rootScope', ($scope, $rootScope) => {
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
    }]);