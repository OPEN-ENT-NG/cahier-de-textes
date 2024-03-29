import {idiom as lang, ng} from 'entcore';
import {Subject} from "../model";
import {UPDATE_SUBJECT_EVENTS} from "../core/enum/events";

interface IViewModel {
    $onInit(): any;
    $onDestroy(): any;

    subject: Subject;
    currentSubject: Subject;
    subjectDisplay: Subject;
    subjects: Array<Subject>;

    selectSubjectText: string;
    selectSubject(item);
    removeSubject(): void;
}

export const FilterSubject = ng.directive('filterSubject', () => {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            subjects: '=',
            currentSubject: '='
        },
        template: `
        <section class="cell twelve padding-top-sm padding-right-md padding-bottom-sm display-background">
                <div>
                    <select data-ng-model="vm.subjectDisplay"
                            id="subject-list"
                            class="twelve"
                            data-ng-change="vm.selectSubject()"
                            ng-options="subject as subject.label for subject in vm.subjects | orderBy:'label'"">
                        <option value="" disabled selected>[[vm.selectSubjectText]]</option>
                       
                    </select>
                </div>
                
                <div class="cell twelve" ng-show="vm.subjectDisplay && vm.subjectDisplay.label !== ''">
                    <div class="cell twelve search-input-ul">
                            [[vm.subjectDisplay.label]]
                            <i class="close" data-ng-click="vm.removeSubject()"></i>
                    </div>
                </div>
            </div>
        </section>
        `,
        controllerAs: 'vm',
        bindToController: true,
        replace: false,
        controller: function () {
            const vm: IViewModel = <IViewModel>this;

            vm.$onInit = () => {
                if (vm.currentSubject != null) {
                    vm.subjectDisplay = vm.currentSubject
                } else {
                    vm.subjectDisplay = null;
                }
                vm.selectSubjectText = lang.translate('subject.discipline');
            };
        },
        link: function ($scope, $element: HTMLDivElement) {
            const vm: IViewModel = $scope.vm;

            vm.selectSubject = ()  => {
                $scope.$emit(UPDATE_SUBJECT_EVENTS.UPDATE, vm.subjectDisplay);
            };

           vm.removeSubject = (): void => {
                vm.subjectDisplay = null;
                $scope.$emit(UPDATE_SUBJECT_EVENTS.UPDATE, vm.subjectDisplay);
            };
        }
    };
});