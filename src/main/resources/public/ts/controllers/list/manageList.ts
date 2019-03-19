import {Behaviours, model,moment, ng} from 'entcore';
import {Utils} from '../../utils/utils';
import {
    Course, Homework, Homeworks, Toast, PEDAGOGIC_TYPES, Session, Sessions, Structure, Structures,
    Workload
} from '../../model';

export let manageListCtrl = ng.controller('manageListController',
    ['$scope', 'route', '$location', '$timeout', '$compile', async function ($scope, route, $location, $timeout, $compile) {

        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        $scope.display.listView= true;
        $scope.indexItemsDisplayed = [];

        if ($scope.homeworks) {
            $scope.homeworks.syncHomeworks();
        }
        $scope.openHomework = (homeworkId: number) => {
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageHomework)) {
                $scope.goTo('/homework/update/' + homeworkId  );
            } else {
                $scope.goTo('/homework/view/' + homeworkId );
            }
        };

        $scope.displayDay = (pedagogicDay) =>{
            pedagogicDay.displayed = !pedagogicDay.displayed;
            $scope.safeApply();
        };

        $scope.filterHomeworkState = (homework) =>{
            let isInFilter = false;
            if($scope.display.homeworksFilter){
                if($scope.display.todo){
                    isInFilter =  isInFilter || !homework.isDone;
                }
                if($scope.display.done){
                    isInFilter = isInFilter ||  homework.isDone ;
                }
            }else{
                isInFilter = true;
            }
            return isInFilter;
        };


        $scope.isClickableByStudentOrParent = (pedagogicItem) => {
            if (Utils.isAChildOrAParent(model.me.type)){
                if(pedagogicItem.isPublished){
                    return pedagogicItem.pedagogicType === 2;
                }else{
                    return false;
                }
            }else{
                return pedagogicItem.pedagogicType === 2;
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
            $scope.goTo('/view');
            $scope.display.listView = false;
            if ($scope.display.listView) {
                $scope.display.sessions = true;
                $scope.display.homeworks = true ;
            }
        };

        $scope.containsOnlyCourses = (pedagogicDay) =>{
            let containsOnlyCourseBool = true;
            pedagogicDay.pedagogicItems.map(p => {
                if (p.pedagogicType === PEDAGOGIC_TYPES.TYPE_SESSION || p.pedagogicType === PEDAGOGIC_TYPES.TYPE_HOMEWORK){
                    containsOnlyCourseBool = false ;

                }
            })
            return containsOnlyCourseBool;
        }
        //check the display mod and if display session check the homeworks an the sessions which have homeworks
        $scope.displaySession = (displaySession,pedagogicItem) =>{
            if (displaySession)
                return pedagogicItem.pedagogicType === PEDAGOGIC_TYPES.TYPE_SESSION;
            else
                return pedagogicItem.pedagogicType === PEDAGOGIC_TYPES.TYPE_HOMEWORK || (pedagogicItem.homeworks && pedagogicItem.homeworks.length && pedagogicItem.homeworks.length > 0);
        };

        $scope.changeViewList = function () {
            $scope.goTo('/list');
            $scope.display.listView = true;
            if ($scope.display.listView) {
                $scope.display.sessions = true;
                $scope.display.homeworks = true ;
            }
        }

    }]);