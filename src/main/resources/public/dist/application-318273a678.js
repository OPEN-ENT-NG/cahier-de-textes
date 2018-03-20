/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var controller_1 = __webpack_require__(2);
	entcore_1.ng.controllers.push(controller_1.DiaryController);
	exports.AngularExtensions = {
	    moduleConfigs: [],
	    addModuleConfig: function (callBack) {
	        this.moduleConfigs.push(callBack);
	    },
	    init: function (module) {
	        entcore_1.angular.forEach(this.moduleConfigs, function (moduleConfig) {
	            moduleConfig.apply(this, [module]);
	        });
	    }
	};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = entcore;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(3);
	var Homework_model_1 = __webpack_require__(32);
	var Lesson_model_1 = __webpack_require__(33);
	var PedagogicItem_model_1 = __webpack_require__(4);
	var courses_service_1 = __webpack_require__(78);
	var lessons_service_1 = __webpack_require__(81);
	var secure_service_1 = __webpack_require__(84);
	var audiences_service_1 = __webpack_require__(85);
	/**
	 * Date calendar pattern for url date parsing
	 * @type {string}
	 */
	var CAL_DATE_PATTERN = "YYYY-MM-DD";
	/**
	 *
	 * @param $scope
	 * @param template
	 * @param model
	 * @param route
	 * @param $location
	 * @constructor
	 */
	exports.DiaryController = entcore_1.ng.controller('DiaryController', [
	    '$scope', '$rootScope', 'model', 'route', '$location', '$window', 'constants', '$sce',
	    function ($scope, $rootScope, model, route, $location, $window, constants, $sce) {
	        model.CourseService = courses_service_1.CourseService;
	        model.LessonService = lessons_service_1.LessonService;
	        $scope.constants = constants;
	        $scope.RIGHTS = constants.RIGHTS;
	        $rootScope.model = model;
	        $rootScope.currentRightPanelVisible = undefined; //= 'test';
	        $rootScope.$on('edit-homework', function (_, data) {
	            window.location.href = window.location.host + '/diary#/editHomeworkView/' + data.id;
	            //$scope.openHomeworkView (data);
	        });
	        $scope.currentErrors = [];
	        if (!model.filters) {
	            model.filters = {};
	        }
	        $scope.data = {
	            tabSelected: 'lesson'
	        };
	        $scope.tabs = {
	            createLesson: 'lesson'
	        };
	        $rootScope.redirect = function (path) {
	            $location.path(path);
	        };
	        $rootScope.trusthtml = function (txt) {
	            return $sce.trustAsHtml(txt);
	        };
	        $rootScope.validationError = function (e) {
	            if (typeof e !== 'undefined') {
	                entcore_1.notify.error(e.error);
	                $rootScope.currentErrors = [];
	                $rootScope.currentErrors.push(e);
	                $rootScope.$apply();
	            }
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
	        $scope.newLesson = new Lesson_model_1.Lesson();
	        $scope.newHomework = new Homework_model_1.Homework();
	        $scope.newPedagogicItem = new PedagogicItem_model_1.PedagogicItem();
	        // variables for show list
	        $scope.pedagogicLessonsSelected = new Array();
	        $scope.pedagogicHomeworksSelected = new Array();
	        $scope.getStaticItem = function (itemType) {
	            if ($scope.display.showList == true) {
	                $scope.newPedagogicItem.type_item = itemType;
	                return $scope.newPedagogicItem;
	            }
	            else if (itemType === "lesson") {
	                return $scope.newLesson;
	            }
	            else {
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
	            hideCalendar: false
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
	        initAudiences();
	        route({
	            showHistoryView: function (params) {
	                entcore_1.template.open('main', 'show-history');
	            },
	            manageVisaView: function (params) {
	                entcore_1.template.open('main', 'visa-manager');
	            },
	            progressionEditLesson: function (params) {
	                entcore_1.template.open('main', 'progression-edit-lesson');
	            },
	            progressionManagerView: function (params) {
	                entcore_1.template.open('main', 'progression-manager');
	            },
	            createLessonView: function (params) {
	                //$scope.lesson = null;
	                $scope.lessonDescriptionIsReadOnly = false;
	                $scope.homeworkDescriptionIsReadOnly = false;
	                //$scope.openLessonView(null, params);
	                entcore_1.template.open('main', 'main');
	                if (secure_service_1.SecureService.hasRight(constants.RIGHTS.CREATE_LESSON)) {
	                    entcore_1.template.open('main-view', 'create-lesson');
	                }
	            },
	            createHomeworkView: function () {
	                $scope.homework = null;
	                $scope.homeworkDescriptionIsReadOnly = false;
	                $scope.openHomeworkView(null);
	            },
	            editLessonView: function (params) {
	                entcore_1.template.open('main', 'main');
	                if (secure_service_1.SecureService.hasRight(constants.RIGHTS.CREATE_LESSON)) {
	                    entcore_1.template.open('main-view', 'create-lesson');
	                }
	                else {
	                    entcore_1.template.open('main-view', 'view-lesson');
	                }
	            },
	            showLessonView: function (params) {
	                entcore_1.template.open('main', 'main');
	                entcore_1.template.open('main-view', 'view-lesson');
	            },
	            editHomeworkView: function (params) {
	                loadHomeworkFromRoute(params);
	            },
	            calendarView: function (params) {
	                entcore_1.template.open('main', 'main');
	                entcore_1.template.open('main-view', 'calendar');
	                entcore_1.template.open('daily-event-details', 'daily-event-details');
	                model.selectedViewMode = '/diary/public/js/calendar/calendar-view.template.html';
	            },
	            listView: function () {
	                entcore_1.template.open('main', 'main');
	                entcore_1.template.open('main-view', 'calendar');
	                model.selectedViewMode = '/diary/public/js/calendar/list-view.template.html';
	            },
	            mainView: function () {
	                if ($scope.display.showList) {
	                    $scope.goToListView(null);
	                }
	                else {
	                    $scope.goToCalendarView(null);
	                }
	            }
	        });
	        $scope.setLessonDescriptionMode = function (homeworkId) {
	            if ($scope.lessonDescriptionIsReadOnly) {
	                $scope.lessonDescriptionIsReadOnly = false;
	            }
	            else {
	                $scope.lessonDescriptionIsReadOnly = true;
	            }
	        };
	        /**
	         * Permet de switcher entre l'aperçu  et l'édition de la description d'un devoir d'une leçon
	         */
	        $scope.changeHomeworkDescriptionMode = function (homeworkId, apercu) {
	            var editor = $('#edit_' + homeworkId);
	            var ro = $('#descr_' + homeworkId);
	            var btnApercu = $('#btn_apercu_' + homeworkId);
	            var btnEdit = $('#btn_edit_' + homeworkId);
	            if (apercu) {
	                editor.hide();
	                btnApercu.hide();
	                ro.show();
	                btnEdit.show();
	            }
	            else {
	                ro.hide();
	                btnEdit.hide();
	                editor.show();
	                btnApercu.show();
	            }
	        };
	        /**
	         * Permet d'afficher un aperçu de la description d'une leçon en readonly
	         */
	        $scope.setLessonDescriptionMode = function () {
	            if ($scope.lessonDescriptionIsReadOnly) {
	                $scope.lessonDescriptionIsReadOnly = false;
	            }
	            else {
	                $scope.lessonDescriptionIsReadOnly = true;
	            }
	        };
	        /**
	         * Permet d'afficher un aperçu de la description d'un TAF en readonly
	         */
	        $scope.setHomeworkDescriptionMode = function () {
	            if ($scope.homeworkDescriptionIsReadOnly) {
	                $scope.homeworkDescriptionIsReadOnly = false;
	            }
	            else {
	                $scope.homeworkDescriptionIsReadOnly = true;
	            }
	        };
	        // Navigation
	        $scope.showList = function () {
	            $scope.display.showList = true;
	            if ($scope.isUserTeacher) {
	                model.searchForm.initForTeacher();
	            }
	            else {
	                model.searchForm.initForStudent();
	            }
	            $scope.selectedDueDate = undefined;
	            model.pedagogicDays.syncPedagogicItems($scope.openListView, $rootScope.validationError);
	        };
	        $scope.openListView = function () {
	            if (!$scope.isUserTeacher) {
	                model.initSubjects();
	            }
	            else {
	                model.initSubjects();
	            }
	            entcore_1.template.open('main', 'main');
	            entcore_1.template.open('main-view', 'list-view');
	            $scope.$apply();
	        };
	        /**
	         *
	         * @param pedagogicItem
	         * @param newWindow if true will open item detail in new windows else in same window
	         */
	        $scope.goToItemDetail = function (pedagogicItem, newWindow) {
	            var url = "";
	            if (pedagogicItem.type_item === 'lesson') {
	                url = pedagogicItem.locked ? "/showLessonView/" + pedagogicItem.id + "/" : "/editLessonView/" + pedagogicItem.id + "/";
	            }
	            else {
	                // open lesson view if homework is attached to a lesson
	                if (pedagogicItem.lesson_id) {
	                    // set default tab to homework tab
	                    $scope.tabs.createLesson = 'homeworks';
	                    url = "/editLessonView/" + pedagogicItem.lesson_id + "/" + pedagogicItem.id;
	                }
	                else {
	                    url = "/editHomeworkView/" + pedagogicItem.id;
	                }
	            }
	            if (newWindow) {
	                $window.open('/diary#' + url);
	            }
	            else {
	                $location.url(url);
	            }
	        };
	        //list-view interactions
	        $scope.selectDay = function (day) {
	            model.unselectDays();
	            day.selected = true;
	            $scope.selectedDueDate = entcore_1.moment(day.dayName, "dddd DD MMMM YYYY");
	        };
	        $rootScope.back = function () {
	            $window.history.back();
	        };
	        var loadHomeworkFromRoute = function (params) {
	            // try find homework in current week homeworks cache
	            var homework = model.homeworks.findWhere({ id: parseInt(params.idHomework) });
	            if (homework != null) {
	                $scope.homeworkDescriptionIsReadOnly = false;
	                $scope.openHomeworkView(homework);
	            }
	            else {
	                homework = new Homework_model_1.Homework();
	                homework.id = parseInt(params.idHomework);
	                homework.load(function () {
	                    $scope.homeworkDescriptionIsReadOnly = false;
	                    $scope.openHomeworkView(homework, params);
	                }, function (cbe) {
	                    entcore_1.notify.error(cbe.message);
	                });
	            }
	        };
	        $scope.openHomeworkView = function (homework, params) {
	            if (homework) {
	                if (!$scope.homework) {
	                    $scope.homework = new Homework_model_1.Homework();
	                }
	                $scope.homework.updateData(homework);
	                $scope.newItem = {
	                    date: $scope.homework.date
	                };
	            }
	            else {
	                var dueDate = $scope.selectedDateInTheFuture();
	                initHomework(dueDate);
	            }
	            $scope.showHomeworksLoad($scope.homework, null);
	            entcore_1.template.open('main', 'main');
	            if (!$scope.isLessonHomeworkEditable) {
	                entcore_1.template.open('main-view', 'view-homework');
	            }
	            else {
	                entcore_1.template.open('main-view', 'create-homework');
	                entcore_1.template.open('homeworks-load', 'homeworks-load');
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
	            console.warn('reprecated');
	            return;
	            /*//TODO delete
	            $location.path('/listView');*/
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
	            }
	            else {
	                if (model.calendar && model.calendar.week) {
	                    calendarViewPath += '/' + entcore_1.moment().week(model.calendar.week).weekday(0).format(CAL_DATE_PATTERN);
	                }
	                else {
	                    calendarViewPath += '/' + entcore_1.moment().weekday(0).format(CAL_DATE_PATTERN);
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
	                entcore_1.notify.error('daily.nohomeworkorlesson.selected');
	                return;
	            }
	            var selectHomeworksToBeDeleted = function (selectedHomeworks, selectedLessonsId) {
	                return selectedHomeworks.filter(function (homework) {
	                    return homework.lesson_id == null || !entcore_1._.contains(selectedLessonsId, homework.lesson_id);
	                });
	            };
	            var postDelete = function () {
	                entcore_1.notify.info('item.deleted');
	                $scope.closeConfirmPanel();
	                $rootScope.$broadcast('refresh-list');
	                $scope.$apply();
	            };
	            var deleteHomeworks = function () {
	                $scope.getStaticItem('homework').deleteList(homeworksToDelete, postDelete, 
	                // calback error function
	                function (cbe) { entcore_1.notify.error(cbe.message); });
	            };
	            // remove pending delete homeworks
	            // ever embedded in selected pending delete lessons
	            var lessonIds = model.getItemsIds(selectedLessons);
	            var homeworksToDelete = selectHomeworksToBeDeleted(selectedHomeworks, lessonIds);
	            // note: associated homeworks are automatically deleted
	            // sql delete cascade
	            if (selectedLessons.length > 0) {
	                $scope.getStaticItem('lesson').deleteList(selectedLessons, function () {
	                    if (homeworksToDelete.length > 0) {
	                        deleteHomeworks();
	                    }
	                    else {
	                        postDelete();
	                    }
	                }, 
	                // calback error function
	                function (cbe) {
	                    entcore_1.notify.error(cbe.message);
	                });
	            }
	            else {
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
	                entcore_1.notify.error('Only one homework or lesson must be selected');
	                return;
	            }
	            if (selectedLesson) {
	                $rootScope.redirect('/editLessonView/' + selectedLesson.id + '/');
	            }
	            else if (selectedHomework) {
	                // open lesson view if homework is attached to a lesson
	                if (selectedHomework.lesson_id) {
	                    // set default tab to homework tab
	                    $scope.tabs.createLesson = 'homeworks';
	                    $rootScope.redirect('/editLessonView/' + selectedHomework.lesson_id + '/' + selectedHomework.id);
	                }
	                else {
	                    $rootScope.redirect('/editHomeworkView/' + selectedHomework.id);
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
	            $scope.createOrUpdateHomework(false, function () {
	                $scope.publishHomeworkAndGoCalendarView(homework, isPublish);
	            });
	        };
	        /**
	         * un/Publish selected lessons
	         */
	        $scope.publishSelectedLessons = function (isPublish) {
	            $scope.currentErrors = [];
	            var notifyKey = isPublish ? 'item.published' : 'item.unpublished';
	            return $scope.publishLessons($scope.getSelectedPedagogicItems('lesson'), isPublish, notifyKey);
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
	            return $scope.publishLessons(lessons, isPublish, notifyKey).then(function () {
	                $scope.goToMainView();
	            });
	        };
	        $scope.publishLesson = function (lesson, isPublish) {
	            var lessons = [];
	            lessons.push(lesson);
	            var notifyKey = isPublish ? 'lesson.published' : 'lesson.unpublished';
	            return $scope.publishLessons(lessons, isPublish, notifyKey);
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
	            return model.publishLessons({ ids: model.getItemsIds(lessons) }, isPublish, publishCB(lessons, isPublish, notifyKey, cb), function (e) {
	                $scope.processingData = false;
	                $rootScope.validationError(e);
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
	            $scope.publishHomeworks(homeworks, isPublish, notifyKey).then(function () {
	                $scope.goToMainView();
	            });
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
	            return model.publishHomeworks({ ids: model.getItemsIds(homeworks) }, isPublish, publishCB(homeworks, isPublish, notifyKey, cb), function (e) {
	                $scope.processingData = false;
	                $rootScope.validationError(e);
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
	                item.selected = false;
	            });
	            $scope.cbCount--;
	            $scope.closeConfirmPanel();
	            if ($scope.cbCount <= 0) {
	                $scope.cbCount = 0; // can't let cbCount go on negative to impact future calls.
	                entcore_1.notify.info(notifyKey);
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
	            console.warn("deprecated");
	            return;
	            /*
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
	                        $rootScope.validationError(e);
	                    });
	            } else {
	                if (typeof cb !== 'undefined') {
	                    cb();
	                }
	            }*/
	        };
	        // Date functions
	        $scope.formatDate = function (date) {
	            return $scope.formatMoment(entcore_1.moment(date));
	        };
	        $scope.formatMoment = function (moment) {
	            return moment.lang('fr').format('DD/MM/YYYY');
	        };
	        $scope.formatTime = function (time) {
	            return entcore_1.moment(time).lang('fr').format('H:mm');
	        };
	        /**
	         * Close confirmation panel
	         */
	        $scope.closeConfirmPanel = function () {
	            $scope.processingData = false;
	            $scope.display.showPanel = false;
	            entcore_1.template.close('lightbox');
	        };
	        /**
	         * Display confirmation panel
	         * @param panelContent Html confirm panel file
	         * @param item Optional item
	         */
	        $scope.showConfirmPanel = function (panelContent, item) {
	            entcore_1.template.open('lightbox', panelContent);
	            $scope.display.showPanel = true;
	            $scope.confirmPanel.item = item;
	        };
	        $rootScope.showConfirmPanel = $scope.showConfirmPanel;
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
	                }
	                else if (lesson.isPublishable(false)) {
	                    unPublishableSelectedLessons.push(lesson);
	                }
	                else {
	                    noStateChangeLessons.push(lesson);
	                }
	            });
	            // only free homeworks can be published/unpublished
	            $scope.getSelectedPedagogicItems('homework').forEach(function (homework) {
	                if (homework.isPublishable(true)) {
	                    publishableSelectedHomeworks.push(homework);
	                }
	                else if (homework.isPublishable(false)) {
	                    unPublishableSelectedHomeworks.push(homework);
	                }
	                else {
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
	                return model.publishLessons({ ids: model.getItemsIds(lessons) }, toPublish, publishCB(lessons, toPublish, notifyKey), function (cbe) {
	                    entcore_1.notify.error(cbe.message);
	                });
	            }
	            if (homeworks.length > 0) {
	                return model.publishHomeworks({ ids: model.getItemsIds(homeworks) }, toPublish, publishCB(homeworks, toPublish, notifyKey), function (cbe) {
	                    entcore_1.notify.error(cbe.message);
	                });
	            }
	        };
	        $scope.getItemsPublishableSelectedCount = function (toPublish) {
	            var itemsSelected = getPublishableItemsSelected();
	            if (toPublish) {
	                return itemsSelected.publishableSelectedLessons.length + itemsSelected.publishableSelectedHomeworks.length;
	            }
	            else {
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
	                }
	                else {
	                    var noUnpublishableItems = unpublishableHomeworks.length == 0 && unpublishableLessons.length == 0;
	                    return (publishableLessons.length > 0 && noUnpublishableItems) || (publishableHomeworks.length > 0 && noUnpublishableItems);
	                }
	            }
	            else {
	                // nothing selected
	                if (unpublishableLessons.length + unpublishableHomeworks.length == 0) {
	                    return false;
	                }
	                else {
	                    var noPublishableItems = publishableLessons.length == 0 && publishableHomeworks.length == 0;
	                    return (unpublishableLessons.length > 0 && noPublishableItems) || (unpublishableHomeworks.length > 0 && noPublishableItems);
	                }
	            }
	        };
	        var getSelectedHomeworks = function () {
	            return model.homeworks.selection();
	        };
	        var getSelectedLessons = function () {
	            return model.lessons.selection();
	        };
	        $scope.toggleShowHomeworkInLesson = function (homework) {
	            homework.expanded = !homework.expanded;
	        };
	        $scope.deleteHomeworkAndCloseConfirmPanel = function (homework, lesson) {
	            $scope.deleteHomework(homework, lesson, function () {
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
	                entcore_1.notify.info('homework.deleted');
	                //$scope.$apply();
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }, function (e) {
	                $rootScope.validationError(e);
	            });
	        };
	        $scope.hideHomework = function () {
	            if ($scope.homework)
	                $scope.lesson = null;
	            $scope.homework = null;
	        };
	        $scope.createOrUpdateHomework = function (goToMainView, cb) {
	            $scope.currentErrors = [];
	            if ($scope.newItem) {
	                $scope.homework.dueDate = $scope.newItem.date;
	            }
	            var postHomeworkSave = function () {
	                //$scope.showCal = !$scope.showCal;
	                entcore_1.notify.info('homework.saved');
	                $scope.homework.audience = model.audiences.findWhere({ id: $scope.homework.audience.id });
	                if (typeof cb === 'function') {
	                    cb();
	                }
	                if (goToMainView) {
	                    $rootScope.back();
	                    $scope.lesson = null;
	                    $scope.homework = null;
	                }
	            };
	            return $scope.homework.save(function () {
	                if (this.lesson_id) {
	                    return tools_1.syncHomeworks().then(function () {
	                        postHomeworkSave();
	                    });
	                }
	                else {
	                    return tools_1.syncLessonsAndHomeworks(postHomeworkSave);
	                }
	            }, function (e) {
	                $scope.homework.errorValid = true;
	                throw e;
	            });
	        };
	        /**
	         * Refresh homework load for all homeworks of current lesson
	         */
	        $scope.refreshHomeworkLoads = function (lesson) {
	            $scope.countdown = lesson.homeworks.all.length;
	            lesson.homeworks.all.forEach(function (homework) {
	                model.loadHomeworksLoad(homework, entcore_1.moment(homework.date).format("YYYY-MM-DD"), lesson.audience.id, applyScopeOnFinish);
	            });
	        };
	        var applyScopeOnFinish = function () {
	            $scope.countdown--;
	            if ($scope.countdown == 0) {
	                if (!$scope.$$phase) {
	                    $scope.$apply();
	                }
	            }
	        };
	        var decrementCountdown = function (bShowTemplates, cb) {
	            $scope.countdown--;
	            if ($scope.countdown == 0) {
	                $scope.calendarLoaded = true;
	                $scope.currentSchool = model.currentSchool;
	                if (bShowTemplates) {
	                    showTemplates();
	                }
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }
	        };
	        var showTemplates = function () {
	            entcore_1.template.open('main', 'main');
	            entcore_1.template.open('main-view', 'calendar');
	            entcore_1.template.open('create-lesson', 'create-lesson');
	            entcore_1.template.open('create-homework', 'create-homework');
	            entcore_1.template.open('daily-event-details', 'daily-event-details');
	            entcore_1.template.open('daily-event-item', 'daily-event-item');
	            //$scope.$apply();
	        };
	        /**
	         * Refresh calendar view for current week
	         */
	        $scope.refreshCalendarCurrentWeek = function () {
	            $scope.show(entcore_1.moment(model.calendar.firstDay));
	        };
	        $scope.addHomeworkToLesson = function (lesson) {
	            lesson.addHomework(lesson);
	        };
	        $scope.getPedagogicItemSelectedCount = function () {
	            return $scope.getSelectedPedagogicItems('lesson').length + $scope.getSelectedPedagogicItems('homework').length;
	        };
	        // gets the selected date from pedagogic items but can't be in the past.
	        $scope.selectedDateInTheFuture = function () {
	            var date = model.selectedPedagogicDate();
	            return entcore_1.moment().min(entcore_1.moment(date), entcore_1.moment()).format("YYYY-MM-DD"); // see moment.js doc on min pre 2.7.0 version (highly confusing !)
	        };
	        /**
	        * update pedagogic items selected
	        */
	        $scope.updatePedagogicItemsSelected = function (itemType) {
	            var selectedItems = new Array();
	            model.pedagogicDays.forEach(function (day) {
	                selectedItems = selectedItems.concat(day.pedagogicItemsOfTheDay.filter(function (item) {
	                    return item && item.type_item === itemType && item.selected;
	                }));
	            });
	            if (itemType === 'homework') {
	                $scope.pedagogicHomeworksSelected = selectedItems;
	            }
	            else {
	                $scope.pedagogicLessonsSelected = selectedItems;
	            }
	        };
	        /**
	        * get selected pedagogic items from item type
	        */
	        $scope.getSelectedPedagogicItems = function (itemType) {
	            // share from lesson view
	            if ($scope.viewedLessonToShare) {
	                return $scope.viewedLessonToShare;
	            }
	            else if ($scope.viewedHomeworkToShare) {
	                return $scope.viewedHomeworkToShare;
	            }
	            // list view
	            if ($scope.display.showList == true) {
	                if (itemType === 'homework') {
	                    return $scope.pedagogicHomeworksSelected;
	                }
	                else {
	                    return $scope.pedagogicLessonsSelected;
	                }
	            }
	            else {
	                if (itemType === 'homework') {
	                    return getSelectedHomeworks();
	                }
	                else {
	                    return getSelectedLessons();
	                }
	            }
	        };
	        /**
	         * Init homework object on create
	         * @param dueDate if set the dueDate of the homework
	         */
	        var initHomework = function (dueDate) {
	            $scope.homework = model.initHomework(dueDate);
	            $scope.newItem = {
	                date: $scope.homework.date
	            };
	        };
	        /**
	         * Minify the homework panel or not
	         * If it's minified, will only show one max homework
	         * else 3
	         */
	        //TODO unused?
	        /*  $scope.toggleHomeworkPanelMinified = function(){
	              $scope.display.bShowHomeworksMinified = model.show.bShowHomeworksMinified;
	              model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, !model.show.bShowHomeworksMinified);
	          };
	          */
	        $scope.toggleFilterOnHomework = function () {
	            $scope.searchForm.displayHomework = model.searchForm.displayHomework;
	            model.searchForm.displayHomework = !model.searchForm.displayHomework;
	        };
	        $scope.toggleFilterOnLesson = function () {
	            $scope.searchForm.displayLesson = model.searchForm.displayLesson;
	            model.searchForm.displayLesson = !model.searchForm.displayLesson;
	        };
	        $scope.performPedagogicItemSearch = function () {
	            model.performPedagogicItemSearch($scope.searchForm.getSearch(), $scope.isUserTeacher, $scope.openListView, $rootScope.validationError);
	        };
	        /*
	        $scope.loadMorePreviousLessonsFromLesson = function (currentLesson) {
	            model.getPreviousLessonsFromLesson(currentLesson, true, function(){$scope.$apply()}, $rootScope.validationError);
	        };
	        */
	        /**
	         * Load previous lessons data from current lesson being edited
	         * @param currentLesson Current lesson being edited
	         */
	        $scope.loadPreviousLessonsFromLesson = function (currentLesson) {
	            model.getPreviousLessonsFromLesson(currentLesson, false, function () { $scope.$apply(); }, $rootScope.validationError);
	        };
	        $scope.itemTypesDisplayed = function (item) {
	            if ((item.type_item == "lesson" && $scope.searchForm.displayLesson) || (item.type_item == "homework" && $scope.searchForm.displayHomework)) {
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
	            }
	            else {
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
	            var cb; //= function (){};
	            if (callback) {
	                if (typeof callback === 'function') {
	                    cb = callback;
	                }
	            }
	            var callbackErrorFunc = function () {
	                // TODO propagate error to front
	            };
	            var date = forcedDate ? forcedDate : homework.date;
	            var formattedDate = entcore_1.moment(date).format("YYYY-MM-DD");
	            var audienceId = homework.audience ? homework.audience.id : homework.audienceId;
	            model.loadHomeworksLoad(homework, formattedDate, audienceId, cb, callbackErrorFunc);
	        };
	        $scope.isHighHomeworkLoad = function (homeworkLoad) {
	            return homeworkLoad.countLoad > 2;
	        };
	        $scope.isLowHomeworkLoad = function (homeworkLoad) {
	            return homeworkLoad.countLoad == 1;
	        };
	        $scope.isMediumHomeworkLoad = function (homeworkLoad) {
	            return homeworkLoad.countLoad == 2;
	        };
	        $scope.isNoHomeworkLoad = function (homeworkLoad) {
	            return homeworkLoad.countLoad == 0;
	        };
	        $scope.displayPreviousLessonsTabAndLoad = function (lesson) {
	            console.warn("deprecated");
	            return;
	            /*$scope.tabs.createLesson = 'previouslessons';
	            $scope.loadPreviousLessonsFromLesson(lesson);*/
	        };
	        /**
	         * Show more previous lessons.
	         * By default number of previous lessons is 3.
	         * Will increase displayed previous lesson by 3.
	         */
	        //TODO remove
	        $scope.showMorePreviousLessons = function (lesson) {
	            console.warn("deprecated");
	            return;
	            /* const displayStep = 3;
	             lesson.previousLessonsDisplayed = lesson.previousLessons.slice(0, Math.min(lesson.previousLessons.length, lesson.previousLessonsDisplayed.length + displayStep));
	             */
	        };
	        function initAudiences(cb) {
	            model.audiences.all = [];
	            //var nbStructures = model.me.structures.length;
	            model.currentSchool = model.me.structures[0];
	            audiences_service_1.AudienceService.getAudiences(model.me.structures).then(function (audiences) {
	                model.audiences.addRange(audiences);
	                model.audiences.trigger('sync');
	                model.audiences.trigger('change');
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            });
	        }
	    }
	]);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var PedagogicItem_model_1 = __webpack_require__(4);
	exports.DATE_FORMAT = 'YYYY-MM-DD';
	/**
	 * removes accent from any string
	 * @param str
	 * @returns {*}
	 */
	exports.sansAccent = function (str) {
	    if (!str) {
	        return;
	    }
	    var accent = [
	        /[\300-\306]/g, /[\340-\346]/g,
	        /[\310-\313]/g, /[\350-\353]/g,
	        /[\314-\317]/g, /[\354-\357]/g,
	        /[\322-\330]/g, /[\362-\370]/g,
	        /[\331-\334]/g, /[\371-\374]/g,
	        /[\321]/g, /[\361]/g,
	        /[\307]/g, /[\347]/g // C, c
	    ];
	    var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];
	    for (var i = 0; i < accent.length; i++) {
	        str = str.replace(accent[i], noaccent[i]);
	    }
	    return str;
	};
	/**
	 * Transform sql homework data (table diary.homework)
	 * to json
	 * @param sqlHomework
	 * @returns {{id: *, description: *, audience: *, subjectId: *, subjectLabel: *, type: *, typeId: *, typeLabel: *, teacherId: *, structureId: (*|T), audienceId: *, audienceLabel: *, dueDate: *, date: *, title: *, color: *, startMoment: *, endMoment: *, state: *, is_periodic: boolean, lesson_id: *}}
	 */
	exports.sqlToJsHomework = function (sqlHomework) {
	    var homework = {
	        //for share directive you must have _id
	        _id: sqlHomework.id,
	        id: sqlHomework.id,
	        description: sqlHomework.homework_description,
	        audienceId: sqlHomework.audience_id,
	        audience: entcore_1.model.audiences.findWhere({ id: sqlHomework.audience_id }),
	        subject: entcore_1.model.subjects.findWhere({ id: sqlHomework.subject_id }),
	        subjectId: sqlHomework.subject_id,
	        subjectLabel: sqlHomework.subject_label,
	        type: entcore_1.model.homeworkTypes.findWhere({ id: sqlHomework.homework_type_id }),
	        typeId: sqlHomework.homework_type_id,
	        typeLabel: sqlHomework.homework_type_label,
	        teacherId: sqlHomework.teacher_id,
	        structureId: sqlHomework.structureId,
	        audienceType: sqlHomework.audience_type,
	        audienceLabel: sqlHomework.audience_label,
	        // TODO delete dueDate? (seems redondant info vs date field)
	        dueDate: entcore_1.moment(sqlHomework.homework_due_date),
	        date: entcore_1.moment(sqlHomework.homework_due_date),
	        title: sqlHomework.homework_title,
	        color: sqlHomework.homework_color,
	        startMoment: entcore_1.moment(sqlHomework.homework_due_date),
	        endMoment: entcore_1.moment(sqlHomework.homework_due_date),
	        state: sqlHomework.homework_state,
	        is_periodic: false,
	        lesson_id: sqlHomework.lesson_id
	    };
	    if (sqlHomework.attachments) {
	        homework.attachments = JSON.parse(sqlHomework.attachments);
	    }
	    if ('group' === homework.audienceType) {
	        homework.audienceTypeLabel = entcore_1.idiom.translate('diary.audience.group');
	    }
	    else {
	        homework.audienceTypeLabel = entcore_1.idiom.translate('diary.audience.class');
	    }
	    return homework;
	};
	/** Converts sql pedagogic item to js data */
	exports.sqlToJsPedagogicItem = function (data) {
	    //TODO use service
	    var item = new PedagogicItem_model_1.PedagogicItem();
	    item.type_item = data.type_item;
	    item.id = data.id;
	    //for share directive you must have _id
	    item._id = data.id;
	    item.lesson_id = data.lesson_id;
	    item.title = data.title;
	    item.subject = data.subject;
	    item.audience = data.audience;
	    item.start_hour = (data.type_item == "lesson") ? entcore_1.moment(data.day).minutes(entcore_1.model.getMinutes(data.start_time)).format("HH[h]mm") : "";
	    item.end_hour = (data.type_item == "lesson") ? entcore_1.moment(data.day).minutes(entcore_1.model.getMinutes(data.end_time)).format("HH[h]mm") : "";
	    item.type_homework = data.type_homework;
	    item.teacher = data.teacher;
	    item.description = data.description;
	    item.expanded_description = false;
	    item.state = data.state;
	    item.color = data.color;
	    item.getPreviewDescription();
	    item.room = data.room;
	    item.day = data.day;
	    item.turn_in = (data.type_item == "lesson") ? "" : data.turn_in_type;
	    item.selected = false;
	    item.locked = data.locked;
	    if (data.day) {
	        item.dayFormatted = entcore_1.moment(data.day).format("DD/MM/YYYY");
	        item.dayOfWeek = entcore_1.moment(data.day).format("dddd");
	    }
	    return item;
	};
	exports.syncHomeworks = function (cb) {
	    return entcore_1.model.homeworks.syncHomeworks().then(function () {
	        if (typeof cb === 'function') {
	            cb();
	        }
	    });
	};
	exports.syncLessonsAndHomeworks = function (cb) {
	    // need sync attached lesson homeworks
	    return entcore_1.model.homeworks.syncHomeworks().then(function () {
	        if (typeof cb === 'function') {
	            cb();
	        }
	    });
	};
	/**
	 * Convert sql diary.lesson row to js row used in angular model
	 * @param lesson Sql diary.lesson row
	 */
	exports.sqlToJsLesson = function (data) {
	    console.warn("deprecated");
	    return;
	    /*var lessonHomeworks = new Array();
	
	    // only initialize homeworks attached to lesson
	    // with only id
	    if (data.homework_ids) {
	        for (var i = 0; i < data.homework_ids.length; i++) {
	            var homework = new Homework();
	            homework.id = data.homework_ids[i];
	            homework.lesson_id = parseInt(data.lesson_id);
	            homework.loaded = false; // means full data from sql not loaded
	            lessonHomeworks.push(homework);
	        }
	    }
	
	    let lesson: any = {
	        //for share directive you must have _id
	        _id: data.lesson_id,
	        id: data.lesson_id,
	        title: data.lesson_title,
	        audience: model.audiences.findWhere({id: data.audience_id}),
	        audienceId: data.audience_id,
	        audienceLabel: data.audience_label,
	        audienceType: data.audience_type,
	        description: data.lesson_description,
	        subject: model.subjects.findWhere({id: data.subject_id}),
	        subjectId: data.subject_id,
	        subjectLabel: data.subject_label,
	        teacherId: data.teacher_display_name,
	        teacherName: data.teacher_display_name,
	        structureId: data.school_id,
	        date: moment(data.lesson_date),
	        startTime: data.lesson_start_time,
	        endTime: data.lesson_end_time,
	        color: data.lesson_color,
	        room: data.lesson_room,
	        annotations: data.lesson_annotation,
	        startMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_start_time),
	        endMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_end_time),
	        state: data.lesson_state,
	        is_periodic: false,
	        homeworks: lessonHomeworks,
	        tooltipText: '',
	        locked: (!model.canEdit()) ? true : false
	    };
	
	    if ('group' === lesson.audienceType) {
	        lesson.audienceTypeLabel = lang.translate('diary.audience.group');
	    } else {
	        lesson.audienceTypeLabel = lang.translate('diary.audience.class');
	    }
	
	    if (data.attachments) {
	        lesson.attachments = _.map(JSON.parse(data.attachments), jsonToJsAttachment);
	    }
	
	
	    //var tooltip = getResponsiveLessonTooltipText(lesson);
	
	    //lesson.tooltipText = tooltip;
	    return lesson;*/
	};
	exports.jsonToJsAttachment = function (data) {
	    console.warn("deprecated");
	    return;
	    /*var att = new Attachment();
	    att.id = data.id;
	    att.user_id = data.user_id;
	    att.creation_date = data.creation_date;
	    att.document_id = data.document_id;
	    att.document_label = data.document_label;
	
	    return att;*/
	};
	/**
	 * Set lesson tooltip text depending on screen resolution.
	 * Tricky responsive must be linked to additional.css behaviour
	 * @param lesson
	 */
	exports.getResponsiveLessonTooltipText = function (lesson) {
	    console.warn("deprecated use utils service");
	    return;
	    /*var tooltipText = lesson.title + ' (' + lang.translate(lesson.state) + ')';
	    var screenWidth = window.innerWidth;
	
	    // < 900 px display room
	    if (screenWidth < 900 && lesson.room) {
	        tooltipText += '<br>' + lesson.room;
	    }
	
	    // < 650 px display hour start and hour end
	    if (screenWidth < 650) {
	        tooltipText += '<br>' + [[lesson.startMoment.format('HH')]] + 'h' + [[lesson.startMoment.format('mm')]];
	        tooltipText += ' -> ' + [[lesson.endMoment.format('HH')]] + 'h' + [[lesson.endMoment.format('mm')]];
	    }
	
	    // < 600 px display subjectlabel
	    if (screenWidth < 650 && lesson.subjectLabel) {
	        tooltipText += '<br>' + lesson.subjectLabel;
	    }
	
	    tooltipText = tooltipText.trim();
	
	    return tooltipText;*/
	};
	/**
	 * Transform sql homework load data to json like
	 * @param sqlHomeworkType
	 */
	exports.sqlToJsHomeworkLoad = function (sqlHomeworkload) {
	    return {
	        countLoad: sqlHomeworkload.countload,
	        description: sqlHomeworkload.countload + ' ' + (sqlHomeworkload.countload > 1 ? entcore_1.idiom.translate('diary.homework.labels') : entcore_1.idiom.translate('diary.homework.label')),
	        day: entcore_1.moment(sqlHomeworkload.day).format('dddd').substring(0, 1).toUpperCase(),
	        numDay: entcore_1.moment(sqlHomeworkload.day).format('DD') // 15
	    };
	};
	/**
	 * Transform sql homework type data to json like
	 * @param sqlHomeworkType
	 * @returns {{id: *, structureId: (*|T), label: *, category: *}}
	 */
	exports.sqlToJsHomeworkType = function (sqlHomeworkType) {
	    return {
	        id: sqlHomeworkType.id,
	        structureId: sqlHomeworkType.school_id,
	        label: sqlHomeworkType.homework_type_label,
	        category: sqlHomeworkType.homework_type_category
	    };
	};
	exports.CONSTANTS = {
	    CAL_DATE_PATTERN: "YYYY-MM-DD",
	    CAL_DATE_PATTERN_NG: "dd-MM-yyyy",
	    CAL_DATE_PATTERN_SLASH: "dd/MM/yyyy",
	    LONG_DATE_PATTERN: 'YYYY-MM-DD hh:mm:ss',
	    RIGHTS: {
	        CREATE_LESSON: 'diary.createLesson',
	        VIEW: 'diary.view',
	        CREATE_HOMEWORK_FOR_LESSON: 'createHomeworkForLesson',
	        CREATE_FREE_HOMEWORK: 'diary.createFreeHomework',
	        MANAGE_MODEL_WEEK: 'diary.manageModelWeek.update',
	        MANAGE_HISTORY: 'diary.manageHistory.apply',
	        SHOW_HISTORY: 'diary.showHistory.filters',
	        VISA_APPLY_VISA: "diary.visa.applyvisa",
	        VISA_INSPECTOR: "diary.visa.inspect.filters",
	        VISA_ADMIN: "diary.visa.admin.filters",
	        MANAGE_INSPECTOR: "diary.manageInspect.apply",
	        SHOW_OTHER_TEACHER: "diary.view.otherteacher"
	    }
	};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(5);
	var PedagogicItem = (function () {
	    function PedagogicItem() {
	        this.deleteModelReferences = function () {
	            entcore_1.model.deletePedagogicItemReferences(this.id);
	        };
	        this.changeState = function (toPublish) {
	            //if item is a lesson may need to upgrade his related homework
	            if (this.type_item === 'lesson') {
	                var relatedToLesson = entcore_1.model.pedagogicDays.getItemsByLesson(this.id);
	                relatedToLesson.forEach(function (item) {
	                    item.state = toPublish ? 'published' : 'draft';
	                });
	            }
	            else {
	                this.state = toPublish ? 'published' : 'draft';
	            }
	        };
	        this.isPublished = function () {
	            return this.state === 'published';
	        };
	        this.descriptionMaxSize = 140;
	        this.getPreviewDescription = function () {
	            if (this.description) {
	                if (this.description.length >= this.descriptionMaxSize) {
	                    this.preview_description = '<p class="itemPreview">' + $('<div>' + this.description + '</div>').text().substring(0, this.descriptionMaxSize) + '...</p>';
	                }
	                else {
	                    this.preview_description = this.description;
	                }
	            }
	            else {
	                this.preview_description = this.description;
	            }
	        };
	        this.isPublishable = function (toPublish) {
	            return this.id && this.state == (toPublish ? 'draft' : 'published') && (this.lesson_id == null || this.lesson_id == this.id); // id test to detect free homeworks
	        };
	        this.delete = function (cb, cbe) {
	            var url = (this.type_item == "lesson") ? '/diary/lesson/' : '/diary/homework/';
	            var idToDelete = this.id;
	            axios_1.default.delete(url + idToDelete, this).then(function (b) {
	                entcore_1.model.deletePedagogicItemReferences(idToDelete);
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }).catch(function (e) {
	                if (typeof cbe === 'function') {
	                    cbe(entcore_1.model.parseError(e));
	                }
	            });
	        };
	        this.deleteList = function (items, cb, cbe) {
	            // split into two arrays of PedagogicItem, one for the lessons, one for the homeworks
	            var itemsByType = []; // array of array(s)
	            if (items.length == 1) {
	                itemsByType.push(items);
	            }
	            else {
	                itemsByType = entcore_1._.partition(items, function (item) {
	                    return item.type_item === 'lesson';
	                });
	            }
	            var countdown = 0;
	            if (itemsByType.length > 0) {
	                countdown = itemsByType.length;
	                itemsByType.forEach(function (arrayForTypeItem) {
	                    if (arrayForTypeItem.length > 0) {
	                        entcore_1.model.deleteItemList(arrayForTypeItem, arrayForTypeItem[0].type_item, function () {
	                            countdown--;
	                            if (countdown == 0) {
	                                if (typeof cb === 'function') {
	                                    cb();
	                                }
	                            }
	                        }, cbe);
	                    }
	                    else {
	                        countdown--;
	                    }
	                });
	            }
	        };
	        this.isFiltered = function () {
	            if (entcore_1.model.searchForm.selectedSubject != null) {
	                return !(this.subject === entcore_1.model.searchForm.selectedSubject);
	            }
	            return false;
	        };
	        this.selected = false;
	    }
	    return PedagogicItem;
	}());
	exports.PedagogicItem = PedagogicItem;
	;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(6);

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	var bind = __webpack_require__(8);
	var Axios = __webpack_require__(10);
	var defaults = __webpack_require__(11);
	
	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);
	
	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios.prototype, context);
	
	  // Copy context to instance
	  utils.extend(instance, context);
	
	  return instance;
	}
	
	// Create the default instance to be exported
	var axios = createInstance(defaults);
	
	// Expose Axios class to allow class inheritance
	axios.Axios = Axios;
	
	// Factory for creating new instances
	axios.create = function create(instanceConfig) {
	  return createInstance(utils.merge(defaults, instanceConfig));
	};
	
	// Expose Cancel & CancelToken
	axios.Cancel = __webpack_require__(29);
	axios.CancelToken = __webpack_require__(30);
	axios.isCancel = __webpack_require__(26);
	
	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(31);
	
	module.exports = axios;
	
	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var bind = __webpack_require__(8);
	var isBuffer = __webpack_require__(9);
	
	/*global toString:true*/
	
	// utils is a library of generic helper functions non-specific to axios
	
	var toString = Object.prototype.toString;
	
	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}
	
	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}
	
	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}
	
	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}
	
	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}
	
	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}
	
	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}
	
	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}
	
	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}
	
	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}
	
	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}
	
	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}
	
	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}
	
	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}
	
	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}
	
	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  navigator.product -> 'ReactNative'
	 */
	function isStandardBrowserEnv() {
	  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
	    return false;
	  }
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined'
	  );
	}
	
	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }
	
	  // Force an array if not already something iterable
	  if (typeof obj !== 'object' && !isArray(obj)) {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }
	
	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}
	
	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (typeof result[key] === 'object' && typeof val === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }
	
	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}
	
	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}
	
	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isBuffer: isBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim
	};


