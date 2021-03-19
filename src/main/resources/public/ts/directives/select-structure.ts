import {Me, ng} from 'entcore';
import {Structure} from "../model";
import {structureService} from "../services";
import {PreferencesUtils} from "../utils/preference/preferences";
import {UPDATE_STRUCTURE_EVENTS} from "../core/enum/events";

declare let window: any;

interface IViewModel {
    $onInit(): any;
    $onDestroy(): any;

    structure: Structure;
    structureDisplay: { name: string, id: string };
    structures: Array<Structure>;

    setStructure(structure: Structure): Promise<void>;
}

export const SelectStructure = ng.directive('selectStructure', () => {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            structure: '='
        },
        template: `
        <!-- SELECT STRUCTURE -->
        <div ng-if="vm.structures.length > 1" data-ng-click="$parent.$parent.collapseMobile('structure')">
            <div class="row title-sidebar padding-left-md padding-right-md">
                <h5 class="large cell twelve" workflow="diary.listView">
                    <i18n>utils.structure.fr</i18n>
                    
                     <i ng-show="$parent.$parent.isMobile()"
                        ng-class="$parent.$root.display.listViewArea.structure ? 'up-open' : 'down-open'"
                        class="right-magnet">
                    </i>
                </h5>
            </div>
            <!-- Select structure -->
            <section 
            ng-if="$parent.$root.display.listViewArea.structure"
            class="cell twelve padding-top-md padding-left-md padding-right-md padding-bottom-sm display-background">
                <div>
                    <select data-ng-model="vm.structureDisplay"
                            class="twelve"
                            data-ng-change="vm.setStructure()"
                            ng-options="structure.name for structure in vm.structures track by structure.id">
                    </select>
                </div>
            </section>
        </div>
        `,
        controllerAs: 'vm',
        bindToController: true,
        replace: false,
        controller: async function ($scope) {
            const vm: IViewModel = <IViewModel>this;
            vm.$onInit = () => {
                vm.structures = structureService.getUserStructure();
                vm.structureDisplay = {
                    name: vm.structure.name,
                    id: vm.structure.id,
                }
            };
        },
        link: function ($scope, $element: HTMLDivElement) {
            const vm: IViewModel = $scope.vm;

            vm.setStructure = async (): Promise<void> => {
                window.structure = vm.structureDisplay;
                await PreferencesUtils.updateStructure(window.structure);
                await $scope.$parent.initializeStructure();
                $scope.$emit(UPDATE_STRUCTURE_EVENTS.UPDATE);
            };
        }
    };
});