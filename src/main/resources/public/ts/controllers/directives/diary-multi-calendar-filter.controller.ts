import {ng, module, model} from 'entcore';
import {VisaService} from "../../services/visa.service";
import {SecureService} from "../../services/secure.service";
import {CONSTANTS} from "../../tools";

export const diaryMultiCalendarFilterController = ng.controller('diaryMultiCalendarFilterController',
    ['$scope', ($scope) => {
        let promiseFilter;
        $scope.RIGHTS = CONSTANTS.RIGHTS;
        $scope.filters = {};

        $scope.getFilters = function (structureId) {
            if (!promiseFilter) {
                if (SecureService.hasRight(CONSTANTS.RIGHTS.VISA_ADMIN)) {
                    promiseFilter = VisaService.getFilters(structureId);
                } else if (SecureService.hasRight(CONSTANTS.RIGHTS.VISA_INSPECTOR)) {
                    promiseFilter = VisaService.getInspectorFilters(structureId, model.me.userId);
                }
            }
            if (promiseFilter) {
                promiseFilter.then((filters) => {
                    $scope.filters = filters;
                });
            }
        };

        init();

        function init() {
            $scope.$watch("audience", (n, o) => {
                if (n) {
                    $scope.teacher = undefined;
                }
            });
            $scope.$watch("teacher", (n, o) => {
                if (n) {
                    $scope.audience = undefined;
                }
            });
            $scope.$watch("structure", (n, o) => {
                if (n !== o && n) {
                    $scope.getFilters(n.id);
                }
            });
            if ($scope.structure) {
                $scope.getFilters($scope.structure.id);
            }
        }
    }]);