/***/ }),
/* 8 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

	/*!
	 * Determine if an object is a Buffer
	 *
	 * @author   Feross Aboukhadijeh <https://feross.org>
	 * @license  MIT
	 */
	
	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	module.exports = function (obj) {
	  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
	}
	
	function isBuffer (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}
	
	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
	}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var defaults = __webpack_require__(11);
	var utils = __webpack_require__(7);
	var InterceptorManager = __webpack_require__(23);
	var dispatchRequest = __webpack_require__(24);
	var isAbsoluteURL = __webpack_require__(27);
	var combineURLs = __webpack_require__(28);
	
	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 */
	function Axios(instanceConfig) {
	  this.defaults = instanceConfig;
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}
	
	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }
	
	  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
	  config.method = config.method.toLowerCase();
	
	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }
	
	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);
	
	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }
	
	  return promise;
	};
	
	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	});
	
	module.exports = Axios;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(7);
	var normalizeHeaderName = __webpack_require__(13);
	
	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};
	
	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}
	
	function getDefaultAdapter() {
	  var adapter;
	  if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = __webpack_require__(14);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(14);
	  }
	  return adapter;
	}
	
	var defaults = {
	  adapter: getDefaultAdapter(),
	
	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Content-Type');
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils.isObject(data)) {
	      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
	      return JSON.stringify(data);
	    }
	    return data;
	  }],
	
	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      try {
	        data = JSON.parse(data);
	      } catch (e) { /* Ignore */ }
	    }
	    return data;
	  }],
	
	  timeout: 0,
	
	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',
	
	  maxContentLength: -1,
	
	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};
	
	defaults.headers = {
	  common: {
	    'Accept': 'application/json, text/plain, */*'
	  }
	};
	
	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  defaults.headers[method] = {};
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
	});
	
	module.exports = defaults;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)))

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	
	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(7);
	var settle = __webpack_require__(15);
	var buildURL = __webpack_require__(18);
	var parseHeaders = __webpack_require__(19);
	var isURLSameOrigin = __webpack_require__(20);
	var createError = __webpack_require__(16);
	var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(21);
	
	module.exports = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;
	
	    if (utils.isFormData(requestData)) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }
	
	    var request = new XMLHttpRequest();
	    var loadEvent = 'onreadystatechange';
	    var xDomain = false;
	
	    // For IE 8/9 CORS support
	    // Only supports POST and GET calls and doesn't returns the response headers.
	    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	    if (process.env.NODE_ENV !== 'test' &&
	        typeof window !== 'undefined' &&
	        window.XDomainRequest && !('withCredentials' in request) &&
	        !isURLSameOrigin(config.url)) {
	      request = new window.XDomainRequest();
	      loadEvent = 'onload';
	      xDomain = true;
	      request.onprogress = function handleProgress() {};
	      request.ontimeout = function handleTimeout() {};
	    }
	
	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password || '';
	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	    }
	
	    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);
	
	    // Set the request timeout in MS
	    request.timeout = config.timeout;
	
	    // Listen for ready state
	    request[loadEvent] = function handleLoad() {
	      if (!request || (request.readyState !== 4 && !xDomain)) {
	        return;
	      }
	
	      // The request errored out and we didn't get a response, this will be
	      // handled by onerror instead
	      // With one exception: request that using file: protocol, most browsers
	      // will return status as 0 even though it's a successful request
	      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
	        return;
	      }
	
	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	      var response = {
	        data: responseData,
	        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
	        status: request.status === 1223 ? 204 : request.status,
	        statusText: request.status === 1223 ? 'No Content' : request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };
	
	      settle(resolve, reject, response);
	
	      // Clean up request
	      request = null;
	    };
	
	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(createError('Network Error', config, null, request));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
	        request));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils.isStandardBrowserEnv()) {
	      var cookies = __webpack_require__(22);
	
	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
	          cookies.read(config.xsrfCookieName) :
	          undefined;
	
	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }
	
	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }
	
	    // Add withCredentials to request if needed
	    if (config.withCredentials) {
	      request.withCredentials = true;
	    }
	
	    // Add responseType to request if needed
	    if (config.responseType) {
	      try {
	        request.responseType = config.responseType;
	      } catch (e) {
	        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
	        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
	        if (config.responseType !== 'json') {
	          throw e;
	        }
	      }
	    }
	
	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }
	
	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }
	
	    if (config.cancelToken) {
	      // Handle cancellation
	      config.cancelToken.promise.then(function onCanceled(cancel) {
	        if (!request) {
	          return;
	        }
	
	        request.abort();
	        reject(cancel);
	        // Clean up request
	        request = null;
	      });
	    }
	
	    if (requestData === undefined) {
	      requestData = null;
	    }
	
	    // Send the request
	    request.send(requestData);
	  });
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var createError = __webpack_require__(16);
	
	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(createError(
	      'Request failed with status code ' + response.status,
	      response.config,
	      null,
	      response.request,
	      response
	    ));
	  }
	};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var enhanceError = __webpack_require__(17);
	
	/**
	 * Create an Error with the specified message, config, error code, request and response.
	 *
	 * @param {string} message The error message.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	module.exports = function createError(message, config, code, request, response) {
	  var error = new Error(message);
	  return enhanceError(error, config, code, request, response);
	};


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Update an Error with the specified config, error code, and response.
	 *
	 * @param {Error} error The error to update.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The error.
	 */
	module.exports = function enhanceError(error, config, code, request, response) {
	  error.config = config;
	  if (code) {
	    error.code = code;
	  }
	  error.request = request;
	  error.response = response;
	  return error;
	};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	
	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%40/gi, '@').
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}
	
	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }
	
	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];
	
	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }
	
	      if (utils.isArray(val)) {
	        key = key + '[]';
	      }
	
	      if (!utils.isArray(val)) {
	        val = [val];
	      }
	
	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });
	
	    serializedParams = parts.join('&');
	  }
	
	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }
	
	  return url;
	};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	
	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;
	
	  if (!headers) { return parsed; }
	
	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));
	
	    if (key) {
	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	    }
	  });
	
	  return parsed;
	};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	  (function standardBrowserEnv() {
	    var msie = /(msie|trident)/i.test(navigator.userAgent);
	    var urlParsingNode = document.createElement('a');
	    var originURL;
	
	    /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	    function resolveURL(url) {
	      var href = url;
	
	      if (msie) {
	        // IE needs attribute set twice to normalize properties
	        urlParsingNode.setAttribute('href', href);
	        href = urlParsingNode.href;
	      }
	
	      urlParsingNode.setAttribute('href', href);
	
	      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	      return {
	        href: urlParsingNode.href,
	        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	        host: urlParsingNode.host,
	        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	        hostname: urlParsingNode.hostname,
	        port: urlParsingNode.port,
	        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	                  urlParsingNode.pathname :
	                  '/' + urlParsingNode.pathname
	      };
	    }
	
	    originURL = resolveURL(window.location.href);
	
	    /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	    return function isURLSameOrigin(requestURL) {
	      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	      return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	    };
	  })() :
	
	  // Non standard browser envs (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return function isURLSameOrigin() {
	      return true;
	    };
	  })()
	);


