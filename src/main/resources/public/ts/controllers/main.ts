import { ng, template, notify, moment, idiom as lang, _, Behaviours, model } from 'entcore';
import { Structures, USER_TYPES, Course, Student, Group, Structure } from '../model';
import {Homeworks} from '../model/homework';

export let main = ng.controller('MainController',
    ['$scope', 'route', '$location', async function ($scope, route, $location) {

        $scope.notifications = [];

        $scope.calendarLoader = {
            show: false,
            display: () => {
                $scope.calendarLoader.show = true;
                $scope.safeApply();
            },
            hide: () => {
                $scope.calendarLoader.show = false;
                $scope.safeApply();
            }
        };

        $scope.ITEM_HOMEWORK = 1;
        $scope.ITEM_SESSION = 2;

        $scope.filters = {
            startDate: moment().startOf('isoWeek').toDate(),
            endDate: moment().endOf('isoWeek').toDate()
        };


        /**
         * Synchronize a structure.
         */
        $scope.syncStructure = async (structure: Structure) => {
            $scope.structure = structure;
            $scope.structure.eventer.once('refresh', () => $scope.safeApply());
            await $scope.structure.sync();
            switch (model.me.type) {
                case USER_TYPES.teacher : {
                    $scope.params.user = model.me.userId;
                }
                break;
                case USER_TYPES.student : {
                    $scope.params.group = _.findWhere($scope.structure.groups.all, {id: model.me.classes[0]});
                }
                break;
                case USER_TYPES.relative : {
                    if ($scope.structure.students.all.length > 0) {
                        let externalClassId = $scope.structure.students.all[0].classes[0];
                        $scope.params.group = _.findWhere($scope.structure.groups.all, { externalId: externalClassId });
                        $scope.currentStudent = $scope.structure.students.all[0];
                    }
                }
            }
            if (!$scope.isPersonnel()) {
                $scope.getTimetable();
            } else {
                $scope.safeApply();
            }
        };

        async function initializeData(){
            $scope.structures = new Structures();
            await $scope.structures.sync();
            $scope.structure = $scope.structures.first();
            await $scope.syncStructure($scope.structure);

            $scope.homeworks = new Homeworks($scope.structure);
            await $scope.syncHomework();


            $scope.loadPedagogicItems();

            $scope.safeApply();
        }

        $scope.syncHomework = async () => {
            await $scope.homeworks.sync($scope.filters.startDate, $scope.filters.endDate);
        };

        $scope.loadPedagogicItems = () =>{
            $scope.pedagogicItems = [];

            $scope.homeworks.all.forEach(i => i.itemType = $scope.ITEM_HOMEWORK);
            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.homeworks.all);

            console.log('pedagogicItems', $scope.pedagogicItems);

            $scope.loadCalendarItems();
            $scope.loadPedagogicDays();
        };

        $scope.loadCalendarItems = () => {
            $scope.calendarItems = $scope.pedagogicItems;
            $scope.calendarItems.forEach(i => {
                i.locked = true;
                i.is_periodic = false;
            });
        };

        $scope.loadPedagogicDays = () => {

            $scope.pedagogicItems.sort(function (a, b) {
                return new Date(a.startMoment).getTime() - new Date(b.startMoment).getTime();
            });

            let group_to_values = $scope.pedagogicItems.reduce(function (obj, item) {
                let date = item.startMoment.format('YYYY-MM-DD');
                obj[date] = obj[date] || [];
                obj[date].push(item);
                return obj;
            }, {});

            let pedagogicDays = Object.keys(group_to_values).map(function (key) {
                let pedagogicItems = group_to_values[key];
                return {
                    descriptionMaxSize: 140,
                    date: moment(key),
                    pedagogicItems: pedagogicItems,
                    shortDate: moment(key).format('DD/MM'),
                    dayName: moment(key).format('dddd'),
                    nbHomework: pedagogicItems.filter(i => i.itemType == $scope.ITEM_HOMEWORK).length,
                    nbSession: pedagogicItems.filter(i => i.itemType == $scope.ITEM_SESSION).length,
                };
            });

            pedagogicDays.sort(function (a, b) {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });

            $scope.pedagogicDays = pedagogicDays;
            console.log('pedagogicDays', pedagogicDays);
        };

        $scope.selectPedagogicDay = (pedagogicDay) => {
            $scope.pedagogicDays.forEach(p => p.selected = false);
            pedagogicDay.selected = true;
            $scope.selectedPedagogicDay = pedagogicDay;
        };

        initializeData();

        $scope.switchStructure = (structure: Structure) => {
            $scope.syncStructure(structure);
        };

        /**
         * Returns if current user is a personnel
         * @returns {boolean}
         */
        $scope.isPersonnel = (): boolean => model.me.type === USER_TYPES.personnel;

        /**
         * Returns if current user is a teacher
         * @returns {boolean}
         */
        $scope.isTeacher = (): boolean => model.me.type === USER_TYPES.teacher;

        /**
         * Returns if current user is a student
         * @returns {boolean}
         */
        $scope.isStudent = (): boolean => model.me.type === USER_TYPES.student;

        /**
         * Returns if current user is a relative profile
         * @returns {boolean}
         */
        $scope.isRelative = (): boolean => model.me.type === USER_TYPES.relative;

        /**
         * Returns student group
         * @param {Student} user user group
         * @returns {Group}
         */
        $scope.getStudentGroup = (user: Student): Group => {
            return _.findWhere($scope.structure.groups.all, { externalId: user.classes[0] });
        };

        /**
         * Get timetable bases on $scope.params object
         * @returns {Promise<void>}
         */
        $scope.getTimetable = async () => {
            if ($scope.params.user !== null
                && $scope.params.group !== null) {
                notify.error('');
            } else  {
                $scope.calendarLoader.display();
                $scope.structure.courses.all = [];
                await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group);
                $scope.calendarLoader.hide();
            }
        };

        $scope.getTeacherTimetable = () => {
            $scope.params.group = null;
            $scope.params.user = model.me.userId;
            $scope.getTimetable();
        };

        $scope.params = {
            user: null,
            group: null,
            updateItem: null,
            dateFromCalendar: null
        };

        if ($scope.isRelative()) {
            $scope.currentStudent = null;
        }

        $scope.safeApply = (): Promise<any> => {
            return new Promise((resolve, reject) => {
                let phase = $scope.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (resolve && (typeof(resolve) === 'function')) {
                        resolve();
                    }
                } else {
                    if (resolve && (typeof(resolve) === 'function')) {
                        $scope.$apply(resolve);
                    } else {
                        $scope.$apply()();
                    }
                }
            });
        };

        /**
         * Course creation
         */
        $scope.createSession = () => {
            const cdtRights = Behaviours.applicationsBehaviours.cdt.rights;
            /*if (model.me.hasWorkflow(cdtRights.workflow.create)) {
                $scope.goTo('/session/create');
            }*/
            $scope.goTo('/session/create');
        };

        $scope.createHomework = () => {
            $scope.goTo('/homework/create/');
        };

        $scope.goTo = (state: string) => {
            $location.path(state);
            $scope.safeApply();
        };

        $scope.translate = (key: string) => lang.translate(key);

        $scope.calendarUpdateItem = (item) => {
            $scope.params.updateItem =item;
            $scope.goTo('/create');
        };

        $scope.calendarDropItem = (item) => {
           $scope.calendarUpdateItem(item);
        };

        $scope.calendarResizedItem = (item) => {
            $scope.calendarUpdateItem(item);
        };

        let initTriggers = () => {
            model.calendar.eventer.off('calendar.create-item');
            model.calendar.eventer.on('calendar.create-item', () => {
                console.log("clic dans un item ?")
            });
        };

        initTriggers();

        /**
         * Subscriber to directive calendar changes event
         */
        $scope.$watch(() => {
            return model.calendar.firstDay
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                initTriggers();
                if (moment(oldValue).format('DD/MM/YYYY') !== moment(newValue).format('DD/MM/YYYY')) {
                    $scope.getTimetable();
                }
            }
        }, true);

        $scope.$watch(() => { return model.calendar.increment }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                initTriggers();
                $scope.getTimetable();
            }
        }, true);

        route({
            main: () => {
                template.open('main', 'main');
            },
            createSession: () => {
                $scope.params.group;
                template.open('main', 'createSession');
            },
            manageHomework: () => {
                console.log('route.manageHomework');
                template.open('main', 'homework/manage-homework');
            }
        });
    }]);