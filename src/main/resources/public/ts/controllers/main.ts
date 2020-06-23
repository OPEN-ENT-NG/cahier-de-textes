import {Behaviours, idiom as lang, Me, model, moment, ng, template} from 'entcore';
import {
    Courses,
    Structures,
    Toast
} from '../model';
import {DateUtils} from '../utils/dateUtils';
import {AutocompleteUtils} from '../utils/autocompleteUtils';
import {PreferencesUtils} from "../utils/preference/preferences";
import {StructureService} from "../services";
import {MobileUtils} from "../utils/mobile";

declare let window: any;

export let main = ng.controller('MainController',
    ['$scope', 'route', '$location', '$timeout', 'StructureService',
        async function ($scope, route, $location, $timeout, structureService: StructureService) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        $scope.notifications = [];
        $scope.display = {
            listView: false,
            // sidebar component html workflow
            listViewArea : {
                filter: true,
                structure: true
            }
        };
        $scope.params = {
            user: null,
            group: null,
            updateItem: null,
            dateFromCalendar: null
        };
        $scope.isAChildOrAParent = DateUtils.isAChildOrAParent(model.me.type);
        $scope.isChild = DateUtils.isChild(model.me.type);
        $scope.isRelative = DateUtils.isRelative(model.me.type);
        $scope.isTeacher = DateUtils.isTeacher(model.me.type);

        $scope.safeApply = function (fn?) {
            const phase = $scope.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                $scope.$apply(fn);
            }
        };

        $scope.initializeStructure = async (): Promise<void> => {
            // case navigation does not exist
            if ($scope.isAChildOrAParent) {
                let structures = structureService.getUserStructure();
                let preferenceStructure = await Me.preference(PreferencesUtils.PREFERENCE_KEYS.CDT_STRUCTURE);
                let preferenceStructureId = preferenceStructure ? preferenceStructure['id'] : null;
                window.structure = preferenceStructureId ?
                    structures.find((s) => s.id === preferenceStructureId) : structures[0];
            }

            $scope.structures = new Structures();
            await $scope.structures.sync();
            $scope.structure = $scope.structures.getCurrentStructure();
            if ($scope.structure) {
                await $scope.structure.sync();
                $scope.structureInitialized = true;
            } else {
                // if cannot find own structure because he is based on window.structure.id then we take first
                $scope.structure = $scope.structures.first();
                await $scope.structure.sync();
                $scope.structureInitialized = true;
            }
            $scope.safeApply();
        };

        $scope.setLegendLightboxVisible = (state: boolean) => {
            $scope.legendLightboxIsVisible = state;
            if ($scope.legendLightboxIsVisible) {
                template.open('infoBulleTemplate', 'main/toolTip-legendeTemplate');
            }
        };

        /**
         * Fixing editor directive text area padding and code position
         */
        $scope.fixEditor = async (exit: number = 0) => {
            if (exit < 100) {
                await $timeout(function () {
                    let $editor = $('editor');
                    if ($editor.length > 0) {
                        $editor.trigger('resize');
                    } else {
                        $scope.fixEditor(++exit);
                    }
                }, 50);
            }
        };

        $scope.transformDateToFrenchDate = (date: Date) => {
            return moment(date).format("dddd D MMMM YYYY");
        };

        function init() {
            $scope.search = "";
            $scope.typeUser = model.me.type;
            $scope.pageInitialized = false;
            $scope.display.listView = !model.me.hasWorkflow(WORKFLOW_RIGHTS.calendarView)
                && model.me.hasWorkflow(WORKFLOW_RIGHTS.listView);
            $timeout(async function () {
                await $scope.initializeData();
            }, 100);
            if (DateUtils.isRelative(model.me.type)) {
                $scope.display.todo = true;
                $scope.display.done = true;
            }

            if (model.me.type === "ENSEIGNANT") {
                $scope.display.todo = true;
                $scope.display.done = true;
            }

            if (DateUtils.isChild(model.me.type)) {
                $scope.display.todo = true;
                $scope.display.done = false;
            }

            if ($scope.structure && $scope.structure.students.all.length < 2) {
                $scope.params.child = $scope.structure.students.all[0];
            }
            AutocompleteUtils.init($scope.structure);
        }

        $scope.initializeData = async () => {
            $scope.isRefreshingCalendar = true;
            if (!$scope.structure) {
                await $scope.initializeStructure();
            }
            if (!$scope.structure.courses) $scope.structure.courses = new Courses($scope.structure);
            $scope.pageInitialized = true;
            $scope.safeApply();
        };

        $scope.isCounselorUser = () => {
            return model.me.hasWorkflow(WORKFLOW_RIGHTS.viescoSettingHomeworkAndSessionTypeManage);
        };

        /**
         * Toast the response
         * @param response
         * @returns {any}
         */
        $scope.toastHttpCall = (response) => {
            if (response.succeed) {
                $scope.notifications.push(new Toast(response.toastMessage, 'confirm'));
            } else {
                $scope.notifications.push(new Toast(response.toastMessage, 'error'));
            }
            $scope.safeApply();
            return response;
        };

        $scope.goTo = (state: string) => {
            $location.path(state);
            $scope.safeApply();
        };

        $scope.translate = (key: string) => lang.translate(key);
        
        $scope.isMobile = (): boolean => {
            return MobileUtils.isMobile();
        };

        $scope.collapseMobile = (areaType: string): void => {
            if ($scope.isMobile()) {
                switch (areaType) {
                    case 'filter': {
                        $scope.display.listViewArea.filter = !$scope.display.listViewArea.filter;
                        break;
                    }
                    case 'structure': {
                        $scope.display.listViewArea.structure = !$scope.display.listViewArea.structure;
                        break;
                    }
                }
            }
        };

        route({
            main: async () => {
                if (!$scope.structureInitialized) await $scope.initializeStructure();
                if (DateUtils.isAChildOrAParent(model.me.type) && !$scope.pageInitialized) {
                    $scope.goTo("/list")
                } else if (model.me.type === "PERSEDUCNAT") {
                    $scope.goTo("/administrator/global");
                } else {
                    if (!$scope.pageInitialized) await init();
                    template.open('main', 'main');
                }
            },
            viewProgression: async () => {
                if (!$scope.structureInitialized) await $scope.initializeStructure();
                template.open('main', 'progression/progressions');
            },
            manageProgression: async () => {

            },
            mainView: async () => {
                if (!$scope.structureInitialized) await $scope.initializeStructure();
                if (!$scope.pageInitialized) await init();
                template.open('main', 'main');
            },
            manageSession: async () => {
                if (!$scope.structureInitialized) await $scope.initializeStructure();
                template.open('main', 'session/session-page');
            },

            manageHomework: async () => {
                if (!$scope.structureInitialized) await $scope.initializeStructure();
                template.open('main', 'homework/homework-page');
            },
            globalAdminCtrl: async () => {
                if (!$scope.structureInitialized) await $scope.initializeStructure();
                template.open('main', 'administrator/admin-main-page');
            },
            manageList: async () => {
                if (!$scope.structureInitialized) await $scope.initializeStructure();
                if (!$scope.pageInitialized) await init();
                if (model.me.hasWorkflow(WORKFLOW_RIGHTS.listView)) {
                    template.open('main', 'list/list-view');
                }
            }
        });
    }]);