/***/ }),
/* 21 */
/***/ (function(module, exports) {

	'use strict';
	
	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js
	
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	
	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error;
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';
	
	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	    // initialize result and counter
	    var block, charCode, idx = 0, map = chars;
	    // if the next str index does not exist:
	    //   change the mapping table to "="
	    //   check if d has no fractional digits
	    str.charAt(idx | 0) || (map = '=', idx % 1);
	    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	  ) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}
	
	module.exports = btoa;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs support document.cookie
	  (function standardBrowserEnv() {
	    return {
	      write: function write(name, value, expires, path, domain, secure) {
	        var cookie = [];
	        cookie.push(name + '=' + encodeURIComponent(value));
	
	        if (utils.isNumber(expires)) {
	          cookie.push('expires=' + new Date(expires).toGMTString());
	        }
	
	        if (utils.isString(path)) {
	          cookie.push('path=' + path);
	        }
	
	        if (utils.isString(domain)) {
	          cookie.push('domain=' + domain);
	        }
	
	        if (secure === true) {
	          cookie.push('secure');
	        }
	
	        document.cookie = cookie.join('; ');
	      },
	
	      read: function read(name) {
	        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	        return (match ? decodeURIComponent(match[3]) : null);
	      },
	
	      remove: function remove(name) {
	        this.write(name, '', Date.now() - 86400000);
	      }
	    };
	  })() :
	
	  // Non standard browser env (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return {
	      write: function write() {},
	      read: function read() { return null; },
	      remove: function remove() {}
	    };
	  })()
	);


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	
	function InterceptorManager() {
	  this.handlers = [];
	}
	
	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};
	
	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};
	
	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};
	
	module.exports = InterceptorManager;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	var transformData = __webpack_require__(25);
	var isCancel = __webpack_require__(26);
	var defaults = __webpack_require__(11);
	
	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }
	}
	
	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	module.exports = function dispatchRequest(config) {
	  throwIfCancellationRequested(config);
	
	  // Ensure headers exist
	  config.headers = config.headers || {};
	
	  // Transform request data
	  config.data = transformData(
	    config.data,
	    config.headers,
	    config.transformRequest
	  );
	
	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers || {}
	  );
	
	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );
	
	  var adapter = config.adapter || defaults.adapter;
	
	  return adapter(config).then(function onAdapterResolution(response) {
	    throwIfCancellationRequested(config);
	
	    // Transform response data
	    response.data = transformData(
	      response.data,
	      response.headers,
	      config.transformResponse
	    );
	
	    return response;
	  }, function onAdapterRejection(reason) {
	    if (!isCancel(reason)) {
	      throwIfCancellationRequested(config);
	
	      // Transform response data
	      if (reason && reason.response) {
	        reason.response.data = transformData(
	          reason.response.data,
	          reason.response.headers,
	          config.transformResponse
	        );
	      }
	    }
	
	    return Promise.reject(reason);
	  });
	};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(7);
	
	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });
	
	  return data;
	};


/***/ }),
/* 26 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};


/***/ }),
/* 28 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	module.exports = function combineURLs(baseURL, relativeURL) {
	  return relativeURL
	    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
	    : baseURL;
	};


/***/ }),
/* 29 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * A `Cancel` is an object that is thrown when an operation is canceled.
	 *
	 * @class
	 * @param {string=} message The message.
	 */
	function Cancel(message) {
	  this.message = message;
	}
	
	Cancel.prototype.toString = function toString() {
	  return 'Cancel' + (this.message ? ': ' + this.message : '');
	};
	
	Cancel.prototype.__CANCEL__ = true;
	
	module.exports = Cancel;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Cancel = __webpack_require__(29);
	
	/**
	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
	 *
	 * @class
	 * @param {Function} executor The executor function.
	 */
	function CancelToken(executor) {
	  if (typeof executor !== 'function') {
	    throw new TypeError('executor must be a function.');
	  }
	
	  var resolvePromise;
	  this.promise = new Promise(function promiseExecutor(resolve) {
	    resolvePromise = resolve;
	  });
	
	  var token = this;
	  executor(function cancel(message) {
	    if (token.reason) {
	      // Cancellation has already been requested
	      return;
	    }
	
	    token.reason = new Cancel(message);
	    resolvePromise(token.reason);
	  });
	}
	
	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
	  if (this.reason) {
	    throw this.reason;
	  }
	};
	
	/**
	 * Returns an object that contains a new `CancelToken` and a function that, when called,
	 * cancels the `CancelToken`.
	 */
	CancelToken.source = function source() {
	  var cancel;
	  var token = new CancelToken(function executor(c) {
	    cancel = c;
	  });
	  return {
	    token: token,
	    cancel: cancel
	  };
	};
	
	module.exports = CancelToken;


