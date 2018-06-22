import { ng, _, model, moment, notify, idiom as lang } from 'entcore';
import {Subjects, Notification} from '../../model';
import {Homework, HomeworkTypes} from '../../model/homework';

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$routeParams', function ($scope, $routeParams) {
        console.log("manageHomeworkCtrl");

        $scope.homework = new Homework($scope.structure);
        $scope.subjects = new Subjects();
        $scope.homeworkTypes = new HomeworkTypes();

        async function initData(){
            await Promise.all([
                $scope.homeworkTypes.sync(),
                $scope.subjects.sync($scope.structure.id, model.me.userId)]);

            if (!!$routeParams.id) {
                $scope.homework.id = $routeParams.id;
                await $scope.homework.sync();
            }

            $scope.safeApply();
        };
        initData();

        $scope.cancelCreation = () => {
            $scope.goTo('/');
            delete $scope.course;
        };

        $scope.isValidForm = () => {
            return $scope.homework
                && $scope.homework.structure
                && $scope.homework.subject
                && $scope.homework.audience
                && $scope.homework.dueDate
                && $scope.session.title
                && $scope.session.type;
        };

        $scope.publishHomework = async () => {
            this.saveHomework(true);
        };

        $scope.unpublishHomework = async () => {
            let {status} = await $scope.session.unpublish();
            if (status === 200) {
                $scope.notifications.push(new Notification(lang.translate('homework.manage.unpublished'), 'confirm'));
                $scope.safeApply();
                $scope.goTo('/');
            }
        };

        $scope.deleteHomework= async () => {
            let {status} = await $scope.homework.delete();
            if (status === 200) {
                $scope.notifications.push(new Notification(lang.translate('homework.manage.delete'), 'confirm'));
                $scope.safeApply();
                $scope.goTo('/');
            }
        };

        $scope.saveHomework = async (publish = false) => {
            if (!$scope.isValidForm) {
                $scope.notifications.push(new Notification(lang.translate('utils.unvalidForm')), 'error');
            }
            else {
                let {data, status} = await $scope.homework.save();
                if (status === 200) {
                    if (publish && data && data.id) {
                        $scope.homework.id = data.id;
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
                $scope.goTo('/');
            }
        };

    }]
);