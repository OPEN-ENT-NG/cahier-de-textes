import { ng, _, model, moment, Behaviours, notify, idiom as lang } from 'entcore';
import { Subjects, Notification } from '../../model';
import {Session} from "../../model";
import {Visa} from '../../model/visa';
import {Homework} from '../../model/homework';

export let manageSessionCtrl = ng.controller('manageSessionCtrl',
    ['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
        console.log("manageSessionCtrl");
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;

        $scope.isReadOnly = modeIsReadOnly();

        function modeIsReadOnly() {
            let currentPath = $location.path();
            return currentPath.includes('view');
        }

        $scope.session = new Session($scope.structure);
        $scope.subjects = new Subjects();
        $scope.session.teacher = {id: model.me.userId};

        async function initData() {
            await Promise.all([
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);

            if ($routeParams.id) {
                $scope.session.id = $routeParams.id;
                await $scope.session.sync($scope.structure);
            }
            $scope.safeApply();
        }

        initData();

        $scope.cancelCreation = () => {
            $scope.goTo('/');
            delete $scope.course;
        };

        $scope.hasManageVisaRight = () => {
            return model.me.hasWorkflow(WORKFLOW_RIGHTS.manageVisa);
        };

        $scope.isValidForm = () => {
            return $scope.session
                && $scope.session.subject
                && $scope.session.audience
                && $scope.session.title
                && $scope.session.date
                && $scope.session.startTime
                && $scope.session.endTime;
        };

        $scope.visaForm = {};

        $scope.startCreatingVisa = () => {
            $scope.visaForm.visa = new Visa($scope.structure);
            $scope.visaForm.visa.session_id = $scope.session.id;

            $scope.visaForm.visa.comment = '';
            $scope.safeApply();
        };

        $scope.startUpdatingVisa = async (visa: Visa) => {
            visa.isBeingUpdated = true;
            $scope.visaForm.visa = _.clone(visa);
            $scope.safeApply();
        };

        $scope.saveVisa = async () => {
            let { status } = await $scope.visaForm.visa.save();
            if (status === 200) {
                let notificationText = $scope.visaForm.visa.id ? 'visa.updated' : 'visa.created';

                $scope.visaForm.visa = undefined;
                await $scope.session.sync();
                $scope.notifications.push(new Notification(lang.translate(notificationText), 'confirm'));

                $scope.safeApply();
            }
        };

        $scope.cancelVisaCreateOrUpdate = async () => {
            $scope.session.visas.forEach(v => v.isBeingUpdated = false);
            $scope.visaForm.visa = undefined;
        };

        $scope.deleteVisa = async (visa: Visa) => {
            let { status } = await visa.delete();
            if (status === 200) {
                await $scope.session.sync();
                $scope.notifications.push(new Notification(lang.translate('visa.deleted'), 'confirm'));
                $scope.safeApply();
            }
        };

        $scope.addHomework = () => {
            let newHomework = new Homework($scope.structure);
            newHomework.audience = $scope.session.audience;
            newHomework.subject = $scope.session.subject;

            $scope.session.homeworks.push(newHomework);
            $scope.safeApply();
        };

        $scope.publishSession = async () => {
            $scope.saveSession(true);
        };

        $scope.unpublishSession = async () => {
            let {status} = await $scope.session.unpublish();
            if (status === 200) {
                $scope.notifications.push(new Notification(lang.translate('session.manage.unpublished'), 'confirm'));
                $scope.safeApply();
                $scope.goTo('/');
            }
        };
        
        $scope.deleteSession = async () => {
            let {status} = await $scope.session.delete();
            if (status === 201) {
                $scope.notifications.push(new Notification(lang.translate('session.manage.delete'), 'confirm'));
                $scope.safeApply();
                $scope.goTo('/');
            }
        };

        $scope.localSyncHomework = (homework: Homework, originalHomework: Homework) => {
            console.log('Local Sync');
            let foundIndex = $scope.session.homeworks.findIndex(x => x.id == homework.id);
            if(foundIndex === -1) {
                $scope.session.homeworks.push(homework);
                $scope.session.homeworks = $scope.session.homeworks.filter(item =>  item !== originalHomework);
            } else {
                $scope.session.homeworks[foundIndex] = homework;
            }

            $scope.session.openedHomework = -1;
            $scope.safeApply();
        };

        $scope.localRemoveHomework = (deletedHomework: Homework) => {
            console.log('localRemoveHomework');
            $scope.session.homeworks = $scope.session.homeworks.filter(item =>  item.id !== deletedHomework.id);
            $scope.session.openedHomework = -1;
            $scope.safeApply();
        };

        $scope.saveSession = async (publish = false) => {
            if(!$scope.isValidForm){
                $scope.notifications.push(new Notification(lang.translate('utils.unvalidForm')), 'error');
            }
            else {
                let {data, status} = await $scope.session.save();
                if (status === 200 || status === 201) {
                    if (publish && ($scope.session.id || (data && data.id)) )  {
                        $scope.session.id = data.id ? data.id : $scope.session.id;
                        let {status} = await $scope.session.publish();
                        if (status === 200) {
                            $scope.notifications.push(new Notification(lang.translate('session.manage.published'), 'confirm'));
                        }
                    }
                    else {
                        $scope.notifications.push(new Notification(lang.translate('session.manage.confirm'), 'confirm'));
                    }
                }
                $scope.safeApply();
                $scope.goTo('/');
            }
        };


    }]
);