/***/ }),
/* 31 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(5);
	var tools_1 = __webpack_require__(3);
	var Homework = (function () {
	    function Homework() {
	        this.expanded = false;
	        /**
	         * Delete calendar references of current homework
	         */
	        this.deleteModelReferences = function () {
	            var idxHomeworkToDelete = entcore_1.model.homeworks.indexOf(this);
	            // delete homework in calendar cache
	            if (idxHomeworkToDelete >= 0) {
	                entcore_1.model.homeworks.splice(idxHomeworkToDelete, 1);
	            }
	        };
	        /**
	         * Adds an attachment
	         * @param attachment
	         */
	        this.addAttachment = function (attachment) {
	            this.attachments.push(attachment);
	        };
	        /**
	         * Removes attachment associated to this lesson
	         * @param attachment
	         * @param cb
	         * @param cbe
	         */
	        this.detachAttachment = function (attachment, cb, cbe) {
	            attachment.detachFromItem(this.id, 'lesson', cb, cbe);
	        };
	        this.api = {
	            delete: '/diary/homework/:id'
	        };
	        this.save = function (cb, cbe) {
	            var that = this;
	            var promise = entcore_1.model.$q().when({});
	            if (!this.subject.id) {
	                promise = this.subject.save();
	            }
	            return promise.then(function () {
	                if (that.id) {
	                    return that.update(cb, cbe);
	                }
	                else {
	                    return that.create(cb, cbe);
	                }
	            });
	        };
	        /**
	         * Returns true if current homework is attached to a lesson
	         * @returns {boolean}
	         */
	        this.isAttachedToLesson = function () {
	            return typeof this.lesson_id !== 'undefined' && this.lesson_id != null;
	        };
	        this.isDraft = function () {
	            return this.state === "draft";
	        };
	        this.isPublished = function () {
	            return !this.isDraft();
	        };
	        /**
	         * A directly publishable homework must exist in database and not linked to a lesson
	         * @param toPublish
	         * @returns {*|boolean} true if homework can be published directly
	         */
	        this.isPublishable = function (toPublish) {
	            return this.id && (toPublish ? this.isDraft() : this.isPublished()) && this.lesson_id == null;
	        };
	        this.changeState = function (toPublish) {
	            this.state = toPublish ? 'published' : 'draft';
	        };
	        this.update = function (cb, cbe) {
	            var url = '/diary/homework/' + this.id;
	            var homework = this;
	            return entcore_1.model.getHttp()({
	                method: 'PUT',
	                url: url,
	                data: homework
	            }).then(function () {
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }).catch(function (e) {
	                if (cbe) {
	                    cbe();
	                }
	            });
	        };
	        this.create = function (cb, cbe) {
	            var homework = this;
	            entcore_1.model.getHttp()({
	                method: 'POST',
	                url: '/diary/homework',
	                data: homework
	            }).then(function (result) {
	                homework.updateData(result.data);
	                entcore_1.model.homeworks.pushAll([homework]);
	                if (typeof cb === 'function') {
	                    cb();
	                }
	                return result.data;
	            }).catch(function (e) {
	                if (cbe) {
	                    cbe();
	                }
	            });
	        };
	        /**
	         * Load homework object from id
	         * @param cb Callback function
	         * @param cbe Callback on error function
	         */
	        this.load = function (cb, cbe) {
	            var homework = this;
	            axios_1.default.get('/diary/homework/' + homework.id)
	                .then(function (res) {
	                homework.updateData(tools_1.sqlToJsHomework(res.data));
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            })
	                .catch(function (e) {
	                if (typeof cbe === 'function') {
	                    cbe(entcore_1.model.parseError(e));
	                }
	            });
	        };
	        /**
	         * Deletes a list of homeworks
	         * @param homeworks Homeworks to be deleted
	         * @param cb Callback
	         * @param cbe Callback on error
	         */
	        this.deleteList = function (homeworks, cb, cbe) {
	            entcore_1.model.deleteItemList(homeworks, 'homework', cb, cbe);
	        };
	        /**
	         * Deletes the homework
	         * @param Optional lesson attached to homework
	         * @param cb Callback after delete
	         * @param cbe Callback on error
	         */
	        this.delete = function (lesson, cb, cbe) {
	            var homework = this;
	            var deleteHomeworkReferences = function () {
	                // delete homework from calendar cache
	                entcore_1.model.homeworks.forEach(function (modelHomework) {
	                    if (modelHomework.id === homework.id) {
	                        entcore_1.model.homeworks.remove(modelHomework);
	                    }
	                });
	                if (lesson && lesson.homeworks) {
	                    lesson.homeworks.remove(homework);
	                }
	            };
	            if (this.id) {
	                axios_1.default.delete('/diary/homework/' + this.id)
	                    .then(function (b) {
	                    deleteHomeworkReferences();
	                    if (typeof cb === 'function') {
	                        cb();
	                    }
	                })
	                    .catch(function (error) {
	                    if (typeof cbe === 'function') {
	                        cbe(entcore_1.model.parseError(error));
	                    }
	                });
	            }
	            else {
	                deleteHomeworkReferences();
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }
	        };
	        this.toJSON = function () {
	            var json = {
	                homework_title: this.title,
	                subject_id: this.subject.id,
	                homework_type_id: this.type.id,
	                teacher_id: entcore_1.model.me.userId,
	                school_id: this.audience.structureId,
	                audience_id: this.audience.id,
	                homework_due_date: entcore_1.moment(this.dueDate).format(tools_1.DATE_FORMAT),
	                homework_description: this.description,
	                homework_color: this.color,
	                homework_state: this.state,
	                // used to auto create postgresql diary.audience if needed
	                // not this.audience object is originally from neo4j graph (see syncAudiences function)
	                audience_type: this.audience.type,
	                audience_name: this.audience.name,
	                attachments: this.attachments
	            };
	            if (this.lesson_id) {
	                json.lesson_id = this.lesson_id;
	            }
	            /*if (!this.id) {
	                created: moment(this.created).format('YYYY-MM-DD HH:mm:ss.SSSSS'); // "2016-07-05 11:48:22.18671"
	            }*/
	            return json;
	        };
	        this.expanded = false;
	    }
	    return Homework;
	}());
	exports.Homework = Homework;
	;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(3);
	var Homework_model_1 = __webpack_require__(32);
	var Subject_model_1 = __webpack_require__(34);
	var model_1 = __webpack_require__(35);
	var Lesson = (function () {
	    function Lesson(data) {
	        var _this = this;
	        this.api = { delete: '/diary/lesson/:id' };
	        /**
	         * Adds an attachment
	         * @param attachment
	         */
	        this.addAttachment = function (attachment) {
	            this.attachments.push(attachment);
	        };
	        /**
	         * Delete calendar references of current lesson
	         */
	        this.deleteModelReferences = function () {
	            var that = _this;
	            entcore_1.model.lessons.forEach(function (lesson) {
	                if (lesson.id === that.id) {
	                    entcore_1.model.lessons.remove(lesson);
	                }
	            });
	            // delete associated homeworks references
	            var lessonHomeworks = entcore_1.model.homeworks.filter(function (homework) {
	                return homework && homework.lesson_id === that.id;
	            });
	            lessonHomeworks.forEach(function (homework) {
	                entcore_1.model.homeworks.remove(homework);
	            });
	        };
	        /**
	         * Triggered when lesson item has stopped being dragged in calendar view
	         * see angular-app.js scheduleItemEl.on('stopDrag').
	         * Will auto-save lesson in db on item move/resize
	         * @param cb
	         * @param cbe
	         */
	        this.calendarUpdate = function (cb, cbe) {
	            // TODO date fields types are kinda messy
	            // toJson method needs date fields to be in some specific format
	            if (this.beginning) {
	                this.date = this.beginning;
	                this.startMoment = this.beginning;
	                this.endMoment = this.end;
	                this.startTime = this.startMoment;
	                this.endTime = this.endMoment;
	            }
	            if (this.id) {
	                this.update(function () {
	                    //model.refresh();
	                }, function (error) {
	                    entcore_1.model.parseError(error);
	                });
	            }
	        };
	        /**
	         * Save attached homeworks of lesson
	         * @param cb Callback
	         * @param cbe Callback on error
	         */
	        this.saveHomeworks = function (cb, cbe) {
	            var deferred = entcore_1.model.$q().defer();
	            var homeworkSavedCount = 0;
	            var homeworkCount = this.homeworks ? this.homeworks.all.length : 0;
	            var that = this;
	            // make sure subject and audience of homeworks are
	            // same as the lesson
	            if (homeworkCount > 0) {
	                this.homeworks.forEach(function (homework) {
	                    homework.lesson_id = that.id;
	                    // needed fields as in model.js Homework.prototype.toJSON
	                    homework.audience = that.audience;
	                    homework.subject = that.subject;
	                    homework.color = that.color;
	                    homework.state = that.state;
	                    homework.save().then(function () {
	                        homeworkSavedCount++;
	                        // callback function once all homeworks saved
	                        if (homeworkSavedCount === homeworkCount) {
	                            if (typeof cb === 'function') {
	                                cb();
	                            }
	                            deferred.resolve();
	                        }
	                    });
	                });
	            }
	            else {
	                deferred.resolve();
	            }
	            return deferred.promise;
	        };
	        /**
	         * Save lesson and attached homeworks
	         * and sync calendar lessons and homeworks cache
	         * @param cb
	         * @param cbe
	         */
	        this.save = function (cb, cbe) {
	            // startTime used for db save but startMoment in calendar view
	            // startMoment day is given by lesson.date
	            this.startMoment = entcore_1.model.getMomentDateTimeFromDateAndMomentTime(this.date, entcore_1.moment(this.startTime));
	            this.endMoment = entcore_1.model.getMomentDateTimeFromDateAndMomentTime(this.date, entcore_1.moment(this.endTime));
	            var that = this;
	            var subjectPromise = entcore_1.model.$q().when();
	            var lessonPromise;
	            if (!this.subject.id) {
	                subjectPromise = this.subject.save();
	            }
	            return subjectPromise.then(function () {
	                if (that.id) {
	                    lessonPromise = that.update();
	                }
	                else {
	                    lessonPromise = that.create();
	                }
	                return lessonPromise.then(function () {
	                    return that.saveHomeworks().then(function () {
	                        return tools_1.syncLessonsAndHomeworks(cb);
	                    });
	                });
	            });
	        };
	        /**
	         *
	         * @param idHomework
	         * @returns {boolean}
	         */
	        this.hasHomeworkWithId = function (idHomework) {
	            var found = false;
	            if (!idHomework || !this.homeworks) {
	                found = false;
	            }
	            this.homeworks.forEach(function (homework) {
	                if (homework.id === idHomework) {
	                    found = true;
	                }
	            });
	            return found;
	        };
	        this.update = function (cb, cbe) {
	            var url = '/diary/lesson/' + this.id;
	            var lesson = this;
	            return entcore_1.model.getHttp()({
	                method: 'PUT',
	                url: url,
	                data: lesson
	            }).then(function () {
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            });
	        };
	        this.create = function (cb, cbe) {
	            var lesson = this;
	            var subject = entcore_1.model.subjects.all.find(function (l) { return l.label = lesson.subject.label; });
	            var createSubjectPromise = entcore_1.model.$q().when();
	            if (!subject) {
	                createSubjectPromise = entcore_1.model.createSubject(lesson.subject.label).then(function (newSubject) {
	                    lesson.subject = newSubject;
	                });
	            }
	            else {
	                lesson.subject = subject;
	            }
	            return createSubjectPromise.then(function () {
	                return entcore_1.model.getHttp()({
	                    method: 'POST',
	                    url: '/diary/lesson',
	                    data: lesson
	                }).then(function (result) {
	                    lesson.updateData(result.data);
	                    entcore_1.model.lessons.pushAll([lesson]);
	                    if (typeof cb === 'function') {
	                        cb();
	                    }
	                });
	            });
	        };
	        /**
	         * Deletes the lesson
	         * @param cb Callback
	         * @param cbe Callback on error
	         */
	        this.delete = function (cb, cbe) {
	            var lesson = this;
	            entcore_1.model.getHttp()({
	                method: 'DELETE',
	                url: '/diary/lesson/' + this.id,
	                data: lesson
	            }).then(function (b) {
	                lesson.deleteModelReferences();
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            });
	        };
	        /**
	         * Deletes a list of lessons
	         * @param lessons Lessons to be deleted
	         * @param cb Callback
	         * @param cbe Callback on error
	         */
	        this.deleteList = function (lessons, cb, cbe) {
	            entcore_1.model.deleteItemList(lessons, 'lesson', cb, cbe);
	        };
	        /**
	         * Load lesson object from id
	         * @param cb Callback function
	         * @param cbe Callback on error function
	         */
	        this.load = function (loadHomeworks, cb, cbe) {
	            var lesson = this;
	            var url = '/diary/lesson/';
	            if (entcore_1.model.getSecureService().hasRight(entcore_1.model.getConstants().RIGHTS.SHOW_OTHER_TEACHER)) {
	                url = '/diary/lesson/external/';
	            }
	            return entcore_1.model.getHttp()({
	                method: 'GET',
	                url: url + lesson.id
	            }).then(function (result) {
	                lesson.updateData(entcore_1.model.LessonService.mapLesson(result.data));
	                if (loadHomeworks) {
	                    entcore_1.model.loadHomeworksForLesson(lesson, cb, cbe);
	                }
	                else {
	                    if (typeof cb === 'function') {
	                        cb();
	                    }
	                }
	            });
	        };
	        /**
	         * Publishes the lesson
	         * @param cb Callback
	         * @param cbe Callback on error
	         */
	        this.publish = function (cb, cbe) {
	            var jsonLesson = new Lesson();
	            jsonLesson.id = this.id;
	            jsonLesson.audience.structureId = this.structureId;
	            return entcore_1.model.getHttp()({
	                method: 'POST',
	                url: '/diary/lesson/publish',
	                data: jsonLesson
	            }).then(function () {
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            });
	        };
	        /**
	         *
	         * JSON object corresponding to sql diary.lesson table columns
	         */
	        this.toJSON = function () {
	            var json = {
	                lesson_id: this.id,
	                subject_id: this.subject.id,
	                school_id: this.audience.structureId,
	                // TODO missing teacher_id
	                audience_id: this.audience.id,
	                lesson_title: this.title,
	                lesson_color: this.color,
	                lesson_date: entcore_1.moment(this.date).format(tools_1.DATE_FORMAT),
	                lesson_start_time: entcore_1.moment(this.startTime).format('HH:mm'),
	                lesson_end_time: entcore_1.moment(this.endTime).format('HH:mm'),
	                lesson_description: this.description,
	                lesson_annotation: this.annotations,
	                lesson_state: this.state,
	                // start columns not in lesson table TODO move
	                audience_type: this.audience.type,
	                audience_name: this.audience.name,
	                attachments: this.attachments
	            };
	            if (this.room) {
	                json.lesson_room = this.room;
	            }
	            return json;
	        };
	        this.addHomework = function (cb) {
	            var date = entcore_1.moment.isMoment(this.startTime) ? this.startTime : (this.startMoment ? this.startMoment : entcore_1.moment());
	            var dueDate = date.second(0);
	            var homework = entcore_1.model.initHomework(dueDate, this);
	            this.homeworks.push(homework);
	        };
	        this.deleteHomework = function (homework) {
	            homework.delete();
	            homework = new Homework_model_1.Homework();
	            homework.dueDate = this.date;
	            homework.type = entcore_1.model.homeworkTypes.first();
	            this.homeworks.push(homework);
	        };
	        this.isDraft = function () {
	            return this.state === "draft";
	        };
	        this.isPublished = function () {
	            return !this.isDraft();
	        };
	        this.isPublishable = function (toPublish) {
	            return this.id && this.state == (toPublish ? 'draft' : 'published');
	        };
	        /**
	         * Change state of current and associated homeworks
	         * @param isPublished
	         */
	        this.changeState = function (isPublished) {
	            this.state = isPublished ? 'published' : 'draft';
	            var that = this;
	            // change state of associated homeworks
	            this.homeworks.forEach(function (homework) {
	                var lessonHomework = homework;
	                homework.state = isPublished ? 'published' : 'draft';
	                var found = false;
	            });
	            // change state of homeworks cache in calendar for current week
	            entcore_1.model.homeworks.all.filter(function (h) { return h.lesson_id = that.id; }).forEach(function (homeworkCache) {
	                homeworkCache.state = that.state;
	            });
	        };
	        this.selected = false;
	        //this.collection(Attachment);
	        // initialize homeworks collection (see lib.js)
	        if (!this.homeworks) {
	            entcore_1.collection(Homework_model_1.Homework);
	        }
	        this.subject = (data) ? data.subject : new Subject_model_1.Subject();
	        this.audience = (data) ? data.audience : new model_1.Audience();
	        /**
	         *
	         * Attachments
	         */
	        if (!this.attachments) {
	            this.attachments = new Array();
	        }
	    }
	    return Lesson;
	}());
	exports.Lesson = Lesson;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Subject = (function () {
	    function Subject() {
	        /**
	         * Saves the subject to databases.
	         * It's auto-created if it does not exists in database
	         * @param cb
	         * @param cbe
	         */
	        this.save = function (cb, cbe) {
	            if (this.id) {
	                // not implemented yet at this stage/ not needed
	            }
	            else {
	                return this.create(cb, cbe);
	            }
	        };
	        /**
	         * Creates a subject
	         * @param cb Callback function
	         * @param cbe Callback on error function
	         */
	        this.create = function (cb, cbe) {
	            var subject = this;
	            if (!this.school_id) {
	                this.school_id = entcore_1.model.me.structures[0];
	            }
	            return entcore_1.model.getHttp()({
	                method: 'POST',
	                url: '/diary/subject',
	                data: subject
	            }).then(function (result) {
	                //subject.updateData(subject);
	                subject.updateData(result.data);
	                entcore_1.model.subjects.all.push(subject);
	                if (typeof cb === 'function') {
	                    cb();
	                }
	                return subject;
	            });
	        };
	        this.toJSON = function () {
	            return {
	                id: this.id,
	                school_id: this.school_id,
	                subject_label: this.label,
	                teacher_id: this.teacher_id,
	                original_subject_id: this.originalsubjectid
	            };
	        };
	    }
	    return Subject;
	}());
	exports.Subject = Subject;
	;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var entcore_toolkit_1 = __webpack_require__(36);
	var axios_1 = __webpack_require__(5);
	var tools_1 = __webpack_require__(3);
	var Homework_model_1 = __webpack_require__(32);
	var Lesson_model_1 = __webpack_require__(33);
	var PedagogicDay_model_1 = __webpack_require__(75);
	var Child_model_1 = __webpack_require__(76);
	var Subject_model_1 = __webpack_require__(34);
	var SearchForm_model_1 = __webpack_require__(77);
	/**
	 * Model from table
	 * diary.lesson_has_attachment
	 * @constructor
	 */
	function LessonAttachment() { }
	exports.LessonAttachment = LessonAttachment;
	function Audience() { }
	exports.Audience = Audience;
	;
	function HomeworksLoad() { }
	exports.HomeworksLoad = HomeworksLoad;
	function HomeworkType() { }
	exports.HomeworkType = HomeworkType;
	/**
	 * Default color of lesson and homeworks
	 * @type {string}
	 */
	var DEFAULT_ITEM_COLOR = '#CECEF6';
	/**
	 * Default state of lesson or homework when created
	 * @type {string}
	 */
	var DEFAULT_STATE = 'draft';
	/**
	 * Get school ids of current authenticated user as string
	 * seperated with ':'
	 * @returns {string} schoolid_1:schoolid_2:...
	 */
	function getUserStructuresIdsAsString() {
	    var structureIds = "";
	    entcore_1.model.me.structures.forEach(function (structureId) {
	        structureIds += structureId + ":";
	    });
	    return structureIds;
	}
	exports.getUserStructuresIdsAsString = getUserStructuresIdsAsString;
	;
	entcore_1.model.build = function () {
	    entcore_1.calendar.startOfDay = 8;
	    entcore_1.calendar.endOfDay = 19;
	    entcore_1.calendar.dayHeight = 65;
	    /*model.calendar = new calendar.Calendar({
	        week: moment().week()
	    });
	    */
	    // keeping start/end day values in cache so we can detect dropped zones (see ng-extensions.js)
	    // note: model.calendar.startOfDay does not work in console.
	    entcore_1.model.startOfDay = entcore_1.calendar.startOfDay;
	    entcore_1.model.endOfDay = entcore_1.calendar.endOfDay;
	    this.makeModels([HomeworkType, Audience, Subject_model_1.Subject, Lesson_model_1.Lesson, Homework_model_1.Homework, PedagogicDay_model_1.PedagogicDay, Child_model_1.Child]);
	    entcore_1.Model.prototype.inherits(Lesson_model_1.Lesson, entcore_1.calendar.ScheduleItem); // will allow to bind item.selected for checkbox
	    this.searchForm = new SearchForm_model_1.SearchForm(false);
	    this.currentSchool = {};
	    this.collection(Lesson_model_1.Lesson, {
	        loading: false,
	        syncLessons: function (cb, cbe) {
	            console.warn("deprecated");
	            return;
	            /*var that = this;
	            if (that.loading)
	                return;
	
	            var lessons = [];
	            var start = moment(model.calendar.dayForWeek).day(1).format(DATE_FORMAT);
	            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format(DATE_FORMAT);
	
	            model.lessons.all.splice(0, model.lessons.all.length);
	
	            var urlGetLessons = '/diary/lesson/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';
	
	            if (model.isUserParent() && model.child) {
	                urlGetLessons += model.child.id;
	            } else {
	                urlGetLessons += '%20';
	            }
	
	            that.loading = true;
	            model.getHttp()({
	                method : 'GET',
	                url : urlGetLessons
	            }).then(function (data) {
	                lessons = lessons.concat(data);
	                that.addRange(
	                    _.map(lessons, function (lesson) {
	                        return sqlToJsLesson(lesson);
	                    })
	                );
	                if(typeof cb === 'function'){
	                    cb();
	                }
	                that.loading = false;
	            },function (e) {
	                if (typeof cbe === 'function') {
	                    cbe(model.parseError(e));
	                }
	                that.loading = false;
	            });*/
	        }, pushAll: function (datas) {
	            if (datas) {
	                this.all = entcore_1._.union(this.all, datas);
	            }
	        }, behaviours: 'diary'
	    });
	    this.collection(Subject_model_1.Subject, {
	        loading: false,
	        syncSubjects: function (cb, cbe) {
	            console.warn("deprecated");
	            return;
	            /*
	            this.all = [];
	            var that = this;
	            if (that.loading)
	                return;
	
	            that.loading = true;
	
	            if (model.isUserTeacher()) {
	                http().get('/diary/subject/initorlist').done(function (data) {
	                if (data ===""){
	                data = [];
	                }
	                    model.subjects.addRange(data);
	                    if (typeof cb === 'function') {
	                        cb();
	                    }
	                    that.loading = false;
	                }.bind(that))
	                    .error(function (e) {
	                        if (typeof cbe === 'function') {
	                            cbe(model.parseError(e));
	                        }
	                        that.loading = false;
	                    });
	            } else {
	                http().get('/diary/subject/list/' + getUserStructuresIdsAsString()).done(function (data) {
	                    model.subjects.addRange(data);
	                    if (typeof cb === 'function') {
	                        cb();
	                    }
	                    that.loading = false;
	                }.bind(that))
	                    .error(function (e) {
	                        if (typeof cbe === 'function') {
	                            cbe(model.parseError(e));
	                        }
	                        that.loading = false;
	                    });
	            }*/
	        }
	    });
	    this.collection(Audience, {
	        loading: false,
	        syncAudiences: function (cb, cbe) {
	            console.warn("deprecated");
	            return;
	            /*this.all = [];
	            var nbStructures = model.me.structures.length;
	            var that = this;
	            if (that.loading)
	                return;
	
	            model.currentSchool = model.me.structures[0];
	            that.loading = true;
	
	            model.getAudienceService().getAudiences(model.me.structures).then((audiences)=>{
	                this.addRange(structureData.classes);
	                // TODO get groups
	                nbStructures--;
	                if (nbStructures === 0) {
	                    this.trigger('sync');
	                    this.trigger('change');
	                    if(typeof cb === 'function'){
	                        cb();
	                    }
	                }
	
	                that.loading = false;
	            });
	            */
	            /*model.me.structures.forEach(function (structureId) {
	                http().get('/userbook/structure/' + structureId).done(function (structureData) {
	                    structureData.classes = _.map(structureData.classes, function (audience) {
	                        audience.structureId = structureId;
	                        audience.type = 'class';
	                        audience.typeLabel = lang.translate('diary.audience.class');
	                        return audience;
	                    });
	                    this.addRange(structureData.classes);
	                    // TODO get groups
	                    nbStructures--;
	                    if (nbStructures === 0) {
	                        this.trigger('sync');
	                        this.trigger('change');
	                        if(typeof cb === 'function'){
	                            cb();
	                        }
	                    }
	
	                    that.loading = false;
	                }.bind(that))
	                .error(function (e) {
	                    if (typeof cbe === 'function') {
	                        cbe(model.parseError(e));
	                    }
	                    that.loading = false;
	                });
	            });*/
	        }
	    });
	    this.collection(HomeworkType, {
	        loading: false,
	        syncHomeworkTypes: function (cb, cbe) {
	            var homeworkTypes = [];
	            var that = this;
	            if (that.loading)
	                return;
	            entcore_1.model.homeworkTypes.all.splice(0, entcore_1.model.homeworkTypes.all.length);
	            var url = '/diary/homeworktype/initorlist';
	            var urlGetHomeworkTypes = url;
	            that.loading = true;
	            return entcore_1.model.getHttp()({
	                method: 'GET',
	                url: urlGetHomeworkTypes
	            }).then(function (result) {
	                homeworkTypes = homeworkTypes.concat(result.data);
	                that.addRange(entcore_1._.map(homeworkTypes, tools_1.sqlToJsHomeworkType));
	                if (typeof cb === 'function') {
	                    cb();
	                }
	                that.loading = false;
	                return homeworkTypes;
	            }).catch(function (e) {
	                that.loading = false;
	                throw e;
	            });
	        }, pushAll: function (datas) {
	            if (datas) {
	                this.all = entcore_1._.union(this.all, datas);
	            }
	        }, behaviours: 'diary'
	    });
	    this.collection(Homework_model_1.Homework, {
	        loading: false,
	        syncHomeworks: function (cb, cbe) {
	            var homeworks = [];
	            var start = entcore_1.moment(entcore_1.model.calendar.dayForWeek).day(1).format(tools_1.DATE_FORMAT);
	            var end = entcore_1.moment(entcore_1.model.calendar.dayForWeek).day(1).add(1, 'week').format(tools_1.DATE_FORMAT);
	            var that = this;
	            if (that.loading)
	                return;
	            entcore_1.model.homeworks.all.splice(0, entcore_1.model.homeworks.all.length);
	            var urlGetHomeworks = '/diary/homework/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';
	            if (entcore_1.model.isUserParent() && entcore_1.model.child) {
	                urlGetHomeworks += entcore_1.model.child.id;
	            }
	            else {
	                urlGetHomeworks += '%20';
	            }
	            that.loading = true;
	            return entcore_1.model.getHttp()({
	                method: 'GET',
	                url: urlGetHomeworks
	            }).then(function (result) {
	                homeworks = homeworks.concat(result.data);
	                that.addRange(entcore_1._.map(homeworks, tools_1.sqlToJsHomework));
	                if (typeof cb === 'function') {
	                    cb();
	                }
	                that.loading = false;
	                return homeworks;
	            }).catch(function (e) {
	                that.loading = false;
	                throw e;
	            });
	        }, pushAll: function (datas) {
	            if (datas) {
	                this.all = entcore_1._.union(this.all, datas);
	            }
	        }, behaviours: 'diary'
	    });
	    this.collection(PedagogicDay_model_1.PedagogicDay, {
	        reset: function () {
	            entcore_1.model.pedagogicDays.selectAll();
	            entcore_1.model.pedagogicDays.removeSelection();
	        },
	        syncPedagogicItems: function (cb, cbe) {
	            var params = entcore_1.model.searchForm.getSearch();
	            entcore_1.model.performPedagogicItemSearch(params, entcore_1.model.isUserTeacher(), cb, cbe);
	        },
	        pushAll: function (datas) {
	            if (datas) {
	                this.all = entcore_1._.union(this.all, datas);
	            }
	        },
	        getItemsByLesson: function (lessonId) {
	            var items = [];
	            entcore_1.model.pedagogicDays.forEach(function (day) {
	                var relatedToLesson = entcore_1._.filter(day.pedagogicItemsOfTheDay, function (item) {
	                    return item.lesson_id == lessonId;
	                });
	                items = entcore_1._.union(items, relatedToLesson);
	            });
	            return items;
	        }
	    });
	    /**
	     *
	     */
	    this.collection(Child_model_1.Child, {
	        reset: function () {
	            // n.b: childs not 'children' since collection function adds a 's'
	            entcore_1.model.childs.selectAll();
	            entcore_1.model.childs.removeSelection();
	        },
	        syncChildren: function (cb, cbe) {
	            entcore_1.model.listChildren(cb, cbe);
	        }, pushAll: function (datas) {
	            if (datas) {
	                this.all = entcore_1._.union(this.all, datas);
	            }
	        }
	    });
	};
	entcore_1.model.getHttp = function () {
	    return entcore_1.angular.element($('html')).injector().get("$http");
	};
	entcore_1.model.$q = function () {
	    return entcore_1.angular.element($('html')).injector().get("$q");
	};
	entcore_1.model.getSecureService = function () {
	    return entcore_1.angular.injector(['ng', 'app']).get("SecureService");
	};
	entcore_1.model.getUtilsService = function () {
	    return entcore_1.angular.element($('html')).injector().get("UtilsService");
	};
	entcore_1.model.getConstants = function () {
	    return entcore_1.angular.injector(['ng', 'app']).get("constants");
	};
	entcore_1.model.homeworksPerDayDisplayed = 1;
	/**
	 * Says whether or not current user can edit an homework
	 * @returns {*|boolean}
	 */
	entcore_1.model.canEdit = function () {
	    return entcore_1.model.me.type == "ENSEIGNANT";
	};
	/**
	 * Says whether or not current user is a teacher
	 * @returns {*|boolean}
	 */
	entcore_1.model.isUserTeacher = function () {
	    return entcore_1.model.me.type == "ENSEIGNANT";
	};
	/**
	 * Says whether or not current user is a teacher
	 * @returns {*|boolean}
	 */
	entcore_1.model.isUserParent = function () {
	    return entcore_1.model.me.type == "PERSRELELEVE";
	};
	/**
	 * Publishes or un publishes a list of homeworks
	 * @param itemArray Array of homeworks to publish or unpublish
	 */
	entcore_1.model.publishHomeworks = function (itemArray, isPublish, cb, cbe) {
	    var url = isPublish ? "/diary/publishHomeworks" : "/diary/unPublishHomeworks";
	    return entcore_1.model.getHttp()({
	        method: 'POST',
	        url: url,
	        data: itemArray
	    }).then(function (r) {
	        if (typeof cb === 'function') {
	            cb();
	        }
	        return r.data;
	    });
	};
	entcore_1.model.deleteItemList = function (items, itemType, cb, cbe) {
	    var url = (itemType == "lesson") ? '/diary/deleteLessons' : '/diary/deleteHomeworks';
	    var itemArray = { ids: entcore_1.model.getItemsIds(items) };
	    return axios_1.default.delete(url, { data: itemArray }).then(function (b) {
	        items.forEach(function (item) {
	            item.deleteModelReferences();
	        });
	        if (typeof cb === 'function') {
	            cb();
	        }
	    }).catch(function (error) {
	        if (typeof cbe === 'function') {
	            cbe(entcore_1.model.parseError(error));
	        }
	    });
	};
	entcore_1.model.deletePedagogicItemReferences = function (itemId) {
	    entcore_1.model.pedagogicDays.forEach(function (day) {
	        day.pedagogicItemsOfTheDay = entcore_1._.reject(day.pedagogicItemsOfTheDay, function (item) {
	            return !item || item.lesson_id == itemId || item.id == itemId;
	        });
	        day.resetCountValues();
	    });
	    entcore_1.model.pedagogicDays.all = entcore_1._.filter(entcore_1.model.pedagogicDays.all, function (day) {
	        return day.numberOfItems() > 0;
	    });
	    entcore_1.model.initSubjects();
	};
	entcore_1.model.unselectDays = function () {
	    entcore_1.model.pedagogicDays.forEach(function (day) {
	        day.selected = undefined;
	    });
	};
	// gets the selected date from pedagogic items
	entcore_1.model.selectedPedagogicDate = function () {
	    var selectedDay = entcore_1._.findWhere(entcore_1.model.pedagogicDays.all, { selected: true });
	    if (selectedDay) {
	        return entcore_1.moment(selectedDay.dayName, "dddd DD MMMM YYYY").format("YYYY-MM-DD");
	    }
	    else {
	        return entcore_1.moment();
	    }
	};
	/**
	 * Given a moment which contain reliable time data,
	 * return a moment time with this time and the date specified.
	 * @param date Date
	 * @param momentTime Moment date
	 * @returns {*}
	 */
	entcore_1.model.getMomentDateTimeFromDateAndMomentTime = function (date, momentTime) {
	    var dateMoment = entcore_1.moment(date);
	    momentTime.set('year', dateMoment.get('year'));
	    momentTime.set('month', dateMoment.get('month'));
	    momentTime.set('date', dateMoment.get('date'));
	    return momentTime;
	};
	/**
	 * Publishes or un publishes a list of lessons
	 * @param cb Callback
	 * @param cbe Callback on error
	 */
	entcore_1.model.publishLessons = function (itemArray, isPublish, cb, cbe) {
	    var url = isPublish ? "/diary/publishLessons" : "/diary/unPublishLessons";
	    return entcore_1.model.getHttp()({
	        method: 'POST',
	        url: url,
	        data: itemArray
	    }).then(function (r) {
	        var updateLessons = new Array();
	        // update lesson cache
	        // bad code but collection does not seem to update on state change
	        // so have to delete and add modified lessons ...
	        entcore_1.model.lessons.forEach(function (lessonModel) {
	            if (itemArray.ids.indexOf(lessonModel.id) != -1) {
	                lessonModel.changeState(isPublish);
	                lessonModel.selected = false;
	                lessonModel.tooltipText = entcore_1.model.getUtilsService().getResponsiveLessonTooltipText(lessonModel);
	            }
	        });
	        entcore_1.model.lessons.addRange(updateLessons);
	        if (typeof cb === 'function') {
	            cb();
	        }
	        return r.data;
	    });
	};
	entcore_1.model.getMinutes = function (time) {
	    return (parseInt(time.split(':')[0]) * 60) + (parseInt(time.split(':')[1]));
	};
	entcore_1.model.parseError = function (e) {
	    var error = {};
	    try {
	        error = JSON.parse(e.responseText);
	    }
	    catch (err) {
	        error.error = "diary.error.unknown";
	    }
	    error.status = e.status;
	    return error;
	};
	/**
	 *
	 * @param items Collection of items (lessons or homeworks)
	 * @returns {Array} Array of id of the items
	 */
	entcore_1.model.getItemsIds = function (items) {
	    return entcore_1._.toArray(entcore_1._.pluck(items, 'id'));
	};
	/**
	 * Loads homework load data for current week of homework
	 * @param homework
	 * @param cb
	 * @param cbe
	 */
	entcore_1.model.loadHomeworksLoad = function (homework, date, audienceId, cb, cbe) {
	    return entcore_1.model.getHttp()({
	        method: 'GET',
	        url: '/diary/homework/load/' + date + '/' + audienceId
	    }).then(function (result) {
	        var sqlHomeworksLoads = result.data;
	        homework.weekhomeworksload = [];
	        sqlHomeworksLoads.forEach(function (homeworkLoad) {
	            homework.weekhomeworksload.push(tools_1.sqlToJsHomeworkLoad(homeworkLoad));
	        });
	        if (typeof cb === 'function') {
	            cb();
	        }
	        return sqlHomeworksLoads;
	    });
	};
	/**
	 * Get homeworks linked to a lesson
	 *
	 * @param lesson
	 * @param cb Callback
	 * @param cbe Callback on error
	 */
	entcore_1.model.loadHomeworksForLesson = function (lesson, cb, cbe) {
	    if (!lesson.id) {
	        return;
	    }
	    var url = '/diary/homework/list/';
	    if (entcore_1.model.getSecureService().hasRight(entcore_1.model.getConstants().RIGHTS.SHOW_OTHER_TEACHER)) {
	        url = '/diary/homework/external/list/';
	    }
	    return entcore_1.model.getHttp()({
	        method: 'GET',
	        url: url + lesson.id
	    }).then(function (result) {
	        var sqlHomeworks = result.data;
	        lesson.homeworks = new entcore_toolkit_1.Collection(Homework_model_1.Homework);
	        sqlHomeworks.forEach(function (sqlHomework) {
	            lesson.homeworks.push(tools_1.sqlToJsHomework(sqlHomework));
	        });
	        if (typeof cb === 'function') {
	            cb();
	        }
	        return sqlHomeworks;
	    });
	};
	/**
	 * On window resize compute lesson tooltips (responsive design)
	 */
	/*window.addEventListener('resize', function(event){
	
	    model.lessons.forEach(function (lesson) {
	        lesson.tooltipText = getResponsiveLessonTooltipText(lesson);
	    });
	});*/
	/**
	 * Returns default audience of connected user.
	 * @returns {*}
	 */
	entcore_1.model.getDefaultAudience = function () {
	    var defaultAudience = null;
	    if (entcore_1.model.me.classes && entcore_1.model.me.classes.length > 0) {
	        defaultAudience = entcore_1.model.audiences.findWhere({ id: entcore_1.model.me.classes[0] });
	    }
	    if (!defaultAudience) {
	        defaultAudience = entcore_1.model.audiences.first();
	    }
	    return defaultAudience;
	};
	entcore_1.model.showHomeworkPanel = true;
	/**
	 * Init homework object on created.
	 * Set default attribute values
	 * @param homework
	 * @param cb Callback function
	 * @param cbe Callback function on error
	 * @returns {*}
	 */
	entcore_1.model.initHomework = function (dueDate, lesson) {
	    var homework = new Homework_model_1.Homework();
	    homework.created = new Date();
	    homework.expanded = true;
	    homework.type = entcore_1.model.homeworkTypes.first();
	    homework.title = homework.type.label;
	    homework.date = (dueDate) ? dueDate : entcore_1.moment().minute(0).second(0);
	    // create homework attached to lesson
	    if (lesson) {
	        homework.audience = lesson.audience;
	        homework.subject = lesson.subject;
	        homework.audienceType = homework.audience.type;
	        homework.color = lesson.color;
	        homework.state = lesson.state;
	    }
	    else {
	        homework.audience = {}; //sets the default audience to undefined
	        homework.subject = entcore_1.model.subjects.first();
	        homework.audienceType = homework.audience.type;
	        homework.color = DEFAULT_ITEM_COLOR;
	        homework.state = DEFAULT_STATE;
	    }
	    entcore_1.model.loadHomeworksLoad(homework, entcore_1.moment(homework.date).format(tools_1.DATE_FORMAT), homework.audience.id);
	    return homework;
	};
	/**
	 * Init lesson
	 * @returns {Lesson}
	 */
	entcore_1.model.initLesson = function (timeFromCalendar, selectedDate) {
	    var lesson = new Lesson_model_1.Lesson();
	    lesson.audience = {}; //sets the default audience to undefined
	    lesson.subject = entcore_1.model.subjects.first();
	    lesson.audienceType = lesson.audience.type;
	    lesson.color = DEFAULT_ITEM_COLOR;
	    lesson.state = DEFAULT_STATE;
	    lesson.title = entcore_1.idiom.translate('diary.lesson.label');
	    var newItem;
	    if (timeFromCalendar) {
	        newItem = entcore_1.model.calendar.newItem;
	        // force to HH:00 -> HH:00 + 1 hour
	        newItem.beginning = newItem.beginning.second(0);
	        newItem.date = newItem.beginning;
	        if (!newItem.beginning.isBefore(newItem.end)) {
	            newItem.end = entcore_1.moment(newItem.beginning);
	            newItem.end.minute(0).second(0).add(1, 'hours');
	        }
	        if (newItem.audience) {
	            lesson.audience = newItem.audience;
	            lesson.audienceType = lesson.audience.type;
	        }
	        if (newItem.room) {
	            lesson.room = newItem.room;
	        }
	        if (newItem.subject) {
	            lesson.subject = newItem.subject;
	        }
	    }
	    else {
	        var itemDate = (selectedDate) ? entcore_1.moment(selectedDate) : entcore_1.moment();
	        newItem = {
	            date: itemDate,
	            beginning: entcore_1.moment().minute(0).second(0),
	            end: entcore_1.moment().minute(0).second(0).add(1, 'hours')
	        };
	    }
	    lesson.newItem = newItem;
	    lesson.startTime = newItem.beginning;
	    lesson.endTime = newItem.end;
	    lesson.date = newItem.date;
	    return lesson;
	};
	/**
	 * Load previous lessons from current one
	 * Attached homeworks to lessons are also loaded
	 * @param lesson
	 * @param useDeltaStep
	 * @param cb Callback function
	 * @param cbe Callback on error function
	 */
	entcore_1.model.getPreviousLessonsFromLesson = function (lesson, useDeltaStep, cb, cbe) {
	    console.warn("deprecated");
	    return;
	    // if (useDeltaStep) {
	    //     if (lesson.allPreviousLessonsLoaded) {
	    //         return;
	    //     }
	    // }/* else if (lesson.previousLessonsLoaded || lesson.previousLessonsLoading == true) {
	    //     return;
	    // }*/
	    //
	    // if (!useDeltaStep) {
	    //     lesson.allPreviousLessonsLoaded = false;
	    // }
	    //
	    // var defaultCount = 6;
	    //
	    // var idx_start = 0;
	    // var idx_end = idx_start + defaultCount;
	    //
	    // if (useDeltaStep) {
	    //     idx_start += defaultCount;
	    //     idx_end += defaultCount;
	    // }
	    //
	    // var params = {};
	    //
	    // params.offset = idx_start;
	    // params.limit = idx_end;
	    //
	    // if (lesson.id) {
	    //     params.excludeLessonId = lesson.id;
	    // }
	    //
	    // // tricky way to detect if string date or moment date ...
	    // // 12:00:00
	    // if (lesson.endTime.length === 8) {
	    //     params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + lesson.endTime;
	    // } else {
	    //     params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + moment(lesson.endTime).format("HH:mm");
	    // }
	    //
	    // var clonedLessonMoment = moment(new Date(lesson.date));
	    // //params.startDate = clonedLessonMoment.add(-2, 'month').format(DATE_FORMAT);
	    // params.subject = lesson.subject.id;
	    // params.audienceId = lesson.audience.id;
	    // params.returnType = 'lesson'; // will allow get lessons first, then homeworks later
	    // params.homeworkLinkedToLesson = "true";
	    // params.sortOrder = "DESC";
	    //
	    // if (!lesson.previousLessons) {
	    //     lesson.previousLessons = new Array();
	    // }
	    // lesson.previousLessonsDisplayed = new Array();
	    //
	    // lesson.previousLessonsLoading = true;
	    // http().postJson('/diary/pedagogicItems/list', params).done(function (items) {
	    //
	    //     // all lessons loaded
	    //     if (items.length < defaultCount) {
	    //         lesson.allPreviousLessonsLoaded = true;
	    //     }
	    //
	    //     var previousLessonsAndHomeworks = _.map(items, sqlToJsPedagogicItem);
	    //
	    //     var groupByItemType = _.groupBy(previousLessonsAndHomeworks, 'type_item');
	    //
	    //     var previousLessons = groupByItemType.lesson;
	    //
	    //     if (previousLessons) {
	    //         var previousLessonIds = new Array();
	    //
	    //         previousLessons.forEach(function (lesson) {
	    //             previousLessonIds.push(lesson.id);
	    //         });
	    //
	    //
	    //         // load linked homeworks of previous lessons
	    //         var paramsHomeworks = {};
	    //         paramsHomeworks.returnType = 'homework';
	    //         paramsHomeworks.homeworkLessonIds = previousLessonIds;
	    //
	    //         http().postJson('/diary/pedagogicItems/list', paramsHomeworks).done(function (items2) {
	    //
	    //             var previousHomeworks = _.map(items2, sqlToJsPedagogicItem);
	    //
	    //             previousLessons.forEach(function (lesson) {
	    //                 lesson.homeworks = _.where(previousHomeworks, {lesson_id: lesson.id});
	    //             });
	    //
	    //             lesson.previousLessons = lesson.previousLessons.concat(previousLessons);
	    //             lesson.previousLessonsLoaded = true;
	    //             lesson.previousLessonsLoading = false;
	    //             lesson.previousLessonsDisplayed = lesson.previousLessons;
	    //
	    //             if (typeof cb === 'function') {
	    //                 cb();
	    //             }
	    //         });
	    //     } else {
	    //         lesson.previousLessons = new Array();
	    //         lesson.previousLessonsLoaded = true;
	    //         lesson.previousLessonsLoading = false;
	    //         lesson.previousLessonsDisplayed = lesson.previousLessons;
	    //         if (typeof cb === 'function') {
	    //             cb();
	    //         }
	    //     }
	    //
	    // }).error(function (e) {
	    //     if (typeof cbe === 'function') {
	    //         cbe(model.parseError(e));
	    //     }
	    // });
	};
	entcore_1.model.performPedagogicItemSearch = function (params, isTeacher, cb, cbe) {
	    // global quick search panel
	    if (params.isQuickSearch) {
	        if (params.returnType === 'lesson') {
	            entcore_1.model.pedagogicDaysQuickSearchLesson = new Array();
	        }
	        else {
	            entcore_1.model.pedagogicDaysQuickSearchHomework = new Array();
	        }
	    }
	    else {
	        entcore_1.model.pedagogicDays.reset();
	    }
	    return entcore_1.model.getHttp()({
	        method: 'POST',
	        url: '/diary/pedagogicItems/list',
	        data: params
	    }).then(function (result) {
	        var items = result.data;
	        var pedagogicItemsFromDB = entcore_1._.map(items, tools_1.sqlToJsPedagogicItem);
	        var days = entcore_1._.groupBy(pedagogicItemsFromDB, 'day');
	        var pedagogicDays = [];
	        var aDayIsSelected = false;
	        for (var day in days) {
	            if (days.hasOwnProperty(day)) {
	                var pedagogicDay = new PedagogicDay_model_1.PedagogicDay();
	                pedagogicDay.selected = false;
	                pedagogicDay.dayName = entcore_1.moment(day).format("dddd DD MMMM YYYY");
	                pedagogicDay.shortName = pedagogicDay.dayName.substring(0, 2);
	                pedagogicDay.shortDate = entcore_1.moment(day).format("DD/MM");
	                pedagogicDay.pedagogicItemsOfTheDay = days[day];
	                var countItems = entcore_1._.groupBy(pedagogicDay.pedagogicItemsOfTheDay, 'type_item');
	                pedagogicDay.nbLessons = (countItems['lesson']) ? countItems['lesson'].length : 0;
	                pedagogicDay.nbHomeworks = (countItems['homework']) ? countItems['homework'].length : 0;
	                //select default day
	                if (isTeacher) {
	                    if (!aDayIsSelected) {
	                        pedagogicDay.selected = true;
	                        aDayIsSelected = true;
	                    }
	                }
	                else {
	                    if (pedagogicDay.nbHomeworks > 0 && !aDayIsSelected) {
	                        pedagogicDay.selected = true;
	                        aDayIsSelected = true;
	                    }
	                }
	                pedagogicDays.push(pedagogicDay);
	            }
	        }
	        if (pedagogicDays[0] && !aDayIsSelected) {
	            pedagogicDays[0].selected = true;
	        }
	        // global quick search panel
	        if (params.isQuickSearch) {
	            if (params.returnType === 'lesson') {
	                entcore_1.model.pedagogicDaysQuickSearchLesson = entcore_1.model.pedagogicDaysQuickSearchLesson.concat(pedagogicDays);
	            }
	            else {
	                entcore_1.model.pedagogicDaysQuickSearchHomework = entcore_1.model.pedagogicDaysQuickSearchHomework.concat(pedagogicDays);
	            }
	        }
	        else {
	            entcore_1.model.pedagogicDays.pushAll(pedagogicDays);
	        }
	        entcore_1.model.initSubjects();
	        if (typeof cb === 'function') {
	            cb();
	        }
	        return pedagogicDays;
	    });
	};
	/**
	 * List children of current authenticated user (if parent)
	 * @param cb Callback function
	 * @param cbe Callback error function
	 */
	entcore_1.model.listChildren = function (cb, cbe) {
	    // no children - abort
	    if (!entcore_1.model.me.childrenIds || entcore_1.model.me.childrenIds.length == 0) {
	        if (typeof cb === 'function') {
	            cb();
	        }
	        return;
	    }
	    return entcore_1.model.getHttp()({
	        method: 'GET',
	        url: '/diary/children/list'
	    }).then(function (result) {
	        entcore_1.model.childs.removeAll();
	        entcore_1.model.childs.addRange(result.data);
	        if (entcore_1.model.childs.all.length > 0) {
	            entcore_1.model.child = entcore_1.model.childs.all[0];
	            entcore_1.model.child.selected = true;
	        }
	        if (typeof cb === 'function') {
	            cb();
	        }
	    });
	};
	//builds the set of different subjects encountered in the pedagogic items of the list
	entcore_1.model.initSubjects = function () {
	    var subjects = [];
	    entcore_1.model.pedagogicDays.forEach(function (pedagogicDay) {
	        pedagogicDay.pedagogicItemsOfTheDay.forEach(function (pedagogicItem) {
	            if (!pedagogicItem) {
	                return;
	            }
	            var subjectName = pedagogicItem.subject;
	            if (!entcore_1._.contains(subjects, subjectName)) {
	                subjects.push(subjectName);
	            }
	        });
	    });
	    entcore_1.model.searchForm.subjects = subjects;
	};
	/**
	 * Find subject by id
	 * @param subjectId
	 * @returns {null} Subject with id set
	 */
	entcore_1.model.findSubjectById = function (subjectId) {
	    var subjectMatch = null;
	    entcore_1.model.subjects.all.forEach(function (subject) {
	        if (subject.id == subjectId) {
	            subjectMatch = subject;
	        }
	    });
	    return subjectMatch;
	};
	/**
	 * Find subjects matching label user inputed.
	 * @param label Label subject (might be partial, not case sensitive)
	 */
	entcore_1.model.findSubjectsByLabel = function (label) {
	    var subjectsFound = new Array();
	    if (label.length > 0) {
	        var labelLowerCaseNoAccent = tools_1.sansAccent(label).toLowerCase();
	        entcore_1.model.subjects.all.forEach(function (subject) {
	            var labelSubjectLowerCaseNoAccent = tools_1.sansAccent(subject.label.toLowerCase());
	            if (labelSubjectLowerCaseNoAccent.indexOf(labelLowerCaseNoAccent) != -1) {
	                subjectsFound.push(subject);
	            }
	        });
	    }
	    return subjectsFound;
	};
	/**
	 * Creates new subject
	 */
	entcore_1.model.createSubject = function (label, cb, cbe) {
	    var subject = new Subject_model_1.Subject();
	    subject.label = label;
	    return subject.save(cb, cbe);
	};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(37));

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(38));
	__export(__webpack_require__(39));
	__export(__webpack_require__(40));
	__export(__webpack_require__(41));
	__export(__webpack_require__(73));
	__export(__webpack_require__(74));


