import { ng, _, model, moment, notify, idiom as lang } from 'entcore';
import {Subjects, Notification, Sessions} from '../../model';
import {Homework, HomeworkTypes, WorkloadWeek} from '../../model/homework';

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$routeParams', '$location', '$attrs', function ($scope, $routeParams, $location, $attrs) {

        $scope.isReadOnly = modeIsReadOnly();

        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view');
        }

        $scope.homework = new Homework($scope.structure);
        $scope.sessions = new Sessions($scope.structure);
        $scope.subjects = new Subjects();
        $scope.homeworkTypes = new HomeworkTypes();
        $scope.isInsideSessionForm = false;

        async function initData(){
            await Promise.all([
                $scope.homeworkTypes.sync(),
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);

            if($attrs.insideSessionForm){
                $scope.isInsideSessionForm = true;
                $scope.homework = $scope.$parent.homework;
                if($scope.homework.id){
                    await $scope.homework.sync();
                    await $scope.syncSessions();
                } else {
                    await $scope.syncSessions();
                }
                $scope.attachToParentSession();
            } else {
                $scope.homework.id = $routeParams.id ? $routeParams.id : undefined;
                if($scope.homework.id){
                    await $scope.homework.sync();
                    await $scope.syncSessions();
                    if ($scope.homework.session) {
                        $scope.attachToOtherSession();
                    } else {
                        $scope.attachToDate();
                    }
                } else {
                    $scope.attachToDate();
                }
            }

            // if new homework, we set the default homeworkType
            if(!$scope.homework.id) {
                $scope.homework.type = $scope.homeworkTypes.all.find(ht => ht.is_default);
            }

            await $scope.syncWorkloadWeek();

            $scope.safeApply();
        }

        $scope.syncWorkloadWeek = async () => {
            if($scope.homework.audience) {
                let dateInWeek = $scope.homework.attachedToDate ? $scope.homework.dueDate : $scope.homework.session.startMoment;
                $scope.homework.workloadWeek = new WorkloadWeek($scope.homework.audience);
                await $scope.homework.workloadWeek.sync(dateInWeek);
                $scope.safeApply();
            }
        };

        initData();

        $scope.syncSessions = async () => {
            if($scope.homework.audience && $scope.homework.subject && !$scope.isReadOnly)
                await $scope.sessions.syncOwnSessions(moment(), moment().add(7, 'day'), $scope.homework.audience.id, $scope.homework.subject.id);
        };

        $scope.attachToParentSession = () => {
            $scope.homework.attachedToOtherSession = false;
            $scope.homework.attachedToParentSession = true;
            $scope.homework.attachedToDate = false;

            $scope.homework.session = $scope.$parent.session;
            $scope.safeApply();
        };

        $scope.attachToOtherSession = () => {
            $scope.homework.attachedToOtherSession = true;
            $scope.homework.attachedToParentSession = false;
            $scope.homework.attachedToDate = false;

            $scope.homework.session = undefined;
            $scope.safeApply();
        };

        $scope.attachToDate = () => {
            $scope.homework.attachedToOtherSession = false;
            $scope.homework.attachedToParentSession = false;
            $scope.homework.attachedToDate = true;

            $scope.homework.session = undefined;
            $scope.safeApply();
        };

        $scope.cancelCreation = async () => {
            if (!$scope.isInsideSessionForm) {
                $scope.goTo('/');
            } else {
                $scope.homework.opened = false;

                // Si c'est insideSessionForm et create, on retire le homework de la session
                if(!$scope.homework.id){
                    $scope.$parent.localRemoveHomework($scope.$parent.homework);
                } else {
                    // Si c'est insideSessionForm et update, on resync le homework
                    await $scope.homework.sync();
                    $scope.attachToParentSession();
                    $scope.safeApply();
                }
            }
        };

        $scope.isValidForm = () => {
            return $scope.homework.isValidForm();
        };

        $scope.publishHomework = async () => {
            $scope.saveHomework(true);
        };

        $scope.unpublishHomework = async () => {
            let { succeed } = $scope.toastHttpCall(await $scope.homework.unpublish());
            if (succeed && !$scope.isInsideSessionForm) {
                $scope.goTo('/');
            }
        };

        $scope.deleteHomework= async () => {
            let { succeed } = $scope.toastHttpCall(await $scope.homework.delete());
            if(succeed) {
                if($scope.isInsideSessionForm){
                    $scope.$parent.localRemoveHomework($scope.homework);
                } else {
                    $scope.goTo('/');
                }
            }
        };

        $scope.saveHomework = async (publish = false) => {
            if (!$scope.isValidForm) {
                $scope.notifications.push(new Notification(lang.translate('utils.unvalidForm')), 'error');
            }
            else {
                let homeworkSaveResponse = await $scope.homework.save();

                if (homeworkSaveResponse.succeed) {
                    if(!$scope.homework.id && homeworkSaveResponse.data.id) {
                        $scope.homework.id = homeworkSaveResponse.data.id;
                    } else if (!$scope.homework.id && !homeworkSaveResponse.data.id){
                        $scope.notifications.push(new Notification('Error no id for homework'), 'error');
                        return;
                    }

                    if(publish){
                        let {succeed} = $scope.toastHttpCall(await $scope.homework.publish());
                        if(succeed){
                            $scope.homework.isPublished = true;
                        }
                    } else {
                        $scope.toastHttpCall(homeworkSaveResponse);
                    }
                }

                $scope.safeApply();
                if(!$scope.isInsideSessionForm) $scope.goTo('/');
            }
        };

    }]
);