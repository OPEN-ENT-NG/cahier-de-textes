import { ng, template, notify, moment, idiom as lang, _, Behaviours, model } from 'entcore';
import {Structures, PEDAGOGIC_TYPES, USER_TYPES, Course, Student, Group, Structure, Sessions} from '../model';
import {Homeworks} from '../model/homework';

export let main = ng.controller('MainController',
    ['$scope', 'route', '$location', '$timeout', async function ($scope, route, $location, $timeout) {

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

        $scope.TYPE_HOMEWORK = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
        $scope.TYPE_SESSION = PEDAGOGIC_TYPES.TYPE_SESSION;
        $scope.TYPE_COURSE = PEDAGOGIC_TYPES.TYPE_COURSE;

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
                //$scope.getTimetable();
            } else {
                $scope.safeApply();
            }
        };

        $timeout(async function () {
            await placingLoader();
            initializeData();
        }, 100);

        async function placingLoader(){
            while (true) {
                console.log('while');
                let loaderHasGoodPosition = false;
                await $timeout(function () {
                    if (!!$('#loader-calendar').parent().prop('className')) {
                        if ($('#loader-calendar').parent().prop('className').includes('drawing-zone')) {
                            console.log('GOOD place');
                            loaderHasGoodPosition = true;
                        } else {
                            console.log('Bad place');
                            $('#loader-calendar').appendTo('.drawing-zone');
                        }
                    }
                    else {
                        loaderHasGoodPosition = true;
                    }
                }, 100);

                if (loaderHasGoodPosition) break;
            }
        }

        async function initializeStructure(){
            $scope.structures = new Structures();
            await $scope.structures.sync();
            $scope.structure = $scope.structures.first();
            await $scope.syncStructure($scope.structure);
            $scope.structureInitialized = true;
        }

        async function initializeData(){
            console.log('initializeData');
            $scope.isRefreshingCalendar = true;

            await initializeStructure();

            $scope.homeworks = new Homeworks($scope.structure);
            $scope.sessions = new Sessions($scope.structure);

            await $scope.syncPedagogicItems();

            $scope.pageInitialized = true;
            $scope.safeApply();
        }

        $scope.syncPedagogicItems = async () => {
            if (moment($scope.filters.startDate).isAfter(moment($scope.filters.endDate))) {
                // Dates incorrectes
                return;
            }
            $scope.isRefreshingCalendar = true;
            $scope.safeApply();

            await Promise.all([await $scope.syncHomeworks(),await $scope.syncSessions(), await $scope.syncCourses()]);

            $scope.loadPedagogicItems();
            $scope.isRefreshingCalendar = false;
            $scope.safeApply();
        };

        $scope.syncHomeworks = async () => {
            $scope.homeworks.all = [];
            await $scope.homeworks.sync($scope.filters.startDate, $scope.filters.endDate);
        };

        $scope.syncCourses = async () => {
            $scope.structure.courses.all = [];
            await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate);
        };

        $scope.syncSessions = async () => {
            $scope.sessions.all = [];
            await $scope.sessions.sync($scope.filters.startDate, $scope.filters.endDate);
        };

        $scope.loadPedagogicItems = () =>{
            $scope.pedagogicItems = [];

            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.homeworks.all);
            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.sessions.all);
            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.structure.courses.all);

            console.log('pedagogicItems', $scope.pedagogicItems);

            $scope.loadCalendarItems();
            $scope.loadPedagogicDays();
        };

        $scope.loadCalendarItems = () => {
            $scope.calendarItems = $scope.pedagogicItems;

            $scope.isRefreshingCalendar = false;
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

                let nbHomework = pedagogicItems.filter(i => i.pedagogicType == $scope.TYPE_HOMEWORK).length;
                let nbSession = pedagogicItems.filter(i => i.pedagogicType == $scope.TYPE_SESSION).length;
                let nbCourse = pedagogicItems.filter(i => i.pedagogicType == $scope.TYPE_COURSE).length;
                let nbCourseAndSession = nbSession + nbCourse;

                return {
                    descriptionMaxSize: 140,
                    date: moment(key),
                    pedagogicItems: pedagogicItems,
                    shortDate: moment(key).format('DD/MM'),
                    dayName: moment(key).format('dddd'),
                    shortDayName: moment(key).format('dd'),
                    nbHomework: nbHomework,
                    nbSession: nbSession,
                    nbCourse: nbCourse,
                    nbCourseAndSession: nbCourseAndSession,
                };
            });

            $scope.selectedPedagogicDay = undefined;
            $scope.pedagogicDays = pedagogicDays;
            console.log('pedagogicDays', pedagogicDays);
        };

        $scope.selectPedagogicDay = (pedagogicDay) => {
            $scope.pedagogicDays.forEach(p => p.selected = false);
            pedagogicDay.selected = true;
            $scope.selectedPedagogicDay = pedagogicDay;
        };

        $scope.$watch(() => model.calendar.firstDay, () => {
            if(!$scope.pageInitialized) return;
            
            console.log('Watch model.calendar.firstDay : increment=' + model.calendar.increment);
            let calendarMode = model.calendar.increment;
            let momentFirstDay = moment(model.calendar.firstDay);

            switch(calendarMode){
                case 'month':
                    $scope.filters.startDate = momentFirstDay.clone().startOf('month');
                    $scope.filters.endDate = momentFirstDay.clone().endOf('month');
                    break;
                case 'week':
                    $scope.filters.startDate = momentFirstDay.clone().startOf('isoWeek');
                    $scope.filters.endDate = momentFirstDay.clone().endOf('isoWeek');
                    break;
                case 'day':
                    $scope.filters.startDate = momentFirstDay.clone().startOf('day');
                    $scope.filters.endDate = momentFirstDay.clone().endOf('day');
                    break;
            }
            $scope.syncPedagogicItems();
        });

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
        // $scope.getTimetable = async () => {
        //     if ($scope.params.user !== null
        //         && $scope.params.group !== null) {
        //         notify.error('');
        //     } else  {
        //         $scope.calendarLoader.display();
        //         $scope.structure.courses.all = [];
        //         await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group);
        //         $scope.calendarLoader.hide();
        //     }
        // };


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

        route({
            main: async () => {
                if(!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'main');
            },
            manageSession: async () => {
                if(!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'session/manage-session');
            },
            manageHomework: async () => {
                if(!$scope.structureInitialized) await initializeStructure();
                console.log('route.manageHomework');
                template.open('main', 'homework/manage-homework');
            }
        });
    }]);