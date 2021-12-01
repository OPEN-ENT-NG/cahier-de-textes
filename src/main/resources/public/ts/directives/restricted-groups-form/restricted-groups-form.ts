import {ng, idiom as lang} from 'entcore';
import {ROOTS} from "../../core/const/roots";
import {RestrictedGroup} from "../../model/RestrictedGroup";
import {Audience, Structure, Student} from "../../model";
import {collectiveAbsenceService} from "../../services/AudienceService";
import {StudentsSearch} from "../../utils/autocomplete/studentsSearch";

declare let window: any;

export const restrictedGroupsForm = ng.directive('restrictedGroupsForm', () => {
    interface IViewModel {
        $onInit(): any;

        $onDestroy(): any;

        isShownSavingOptions(): boolean;

        openRestrictedGroupsForm(): void;

        removeStudent(id: string): void;

        closeRestrictedGroupsForm(): void;

        searchStudent(query: string): void;

        selectStudent(query: string, student: Student): void;

        selectedStudents(): Student[];

        searchStudentPlaceholder(): String;

        save(): void;

        roots: typeof ROOTS;

        isToBeSaved: boolean;

        isNewGroup: boolean;

        structure: Structure;

        restrictedGroupsLightboxOpened: boolean;

        autocomplete: StudentsSearch;

        restrictedGroup: RestrictedGroup;

        oldRestrictedGroups: RestrictedGroup[]; // todo suppress => les groups des anciennes sessions

        audience: Audience;

    }

    return {
        transclude: true,
        scope: {
            restrictedGroup: '=?',
            audience: '='
        },
        restrict: 'E',
        templateUrl: `${ROOTS.directive}restricted-groups-form/restricted-groups-form.html`,
        controllerAs: 'vm',
        bindToController: true,
        replace: false,
        controller: function () {
            const vm: IViewModel = <IViewModel>this;

            vm.$onInit = async () => {
                vm.roots = ROOTS;
                vm.structure = window.structure;
                vm.restrictedGroup = new RestrictedGroup();
                vm.autocomplete = new StudentsSearch(window.structure.id);
            };
        },

        link: function ($scope) {
            const vm: IViewModel = $scope.vm;

            vm.isShownSavingOptions = (): boolean => !!vm.isToBeSaved && !!vm.restrictedGroup.legacy_id;

            vm.searchStudentPlaceholder = (): String =>
                `${lang.translate('restricted.group.add.student.placeholder')} ${vm.audience.name}`;

            vm.openRestrictedGroupsForm = async (): Promise<void> => {
                vm.restrictedGroupsLightboxOpened = true;
                vm.audience.students = await collectiveAbsenceService
                    .getCollectiveAbsence(vm.audience, window.structure.id);
                vm.autocomplete.setSearchStudents(vm.audience.students);
                vm.restrictedGroup.student_ids = vm.audience.students.map((student: Student) => student.id); // todo => pas toujours set comme ça
                $scope.$apply();
            };

            vm.removeStudent = (studentId: string): void => {
                vm.restrictedGroup.student_ids = vm.restrictedGroup.student_ids.filter((id: string) => id !== studentId);
                vm.autocomplete.resetStudents()
            }

            vm.searchStudent = (query: string): void => {
                vm.autocomplete.searchStudentsFromArray(query, vm.restrictedGroup.student_ids);
                $scope.$apply();
            }

            vm.selectStudent = (query: string, student: Student): void => {
                vm.restrictedGroup.student_ids.push(student.id);
                vm.autocomplete.resetQuery();
            }

            vm.selectedStudents = (): Student[] => {
                return vm.audience && vm.audience.students ?
                    vm.audience.students
                        .filter((student) => vm.restrictedGroup.student_ids.indexOf(student.id) !== -1) :
                    [];
            }

            vm.save = (): void => {

            }

            vm.closeRestrictedGroupsForm = (): void => {
                vm.restrictedGroupsLightboxOpened = false;
            };

            vm.$onDestroy = async () => {
            };
        }
    };
});