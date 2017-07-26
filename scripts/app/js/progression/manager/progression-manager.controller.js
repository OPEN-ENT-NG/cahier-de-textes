(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("ProgressionManagerController", controller);

        function controller($scope, $rootScope,ProgressionService,$timeout,$routeParams) {
            let vm = this;
            function init(){
                vm.loadProgressions();
            }
            $timeout(init);

            vm.edit = function(){
                vm.originalProgressionItem = angular.copy(vm.selectedProgressionItem);
                vm.selectedProgressionItem.edit=true;
            };

            vm.resizePanel = function(){
                $timeout(()=>{
                    $('[diary-sortable-list]').css('height',($(window).outerHeight() - $('[diary-sortable-list]').offset().top - 50 ) +'px');
                });
            };

            vm.hasProgressItem = function(){
                return vm.selectedProgressionItem === undefined;
            };
            vm.cancel = function(){
                if (vm.selectedProgressionItem.id){
                    vm.selectedProgressionItem.title = vm.originalProgressionItem.title;
                    vm.selectedProgressionItem.level = vm.originalProgressionItem.level;
                    vm.selectedProgressionItem.description = vm.originalProgressionItem.description;
                    vm.originalProgressionItem=null;
                    vm.selectedProgressionItem.edit=false;
                }else{
                    vm.selectedProgressionItem=undefined;
                }
            };
            vm.setNewProgression = function(){
                vm.selectedProgressionItem = {
                    edit : true
                };
            };

            vm.selectProgression = function(progressionItem){
                $rootScope.redirect('/progressionManagerView/'+progressionItem.id );
                vm.selectedProgressionItem=progressionItem;
                progressionItem.edit=false;
                vm.loadLessonsFromProgression(vm.selectedProgressionItem);
            };

            vm.addNewLesson = function(){
              $rootScope.redirect('/progressionEditLesson/'+vm.selectedProgressionItem.id+'/new' );
            };

            vm.editLesson = function(id){
                $rootScope.redirect('/progressionEditLesson/'+vm.selectedProgressionItem.id+'/'+id );
            };



            vm.loadProgressions = function(){
                ProgressionService.getProgressions().then((progressions)=>{
                    vm.progressionItems = progressions;
                    if ($routeParams.selectedProgressionId !== 'none'){
                        let progressionToLoad = _.findWhere(vm.progressionItems,{id :parseInt($routeParams.selectedProgressionId)});
                        if (progressionToLoad){
                            vm.selectProgression(progressionToLoad);
                        }
                    }
                });
            };

            vm.loadLessonsFromProgression = function(progression){
                progression.lessonItems = null;
                ProgressionService.getLessonsProgression(progression.id).then((lessons) =>{
                    progression.lessonItems = lessons;
                });
            };

            vm.saveLesson = function(lesson){
                ProgressionService.saveLessonProgression(lesson).then((newLesson)=>{
                    lesson.id = newLesson.id;
                    notify.info(lang.translate('progression.content.saved'));
                });
            };

            vm.selectedContent = function(){
                return _.filter(vm.selectedProgressionItem.lessonItems,{'selected' : true});
            };


            vm.saveProgression = function(progression){
                ProgressionService.saveProgression(progression).then((newProgression)=>{
                    if (!progression.id){
                        vm.progressionItems.push(newProgression);
                    }else{
                        let oldProgressionItems=_.findWhere(vm.progressionItems,{'id':newProgression.id});
                        if (oldProgressionItems){
                            vm.progressionItems[vm.progressionItems.indexOf(oldProgressionItems)] = newProgression;
                        }
                    }
                    vm.selectedProgressionItem = newProgression;
                    notify.info(lang.translate('progression.progression.saved'));
                });
            };

            vm.saveOrder = function(progression){
                ProgressionService.saveLessonOrder(progression);
            };

            vm.removeSelectedContent = function(){
                ProgressionService.deleteLessons(vm.selectedContent()).then(()=>{
                    vm.loadLessonsFromProgression(vm.selectedProgressionItem);
                    notify.info(lang.translate('progression.content.deleted'));
                });
            };

            vm.removeProgression = function(){
                ProgressionService.deleteProgression(vm.selectedProgressionItem.id).then(()=>{
                    vm.selectedProgressionItem=undefined;
                    notify.info(lang.translate('progression.progression.deleted'));
                    vm.loadProgressions();
                });
            };

            vm.editSelectedContent = function(){
                vm.editLesson(vm.selectedContent()[0].id);
            };
        }
    });
})();
