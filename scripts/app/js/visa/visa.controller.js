(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("VisaManagerController", controller);

        function controller($scope, $rootScope,$routeParams,$timeout) {
            let vm = this;
            console.log("visa ctrl");
            vm.items = [{name : 'teacher1'},{name : 'teacher2'}];
        }
    });


})();