/***/ }),
/* 38 */
/***/ (function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	function mapToArray(map) {
	    var result = [];
	    map.forEach(function (item) {
	        result.push(item);
	    });
	    return result;
	}
	var Mix = (function () {
	    function Mix() {
	    }
	    Mix.extend = function (obj, mixin, casts) {
	        var _loop_1 = function () {
	            var value = mixin[property];
	            if (casts && casts[property] && value) {
	                var castItem = casts[property];
	                var cast_1;
	                if (castItem instanceof Function) {
	                    cast_1 = {
	                        type: castItem,
	                        deps: []
	                    };
	                }
	                else {
	                    cast_1 = {
	                        type: castItem.type,
	                        single: castItem.single,
	                        deps: castItem.deps ? castItem.deps : []
	                    };
	                }
	                var doCast_1 = function (v) {
	                    var instance = new ((_a = cast_1.type).bind.apply(_a, [void 0].concat(cast_1.deps)))();
	                    if (instance.mixin)
	                        instance.mixin(v);
	                    else
	                        Mix.extend(instance, v);
	                    return instance;
	                    var _a;
	                };
	                if (value instanceof Array && cast_1.single) {
	                    obj[property] = [];
	                    value.forEach(function (v) {
	                        obj[property].push(doCast_1(v));
	                    });
	                }
	                else {
	                    obj[property] = doCast_1(value);
	                }
	            }
	            else if (!value || typeof value !== 'object' || value instanceof Array) {
	                obj[property] = value;
	            }
	            else {
	                if (obj[property] instanceof TypedArray) {
	                    obj[property].load(value);
	                }
	                else {
	                    if (!obj[property]) {
	                        obj[property] = {};
	                    }
	                    this_1.extend(obj[property], value);
	                }
	            }
	        };
	        var this_1 = this;
	        for (var property in mixin) {
	            _loop_1();
	        }
	        if (obj && obj.fromJSON) {
	            obj.fromJSON(mixin);
	        }
	    };
	    Mix.castAs = function (className, obj, params) {
	        if (params === void 0) { params = {}; }
	        var newObj = new className(params);
	        this.extend(newObj, obj);
	        return newObj;
	    };
	    Mix.castArrayAs = function (className, arr, params) {
	        if (params === void 0) { params = {}; }
	        var newArr = [];
	        arr.forEach(function (item) {
	            newArr.push(Mix.castAs(className, item, params));
	        });
	        return newArr;
	    };
	    return Mix;
	}());
	exports.Mix = Mix;
	var TypedArray = (function (_super) {
	    __extends(TypedArray, _super);
	    function TypedArray(className, mixin) {
	        if (mixin === void 0) { mixin = {}; }
	        var _this = _super.call(this) || this;
	        _this.className = className;
	        _this.mixin = mixin;
	        return _this;
	    }
	    TypedArray.prototype.push = function () {
	        var _this = this;
	        var items = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            items[_i - 0] = arguments[_i];
	        }
	        items.forEach(function (item) {
	            if (!(item instanceof _this.className)) {
	                item = Mix.castAs(_this.className, item);
	            }
	            for (var prop in _this.mixin) {
	                item[prop] = _this.mixin[prop];
	            }
	            Array.prototype.push.call(_this, item);
	        });
	        return this.length;
	    };
	    TypedArray.prototype.load = function (data) {
	        var _this = this;
	        data.forEach(function (item) {
	            _this.push(item);
	        });
	    };
	    TypedArray.prototype.asArray = function () {
	        return mapToArray(this);
	    };
	    TypedArray.prototype.toJSON = function () {
	        return mapToArray(this);
	    };
	    return TypedArray;
	}(Array));
	exports.TypedArray = TypedArray;


