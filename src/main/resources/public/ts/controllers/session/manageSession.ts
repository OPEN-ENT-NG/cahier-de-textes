import { ng, _, model, moment, notify } from 'entcore';
import {DAYS_OF_WEEK, COMBO_LABELS, Teacher, Group, Subjects, Notification} from '../../model';
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

        $scope.saveSession = async (publish) => {
            if(!$scope.isValidForm){
                $scope.notifications.push(new Notification("creation.error"));
            }
            else {
                let {data, status} = await $scope.session.save();
                if (status === 200) {
                    if (publish && data && data.id) {
                        $scope.session.id = data.id;
                        let {status} = await $scope.session.publish();
                        if (status === 200) {
                            $scope.notifications.push(new Notification('session créée et publiée', 'confirm'));
                        }
                    }
                    else {
                        $scope.notifications.push(new Notification('session créé', 'confirm'));
                    }
                }
                $scope.safeApply();
                $scope.goTo('/');
            }
        };


    }]
);