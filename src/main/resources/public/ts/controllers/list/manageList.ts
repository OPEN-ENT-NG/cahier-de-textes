import {Behaviours, model, ng} from 'entcore';
import {Utils} from '../../utils/utils';

export let manageListCtrl = ng.controller('manageListController',
    ['$scope', 'route', '$location', '$timeout', '$compile', async function ($scope, route, $location, $timeout, $compile) {

        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        $scope.display.listView= true;
        if ($scope.homeworks) {
            $scope.homeworks.syncHomeworks();
        }
        $scope.openHomework = (homeworkId: number) => {
            console.log('open HW list');
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageHomework)) {
                $scope.goTo('/homework/update/' + homeworkId  );
            } else {
                $scope.goTo('/homework/view/' + homeworkId );
            }
        };
        $scope.openSession = (sessionId: number) => {
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession)) {
                $scope.goTo('/session/update/' + sessionId);
            } else {
                $scope.goTo('/session/view/' + sessionId);
            }
            $scope.safeApply();
        };

        $scope.openSessionFromCourse = (calendar_course) => {
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession)) {
                $scope.goTo('/session/create/' + calendar_course._id + '/' + Utils.getFormattedDate(calendar_course.startMoment));
            }
            $scope.safeApply();
        };

        $scope.changeViewCalendar = function () {
            $scope.goTo('/');
            $scope.display.listView = false
            if ($scope.display.listView) {
                $scope.display.sessions = true;
                $scope.display.homeworks = true ;
            }
        }


        $scope.changeViewList = function () {
            $scope.goTo('/list');
            $scope.display.listView = true
            if ($scope.display.listView) {
                $scope.display.sessions = true;
                $scope.display.homeworks = true ;
            }
        }

    }]);