/***/ }),
/* 39 */
/***/ (function(module, exports) {

	"use strict";
	var Eventer = (function () {
	    function Eventer() {
	        this.events = new Map();
	    }
	    Eventer.prototype.trigger = function (eventName, data) {
	        if (this.events[eventName]) {
	            this.events[eventName].forEach(function (f) { return f(data); });
	        }
	    };
	    Eventer.prototype.on = function (eventName, cb) {
	        if (!this.events[eventName]) {
	            this.events[eventName] = [];
	        }
	        this.events[eventName].push(cb);
	    };
	    Eventer.prototype.off = function (eventName, cb) {
	        if (!this.events[eventName]) {
	            return;
	        }
	        if (cb === undefined) {
	            this.events[eventName] = [];
	            return;
	        }
	        var index = this.events[eventName].indexOf(cb);
	        if (index !== -1) {
	            this.events[eventName].splice(index, 1);
	        }
	    };
	    Eventer.prototype.once = function (eventName, cb) {
	        var _this = this;
	        var callback = function (data) {
	            cb(data);
	            _this.off(eventName, callback);
	        };
	        this.on(eventName, callback);
	    };
	    return Eventer;
	}());
	exports.Eventer = Eventer;


/***/ }),
/* 40 */
/***/ (function(module, exports) {

	"use strict";
	var Selection = (function () {
	    function Selection(arr) {
	        this.arr = arr;
	        this.selectedElements = [];
	    }
	    Object.defineProperty(Selection.prototype, "all", {
	        get: function () {
	            return this.arr;
	        },
	        set: function (all) {
	            this.arr = all;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Selection.prototype.filter = function (filter) {
	        return this.arr.filter(filter);
	    };
	    Selection.prototype.push = function (item) {
	        this.arr.push(item);
	    };
	    Selection.prototype.addRange = function (arr) {
	        for (var i = 0; i < arr.length; i++) {
	            this.all.push(arr[i]);
	        }
	    };
	    Object.defineProperty(Selection.prototype, "colLength", {
	        get: function () {
	            return this.arr.length;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Selection.prototype, "length", {
	        get: function () {
	            return this.selected.length;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Selection.prototype.forEach = function (func) {
	        this.arr.forEach(func);
	    };
	    Selection.prototype.selectAll = function () {
	        for (var i = 0; i < this.arr.length; i++) {
	            this.arr[i].selected = true;
	        }
	    };
	    Selection.prototype.select = function (filter) {
	        for (var i = 0; i < this.arr.length; i++) {
	            this.arr[i].selected = filter(this.arr[i]);
	        }
	    };
	    Selection.prototype.deselect = function (filter) {
	        for (var i = 0; i < this.arr.length; i++) {
	            this.arr[i].selected = !filter(this.arr[i]);
	        }
	    };
	    Selection.prototype.deselectAll = function () {
	        for (var i = 0; i < this.arr.length; i++) {
	            this.arr[i].selected = false;
	        }
	    };
	    Selection.prototype.removeSelection = function () {
	        var newArr = [];
	        for (var i = 0; i < this.arr.length; i++) {
	            if (!this.arr[i].selected) {
	                newArr.push(this.arr[i]);
	            }
	        }
	        this.arr.splice(0, this.arr.length);
	        for (var i = 0; i < newArr.length; i++) {
	            this.arr.push(newArr[i]);
	        }
	    };
	    Selection.prototype.updateSelected = function () {
	        for (var i = 0; i < this.arr.length; i++) {
	            var index = this.selectedElements.indexOf(this.arr[i]);
	            if (this.arr[i].selected && index === -1) {
	                this.selectedElements.push(this.arr[i]);
	            }
	            else if (!this.arr[i].selected && index !== -1) {
	                this.selectedElements.splice(index, 1);
	            }
	        }
	        for (var i = 0; i < this.selectedElements.length; i++) {
	            var index = this.arr.indexOf(this.selectedElements[i]);
	            if (index === -1) {
	                this.selectedElements.splice(index, 1);
	            }
	        }
	    };
	    Object.defineProperty(Selection.prototype, "selected", {
	        // a specific array is maintained to avoid references breaking all the time
	        get: function () {
	            this.updateSelected();
	            return this.selectedElements;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return Selection;
	}());
	exports.Selection = Selection;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(42));
	__export(__webpack_require__(43));
	__export(__webpack_require__(69));
	__export(__webpack_require__(70));
	__export(__webpack_require__(71));
	__export(__webpack_require__(72));


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var minicast_1 = __webpack_require__(38);
	var AbstractCrud = (function () {
	    function AbstractCrud(api, model, initialCast, childrenCasts, customMixin) {
	        this.api = api;
	        this.model = model;
	        this.initialCast = initialCast;
	        this.childrenCasts = childrenCasts;
	        this.customMixin = customMixin;
	    }
	    AbstractCrud.prototype.parseApi = function (api, parameters) {
	        var _this = this;
	        if (typeof api === 'function') {
	            api = api();
	        }
	        return api.split(/(:[a-zA-Z0-9_.]+)/)
	            .map(function (fragment) {
	            return fragment.charAt(0) === ':' ?
	                parameters && parameters[fragment.substr(1)] ||
	                    _this.model[fragment.substr(1)] ||
	                    _this[fragment.substr(1)] ||
	                    fragment :
	                fragment;
	        }).join('');
	    };
	    AbstractCrud.prototype.defaultMixin = function (payload) {
	        var _this = this;
	        if (payload instanceof Array && this.model instanceof Array) {
	            this.model = [];
	            var model_1 = this.model; //fix type inference
	            payload.forEach(function (item) {
	                var instance = {};
	                if (_this.initialCast) {
	                    if (_this.initialCast instanceof Function) {
	                        instance = new _this.initialCast();
	                    }
	                    else {
	                        instance = new ((_a = _this.initialCast.type).bind.apply(_a, [void 0].concat(_this.initialCast.deps)))();
	                    }
	                }
	                minicast_1.Mix.extend(instance, item, _this.childrenCasts);
	                model_1.push(instance);
	                var _a;
	            });
	        }
	        else {
	            minicast_1.Mix.extend(this.model, payload, this.childrenCasts);
	        }
	    };
	    AbstractCrud.prototype.create = function (item, opts) {
	        var _this = this;
	        if (opts === void 0) { opts = {}; }
	        if (!this.api.create) {
	            throw '[Crud][Api] "create" route is undefined';
	        }
	        return this.http.post(this.parseApi(this.api.create, item), item || this.model, opts)
	            .then(function (response) {
	            if (_this.model instanceof Array) {
	                _this.model.push(item);
	            }
	            return response;
	        });
	    };
	    AbstractCrud.prototype.sync = function (opts) {
	        var _this = this;
	        if (opts === void 0) { opts = {}; }
	        if (!this.api.sync) {
	            throw '[Crud][Api] "sync" route is undefined';
	        }
	        return this.http.get(this.parseApi(this.api.sync), opts)
	            .then(function (response) {
	            (_this.customMixin || _this.defaultMixin).bind(_this)(response.data);
	            return response;
	        });
	    };
	    AbstractCrud.prototype.update = function (item, opts) {
	        if (opts === void 0) { opts = {}; }
	        if (!this.api.update) {
	            throw '[Crud][Api] "update" route is undefined';
	        }
	        return this.http.put(this.parseApi(this.api.update, item), item || this.model, opts);
	    };
	    AbstractCrud.prototype.delete = function (item, opts) {
	        var _this = this;
	        if (opts === void 0) { opts = {}; }
	        if (!this.api.delete) {
	            throw '[Crud][Api] "delete" route is undefined';
	        }
	        return this.http.delete(this.parseApi(this.api.delete, item), opts)
	            .then(function (response) {
	            if (_this.model instanceof Array) {
	                _this.model.splice(_this.model.indexOf(item), 1);
	            }
	            return response;
	        });
	    };
	    return AbstractCrud;
	}());
	exports.AbstractCrud = AbstractCrud;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var axios_1 = __webpack_require__(44);
	var abstract_crud_1 = __webpack_require__(42);
	var Crud = (function (_super) {
	    __extends(Crud, _super);
	    function Crud() {
	        var _this = _super.apply(this, arguments) || this;
	        _this.http = axios_1.default;
	        return _this;
	    }
	    return Crud;
	}(abstract_crud_1.AbstractCrud));
	exports.Crud = Crud;


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(45);

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	var bind = __webpack_require__(47);
	var Axios = __webpack_require__(48);
	var defaults = __webpack_require__(49);
	
	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);
	
	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios.prototype, context);
	
	  // Copy context to instance
	  utils.extend(instance, context);
	
	  return instance;
	}
	
	// Create the default instance to be exported
	var axios = createInstance(defaults);
	
	// Expose Axios class to allow class inheritance
	axios.Axios = Axios;
	
	// Factory for creating new instances
	axios.create = function create(instanceConfig) {
	  return createInstance(utils.merge(defaults, instanceConfig));
	};
	
	// Expose Cancel & CancelToken
	axios.Cancel = __webpack_require__(66);
	axios.CancelToken = __webpack_require__(67);
	axios.isCancel = __webpack_require__(63);
	
	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(68);
	
	module.exports = axios;
	
	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var bind = __webpack_require__(47);
	
	/*global toString:true*/
	
	// utils is a library of generic helper functions non-specific to axios
	
	var toString = Object.prototype.toString;
	
	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}
	
	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}
	
	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}
	
	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}
	
	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}
	
	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}
	
	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}
	
	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}
	
	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}
	
	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}
	
	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}
	
	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}
	
	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}
	
	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}
	
	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}
	
	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  typeof document.createElement -> undefined
	 */
	function isStandardBrowserEnv() {
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined' &&
	    typeof document.createElement === 'function'
	  );
	}
	
	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }
	
	  // Force an array if not already something iterable
	  if (typeof obj !== 'object' && !isArray(obj)) {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }
	
	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}
	
	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (typeof result[key] === 'object' && typeof val === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }
	
	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}
	
	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}
	
	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim
	};


