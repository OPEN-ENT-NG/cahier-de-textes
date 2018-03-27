import { ng, module, model } from 'entcore';
import {VisaService} from "../services/visa.service";
import {SecureService} from "../services/secure.service";
import {CONSTANTS} from "../tools";

export const diaryMultiCalendarFilter = ng.directive('diaryMultiCalendarFilter', function () {
    return {
        restrict: "E",
        templateUrl: "/diary/public/template/directives/diary-multi-calendar-filter/diary-multi-calendar-filter.template.html",
        scope: {
            structure: '=',
            audience: '=',
            teacher: '='
        },
        controller: function ($scope) {

            let vm = this;
            let promiseFilter;
            $scope.RIGHTS = CONSTANTS.RIGHTS;
            vm.filters = {};

            vm.getFilters = function (structureId) {
                if (!promiseFilter) {
                    if (SecureService.hasRight(CONSTANTS.RIGHTS.VISA_ADMIN)) {
                        promiseFilter = VisaService.getFilters(structureId);
                    } else if (SecureService.hasRight(CONSTANTS.RIGHTS.VISA_INSPECTOR)) {
                        promiseFilter = VisaService.getInspectorFilters(structureId, model.me.userId);
                    }
                }
                if (promiseFilter) {
                    promiseFilter.then((filters) => {
                        vm.filters = filters;
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
                        vm.getFilters(n.id);
                    }
                });
                if ($scope.structure) {
                    vm.getFilters($scope.structure.id);
                }
            }


        }
    };
});
