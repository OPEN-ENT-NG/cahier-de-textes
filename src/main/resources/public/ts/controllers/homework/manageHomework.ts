import { ng, _, model, moment, notify } from 'entcore';
import {DAYS_OF_WEEK, COMBO_LABELS, Teacher, Group} from '../../model';
import {Homework, HomeworkTypes} from '../../model/homework';

export let manageHomeworkCtrl = ng.controller('manageHomeworkCtrl',
    ['$scope', '$routeParams', function ($scope, $routeParams) {
        console.log("manageHomeworkCtrl");

        $scope.homework = new Homework();
        $scope.homeworkTypes = new HomeworkTypes();

        function initData(){
            $scope.homeworkTypes.sync();

            if (!!$routeParams.id) {
                $scope.homework.id = $routeParams.id;
                $scope.homework.sync();
            }
        }

        initData();
    }]
);