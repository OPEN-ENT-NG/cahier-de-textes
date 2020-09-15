import {Me, model, ng} from 'entcore';
import {UPDATE_STRUCTURE_EVENTS} from "../../enum/events";
import {PreferencesUtils} from "../../utils/preference/preferences";

declare let window: any;

interface Structure {
    id: string;
    name: string;
}

export let navigationController = ng.controller("navigationController",
    ['$rootScope', '$scope', '$timeout', async function ($rootScope, $scope, $timeout) {
        $scope.public = false;
        $scope.userType = model.me.type;

        async function init() {
            $scope.icons = {
                diary: {
                    path: "/diary/public/img/cahierdetexte.svg" ,
                    alt: "",
                },
                progression: {
                    path: "/diary/public/img/progressions.svg",
                    alt: "",
                },
                dashboard: {
                    path: "/diary/public/img/view-dashboard.svg",
                    alt: "",
                },
                calendar: {
                    path: "/diary/public/img/calendaire.svg",
                    alt: "",
                }
            };

            $scope.structures = initStructures();
            let preferenceStructure = await Me.preference(PreferencesUtils.PREFERENCE_KEYS.CDT_STRUCTURE);
            let preferenceStructureId = preferenceStructure ? preferenceStructure['id'] : null;
            let structure = $scope.structures.length > 1 && preferenceStructureId ? $scope.structures.find((s) => s.id === preferenceStructureId) : $scope.structures[0];
            $scope.menu = {
                structure: structure,
                hovered: '',
                active: '',
                timeout: null
            };
            await $scope.setStructure(structure);
            $scope.safeApply();
        }

        function initStructures(): Structure[] {
            const {structures, structureNames} = model.me;
            const values = [];
            for (let i = 0; i < structures.length; i++) {
                values.push({id: structures[i], name: structureNames[i]});
            }
            return values;
        }

        $scope.setStructure = async function(structure: Structure) {
            window.structure = structure;
            $scope.menu.structure = structure;
            $scope.menu.active = structure.id;
            await PreferencesUtils.updateStructure(structure);
            $scope.safeApply();
        };

        $scope.hoverIn = function(menuItem) {
            $scope.menu.hovered = menuItem;
            let elementCalendar = document.getElementById('calendar-area');
            if (elementCalendar) {
                elementCalendar.style.zIndex = "0";
            }

            let editorDirective = document.querySelector('editor');
            if (editorDirective) {
                (<HTMLElement>editorDirective).style.zIndex = "0";
            }
            window.clearTimeout($scope.menu.timeout);
        };

        $scope.hoverOut = function() {
            $scope.menu.timeout = setTimeout(() => {
                $scope.menu.hovered = '';
                let elementCalendar = document.getElementById('calendar-area');
                if (elementCalendar) {
                    elementCalendar.style.zIndex = "";
                }
                $scope.safeApply();
            });
        };

        $scope.getCurrentState = function() {
            const res = window.location.hash.split('/');
            return (res !== null && res.length > 1) ? res[1] : '';
        };

        await init();

        $scope.$watch(() => window.structure,async () => {
            await $scope.initializeStructure();
            $rootScope.$broadcast(UPDATE_STRUCTURE_EVENTS.UPDATE);
            $scope.safeApply();
        });
    }]
);