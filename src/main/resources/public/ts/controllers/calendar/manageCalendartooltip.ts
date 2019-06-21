import {ng} from 'entcore';
import {Session} from '../../model';

export let manageCalendarTooltipCtrl = ng.controller('ManageCalendarTooltip',
    ['$scope', '$routeParams', '$location', '$attrs', async function ($scope) {
        $scope.test = (item) => {
            return  item.data instanceof Session;
        }
    }]
);