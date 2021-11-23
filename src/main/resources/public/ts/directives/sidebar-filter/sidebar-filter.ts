import {idiom as lang, ng, template} from 'entcore';
import {ROOTS} from "../../core/const/roots";
import {UserUtils} from "../../utils/user.utils";
import {MobileUtils} from "../../utils/mobile";
import {Audience, Structure, Structures, Student, Subject, Subjects} from "../../model";
import {SIDEBAR_AREAS, SIDEBAR_VIEWS} from "../../core/enum/sidebar.enum";
import {CHILD_EVENTS, UPDATE_STRUCTURE_EVENTS} from "../../core/enum/events";
import {Group} from '../../model/group';
import {groupService} from '../../services';

interface IViewModel {
    $onInit(): any;

    $onDestroy(): any;

    setLegendVisibility(isShown: boolean): void;

    changeView(viewName: SIDEBAR_VIEWS): void;

    collapseMobile(areaType: SIDEBAR_AREAS): void;

    changeStudent(): void;

    currentChildStructures(): Structure[];

    changeStructure(): void;

    removeAudience(audience: Audience): void;

    goTo(path: string): void;

    onRemoveAudience(): any

    userUtils: typeof UserUtils;

    mobileUtils: typeof MobileUtils;

    SIDEBAR_VIEWS: typeof SIDEBAR_VIEWS;

    SIDEBAR_AREAS: typeof SIDEBAR_AREAS;

    lang: typeof lang,

    calendarMode: boolean;

    listMode: boolean;

    isShownLegend: boolean;

    areShownAreas: { [key in SIDEBAR_AREAS]: boolean }

    areShownViews: { [key in SIDEBAR_VIEWS]: boolean },

    isHomeworksFiltered: boolean,

    isSessionsFiltered: boolean,

    child: Student;

    audiences: Audience[];

    subjects: Subjects;

    subject: Subject;

    structure: Structure;

    structures: Structures;

}

export const sidebarFilter = ng.directive('sidebarFilter', ['$location', ($location) => {
    return {
        scope: {
            child: '=',
            audiences: '=',
            onRemoveAudience: '&',
            subjects: '=',
            subject: '=',
            structure: '=',
            structures: '=',
            calendarMode: '=',
            listMode: '=',
            isHomeworksFiltered: '=',
            isSessionsFiltered: '=',
        },
        restrict: 'E',
        templateUrl: `${ROOTS.directive}sidebar-filter/sidebar-filter.html`,
        controllerAs: 'vm',
        bindToController: true,
        replace: false,
        controller: function ($attrs) {
            const vm: IViewModel = <IViewModel>this;

            vm.$onInit = async () => {
                vm.userUtils = UserUtils;
                vm.mobileUtils = MobileUtils;
                vm.SIDEBAR_VIEWS = SIDEBAR_VIEWS;
                vm.SIDEBAR_AREAS = SIDEBAR_AREAS;
                vm.lang = lang;

                vm.areShownViews = {
                    CALENDAR: $attrs.calendarMode != undefined || !vm.calendarMode === false,
                    LIST: $attrs.listMode != undefined || !vm.listMode === false,
                }
                vm.areShownAreas = {
                    CHILDREN: true,
                    LEGEND: false,
                    STRUCTURE: true,
                    FILTER: vm.userUtils.amIStudentOrParent() || (vm.userUtils.amITeacher() && vm.areShownViews.LIST)
                }
            };
        },

        link: function ($scope) {
            const vm: IViewModel = $scope.vm;

            vm.setLegendVisibility = (isShown: boolean) => {
                vm.areShownAreas[SIDEBAR_AREAS.LEGEND] = isShown;
                if (vm.areShownAreas[SIDEBAR_AREAS.LEGEND])
                    template.open('infoBulleTemplate', 'main/toolTip-legendeTemplate');
            }

            vm.changeView = (viewName: SIDEBAR_VIEWS): void => {
                Object.keys(SIDEBAR_VIEWS)
                    .filter((view: string) => view != SIDEBAR_VIEWS[viewName])
                    .forEach((view: string) => vm.areShownViews[view] = false);
                vm.areShownViews[viewName] = true;

                switch (viewName) {
                    case SIDEBAR_VIEWS.CALENDAR:
                        vm.goTo('/view');
                        break;
                    case SIDEBAR_VIEWS.LIST:
                        vm.goTo('/list');
                        break;
                }
            }

            vm.collapseMobile = (areaType: SIDEBAR_AREAS): void => {
                if (MobileUtils.isMobile()) vm.areShownAreas[areaType] = !vm.areShownAreas[areaType];
            }

            vm.currentChildStructures = (): Structure[] => {
                if (UserUtils.amIStudent()) return vm.structures ? vm.structures.all || [] : [];
                return (vm.child) ? UserUtils.currentChildStructures(vm.child, vm.structures) : [];
            }

            vm.changeStructure = (): void => $scope.$emit(UPDATE_STRUCTURE_EVENTS.TO_UPDATE, vm.structure ? vm.structure.id : null)

            vm.changeStudent = (): void => $scope.$emit(CHILD_EVENTS.UPDATE, vm.child ? vm.child.id : null)

            vm.removeAudience = async (audience: Audience): Promise<void> => {
                let groups: Array<Group> = await groupService.initGroupsFromClassIds([audience.id]);

                vm.audiences = (groups.length === 0) ? vm.audiences.filter(
                    (a: Audience): boolean => a !== audience) : [];

                $scope.$eval(vm.onRemoveAudience)(vm.audiences);
            };

            vm.goTo = (path: string): void => {
                $location.path(path);
                $scope.$apply();
            }

            vm.$onDestroy = async () => {
            };
        }
    };
}]);