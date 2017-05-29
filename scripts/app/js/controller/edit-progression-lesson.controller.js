(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("EditProgressionLessonController", controller);

        function controller($scope, $routeParams,constants,$rootScope) {
            let vm  = this;

            init();
            function init(){
              console.log("initForProgressionLesson");
              if ($routeParams.progressionId){
                $scope.data.tabSelected = 'lesson';
                vm.isProgressionLesson = true;
              }
            }

            vm.cancel = function(){
              $rootScope.redirect('/progressionManagerView/'+$routeParams.progressionId);
            };
        }
    });

})();
