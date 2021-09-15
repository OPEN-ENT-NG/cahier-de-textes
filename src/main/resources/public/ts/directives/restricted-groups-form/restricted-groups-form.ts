import {ng} from 'entcore';
import {ROOTS} from "../../core/const/roots";
import {RestrictedGroup} from "../../model/RestrictedGroup";

export const restrictedGroupsForm = ng.directive('restrictedGroupsForm', function () {
    interface IViewModel {
        $onInit(): any;

        $onDestroy(): any;

        openRestrictedGroupsForm(): void;

        closeRestrictedGroupsForm(): void;

        roots: typeof ROOTS;

        restrictedGroupsLightboxOpened: boolean;

        restrictedGroup: RestrictedGroup;

        oldRestrictedGroups: RestrictedGroup[];
    }

    return {
        scope: {
            restrictedGroup: '=?'
        },
        restrict: 'E',
        templateUrl: `${ROOTS.directive}restricted-groups-form/restricted-groups-form.html`,
        controllerAs: 'vm',
        bindToController: true,
        replace: false,
        controller: function () {
            const vm: IViewModel = <IViewModel>this;

            vm.$onInit = async () => {
                vm.restrictedGroup = new RestrictedGroup();
                console.log(vm.restrictedGroup);
            };
        },

        link: function ($scope) {
            const vm: IViewModel = $scope.vm;

            vm.roots = ROOTS;

            vm.openRestrictedGroupsForm = (): void => {
                vm.restrictedGroupsLightboxOpened = true;
            };

            vm.closeRestrictedGroupsForm = (): void => {
                vm.restrictedGroupsLightboxOpened = false;
            };

            vm.$onDestroy = async () => {
            };
        }
    };
});