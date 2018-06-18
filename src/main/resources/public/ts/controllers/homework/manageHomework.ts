import { ng, _, model, moment, notify } from 'entcore';
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
        }

        $scope.saveHomework = async () => {
            let { status } = await $scope.homework.save();
            if (status === 200) {
                $scope.notifications.push(new Notification('Homework créé', 'confirm'));
            }
            $scope.safeApply();
        };

        initData();
    }]
);