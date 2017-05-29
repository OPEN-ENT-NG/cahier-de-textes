(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("EditProgressionLessonController", controller);

        function controller($scope, $routeParams,constants,$rootScope) {
            let vm  = this;
            console.log("initForProgressionLesson");
            $scope.data.tabSelected = 'lesson';
            vm.isProgressionLesson = true;


            vm.cancel = function(){
              $rootScope.redirect('/progressionManagerView/'+$routeParams.progressionId);
            };
        }
    });

})();
