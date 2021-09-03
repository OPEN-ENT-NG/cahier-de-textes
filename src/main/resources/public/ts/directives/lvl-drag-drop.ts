import {angular, model, ng} from 'entcore';
import {CALENDAR_TOOLTIP_EVENTER} from "../core/const/calendar-tooltip-eventer";

export const lvlDraggable = ng.directive('lvlDraggable', ['$rootScope', 'uuidDrag', function ($rootScope, uuid) {
    if (model.me.type === "ENSEIGNANT") {
        return {
            restrict: 'A',
            link: function (scope, el, attrs, controller) {
                angular.element(el).attr("draggable", "true");

                var id = angular.element(el).attr("id");

                if (!id) {
                    id = uuid.new()
                    angular.element(el).attr("id", id);
                }
                el.bind("dragstart", function (e) {
                    e.originalEvent.dataTransfer.setData('text', id);
                    $rootScope.$emit("LVL-DRAG-START");
                });

                el.bind("dragend", function (e) {
                    $rootScope.$emit("LVL-DRAG-END");
                });
            }
        };

    } else {
        return {
            restrict: 'EA',
            link: function (scope, element, attrs) {

            }
        };
    }
}]);

interface IViewModel {
    $onInit(): any;

    $onDestroy(): any;

    onDrop: Function;

    parentsHovers: Array<JQuery>;

    hovers: Array<Element>;
}

export const lvlDropTarget = ng.directive('lvlDropTarget', ['$rootScope', 'uuidDrag', function ($rootScope, uuid) {
    if (model.me.type === "ENSEIGNANT") {
        return {
            restrict: 'A',
            scope: {
                onDrop: '&'
            },
            controllerAs: 'vm',
            bindToController: true,
            controller: function () {
                const vm: IViewModel = <IViewModel>this;

                vm.$onInit = () => {
                    vm.parentsHovers = [];
                    vm.hovers = [];
                };
            },
            link: function (scope, el, attrs, controller) {
                const vm: IViewModel = scope.vm;
                var id = angular.element(el).attr("id");
                if (!id) {
                    id = uuid.new();
                    angular.element(el).attr("id", id);
                }

                const manageParentsOver = (elem: Element): void => {
                    // remove "lvl-parents-hovers" for elements that are not parents of the current element
                    vm.parentsHovers.filter(parent => angular.element(elem).parents()
                        .filter((index: number, elemParent: Element) => angular.element(elemParent) === parent).length === 0
                    )
                        .forEach(exParent => {
                            exParent.removeClass("lvl-parents-hovers");
                        });

                    vm.parentsHovers = vm.parentsHovers.filter((parent: JQuery) => parent.hasClass("lvl-parents-hovers"));

                    // add to each parents "lvl-target" tagged class "lvl-parents-hovers"
                    $.grep(angular.element(elem).parents(), (elemParent: Element) => angular.element(elemParent).hasClass("lvl-target") &&
                        !angular.element(elemParent).hasClass("lvl-parents-hovers") &&
                        vm.parentsHovers.indexOf(angular.element(elemParent)) === -1)
                        .forEach((elemParent: Element) => {
                            angular.element(elemParent).addClass("lvl-parents-hovers");
                            vm.parentsHovers.push(angular.element(elemParent));
                        });
                };

                // remove all tags "lvl-parents-hovers"
                const resetParentsHovers = (): void => {
                    vm.parentsHovers.forEach((elem: JQuery) => elem.removeClass("lvl-parents-hovers"));
                    vm.parentsHovers = [];
                }

                el.bind("dragover", function (e) {
                    scope.$emit(CALENDAR_TOOLTIP_EVENTER.HOVER_OUT);

                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
                    return false;
                });

                el.bind("dragenter", function (e) {
                    // this / e.target is the current hover target.
                    angular.element(e.target).addClass('lvl-over');
                    if (vm.hovers.indexOf(e.target) === -1) vm.hovers.push(e.target);
                    manageParentsOver(e.target);
                });

                el.bind("dragleave", function (e) {
                    angular.element(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
                    vm.hovers = vm.hovers.filter((elem: Element) => elem != e.target);

                    if (!vm.hovers || !vm.hovers.length) {
                        resetParentsHovers();
                    }
                });

                el.bind("drop", function (e) {
                    resetParentsHovers();
                    vm.hovers = [];

                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    let data: string = e.originalEvent.dataTransfer.getData("text");
                    vm.onDrop({dragEl: data, dropEl: id});
                });

                $rootScope.$on("LVL-DRAG-START", function () {
                    var el = document.getElementById(id);
                    angular.element(el).addClass("lvl-target");
                });

                $rootScope.$on("LVL-DRAG-END", function () {
                    var el = document.getElementById(id);
                    angular.element(el).removeClass("lvl-target");
                    angular.element(el).removeClass("lvl-over");
                });
            }
        };
    } else {
        return {
            restrict: 'EA',
            link: function (scope, element, attrs) {

            }
        };
    }
}]);