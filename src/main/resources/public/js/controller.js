routes.define(function ($routeProvider) {
    $routeProvider
    // go to create new lesson view
        .when('/createLessonView/:timeFromCalendar', {
            action: 'createLessonView'
        })
        // go to create/update homework view
        .when('/createHomeworkView', {
            action: 'createHomeworkView'
        })
        .when('/editLessonView/:idLesson', {
            action: 'editLessonView'
        })
        // opens lesson and set default tab view to homeworks one
        .when('/editLessonView/:idLesson/:idHomework', {
            action: 'editLessonView'
        })
        .when('/editHomeworkView/:idHomework', {
            action: 'editHomeworkView'
        })
        .when('/editHomeworkView/:idHomework/:idLesson', {
            action: 'editHomeworkView'
        })
        .when('/calendarView/:mondayOfWeek', {
            action: 'calendarView'
        })
        .when('/listView', {
            action: 'listView'
        })
        .when('/mainView', {
            action: 'mainView'
        })
        // default view
        .otherwise({
            action: 'calendarView'
        })
});

/**
 * Date calendar pattern for url date parsing
 * @type {string}
 */
const CAL_DATE_PATTERN = "YYYY-MM-DD";

/**
 *
 * @param $scope
 * @param template
 * @param model
 * @param route
 * @param $location
 * @constructor
 */
