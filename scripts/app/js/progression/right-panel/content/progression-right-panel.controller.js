(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("ProgressionRightPanelController", controller);

        function controller($scope,$location) {
          let vm = this;
          vm.array = [1,2,3,4,5,6,7,8,9,10];

          $scope.redirect = function (path) {
                $location.path(path);
            };
        }
    });


})();