/***/ }),
/* 47 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var defaults = __webpack_require__(49);
	var utils = __webpack_require__(46);
	var InterceptorManager = __webpack_require__(60);
	var dispatchRequest = __webpack_require__(61);
	var isAbsoluteURL = __webpack_require__(64);
	var combineURLs = __webpack_require__(65);
	
	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 */
	function Axios(instanceConfig) {
	  this.defaults = instanceConfig;
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}
	
	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }
	
	  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
	
	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }
	
	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);
	
	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }
	
	  return promise;
	};
	
	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	});
	
	module.exports = Axios;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(46);
	var normalizeHeaderName = __webpack_require__(50);
	
	var PROTECTION_PREFIX = /^\)\]\}',?\n/;
	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};
	
	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}
	
	function getDefaultAdapter() {
	  var adapter;
	  if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = __webpack_require__(51);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(51);
	  }
	  return adapter;
	}
	
	var defaults = {
	  adapter: getDefaultAdapter(),
	
	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Content-Type');
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils.isObject(data)) {
	      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
	      return JSON.stringify(data);
	    }
	    return data;
	  }],
	
	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      data = data.replace(PROTECTION_PREFIX, '');
	      try {
	        data = JSON.parse(data);
	      } catch (e) { /* Ignore */ }
	    }
	    return data;
	  }],
	
	  timeout: 0,
	
	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',
	
	  maxContentLength: -1,
	
	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};
	
	defaults.headers = {
	  common: {
	    'Accept': 'application/json, text/plain, */*'
	  }
	};
	
	utils.forEach(['delete', 'get', 'head'], function forEachMehtodNoData(method) {
	  defaults.headers[method] = {};
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
	});
	
	module.exports = defaults;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)))

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	
	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(46);
	var settle = __webpack_require__(52);
	var buildURL = __webpack_require__(55);
	var parseHeaders = __webpack_require__(56);
	var isURLSameOrigin = __webpack_require__(57);
	var createError = __webpack_require__(53);
	var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(58);
	
	module.exports = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;
	
	    if (utils.isFormData(requestData)) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }
	
	    var request = new XMLHttpRequest();
	    var loadEvent = 'onreadystatechange';
	    var xDomain = false;
	
	    // For IE 8/9 CORS support
	    // Only supports POST and GET calls and doesn't returns the response headers.
	    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	    if (process.env.NODE_ENV !== 'test' &&
	        typeof window !== 'undefined' &&
	        window.XDomainRequest && !('withCredentials' in request) &&
	        !isURLSameOrigin(config.url)) {
	      request = new window.XDomainRequest();
	      loadEvent = 'onload';
	      xDomain = true;
	      request.onprogress = function handleProgress() {};
	      request.ontimeout = function handleTimeout() {};
	    }
	
	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password || '';
	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	    }
	
	    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);
	
	    // Set the request timeout in MS
	    request.timeout = config.timeout;
	
	    // Listen for ready state
	    request[loadEvent] = function handleLoad() {
	      if (!request || (request.readyState !== 4 && !xDomain)) {
	        return;
	      }
	
	      // The request errored out and we didn't get a response, this will be
	      // handled by onerror instead
	      // With one exception: request that using file: protocol, most browsers
	      // will return status as 0 even though it's a successful request
	      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
	        return;
	      }
	
	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	      var response = {
	        data: responseData,
	        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
	        status: request.status === 1223 ? 204 : request.status,
	        statusText: request.status === 1223 ? 'No Content' : request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };
	
	      settle(resolve, reject, response);
	
	      // Clean up request
	      request = null;
	    };
	
	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(createError('Network Error', config));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED'));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils.isStandardBrowserEnv()) {
	      var cookies = __webpack_require__(59);
	
	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
	          cookies.read(config.xsrfCookieName) :
	          undefined;
	
	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }
	
	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }
	
	    // Add withCredentials to request if needed
	    if (config.withCredentials) {
	      request.withCredentials = true;
	    }
	
	    // Add responseType to request if needed
	    if (config.responseType) {
	      try {
	        request.responseType = config.responseType;
	      } catch (e) {
	        if (request.responseType !== 'json') {
	          throw e;
	        }
	      }
	    }
	
	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }
	
	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }
	
	    if (config.cancelToken) {
	      // Handle cancellation
	      config.cancelToken.promise.then(function onCanceled(cancel) {
	        if (!request) {
	          return;
	        }
	
	        request.abort();
	        reject(cancel);
	        // Clean up request
	        request = null;
	      });
	    }
	
	    if (requestData === undefined) {
	      requestData = null;
	    }
	
	    // Send the request
	    request.send(requestData);
	  });
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)))

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var createError = __webpack_require__(53);
	
	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(createError(
	      'Request failed with status code ' + response.status,
	      response.config,
	      null,
	      response
	    ));
	  }
	};


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var enhanceError = __webpack_require__(54);
	
	/**
	 * Create an Error with the specified message, config, error code, and response.
	 *
	 * @param {string} message The error message.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 @ @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	module.exports = function createError(message, config, code, response) {
	  var error = new Error(message);
	  return enhanceError(error, config, code, response);
	};


/***/ }),
/* 54 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Update an Error with the specified config, error code, and response.
	 *
	 * @param {Error} error The error to update.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 @ @param {Object} [response] The response.
	 * @returns {Error} The error.
	 */
	module.exports = function enhanceError(error, config, code, response) {
	  error.config = config;
	  if (code) {
	    error.code = code;
	  }
	  error.response = response;
	  return error;
	};


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	
	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%40/gi, '@').
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}
	
	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }
	
	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];
	
	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }
	
	      if (utils.isArray(val)) {
	        key = key + '[]';
	      }
	
	      if (!utils.isArray(val)) {
	        val = [val];
	      }
	
	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });
	
	    serializedParams = parts.join('&');
	  }
	
	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }
	
	  return url;
	};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	
	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;
	
	  if (!headers) { return parsed; }
	
	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));
	
	    if (key) {
	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	    }
	  });
	
	  return parsed;
	};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	  (function standardBrowserEnv() {
	    var msie = /(msie|trident)/i.test(navigator.userAgent);
	    var urlParsingNode = document.createElement('a');
	    var originURL;
	
	    /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	    function resolveURL(url) {
	      var href = url;
	
	      if (msie) {
	        // IE needs attribute set twice to normalize properties
	        urlParsingNode.setAttribute('href', href);
	        href = urlParsingNode.href;
	      }
	
	      urlParsingNode.setAttribute('href', href);
	
	      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	      return {
	        href: urlParsingNode.href,
	        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	        host: urlParsingNode.host,
	        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	        hostname: urlParsingNode.hostname,
	        port: urlParsingNode.port,
	        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	                  urlParsingNode.pathname :
	                  '/' + urlParsingNode.pathname
	      };
	    }
	
	    originURL = resolveURL(window.location.href);
	
	    /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	    return function isURLSameOrigin(requestURL) {
	      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	      return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	    };
	  })() :
	
	  // Non standard browser envs (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return function isURLSameOrigin() {
	      return true;
	    };
	  })()
	);


/***/ }),
/* 58 */
/***/ (function(module, exports) {

	'use strict';
	
	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js
	
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	
	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error;
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';
	
	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	    // initialize result and counter
	    var block, charCode, idx = 0, map = chars;
	    // if the next str index does not exist:
	    //   change the mapping table to "="
	    //   check if d has no fractional digits
	    str.charAt(idx | 0) || (map = '=', idx % 1);
	    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	  ) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}
	
	module.exports = btoa;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs support document.cookie
	  (function standardBrowserEnv() {
	    return {
	      write: function write(name, value, expires, path, domain, secure) {
	        var cookie = [];
	        cookie.push(name + '=' + encodeURIComponent(value));
	
	        if (utils.isNumber(expires)) {
	          cookie.push('expires=' + new Date(expires).toGMTString());
	        }
	
	        if (utils.isString(path)) {
	          cookie.push('path=' + path);
	        }
	
	        if (utils.isString(domain)) {
	          cookie.push('domain=' + domain);
	        }
	
	        if (secure === true) {
	          cookie.push('secure');
	        }
	
	        document.cookie = cookie.join('; ');
	      },
	
	      read: function read(name) {
	        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	        return (match ? decodeURIComponent(match[3]) : null);
	      },
	
	      remove: function remove(name) {
	        this.write(name, '', Date.now() - 86400000);
	      }
	    };
	  })() :
	
	  // Non standard browser env (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return {
	      write: function write() {},
	      read: function read() { return null; },
	      remove: function remove() {}
	    };
	  })()
	);


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	
	function InterceptorManager() {
	  this.handlers = [];
	}
	
	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};
	
	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};
	
	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};
	
	module.exports = InterceptorManager;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	var transformData = __webpack_require__(62);
	var isCancel = __webpack_require__(63);
	var defaults = __webpack_require__(49);
	
	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }
	}
	
	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	module.exports = function dispatchRequest(config) {
	  throwIfCancellationRequested(config);
	
	  // Ensure headers exist
	  config.headers = config.headers || {};
	
	  // Transform request data
	  config.data = transformData(
	    config.data,
	    config.headers,
	    config.transformRequest
	  );
	
	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers || {}
	  );
	
	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );
	
	  var adapter = config.adapter || defaults.adapter;
	
	  return adapter(config).then(function onAdapterResolution(response) {
	    throwIfCancellationRequested(config);
	
	    // Transform response data
	    response.data = transformData(
	      response.data,
	      response.headers,
	      config.transformResponse
	    );
	
	    return response;
	  }, function onAdapterRejection(reason) {
	    if (!isCancel(reason)) {
	      throwIfCancellationRequested(config);
	
	      // Transform response data
	      if (reason && reason.response) {
	        reason.response.data = transformData(
	          reason.response.data,
	          reason.response.headers,
	          config.transformResponse
	        );
	      }
	    }
	
	    return Promise.reject(reason);
	  });
	};


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(46);
	
	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });
	
	  return data;
	};


/***/ }),
/* 63 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};


/***/ }),
/* 64 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};


/***/ }),
/* 65 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	module.exports = function combineURLs(baseURL, relativeURL) {
	  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
	};


/***/ }),
/* 66 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * A `Cancel` is an object that is thrown when an operation is canceled.
	 *
	 * @class
	 * @param {string=} message The message.
	 */
	function Cancel(message) {
	  this.message = message;
	}
	
	Cancel.prototype.toString = function toString() {
	  return 'Cancel' + (this.message ? ': ' + this.message : '');
	};
	
	Cancel.prototype.__CANCEL__ = true;
	
	module.exports = Cancel;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Cancel = __webpack_require__(66);
	
	/**
	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
	 *
	 * @class
	 * @param {Function} executor The executor function.
	 */
	function CancelToken(executor) {
	  if (typeof executor !== 'function') {
	    throw new TypeError('executor must be a function.');
	  }
	
	  var resolvePromise;
	  this.promise = new Promise(function promiseExecutor(resolve) {
	    resolvePromise = resolve;
	  });
	
	  var token = this;
	  executor(function cancel(message) {
	    if (token.reason) {
	      // Cancellation has already been requested
	      return;
	    }
	
	    token.reason = new Cancel(message);
	    resolvePromise(token.reason);
	  });
	}
	
	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
	  if (this.reason) {
	    throw this.reason;
	  }
	};
	
	/**
	 * Returns an object that contains a new `CancelToken` and a function that, when called,
	 * cancels the `CancelToken`.
	 */
	CancelToken.source = function source() {
	  var cancel;
	  var token = new CancelToken(function executor(c) {
	    cancel = c;
	  });
	  return {
	    token: token,
	    cancel: cancel
	  };
	};
	
	module.exports = CancelToken;


/***/ }),
/* 68 */
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var abstract_crud_1 = __webpack_require__(42);
	var minicast_1 = __webpack_require__(38);
	var AbstractCollection = (function (_super) {
	    __extends(AbstractCollection, _super);
	    function AbstractCollection(api, initialCast, childrenCasts) {
	        var _this = _super.call(this, api, null, initialCast, childrenCasts) || this;
	        _this.data = [];
	        _this.model = _this.data;
	        _this.customMixin = _this.mixin;
	        return _this;
	    }
	    AbstractCollection.prototype.mixin = function (data) {
	        var _this = this;
	        if (!data || !(data instanceof Array)) {
	            throw "[Crud][Collection] An Array payload is expected.";
	        }
	        this.data = [];
	        data.forEach(function (item) {
	            var instance = {};
	            if (_this.initialCast) {
	                if (_this.initialCast instanceof Function) {
	                    instance = new _this.initialCast();
	                }
	                else {
	                    instance = new ((_a = _this.initialCast.type).bind.apply(_a, [void 0].concat(_this.initialCast.deps)))();
	                }
	            }
	            minicast_1.Mix.extend(instance, item, _this.childrenCasts);
	            _this.data.push(instance);
	            var _a;
	        });
	    };
	    return AbstractCollection;
	}(abstract_crud_1.AbstractCrud));
	exports.AbstractCollection = AbstractCollection;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var axios_1 = __webpack_require__(44);
	var abstract_collection_1 = __webpack_require__(69);
	var Collection = (function (_super) {
	    __extends(Collection, _super);
	    function Collection(api, initialCast, childrenCasts) {
	        var _this = _super.call(this, api, initialCast, childrenCasts) || this;
	        _this.http = axios_1.default;
	        return _this;
	    }
	    return Collection;
	}(abstract_collection_1.AbstractCollection));
	exports.Collection = Collection;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var abstract_crud_1 = __webpack_require__(42);
	var minicast_1 = __webpack_require__(38);
	var AbstractModel = (function (_super) {
	    __extends(AbstractModel, _super);
	    function AbstractModel(api, childrenCasts) {
	        var _this = _super.call(this, api, null, null, childrenCasts) || this;
	        _this.model = _this;
	        _this.customMixin = _this.mixin;
	        return _this;
	    }
	    AbstractModel.prototype.mixin = function (data) {
	        if (!data || !(data instanceof Object)) {
	            throw "[Crud][Collection] An Object payload is expected.";
	        }
	        minicast_1.Mix.extend(this, data, this.childrenCasts);
	    };
	    return AbstractModel;
	}(abstract_crud_1.AbstractCrud));
	exports.AbstractModel = AbstractModel;


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var axios_1 = __webpack_require__(44);
	var abstract_model_1 = __webpack_require__(71);
	var Model = (function (_super) {
	    __extends(Model, _super);
	    function Model(api, childrenCasts) {
	        var _this = _super.call(this, api, childrenCasts) || this;
	        _this.http = axios_1.default;
	        return _this;
	    }
	    return Model;
	}(abstract_model_1.AbstractModel));
	exports.Model = Model;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments)).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
	    return { next: verb(0), "throw": verb(1), "return": verb(2) };
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (_) try {
	            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [0, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	var eventer_1 = __webpack_require__(39);
	var minicast_1 = __webpack_require__(38);
	var axios_1 = __webpack_require__(44);
	/*
	 * Tool to manage a single list provider used by multiple objects (to avoid multiple call to a same path)
	 * Usage :
	 * let provider = new Provider<T>(path, MyClass);
	 * function a(){
	 *    //get data from provider
	 *    let data = await provider.data();
	 * }
	 *
	 * function b(){
	 *    let data = await provider.data();
	 *    //get data when a refresh happens
	 *    provider.on('refresh', (newData) => data = newData));
	 * }
	 *
	 * //force provider refresh (after data invalidation)
	 * setTimeout(() => provider.refresh(), 50000);
	 *
	 * a();
	 * b();
	*/
	var Provider = (function () {
	    function Provider(path, className) {
	        this.path = path;
	        this.className = className;
	        this._data = [];
	        this.eventer = new eventer_1.Eventer();
	    }
	    Provider.prototype.data = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        if (!(!this.isSynced && !this.syncing))
	                            return [3 /*break*/, 2];
	                        return [4 /*yield*/, this.sync()];
	                    case 1:
	                        _a.sent();
	                        _a.label = 2;
	                    case 2:
	                        if (!this.syncing)
	                            return [3 /*break*/, 4];
	                        return [4 /*yield*/, this.syncDone()];
	                    case 3:
	                        _a.sent();
	                        _a.label = 4;
	                    case 4: return [2 /*return*/, this._data];
	                }
	            });
	        });
	    };
	    Provider.prototype.syncDone = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var _this = this;
	            return __generator(this, function (_a) {
	                return [2 /*return*/, new Promise(function (resolve, reject) {
	                        _this.eventer.once('sync', function () { return resolve(); });
	                    })];
	            });
	        });
	    };
	    Provider.prototype.sync = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var response;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        this.syncing = true;
	                        return [4 /*yield*/, axios_1.default.get(this.path)];
	                    case 1:
	                        response = _a.sent();
	                        this._data = minicast_1.Mix.castArrayAs(this.className, response.data);
	                        this.isSynced = true;
	                        this.eventer.trigger('sync');
	                        this.syncing = false;
	                        return [2 /*return*/];
	                }
	            });
	        });
	    };
	    Provider.prototype.refresh = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        this.isSynced = false;
	                        return [4 /*yield*/, this.sync()];
	                    case 1:
	                        _a.sent();
	                        this.eventer.trigger('refresh');
	                        return [2 /*return*/];
	                }
	            });
	        });
	    };
	    Provider.prototype.push = function (data) {
	        this._data.push(data);
	    };
	    Provider.prototype.remove = function (data) {
	        var index = this._data.indexOf(data);
	        this._data.splice(index, 1);
	    };
	    return Provider;
	}());
	exports.Provider = Provider;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var axios_1 = __webpack_require__(44);
	var autosaved = [];
	var loopStarted = false;
	var token;
	var loop = function () {
	    autosaved.forEach(function (item) {
	        if (item._backup !== JSON.stringify(item.model)) {
	            if (item.fn) {
	                item.fn();
	            }
	            else {
	                axios_1.default[item.method](item.path, item.model);
	            }
	            item._backup = JSON.stringify(item.model);
	        }
	    });
	    loopStarted = true;
	    token = setTimeout(loop, 500);
	};
	var Autosave = (function () {
	    function Autosave() {
	    }
	    Autosave.watch = function (path, model, method) {
	        if (method === void 0) { method = 'put'; }
	        if (autosaved.findIndex(function (e) { return e.model === model && e.path === path; }) !== -1) {
	            return;
	        }
	        var autosave;
	        if (typeof path === 'string') {
	            autosave = {
	                model: model,
	                path: path,
	                method: method
	            };
	        }
	        else {
	            autosave = {
	                model: model,
	                fn: path,
	                method: method
	            };
	        }
	        autosaved.push(autosave);
	        if (!loopStarted) {
	            loop();
	        }
	    };
	    Autosave.unwatch = function (model) {
	        var index = autosaved.findIndex(function (e) { return e.model === model; });
	        autosaved.splice(index, 1);
	        if (autosaved.length === 0) {
	            this.unwatchAll();
	        }
	    };
	    Autosave.unwatchAll = function () {
	        autosaved = [];
	        clearTimeout(token);
	        loopStarted = false;
	    };
	    return Autosave;
	}());
	exports.Autosave = Autosave;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var PedagogicDay = (function () {
	    function PedagogicDay() {
	        this.selected = false;
	        this.dayName = entcore_1.moment().format("dddd DD MMMM YYYY");
	        this.shortName = this.dayName.substring(0, 2);
	        this.shortDate = entcore_1.moment().format("DD/MM");
	        this.pedagogicItemsOfTheDay = [];
	        this.nbLessons = 0;
	        this.nbHomeworks = 0;
	        this.numberOfItems = function () {
	            return this.nbLessons + this.nbHomeworks;
	        };
	        this.resetCountValues = function () {
	            var countItems = entcore_1._.groupBy(this.pedagogicItemsOfTheDay, 'type_item');
	            this.nbLessons = (countItems['lesson']) ? countItems['lesson'].length : 0;
	            this.nbHomeworks = (countItems['homework']) ? countItems['homework'].length : 0;
	        };
	    }
	    return PedagogicDay;
	}());
	exports.PedagogicDay = PedagogicDay;


