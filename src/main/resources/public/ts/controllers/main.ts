import {_, angular, Behaviours, idiom as lang, model, moment, ng, notify, template} from 'entcore';
import {Homework, Homeworks, Notification, PEDAGOGIC_TYPES, Sessions, Structure, Structures, Workload} from '../model';

import {Utils} from '../utils/utils';

export let main = ng.controller('MainController',
    ['$scope', 'route', '$location', '$timeout', '$compile', async function ($scope, route, $location, $timeout, $compile) {
        console.log('MainController');

        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        $scope.calendar = model.calendar;
        $scope.notifications = [];

        $scope.display = {
            homeworks: true,
            sessions: true,
            listView: false
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
        };

        function init(){
            console.log('init');
            $scope.pageInitialized = false;
            $scope.display.listView = !model.me.hasWorkflow(WORKFLOW_RIGHTS.calendarView)
                && model.me.hasWorkflow(WORKFLOW_RIGHTS.listView);

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

        $scope.fixEditor = async (exit:number = 0) => {
            if(exit < 100 ){
                await $timeout(function () {
                    if ($('editor').length > 0){
                        $('editor').trigger('resize');
                    } else {
                        $scope.fixEditor(++exit);
                    }
                }, 50);
            }
        };

        $scope.changeViewMode = function () {
            $scope.display.listView = !$scope.display.listView
            if ($scope.display.listView) {
                $scope.display.sessions = true;
                $scope.display.homeworks = true
            }
        }

        $scope.createHomeworksLoop = function (pedagogicItem) {

            $scope.homeworks = !pedagogicItem.homeworks ? [pedagogicItem] : pedagogicItem.homeworks;
            console.log("homeworks", $scope.homeworks)
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

            $scope.structure.homeworks.all = [];
            $scope.structure.sessions.all = [];
            $scope.structure.courses.all = [];

            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessExternalData)
                && ($scope.params.user && $scope.params.user.id)
                || ($scope.params.group && $scope.params.group.id)) {

                let typeId = $scope.params.user && $scope.params.user.id ? $scope.params.user.id : $scope.params.group.id;
                let type = $scope.params.user && $scope.params.user.id ? 'teacher' : 'audience';

                await Promise.all([
                    await $scope.structure.homeworks.syncExternalHomeworks($scope.filters.startDate, $scope.filters.endDate, type, typeId),
                    await $scope.structure.sessions.syncExternalSessions($scope.filters.startDate, $scope.filters.endDate, type, typeId),
                    await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate)
                ]);
            } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessChildData) && $scope.params.child && $scope.params.child.id) {
                await Promise.all([
                    await $scope.structure.homeworks.syncChildHomeworks($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                    await $scope.structure.sessions.syncChildSessions($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                    await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate)
                ]);
            } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessOwnData)) {
                await Promise.all([
                    await $scope.structure.homeworks.syncOwnHomeworks($scope.filters.startDate, $scope.filters.endDate),
                    await $scope.structure.sessions.syncOwnSessions($scope.filters.startDate, $scope.filters.endDate),
                    await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate)
                ]);
            }

            // On lie les homeworks à leur session
            $scope.loadPedagogicItems();
            $scope.isRefreshingCalendar = false;
            $scope.safeApply();
        };


        $scope.loadPedagogicItems = () =>{
            $scope.pedagogicItems = [];

            // let sessionHomeworks = [];
            // $scope.structure.sessions.all.forEach(s => sessionHomeworks = sessionHomeworks.concat(s.homeworks));
            // $scope.pedagogicItems = $scope.pedagogicItems.concat(sessionHomeworks);

            //$scope.pedagogicItems = $scope.pedagogicItems.concat($scope.structure.homeworks.all);

            $scope.pedagogicItems = _.map($scope.structure.homeworks.all, function (item) {
                console.log("item instanceof Homework", item instanceof Homework)
                if (item instanceof Homework)
                    item["homeworks"] = [item];
                return item;
            });


            $scope.pedagogicItems = $scope.pedagogicItems.concat($scope.structure.sessions.all);

            let courses = $scope.structure.courses.all.filter(c => !($scope.structure.sessions.all.find(s => s.courseId == c._id)));
            $scope.pedagogicItems = $scope.pedagogicItems.concat(courses);

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


                let nbHomeworkInSession = 0;
                pedagogicItems.forEach(i => {
                    if(i.pedagogicType == $scope.TYPE_SESSION){
                        nbHomeworkInSession += i.homeworks.length;
                    }
                });


                let audienceIds = pedagogicItems.filter(p => p.pedagogicType === $scope.TYPE_HOMEWORK).map(p => {
                        return p.audience.id
                });
                let uniqueAudienceIdsArray = Array.from(new Set(audienceIds));
                let homeworksAreForOneAudienceOnly = uniqueAudienceIdsArray.length === 1;

                let nbHomework = pedagogicItems.filter(i => i.pedagogicType == $scope.TYPE_HOMEWORK).length;
                let nbSession = pedagogicItems.filter(i => i.pedagogicType == $scope.TYPE_SESSION).length;
                let nbCourse = pedagogicItems.filter(i => i.pedagogicType == $scope.TYPE_COURSE).length;
                let nbCourseAndSession = nbSession + nbCourse;

                let fullDayNameStr = moment(key).format('dddd LL');
                fullDayNameStr = `${fullDayNameStr[0].toUpperCase()}${fullDayNameStr.slice(1)}`;
                return {
                    descriptionMaxSize: 140,
                    date: moment(key),
                    pedagogicItems: pedagogicItems,
                    shortDate: moment(key).format('DD/MM'),
                    fullDayName: fullDayNameStr,
                    dayName: moment(key).format('dddd'),
                    shortDayName: moment(key).format('dd'),
                    nbHomework: nbHomework,
                    nbSession: nbSession,
                    nbCourse: nbCourse,
                    nbCourseAndSession: nbCourseAndSession,
                    homeworksAreForOneAudienceOnly: homeworksAreForOneAudienceOnly,
                    color: Workload.getWorkloadColor(nbHomework)
                };
            });

            $scope.selectedPedagogicDay = undefined;
            $scope.pedagogicDays = pedagogicDays;
        };

        $scope.setProgress = (homework: Homework) => {
            homework.isDone = !homework.isDone;
            homework.setProgress(homework.isDone ? Homework.HOMEWORK_STATE_DONE : Homework.HOMEWORK_STATE_TODO);
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
          return model.me.hasWorkflow(WORKFLOW_RIGHTS.manageHomework) || model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession);
        };

        $scope.hasBothViewMode = () => {
          return model.me.hasWorkflow(WORKFLOW_RIGHTS.calendarView) && model.me.hasWorkflow(WORKFLOW_RIGHTS.listView);
        };

        $scope.openSession = (sessionId: number) => {
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession)) {
                $scope.goTo('/session/update/' + sessionId);
            } else {
                $scope.goTo('/session/view/' + sessionId);
            }
            $scope.safeApply();
        };

        $scope.openSessionFromCourse = (calendar_course) => {
            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.manageSession)) {
                $scope.goTo('/session/create/' + calendar_course._id + '/' + Utils.getFormattedDate(calendar_course.startMoment));
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

        $scope.getDisplayDate = (date: any) => {
          return Utils.getDisplayDate(date);
        };

        route({
            main: async () => {
                if(!$scope.structureInitialized) await initializeStructure();
                init();
                template.open('main', 'main');
            },
            manageSession: async () => {
                if(!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'session/session-page');
            },
            manageHomework: async () => {
                if (!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'homework/homework-page');
            },
            manageVisas: async () => {
                if (!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'visa/visa-page');
            }
        });
    }]);