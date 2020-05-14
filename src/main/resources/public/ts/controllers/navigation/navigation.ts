import {model, ng} from 'entcore';

declare let window: any;

interface Structure {
    id: string;
    name: string;
}

export let navigationController = ng.controller("navigationController",
    ['$scope', async function ($scope) {
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
            $scope.menu = {
                structure: $scope.structures[0],
                hovered: '',
                active: '',
                timeout: null
            };
            await $scope.setStructure($scope.structures[0]);
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
            $scope.safeApply();
        };

        $scope.hoverIn = function(menuItem) {
            $scope.menu.hovered = menuItem;
            document.getElementById('calendar-area').style.zIndex = "0";
            window.clearTimeout($scope.menu.timeout);
        };

        $scope.hoverOut = function() {
            $scope.menu.timeout = setTimeout(() => {
                $scope.menu.hovered = '';
                document.getElementById('calendar-area').style.zIndex = "";
                $scope.safeApply();
            }, 250);
        };

        $scope.getCurrentState = function() {
            const res = window.location.hash.split('/');
            return (res !== null && res.length > 1) ? res[1] : '';
        };

        await init();
    }]
);