import { ng, model, idiom as lang, notify } from 'entcore';
import {ProgressionService} from "../../services/progression.service";

export const EditProgressionLessonController = ng.controller('EditProgressionLessonController',
    ['$scope', '$timeout', '$rootScope', '$routeParams', ($scope, $timeout, $rootScope, $routeParams) => {

            let vm = this;

            init();

            async function init() {

                if ($routeParams.progressionId) {
                    $scope.data.tabSelected = 'lesson';
                    vm.isProgressionLesson = true;

                    if ($routeParams.editProgressionLessonId!== 'new'){
                      loadLesson($routeParams.editProgressionLessonId);
                    }
                }
            }
            function loadLesson(lessonId){
                ProgressionService.getLessonProgression(lessonId).then((lesson)=>{
                
                    $scope.$parent.editLessonCtrl.lesson = lesson;
                });
            }

            vm.cancel = function() {
                $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
            };

            vm.saveLesson = function(lesson) {
                if (!lesson.progressionId){
                    lesson.progressionId = $routeParams.progressionId;
                }
                ProgressionService.saveLessonProgression(lesson).then((newLesson) => {
                    notify.info(lang.translate('progression.content.saved'));
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
    }]);
