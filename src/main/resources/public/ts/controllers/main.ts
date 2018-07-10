import { ng, template, notify, moment, idiom as lang, _, Behaviours, model, angular } from 'entcore';
import {
    Structures, PEDAGOGIC_TYPES, USER_TYPES, Course, Student, Group, Structure, Sessions,
    Notification
} from '../model';
import {Homeworks} from '../model/homework';

export let main = ng.controller('MainController',
    ['$scope', 'route', '$location', '$timeout', '$compile', async function ($scope, route, $location, $timeout, $compile) {
        console.log('MainController');
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        $scope.calendar = model.calendar;
        $scope.notifications = [];

        $scope.display = {
            dailyHomeworks: true,
            listView: false,
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
        };

        function init(){
            console.log('init');
            $scope.pageInitialized = false;

            $timeout(async function () {
                await placingLoader();
                initializeData();
            }, 100);
        }

        async function placingLoader(exit:number = 0){
            if(exit < 20 ){
                await $timeout(function () {
                    if ($('.drawing-zone').length > 0){
                        $('#loader-calendar').appendTo('.drawing-zone');
                    }
                    else {
                        placingLoader(++exit);
                    }
                }, 200);
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
            $scope.isRefreshingCalendar = true;

            await initializeStructure();

            $scope.structure.homeworks = new Homeworks($scope.structure);
            $scope.structure.sessions = new Sessions($scope.structure);

            await $scope.syncPedagogicItems(true);

            $scope.pageInitialized = true;
            $scope.safeApply();
        }

        $scope.syncPedagogicItems = async (firstRun?: boolean) => {
            if(!firstRun && !$scope.pageInitialized){
                // Prevent from executing twice from the front
                return;
            }
            console.log('syncPedagogicItems');
            if (moment($scope.filters.startDate).isAfter(moment($scope.filters.endDate))) {
                // Dates incorrectes
                return;
            }
            $scope.isRefreshingCalendar = true;
            $scope.safeApply();
            let typeId = undefined;
            let type = undefined;

            if($scope.params.user && $scope.params.user.id) {
                typeId = $scope.params.user.id;
                type = 'teacher';
            } else if ($scope.params.group && $scope.params.group.id) {
                typeId = $scope.params.group.id;
                type = 'audience';
            }

            if(!!typeId && !!type){
                await Promise.all([
                    await $scope.syncHomeworks(typeId, type),
                    await $scope.syncSessions(typeId, type),
                    await $scope.syncCourses(typeId, type)
                ]);
            } else {
                await Promise.all([
                    await $scope.syncHomeworks(),
                    await $scope.syncSessions(),
                    await $scope.syncCourses()
                ]);
            }

            // On lie les homeworks à leur session
            $scope.structure.sessions.all.forEach(s => s.homeworks = $scope.structure.homeworks.all.filter(h => h.session_id === s.id));
            $scope.loadPedagogicItems();
            $scope.isRefreshingCalendar = false;
            $scope.safeApply();
        };

        $scope.syncHomeworks = async (typeId?: string, type?: string) => {
            $scope.structure.homeworks.all = [];
            if(!!typeId && !!type){
                await $scope.structure.homeworks.sync($scope.filters.startDate, $scope.filters.endDate, typeId, type);
            } else {
                await $scope.structure.homeworks.sync($scope.filters.startDate, $scope.filters.endDate);
            }
        };

        $scope.syncCourses = async (typeId?: string, type?: string) => {
            $scope.structure.courses.all = [];
            if(!!typeId && !!type){
                await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate);
            } else {
                await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate);
            }
        };

        $scope.syncSessions = async (typeId?: string, type?: string) => {
            $scope.structure.sessions.all = [];
            if(!!typeId && !!type){
                await $scope.structure.sessions.sync($scope.filters.startDate, $scope.filters.endDate, typeId, type);
            } else {
                await $scope.structure.sessions.sync($scope.filters.startDate, $scope.filters.endDate);
            }

        };

        $scope.loadPedagogicItems = () =>{
            $scope.pedagogicItems = [];

            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.structure.homeworks.all);
            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.structure.sessions.all);
            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.structure.courses.all);

            $scope.loadCalendarItems();
            $scope.loadPedagogicDays();
        };

        $scope.loadCalendarItems = () => {
            $scope.dailyHomeworks = $scope.structure.homeworks.all.filter(h => !h.session_id);

            $scope.calendarItems = $scope.pedagogicItems.filter(i => i.pedagogicType !== PEDAGOGIC_TYPES.TYPE_HOMEWORK);

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
        };

        $scope.selectPedagogicDay = (pedagogicDay) => {
            $scope.pedagogicDays.forEach(p => p.selected = false);
            pedagogicDay.selected = true;
            $scope.selectedPedagogicDay = pedagogicDay;
        };

        $scope.$watch(() => $scope.calendar.firstDay, () => {
            if(!$scope.pageInitialized) return;

            let calendarMode = $scope.calendar.increment;
            let momentFirstDay = moment($scope.calendar.firstDay);

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


        /**
         * Toast the response
         * @param response
         * @returns {any}
         */
        $scope.toastHttpCall = (response) => {
            if(response.succeed) {
                $scope.notifications.push(new Notification(lang.translate(response.toastMessage), 'confirm'));
            } else {
                $scope.notifications.push(new Notification(lang.translate(response.toastMessage), 'error'));
            }
            $scope.safeApply();
            return response;
        };

        $scope.switchStructure = (structure: Structure) => {
            $scope.syncStructure(structure);
        };


        /**
         * Returns student group
         * @param {Student} user user group
         * @returns {Group}
         */
        $scope.getStudentGroup = (user: Student): Group => {
            return _.findWhere($scope.structure.groups.all, { externalId: user.classes[0] });
        };

        $scope.params = {
            user: null,
            group: null,
            updateItem: null,
            dateFromCalendar: null
        };

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

        $scope.hasAtLeastOneCreateRight = () => {
          return model.me.hasWorkflow(WORKFLOW_RIGHTS.createHomework) || model.me.hasWorkflow(WORKFLOW_RIGHTS.createLesson);
        };

        $scope.hasBothViewMode = () => {
          return model.me.hasWorkflow(WORKFLOW_RIGHTS.calendarView) && model.me.hasWorkflow(WORKFLOW_RIGHTS.listView);
        };

        $scope.openSession = (sessionId: number, fromCourse: Boolean = false) => {
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession)) {
                if(fromCourse)
                    $scope.goTo('/session/create/' + sessionId);
                else
                    $scope.goTo('/session/update/' + sessionId);
            } else {
                $scope.goTo('/session/view/' + sessionId);
            }
            $scope.safeApply();
        };

        $scope.openHomework = (homeworkId: number) => {
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageHomework)) {
                $scope.goTo('/homework/update/' + homeworkId);
            } else {
                $scope.goTo('/homework/view/' + homeworkId);
            }
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
                init();
                template.open('main', 'main');
            },
            manageSession: async () => {
                if(!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'session/page-session');
            },
            manageHomework: async () => {
                if(!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'homework/page-homework');
            }
        });
    }]);