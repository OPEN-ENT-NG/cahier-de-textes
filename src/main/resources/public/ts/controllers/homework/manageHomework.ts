import { ng, _, model, moment, notify, idiom as lang } from 'entcore';
import {Subjects, Notification, Sessions} from '../../model';
import {Homework, HomeworkTypes} from '../../model/homework';
import {Mix} from 'entcore-toolkit';

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$routeParams', '$location', '$attrs', function ($scope, $routeParams, $location, $attrs) {

        $scope.homework = new Homework($scope.structure);
        $scope.sessions = new Sessions($scope.structure);
        $scope.subjects = new Subjects();
        $scope.homeworkTypes = new HomeworkTypes();
        $scope.isInsideSessionForm = false;
        $scope.attachedToSession = {bool: true};

        async function initData(){
            await Promise.all([
                $scope.homeworkTypes.sync(),
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);


            if($attrs.insideSessionForm){
                // Si c'est une création, alors on ajoute les données parents
                $scope.isInsideSessionForm = true;
                //$scope.homework.id = $scope.$parent.homework.id;
                $scope.homework = $scope.$parent.homework;
                //$scope.homework.session = $scope.$parent.session;

                if(!$scope.homework.id){
                    // $scope.homework.subject = $scope.$parent.session.subject;
                    // $scope.homework.audience = $scope.$parent.session.audience;
                    $scope.attachedToSession.bool = true;
                }
            } else {
                $scope.homework.id = $routeParams.id ? $routeParams.id : undefined;
            }

            if ($scope.homework.id) {
                await syncHomework();
            }

            $scope.safeApply();
        }

        async function syncHomework() {
            await $scope.homework.sync();
            await $scope.syncSessions();
            $scope.homework.session = $scope.sessions.all.find(s => s.id === $scope.homework.session_id);
            $scope.attachedToSession.bool = !!$scope.homework.session;
        }

        initData();

        $scope.syncSessions = async () => {
            if($scope.homework.audience && $scope.homework.subject)
                await $scope.sessions.syncWithAudienceAndSubject(moment(), moment().add(7, 'day'), $scope.homework.audience.id, $scope.homework.subject.id);
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
                    await syncHomework();
                    $scope.safeApply();
                }


            }
        };

        $scope.isValidForm = () => {
            let validSessionOrDueDate = $scope.attachedToSession.bool ? !!$scope.homework.session : !!$scope.homework.dueDate;
            return $scope.homework
                && $scope.homework.structure
                && $scope.homework.subject
                && $scope.homework.audience
                && validSessionOrDueDate
                && $scope.homework.title
                && $scope.homework.type;
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
                if(!$scope.attachedToSession.bool) {
                    $scope.homework.session = undefined;
                }

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
                            $scope.homework.state = 'published';
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