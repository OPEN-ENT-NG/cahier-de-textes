import {Me, model, ng} from 'entcore';
import {UPDATE_STRUCTURE_EVENTS} from '../../core/enum/events';
import {PreferencesUtils} from '../../utils/preference/preferences';

declare let window: any;

type Structure = {
    id: string;
    name: string;
};

export let navigationController = ng.controller('navigationController',
    ['$rootScope', '$scope', '$timeout', async function ($rootScope, $scope) {
        $scope.public = false;
        $scope.userType = model.me.type;

        async function init() {
            $scope.structures = initStructures();
            let preferenceStructure: any = await Me.preference(PreferencesUtils.PREFERENCE_KEYS.CDT_STRUCTURE);
            let preferenceStructureId: string = preferenceStructure ? preferenceStructure['id'] : null;
            let structure: Structure = $scope.structures.length > 1 && preferenceStructureId ? $scope.structures.find((s: Structure) => s.id === preferenceStructureId) : $scope.structures[0];
            $scope.menu = {
                structure: structure,
                hovered: '',
                active: '',
                timeout: null
            };
            await $scope.setStructure(structure);
            $scope.safeApply();
        }

        const initStructures = (): Structure[] => {
            const {structures, structureNames} = model.me;
            const values: Structure[] = [];
            for (let i = 0; i < structures.length; i++) {
                values.push({id: structures[i], name: structureNames[i]});
            }
            return values;
        };

        $scope.setStructure = async (structure: Structure): Promise<void> => {
            window.structure = structure;
            $scope.menu.structure = structure;
            $scope.menu.active = structure.id;
            await PreferencesUtils.updateStructure(structure);
            $scope.safeApply();
        };

        $scope.hoverIn = (menuItem: string): void => {
            $scope.menu.hovered = menuItem;
            let elementCalendar: HTMLElement = document.getElementById('calendar-area');
            if (elementCalendar) {
                elementCalendar.style.zIndex = '0';
            }

            let editorDirective: Element = document.querySelector('editor');
            if (editorDirective) {
                (<HTMLElement> editorDirective).style.zIndex = '0';
            }
            window.clearTimeout($scope.menu.timeout);
        };

        $scope.hoverOut = (): void => {
            $scope.menu.timeout = setTimeout(() => {
                $scope.menu.hovered = '';
                let elementCalendar = document.getElementById('calendar-area');
                if (elementCalendar) {
                    elementCalendar.style.zIndex = '';
                }
                $scope.safeApply();
            });
        };

        $scope.getCurrentState = (): string => {
            const res: string[] = window.location.hash.split('/');
            return (res !== null && res.length > 1) ? res[1] : '';
        };

        await init();

        $scope.$watch(() => window.structure, async (): Promise<void> => {
            await $scope.initializeStructure();
            $rootScope.$broadcast(UPDATE_STRUCTURE_EVENTS.UPDATE);
            $scope.safeApply();
        });
    }]
);