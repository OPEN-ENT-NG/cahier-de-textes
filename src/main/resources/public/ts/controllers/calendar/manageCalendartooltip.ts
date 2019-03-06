import {idiom as lang, model, moment, ng} from 'entcore';
import {Courses, Session, Sessions, Subjects, Toast} from '../../model';
import {Homework, HomeworkTypes, WorkloadWeek} from '../../model/homework';
import {Utils} from '../../utils/utils';

export let manageCalendarTooltipCtrl = ng.controller('ManageCalendarTooltip',
    ['$scope', '$routeParams', '$location', '$attrs', async function ($scope, $routeParams, $location, $attrs) {
        $scope.test = (item) => {
            return  item.data instanceof Session;
        }
    }]
);