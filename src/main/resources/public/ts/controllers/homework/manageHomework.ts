import { ng, _, model, moment, notify, idiom as lang } from 'entcore';
import {Subjects, Notification, Sessions} from '../../model';
import {Homework, HomeworkTypes} from '../../model/homework';

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$routeParams', '$location', '$attrs', function ($scope, $routeParams, $location, $attrs) {
        console.log("manageHomeworkCtrl");

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
                $scope.homework.id = $scope.$parent.homework.id;

                if(!$scope.homework.id){
                    $scope.homework.subject = $scope.$parent.session.subject;
                    $scope.homework.audience = $scope.$parent.session.audience;
                    $scope.homework.session = $scope.$parent.session;
                    $scope.attachedToSession.bool = true;
                }
            } else {
                $scope.homework.id = $routeParams.id ? $routeParams.id : undefined;
            }

            if ($scope.homework.id) {
                await $scope.homework.sync();
                await $scope.syncSessions();
                $scope.homework.session = $scope.sessions.all.find(s => s.id === $scope.homework.session_id);
                $scope.attachedToSession.bool = !!$scope.homework.session;
            }

            $scope.safeApply();
        }

        initData();

        $scope.syncSessions = async () => {
            console.log('SyncSessions');
            if($scope.homework.audience && $scope.homework.subject)
                await $scope.sessions.syncWithAudienceAndSubject(moment(), moment().add(7, 'day'), $scope.homework.audience.id, $scope.homework.subject.id);
        };

        $scope.cancelCreation = () => {
            if(!$scope.isInsideSessionForm) $scope.goTo('/');

            delete $scope.course;
        };

        $scope.isValidForm = () => {
            return $scope.homework
                && $scope.homework.structure
                && $scope.homework.subject
                && $scope.homework.audience
                && $scope.homework.dueDate
                && $scope.homework.title
                && $scope.homework.type;
        };

        $scope.publishHomework = async () => {
            $scope.saveHomework(true);
        };

        $scope.unpublishHomework = async () => {
            let {status} = await $scope.session.unpublish();
            if (status === 200) {
                $scope.notifications.push(new Notification(lang.translate('homework.manage.unpublished'), 'confirm'));
                $scope.safeApply();
                if(!$scope.isInsideSessionForm) $scope.goTo('/');
            }
        };

        $scope.deleteHomework= async () => {
            let {status} = await $scope.homework.delete();
            if (status === 201) {
                $scope.notifications.push(new Notification(lang.translate('homework.manage.delete'), 'confirm'));
                $scope.safeApply();
                if($scope.isInsideSessionForm){
                    $scope.$parent.localRemoveHomework($scope.homework);
                }
                if(!$scope.isInsideSessionForm) $scope.goTo('/');
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

                let {data, status} = await $scope.homework.save();
                if (status === 200 || status === 201) {
                    $scope.homework.id = data.id ? data.id : $scope.homework.id;
                    if($scope.isInsideSessionForm){
                        $scope.$parent.localSyncHomework($scope.homework, $scope.$parent.homework);
                    }
                    if (publish && ($scope.homework.id || (data && data.id))) {
                        let {status} = await $scope.homework.publish();
                        if (status === 200) {
                            $scope.notifications.push(new Notification(lang.translate('homework.manage.published'), 'confirm'));
                        }
                    }
                    else {
                        $scope.notifications.push(new Notification(lang.translate('homework.manage.confirm'), 'confirm'));
                    }
                }
                $scope.safeApply();
                if(!$scope.isInsideSessionForm) $scope.goTo('/');
            }
        };

    }]
);