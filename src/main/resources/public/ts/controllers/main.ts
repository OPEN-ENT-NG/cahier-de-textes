import {_, Behaviours, idiom as lang, model, moment, ng, template} from 'entcore';
import {
    Course,
    Homework,
    Homeworks,
    PEDAGOGIC_TYPES,
    Session,
    Sessions,
    Structure,
    Structures,
    Toast,
    Workload
} from '../model';
import {Utils} from '../utils/utils';
import {ProgressionSessions} from "../model/Progression";

export let main = ng.controller('MainController',
    ['$scope' ,'route', '$location', '$timeout', '$compile', async function ($scope, route, $location, $timeout, $compile) {
        const WORKFLOW_RIGHTS = Behaviours.applicationsBehaviours.diary.rights.workflow;
        $scope.calendar = model.calendar;
        $scope.notifications = [];
        $scope.legendLightboxIsVisible = false;
        $scope.display = {
            homeworks: true,
            sessions: true,
            listView: false,
            progression: false,
            sessionList : false,
            homeworksFilter: true,
        };
        $scope.isAChildOrAParent = Utils.isAChildOrAParent(model.me.type);
        $scope.isChild = Utils.isChild(model.me.type);
        $scope.isRelative = Utils.isRelative(model.me.type);

        $scope.TYPE_HOMEWORK = PEDAGOGIC_TYPES.TYPE_HOMEWORK;
        $scope.TYPE_SESSION = PEDAGOGIC_TYPES.TYPE_SESSION;
        $scope.TYPE_COURSE = PEDAGOGIC_TYPES.TYPE_COURSE;

        $scope.filters = {
            startDate: moment().startOf('isoWeek').toDate(),
            endDate: moment().endOf('isoWeek').toDate()
        };

        $scope.setLegendLightboxVisible = (state:boolean) => {
            $scope.legendLightboxIsVisible = state;
            if($scope.legendLightboxIsVisible){
                template.open('infoBulleTemplate', 'main/toolTip-legendeTemplate');
            }
        };
        $scope.transformDateToFrenchDate = (date: Date) => {
            return moment(date).format("dddd D MMMM YYYY");
        };
        /**
         * Synchronize a structure.
         */
        $scope.syncStructure = async (structure: Structure) => {
            $scope.structure = structure;
            $scope.structure.eventer.once('refresh', () => $scope.safeApply());
            await $scope.structure.sync();
        };

        function init() {
            $scope.search = "";
            $scope.typeUser= model.me.type;
            $scope.pageInitialized = false;
            $scope.display.listView = !model.me.hasWorkflow(WORKFLOW_RIGHTS.calendarView)
                && model.me.hasWorkflow(WORKFLOW_RIGHTS.listView);

            $timeout(async function () {
                await placingLoader();
                initializeData();
            }, 100);

            if(Utils.isRelative(model.me.type)) {
                $scope.display.todo = true;
                $scope.display.done = true;
            };
            if(model.me.type === "ENSEIGNANT"){
                $scope.display.todo = true;
                $scope.display.done = true;
            }

            if(Utils.isChild(model.me.type)) {
                $scope.display.todo = true;
                $scope.display.done = false;
            };

            if($scope.structure.students.all.length < 2) {
                $scope.params.child = $scope.structure.students.all[0];
            }
        }

        async function placingLoader(exit: number = 0) {
            if (exit < 20) {
                await $timeout(function () {
                    if ($('.drawing-zone').length > 0) {
                        $('#loader-calendar').appendTo('.drawing-zone');
                    }
                    else {
                        placingLoader(++exit);
                    }
                }, 200);
            }
        }

        $scope.fixEditor = async (exit: number = 0) => {
            if (exit < 100) {
                await $timeout(function () {
                    if ($('editor').length > 0) {
                        $('editor').trigger('resize');
                    } else {
                        $scope.fixEditor(++exit);
                    }
                }, 50);
            }
        };

        $scope.changeViewCalendar = function () {
            $scope.goTo('/view');
            $scope.display.listView = false
            if ($scope.display.listView) {
                $scope.display.sessions = true;
                $scope.display.homeworks = true ;
            }
        }
        $scope.changeViewList = function () {
            $scope.filters.endDate = moment($scope.filters.startDate).add('2','weeks').add('4','day');
            $scope.goTo('/list');
            $scope.display.listView = true
            if(!Utils.isAChildOrAParent(model.me.type)){
                $scope.display.sessionList = true;
            }else{
                $scope.display.sessionList = false;
            }
            if ($scope.display.listView) {
                $scope.display.sessions = true;
                $scope.display.homeworks = true ;
            }
        };
        $scope.createHomeworksLoop = function (pedagogicItem) {

            $scope.homeworks = !pedagogicItem.homeworks ? [pedagogicItem] : pedagogicItem.homeworks;
        };

        async function initializeStructure() {
            $scope.structures = new Structures();
            await $scope.structures.sync();
            $scope.structure = $scope.structures.first();
            await $scope.syncStructure($scope.structure);
            $scope.structureInitialized = true;
        }

        async function initializeData() {
            $scope.isRefreshingCalendar = true;

            await initializeStructure();

            $scope.structure.homeworks = new Homeworks($scope.structure);
            $scope.structure.sessions = new Sessions($scope.structure);
            $scope.progressions = new ProgressionSessions(model.me.userId);
            $scope.progressionsToDisplay = new ProgressionSessions(model.me.userId);
            await $scope.syncPedagogicItems(true);

            $scope.pageInitialized = true;
            model.calendar.setDate(moment());

            $scope.safeApply();

        }

        $scope.syncPedagogicItems = async (firstRun?: boolean) => {
            if (!firstRun && !$scope.pageInitialized) {
                // Prevent from executing twice from the front
                return;
            }
            if (moment($scope.filters.startDate).isAfter(moment($scope.filters.endDate))) {
                // Dates incorrectes
                return;
            }
            $scope.isRefreshingCalendar = true;
            $scope.safeApply();

            $scope.structure.homeworks.all = [];
            $scope.structure.sessions.all = [];
            $scope.structure.courses.all = [];
            $scope.progressions.all =[];



            if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessExternalData)
                && ($scope.params.user && $scope.params.user.id)
                || ($scope.params.group && $scope.params.group.id)) {

                let typeId = $scope.params.user && $scope.params.user.id ? $scope.params.user.id : $scope.params.group.id;
                let type = $scope.params.user && $scope.params.user.id ? 'teacher' : 'audience';
                await Promise.all([
                    await $scope.structure.homeworks.syncExternalHomeworks($scope.filters.startDate, $scope.filters.endDate, type, typeId),
                    await $scope.progressionsToDisplay.sync(),
                    await $scope.structure.sessions.syncExternalSessions( $scope.filters.startDate, $scope.filters.endDate, type, typeId),
                    await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate)

                ]);
            } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessChildData) && $scope.params.child && $scope.params.child.id) {

                await Promise.all([
                    await $scope.structure.homeworks.syncChildHomeworks($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                    await $scope.progressions.sync(),
                    await $scope.structure.sessions.syncChildSessions($scope.filters.startDate, $scope.filters.endDate, $scope.params.child.id),
                    await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate)
                ]);
            } else if (model.me.hasWorkflow(WORKFLOW_RIGHTS.accessOwnData)) {
                await Promise.all([
                    await $scope.structure.homeworks.syncOwnHomeworks($scope.structure,$scope.filters.startDate, $scope.filters.endDate),
                    await $scope.progressions.sync(),
                    await $scope.structure.sessions.syncOwnSessions($scope.structure,$scope.filters.startDate, $scope.filters.endDate),
                    await $scope.structure.courses.sync($scope.structure, $scope.params.user, $scope.params.group, $scope.filters.startDate, $scope.filters.endDate)
                ]);
            }


            // On lie les homeworks à leur session
            $scope.loadPedagogicItems();
            $scope.isRefreshingCalendar = false;
            delete($scope.session);

            $scope.safeApply();
        };
        /*
        display the progressions that match the search query
         */
        $scope.filterProgression = (search) =>{
            $scope.progressionsToDisplay.all =  Utils.filterProgression( search,  $scope.progressions.all);
        };


        $scope.loadPedagogicItems = () => {
            $scope.pedagogicItems = [];

            $scope.pedagogicItems = _.map($scope.structure.homeworks.all, function (item) {
                if (item instanceof Homework) {
                    item["homeworks"] = [item];
                }
                return item;
            });


            if(Utils.isAChildOrAParent(model.me.type)){
                $scope.structure.sessions.all.map((s,i) =>{
                    if(!s.isPublished){
                        $scope.structure.sessions.all.splice(i,1);
                    }
                })
                $scope.structure.homeworks.all.map((h,i) =>{
                    if(!h.isPublished){
                        $scope.structure.homeworks.all.splice(i,1);
                    }
                })
            }

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

            $scope.getNbHomework = (pedagogicDay) =>{
                let nbHomework = 0;
                pedagogicDay.pedagogicItems.map(p => {
                    if(p.pedagogicType === $scope.TYPE_HOMEWORK){
                        if($scope.display.todo && !p.isDone){
                            nbHomework++;
                        }
                        if($scope.display.done && p.isDone){
                            nbHomework++;
                        }
                    }
                });
                return nbHomework;
            };
            let pedagogicDays = Object.keys(group_to_values).map(function (key) {
                let pedagogicItems = group_to_values[key];


                let nbHomeworkInSession = 0;
                let nbHomework = 0;
                pedagogicItems.forEach(i => {

                    if (i.pedagogicType === $scope.TYPE_HOMEWORK) {
                        nbHomework ++;
                    }
                });



                let audienceIds = pedagogicItems.filter(p => p.pedagogicType === $scope.TYPE_HOMEWORK).map(p => {
                    if(p.audience)
                        return p.audience.id
                });
                let uniqueAudienceIdsArray = Array.from(new Set(audienceIds));
                let homeworksAreForOneAudienceOnly = uniqueAudienceIdsArray.length === 1;


                let nbSession = pedagogicItems.filter(i => i.pedagogicType === $scope.TYPE_SESSION).length;
                let nbCourse = pedagogicItems.filter(i => i.pedagogicType === $scope.TYPE_COURSE).length;
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

            $scope.pedagogicDays = pedagogicDays;
            $scope.initDisplay();
        };


        function containsSession(c: any) {
            return c.nbSession != 0;

        }

        function containsHomeworks(c: any) {
            let isDisplayedByDefault = false
            c.pedagogicItems.map(pi => {
                if(pi.pedagogicType === $scope.TYPE_HOMEWORK )
                    if($scope.isChild){
                        if(!pi.isDone){
                            isDisplayedByDefault = true;

                        }
                    }else{
                        isDisplayedByDefault = true;
                    }
            });
            return c.nbHomework !=  0 && isDisplayedByDefault ;
        }

        $scope.initDisplay = () =>{
            let displayedNumberSession,displayedNumberHomework = 3 ;
            displayedNumberSession =  displayedNumberHomework;
            let nbSessionDisplayed = 0;
            let nbHomeworkDisplayed = 0;
            let indexMinChildHomework = $scope.pedagogicDays.length
            let indexMaxChildHomework = -1;

            //hiding all the days
            $scope.pedagogicDays.map(c =>{
                c.displayed = false;
            });

            //display session
            $scope.pedagogicDays.map((c,index) =>{
                if(c.shortDate === "17/04")

                containsSession(c) ;
                if(  containsSession(c)  && nbSessionDisplayed < 3 ) {
                    c.displayed = true;
                    nbSessionDisplayed++;
                }
                if( containsHomeworks(c)  && nbHomeworkDisplayed < 3 ) {
                    if($scope.isChild){
                        (indexMinChildHomework > index) ? indexMinChildHomework = index : indexMinChildHomework ;
                        (indexMaxChildHomework < index) ? indexMaxChildHomework = index : indexMaxChildHomework ;
                    }else{
                        c.displayed = true;

                    }
                    nbHomeworkDisplayed++;
                }
            });
            if($scope.isChild){
                $scope.pedagogicDays.map((c,index) =>{
                    if(index => indexMinChildHomework && index <= indexMaxChildHomework){
                        c.displayed = true;
                    }
                })

            }

        };

        $scope.setProgress = (homework: Homework) => {
            homework.setProgress(homework.isDone ? Homework.HOMEWORK_STATE_DONE : Homework.HOMEWORK_STATE_TODO);
        };

        $scope.selectPedagogicDay = (pedagogicDay) => {
            $scope.pedagogicDays.forEach(p => p.selected = false);
            pedagogicDay.selected = true;
            $scope.selectedPedagogicDay = pedagogicDay;
        };



        model.calendar.on('date-change', function() {


            $scope.calendar = model.calendar;

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
                    if($scope.display.listview)
                        $scope.filters.endDate = momentFirstDay.clone().endOf('isoWeek');
                    else
                        $scope.filters.endDate = moment($scope.filters.startDate).add('2','weeks').add('4','day');
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
            if (response.succeed) {
                $scope.notifications.push(new Toast(response.toastMessage, 'confirm'));
            } else {
                $scope.notifications.push(new Toast(response.toastMessage, 'error'));
            }
            $scope.safeApply();
            return response;
        };

        $scope.switchStructure = async (structure: Structure) => {
            $scope.syncStructure(structure);
            await  $scope.syncPedagogicItems();
            $scope.safeApply();
        };


        $scope.newProgressionForm = () =>{
            $scope.goTo('/progression/create');

            $scope.safeApply();
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

// $scope.hasBothViewMode = () => {
//     return model.me.hasWorkflow(WORKFLOW_RIGHTS.calendarView) && model.me.hasWorkflow(WORKFLOW_RIGHTS.listView);
// };

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

        $scope.setHomeworkProgress =(homework)=>{
            if(homework.isDone)
                $scope.notifications.push(new Toast('homework.done.notification', 'info'));
            else
                $scope.notifications.push(new Toast('homework.todo.notification', 'info'));

            $scope.setProgress(homework);
            $scope.safeApply();
        };

        $scope.publishSession = async (item ,event) =>   {
            event.stopPropagation();
            let sessionToPublish = new Session($scope.structure);
            sessionToPublish.id = item.id;
            $scope.toastHttpCall(await sessionToPublish.publish())
            $scope.syncPedagogicItems();

            $scope.safeApply();
        };
        $scope.newProgressionForm = () =>{
            $scope.goTo('/progression/create');

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
            $scope.params.updateItem = item;
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


//handle the drop event
        $scope.dropped = function(dragEl, dropEl) {
            if (dragEl == dropEl)
                return;
            // this is your application logic, do whatever makes sense
            let progression = $( '#'+dragEl );
            let id_progressionOrSession = progression[0].children[0].textContent;
            let sessionOrCourse = $('#'+dropEl);
            let typeCourseSession =sessionOrCourse[0].classList[2];
            let idCourseSession = sessionOrCourse[0].children[0].textContent;;
            if(progression[0].classList[2]=="progression-item-draggable"){
                if (typeCourseSession == "TYPE_SESSION"){
                    $scope.updateSession(idCourseSession,id_progressionOrSession);
                }else if(typeCourseSession == "TYPE_COURSE"){
                    let date = sessionOrCourse[0].children[1].textContent;
                    $scope.createSessionFromProgression(id_progressionOrSession,idCourseSession,date);
                }
            }else if (progression[0].classList[2] == "TYPE_SESSION" ){
                if (typeCourseSession == "TYPE_SESSION" ){
                    $scope.sessionToSession(id_progressionOrSession,idCourseSession)
                }else
                if(typeCourseSession == "TYPE_COURSE" ){
                    let date = sessionOrCourse[0].children[1].textContent;
                    $scope.sessionToCourse(id_progressionOrSession,idCourseSession,date)
                }

            }
        };
        /*
        Handle a session drop on another session
         */
        $scope.sessionToSession = async (idSessionDrag , idSessionDrop) =>{
            console.log("sTOs");
            let sessionDrag,sessionDrop;
            $scope.calendarItems.map(async session => {
                if (session.id == idSessionDrag) {
                    sessionDrag = session;
                }
            });
            $scope.calendarItems.map(async session => {
                if (session.id == idSessionDrop) {
                    $scope.session = session;
                }
            });
            $scope.session.getSessionInfo(sessionDrag);

            $scope.goTo('/session/update/' + $scope.session.id );
        };



        /*
               Handle a session drop on course
         */
        $scope.sessionToCourse = async (idSession , idCourse,date) =>{
            console.log("sTOc");
            let sessionDrag;
            let course = new Course($scope.structure, idCourse);

            $scope.calendarItems.map(async session => {
                if (session.id == idSession) {
                    sessionDrag= session;
                }
            });


            // Formating date
            date = date.split('/').join('-');
            date = date.split("-");
            let tempDateAnnee = date[2];
            date[2] = date[0];
            date[0] = tempDateAnnee;
            date = date.join("-");

            //insert data and refresh calendar
            await course.sync(date, date);
            let session= new Session($scope.structure,course);
            session.setFromCourseAndSession(course,sessionDrag);
            session.opened = true;
            $scope.session = session;

            $scope.goTo('/session/create' );


        };

        /*
               Handle a progression dropped on a session
                */
        $scope.updateSession = async (idSession, idProgression) => {

            let progressionDragged, sessionDroped;
            $scope.progressions.all.map(progression => {
                if (progression.id == idProgression)
                {
                    progressionDragged = progression;
                }
            });
            // progressionDragged.toSession(idSession);

            $scope.calendarItems.map(async session => {
                if (session.id == idSession) {
                    sessionDroped = session;
                }
            });
            sessionDroped.setFromProgression(progressionDragged);
            progressionDragged.progression_homeworks.map(
                ph => {
                    let homework = new Homework($scope.structure)
                    homework.estimatedTime = ph.estimatedTime;
                    homework.description = ph.description;
                    homework.subject = ph.subject;
                    homework.type = ph.type;
                    homework.session = sessionDroped ;
                    console.log(sessionDroped.type)
                    sessionDroped.homeworks.push(homework);

                }
            );

            $scope.session = sessionDroped;

            $scope.syncPedagogicItems();

            $scope.safeApply();
            $scope.goTo('/session/update/' + idSession );


        };

        /*
        Handle a progression dropped on a course
         */
        $scope.createSessionFromProgression = async (idProgression,idCourse,date) =>{
            let progressionDragged;
            $scope.progressions.all.map(progression => {
                if (progression.id == idProgression)
                {
                    progressionDragged = progression;
                }
            });

            let course = new Course($scope.structure, idCourse);

            // Formating date
            date = date.split('/').join('-');
            date = date.split("-");
            let tempDateAnnee = date[2];
            date[2]=date[0];
            date[0]=tempDateAnnee;
            date = date.join("-");

            //insert data and refresh calendar
            await course.sync(date, date);
            let session= new Session($scope.structure,course,progressionDragged);
            session.setFromCourse(course);
            session.opened = true;
            $scope.session = session;
            progressionDragged.progression_homeworks.map(
                ph => {
                    let homework = new Homework($scope.structure)
                    homework.estimatedTime = ph.estimatedTime;
                    homework.description = ph.description;
                    homework.subject = ph.subject;
                    homework.type = ph.type;
                    session.homeworks.push(homework);

                }
            );
            //await session.sync();
            $scope.syncPedagogicItems();
            $scope.safeApply();
            $scope.goTo('/session/create');



        };
        $scope.hasListRight = () =>{
            return model.me.hasWorkflow(WORKFLOW_RIGHTS.listView);
        }
        route({
            main: async () => {
                if (!$scope.structureInitialized) await initializeStructure();
                if(Utils.isAChildOrAParent(model.me.type) && !$scope.pageInitialized){
                    $scope.goTo("/list")
                }else if (model.me.type === "PERSEDUCNAT"){
                    $scope.goTo("/administrator/global");
                }else{
                    if(!$scope.pageInitialized) await  init();
                    template.open('main', 'main');
                }
            },
            viewProgression :async()=>{
                if(!$scope.structureInitialized) await initializeStructure();
                template.open('main','progression/progression-view');
            },
            manageProgression :async() =>{
                if(!$scope.structureInitialized) await initializeStructure();
                template.open('main','progression/progression-session-form');

            },
            mainView: async()=>{
                if(!$scope.structureInitialized) await initializeStructure();
                if (!$scope.pageInitialized) await  init();
                template.open('main','main');
            },
            manageSession: async () => {
                if (!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'session/session-page');
            },

            manageHomework: async () => {
                if (!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'homework/homework-page');
            },
            globalAdminCtrl: async () => {
                if (!$scope.structureInitialized) await initializeStructure();
                template.open('main', 'administrator/admin-main-page');
            },
            manageList: async()=>{
                if(!$scope.structureInitialized) await initializeStructure();
                if(!$scope.pageInitialized) await  init();
                if(model.me.hasWorkflow(WORKFLOW_RIGHTS.listView)) {
                    template.open('main', 'list/list-view');
                }
            }
        });

    }]);