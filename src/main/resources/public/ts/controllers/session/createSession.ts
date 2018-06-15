import { ng, _, model, moment, notify } from 'entcore';
import {DAYS_OF_WEEK, COMBO_LABELS, Teacher, Group} from '../../model';

export let createSessionCtrl = ng.controller('createSessionCtrl',
    ['$scope', function ($scope) {
        console.log("createSessionCtrl");
        $scope.session = {};
        $scope.daysOfWeek = DAYS_OF_WEEK;
        $scope.comboLabels = COMBO_LABELS;

        if ($scope.params.group)
            $scope.session.groups.push($scope.params.group);

        if ($scope.params.user)
            $scope.session.teachers.push($scope.params.user);

        if ($scope.structures.all.length === 1)
            $scope.session.structureId = $scope.structure.id;


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
            return $scope.course
                && $scope.course.teachers
                && $scope.course.groups
                && $scope.course.teachers.length > 0
                && $scope.course.groups.length > 0;
        };


    }]
);