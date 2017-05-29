(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("EditProgressionLessonController", controller);

        function controller($scope, $routeParams, constants, $rootScope, ProgressionService) {
            let vm = this;

            init();

            function init() {
                console.log("initForProgressionLesson");
                if ($routeParams.progressionId) {
                    $scope.data.tabSelected = 'lesson';
                    vm.isProgressionLesson = true;
                }
            }

            vm.cancel = function() {
                $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
            };

            vm.saveLesson = function(lesson) {
                if (!lesson.progressionId){
                    lesson.progressionId = $routeParams.progressionId;
                }
                ProgressionService.saveLessonProgression(lesson).then((newLesson) => {
                    lesson.id = newLesson.id;
                    $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
                });
            };

            vm.addHomework = function(lesson){
                if (!lesson.homeworks ){
                    lesson.homeworks=[];
                }
                let homework = model.initHomework();
                lesson.homeworks.push(homework);
            };

            vm.loadLesson = function(lessonId){

            };
        }
    });

})();
