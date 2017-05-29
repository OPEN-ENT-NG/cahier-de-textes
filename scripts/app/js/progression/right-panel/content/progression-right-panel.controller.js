(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("ProgressionRightPanelController", controller);

        function controller($scope,$location) {
          let vm = this;
          
          $scope.redirect = function (path) {
                $location.path(path);
            };
        }
    });


})();
