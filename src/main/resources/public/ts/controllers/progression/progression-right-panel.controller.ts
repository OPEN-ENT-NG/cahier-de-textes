import { ng } from 'entcore';
import {ProgressionService} from "../../services/progression.service";

export const ProgressionRightPanelController = ng.controller('ProgressionRightPanelController',
    ['$scope', '$location', ($scope, $location) => {


        let vm = this;

        init();

        function init(){
            ProgressionService.getProgressions().then((progressions)=>{
                vm.progressionItems = progressions;
            });
        }

        vm.selectProgression = function(progression){
            vm.selected='detail' ;
            vm.progressionSelected=progression;
            vm.filterLesson = undefined;
            progression.lessonItems = null;
            ProgressionService.getLessonsProgression(progression.id).then((lessons) =>{
                progression.lessonItems = lessons;
            });
        };

        $scope.redirect = function (path) {
            $location.path(path);
        };

        vm.dragCondition = function (item) {
            return true;
        };

        vm.dropCondition = function (targetItem) {
            return false;
        };

        vm.drag = function(item, $originalEvent) {
            try {
                $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
            } catch (e) {
                $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
            }
        };

    }]);