function DiaryController($scope, template, model, route, $location, $window) {

    $scope.currentErrors = [];

    $scope.data = {
        tabSelected: 'lesson'
    };

    $scope.tabs = {
        createLesson: 'lesson'
    };

    $scope.lessonDescriptionIsReadOnly = false;
    $scope.homeworkDescriptionIsReadOnly = false;

    $scope.calendarLoaded = false;
    /**
     * Used when refreshing calendar
     * @type {boolean}
     */
    $scope.showCal = false;
    /**
     * If false hides the grid/content of calendar,
     * only remains the days at top
     * @type {boolean}
     */
    $scope.showCalGrid = true;
    // for static access to some global function
    $scope.newLesson = new Lesson();
    $scope.newHomework = new Homework();
    $scope.newPedagogicItem = new PedagogicItem();

	// variables for show list
	$scope.pedagogicLessonsSelected 	= new Array();
	$scope.pedagogicHomeworksSelected 	= new Array();

    $scope.getStaticItem = function(itemType) {
        if ($scope.display.showList == true) {
            $scope.newPedagogicItem.type_item = itemType;
            return $scope.newPedagogicItem;
        } else if (itemType === "lesson") {
            return $scope.newLesson;
        } else {
            return $scope.newHomework;
        }
    };

    $scope.confirmPanel = {
        item: undefined
    };

    $scope.display = {
        showPanel: false,
        showShareLessonPanel: false,
        showShareHomeworkPanel: false,
        showList: false,
        hideHomeworkPanel: false,
        hideCalendar : false
    };

    /**
     * Used to know if user clicked on calendar event
     * or is dragging  to prevent ng-click
     */
    $scope.itemMouseEvent = {
        lastMouseDownTime: undefined,
        lastMouseClientX: undefined,
        lastMouseClientY: undefined
    };

    $scope.lessons = model.lessons;
    $scope.audiences = model.audiences;
    $scope.subjects = model.subjects;
    $scope.homeworkTypes = model.homeworkTypes;
    $scope.homeworks = model.homeworks;
    $scope.homeworksLoad = model.homeworksLoad;
    $scope.childs = model.childs;
    $scope.child = model.child;
    $scope.pedagogicDays = model.pedagogicDays;

    // Says whether or not current user can edit homework & lesson
    $scope.isLessonHomeworkEditable = model.canEdit();

    // Says whether or not current user is a teacher
    $scope.isUserTeacher = model.isUserTeacher();

    // Says whether or not current user is a parent
    $scope.isUserParent = model.isUserParent();

    $scope.searchForm = model.searchForm;

    // variable used to track number of call back calls (see publishCB)
    $scope.cbCount = 0;

    $scope.selectedDueDate = undefined; // date selected in list view. It can allow to init homework on a different due_date.

    route({
        createLessonView: function (params) {

            var openFunc = function () {
                $scope.lesson = null;
                $scope.lessonDescriptionIsReadOnly = false;
                $scope.homeworkDescriptionIsReadOnly = false;
                $scope.openLessonView(null, params);
            };

            if ($scope.calendarLoaded) {
                openFunc();
            } else {
                initialization(false, openFunc)
            }
        },
        createHomeworkView: function () {

            var openFunc = function () {
                $scope.homework = null;
                $scope.homeworkDescriptionIsReadOnly = false;
                $scope.openHomeworkView(null);
            };

            if ($scope.calendarLoaded) {
                openFunc();
            } else {
                initialization(false, openFunc)
            }
        },
        editLessonView: function(params) {

            if(!params.idLesson){
                $scope.goToMainView(notify.error('daily.lesson.id.notspecified'));
                return;
            }

            var lesson = model.lessons.findWhere({id: parseInt(params.idLesson)});

            if (lesson != null) {
                $scope.lessonDescriptionIsReadOnly = false;
                $scope.homeworkDescriptionIsReadOnly = false;
                $scope.openLessonView(lesson, params);
            }
            // case when viewing homework and lesson not in current week
            else {
                lesson = new Lesson();
                lesson.id = parseInt(params.idLesson);

                // TODO cache loaded lesson to avoid db re-sync it each time
                lesson.load(true, function(){
                    $scope.openLessonView(lesson, params);
                }, function(cbe){
                    notify.error(cbe.message);
                });
            }
        },
        editHomeworkView: function(params) {
            loadHomeworkFromRoute(params);
        },
        calendarView: function (params) {

            var mondayOfWeek = moment();

            // mondayOfWeek as string date formatted YYYY-MM-DD
            if (params.mondayOfWeek) {
                mondayOfWeek = moment(params.mondayOfWeek);
            } else {
                mondayOfWeek = mondayOfWeek.weekday(0);
            }

            $scope.showCalendar(mondayOfWeek);
        },
        listView: function(){
            $scope.lesson = null;
            $scope.homework = null;
            $scope.pedagogicLessonsSelected 	= new Array();
            $scope.pedagogicHomeworksSelected 	= new Array();
            $scope.showList();
        },
        mainView: function(){
            if ($scope.display.showList) {
                $scope.goToListView(null);
            } else {
                $scope.goToCalendarView(null);
            }
        }
    });


    /**
     * Permet d'afficher un aperçu de la description d'une leçon en readonly
     */
    $scope.setLessonDescriptionMode = function() {
        if ($scope.lessonDescriptionIsReadOnly) {
            $scope.lessonDescriptionIsReadOnly = false;
        }
        else {
            $scope.lessonDescriptionIsReadOnly = true;
        }
    }

    /**
     * Permet d'afficher un aperçu de la description d'un TAF en readonly
     */
    $scope.setHomeworkDescriptionMode = function() {
        if ($scope.homeworkDescriptionIsReadOnly) {
            $scope.homeworkDescriptionIsReadOnly = false;
        }
        else {
            $scope.homeworkDescriptionIsReadOnly = true;
        }
    }


    // Navigation
    $scope.showList = function() {
        $scope.display.showList = true;
        if($scope.isUserTeacher) {
            model.searchForm.initForTeacher();
        } else {
            model.searchForm.initForStudent();
        }

        $scope.selectedDueDate = undefined;
        model.pedagogicDays.syncPedagogicItems($scope.openListView, validationError);
    };

    $scope.openListView = function () {
        if(!$scope.isUserTeacher) {
            model.initSubjects();
        } else {
            model.initSubjects();
        }
        template.open('main', 'main');
        template.open('main-view', 'list-view');
        $scope.$apply();
    };

    /**
     *
     * @param momentMondayOfWeek First day (monday) of week to display lessons and homeworks
     */
    $scope.showCalendar = function(momentMondayOfWeek) {

        $scope.display.showList = false;

        if (!$scope.calendarLoaded) {
            initialization(true);
            return;
        }

        if (!momentMondayOfWeek) {
            momentMondayOfWeek = moment();
        }

        momentMondayOfWeek = momentMondayOfWeek.weekday(0);

        model.lessonsDropHandled = false;
        model.homeworksDropHandled = false;
        $scope.display.showList = false;

        // need reload lessons or homeworks if week changed
        var syncItems = momentMondayOfWeek.week() != model.calendar.week;

        $scope.lesson = null;
        $scope.homework = null;

        model.calendar.week = momentMondayOfWeek.week();
        model.calendar.setDate(momentMondayOfWeek);

        template.open('main', 'main');
        template.open('main-view', 'calendar');
        template.open('daily-event-details', 'daily-event-details');

        // need sync lessons and homeworks if calendar week changed
        if (syncItems) {
            model.lessons.syncLessons(null, validationError);
            model.homeworks.syncHomeworks(function () {
                $scope.showCal = !$scope.showCal;
                $scope.$apply();
            }, validationError);
        }
    };

    /**
     *
     * @param pedagogicItem
     * @param newWindow if true will open item detail in new windows else in same window
     */
    $scope.goToItemDetail = function(pedagogicItem, newWindow) {
        var url = "";

        if (pedagogicItem.type_item === 'lesson') {
            url = "/editLessonView/" + pedagogicItem.id + "/";
        } else {
            // open lesson view if homework is attached to a lesson
            if (pedagogicItem.lesson_id) {
                // set default tab to homework tab
                $scope.tabs.createLesson = 'homeworks';
                url = "/editLessonView/" + pedagogicItem.lesson_id + "/" + pedagogicItem.id;
            } else {
                url = "/editHomeworkView/" + pedagogicItem.id;
            }
        }

        if(newWindow){
            $window.open('/diary#' + url);
        } else {
            $location.url(url);
        }

    };

    //list-view interactions
    $scope.selectDay = function(day) {
        model.unselectDays();
        day.selected = true;
        $scope.selectedDueDate = moment(day.dayName, "dddd DD MMMM YYYY");
    };

    var loadHomeworkFromRoute = function(params) {
        // try find homework in current week homeworks cache
        var homework = model.homeworks.findWhere({ id: parseInt(params.idHomework)});

        if (homework != null) {
            $scope.homeworkDescriptionIsReadOnly = false;
            $scope.openHomeworkView(homework);
        }
        // load from db
        else {
            homework = new Homework();
            homework.id = parseInt(params.idHomework);

            homework.load(function(){
                $scope.homeworkDescriptionIsReadOnly = false;
                $scope.openHomeworkView(homework, params);
            }, function(cbe){
                notify.error(cbe.message);
            });
        }
    };

    /**
     *
     * @param lesson Lesson to view
     * @param params Parameters from url
     */
    $scope.openLessonView = function(lesson, params){

        $scope.data.tabSelected = 'lesson';
        $scope.tabs.createLesson = params.idHomework ? 'homeworks' : 'lesson';
        $scope.tabs.showAnnotations = false;

        var openLessonTemplates = function(){
            template.open('main', 'main');
            if (!$scope.isLessonHomeworkEditable){
                template.open('main-view', 'view-lesson');
            }
            else{
                template.open('main-view', 'create-lesson');
            }
        };

        // open existing lesson for edit
        if (lesson) {
            if (!$scope.lesson) {
                $scope.lesson = new Lesson();
            }
            $scope.lesson.updateData(lesson);
            $scope.lesson.previousLessonsLoaded = false; // will force reload
            $scope.newItem = {
                date: moment($scope.lesson.date),
                beginning: $scope.lesson.startMoment, //moment($scope.lesson.beginning),
                end: $scope.lesson.endMoment //moment($scope.lesson.end)
            };

            $scope.loadHomeworksForCurrentLesson(function () {
                $scope.lesson.homeworks.forEach(function(homework){
                    if(lesson.homeworks.length || (params.idHomework && params.idHomework == homework.id)) {
                        homework.expanded = true;
                    }

                    model.loadHomeworksLoad(homework, moment(homework.date).format("YYYY-MM-DD"), lesson.audience.id);
                });
                openLessonTemplates();
            });
        }
        // create new lesson
        else {
            var isTimeFromCalendar = ("timeFromCalendar" === params.timeFromCalendar);
            initLesson(isTimeFromCalendar);
            openLessonTemplates();
        }

    };

    $scope.openHomeworkView = function(homework, params){

        if (homework) {
            if (!$scope.homework) {
                $scope.homework = new Homework();
            }

            $scope.homework.updateData(homework);
            $scope.newItem = {
                date: $scope.homework.date
            };
        } else {
            var dueDate = $scope.selectedDateInTheFuture();
            initHomework(dueDate);
        }

        $scope.showHomeworksLoad($scope.homework, null);

        template.open('main', 'main');
        if (!$scope.isLessonHomeworkEditable){
            template.open('main-view', 'view-homework');
        }
        else{
            template.open('main-view', 'create-homework');
            template.open('homeworks-load', 'homeworks-load');
        }

    };

    /**
     * Switch to main view (list or calendar)
     * @param cb Callback function
     */
    $scope.goToMainView = function (cb) {
        $location.path('/mainView');

        if (typeof cb === 'function') {
            cb();
        }
    };

    /**
     * Go to list view
     * @param cb
     */
    $scope.goToListView = function (cb) {
        $location.path('/listView');
    };

    /**
     * Switch to calendar view
     * @param firstMonday First monday formatted as DD/MM/YYYY'
     * @param cb Callback function
     */
    $scope.goToCalendarView = function (firstMonday, cb) {

        var calendarViewPath = '/calendarView';

        if (typeof firstMonday != 'undefined' && firstMonday != null) {
            calendarViewPath += '/' + firstMonday;
        } else {
            if (model.calendar && model.calendar.week) {
                calendarViewPath += '/' + moment().week(model.calendar.week).weekday(0).format(CAL_DATE_PATTERN);
            } else {
                calendarViewPath += '/' + moment().weekday(0).format(CAL_DATE_PATTERN);
            }
        }

        $location.path(calendarViewPath);

        if (typeof cb === 'function') {
            cb();
        }
    };

    /**
     * Deletes selected items (lessons or homeworks)
     * in calendar view from database
     */
    $scope.deleteSelectedItems = function () {
        var selectedLessons = $scope.getSelectedPedagogicItems('lesson');
        var selectedHomeworks = $scope.getSelectedPedagogicItems('homework');

        if ((selectedLessons.length + selectedHomeworks.length) === 0) {
            notify.error('daily.nohomeworkorlesson.selected');
            return;
        }

        var selectHomeworksToBeDeleted = function (selectedHomeworks, selectedLessonsId) {
            return selectedHomeworks.filter(function (homework) {
                return homework.lesson_id == null || !_.contains(selectedLessonsId, homework.lesson_id);
            });
        };

        var postDelete = function(){
            notify.info('item.deleted');
            $scope.closeConfirmPanel();
            $scope.$apply();
        };

        var deleteHomeworks = function(){
            $scope.getStaticItem('homework').deleteList(homeworksToDelete, postDelete,
                // calback error function
                function (cbe) {notify.error(cbe.message)}
            );
        };

        // remove pending delete homeworks
        // ever embedded in selected pending delete lessons
        var lessonIds = model.getItemsIds(selectedLessons);
        var homeworksToDelete = selectHomeworksToBeDeleted(selectedHomeworks, lessonIds);

        // note: associated homeworks are automatically deleted
        // sql delete cascade
        if (selectedLessons.length > 0) {
            $scope.getStaticItem('lesson').deleteList(selectedLessons,
                function () {
                    if (homeworksToDelete.length > 0) {
                        deleteHomeworks();
                    } else {
                        postDelete();
                    }
                },
                // calback error function
                function (cbe) {
                    notify.error(cbe.message)
                }
            );
        } else {
            deleteHomeworks();
        }
    };

    /**
     * Open selected lesson or homework
     */
    $scope.editSelectedItem = function () {

        var selectedLessons = $scope.getSelectedPedagogicItems('lesson');
        var selectedLesson = selectedLessons.length > 0 ? selectedLessons[0] : null;

        var selectedHomeworks = $scope.getSelectedPedagogicItems('homework');
        var selectedHomework = selectedHomeworks.length > 0 ? selectedHomeworks[0] : null;

        if (selectedHomework && selectedLesson) {
            notify.error('Only one homework or lesson must be selected');
            return;
        }

        if (selectedLesson) {
            $scope.redirect('/editLessonView/' + selectedLesson.id + '/');
        } else if (selectedHomework) {
            // open lesson view if homework is attached to a lesson
            if (selectedHomework.lesson_id) {
                // set default tab to homework tab
                $scope.tabs.createLesson = 'homeworks';
                $scope.redirect('/editLessonView/' + selectedHomework.lesson_id + '/' + selectedHomework.id);
            } else {
                $scope.redirect('/editHomeworkView/' + selectedHomework.id);
            }
        }
    };

    /**
     * Create homework and publishes it
     * @param homework Homework being created
     * @param isPublish
     * @param goMainView
     */
    $scope.createAndPublishHomework = function (homework, isPublish, goMainView) {
        $scope.createOrUpdateHomework(goMainView, function () {
            $scope.publishHomeworkAndGoCalendarView(homework, isPublish);
        });
    };


    $scope.createAndPublishLesson = function (lesson, isPublish, goMainView) {
        // $scope.currentErrors = [];
        //
        // $scope.lesson.startTime = $scope.newItem.beginning;
        // $scope.lesson.endTime = $scope.newItem.end;
        // $scope.lesson.date = $scope.newItem.date;
        //
        // $scope.lesson.save(
        //     function () {
        //         notify.info('lesson.saved');
        //         $scope.lesson.audience = model.audiences.findWhere({id: $scope.lesson.audience.id});
        //     }, function (e) {
        //         validationError(e);
        //     });
        //
        //
        // var lessons = [];
        // lessons.push(lesson);
        // var notifyKey = isPublish ? 'lesson.published' : 'lesson.unpublished';
        // $scope.publishLessons(lessons, isPublish, notifyKey, $scope.goToMainView());


            $scope.createOrUpdateLesson(goMainView, function(){
                $scope.publishLessonAndGoCalendarView(lesson, isPublish);
            });
            //$scope.publishLessonAndGoCalendarView(lesson, isPublish);

    };


    /**
     * Create or update lesson to database from page fields
     * @param goMainView if true will switch to calendar or list view
     * after create/update else stay on current page
     */
    $scope.createOrUpdateLesson = function (goMainView, cb) {

        $scope.currentErrors = [];

        $scope.lesson.startTime = $scope.newItem.beginning;
        $scope.lesson.endTime = $scope.newItem.end;
        $scope.lesson.date = $scope.newItem.date;

        $scope.lesson.save(
            function () {
                notify.info('lesson.saved');
                $scope.lesson.audience = model.audiences.findWhere({id: $scope.lesson.audience.id});
                if (goMainView) {
                    $scope.goToMainView();
                    $scope.lesson = null;
                    $scope.homework = null;
                }
                if (typeof cb === 'function') {
                    cb();
                }
            }, function (e) {
                validationError(e);
            });
    };

    /**
     * un/Publish selected lessons
     */
    $scope.publishSelectedLessons = function (isPublish) {
        $scope.currentErrors = [];
        var notifyKey = isPublish ? 'item.published' : 'item.unpublished';
        $scope.publishLessons($scope.getSelectedPedagogicItems('lesson'), isPublish, notifyKey);
    };

    /**
     * Publishes or unpublishes lesson and go back to main view
     * @param lesson Lesson
     * @param isPublish if true publishes lesson else un-publishes it
     */
    $scope.publishLessonAndGoCalendarView = function (lesson, isPublish) {
        var lessons = [];
        lessons.push(lesson);
        var notifyKey = isPublish ? 'lesson.published' : 'lesson.unpublished';
        $scope.publishLessons(lessons, isPublish, notifyKey, $scope.goToMainView());
    };

    /**
     * Publish lessons
     * @param lessons Array of lessons to publish or unpublish
     * @param isPublish if true publishes the lessons else unpublishes them
     * @param cb Callback function
     * which is lesson id to delete
     */
    $scope.publishLessons = function (lessons, isPublish, notifyKey, cb) {
        $scope.currentErrors = [];
        $scope.processingData = true;

        model.publishLessons({ids:model.getItemsIds(lessons)}, isPublish, publishCB(lessons, isPublish, notifyKey, cb), function (e) {
            $scope.processingData = false;
            validationError(e);
        });
    };

    /**
     * Publishes or unpublishes homework and go back to main view
     * @param homework Homework
     * @param isPublish if true publishes homework else un-publishes it
     */
    $scope.publishHomeworkAndGoCalendarView = function (homework, isPublish) {
        var homeworks = [];
        homeworks.push(homework);
        var notifyKey = isPublish ? 'item.published' : 'item.unpublished';
        $scope.publishHomeworks(homeworks, isPublish, notifyKey, $scope.goToMainView());
    };

    /**
     * Publish or un-publishes homeworks
     * @param homeworks Array of homeworks to publish or unpublish
     * @param isPublish If true publishes lesson else unpublishes it
     * @param cb Callback function
     */
    $scope.publishHomeworks = function (homeworks, isPublish, cb) {
        $scope.currentErrors = [];
        $scope.processingData = true;

        var notifyKey = isPublish ? 'item.published' : 'item.unpublished';
        model.publishHomeworks({ids:model.getItemsIds(homeworks)}, isPublish, publishCB(homeworks, isPublish, notifyKey, cb), function (e) {
            $scope.processingData = false;
            validationError(e);
        });
    };

    /**
     * Callback method after publishing a lesson, homework or mixed list of items
     * @param list items to publish
     * @param toPublish If true publishes lesson else unpublishes it
     * @param notifyKey i18n key used to notify the user at the end of processing
     * @param cb calback function
     */
    var publishCB = function (list, toPublish, notifyKey, cb) {
        list.forEach(function (item) {
            item.changeState(toPublish);
        });

        $scope.cbCount--;
        $scope.closeConfirmPanel();

        if ($scope.cbCount <= 0 ){
            $scope.cbCount = 0; // can't let cbCount go on negative to impact future calls.
            notify.info(notifyKey);
            if (typeof cb === 'function') {
                cb();
            }
        }
    };


    /**
     * Load homeworks for current lesson being edited
     * @param cb Callback function
     */
    $scope.loadHomeworksForCurrentLesson = function (cb) {

        // lesson not yet created do not retrieve homeworks
        if(!$scope.lesson.id){
            return;
        }

        var needSqlSync = false;

        // if homeworks ever retrieved from db don't do it again!
        $scope.lesson.homeworks.forEach(function (homework) {
            if (!homework.loaded) {
                needSqlSync = true;
            }
        });

        // only reload homeworks if necessary
        if (needSqlSync) {
            model.loadHomeworksForLesson($scope.lesson,

                function () {
                    if (typeof cb !== 'undefined') {
                        cb();
                    }
                    $scope.$apply();
                }, function (e) {
                    validationError(e);
                });
        } else {
            if (typeof cb !== 'undefined') {
                cb();
            }
        }

    };

    // Date functions
    $scope.formatDate = function(date) {
        return $scope.formatMoment(moment(date));
    };

    $scope.formatMoment = function(moment) {
        return moment.lang('fr').format('DD/MM/YYYY');
    };

    $scope.formatTime = function(time) {
        return moment(time).lang('fr').format('H:mm');
    };

    /**
     * Close confirmation panel
     */
    $scope.closeConfirmPanel = function () {

        $scope.processingData = false;
        $scope.display.showPanel = false;
        template.close('lightbox');
    };

    /**
     * Display confirmation panel
     * @param panelContent Html confirm panel file
     * @param item Optional item
     */
    $scope.showConfirmPanel = function (panelContent, item) {
        template.open('lightbox', panelContent);
        $scope.display.showPanel = true;
        $scope.confirmPanel.item = item;
    };


    /**
     * Test in calendar view if there are one lesson
     * or one homework only selected (not both lessons and homeworks)
     * @returns {boolean}
     */
    $scope.isOneHomeworkOrLessonStriclySelected = function () {
        return ($scope.getSelectedPedagogicItems('lesson').length + $scope.getSelectedPedagogicItems('homework').length) == 1;
    };


    /**
     * Get selected items from calendar (lessons and homeworks)
     * and tidy them within un/publishable state
     */
    var getPublishableItemsSelected = function () {

        var publishableSelectedLessons = [];
        var unPublishableSelectedLessons = [];
        var noStateChangeLessons = [];

        var publishableSelectedHomeworks = [];
        var unPublishableSelectedHomeworks = [];
        var noStateChangeHomeworks = []; // eg.: homework attached to a lesson

        $scope.getSelectedPedagogicItems('lesson').forEach(function (lesson) {
            if (lesson.isPublishable(true)) {
                publishableSelectedLessons.push(lesson);
            } else if (lesson.isPublishable(false)) {
                unPublishableSelectedLessons.push(lesson);
            } else {
                noStateChangeLessons.push(lesson);
            }
        });

        // only free homeworks can be published/unpublished
        $scope.getSelectedPedagogicItems('homework').forEach(function (homework) {
            if (homework.isPublishable(true)) {
                publishableSelectedHomeworks.push(homework);
            } else if (homework.isPublishable(false)) {
                unPublishableSelectedHomeworks.push(homework);
            } else {
                noStateChangeHomeworks.push(homework);
            }
        });

        return {
            publishableSelectedLessons: publishableSelectedLessons,
            unPublishableSelectedLessons: unPublishableSelectedLessons,
            noStateChangeLessons: noStateChangeLessons,
            publishableSelectedHomeworks: publishableSelectedHomeworks,
            unPublishableSelectedHomeworks: unPublishableSelectedHomeworks,
            noStateChangeHomeworks: noStateChangeHomeworks
        };
    };

    $scope.publishSelectedItems = function (toPublish) {

        var itemsToBePublished = getPublishableItemsSelected();
        var homeworks = toPublish ? itemsToBePublished.publishableSelectedHomeworks : itemsToBePublished.unPublishableSelectedHomeworks;
        var lessons = toPublish ? itemsToBePublished.publishableSelectedLessons : itemsToBePublished.unPublishableSelectedLessons;

        var notifyKey = toPublish ? 'item.published' : 'item.unpublished';
        $scope.processingData = true;
        var cbCount = ((lessons.length > 0) ? 1 : 0) + ((homeworks.length > 0) ? 1 : 0);
        $scope.cbCount = cbCount;

        if (lessons.length > 0) {
            model.publishLessons({ids: model.getItemsIds(lessons)}, toPublish, publishCB(lessons, toPublish, notifyKey),
                function (cbe) {
                    notify.error(cbe.message);
                })
        }

        if (homeworks.length > 0) {
            model.publishHomeworks({ids: model.getItemsIds(homeworks)}, toPublish, publishCB(homeworks, toPublish, notifyKey),
                function (cbe) {
                    notify.error(cbe.message);
                })
        }
    };

    $scope.getItemsPublishableSelectedCount = function (toPublish) {

        var itemsSelected = getPublishableItemsSelected();

        if (toPublish) {
            return itemsSelected.publishableSelectedLessons.length + itemsSelected.publishableSelectedHomeworks.length;
        } else {
            return itemsSelected.unPublishableSelectedLessons.length + itemsSelected.unPublishableSelectedHomeworks.length;
        }
    };

    /**
     * Telles whether it is possible to publish or not selected items.
     * It depends of type of items selected and current state
     * @param toPublish
     * @returns {boolean} true if selected items can be published
     * and are not ever in publish state otherwise false
     */
    $scope.hasPublishableOnlyItemsSelected = function (toPublish) {
        var itemsSelected = getPublishableItemsSelected();

        var publishableLessons = itemsSelected.publishableSelectedLessons;
        var unpublishableLessons = itemsSelected.unPublishableSelectedLessons;
        var noStateChangeLessons = itemsSelected.noStateChangeLessons;

        var publishableHomeworks = itemsSelected.publishableSelectedHomeworks;
        var unpublishableHomeworks = itemsSelected.unPublishableSelectedHomeworks;
        var noStateChangeHomeworks = itemsSelected.noStateChangeHomeworks;

        if (noStateChangeLessons.length > 0 || noStateChangeHomeworks.length > 0) {
            return false;
        }

        if (toPublish) {
            // nothing selected
            if (publishableLessons.length + publishableHomeworks.length == 0) {
                return false;
            } else {
                var noUnpublishableItems = unpublishableHomeworks.length == 0 && unpublishableLessons.length == 0;
                return (publishableLessons.length > 0 && noUnpublishableItems) || (publishableHomeworks.length > 0 && noUnpublishableItems);
            }
        } else {
            // nothing selected
            if (unpublishableLessons.length + unpublishableHomeworks.length == 0) {
                return false;
            } else {
                var noPublishableItems = publishableLessons.length == 0 && publishableHomeworks.length == 0;
                return (unpublishableLessons.length > 0 && noPublishableItems) || (unpublishableHomeworks.length > 0 && noPublishableItems);
            }
        }
    };

    var getSelectedHomeworks = function(){
        return model.homeworks.selection();
    };

    var getSelectedLessons = function(){
        return model.lessons.selection();
    };


    $scope.toggleShowHomeworkInLesson = function (homework) {
        homework.expanded = !homework.expanded;
    };


    $scope.deleteHomeworkAndCloseConfirmPanel = function (homework, lesson) {
        $scope.deleteHomework(homework, lesson, function(){
            $scope.closeConfirmPanel();
        });
    };

    /**
     * Deletes an homework
     * @param cb Callback function
     * @param homework Homework to be deleted
     * @param lesson Lesson attached to homework (optional)
     */
    $scope.deleteHomework = function (homework, lesson, cb) {

        homework.delete(lesson, function () {
            notify.info('homework.deleted');
            $scope.$apply();

            if (typeof cb === 'function') {
                cb();
            }
        }, function (e) {
            validationError(e);
        });
    };


    $scope.createOrUpdateHomework = function (goToMainView, cb) {
        $scope.currentErrors = [];
        if ($scope.newItem) {
            $scope.homework.dueDate = $scope.newItem.date;
        }

        var postHomeworkSave = function () {
            $scope.showCal = !$scope.showCal;
            notify.info('homework.saved');
            $scope.homework.audience = model.audiences.findWhere({id: $scope.homework.audience.id});
            $scope.$apply();

            if (typeof cb === 'function') {
                cb();
            }

            if (goToMainView) {
                $scope.goToMainView();
                $scope.lesson = null;
                $scope.homework = null;
            }
        };

        $scope.homework.save(function () {
            if (this.lesson_id) {
                syncHomeworks(postHomeworkSave);
            } else {
                syncLessonsAndHomeworks(postHomeworkSave)
            }
        }, function (e) {
            validationError(e);
        });
    };


    /**
     * Load related data to lessons and homeworks from database
     * @param cb Callback function
     * @param bShowTemplates if true loads calendar templates after data loaded
     * might be used when
     */
    var initialization = function (bShowTemplates, cb) {

        // will force quick search panel to load (e.g: when returning to calendar view)
        // see ng-extensions.js -> quickSearch directive
        model.lessonsDropHandled = false;
        model.homeworksDropHandled = false;

        $scope.countdown = 4;

        // auto creates diary.teacher
        if("ENSEIGNANT" === model.me.type) {
            var teacher = new Teacher();
            teacher.create(decrementCountdown(bShowTemplates, cb), validationError);
        } else {
            decrementCountdown(bShowTemplates, cb)
        }

        // subjects and audiences needed to fill in
        // homeworks and lessons props

        model.childs.syncChildren(function () {
            $scope.child = model.child;
            $scope.children = model.childs;
            model.subjects.syncSubjects(function () {
                model.audiences.syncAudiences(function () {
                    decrementCountdown(bShowTemplates, cb);

                    model.homeworkTypes.syncHomeworkTypes(function () {
                        // call lessons/homework sync after audiences sync since
                        // lesson and homework objects needs audience data to be built
                        model.lessons.syncLessons(decrementCountdown(bShowTemplates, cb), validationError);
                        model.homeworks.syncHomeworks(decrementCountdown(bShowTemplates, validationError));
                    }, validationError);
                }, validationError);
            }, validationError);
        }, validationError);
    };






    /**
     * Refresh homework load for all homeworks of current lesson
     */
    $scope.refreshHomeworkLoads = function (lesson) {

        $scope.countdown = lesson.homeworks.all.length;

        lesson.homeworks.all.forEach(function (homework) {
            model.loadHomeworksLoad(homework, moment(homework.date).format("YYYY-MM-DD"), lesson.audience.id, applyScopeOnFinish);
        });

    };

    var applyScopeOnFinish = function(){
        $scope.countdown --;

        if ($scope.countdown == 0) {
            $scope.$apply();
        }
    };

    var decrementCountdown = function (bShowTemplates, cb) {
        $scope.countdown--;
        if ($scope.countdown == 0) {
            $scope.calendarLoaded = true;
            $scope.currentSchool = model.currentSchool;

            if(bShowTemplates) {
                showTemplates();
            }
            if (typeof cb === 'function') {
                cb();
            }
        }
    };

    var showTemplates = function () {
        template.open('main', 'main');
        template.open('main-view', 'calendar');
        template.open('create-lesson', 'create-lesson');
        template.open('create-homework', 'create-homework');
        template.open('daily-event-details', 'daily-event-details');
        template.open('daily-event-item', 'daily-event-item');
        $scope.showCal = !$scope.showCal;
        $scope.$apply();
    };

    /**
     * Refresh calendar view for current week
     */
    $scope.refreshCalendarCurrentWeek = function(){
        $scope.show(moment(model.calendar.firstDay));
    };

    /**
     * Opens the next week view of calendar
     */
    $scope.nextWeek = function () {
        var nextMonday = moment(model.calendar.firstDay).add(7, 'day');
        $scope.goToCalendarView(nextMonday.format(CAL_DATE_PATTERN));
    };

    /**
     * Opens the previous week view of calendar
     */
    $scope.previousWeek = function () {
        var prevMonday = moment(model.calendar.firstDay).add(-7, 'day');
        $scope.goToCalendarView(prevMonday.format(CAL_DATE_PATTERN));
    };

    $scope.addHomeworkToLesson = function(lesson){
        lesson.addHomework(lesson);
    };


    $scope.setMouseDownTime = function ($event) {
        $scope.itemMouseEvent.lastMouseDownTime = new Date().getTime();
        $scope.itemMouseEvent.lastMouseClientX = $event.clientX;
        $scope.itemMouseEvent.lastMouseClientY = $event.clientY;
    };

    /**
     * Redirect to path only when user is doind a real click.
     * If user is draging item redirect will not be called
     * @param item Lesson being clicked or dragged
     * @param $event
     */
    $scope.openOnClickSaveOnDrag = function (item, $event) {

        var path = '/editLessonView/' + item.id;

        // gap between days is quite important
        var xMouseMoved = Math.abs($scope.itemMouseEvent.lastMouseClientX - $event.clientX) > 30;
        // gap between minutes is tiny so y mouse move detection must be accurate
        // so user can change lesson time slightly
        var yMouseMoved = Math.abs($scope.itemMouseEvent.lastMouseClientY - $event.clientY) > 0;

        // fast click = no drag = real click
        // or cursor did not move
        if ((!xMouseMoved && !yMouseMoved) || (new Date().getTime() - $scope.itemMouseEvent.lastMouseDownTime) < 300) {

            // do not redirect to lesson view if user clicked on checkbox
            if (!($event.target && $event.target.type === "checkbox")) {
                $scope.redirect(path)
            }
        }
    };

    $scope.redirect = function (path) {
        $location.path(path);
    };

    $scope.getPedagogicItemSelectedCount = function () {
        return $scope.getSelectedPedagogicItems('lesson').length + $scope.getSelectedPedagogicItems('homework').length;
    };

    // gets the selected date from pedagogic items but can't be in the past.
    $scope.selectedDateInTheFuture = function (){
        var date = model.selectedPedagogicDate();
        return moment().min(moment(date), moment()).format("YYYY-MM-DD");
    };

	/**
	* update pedagogic items selected
	*/
	$scope.updatePedagogicItemsSelected = function(itemType){
		var selectedItems = new Array();
		model.pedagogicDays.forEach(function (day) {
			selectedItems = selectedItems.concat(day.pedagogicItemsOfTheDay.filter(function (item) {
					return item && item.type_item === itemType && item.selected;
				})
			);
		});

		if (itemType === 'homework'){
			$scope.pedagogicHomeworksSelected = selectedItems;
		} else {
			$scope.pedagogicLessonsSelected = selectedItems;
		}
    };


	/**
	* get selected pedagogic items from item type
	*/
	$scope.getSelectedPedagogicItems = function(itemType){

        // share from lesson view
        if ($scope.viewedLessonToShare) {
            return $scope.viewedLessonToShare;
        }
        // share from homework view
        else if ($scope.viewedHomeworkToShare) {
            return $scope.viewedHomeworkToShare;
        }

        // list view
        if ($scope.display.showList == true) {
			if (itemType === 'homework') {
                return $scope.pedagogicHomeworksSelected;
            } else {
                return $scope.pedagogicLessonsSelected;
            }
        }
        // calendar view
        else {
            if (itemType === 'homework') {
                return getSelectedHomeworks();
            } else {
                return getSelectedLessons();
            }
        }
    };

    /**
     * Init lesson object on create
     * @param timeFromCalendar If true will init start time/end time to calendar start/end time user choice
     * else to now -> now + 1 hour starting at the very beginning of hour (HH:00)
     */
    var initLesson = function (timeFromCalendar) {

        var selectedDate = $scope.selectedDateInTheFuture();

        $scope.lesson = model.initLesson(timeFromCalendar, selectedDate);
        $scope.newItem = $scope.lesson.newItem;
    };

    /**
     * Init homework object on create
     * @param dueDate if set the dueDate of the homework
     */
    var initHomework = function(dueDate) {
        $scope.homework = model.initHomework(dueDate);
        $scope.newItem = {
            date: $scope.homework.date
        };
    };

    var validationError = function (e) {

        if (typeof e !== 'undefined') {
            console.error(e);
            notify.error(e.error);
            $scope.currentErrors.push(e);
            $scope.$apply();
        }
    };

    $scope.setChildFilter = function(child, cb){
        $scope.children.forEach(function(theChild){
            theChild.selected = (theChild.id === child.id);
        });

        child.selected = true;
        $scope.child = child;
        model.child = child;

        if(typeof cb === 'function'){
            cb();
        }
    };

    $scope.showCalendarForChild = function (child) {
        $scope.setChildFilter(child, refreshCalendarCurrentWeek);
    };

    /**
     * Display or hide the homework panel
     * in calendar view
     */
    $scope.toggleHomeworkPanel = function () {

        $scope.display.hideHomeworkPanel = model.show.bShowHomeworks;
        model.show.bShowHomeworks = !model.show.bShowHomeworks;
        model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, model.show.bShowHomeworksMinified);
    };

    /**
     * Display/hide calendar
     */
    $scope.toggleCalendar = function () {

        $scope.display.hideCalendar = model.show.bShowCalendar;
        model.show.bShowCalendar = !model.show.bShowCalendar;
        model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, model.show.bShowHomeworksMinified);
    };


    /**
     * Minify the homework panel or not
     * If it's minified, will only show one max homework
     * else 3
     */
    $scope.toggleHomeworkPanelMinified = function(){
        $scope.display.bShowHomeworksMinified = model.show.bShowHomeworksMinified;
        model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, !model.show.bShowHomeworksMinified);
    };

    $scope.toggleFilterOnHomework = function () {
        $scope.searchForm.displayHomework = model.searchForm.displayHomework;
        model.searchForm.displayHomework = !model.searchForm.displayHomework;
    };

    $scope.toggleFilterOnLesson = function () {
        $scope.searchForm.displayLesson = model.searchForm.displayLesson;
        model.searchForm.displayLesson = !model.searchForm.displayLesson;
    };

    $scope.performPedagogicItemSearch = function () {
        model.performPedagogicItemSearch($scope.searchForm.getSearch(), $scope.isUserTeacher, $scope.openListView, validationError);
    };


    /**
     * Load previous lessons data from current lesson being edited
     * @param currentLesson Current lesson being edited
     */
    $scope.loadPreviousLessonsFromLesson = function (currentLesson) {
        model.getPreviousLessonsFromLesson(currentLesson, function(){$scope.$apply()}, validationError);
    };

    $scope.itemTypesDisplayed = function(item){
        if ((item.type_item == "lesson" && $scope.searchForm.displayLesson) || (item.type_item == "homework" && $scope.searchForm.displayHomework)){
            return true;
        }
        return false;
    };

    /**
     * Opens the share lesson panel
     * seee main;html -> getSelectedPedagogicItems
     * @param item
     */
    $scope.openShareLessonPanel = function (viewedLesson) {

        $scope.viewedHomeworkToShare = null;

        if (viewedLesson) {
            $scope.viewedLessonToShare = new Array();
            $scope.viewedLessonToShare.push(viewedLesson);
        } else {
            $scope.viewedLessonToShare = null;
        }

        $scope.display.showShareLessonPanel = true;
    };

    /**
     * Open the share homework panel
     * see main.html -> getSelectedPedagogicItems
     */
    $scope.openShareHomeworkPanel = function (viewedHomework) {

        $scope.viewedLessonToShare = null;

        if (viewedHomework) {
            $scope.viewedHomeworkToShare = new Array();
            $scope.viewedHomeworkToShare.push(viewedHomework);
        }
        else {
            $scope.viewedHomeworkToShare = null;
        }
        $scope.display.showShareHomeworkPanel = true;
    };


    /**
     * Display homework load for current homework
     * @param forcedDate Date in millis since 1970-1-1
     * @param homework
     */
    $scope.showHomeworksLoad = function (homework, forcedDate, callback) {

        var cb = function (){};

        if (callback){
            if (typeof callback === 'function') {
                cb = callback;
            }
        }

        var callbackErrorFunc = function () {
            // TODO propagate error to front
        };

        var date = forcedDate ? forcedDate : homework.date;
        var formattedDate = moment(date).format("YYYY-MM-DD");

        model.loadHomeworksLoad(homework, formattedDate, homework.audience.id, cb, callbackErrorFunc);
    };

    $scope.isHighHomeworkLoad = function(homeworkLoad){
        return homeworkLoad.countLoad > 2;
    };

    $scope.isLowHomeworkLoad = function(homeworkLoad){
        return homeworkLoad.countLoad == 1;
    };

    $scope.isMediumHomeworkLoad = function(homeworkLoad){
        return homeworkLoad.countLoad == 2;
    };

    $scope.isNoHomeworkLoad = function(homeworkLoad){
        return homeworkLoad.countLoad == 0;
    };

    $scope.displayPreviousLessonsTabAndLoad = function (lesson) {
        $scope.tabs.createLesson = 'previouslessons';
        $scope.loadPreviousLessonsFromLesson(lesson);
    };

    /**
     * Show more previous lessons.
     * By default number of previous lessons is 3.
     * Will increase displayed previous lesson by 3.
     */
    $scope.showMorePreviousLessons = function (lesson) {
        const displayStep = 3;
        lesson.previousLessonsDisplayed = lesson.previousLessons.slice(0, Math.min(lesson.previousLessons.length, lesson.previousLessonsDisplayed.length + displayStep));
    };


}