/***/ }),
/* 76 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var Child = (function () {
	    function Child() {
	        this.selected = false;
	    }
	    return Child;
	}());
	exports.Child = Child;


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(3);
	var SearchForm = (function () {
	    function SearchForm(isQuickSearch) {
	        this.startDate = {};
	        this.endDate = {};
	        this.publishState = {};
	        this.returnType = {};
	        this.displayLesson = {};
	        this.displayHomework = {};
	        this.audienceId = {};
	        this.subjects = [];
	        this.selectedSubject = null;
	        this.subjectsFilters = [];
	        this.initForTeacher = function () {
	            this.publishState = "";
	            this.returnType = "both";
	            var period = entcore_1.moment(entcore_1.model.calendar.dayForWeek).day(1);
	            this.startDate = period.format(tools_1.DATE_FORMAT);
	            this.endDate = period.add(15, 'days').format(tools_1.DATE_FORMAT);
	            this.displayLesson = true;
	            this.displayHomework = true;
	            this.audienceId = "";
	        };
	        this.initForStudent = function () {
	            this.publishState = "published";
	            this.returnType = "both";
	            var period = entcore_1.moment(entcore_1.model.calendar.dayForWeek).day(1);
	            this.startDate = period.format(tools_1.DATE_FORMAT);
	            this.endDate = period.add(15, 'days').format(tools_1.DATE_FORMAT);
	            this.displayLesson = false;
	            this.displayHomework = true;
	        };
	        this.getSearch = function () {
	            var params = {};
	            params.startDate = this.startDate;
	            params.endDate = this.endDate;
	            params.publishState = this.publishState;
	            params.returnType = this.returnType;
	            if (entcore_1.model.isUserParent()) {
	                params.audienceId = entcore_1.model.child.classId;
	            }
	            return params;
	        };
	        this.isQuickSearch = isQuickSearch;
	    }
	    return SearchForm;
	}());
	exports.SearchForm = SearchForm;
	;


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(3);
	var subject_service_1 = __webpack_require__(79);
	/*
	* Course service as class
	* used to manipulate Course model
	*/
	var CourseService = (function () {
	    function CourseService() {
	    }
	    CourseService.getMergeCourses = function (structureId, teacherId, firstDayOfWeek) {
	        var _this = this;
	        return entcore_1.$q.all([
	            this.getScheduleCourses(structureId, teacherId, firstDayOfWeek),
	            subject_service_1.SubjectService.getStructureSubjectsAsMap(structureId)
	        ]).then(function (results) {
	            var courses = results[0];
	            var subjects = results[1];
	            return _this.mappingCourses(courses, subjects);
	        });
	    };
	    CourseService.mappCourse = function (course) {
	        course.date = entcore_1.moment(course.startDate);
	        course.date.week(entcore_1.model.calendar.week);
	        course.startMoment = this.recalc(entcore_1.moment(course.startDate));
	        course.endMoment = this.recalc(entcore_1.moment(course.endDate));
	        course.startTime = entcore_1.moment(course.startDate).format('HH:mm:ss');
	        course.endTime = entcore_1.moment(course.endDate).format('HH:mm:ss');
	        course.calendarType = "shadow";
	        course.locked = true;
	        course.is_periodic = false;
	        course.notShowOnCollision = true;
	    };
	    CourseService.recalc = function (date) {
	        // multi week gestion
	        //https://groups.google.com/forum/#!topic/entcore/ne1ODPHQabE
	        var diff = date.diff(entcore_1.model.mondayOfWeek, 'days');
	        if (diff < 0 || diff > 6) {
	            var weekDay = date.weekday();
	            date.dayOfYear(entcore_1.model.mondayOfWeek.dayOfYear());
	            date.weekday(weekDay);
	        }
	        return date;
	    };
	    CourseService.mappingCourses = function (courses, subjects) {
	        var _this = this;
	        entcore_1._.each(courses, function (course) {
	            course.subject = subjects[course.subjectId];
	            _this.mappCourse(course);
	        });
	        return courses;
	    };
	    CourseService.getScheduleCourses = function (structureId, teacherId, firstDayOfWeek) {
	        var begin = entcore_1.moment(firstDayOfWeek).format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        var end = entcore_1.moment(firstDayOfWeek).add(6, 'd').format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        var url = "/directory/timetable/courses/" + structureId + "/" + begin + "/" + end;
	        var config = {
	            params: {
	                teacherId: teacherId
	            }
	        };
	        return entcore_1.$http.get(url, config).then(function (result) {
	            return result.data;
	        });
	    };
	    return CourseService;
	}());
	exports.CourseService = CourseService;
	;


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Subject_model_1 = __webpack_require__(34);
	var utils_service_1 = __webpack_require__(80);
	/*
	 * Subject service as class
	 * used to manipulate Subject model
	 */
	var SubjectService = (function () {
	    function SubjectService() {
	    }
	    /*
	    *   Get all subject from a structureId as map
	    *   used to map a course from the subject id
	    */
	    SubjectService.getStructureSubjectsAsMap = function (structureId) {
	        return this.getStructureSubjects(structureId).then(function (result) {
	            var subjects = result;
	            var results = {};
	            entcore_1._.each(subjects, function (subject) {
	                results[subject.subjectId] = subject;
	            });
	            return results;
	        });
	    };
	    /*
	    *   Get all subject from a structureId
	    *   used to map a course from the subject id
	    */
	    SubjectService.getStructureSubjects = function (structureId) {
	        if (!this.context.subjectPromise[structureId]) {
	            var url = "/directory/timetable/subjects/" + structureId;
	            this.context.subjectPromise[structureId] = entcore_1.$http.get(url).then(function (result) {
	                return result.data;
	            });
	        }
	        return this.context.subjectPromise[structureId];
	    };
	    /*
	    *   get subjects created by the teacher
	    *   used to edit a lesson
	    */
	    SubjectService.getCustomSubjects = function (isTeacher) {
	        var urlGetSubjects = '';
	        if (isTeacher) {
	            urlGetSubjects = '/diary/subject/initorlist';
	        }
	        else {
	            urlGetSubjects = '/diary/subject/list/' + utils_service_1.UtilsService.getUserStructuresIdsAsString();
	        }
	        return entcore_1.$http.get(urlGetSubjects).then(function (result) {
	            return result.data;
	        });
	    };
	    /*
	    * map original subject to diary subject
	    */
	    SubjectService.mapToDiarySubject = function (subject) {
	        var result = new Subject_model_1.Subject();
	        result.id = null;
	        result.school_id = subject.school_id;
	        result.label = subject.subjectLabel;
	        result.originalsubjectid = subject.subjectId;
	        result.teacher_id = subject.teacher_id;
	        return result;
	    };
	    SubjectService.context = {
	        subjectPromise: []
	    };
	    return SubjectService;
	}());
	exports.SubjectService = SubjectService;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	/*
	 * Utils service as class
	 * used to manipulate Utils model
	 */
	var UtilsService = (function () {
	    function UtilsService() {
	    }
	    UtilsService.getUserStructuresIdsAsString = function () {
	        var structureIds = "";
	        entcore_1.model.me.structures.forEach(function (structureId) {
	            structureIds += structureId + ":";
	        });
	        return structureIds;
	    };
	    /**
	     * Set lesson tooltip text depending on screen resolution.
	     * Tricky responsive must be linked to additional.css behaviour
	     * @param lesson
	     */
	    UtilsService.getResponsiveLessonTooltipText = function (lesson) {
	        var tooltipText = lesson.title + ' (' + entcore_1.idiom.translate(lesson.state) + ')';
	        var screenWidth = window.innerWidth;
	        // < 900 px display room
	        if (screenWidth < 900 && lesson.room) {
	            tooltipText += '<br>' + lesson.room;
	        }
	        // < 650 px display hour start and hour end
	        if (screenWidth < 650) {
	            tooltipText += '<br>' + [
	                [lesson.startMoment.format('HH')]
	            ] + 'h' + [
	                [lesson.startMoment.format('mm')]
	            ];
	            tooltipText += ' -> ' + [
	                [lesson.endMoment.format('HH')]
	            ] + 'h' + [
	                [lesson.endMoment.format('mm')]
	            ];
	        }
	        // < 600 px display subjectlabel
	        if (screenWidth < 650 && lesson.subjectLabel) {
	            tooltipText += '<br>' + lesson.subjectLabel;
	        }
	        tooltipText = tooltipText.trim();
	        return tooltipText;
	    };
	    return UtilsService;
	}());
	exports.UtilsService = UtilsService;
	;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Homework_model_1 = __webpack_require__(32);
	var Subject_model_1 = __webpack_require__(34);
	var tools_1 = __webpack_require__(3);
	var utils_service_1 = __webpack_require__(80);
	var attachment_service_1 = __webpack_require__(82);
	/*
	 * Lesson service as class
	 * used to manipulate Lesson model
	 */
	var LessonService = (function () {
	    function LessonService() {
	    }
	    LessonService.getLessons = function (userStructuresIds, mondayOfWeek, isUserParent, childId, fromDate, toDate) {
	        var _this = this;
	        var start = entcore_1.moment(mondayOfWeek).day(1).format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        var end = entcore_1.moment(mondayOfWeek).day(1).add(1, 'week').format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        if (fromDate) {
	            start = fromDate.format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	            end = toDate.format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        }
	        var urlGetLessons = "/diary/lesson/" + userStructuresIds + "/" + start + "/" + end + "/";
	        if (isUserParent && childId) {
	            urlGetLessons += childId;
	        }
	        else {
	            urlGetLessons += '%20';
	        }
	        return entcore_1.$http.get(urlGetLessons).then(function (result) {
	            return _this.mappLessons(result.data);
	        });
	    };
	    LessonService.getOtherLessons = function (userStructuresIds, mondayOfWeek, teacher, audience, fromDate, toDate) {
	        var _this = this;
	        var start = entcore_1.moment(mondayOfWeek).day(1).format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        var end = entcore_1.moment(mondayOfWeek).day(1).add(1, 'week').format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        if (fromDate) {
	            start = fromDate.format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	            end = toDate.format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        }
	        var type = teacher ? "teacher" : "audience";
	        var id = teacher ? teacher.key : audience.key;
	        var urlGetLessons = "/diary/lesson/external/" + userStructuresIds + "/" + start + "/" + end + "/" + type + "/" + id;
	        return entcore_1.$http.get(urlGetLessons).then(function (result) {
	            return _this.mappLessons(result.data);
	        });
	    };
	    /*
	    *   Map lesson
	    */
	    LessonService.mappLessons = function (lessons) {
	        var _this = this;
	        return entcore_1._.map(lessons, function (lessonData) {
	            return _this.mapLesson(lessonData);
	        });
	    };
	    /*
	    *  Map one lesson
	    */
	    LessonService.mapLesson = function (lessonData) {
	        var lessonHomeworks = [];
	        // only initialize homeworks attached to lesson
	        // with only id
	        if (lessonData.homework_ids) {
	            for (var i = 0; i < lessonData.homework_ids.length; i++) {
	                var homework = new Homework_model_1.Homework();
	                homework.id = lessonData.homework_ids[i];
	                homework.lesson_id = parseInt(lessonData.lesson_id);
	                homework.loaded = false; // means full lessonData from sql not loaded
	                lessonHomeworks.push(homework);
	            }
	        }
	        var lesson = {
	            //for share directive you must have _id
	            _id: lessonData.lesson_id,
	            id: lessonData.lesson_id,
	            title: lessonData.lesson_title,
	            audience: entcore_1.model.audiences.findWhere({ id: lessonData.audience_id }),
	            audienceId: lessonData.audience_id,
	            audienceLabel: lessonData.audience_label,
	            audienceType: lessonData.audience_type,
	            description: lessonData.lesson_description,
	            subject: entcore_1.model.subjects.findWhere({ id: lessonData.subject_id }),
	            subjectId: lessonData.subject_id,
	            subjectLabel: lessonData.subject_label,
	            teacherName: lessonData.teacher_display_name,
	            structureId: lessonData.school_id,
	            date: entcore_1.moment(lessonData.lesson_date),
	            startTime: lessonData.lesson_start_time,
	            endTime: lessonData.lesson_end_time,
	            color: lessonData.lesson_color,
	            room: lessonData.lesson_room,
	            annotations: lessonData.lesson_annotation,
	            startMoment: entcore_1.moment(lessonData.lesson_date.split(' ')[0] + ' ' + lessonData.lesson_start_time),
	            endMoment: entcore_1.moment(lessonData.lesson_date.split(' ')[0] + ' ' + lessonData.lesson_end_time),
	            state: lessonData.lesson_state,
	            is_periodic: false,
	            homeworks: lessonHomeworks,
	            tooltipText: '',
	            locked: (!entcore_1.model.canEdit()) ? true : lessonData.locked
	        };
	        lesson.subject = new Subject_model_1.Subject();
	        lesson.subject.label = lessonData.subject_label;
	        lesson.subject.id = lessonData.subject_id;
	        lesson.subject.teacher_id = lessonData.teacher_display_name;
	        if ('group' === lesson.audienceType) {
	            lesson.audienceTypeLabel = entcore_1.idiom.translate('diary.audience.group');
	        }
	        else {
	            lesson.audienceTypeLabel = entcore_1.idiom.translate('diary.audience.class');
	        }
	        if (lessonData.attachments) {
	            lesson.attachments = attachment_service_1.AttachmentService.mappAttachement(JSON.parse(lessonData.attachments));
	        }
	        lesson.tooltipText = utils_service_1.UtilsService.getResponsiveLessonTooltipText(lesson);
	        return lesson;
	    };
	    return LessonService;
	}());
	exports.LessonService = LessonService;
	;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Attachment_model_1 = __webpack_require__(83);
	/*
	 * Attachement service as class
	 * used to manipulate Attachement model
	 */
	var AttachmentService = (function () {
	    function AttachmentService() {
	    }
	    /*
	    *   Mapp homeworks
	    */
	    AttachmentService.mappAttachement = function (attachements) {
	        return entcore_1._.map(attachements, function (attachementData) {
	            var att = new Attachment_model_1.Attachment();
	            att.id = attachementData.id;
	            att.user_id = attachementData.user_id;
	            att.creation_date = attachementData.creation_date;
	            att.document_id = attachementData.document_id;
	            att.document_label = attachementData.document_label;
	            return att;
	        });
	    };
	    return AttachmentService;
	}());
	exports.AttachmentService = AttachmentService;
	;


/***/ }),
/* 83 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 }
	 }
	 * Model of attachment from
	 * table diary.attachment (DB)
	 * @constructor
	 */
	var Attachment = (function () {
	    function Attachment() {
	        /**
	         * Attachment id as in diary.attachment table
	         * @type {number}
	         */
	        this.id = null;
	        this.user_id = null;
	        /**
	         * Id of stored document within the document module
	         * (see mongodb -> Documents table)
	         * E.G: "b88a3c42-7e4f-4e1c-ab61-11c8872ef795"
	         * @type {string}
	         */
	        this.document_id = null;
	        /***
	         * Creation date
	         * @type {null}
	         */
	        this.creation_date = null;
	        /**
	         * Filename of attachment
	         * @type {string}
	         */
	        this.document_label = null;
	        /**
	         * Download the attachment
	         */
	        this.download = function () {
	            window.location.href = window.location.host + '/workspace/document/' + this.document_id;
	        };
	        /**
	         * Detach attachment to a lesson
	         * Attachment link will be detached to back end on lesson save
	         * @param item Lesson or homework
	         * @param cb Callback
	         * @param cbe Callback on error
	         */
	        this.detachFromItem = function (item, cb, cbe) {
	            var that = this;
	            if (item && item.attachments) {
	                var udpatedAttachments = new Array();
	                item.attachments.forEach(function (attachment) {
	                    if (attachment && attachment.document_id !== that.document_id) {
	                        udpatedAttachments.push(attachment);
	                    }
	                });
	                item.attachments = udpatedAttachments;
	                if (typeof cb === 'function') {
	                    cb();
	                }
	                else
	                    (typeof cbe === 'function');
	                {
	                    cbe();
	                }
	            }
	        };
	    }
	    return Attachment;
	}());
	exports.Attachment = Attachment;
	;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var SecureService = (function () {
	    function SecureService() {
	    }
	    SecureService.hasRight = function (right) {
	        var result = false;
	        entcore_1._.each(entcore_1.model.me.authorizedActions, function (authorizedAction) {
	            if (authorizedAction.displayName === right) {
	                result = true;
	            }
	        });
	        return result;
	    };
	    return SecureService;
	}());
	exports.SecureService = SecureService;


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	/*
	* Audience service as class
	* used to manipulate Audience model
	*/
	var AudienceService = (function () {
	    function AudienceService() {
	    }
	    AudienceService.getAudiencesAsMap = function (structureIdArray) {
	        return this.getAudiences(structureIdArray).then(function (classes) {
	            var result = {};
	            entcore_1._.each(classes, function (classe) {
	                result[classe.name] = classe;
	            });
	            return result;
	        });
	    };
	    /*
	    * get classes for all structureIds
	    */
	    AudienceService.getAudiences = function (structureIdArray) {
	        var _this = this;
	        //cache the promises, this datas will not change in a uniq session
	        var processes = [];
	        entcore_1._.each(structureIdArray, function (structureId) {
	            if (!_this.context.processesPromise[structureId]) {
	                _this.context.processesPromise[structureId] = [];
	                var url = "/userbook/structure/" + structureId;
	                _this.context.processesPromise[structureId] = entcore_1.$http.get(url).then(function (result) {
	                    return {
	                        structureId: structureId,
	                        structureData: result.data
	                    };
	                });
	            }
	            processes.push(_this.context.processesPromise[structureId]);
	        });
	        //execute promises
	        return entcore_1.$q.all(processes).then(function (results) {
	            var result = [];
	            entcore_1._.each(results, (function (datas) {
	                var structureId = datas.structureId;
	                var structureData = datas.structureData;
	                result = result.concat(_this.mapAudiences(structureData.classes, structureId));
	            }));
	            return result;
	        });
	    };
	    /*
	    *   map an Audience
	    */
	    AudienceService.mapAudiences = function (classes, structureId) {
	        return entcore_1._.map(classes, function (audience) {
	            audience.structureId = structureId;
	            audience.type = 'class';
	            audience.typeLabel = entcore_1.idiom.translate('diary.audience.class');
	            return audience;
	        });
	    };
	    AudienceService.context = {
	        processesPromise: []
	    };
	    return AudienceService;
	}());
	exports.AudienceService = AudienceService;
	;


/***/ })
/******/ ]);
//# sourceMappingURL=application.js.map