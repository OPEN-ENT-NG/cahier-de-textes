import { ng, model, moment, notify, idiom as lang } from 'entcore';
import {SecureService} from "../../services/secure.service";
import {ModelWeekService} from "../../services/modelweek.service";
import {CONSTANTS} from "../../tools";

export const MainCalendarPageController = ng.controller('MainCalendarPageController', ['$scope', '$timeout', '$rootScope', '$location',
    ($scope, $timeout, $rootScope, $location) => {


        let vm = this;

        $timeout(init);
        function init(){
            $scope.getModel();
            vm.isUserParent = model.isUserParent();
            $scope.child = model.child;
            $scope.children = model.childs;
        }

        $scope.showCalendarForChild = function(childd){
            console.log("broadcast");
            $scope.children.forEach(function(theChild) {
                theChild.selected = (theChild.id === childd.id);
            });

            childd.selected = true;
            $scope.child = childd;
            model.child = childd;
            $rootScope.$broadcast('show-child',childd);
        }

        $scope.goToListView = function() {
            $location.path('/listView');
        };

        $scope.goToCalendarView = function() {
            $location.path('/calendarView/' + moment(model.mondayOfWeek).format(CONSTANTS.CAL_DATE_PATTERN));
        };


        $scope.setModel = function(alias) {
            ModelWeekService.setModelWeek(alias,model.mondayOfWeek).then((modelWeek) => {
                $scope.modelWeekCurrentWeek = alias;
                $scope.isModelWeek = true;
                $rootScope.$broadcast('calendar.refreshCalendar');
                $scope.getModel();
            });

            notify.info(lang.translate('diary.model.week.choice.effective') + " " + alias);

        };

        $scope.invert = function() {
            ModelWeekService.invertModelsWeek().then(() => {
                $rootScope.$broadcast('calendar.refreshCalendar');
                $scope.getModel();
            });
        };

        $scope.getModel = function(){
            if (SecureService.hasRight(CONSTANTS.RIGHTS.MANAGE_MODEL_WEEK)) {
                ModelWeekService.getModelWeeks().then((modelweeks)=>{
                    $scope.modelWeeks = modelweeks;
                });
            }
        };
    }]);
