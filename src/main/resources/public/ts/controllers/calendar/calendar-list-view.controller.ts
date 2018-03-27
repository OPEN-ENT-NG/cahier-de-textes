import { ng, model, moment } from 'entcore';
import {HomeworkService} from "../../services/homework.service";
import {LessonService} from "../../services/lessons.service";
import {UtilsService} from "../../services/utils.service";
import {SecureService} from "../../services/secure.service";
import {CONSTANTS} from "../../tools";

export const CalendarListViewController = ng.controller('CalendarListViewController',
    ['$scope', '$timeout', '$q', '$location', ($scope, $timeout, $q, $location) => {

        let vm = this;
        $timeout(init);

        function init() {


            if (model.mondayOfWeek){
                model.filters.startDate = moment(model.mondayOfWeek);
                model.filters.endDate = moment(model.filters.startDate).add(7, 'd');
            }else{
                if (!model.filters.startDate) {
                    model.filters.startDate = moment().startOf('week');
                    model.filters.endDate = moment(model.filters.startDate).add(7, 'd');
                }
            }


            vm.getDatas();

            //reset filter;
            $scope.$watch(() => {
                return model.filters.selectedSubject;
            }, (n) => {
                if (!n) {
                    model.filters.selectedSubject = undefined;
                }
            });


            $scope.$watch(() => {
                return model.filters.teacher;
            }, (n, o) => {
                if (n !== o && n) {
                    $timeout(vm.getDatas);

                }
            });
            $scope.$watch(() => {
                return model.filters.audience;
            }, (n, o) => {
                if (n !== o && n) {
                    $timeout(vm.getDatas);
                }
            });


        }


        $scope.$on('show-child',(_,child)=>{
            vm.getDatas();
        });


        $scope.$on('refresh-list',()=>{
            vm.getDatas();
        });

        vm.getDatas = function() {
            var p1;
            var p2;
            model.filters.startDate = moment(model.filters.startDate);
            model.filters.endDate = moment(model.filters.endDate);
            let childId = model.child ? model.child.id : undefined;
            if (SecureService.hasRight(CONSTANTS.RIGHTS.SHOW_OTHER_TEACHER)) {
                let teacherItem = model.filters.teacher ? model.filters.teacher.item : undefined;

                if (!teacherItem && !model.filters.audience) {
                    return;
                }

                p1 = LessonService.getOtherLessons([model.filters.structure.id], model.filters.startDate, teacherItem, model.filters.audience, model.filters.startDate, model.filters.endDate);
                p2 = HomeworkService.getOtherHomeworks([model.filters.structure.id], model.filters.startDate, teacherItem, model.filters.audience, model.filters.startDate, model.filters.endDate);
            } else {
                p1 = LessonService.getLessons(UtilsService.getUserStructuresIdsAsString(), model.filters.startDate, model.isUserParent, childId, model.filters.startDate, model.filters.endDate);
                p2 = HomeworkService.getHomeworks(UtilsService.getUserStructuresIdsAsString(), model.filters.startDate, model.isUserParent, childId, model.filters.startDate, model.filters.endDate);
            }

            return $q.all([p1, p2]).then(results => {
                let lessons = results[0];
                let homeworks = results[1];
                vm.createStructure(lessons, homeworks);
                model.filters.subjects = vm.getSubjects();

                let selectedDay = model.selectedDay;
                if (selectedDay) {
                    model.selectedDay = undefined;

                    vm.dayItems.map((item) => {
                        if (item.key === selectedDay.key) {
                            item.selected = true;
                            model.selectedDay = item;
                        }
                    });
                }
            });
        };

        vm.goToItemDetail = function(item) {

            let id = item.item.lesson_id || item.item.id;
            let type;

            if (item.type == 'homework' && !item.item.lesson_id) {
                type = 'Homework';
            } else {
                type = 'Lesson';
            }
            //item.type[0].toUpperCase() + item.type.slice(1);
            //let action = item.item.locked || item.type === 'homework'
            let url;
            if (item.item.locked) {
                url = '/showLessonView/';
            } else {
                url = '/edit' + type + 'View/';
            }

            if (item.item.lesson_id) {
                url = url + item.item.lesson_id + "/" + item.item.id;
            } else {
                url = url + item.item.id;
            }

            $location.url(url);

        };

        vm.selectDay = function(day) {
            vm.dayItems.map((day) => {
                day.selected = false;
            });
            day.selected = true;
            model.selectedDay = day;
        };

        vm.createStructure = function(lessons, homework) {
            vm.dayItems = {};

            model.lessons.all.splice(0, model.lessons.all.length);
            model.lessons.addRange(lessons);
            model.homeworks.all.splice(0, model.homeworks.all.length);
            model.homeworks.addRange(homework);

            vm.addArray(model.lessons.all, 'lesson');
            vm.addArray(model.homeworks.all, 'homework');
            vm.dayItems = vm.restructure(vm.dayItems);
        };

        vm.addArray = function(array, type) {
            array.forEach((item) => {
                let key = item.date.format('YYYY-MM-DD');
                if (!vm.dayItems[key]) {
                    vm.dayItems[key] = [];
                }
                vm.dayItems[key].push({
                    type: type,
                    item: item,
                    day: item.date
                });
            });
        };
        vm.getSubjects = function() {
            let subjectResults = {};
            vm.dayItems.forEach((day) => {
                day.items.forEach((item) => {
                    if (item.item.subject && item.item.subject.label) {
                        subjectResults[item.item.subject.label] = true;
                    }
                });
            });

            return Object.keys(subjectResults);

        };
        vm.restructure = function(map) {
            let result = [];
            for (let dayAsMapKey in vm.dayItems) {
                let items = vm.dayItems[dayAsMapKey];
                result.push({
                    key: dayAsMapKey,
                    items: items,
                    shortName: items[0].day.format("dddd DD MMMM YYYY").substring(0, 2),
                    shortDate: items[0].day.format("DD/MM")
                });
            }
            return result;
        };

    }]);
