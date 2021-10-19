import {Behaviours, idiom as lang, model, moment, ng, template} from 'entcore';
import {
    Courses, Structure,
    Structures,
    Toast, USER_TYPES
} from '../model';
import {DateUtils} from '../utils/dateUtils';
import {AutocompleteUtils} from '../utils/autocomplete/autocompleteUtils';
import {MobileUtils} from '../utils/mobile';
import {STRUCTURES_EVENTS, UPDATE_STRUCTURE_EVENTS} from "../core/enum/events";
import {IAngularEvent} from "angular";
import {UserUtils} from "../utils/user.utils";

declare let window: any;

export let main = ng.controller('MainController',
    ['$scope', '$rootScope', 'route', '$location', '$timeout',
        async function ($scope, $rootScope, route, $location, $timeout) {
            const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
            $scope.notifications = [];
            $scope.display = {
                listView: false,
                // sidebar component html workflow
                listViewArea: {
                    filter: !MobileUtils.isMobile(),
                    structure: !MobileUtils.isMobile(),
                    children: !MobileUtils.isMobile()
                }
            };

            $rootScope.display = $scope.display;

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
                if (phase === '$apply' || phase === '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    $scope.$apply(fn);
                }
            };

            $scope.initializeStructure = async (): Promise<void> => {
                $scope.structures = new Structures();
                // case navigation does not exist
                if (UserUtils.amIStudentOrParent()) {
                    await UserUtils.setWindowStructureFromUser();
                    $scope.updateStructures(await UserUtils.setParentStructures());
                    $scope.selectFirstStudent();
                } else {
                    await $scope.structures.sync();
                    $scope.structure = $scope.structures.getCurrentStructure();
                    if ($scope.structure) await $scope.structure.sync();
                    else {
                        // if cannot find own structure because he is based on window.structure.id then we take first
                        $scope.structure = $scope.structures.first();
                        await $scope.structure.sync();
                    }
                }
                $scope.structureInitialized = true;
                $scope.safeApply();
            };

            $scope.updateStructures = (structures: Structure[] | Structures) => {
                if (!$scope.structures) $scope.structures = new Structures();
                $scope.structures.setStructures(structures instanceof Structures ? structures.all : structures);
                // !! WARNING: take care to use $scope.$on when you want to use this event result !!
                $scope.$broadcast(STRUCTURES_EVENTS.UPDATED, $scope.structures);
            }

            $scope.selectFirstStudent = () => {
                let students = $scope.structures.getStudents();
                if (UserUtils.amIStudent() || students.length > 1) {
                    if (students.length > 1) $scope.params.child = students[0];
                    $scope.structure = $scope.structures.first();
                    $scope.$broadcast(UPDATE_STRUCTURE_EVENTS.UPDATE, $scope.structure);
                    return;
                }
            }

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
                return moment(date).format('dddd D MMMM YYYY');
            };

            function init() {
                $scope.search = '';
                $scope.typeUser = model.me.type;
                $scope.pageInitialized = false;
                $scope.display.listView = !model.me.hasWorkflow(WORKFLOW_RIGHTS.calendarView)
                    && model.me.hasWorkflow(WORKFLOW_RIGHTS.listView);
                $timeout(async function () {
                    await $scope.initializeData();
                }, 100);
                if (model.me.type === USER_TYPES.relative) {
                    $scope.display.todo = true;
                    $scope.display.done = true;
                }

                if (model.me.type === USER_TYPES.teacher) {
                    $scope.display.todo = true;
                    $scope.display.done = true;
                }

                if (model.me.type === USER_TYPES.student) {
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
                if ($scope.structure && !$scope.structure.courses) $scope.structure.courses = new Courses($scope.structure);
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

            $scope.clearLightbox = (): void => {
                document.getElementsByClassName('cdt')[0].classList.remove('lightbox-opened');
            };

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
                        case 'children': {
                            $scope.display.listViewArea.children = !$scope.display.listViewArea.children;
                            break;
                        }
                    }
                }
            };

            $scope.hasRight = (right: string): boolean => {
                return model.me.hasWorkflow(WORKFLOW_RIGHTS[right]);
            };

            $scope.$on(UPDATE_STRUCTURE_EVENTS.TO_UPDATE, async (event: IAngularEvent, structureId: string) => {
                if (!$scope.structure || ($scope.structure && $scope.structure.id != structureId)) {
                    $scope.structure = window.structure = $scope.structures.get(structureId);
                    if (!UserUtils.amIStudentOrParent()) await $scope.initializeStructure();
                    $scope.$broadcast(UPDATE_STRUCTURE_EVENTS.UPDATE);
                }
            });

            route({
                main: async () => {
                    if (!$scope.structureInitialized) await $scope.initializeStructure();
                    if (DateUtils.isAChildOrAParent(model.me.type) && !$scope.pageInitialized) {
                        $scope.goTo('/list');
                    } else if (model.me.type === USER_TYPES.personnel) {
                        $scope.goTo('/administrator/global');
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
                viewNotebookArchives: async () => {
                    if (!$scope.structureInitialized) await $scope.initializeStructure();
                    template.open('main', 'notebook-archive/notebook-archives');
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