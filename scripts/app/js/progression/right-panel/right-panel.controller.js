(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("RightPanelController", controller);

        function controller($scope,$rootScope) {
            let id = Date.now();

            $scope.panelVisible = false;

            $scope.toggle = function(){
                if (!$scope.panelVisible){
                    $scope.$parent.$$childTail.panelVisible = false;
                    $scope.$parent.$$childHead.panelVisible = false;
                    $rootScope.$broadcast('rightpanel.open',id);
                }
                $scope.panelVisible = !$scope.panelVisible;

                if ($scope.panelVisible) {
                    $('#mainDiaryContainer').width('84%');
                    $('.quick-search').width('16%');
                } else {
                    $('#mainDiaryContainer').width('97%');
                    $('.quick-search').width('2%');
                }
            };

            $scope.$on('rightpanel.open',function(_,rightpanelid){
                if (id !== rightpanelid && $scope.panelVisible){
                    $scope.toggle();
                }
            });
        }
    });


})();
