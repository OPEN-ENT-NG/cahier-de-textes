import { ng, _, model, moment, notify, idiom as lang } from 'entcore';
import { Subjects, Notification } from '../../model';
import {Session} from "../../model";

export let createSessionCtrl = ng.controller('createSessionCtrl',
    ['$scope', '$routeParams', function ($scope, $routeParams) {
        console.log("createSessionCtrl");
        $scope.session = new Session($scope.structure);
        $scope.subjects = new Subjects();
        $scope.session.teacher = {id: model.me.userId};

        async function initData() {
            await Promise.all([
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);

            if (!!$routeParams.id) {
                $scope.session.id = $routeParams.id;
                await $scope.session.sync();
                $scope.safeApply();
            }

            $scope.safeApply();
        }

        initData();

        /**
         * Function canceling course creation
         */
        $scope.cancelCreation = () => {
            $scope.goTo('/');
            delete $scope.course;
        };

        /**
         * Function triggered on step 3 activation
         */
        $scope.isValidForm = () => {
            return $scope.session
                && $scope.session.subject
                && $scope.session.audience
                && $scope.session.title
                && $scope.session.date
                && $scope.session.startTime
                && $scope.session.endTime;
        };

        $scope.publishSession = async () => {
            this.saveSession(true);
        };

        $scope.deleteSession = async () => {
            let {status} = await $scope.session.delete();
            if (status === 200) {
                $scope.notifications.push(new Notification(lang.translate('session.manage.delete'), 'confirm'));
                $scope.safeApply();
                $scope.goTo('/');
            }
        };

        $scope.unpublishSession = async () => {
            let {status} = await $scope.session.unpublish();
            if (status === 200) {
                $scope.notifications.push(new Notification(lang.translate('session.manage.unpublished'), 'confirm'));
                $scope.safeApply();
                $scope.goTo('/');
            }
        };

        $scope.saveSession = async (publish = false) => {
            if(!$scope.isValidForm){
                $scope.notifications.push(new Notification(lang.translate('session.manage.unvalidForm')), 'error');
            }
            else {
                let {data, status} = await $scope.session.save();
                if (status === 200) {
                    if (publish && data && data.id) {
                        $scope.session.id = data.id;
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