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
	var controllers = __webpack_require__(88);
	var directives = __webpack_require__(109);
	var filters = __webpack_require__(127);
	var model_1 = __webpack_require__(80);
	for (var controller in controllers) {
	    entcore_1.ng.controllers.push(controllers[controller]);
	}
	for (var directive in directives) {
	    entcore_1.ng.directives.push(directives[directive]);
	}
	for (var filter in filters) {
	    entcore_1.ng.filters.push(filters[filter]);
	}
	entcore_1.model.build = model_1.InitBuild;
	entcore_1.ng.controllers.push(controller_1.DiaryController);
	entcore_1.routes.define(function ($routeProvider) {
	    $routeProvider
	        .when('/showHistoryView', {
	        action: 'showHistoryView'
	    })
	        .when('/manageVisaView/:teacherId', {
	        action: 'manageVisaView'
	    })
	        .when('/progressionManagerView/:selectedProgressionId', {
	        action: 'progressionManagerView'
	    })
	        .when('/progressionEditLesson/:progressionId/:editProgressionLessonId', {
	        action: 'editLessonView'
	    })
	        .when('/createLessonView/:timeFromCalendar', {
	        action: 'createLessonView'
	    })
	        .when('/createHomeworkView', {
	        action: 'createHomeworkView'
	    })
	        .when('/editLessonView/:idLesson', {
	        action: 'editLessonView'
	    })
	        .when('/showLessonView/:idLesson', {
	        action: 'showLessonView'
	    })
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
	        .otherwise({
	        action: 'calendarView'
	    });
	});


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = entcore;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var _1 = __webpack_require__(3);
	var courses_service_1 = __webpack_require__(81);
	var lessons_service_1 = __webpack_require__(84);
	var secure_service_1 = __webpack_require__(86);
	var tools = __webpack_require__(73);
	var audiences_service_1 = __webpack_require__(87);
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
	    '$scope', '$rootScope', 'model', 'route', '$location', '$window', '$sce',
	    function ($scope, $rootScope, model, route, $location, $window, $sce) {
	        model.CourseService = courses_service_1.CourseService;
	        model.LessonService = lessons_service_1.LessonService;
	        $scope.constants = tools.CONSTANTS;
	        $scope.RIGHTS = tools.CONSTANTS.RIGHTS;
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
	        $scope.newLesson = new _1.Lesson();
	        $scope.newHomework = new _1.Homework();
	        $scope.newPedagogicItem = new _1.PedagogicItem();
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
	                if (secure_service_1.SecureService.hasRight(tools.CONSTANTS.RIGHTS.CREATE_LESSON)) {
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
	                if (secure_service_1.SecureService.hasRight(tools.CONSTANTS.RIGHTS.CREATE_LESSON)) {
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
	                model.selectedViewMode = '/diary/public/template/calendar/calendar-view.template.html';
	            },
	            listView: function () {
	                entcore_1.template.open('main', 'main');
	                entcore_1.template.open('main-view', 'calendar');
	                model.selectedViewMode = '/diary/public/template/calendar/list-view.template.html';
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
	                homework = new _1.Homework();
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
	                    $scope.homework = new _1.Homework();
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
	                    calendarViewPath += '/' + entcore_1.moment().week(model.calendar.week).weekday(0).format(tools.CONSTANTS.CAL_DATE_PATTERN);
	                }
	                else {
	                    calendarViewPath += '/' + entcore_1.moment().weekday(0).format(tools.CONSTANTS.CAL_DATE_PATTERN);
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
	            if (model && model.homeworks && model.homeworks.selection)
	                return model.homeworks.selection();
	            return [];
	        };
	        var getSelectedLessons = function () {
	            if (model && model.lessons && model.lessons.selection)
	                return model.lessons.selection();
	            return [];
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
	        $scope.createOrUpdateHomework = function (goToMainView) {
	            return __awaiter(this, void 0, void 0, function () {
	                var e_1;
	                return __generator(this, function (_a) {
	                    switch (_a.label) {
	                        case 0:
	                            $scope.currentErrors = [];
	                            if ($scope.newItem) {
	                                $scope.homework.dueDate = $scope.newItem.date;
	                            }
	                            _a.label = 1;
	                        case 1:
	                            _a.trys.push([1, 3, , 4]);
	                            return [4 /*yield*/, model.homeworks.sync()];
	                        case 2:
	                            _a.sent();
	                            entcore_1.notify.info('homework.saved');
	                            $scope.homework.audience = model.audiences.findWhere({ id: $scope.homework.audience.id });
	                            if (goToMainView) {
	                                $rootScope.back();
	                                $scope.lesson = null;
	                                $scope.homework = null;
	                            }
	                            return [3 /*break*/, 4];
	                        case 3:
	                            e_1 = _a.sent();
	                            $scope.homework.errorValid = true;
	                            throw e_1;
	                        case 4: return [2 /*return*/];
	                    }
	                });
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
	        /**
	         * Init audience
	         * @returns {Lesson}
	         */
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
	        ;
	        initAudiences();
	    }
	]);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(4));
	__export(__webpack_require__(5));
	__export(__webpack_require__(6));
	__export(__webpack_require__(75));
	__export(__webpack_require__(74));
	__export(__webpack_require__(76));
	__export(__webpack_require__(77));
	__export(__webpack_require__(78));
	__export(__webpack_require__(79));


/***/ }),
/* 4 */
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
/* 5 */
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var entcore_toolkit_1 = __webpack_require__(7);
	var axios_1 = __webpack_require__(47);
	var tools_1 = __webpack_require__(73);
	var tools = __webpack_require__(73);
	var Homework = (function () {
	    function Homework() {
	        this.expanded = false;
	        this.api = {
	            delete: '/diary/homework/:id'
	        };
	        this.expanded = false;
	    }
	    /**
	     * Delete calendar references of current homework
	     */
	    Homework.prototype.deleteModelReferences = function () {
	        var idxHomeworkToDelete = entcore_1.model.homeworks.indexOf(this);
	        // delete homework in calendar cache
	        if (idxHomeworkToDelete >= 0) {
	            entcore_1.model.homeworks.splice(idxHomeworkToDelete, 1);
	        }
	    };
	    ;
	    /**
	     * Adds an attachment
	     * @param attachment
	     */
	    Homework.prototype.addAttachment = function (attachment) {
	        this.attachments.push(attachment);
	    };
	    ;
	    /**
	     * Removes attachment associated to this lesson
	     * @param attachment
	     * @param cb
	     * @param cbe
	     */
	    Homework.prototype.detachAttachment = function (attachment, cb, cbe) {
	        attachment.detachFromItem(this.id, 'lesson', cb, cbe);
	    };
	    ;
	    Homework.prototype.save = function (cb, cbe) {
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
	                return that.create();
	            }
	        });
	    };
	    ;
	    /**
	     * Returns true if current homework is attached to a lesson
	     * @returns {boolean}
	     */
	    Homework.prototype.isAttachedToLesson = function () {
	        return typeof this.lesson_id !== 'undefined' && this.lesson_id != null;
	    };
	    ;
	    Homework.prototype.isDraft = function () {
	        return this.state === "draft";
	    };
	    ;
	    Homework.prototype.isPublished = function () {
	        return !this.isDraft();
	    };
	    ;
	    /**
	     * A directly publishable homework must exist in database and not linked to a lesson
	     * @param toPublish
	     * @returns {*|boolean} true if homework can be published directly
	     */
	    Homework.prototype.isPublishable = function (toPublish) {
	        return this.id && (toPublish ? this.isDraft() : this.isPublished()) && this.lesson_id == null;
	    };
	    ;
	    Homework.prototype.changeState = function (toPublish) {
	        this.state = toPublish ? 'published' : 'draft';
	    };
	    ;
	    Homework.prototype.update = function (cb, cbe) {
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
	    ;
	    Homework.prototype.create = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var data, e_1;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        _a.trys.push([0, 2, , 3]);
	                        return [4 /*yield*/, entcore_1.model.getHttp()({
	                                method: 'POST',
	                                url: '/diary/homework',
	                                data: this
	                            })];
	                    case 1:
	                        data = (_a.sent()).data;
	                        entcore_toolkit_1.Mix.extend(this, data);
	                        entcore_1.model.homeworks.all.push(this);
	                        return [2 /*return*/, data];
	                    case 2:
	                        e_1 = _a.sent();
	                        console.error(e_1);
	                        throw e_1;
	                    case 3: return [2 /*return*/];
	                }
	            });
	        });
	    };
	    ;
	    /**
	     * Load homework object from id
	     * @param cb Callback function
	     * @param cbe Callback on error function
	     */
	    Homework.prototype.load = function (cb, cbe) {
	        var homework = this;
	        axios_1.default.get('/diary/homework/' + homework.id)
	            .then(function (res) {
	            entcore_toolkit_1.Mix.extend(this, tools_1.sqlToJsHomework(res.data));
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
	    ;
	    /**
	     * Deletes a list of homeworks
	     * @param homeworks Homeworks to be deleted
	     * @param cb Callback
	     * @param cbe Callback on error
	     */
	    Homework.prototype.deleteList = function (homeworks, cb, cbe) {
	        entcore_1.model.deleteItemList(homeworks, 'homework', cb, cbe);
	    };
	    ;
	    /**
	     * Deletes the homework
	     * @param Optional lesson attached to homework
	     * @param cb Callback after delete
	     * @param cbe Callback on error
	     */
	    Homework.prototype.delete = function (lesson, cb, cbe) {
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
	    ;
	    Homework.prototype.toJSON = function () {
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
	    ;
	    return Homework;
	}());
	exports.Homework = Homework;
	;
	var Homeworks = (function () {
	    function Homeworks() {
	        this.all = [];
	    }
	    Homeworks.prototype.sync = function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var homeworks, start, end, that, urlGetHomeworks, data, e_2;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        homeworks = [];
	                        start = entcore_1.moment(entcore_1.model.calendar.dayForWeek).day(1).format(tools.DATE_FORMAT);
	                        end = entcore_1.moment(entcore_1.model.calendar.dayForWeek).day(1).add(1, 'week').format(tools.DATE_FORMAT);
	                        that = this;
	                        if (that.loading)
	                            return [2 /*return*/];
	                        entcore_1.model.homeworks.all.splice(0, entcore_1.model.homeworks.all.length);
	                        urlGetHomeworks = '/diary/homework/' + tools.getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';
	                        if (entcore_1.model.isUserParent() && entcore_1.model.child) {
	                            urlGetHomeworks += entcore_1.model.child.id;
	                        }
	                        else {
	                            urlGetHomeworks += '%20';
	                        }
	                        that.loading = true;
	                        _a.label = 1;
	                    case 1:
	                        _a.trys.push([1, 3, , 4]);
	                        return [4 /*yield*/, entcore_1.model.getHttp()({
	                                method: 'GET',
	                                url: urlGetHomeworks
	                            })];
	                    case 2:
	                        data = (_a.sent()).data;
	                        homeworks = homeworks.concat(data);
	                        this.all = entcore_1._.union(this.all, entcore_toolkit_1.Mix.castArrayAs(Homework, data));
	                        that.loading = false;
	                        return [2 /*return*/, homeworks];
	                    case 3:
	                        e_2 = _a.sent();
	                        that.loading = false;
	                        throw e_2;
	                    case 4: return [2 /*return*/];
	                }
	            });
	        });
	    };
	    return Homeworks;
	}());
	exports.Homeworks = Homeworks;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(8));

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(9));
	__export(__webpack_require__(10));
	__export(__webpack_require__(11));
	__export(__webpack_require__(12));
	__export(__webpack_require__(45));
	__export(__webpack_require__(46));


/***/ }),
/* 9 */
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
/* 10 */
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
/* 11 */
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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(13));
	__export(__webpack_require__(14));
	__export(__webpack_require__(41));
	__export(__webpack_require__(42));
	__export(__webpack_require__(43));
	__export(__webpack_require__(44));


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var minicast_1 = __webpack_require__(9);
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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var axios_1 = __webpack_require__(15);
	var abstract_crud_1 = __webpack_require__(13);
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
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(16);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	var bind = __webpack_require__(18);
	var Axios = __webpack_require__(19);
	var defaults = __webpack_require__(20);
	
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
	axios.Cancel = __webpack_require__(38);
	axios.CancelToken = __webpack_require__(39);
	axios.isCancel = __webpack_require__(35);
	
	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(40);
	
	module.exports = axios;
	
	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var bind = __webpack_require__(18);
	
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
/* 18 */
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
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var defaults = __webpack_require__(20);
	var utils = __webpack_require__(17);
	var InterceptorManager = __webpack_require__(32);
	var dispatchRequest = __webpack_require__(33);
	var isAbsoluteURL = __webpack_require__(36);
	var combineURLs = __webpack_require__(37);
	
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
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(17);
	var normalizeHeaderName = __webpack_require__(22);
	
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
	    adapter = __webpack_require__(23);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(23);
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ }),
/* 21 */
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
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	
	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(17);
	var settle = __webpack_require__(24);
	var buildURL = __webpack_require__(27);
	var parseHeaders = __webpack_require__(28);
	var isURLSameOrigin = __webpack_require__(29);
	var createError = __webpack_require__(25);
	var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(30);
	
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
	      var cookies = __webpack_require__(31);
	
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var createError = __webpack_require__(25);
	
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
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var enhanceError = __webpack_require__(26);
	
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
/* 26 */
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
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	
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
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	
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
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	
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
/* 30 */
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
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	
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
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	
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
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	var transformData = __webpack_require__(34);
	var isCancel = __webpack_require__(35);
	var defaults = __webpack_require__(20);
	
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
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(17);
	
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
/* 35 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};


/***/ }),
/* 36 */
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
/* 37 */
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
/* 38 */
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
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Cancel = __webpack_require__(38);
	
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
/* 40 */
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
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var abstract_crud_1 = __webpack_require__(13);
	var minicast_1 = __webpack_require__(9);
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
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var axios_1 = __webpack_require__(15);
	var abstract_collection_1 = __webpack_require__(41);
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
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var abstract_crud_1 = __webpack_require__(13);
	var minicast_1 = __webpack_require__(9);
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
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var axios_1 = __webpack_require__(15);
	var abstract_model_1 = __webpack_require__(43);
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
/* 45 */
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
	var eventer_1 = __webpack_require__(10);
	var minicast_1 = __webpack_require__(9);
	var axios_1 = __webpack_require__(15);
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
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var axios_1 = __webpack_require__(15);
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
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(48);

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	var bind = __webpack_require__(50);
	var Axios = __webpack_require__(52);
	var defaults = __webpack_require__(53);
	
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
	axios.Cancel = __webpack_require__(70);
	axios.CancelToken = __webpack_require__(71);
	axios.isCancel = __webpack_require__(67);
	
	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(72);
	
	module.exports = axios;
	
	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var bind = __webpack_require__(50);
	var isBuffer = __webpack_require__(51);
	
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
/* 50 */
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
/* 51 */
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
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var defaults = __webpack_require__(53);
	var utils = __webpack_require__(49);
	var InterceptorManager = __webpack_require__(64);
	var dispatchRequest = __webpack_require__(65);
	var isAbsoluteURL = __webpack_require__(68);
	var combineURLs = __webpack_require__(69);
	
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
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(49);
	var normalizeHeaderName = __webpack_require__(54);
	
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
	    adapter = __webpack_require__(55);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(55);
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	
	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(49);
	var settle = __webpack_require__(56);
	var buildURL = __webpack_require__(59);
	var parseHeaders = __webpack_require__(60);
	var isURLSameOrigin = __webpack_require__(61);
	var createError = __webpack_require__(57);
	var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(62);
	
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
	      var cookies = __webpack_require__(63);
	
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
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var createError = __webpack_require__(57);
	
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
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var enhanceError = __webpack_require__(58);
	
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
/* 58 */
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
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	
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
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	
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
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	
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
/* 62 */
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
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	
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
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	
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
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	var transformData = __webpack_require__(66);
	var isCancel = __webpack_require__(67);
	var defaults = __webpack_require__(53);
	
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
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(49);
	
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
/* 67 */
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};


/***/ }),
/* 68 */
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
/* 69 */
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
/* 70 */
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
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Cancel = __webpack_require__(70);
	
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
/* 72 */
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
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var PedagogicItem_model_1 = __webpack_require__(74);
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
	    return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, entcore_1.model.homeworks.syncHomeworks().then(function () {
	                    if (typeof cb === 'function') {
	                        cb();
	                    }
	                })];
	        });
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
	/**
	 * Default color of lesson and homeworks
	 * @type {string}
	 */
	exports.DEFAULT_ITEM_COLOR = '#CECEF6';
	/**
	 * Default state of lesson or homework when created
	 * @type {string}
	 */
	exports.DEFAULT_STATE = 'draft';
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


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(47);
	var PedagogicItem = (function () {
	    function PedagogicItem() {
	        this.descriptionMaxSize = 140;
	        this.isPublished = function () { return this.state === 'published'; };
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
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(73);
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
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Subject = (function (_super) {
	    __extends(Subject, _super);
	    function Subject() {
	        var _this = _super.call(this) || this;
	        /**
	         * Saves the subject to databases.
	         * It's auto-created if it does not exists in database
	         * @param cb
	         * @param cbe
	         */
	        _this.save = function (cb, cbe) {
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
	        _this.create = function (cb, cbe) {
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
	        _this.toJSON = function () {
	            return {
	                id: this.id,
	                school_id: this.school_id,
	                subject_label: this.label,
	                teacher_id: this.teacher_id,
	                original_subject_id: this.originalsubjectid
	            };
	        };
	        return _this;
	    }
	    return Subject;
	}(entcore_1.Model));
	exports.Subject = Subject;
	;


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(47);
	var Teacher = (function () {
	    function Teacher() {
	        this.create = function (cb, cbe) {
	            entcore_1.model.me.structures.forEach(function (structureId) {
	                axios_1.default.post('/diary/teacher/' + structureId).then(function (e) {
	                    if (typeof cb === 'function') {
	                        cb();
	                    }
	                }).catch(function (e) {
	                    if (typeof cbe === 'function') {
	                        cbe(entcore_1.model.parseError(e));
	                    }
	                });
	            });
	        };
	    }
	    return Teacher;
	}());
	exports.Teacher = Teacher;
	;


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(73);
	var Homework_model_1 = __webpack_require__(6);
	var Subject_model_1 = __webpack_require__(77);
	var model_1 = __webpack_require__(80);
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
	            var subject = entcore_1.model.subjects.all.find(function (l) {
	                return l.label = lesson.subject.label;
	            });
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
	            entcore_1.model.homeworks.all.filter(function (h) {
	                return h.lesson_id = that.id;
	            }).forEach(function (homeworkCache) {
	                homeworkCache.state = that.state;
	            });
	        };
	        this.selected = false;
	        //this.collection(Attachment);
	        // initialize homeworks collection (see lib.js)
	        if (!this.homeworks) {
	            entcore_1.model.collection(Homework_model_1.Homework);
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
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(47);
	var tools = __webpack_require__(73);
	var index_1 = __webpack_require__(3);
	var Lesson_model_1 = __webpack_require__(79);
	/**
	 * Model from table
	 * diary.lesson_has_attachmentH
	 * @constructor
	 */
	var LessonAttachment = (function (_super) {
	    __extends(LessonAttachment, _super);
	    function LessonAttachment() {
	        return _super.call(this) || this;
	    }
	    return LessonAttachment;
	}(entcore_1.Model));
	exports.LessonAttachment = LessonAttachment;
	;
	var Audience = (function (_super) {
	    __extends(Audience, _super);
	    function Audience(audience) {
	        return _super.call(this) || this;
	    }
	    return Audience;
	}(entcore_1.Model));
	exports.Audience = Audience;
	;
	var HomeworksLoad = (function (_super) {
	    __extends(HomeworksLoad, _super);
	    function HomeworksLoad() {
	        return _super.call(this) || this;
	    }
	    return HomeworksLoad;
	}(entcore_1.Model));
	exports.HomeworksLoad = HomeworksLoad;
	;
	var HomeworkType = (function (_super) {
	    __extends(HomeworkType, _super);
	    function HomeworkType() {
	        return _super.call(this) || this;
	    }
	    return HomeworkType;
	}(entcore_1.Model));
	exports.HomeworkType = HomeworkType;
	;
	exports.InitBuild = function () {
	    entcore_1.calendar.startOfDay = 8;
	    entcore_1.calendar.endOfDay = 19;
	    entcore_1.calendar.dayHeight = 65;
	    /*model.calendar = new calendar.Calendar({
	        week: moment().week()
	    });
	    */
	    this.makeModels([
	        HomeworkType,
	        Audience,
	        index_1.Subject,
	        Lesson_model_1.Lesson,
	        index_1.Homework,
	        index_1.PedagogicDay,
	        index_1.Child
	    ]);
	    // keeping start/end day values in cache so we can detect dropped zones (see ng-extensions.js)
	    // note: model.calendar.startOfDay does not work in console.
	    entcore_1.model.startOfDay = entcore_1.calendar.startOfDay;
	    entcore_1.model.endOfDay = entcore_1.calendar.endOfDay;
	    entcore_1.Model.prototype.inherits(Lesson_model_1.Lesson, entcore_1.calendar.ScheduleItem); // will allow to bind item.selected for checkbox
	    this.searchForm = new index_1.SearchForm(false);
	    this.currentSchool = {};
	    this.collection(Lesson_model_1.Lesson, {
	        loading: false,
	        syncLessons: function (cb, cbe) {
	            console.warn("deprecated");
	            return;
	        }, pushAll: function (datas) {
	            if (datas) {
	                this.all = entcore_1._.union(this.all, datas);
	            }
	        }, behaviours: 'diary'
	    });
	    this.collection(index_1.Subject, {
	        loading: false,
	        syncSubjects: function (cb, cbe) {
	            console.warn("deprecated");
	            return;
	        }
	    });
	    this.collection(Audience, {
	        loading: false,
	        syncAudiences: function syncAudiences(cb, cbe) {
	            console.warn("deprecated");
	            return;
	        }
	    });
	    this.collection(HomeworkType, {
	        loading: false,
	        syncHomeworkTypes: function () {
	            return __awaiter(this, void 0, void 0, function () {
	                var homeworkTypes, that, url, urlGetHomeworkTypes, data, e_1;
	                return __generator(this, function (_a) {
	                    switch (_a.label) {
	                        case 0:
	                            homeworkTypes = [];
	                            that = this;
	                            if (that.loading)
	                                return [2 /*return*/];
	                            entcore_1.model.homeworkTypes.all.splice(0, entcore_1.model.homeworkTypes.all.length);
	                            url = '/diary/homeworktype/initorlist';
	                            urlGetHomeworkTypes = url;
	                            that.loading = true;
	                            _a.label = 1;
	                        case 1:
	                            _a.trys.push([1, 3, , 4]);
	                            return [4 /*yield*/, entcore_1.model.getHttp()({
	                                    method: 'GET',
	                                    url: urlGetHomeworkTypes
	                                })];
	                        case 2:
	                            data = (_a.sent()).data;
	                            homeworkTypes = homeworkTypes.concat(data);
	                            that.addRange(entcore_1._.map(homeworkTypes, tools.sqlToJsHomeworkType));
	                            that.loading = false;
	                            return [2 /*return*/, homeworkTypes];
	                        case 3:
	                            e_1 = _a.sent();
	                            that.loading = false;
	                            throw e_1;
	                        case 4: return [2 /*return*/];
	                    }
	                });
	            });
	        }, pushAll: function (datas) {
	            if (datas) {
	                this.all = entcore_1._.union(this.all, datas);
	            }
	        }, behaviours: 'diary'
	    });
	    entcore_1.model.homeworks = new index_1.Homeworks();
	    this.collection(index_1.PedagogicDay, {
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
	    this.collection(index_1.Child, {
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
	            homework.weekhomeworksload.push(tools.sqlToJsHomeworkLoad(homeworkLoad));
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
	        lesson.homeworks = this.collection(index_1.Homework);
	        sqlHomeworks.forEach(function (sqlHomework) {
	            lesson.homeworks.push(tools.sqlToJsHomework(sqlHomework));
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
	    var homework = new index_1.Homework();
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
	        homework.color = tools.DEFAULT_ITEM_COLOR;
	        homework.state = tools.DEFAULT_STATE;
	    }
	    entcore_1.model.loadHomeworksLoad(homework, entcore_1.moment(homework.date).format(tools.DATE_FORMAT), homework.audience.id);
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
	    lesson.color = tools.DEFAULT_ITEM_COLOR;
	    lesson.state = tools.DEFAULT_STATE;
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
	        var pedagogicItemsFromDB = entcore_1._.map(items, tools.sqlToJsPedagogicItem);
	        var days = entcore_1._.groupBy(pedagogicItemsFromDB, 'day');
	        var pedagogicDays = [];
	        var aDayIsSelected = false;
	        for (var day in days) {
	            if (days.hasOwnProperty(day)) {
	                var pedagogicDay = new index_1.PedagogicDay();
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
	        var labelLowerCaseNoAccent = tools.sansAccent(label).toLowerCase();
	        entcore_1.model.subjects.all.forEach(function (subject) {
	            var labelSubjectLowerCaseNoAccent = tools.sansAccent(subject.label.toLowerCase());
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
	    var subject = new index_1.Subject();
	    subject.label = label;
	    return subject.save(cb, cbe);
	};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(73);
	var subject_service_1 = __webpack_require__(82);
	var axios_1 = __webpack_require__(47);
	/*
	* Course service as class
	* used to manipulate Course model
	*/
	var CourseService = (function () {
	    function CourseService() {
	    }
	    CourseService.getMergeCourses = function (structureId, teacherId, firstDayOfWeek) {
	        var _this = this;
	        return Promise.all([
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
	        return axios_1.default.get(url, config).then(function (result) {
	            return result.data;
	        });
	    };
	    return CourseService;
	}());
	exports.CourseService = CourseService;
	;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Subject_model_1 = __webpack_require__(77);
	var utils_service_1 = __webpack_require__(83);
	var axios_1 = __webpack_require__(47);
	var entcore_toolkit_1 = __webpack_require__(7);
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
	            this.context.subjectPromise[structureId] = axios_1.default.get(url).then(function (result) {
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
	        return __awaiter(this, void 0, void 0, function () {
	            var urlGetSubjects, data;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        urlGetSubjects = '';
	                        if (isTeacher) {
	                            urlGetSubjects = '/diary/subject/initorlist';
	                        }
	                        else {
	                            urlGetSubjects = '/diary/subject/list/' + utils_service_1.UtilsService.getUserStructuresIdsAsString();
	                        }
	                        return [4 /*yield*/, axios_1.default.get(urlGetSubjects)];
	                    case 1:
	                        data = (_a.sent()).data;
	                        return [2 /*return*/, entcore_toolkit_1.Mix.castArrayAs(Subject_model_1.Subject, data)];
	                }
	            });
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
/* 83 */
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
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Homework_model_1 = __webpack_require__(6);
	var Subject_model_1 = __webpack_require__(77);
	var tools_1 = __webpack_require__(73);
	var utils_service_1 = __webpack_require__(83);
	var attachment_service_1 = __webpack_require__(85);
	var axios_1 = __webpack_require__(47);
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
	        return axios_1.default.get(urlGetLessons).then(function (result) {
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
	        return axios_1.default.get(urlGetLessons).then(function (result) {
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
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Attachment_model_1 = __webpack_require__(4);
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
/* 86 */
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
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(47);
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
	                _this.context.processesPromise[structureId] = axios_1.default.get(url).then(function (result) {
	                    return {
	                        structureId: structureId,
	                        structureData: result.data
	                    };
	                });
	            }
	            processes.push(_this.context.processesPromise[structureId]);
	        });
	        //execute promises
	        return Promise.all(processes).then(function (results) {
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


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(89));
	__export(__webpack_require__(91));
	__export(__webpack_require__(93));
	__export(__webpack_require__(94));
	__export(__webpack_require__(95));
	__export(__webpack_require__(97));
	__export(__webpack_require__(99));
	__export(__webpack_require__(100));
	__export(__webpack_require__(101));
	__export(__webpack_require__(106));
	__export(__webpack_require__(107));


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var secure_service_1 = __webpack_require__(86);
	var modelweek_service_1 = __webpack_require__(90);
	var tools_1 = __webpack_require__(73);
	exports.MainCalendarPageController = entcore_1.ng.controller('MainCalendarPageController', ['$scope', '$timeout', '$rootScope', '$location',
	    function ($scope, $timeout, $rootScope, $location) {
	        var vm = _this;
	        $timeout(init);
	        function init() {
	            $scope.getModel();
	            vm.isUserParent = entcore_1.model.isUserParent();
	            $scope.child = entcore_1.model.child;
	            $scope.children = entcore_1.model.childs;
	        }
	        $scope.showCalendarForChild = function (childd) {
	            console.log("broadcast");
	            $scope.children.forEach(function (theChild) {
	                theChild.selected = (theChild.id === childd.id);
	            });
	            childd.selected = true;
	            $scope.child = childd;
	            entcore_1.model.child = childd;
	            $rootScope.$broadcast('show-child', childd);
	        };
	        $scope.goToListView = function () {
	            $location.path('/listView');
	        };
	        $scope.goToCalendarView = function () {
	            $location.path('/calendarView/' + entcore_1.moment(entcore_1.model.mondayOfWeek).format(tools_1.CONSTANTS.CAL_DATE_PATTERN));
	        };
	        $scope.setModel = function (alias) {
	            modelweek_service_1.ModelWeekService.setModelWeek(alias, entcore_1.model.mondayOfWeek).then(function (modelWeek) {
	                $scope.modelWeekCurrentWeek = alias;
	                $scope.isModelWeek = true;
	                $rootScope.$broadcast('calendar.refreshCalendar');
	                $scope.getModel();
	            });
	            entcore_1.notify.info(entcore_1.idiom.translate('diary.model.week.choice.effective') + " " + alias);
	        };
	        $scope.invert = function () {
	            modelweek_service_1.ModelWeekService.invertModelsWeek().then(function () {
	                $rootScope.$broadcast('calendar.refreshCalendar');
	                $scope.getModel();
	            });
	        };
	        $scope.getModel = function () {
	            if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.MANAGE_MODEL_WEEK)) {
	                modelweek_service_1.ModelWeekService.getModelWeeks().then(function (modelweeks) {
	                    $scope.modelWeeks = modelweeks;
	                });
	            }
	        };
	    }]);


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(73);
	var courses_service_1 = __webpack_require__(81);
	var axios_1 = __webpack_require__(47);
	var ModelWeekService = (function () {
	    function ModelWeekService() {
	    }
	    ModelWeekService.setModelWeek = function (alias, date) {
	        var dateParam = entcore_1.moment(date).format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        var url = "/diary/modelweek/" + alias + "/" + dateParam;
	        this.promiseGetmodelWeek = undefined;
	        return axios_1.default.post(url);
	    };
	    ModelWeekService.getModelWeeks = function () {
	        var url = "/diary/modelweek/list";
	        if (!this.promiseGetmodelWeek) {
	            this.promiseGetmodelWeek = axios_1.default.get(url).then(function (result) {
	                var modelWeeks = result.data;
	                entcore_1._.each(modelWeeks, function (modelWeek) {
	                    modelWeek.startDate = entcore_1.moment(modelWeek.startDate).toDate();
	                    modelWeek.endDate = entcore_1.moment(modelWeek.endDate).toDate();
	                });
	                var transformedResult = {
	                    "A": entcore_1._.findWhere(modelWeeks, { "weekAlias": "A" }),
	                    "B": entcore_1._.findWhere(modelWeeks, { "weekAlias": "B" }),
	                };
	                return transformedResult;
	            });
	        }
	        return this.promiseGetmodelWeek;
	    };
	    ModelWeekService.invertModelsWeek = function () {
	        var url = "/diary/modelweek/invert";
	        this.promiseGetmodelWeek = undefined;
	        return axios_1.default.post(url).then(function (result) {
	            return result.data;
	        });
	    };
	    ModelWeekService.getCoursesModel = function (date) {
	        var _this = this;
	        var dateParam = entcore_1.moment(date).format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        var url = "/diary/modelweek/items/" + dateParam;
	        return axios_1.default.get(url).then(function (result) {
	            var courses = result.data;
	            if (!courses) {
	                courses = [];
	            }
	            _this.mappModelWeekToCourse(courses);
	            return courses;
	        });
	    };
	    ModelWeekService.mappModelWeekToCourse = function (courses) {
	        entcore_1._.each(courses, function (course) {
	            var date = entcore_1.moment(course.date);
	            var begin = entcore_1.moment(date);
	            begin.set('hour', Number(course.startHour.split(":")[0]));
	            begin.set('minute', Number(course.startHour.split(":")[1]));
	            begin.set('second', Number(course.startHour.split(":")[2]));
	            var end = entcore_1.moment(date);
	            end.set('hour', Number(course.endHour.split(":")[0]));
	            end.set('minute', Number(course.endHour.split(":")[1]));
	            end.set('second', Number(course.endHour.split(":")[2]));
	            course.startDate = begin.toDate();
	            course.endDate = end.toDate();
	            courses_service_1.CourseService.mappCourse(course);
	            course.subject = entcore_1.model.subjects.findWhere({ id: course.subjectId });
	            course.subject.subjectLabel = course.subjectLabel;
	            course.subjectId = course.subjectId;
	        });
	        return courses;
	    };
	    return ModelWeekService;
	}());
	exports.ModelWeekService = ModelWeekService;


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Teacher_model_1 = __webpack_require__(78);
	var utils_service_1 = __webpack_require__(83);
	var secure_service_1 = __webpack_require__(86);
	var modelweek_service_1 = __webpack_require__(90);
	var tools_1 = __webpack_require__(73);
	var lessons_service_1 = __webpack_require__(84);
	var homework_service_1 = __webpack_require__(92);
	var courses_service_1 = __webpack_require__(81);
	var subject_service_1 = __webpack_require__(82);
	exports.CalendarController = entcore_1.ng.controller('CalendarController', ['$scope', '$timeout', '$rootScope', '$location', '$routeParams', '$q',
	    function ($scope, $timeout, $rootScope, $location, $routeParams, $q) {
	        var vm = _this;
	        $timeout(init);
	        /*
	         * initialisation calendar function
	         */
	        function init() {
	            //view controls
	            $scope.display.showList = false;
	            //calendarDailyEvent directive options
	            $scope.display.bShowCalendar = true;
	            $scope.display.bShowHomeworks = true;
	            $scope.display.bShowHomeworksMinified = false;
	            if (!entcore_1.model.selectedViewMode) {
	                $scope.goToCalendarView(); //model.selectedViewMode = '/diary/public/template/calendar/calendar-view.template.html';
	            }
	            //calendar Params
	            $scope.calendarParams = {
	                isUserTeacher: $scope.isUserTeacher
	            };
	            //handler calendar updates :
	            $scope.$on('calendar.refreshItems', function (_, item) {
	                item.calendarUpdate();
	            });
	            //handler calendar updates :
	            $scope.$on('calendar.refreshCalendar', function () {
	                refreshDatas(utils_service_1.UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, entcore_1.model.isUserParent, entcore_1.model.child ? entcore_1.model.child.id : undefined);
	            });
	            if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.SHOW_OTHER_TEACHER)) {
	                //vm.teacher = model.filters.teacher;
	                //vm.audience = model.filters.audience;
	                $scope.$watch(function () {
	                    return entcore_1.model.filters.teacher;
	                }, function (n, o) {
	                    if (n !== o && n) {
	                        $timeout(function () {
	                            //model.filters.teacher = vm.teacher;
	                            //model.filters.audience = vm.audience;
	                            refreshDatas(utils_service_1.UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, entcore_1.model.isUserParent, entcore_1.model.child ? entcore_1.model.child.id : undefined);
	                        });
	                    }
	                });
	                $scope.$watch(function () {
	                    return entcore_1.model.filters.audience;
	                }, function (n, o) {
	                    if (n !== o && n) {
	                        $timeout(function () {
	                            //model.filters.teacher = vm.teacher;
	                            //model.filters.audience = vm.audience;
	                            refreshDatas(utils_service_1.UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, entcore_1.model.isUserParent, entcore_1.model.child ? entcore_1.model.child.id : undefined);
	                        });
	                    }
	                });
	            }
	        }
	        //watch delete or add
	        $scope.$watch(function () {
	            if (entcore_1.model && entcore_1.model.lessons && entcore_1.model.lessons.all) {
	                return entcore_1.model.lessons.all.length;
	            }
	            else {
	                return 0;
	            }
	        }, function () {
	            $scope.itemsCalendar = [].concat(entcore_1.model.lessons.all).concat($scope.courses || []);
	        });
	        $scope.$watch('routeParams', function (n, o) {
	            if ($location.path().indexOf("calendarView") === -1 && $location.path() !== "") {
	                return;
	            }
	            var mondayOfWeek = entcore_1.moment();
	            // mondayOfWeek as string date formatted YYYY-MM-DD
	            if ($scope.routeParams.mondayOfWeek) {
	                mondayOfWeek = entcore_1.moment($scope.routeParams.mondayOfWeek);
	            }
	            else {
	                if (entcore_1.model.mondayOfWeek) {
	                    mondayOfWeek = entcore_1.model.mondayOfWeek;
	                }
	                else {
	                    mondayOfWeek = mondayOfWeek.weekday(0);
	                }
	            }
	            entcore_1.model.mondayOfWeek = mondayOfWeek;
	            $scope.showCalendar(mondayOfWeek);
	        }, true);
	        $scope.routeParams = $routeParams;
	        /**
	         * Opens the next week view of calendar
	         */
	        $scope.nextWeek = function () {
	            var nextMonday = entcore_1.moment($scope.mondayOfWeek).add(7, 'd');
	            $location.path('/calendarView/' + nextMonday.format(tools_1.CONSTANTS.CAL_DATE_PATTERN));
	        };
	        /**
	         * Opens the previous week view of calendar
	         */
	        $scope.previousWeek = function () {
	            var nextMonday = entcore_1.moment($scope.mondayOfWeek).add(-7, 'd');
	            $location.path('/calendarView/' + nextMonday.format(tools_1.CONSTANTS.CAL_DATE_PATTERN));
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
	            entcore_1.model.lessonsDropHandled = false;
	            entcore_1.model.homeworksDropHandled = false;
	            $scope.countdown = 2;
	            // auto creates diary.teacher
	            if ("ENSEIGNANT" === entcore_1.model.me.type) {
	                var teacher = new Teacher_model_1.Teacher();
	                teacher.create(decrementCountdown(bShowTemplates, cb), $rootScope.validationError);
	            }
	            else {
	                decrementCountdown(bShowTemplates, cb);
	            }
	            // subjects and audiences needed to fill in
	            // homeworks and lessons props
	            entcore_1.model.childs.syncChildren(function () {
	                vm.child = entcore_1.model.child;
	                vm.children = entcore_1.model.childs;
	                subject_service_1.SubjectService.getCustomSubjects(entcore_1.model.isUserTeacher()).then(function (subjects) {
	                    entcore_1.model.subjects.all = [];
	                    if (subjects) {
	                        entcore_1.model.subjects.addRange(subjects);
	                    }
	                }).then(function () {
	                    decrementCountdown(bShowTemplates, cb);
	                    entcore_1.model.homeworkTypes.syncHomeworkTypes(function () {
	                        // call lessons/homework sync after audiences sync since
	                        // lesson and homework objects needs audience data to be built
	                        refreshDatas(utils_service_1.UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, entcore_1.model.isUserParent, entcore_1.model.child ? entcore_1.model.child.id : undefined);
	                    }, $rootScope.validationError);
	                }).catch(function (e) {
	                    $rootScope.validationError();
	                    throw e;
	                });
	            });
	        };
	        var decrementCountdown = function (bShowTemplates, cb) {
	            $scope.countdown--;
	            if ($scope.countdown == 0) {
	                $scope.calendarLoaded = true;
	                $scope.currentSchool = entcore_1.model.currentSchool;
	                if (bShowTemplates) {
	                    showTemplates();
	                }
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }
	        };
	        /**
	         *
	         * @param momentMondayOfWeek First day (monday) of week to display lessons and homeworks
	         */
	        $scope.showCalendar = function (mondayOfWeek) {
	            $scope.display.showList = false;
	            $scope.mondayOfWeek = mondayOfWeek;
	            if (!$scope.calendarLoaded) {
	                initialization(true);
	                return;
	            }
	            if (!$scope.mondayOfWeek) {
	                $scope.mondayOfWeek = entcore_1.moment();
	            }
	            $scope.mondayOfWeek = $scope.mondayOfWeek.weekday(0);
	            entcore_1.model.lessonsDropHandled = false;
	            entcore_1.model.homeworksDropHandled = false;
	            $scope.display.showList = false;
	            // need reload lessons or homeworks if week changed
	            var syncItems = true; //momentMondayOfWeek.week() != model.calendar.week;
	            refreshDatas(utils_service_1.UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, entcore_1.model.isUserParent, entcore_1.model.child ? entcore_1.model.child.id : undefined);
	        };
	        function refreshDatas(structureIds, mondayOfWeek, isUserParent, childId) {
	            var p1;
	            var p2;
	            if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.SHOW_OTHER_TEACHER)) {
	                var teacherItem = entcore_1.model.filters.teacher ? entcore_1.model.filters.teacher.item : undefined;
	                if (!teacherItem && !entcore_1.model.filters.audience) {
	                    p1 = $q.when([]);
	                    p2 = $q.when([]);
	                }
	                else {
	                    p1 = lessons_service_1.LessonService.getOtherLessons([entcore_1.model.filters.structure.id], mondayOfWeek, teacherItem, entcore_1.model.filters.audience);
	                    p2 = homework_service_1.HomeworkService.getOtherHomeworks([entcore_1.model.filters.structure.id], mondayOfWeek, teacherItem, entcore_1.model.filters.audience);
	                }
	            }
	            else {
	                p1 = lessons_service_1.LessonService.getLessons(structureIds, mondayOfWeek, isUserParent, childId);
	                p2 = homework_service_1.HomeworkService.getHomeworks(structureIds, mondayOfWeek, isUserParent, childId);
	            }
	            //dont load courses if is not at teacher
	            var p3 = $q.when([]);
	            var p4 = $q.when([]);
	            if (entcore_1.model.isUserTeacher()) {
	                //TODO use structureIds
	                p3 = courses_service_1.CourseService.getMergeCourses(entcore_1.model.me.structures[0], entcore_1.model.me.userId, mondayOfWeek);
	                if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.MANAGE_MODEL_WEEK)) {
	                    p4 = modelweek_service_1.ModelWeekService.getModelWeeks();
	                }
	            }
	            return $q.all([p1, p2, p3, p4]).then(function (results) {
	                var lessons = results[0];
	                var homeworks = results[1];
	                $scope.courses = results[2];
	                var modelWeeks = results[3];
	                var p = $q.when();
	                if ((!$scope.courses || $scope.courses.length === 0) && secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.MANAGE_MODEL_WEEK)) {
	                    //dont get model if the current week is the model
	                    if (modelWeeks.A || modelWeeks.B) {
	                        if ((!modelWeeks.A || !entcore_1.moment(modelWeeks.A.beginDate).isSame(mondayOfWeek)) &&
	                            (!modelWeeks.B || !entcore_1.moment(modelWeeks.B.beginDate).isSame(mondayOfWeek))) {
	                            p = modelweek_service_1.ModelWeekService.getCoursesModel($scope.mondayOfWeek).then(function (modelCourses) {
	                                $scope.courses = modelCourses;
	                            });
	                            $scope.isModelWeek = false;
	                        }
	                        else {
	                            if (modelWeeks.A && entcore_1.moment(modelWeeks.A.beginDate).isSame(mondayOfWeek)) {
	                                $scope.modelWeekCurrentWeek = 'A';
	                            }
	                            else {
	                                $scope.modelWeekCurrentWeek = 'B';
	                            }
	                            $scope.isModelWeek = true;
	                        }
	                    }
	                }
	                p.then(function () {
	                    $scope.currentModelWeekIndicator = entcore_1.moment($scope.mondayOfWeek).weeks() % 2 ? "B" : "A";
	                    entcore_1.model.lessons.all.splice(0, entcore_1.model.lessons.all.length);
	                    entcore_1.model.lessons.addRange(lessons);
	                    entcore_1.model.homeworks.all.splice(0, entcore_1.model.homeworks.all.length);
	                    entcore_1.model.homeworks.addRange(homeworks);
	                    $scope.itemsCalendar = [].concat(entcore_1.model.lessons.all).concat($scope.courses);
	                });
	            });
	        }
	        $scope.setChildFilter = function (child, cb) {
	            refreshDatas(utils_service_1.UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, true, child.id);
	        };
	        $scope.showCalendarForChild = function (child) {
	            $scope.setChildFilter(child);
	        };
	        $scope.$on('show-child', function (_, child) {
	            refreshDatas(utils_service_1.UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, true, child.id);
	        });
	        var showTemplates = function () {
	            entcore_1.template.open('main', 'main');
	            entcore_1.template.open('main-view', 'calendar');
	            entcore_1.template.open('create-lesson', 'create-lesson');
	            entcore_1.template.open('create-homework', 'create-homework');
	            entcore_1.template.open('daily-event-details', 'daily-event-details');
	            entcore_1.template.open('daily-event-item', 'daily-event-item');
	        };
	        /**
	         * Display or hide the homework panel
	         * in calendar view
	         */
	        $scope.toggleHomeworkPanel = function () {
	            $scope.display.bShowHomeworks = !$scope.display.bShowHomeworks;
	            if (!$scope.display.bShowHomeworks && !$scope.display.bShowCalendar) {
	                $scope.display.bShowCalendar = true;
	            }
	        };
	        /**
	         * Display/hide calendar
	         */
	        $scope.toggleCalendar = function () {
	            $scope.display.bShowCalendar = !$scope.display.bShowCalendar;
	            if (!$scope.display.bShowHomeworks && !$scope.display.bShowCalendar) {
	                $scope.display.bShowHomeworks = true;
	            }
	        };
	        $scope.$watch(function () {
	            return $rootScope.currentRightPanelVisible;
	        }, function (n) {
	            $scope.currentRightPanelVisible = n;
	        });
	        $scope.redirect = function (path) {
	            $location.path(path);
	        };
	    }]);


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(73);
	var axios_1 = __webpack_require__(47);
	/*
	* Homework service as class
	* used to manipulate Homework model
	*/
	var HomeworkService = (function () {
	    function HomeworkService() {
	    }
	    HomeworkService.getHomeworks = function (userStructuresIds, mondayOfWeek, isUserParent, childId, fromDate, toDate) {
	        var _this = this;
	        var start = entcore_1.moment(mondayOfWeek).day(1).format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        var end = entcore_1.moment(mondayOfWeek).day(1).add(1, 'week').format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        if (fromDate) {
	            start = fromDate.format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	            end = toDate.format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        }
	        var urlGetHomeworks = "/diary/homework/" + userStructuresIds + "/" + start + "/" + end + "/";
	        if (isUserParent && childId) {
	            urlGetHomeworks += childId;
	        }
	        else {
	            urlGetHomeworks += '%20';
	        }
	        return axios_1.default.get(urlGetHomeworks).then(function (result) {
	            return _this.mappHomework(result.data);
	        });
	    };
	    HomeworkService.getOtherHomeworks = function (userStructuresIds, mondayOfWeek, teacher, audience, fromDate, toDate) {
	        var _this = this;
	        var start = entcore_1.moment(mondayOfWeek).day(1).format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        var end = entcore_1.moment(mondayOfWeek).day(1).add(1, 'week').format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        if (fromDate) {
	            start = fromDate.format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	            end = toDate.format(tools_1.CONSTANTS.CAL_DATE_PATTERN);
	        }
	        var type = teacher ? "teacher" : "audience";
	        var id = teacher ? teacher.key : audience.key;
	        var urlGetHomeworks = "/diary/homework/external/" + userStructuresIds + "/" + start + "/" + end + "/" + type + "/" + id;
	        return axios_1.default.get(urlGetHomeworks).then(function (result) {
	            return _this.mappHomework(result.data);
	        });
	    };
	    /*
	    *   Mapp homeworks
	    */
	    HomeworkService.mappHomework = function (homeworks) {
	        return entcore_1._.map(homeworks, function (sqlHomework) {
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
	                teacherName: sqlHomework.teacher_display_name,
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
	                homework.attachments = entcore_1._.map(JSON.parse(sqlHomework.attachments), tools_1.jsonToJsAttachment);
	            }
	            if ('group' === homework.audienceType) {
	                homework.audienceTypeLabel = entcore_1.idiom.translate('diary.audience.group');
	            }
	            else {
	                homework.audienceTypeLabel = entcore_1.idiom.translate('diary.audience.class');
	            }
	            return homework;
	        });
	    };
	    return HomeworkService;
	}());
	exports.HomeworkService = HomeworkService;
	;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.CalendarDailyEventsController = entcore_1.ng.controller('CalendarDailyEventsController', ['$scope', function ($scope) {
	        init();
	        function init() {
	            $scope.isUserTeacher = entcore_1.model.isUserTeacher();
	            // default open state of calendar grid
	            // and homework panel
	            //TODO remove and delegate to calendar controler
	            handlers();
	        }
	        /*
	        * bind events behaviours
	        */
	        function handlers() {
	            //watch calendar recreation
	            $scope.$watch(function () {
	                return entcore_1.model.calendar;
	            }, function () {
	                $scope.calendar = entcore_1.model.calendar;
	                placeCalendarAndHomeworksPanel();
	            });
	            //watch toggle options
	            $scope.$watch(function () {
	                return "" + $scope.bShowCalendar + $scope.bShowHomeworks + $scope.bShowHomeworksMinified;
	            }, function () {
	                placeCalendarAndHomeworksPanel();
	            });
	        }
	        /**
	         * Open homeworks details when homeworks info is minimized
	         * or vice versa
	         * @param day
	         * @param $event
	         */
	        $scope.toggleOpenDailyEvents = function (day, $event) {
	            if (!($event.target && $event.target.type === "checkbox")) {
	                day.openDailyEvents = !day.openDailyEvents;
	            }
	        };
	        /**
	         * Redirect to homework or lesson view if homework attached to some lesson
	         * @param homework Homework being clicked/selected
	         * @param $event
	         */
	        $scope.editSelectedHomework = function (homework, $event) {
	            // prevent redirect on clicking on checkbox
	            if (!($event.target && $event.target.type === "checkbox")) {
	                if (!homework.lesson_id) {
	                    window.location.href = window.location.host + '/diary#/editHomeworkView/' + homework.id;
	                }
	                else {
	                    window.location.href = window.location.host + '/diary#/editLessonView/' + homework.lesson_id + '/' + homework.id;
	                }
	            }
	        };
	        /**
	         * Toggle show display homework panel detail of a day
	         * Note: jquery oldschool way since with angular could not fix some display problems
	         * @param day
	         */
	        $scope.toggleShowHwDetail = function (day) {
	            hideOrShowHwDetail(day, undefined, true);
	        };
	        /**
	         *
	         * @param day
	         * @param hideHomeworks
	         * @param unselectHomeworksOnHide
	         */
	        var hideOrShowHwDetail = function (day, hideHomeworks, unselectHomeworksOnHide) {
	            if (!day.dailyEvents) {
	                return;
	            }
	            var hwDayDetail = $('#hw-detail-' + day.index);
	            var isNotHidden = hwDayDetail.hasClass('show');
	            if (typeof hideHomeworks === 'undefined') {
	                hideHomeworks = isNotHidden;
	            }
	            if (hideHomeworks) {
	                hwDayDetail.removeClass('show');
	            }
	            else {
	                hwDayDetail.addClass('show');
	            }
	            if (hideHomeworks && unselectHomeworksOnHide) {
	                day.dailyEvents.forEach(function (dailyEvent) {
	                    dailyEvent.selected = false;
	                });
	            }
	        };
	        /**
	         * Get the maximum number of homeworks of a day for current week
	         */
	        var getMaxHomeworksPerDay = function () {
	            var max = 0;
	            $scope.calendar.days.all.forEach(function (day) {
	                if (day.dailyEvents && day.dailyEvents.length > max) {
	                    max = day.dailyEvents.length;
	                }
	            });
	            return max;
	        };
	        //$scope.show = model.show;
	        /**
	         * Minify the homework panel or not
	         * If it's minified, will only show one max homework
	         * else 3
	         */
	        $scope.toggleHomeworkPanelMinized = function () {
	            placeCalendarAndHomeworksPanel();
	        };
	        /**
	         *
	         * @param day
	         * @returns {Number|boolean}
	         */
	        $scope.showNotAllHomeworks = function (day) {
	            return day.dailyEvents && day.dailyEvents.length && !$scope.showAllHomeworks(day);
	        };
	        /**
	         *
	         * @param day Current day
	         * @returns {boolean} true if all homeworks of current day
	         * should be displayed in homework panel
	         */
	        $scope.showAllHomeworks = function (day) {
	            if (!day.dailyEvents || (day.dailyEvents && day.dailyEvents.length == 0)) {
	                return false;
	            }
	            // calendar hidden and homework panel maximized -> show all
	            if (!$scope.bShowHomeworksMinified) {
	                return !$scope.bShowCalendar || (day.dailyEvents.length <= 1);
	            }
	            else {
	                return day.dailyEvents.length == 1;
	            }
	        };
	        /**
	         * Return the homework panel height that should be set
	         * depending on calendar grid displayed state and homework panel minimized state
	         * @param bShowCalendar True if calendar grid is visible
	         * @param bShowHomeworks True if homeworks panel is visible
	         * @returns {number} Homework panel height
	         */
	        var getHomeworkPanelHeight = function (bShowCalendar, bShowHomeworks) {
	            /**
	             * Height of a single homework in homework panel
	             * @type {number}
	             */
	            var HW_HEIGHT = 40;
	            var homeworksPerDayDisplayed = 0;
	            if (!bShowHomeworks) {
	                return 0;
	            }
	            if (!bShowCalendar) {
	                homeworksPerDayDisplayed = getMaxHomeworksPerDay();
	            }
	            else {
	                homeworksPerDayDisplayed = 1;
	            }
	            // max homeworks per day displayed used for drag and drop directive
	            // to detect dropped day of the week area
	            entcore_1.model.homeworksPerDayDisplayed = homeworksPerDayDisplayed;
	            return homeworksPerDayDisplayed * HW_HEIGHT;
	        };
	        /**
	         * Display homeworks and lessons and set open state of homework panel
	         * and calendar grid
	         */
	        function placeCalendarAndHomeworksPanel() {
	            var bShowCalendar = $scope.bShowCalendar;
	            var bShowHomeworks = null; //var bShowHomeworks = $scope.bShowHomeworks;
	            var bShowHomeworksMinified = $scope.bShowHomeworksMinified;
	            /**
	             * Calendar height
	             * @type {number}
	             */
	            return;
	            /*const CAL_HEIGHT = 775;
	
	            var newHwPanelHeight = getHomeworkPanelHeight(bShowCalendar, bShowHomeworks);
	
	            // reduce height of homework panel if requested
	
	            var prevTimeslotsBar = $('.previous-timeslots');
	            var nextTimeslotsBar = $('.next-timeslots');
	
	            // hours legend at left
	            var hoursBar = $('.timeslots');
	            var calItems = $('calendar .schedule-item-content');
	            var calGrid = $('.schedule .days');
	
	            // show/hide calendar items
	            hoursBar.css('display', bShowCalendar ? 'inherit' : 'none');
	            calItems.css('display', bShowCalendar ? 'inherit' : 'none');
	
	            // do not hide previous timeslots bar
	            // or else would make so hole/gap
	            if (bShowCalendar) {
	                prevTimeslotsBar.removeAttr('disabled');
	            } else {
	                prevTimeslotsBar.attr('disabled', 'disabled');
	            }
	
	            nextTimeslotsBar.css('display', bShowCalendar ? 'inherit' : 'none');
	
	            calGrid.height(bShowCalendar ? (newHwPanelHeight + CAL_HEIGHT) : 0);
	
	            hoursBar.css('margin-top', newHwPanelHeight);
	            $('legend.timeslots').css('margin-top', '');
	            $('legend.timeslots').css('top', newHwPanelHeight+"px");
	            nextTimeslotsBar.css('top', CAL_HEIGHT + newHwPanelHeight);
	
	            $('.schedule-item').css('margin-top', bShowCalendar ? newHwPanelHeight : 0);
	            calGrid.height(CAL_HEIGHT + (bShowCalendar ? newHwPanelHeight : 0));
	
	            // set homework panel size with max number of homeworks
	
	            //$('.homeworkpanel').css('height', newHwPanelHeight +"px");
	            $('.homeworkpanel').css('display', bShowHomeworks ? 'inherit' : 'none');
	
	            // toggle buttons
	            $('.show-homeworks').css('opacity', bShowHomeworks ? 1 : 0.3);
	            $('.show-calendar-grid').css('opacity', bShowCalendar ? 1 : 0.3);
	
	
	            $('#minimize_hw_span').css('display', (newHwPanelHeight > 0) ? 'inherit' : 'none');
	
	            if (!bShowCalendar) {
	                model.calendar.days.all.forEach(function(day) {
	                    hideOrShowHwDetail(day, true, true);
	                });
	            }*/
	        }
	        function setDaysContent() {
	            entcore_1.model.calendar.days.forEach(function (day) {
	                day.dailyEvents = [];
	            });
	            $scope.ngModel.forEach(function (item) {
	                var refDay = entcore_1.moment(entcore_1.model.calendar.dayForWeek).day(1);
	                entcore_1.model.calendar.days.forEach(function (day) {
	                    if (item.dueDate && item.dueDate.format('YYYY-MM-DD') === refDay.format('YYYY-MM-DD')) {
	                        day.dailyEvents.push(item);
	                    }
	                    refDay.add('day', 1);
	                });
	            });
	            $scope.calendar = entcore_1.model.calendar;
	            var timeslots = $('.timeslots');
	            if (timeslots.length === 8) {
	                placeCalendarAndHomeworksPanel();
	            }
	            else {
	                var timerOccurences = 0;
	                var timer = setInterval(function () {
	                    timeslots = $('.timeslots');
	                    if (timeslots.length === 8) {
	                        clearInterval(timer);
	                        placeCalendarAndHomeworksPanel();
	                    }
	                    timerOccurences++;
	                    // 5s should be far than enough to have all timeslots loaded
	                    if (timerOccurences > 50) {
	                        clearInterval(timer);
	                    }
	                }, 100);
	            }
	        }
	        entcore_1.model.on('calendar.date-change', function () {
	            setDaysContent();
	            $scope.$apply();
	        });
	        $scope.$watchCollection('ngModel', function (newVal) {
	            setDaysContent();
	        });
	    }]);


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var homework_service_1 = __webpack_require__(92);
	var lessons_service_1 = __webpack_require__(84);
	var utils_service_1 = __webpack_require__(83);
	var secure_service_1 = __webpack_require__(86);
	var tools_1 = __webpack_require__(73);
	exports.CalendarListViewController = entcore_1.ng.controller('CalendarListViewController', ['$scope', '$timeout', '$q', '$location', function ($scope, $timeout, $q, $location) {
	        var vm = _this;
	        $timeout(init);
	        function init() {
	            if (entcore_1.model.mondayOfWeek) {
	                entcore_1.model.filters.startDate = entcore_1.moment(entcore_1.model.mondayOfWeek);
	                entcore_1.model.filters.endDate = entcore_1.moment(entcore_1.model.filters.startDate).add(7, 'd');
	            }
	            else {
	                if (!entcore_1.model.filters.startDate) {
	                    entcore_1.model.filters.startDate = entcore_1.moment().startOf('week');
	                    entcore_1.model.filters.endDate = entcore_1.moment(entcore_1.model.filters.startDate).add(7, 'd');
	                }
	            }
	            vm.getDatas();
	            //reset filter;
	            $scope.$watch(function () {
	                return entcore_1.model.filters.selectedSubject;
	            }, function (n) {
	                if (!n) {
	                    entcore_1.model.filters.selectedSubject = undefined;
	                }
	            });
	            $scope.$watch(function () {
	                return entcore_1.model.filters.teacher;
	            }, function (n, o) {
	                if (n !== o && n) {
	                    $timeout(vm.getDatas);
	                }
	            });
	            $scope.$watch(function () {
	                return entcore_1.model.filters.audience;
	            }, function (n, o) {
	                if (n !== o && n) {
	                    $timeout(vm.getDatas);
	                }
	            });
	        }
	        $scope.$on('show-child', function (_, child) {
	            vm.getDatas();
	        });
	        $scope.$on('refresh-list', function () {
	            vm.getDatas();
	        });
	        vm.getDatas = function () {
	            var p1;
	            var p2;
	            entcore_1.model.filters.startDate = entcore_1.moment(entcore_1.model.filters.startDate);
	            entcore_1.model.filters.endDate = entcore_1.moment(entcore_1.model.filters.endDate);
	            var childId = entcore_1.model.child ? entcore_1.model.child.id : undefined;
	            if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.SHOW_OTHER_TEACHER)) {
	                var teacherItem = entcore_1.model.filters.teacher ? entcore_1.model.filters.teacher.item : undefined;
	                if (!teacherItem && !entcore_1.model.filters.audience) {
	                    return;
	                }
	                p1 = lessons_service_1.LessonService.getOtherLessons([entcore_1.model.filters.structure.id], entcore_1.model.filters.startDate, teacherItem, entcore_1.model.filters.audience, entcore_1.model.filters.startDate, entcore_1.model.filters.endDate);
	                p2 = homework_service_1.HomeworkService.getOtherHomeworks([entcore_1.model.filters.structure.id], entcore_1.model.filters.startDate, teacherItem, entcore_1.model.filters.audience, entcore_1.model.filters.startDate, entcore_1.model.filters.endDate);
	            }
	            else {
	                p1 = lessons_service_1.LessonService.getLessons(utils_service_1.UtilsService.getUserStructuresIdsAsString(), entcore_1.model.filters.startDate, entcore_1.model.isUserParent, childId, entcore_1.model.filters.startDate, entcore_1.model.filters.endDate);
	                p2 = homework_service_1.HomeworkService.getHomeworks(utils_service_1.UtilsService.getUserStructuresIdsAsString(), entcore_1.model.filters.startDate, entcore_1.model.isUserParent, childId, entcore_1.model.filters.startDate, entcore_1.model.filters.endDate);
	            }
	            return $q.all([p1, p2]).then(function (results) {
	                var lessons = results[0];
	                var homeworks = results[1];
	                vm.createStructure(lessons, homeworks);
	                entcore_1.model.filters.subjects = vm.getSubjects();
	                var selectedDay = entcore_1.model.selectedDay;
	                if (selectedDay) {
	                    entcore_1.model.selectedDay = undefined;
	                    vm.dayItems.map(function (item) {
	                        if (item.key === selectedDay.key) {
	                            item.selected = true;
	                            entcore_1.model.selectedDay = item;
	                        }
	                    });
	                }
	            });
	        };
	        vm.goToItemDetail = function (item) {
	            var id = item.item.lesson_id || item.item.id;
	            var type;
	            if (item.type == 'homework' && !item.item.lesson_id) {
	                type = 'Homework';
	            }
	            else {
	                type = 'Lesson';
	            }
	            //item.type[0].toUpperCase() + item.type.slice(1);
	            //let action = item.item.locked || item.type === 'homework'
	            var url;
	            if (item.item.locked) {
	                url = '/showLessonView/';
	            }
	            else {
	                url = '/edit' + type + 'View/';
	            }
	            if (item.item.lesson_id) {
	                url = url + item.item.lesson_id + "/" + item.item.id;
	            }
	            else {
	                url = url + item.item.id;
	            }
	            $location.url(url);
	        };
	        vm.selectDay = function (day) {
	            vm.dayItems.map(function (day) {
	                day.selected = false;
	            });
	            day.selected = true;
	            entcore_1.model.selectedDay = day;
	        };
	        vm.createStructure = function (lessons, homework) {
	            vm.dayItems = {};
	            entcore_1.model.lessons.all.splice(0, entcore_1.model.lessons.all.length);
	            entcore_1.model.lessons.addRange(lessons);
	            entcore_1.model.homeworks.all.splice(0, entcore_1.model.homeworks.all.length);
	            entcore_1.model.homeworks.addRange(homework);
	            vm.addArray(entcore_1.model.lessons.all, 'lesson');
	            vm.addArray(entcore_1.model.homeworks.all, 'homework');
	            vm.dayItems = vm.restructure(vm.dayItems);
	        };
	        vm.addArray = function (array, type) {
	            array.forEach(function (item) {
	                var key = item.date.format('YYYY-MM-DD');
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
	        vm.getSubjects = function () {
	            var subjectResults = {};
	            vm.dayItems.forEach(function (day) {
	                day.items.forEach(function (item) {
	                    if (item.item.subject && item.item.subject.label) {
	                        subjectResults[item.item.subject.label] = true;
	                    }
	                });
	            });
	            return Object.keys(subjectResults);
	        };
	        vm.restructure = function (map) {
	            var result = [];
	            for (var dayAsMapKey in vm.dayItems) {
	                var items = vm.dayItems[dayAsMapKey];
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


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(73);
	var index_1 = __webpack_require__(3);
	var subject_service_1 = __webpack_require__(82);
	var pedagogic_item_service_1 = __webpack_require__(96);
	exports.EditLessonController = entcore_1.ng.controller('EditLessonController', ['$scope', '$rootScope', '$routeParams', function ($scope, $rootScope, $routeParams) {
	        var vm = _this;
	        init();
	        function init() {
	            return __awaiter(this, void 0, void 0, function () {
	                return __generator(this, function (_a) {
	                    switch (_a.label) {
	                        case 0:
	                            //existing lesson
	                            $scope.tabs.showAnnotations = false;
	                            return [4 /*yield*/, loadSubjects()];
	                        case 1:
	                            _a.sent();
	                            return [4 /*yield*/, loadHomeworkTypes()];
	                        case 2:
	                            _a.sent();
	                            if ($routeParams.idLesson) {
	                                entcore_1.model.newLesson = null;
	                                loadExistingLesson();
	                            }
	                            else if (entcore_1.model.newLesson) {
	                                createNewLessonFromPedagogicItem();
	                            }
	                            else if ($routeParams.progressionId) {
	                                //show the EditProgressionLessonController
	                                loadNewLesson();
	                                return [2 /*return*/];
	                            }
	                            else {
	                                //new lesson
	                                loadNewLesson();
	                            }
	                            $scope.data.tabSelected = 'lesson';
	                            //add watch on selection
	                            $scope.$watch('lesson.audience', function () {
	                                if (vm.lesson && vm.lesson.previousLessons) {
	                                    $scope.loadPreviousLessonsFromLesson(vm.lesson);
	                                }
	                            });
	                            //add watch on selection
	                            $scope.$watch('lesson.subject', function () {
	                                if (vm.lesson && vm.lesson.previousLessons) {
	                                    $scope.loadPreviousLessonsFromLesson(vm.lesson);
	                                }
	                            });
	                            return [2 /*return*/];
	                    }
	                });
	            });
	        }
	        function loadHomeworkTypes() {
	            return __awaiter(this, void 0, void 0, function () {
	                var e_1;
	                return __generator(this, function (_a) {
	                    switch (_a.label) {
	                        case 0:
	                            console.log('load  Homework types');
	                            if (!(!entcore_1.model.homeworkTypes || !entcore_1.model.homeworkTypes.all || entcore_1.model.homeworkTypes.all.length === 0)) return [3 /*break*/, 4];
	                            _a.label = 1;
	                        case 1:
	                            _a.trys.push([1, 3, , 4]);
	                            return [4 /*yield*/, entcore_1.model.homeworkTypes.syncHomeworkTypes()];
	                        case 2:
	                            _a.sent();
	                            return [3 /*break*/, 4];
	                        case 3:
	                            e_1 = _a.sent();
	                            $rootScope.validationError(e_1);
	                            return [3 /*break*/, 4];
	                        case 4: return [2 /*return*/];
	                    }
	                });
	            });
	        }
	        function loadSubjects() {
	            return __awaiter(this, void 0, void 0, function () {
	                var subjects;
	                return __generator(this, function (_a) {
	                    switch (_a.label) {
	                        case 0:
	                            if (!(!entcore_1.model.subjects || !entcore_1.model.subjects.all || entcore_1.model.subjects.all.length === 0)) return [3 /*break*/, 2];
	                            return [4 /*yield*/, subject_service_1.SubjectService.getCustomSubjects(entcore_1.model.isUserTeacher())];
	                        case 1:
	                            subjects = _a.sent();
	                            entcore_1.model.subjects.all = [];
	                            if (subjects) {
	                                entcore_1.model.subjects.addRange(subjects);
	                            }
	                            return [3 /*break*/, 3];
	                        case 2: return [2 /*return*/, false];
	                        case 3: return [2 /*return*/];
	                    }
	                });
	            });
	        }
	        function createNewLessonFromPedagogicItem() {
	            vm.lesson = entcore_1.model.newLesson;
	            entcore_1.model.newLesson = null;
	            //$scope.newItem = vm.lesson.newItem;
	            populateExistingLesson();
	        }
	        function populateExistingLesson() {
	            $scope.tabs.createLesson = $routeParams.idHomework ? 'homeworks' : 'lesson';
	            $scope.tabs.showAnnotations = !!vm.lesson.annotations;
	            // open existing lesson for edit
	            vm.lesson.previousLessonsLoaded = false; // will force reload
	            $scope.newItem = {
	                date: entcore_1.moment(vm.lesson.date),
	                beginning: vm.lesson.startMoment,
	                end: vm.lesson.endMoment //moment(vm.lesson.end)
	            };
	            $scope.loadHomeworksForCurrentLesson(function () {
	                vm.lesson.homeworks.forEach(function (homework) {
	                    if (vm.lesson.homeworks.length || ($routeParams.idHomework && $routeParams.idHomework == homework.id)) {
	                        homework.expanded = true;
	                    }
	                    entcore_1.model.loadHomeworksLoad(homework, entcore_1.moment(homework.date).format("YYYY-MM-DD"), vm.lesson.audience.id);
	                });
	            });
	        }
	        /*
	        * load existing lesson
	        */
	        function loadExistingLesson() {
	            var lesson = new index_1.Lesson();
	            entcore_1.model.lesson = lesson;
	            lesson.id = parseInt($routeParams.idLesson);
	            $scope.lessonDescriptionIsReadOnly = false;
	            $scope.homeworkDescriptionIsReadOnly = false;
	            vm.lesson = lesson;
	            lesson.load(true, function () {
	                populateExistingLesson();
	            }, function (cbe) {
	                entcore_1.notify.error(cbe.message);
	            });
	        }
	        function loadNewLesson() {
	            var selectedDate = $scope.selectedDateInTheFuture();
	            vm.lesson = entcore_1.model.initLesson(("timeFromCalendar" === $routeParams.timeFromCalendar), selectedDate);
	            $scope.newItem = vm.lesson.newItem;
	        }
	        /**
	         * Load homeworks for current lesson being edited
	         * @param cb Callback function
	         */
	        $scope.loadHomeworksForCurrentLesson = function (cb) {
	            // lesson not yet created do not retrieve homeworks
	            if (!vm.lesson.id) {
	                return;
	            }
	            var needSqlSync = false;
	            // if homeworks ever retrieved from db don't do it again!
	            vm.lesson.homeworks.forEach(function (homework) {
	                if (!homework.loaded) {
	                    needSqlSync = true;
	                }
	            });
	            // only reload homeworks if necessary
	            if (needSqlSync) {
	                entcore_1.model.loadHomeworksForLesson(vm.lesson, function () {
	                    if (typeof cb !== 'undefined') {
	                        cb();
	                    }
	                }, function (e) {
	                    $rootScope.validationError(e);
	                });
	            }
	            else {
	                if (typeof cb !== 'undefined') {
	                    cb();
	                }
	            }
	        };
	        /**
	         * Create or update lesson to database from page fields
	         * @param goMainView if true will switch to calendar or list view
	         * after create/update else stay on current page
	         */
	        var createOrUpdateLesson = function (goMainView, cb) {
	            $scope.currentErrors = [];
	            vm.lesson.startTime = $scope.newItem.beginning;
	            vm.lesson.endTime = $scope.newItem.end;
	            vm.lesson.date = $scope.newItem.date;
	            return vm.lesson.save(function () {
	                entcore_1.notify.info('lesson.saved');
	                vm.lesson.audience = entcore_1.model.audiences.findWhere({
	                    id: vm.lesson.audience.id
	                });
	                if (goMainView) {
	                    vm.lesson = null;
	                    $scope.homework = null;
	                }
	                if (typeof cb === 'function') {
	                    cb();
	                }
	            }).catch(function (e) {
	                vm.errorValid = true;
	                throw e;
	            });
	        };
	        $scope.loadMorePreviousLessonsFromLesson = function (currentLesson) {
	            if (currentLesson.allPreviousLessonsLoaded || currentLesson.previousLessonsLoading) {
	                return;
	            }
	            $scope.loadPreviousLessonsFromLesson(currentLesson, true);
	        };
	        var defaultCount = 6;
	        var idx_start = 0;
	        var idx_end = idx_start + defaultCount;
	        $scope.loadPreviousLessonsFromLesson = function (lesson, useDeltaStep) {
	            if (!useDeltaStep) {
	                lesson.allPreviousLessonsLoaded = false;
	            }
	            if (useDeltaStep) {
	                idx_start += defaultCount;
	                idx_end += defaultCount;
	            }
	            //const DATE_FORMAT = "dd/MM/yyyy";
	            var params = {
	                offset: idx_start,
	                limit: idx_end,
	                excludeLessonId: lesson.id ? lesson.id : null,
	                startDate: entcore_1.moment(lesson.date).add(-2, 'month').format(tools_1.DATE_FORMAT),
	                subject: lesson.subject.id,
	                audienceId: lesson.audience.id,
	                returnType: 'lesson',
	                homeworkLinkedToLesson: "true",
	                sortOrder: "DESC"
	            };
	            // tricky way to detect if string date or moment date ...
	            // 12:00:00
	            if (lesson.endTime.length === 8) {
	                params.endDateTime = lesson.date.format(tools_1.DATE_FORMAT) + ' ' + lesson.endTime;
	            }
	            else {
	                params.endDateTime = lesson.date.format(tools_1.DATE_FORMAT) + ' ' + entcore_1.moment(lesson.endTime).format("HH:mm");
	            }
	            if (!lesson.previousLessons) {
	                lesson.previousLessons = [];
	            }
	            lesson.previousLessonsLoading = true;
	            pedagogic_item_service_1.PedagogicItemService.getPedagogicItems(params).then(function (pedagogicItems) {
	                //lesson.previousLessonsDisplayed = [];
	                if (pedagogicItems.length < defaultCount) {
	                    lesson.allPreviousLessonsLoaded = true;
	                }
	                var groupByItemType = entcore_1._.groupBy(pedagogicItems, 'type_item');
	                var previousLessons = groupByItemType.lesson;
	                if (previousLessons) {
	                    var previousLessonIds = [];
	                    previousLessons.forEach(function (lesson) {
	                        previousLessonIds.push(lesson.id);
	                    });
	                    // load linked homeworks of previous lessons
	                    var paramsHomeworks = {
	                        returnType: 'homework',
	                        homeworkLessonIds: previousLessonIds
	                    };
	                    pedagogic_item_service_1.PedagogicItemService.getPedagogicItems(paramsHomeworks).then(function (previousHomeworks) {
	                        previousLessons.forEach(function (lesson) {
	                            lesson.homeworks = entcore_1._.where(previousHomeworks, { lesson_id: lesson.id });
	                        });
	                        if (idx_start !== 0) {
	                            lesson.previousLessons = lesson.previousLessons.concat(previousLessons);
	                        }
	                        else {
	                            lesson.previousLessons = previousLessons;
	                        }
	                        lesson.previousLessonsLoaded = true;
	                        lesson.previousLessonsLoading = false;
	                        /*if (typeof cb === 'function') {
	                            cb();
	                        }*/
	                    });
	                }
	                else {
	                    lesson.previousLessons = [];
	                    lesson.previousLessonsLoaded = true;
	                    lesson.previousLessonsLoading = false;
	                    /* if (typeof cb === 'function') {
	                         cb();
	                     }*/
	                }
	            });
	        };
	        $scope.createAndPublishLesson = function (lesson, isPublish, goMainView) {
	            return createOrUpdateLesson().then(function () {
	                return $scope.publishLesson(lesson, isPublish).then(function () {
	                    $rootScope.back();
	                });
	            });
	        };
	        $scope.createOrUpdateLesson = function () {
	            return createOrUpdateLesson().then(function () {
	                $rootScope.back();
	            });
	        };
	    }]);


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var PedagogicItem_model_1 = __webpack_require__(74);
	var axios_1 = __webpack_require__(47);
	var PedagogicItemService = (function () {
	    function PedagogicItemService() {
	    }
	    PedagogicItemService.getPedagogicItems = function (params) {
	        var _this = this;
	        var options = {
	            method: 'POST',
	            url: "/diary/pedagogicItems/list",
	            data: params
	        };
	        return axios_1.default(options).then(function (result) {
	            return entcore_1._.map(result.data, _this.mapPedagogicItem);
	        });
	    };
	    PedagogicItemService.mapPedagogicItem = function (data) {
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
	        if (data.day) {
	            item.dayFormatted = entcore_1.moment(data.day).format("DD/MM/YYYY");
	            item.dayOfWeek = entcore_1.moment(data.day).format("dddd");
	        }
	        return item;
	    };
	    return PedagogicItemService;
	}());
	exports.PedagogicItemService = PedagogicItemService;
	;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var progression_service_1 = __webpack_require__(98);
	exports.EditProgressionLessonController = entcore_1.ng.controller('EditProgressionLessonController', ['$scope', '$timeout', '$rootScope', '$routeParams', function ($scope, $timeout, $rootScope, $routeParams) {
	        var vm = _this;
	        $timeout(init);
	        function init() {
	            if ($routeParams.progressionId) {
	                $scope.data.tabSelected = 'lesson';
	                vm.isProgressionLesson = true;
	                if ($routeParams.editProgressionLessonId !== 'new') {
	                    loadLesson($routeParams.editProgressionLessonId);
	                }
	            }
	        }
	        function loadLesson(lessonId) {
	            progression_service_1.ProgressionService.getLessonProgression(lessonId).then(function (lesson) {
	                $scope.$parent.editLessonCtrl.lesson = lesson;
	            });
	        }
	        vm.cancel = function () {
	            $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
	        };
	        vm.saveLesson = function (lesson) {
	            if (!lesson.progressionId) {
	                lesson.progressionId = $routeParams.progressionId;
	            }
	            progression_service_1.ProgressionService.saveLessonProgression(lesson).then(function (newLesson) {
	                entcore_1.notify.info(entcore_1.idiom.translate('progression.content.saved'));
	                lesson.id = newLesson.id;
	                $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
	            });
	        };
	        vm.addHomework = function (lesson) {
	            if (!lesson.homeworks) {
	                lesson.homeworks = [];
	            }
	            var homework = entcore_1.model.initHomework();
	            lesson.homeworks.push(homework);
	        };
	        vm.loadLesson = function (lessonId) {
	        };
	    }]);


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var ProgressionService = (function () {
	    function ProgressionService() {
	    }
	    ProgressionService.getProgressions = function () {
	        var _this = this;
	        var url = "/diary/progression";
	        return entcore_1.$http.get(url).then(function (result) {
	            var progressions = result.data;
	            entcore_1._.each(progressions, function (progression) {
	                progression.lessons = entcore_1._.map(progression.lessons, _this.mapApiToLesson);
	            });
	            return progressions;
	        });
	    };
	    ProgressionService.saveProgression = function (progression) {
	        var progressionLight = entcore_1.angular.copy(progression);
	        var lessonItems = progressionLight.lessonItems;
	        var nbLessons = progressionLight.nbLessons;
	        delete progressionLight.lessonItems;
	        delete progressionLight.nbLessons;
	        var url = "/diary/progression";
	        return entcore_1.$http({
	            url: url,
	            method: 'POST',
	            data: progressionLight
	        }).then(function (result) {
	            if (!lessonItems && !nbLessons) {
	                nbLessons = 0;
	            }
	            result.data.lessonItems = lessonItems;
	            result.data.nbLessons = nbLessons;
	            return result.data;
	        });
	    };
	    ProgressionService.deleteProgression = function (progressionId) {
	        var url = "/diary/progression/" + progressionId;
	        return entcore_1.$http({
	            url: url,
	            method: 'DELETE'
	        }).then(function (result) {
	            return result.data;
	        });
	    };
	    ProgressionService.deleteLessons = function (lessons) {
	        var lessonsIds = entcore_1._.map(lessons, function (lesson) {
	            return lesson.id;
	        });
	        var url = "/diary/progression/lessons";
	        return entcore_1.$http({
	            url: url,
	            method: 'DELETE',
	            data: lessonsIds
	        }).then(function (result) {
	            return result.data;
	        });
	    };
	    ProgressionService.saveLessonProgression = function (lesson) {
	        var _this = this;
	        var url = "/diary/progression/lesson";
	        var subjectPromise = entcore_1.$q.when();
	        if (!lesson.subject.id) {
	            subjectPromise = lesson.subject.save().then(function (subject) {
	                subject.data = {
	                    id: subject.id,
	                    label: subject.label,
	                    school_id: subject.school_id
	                };
	            });
	        }
	        return subjectPromise.then(function () {
	            return entcore_1.$http({
	                url: url,
	                method: 'POST',
	                data: _this.mapLessonToApi(lesson)
	            }).then(function (result) {
	                return result.data;
	            });
	        });
	    };
	    ProgressionService.getLessonsProgression = function (progressionId) {
	        var url = "/diary/progression/" + progressionId + "/lessons";
	        var that = this;
	        return entcore_1.$http.get(url).then(function (result) {
	            return entcore_1._.map(result.data, function (lesson) { return that.mapApiToLesson(lesson); });
	        });
	    };
	    ProgressionService.getLessonProgression = function (lessonId) {
	        var url = "/diary/progression/lesson/" + lessonId;
	        var that = this;
	        return entcore_1.$http.get(url).then(function (result) {
	            return that.mapApiToLesson(result.data);
	        });
	    };
	    ProgressionService.saveLessonOrder = function (progression) {
	        var url = "/diary/progression/order";
	        return entcore_1.$http({
	            url: url,
	            method: 'POST',
	            data: this.extractOrderInformations(progression)
	        });
	    };
	    ProgressionService.mapApiToLesson = function (apiLesson) {
	        var lesson = apiLesson; //angular.copy(apiLesson);
	        lesson.subject = JSON.parse(lesson.subject);
	        lesson.type_item = 'progression';
	        if (lesson.description) {
	            lesson.descriptionTrusted = entcore_1.$sce.trustAsHtml(lesson.description);
	        }
	        lesson.homeworks = JSON.parse(lesson.homeworks);
	        entcore_1._.each(lesson.homeworks, function (homework) {
	            if (homework.description) {
	                homework.descriptionTrusted = entcore_1.$sce.trustAsHtml(homework.description);
	            }
	            homework.type = entcore_1._.find(entcore_1.model.homeworkTypes.all, { 'label': homework.type.label });
	        });
	        var homeworks = new entcore_1.Collection();
	        homeworks.all = lesson.homeworks;
	        lesson.homeworks = homeworks;
	        return lesson;
	    };
	    ProgressionService.mapHomeworkToApi = function (homework) {
	        return JSON.stringify(homework.data);
	    };
	    ProgressionService.mapAttachementsToApi = function (attachment) {
	        return attachment;
	    };
	    ProgressionService.mapLessonToApi = function (lesson) {
	        var result = {
	            id: lesson.id,
	            title: lesson.title,
	            description: lesson.description,
	            subjectLabel: lesson.subject.label,
	            color: lesson.color,
	            annotations: lesson.annotations,
	            orderIndex: lesson.orderIndex,
	            //subject: lesson.subject,
	            progressionId: lesson.progressionId,
	            homeworks: lesson.homeworks && lesson.homeworks.all ? entcore_1._.map(lesson.homeworks.all, this.mapHomeworkToApi) : [],
	        };
	        if (lesson.homeworks) {
	            result.homeworks = JSON.stringify(entcore_1._.map(lesson.homeworks.all, this.mapObject));
	        }
	        //let subject = lesson.subject.data.label ? lesson.subject.data : lesson.subject;
	        result.subject = JSON.stringify(lesson.subject.data);
	        return result;
	    };
	    ProgressionService.mapObject = function (obj) {
	        obj.toJSON = undefined;
	        return obj;
	    };
	    ProgressionService.extractOrderInformations = function (progression) {
	        var lessonsOrder = [];
	        entcore_1._.each(progression.lessonItems, function (lesson) {
	            lessonsOrder.push({
	                id: lesson.id,
	                orderIndex: lesson.orderIndex
	            });
	        });
	        return lessonsOrder;
	    };
	    return ProgressionService;
	}());
	exports.ProgressionService = ProgressionService;
	;


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var progression_service_1 = __webpack_require__(98);
	exports.ProgressionManagerController = entcore_1.ng.controller('ProgressionManagerController', ['$scope', '$timeout', '$rootScope', '$routeParams', function ($scope, $timeout, $rootScope, $routeParams) {
	        var vm = _this;
	        function init() {
	            vm.loadProgressions();
	        }
	        $timeout(init);
	        vm.edit = function () {
	            vm.originalProgressionItem = entcore_1.angular.copy(vm.selectedProgressionItem);
	            vm.selectedProgressionItem.edit = true;
	        };
	        vm.resizePanel = function () {
	            $timeout(function () {
	                $('[diary-sortable-list]').css('height', ($(window).outerHeight() - $('[diary-sortable-list]').offset().top - 50) + 'px');
	            });
	        };
	        vm.hasProgressItem = function () {
	            return vm.selectedProgressionItem === undefined;
	        };
	        vm.cancel = function () {
	            if (vm.selectedProgressionItem.id) {
	                vm.selectedProgressionItem.title = vm.originalProgressionItem.title;
	                vm.selectedProgressionItem.level = vm.originalProgressionItem.level;
	                vm.selectedProgressionItem.description = vm.originalProgressionItem.description;
	                vm.originalProgressionItem = null;
	                vm.selectedProgressionItem.edit = false;
	            }
	            else {
	                vm.selectedProgressionItem = undefined;
	            }
	        };
	        vm.setNewProgression = function () {
	            vm.selectedProgressionItem = {
	                edit: true
	            };
	        };
	        vm.selectProgression = function (progressionItem) {
	            $rootScope.redirect('/progressionManagerView/' + progressionItem.id);
	            vm.selectedProgressionItem = progressionItem;
	            progressionItem.edit = false;
	            vm.loadLessonsFromProgression(vm.selectedProgressionItem);
	        };
	        vm.addNewLesson = function () {
	            $rootScope.redirect('/progressionEditLesson/' + vm.selectedProgressionItem.id + '/new');
	        };
	        vm.editLesson = function (id) {
	            $rootScope.redirect('/progressionEditLesson/' + vm.selectedProgressionItem.id + '/' + id);
	        };
	        vm.loadProgressions = function () {
	            progression_service_1.ProgressionService.getProgressions().then(function (progressions) {
	                vm.progressionItems = progressions;
	                if ($routeParams.selectedProgressionId !== 'none') {
	                    var progressionToLoad = entcore_1._.findWhere(vm.progressionItems, { id: parseInt($routeParams.selectedProgressionId) });
	                    if (progressionToLoad) {
	                        vm.selectProgression(progressionToLoad);
	                    }
	                }
	            });
	        };
	        vm.loadLessonsFromProgression = function (progression) {
	            progression.lessonItems = null;
	            progression_service_1.ProgressionService.getLessonsProgression(progression.id).then(function (lessons) {
	                progression.lessonItems = lessons;
	            });
	        };
	        vm.saveLesson = function (lesson) {
	            progression_service_1.ProgressionService.saveLessonProgression(lesson).then(function (newLesson) {
	                lesson.id = newLesson.id;
	                entcore_1.notify.info(entcore_1.idiom.translate('progression.content.saved'));
	            });
	        };
	        vm.selectedContent = function () {
	            return entcore_1._.filter(vm.selectedProgressionItem.lessonItems, { 'selected': true });
	        };
	        vm.saveProgression = function (progression) {
	            progression_service_1.ProgressionService.saveProgression(progression).then(function (newProgression) {
	                if (!progression.id) {
	                    vm.progressionItems.push(newProgression);
	                }
	                else {
	                    var oldProgressionItems = entcore_1._.findWhere(vm.progressionItems, { 'id': newProgression.id });
	                    if (oldProgressionItems) {
	                        vm.progressionItems[vm.progressionItems.indexOf(oldProgressionItems)] = newProgression;
	                    }
	                }
	                vm.selectedProgressionItem = newProgression;
	                entcore_1.notify.info(entcore_1.idiom.translate('progression.progression.saved'));
	            });
	        };
	        vm.saveOrder = function (progression) {
	            progression_service_1.ProgressionService.saveLessonOrder(progression);
	        };
	        vm.removeSelectedContent = function () {
	            progression_service_1.ProgressionService.deleteLessons(vm.selectedContent()).then(function () {
	                vm.loadLessonsFromProgression(vm.selectedProgressionItem);
	                entcore_1.notify.info(entcore_1.idiom.translate('progression.content.deleted'));
	            });
	        };
	        vm.removeProgression = function () {
	            progression_service_1.ProgressionService.deleteProgression(vm.selectedProgressionItem.id).then(function () {
	                vm.selectedProgressionItem = undefined;
	                entcore_1.notify.info(entcore_1.idiom.translate('progression.progression.deleted'));
	                vm.loadProgressions();
	            });
	        };
	        vm.editSelectedContent = function () {
	            vm.editLesson(vm.selectedContent()[0].id);
	        };
	    }]);


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var progression_service_1 = __webpack_require__(98);
	exports.ProgressionRightPanelController = entcore_1.ng.controller('ProgressionRightPanelController', ['$scope', '$location', function ($scope, $location) {
	        var vm = _this;
	        init();
	        function init() {
	            progression_service_1.ProgressionService.getProgressions().then(function (progressions) {
	                vm.progressionItems = progressions;
	            });
	        }
	        vm.selectProgression = function (progression) {
	            vm.selected = 'detail';
	            vm.progressionSelected = progression;
	            vm.filterLesson = undefined;
	            progression.lessonItems = null;
	            progression_service_1.ProgressionService.getLessonsProgression(progression.id).then(function (lessons) {
	                progression.lessonItems = lessons;
	            });
	        };
	        $scope.redirect = function (path) {
	            $location.path(path);
	        };
	        vm.dragCondition = function (item) {
	            return true;
	        };
	        vm.dropCondition = function (targetItem) {
	            return false;
	        };
	        vm.drag = function (item, $originalEvent) {
	            try {
	                $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
	            }
	            catch (e) {
	                $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
	            }
	        };
	    }]);


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var visa_service_1 = __webpack_require__(102);
	exports.HabilitationController = entcore_1.ng.controller('HabilitationController', ['$scope', '$timeout', '$rootScope', function ($scope, $timeout, $rootScope) {
	        var vm = _this;
	        function init() {
	            vm.filter = {};
	            vm.getInspector(entcore_1.model.me.structures[0]);
	            vm.rended = true;
	            //watch change inspector
	            $scope.$watch(function () {
	                return vm.filter.inspector;
	            }, function (n, o) {
	                if (o !== n && n) {
	                    vm.getInspectTeachers(vm.structure.id, vm.filter.inspector.key);
	                }
	            });
	            //watch change teacher
	            $scope.$watch(function () {
	                return vm.filter.teacher;
	            }, function (n, o) {
	                if (o !== n && n) {
	                    vm.selectTeacher(n.item);
	                    vm.filter.teacher = undefined;
	                }
	            });
	        }
	        $timeout(init);
	        vm.selectTeacher = function (teacher) {
	            var existantTeacher = entcore_1._.findWhere(vm.selectedTeachers, { 'key': teacher.key });
	            if (!existantTeacher) {
	                vm.selectedTeachers.push(teacher);
	                vm.save();
	            }
	        };
	        vm.getInspector = function (structureId) {
	            vm.filter.teacher = undefined;
	            visa_service_1.VisaService.getInspectorList().then(function (inspectors) {
	                vm.filters = {
	                    inspectors: inspectors
	                };
	            });
	        };
	        vm.removeTeacher = function (teacher) {
	            vm.selectedTeachers = entcore_1._.filter(vm.selectedTeachers, function (t) {
	                return t.key !== teacher.key;
	            });
	            vm.save();
	        };
	        vm.cancel = function () {
	            vm.getInspectTeachers(vm.structure.id, vm.filter.inspector.key);
	        };
	        vm.getInspectTeachers = function (structureId, inspectorId) {
	            vm.filters.teachers = undefined;
	            vm.selectedTeachers = undefined;
	            vm.filter.teacher = undefined;
	            visa_service_1.VisaService.getInspectTeachers(structureId, vm.filter.inspector.key).then(function (result) {
	                vm.filters.teachers = result.availableTeachers;
	                vm.selectedTeachers = result.onInspectorTeachers;
	            });
	        };
	        vm.save = function () {
	            visa_service_1.VisaService.applyInspectorRight(vm.structure.id, vm.filter.inspector.key, vm.selectedTeachers).then(function () {
	                vm.getInspectTeachers(vm.structure.id, vm.filter.inspector.key);
	            });
	        };
	    }
	]);


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var FileSaver = __webpack_require__(103);
	var axios_1 = __webpack_require__(47);
	/*
	 * Visa service as class
	 * used to manipulate Visa modelH
	 */
	var VisaService = (function () {
	    function VisaService() {
	    }
	    VisaService.getFilters = function (structureId) {
	        var url = "/diary/visa/filters/" + structureId;
	        return axios_1.default.get(url).then(function (result) {
	            return result.data;
	        });
	    };
	    VisaService.getInspectorFilters = function (structureId, inspectorId) {
	        var url = "/diary/visa/filtersinspector/" + structureId + "/" + inspectorId;
	        return axios_1.default.get(url).then(function (result) {
	            return result.data;
	        });
	    };
	    VisaService.getAgregatedVisas = function (structureId, filter) {
	        var url = "/diary/visa/agregs";
	        return axios_1.default({
	            url: url,
	            method: 'GET',
	            params: {
	                structureId: structureId,
	                teacherId: filter.teacher && filter.teacher.item ? filter.teacher.item.key : undefined,
	                audienceId: filter.audience ? filter.audience.key : undefined,
	                subjectId: filter.subject ? filter.subject.key : undefined,
	                statut: filter.state.key //? (filter.state.key == "TODO" ? true : undefined): undefined
	            }
	        }).then(function (result) {
	            return result.data;
	        });
	    };
	    VisaService.applyVisa = function (applyVisa, lock) {
	        var url = "/diary/visa/apply/" + lock;
	        return axios_1.default({
	            url: url,
	            method: 'POST',
	            data: applyVisa
	        }).then(function (result) {
	            return result.data;
	        });
	    };
	    VisaService.getLessonForVisa = function (resultVisaList) {
	        var url = "/diary/visa/lessons";
	        return axios_1.default({
	            url: url,
	            method: 'POST',
	            data: resultVisaList
	        }).then(function (result) {
	            return result.data;
	        });
	    };
	    VisaService.getPdfForVisa = function (resultVisaList) {
	        var url = "/diary/visa/pdf";
	        axios_1.default({
	            url: url,
	            method: "POST",
	            data: resultVisaList,
	            responseType: 'arraybuffer'
	        }).then(function (data) {
	            var blob = new Blob([data], { type: " application/pdf" });
	            var date = entcore_1.moment().format("YYYY-MM-DD_HH-mm-ss");
	            var fileName = "ent-visa-generation_" + date + ".pdf";
	            FileSaver.saveAs(blob, fileName);
	        });
	    };
	    VisaService.applyInspectorRight = function (structureId, inspectorId, teachers) {
	        var url = "/diary/inspect/right/" + structureId + "/" + inspectorId;
	        return axios_1.default({
	            url: url,
	            method: "POST",
	            data: teachers,
	        });
	    };
	    VisaService.getInspectTeachers = function (structureId, inspectorId) {
	        var url = "/diary/inspect/getTeacher/" + structureId + "/" + inspectorId;
	        return axios_1.default({
	            url: url,
	            method: 'GET'
	        }).then(function (result) {
	            return result.data;
	        });
	    };
	    VisaService.getInspectorList = function () {
	        var url = "/diary/inspect/getInspectors";
	        return axios_1.default({
	            url: url,
	            method: 'GET'
	        }).then(function (result) {
	            return result.data;
	        });
	    };
	    return VisaService;
	}());
	exports.VisaService = VisaService;


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* FileSaver.js
	 * A saveAs() FileSaver implementation.
	 * 1.3.2
	 * 2016-06-16 18:25:19
	 *
	 * By Eli Grey, http://eligrey.com
	 * License: MIT
	 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
	 */
	
	/*global self */
	/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */
	
	/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
	
	var saveAs = saveAs || (function(view) {
		"use strict";
		// IE <10 is explicitly unsupported
		if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
			return;
		}
		var
			  doc = view.document
			  // only get URL when necessary in case Blob.js hasn't overridden it yet
			, get_URL = function() {
				return view.URL || view.webkitURL || view;
			}
			, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
			, can_use_save_link = "download" in save_link
			, click = function(node) {
				var event = new MouseEvent("click");
				node.dispatchEvent(event);
			}
			, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
			, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
			, throw_outside = function(ex) {
				(view.setImmediate || view.setTimeout)(function() {
					throw ex;
				}, 0);
			}
			, force_saveable_type = "application/octet-stream"
			// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
			, arbitrary_revoke_timeout = 1000 * 40 // in ms
			, revoke = function(file) {
				var revoker = function() {
					if (typeof file === "string") { // file is an object URL
						get_URL().revokeObjectURL(file);
					} else { // file is a File
						file.remove();
					}
				};
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
			, dispatch = function(filesaver, event_types, event) {
				event_types = [].concat(event_types);
				var i = event_types.length;
				while (i--) {
					var listener = filesaver["on" + event_types[i]];
					if (typeof listener === "function") {
						try {
							listener.call(filesaver, event || filesaver);
						} catch (ex) {
							throw_outside(ex);
						}
					}
				}
			}
			, auto_bom = function(blob) {
				// prepend BOM for UTF-8 XML and text/* types (including HTML)
				// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
				if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
					return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
				}
				return blob;
			}
			, FileSaver = function(blob, name, no_auto_bom) {
				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				// First try a.download, then web filesystem, then object URLs
				var
					  filesaver = this
					, type = blob.type
					, force = type === force_saveable_type
					, object_url
					, dispatch_all = function() {
						dispatch(filesaver, "writestart progress write writeend".split(" "));
					}
					// on any filesys errors revert to saving with object URLs
					, fs_error = function() {
						if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
							// Safari doesn't allow downloading of blob urls
							var reader = new FileReader();
							reader.onloadend = function() {
								var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
								var popup = view.open(url, '_blank');
								if(!popup) view.location.href = url;
								url=undefined; // release reference before dispatching
								filesaver.readyState = filesaver.DONE;
								dispatch_all();
							};
							reader.readAsDataURL(blob);
							filesaver.readyState = filesaver.INIT;
							return;
						}
						// don't create more object URLs than needed
						if (!object_url) {
							object_url = get_URL().createObjectURL(blob);
						}
						if (force) {
							view.location.href = object_url;
						} else {
							var opened = view.open(object_url, "_blank");
							if (!opened) {
								// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
								view.location.href = object_url;
							}
						}
						filesaver.readyState = filesaver.DONE;
						dispatch_all();
						revoke(object_url);
					}
				;
				filesaver.readyState = filesaver.INIT;
	
				if (can_use_save_link) {
					object_url = get_URL().createObjectURL(blob);
					setTimeout(function() {
						save_link.href = object_url;
						save_link.download = name;
						click(save_link);
						dispatch_all();
						revoke(object_url);
						filesaver.readyState = filesaver.DONE;
					});
					return;
				}
	
				fs_error();
			}
			, FS_proto = FileSaver.prototype
			, saveAs = function(blob, name, no_auto_bom) {
				return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
			}
		;
		// IE 10+ (native saveAs)
		if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
			return function(blob, name, no_auto_bom) {
				name = name || blob.name || "download";
	
				if (!no_auto_bom) {
					blob = auto_bom(blob);
				}
				return navigator.msSaveOrOpenBlob(blob, name);
			};
		}
	
		FS_proto.abort = function(){};
		FS_proto.readyState = FS_proto.INIT = 0;
		FS_proto.WRITING = 1;
		FS_proto.DONE = 2;
	
		FS_proto.error =
		FS_proto.onwritestart =
		FS_proto.onprogress =
		FS_proto.onwrite =
		FS_proto.onabort =
		FS_proto.onerror =
		FS_proto.onwriteend =
			null;
	
		return saveAs;
	}(
		   typeof self !== "undefined" && self
		|| typeof window !== "undefined" && window
		|| this.content
	));
	// `self` is undefined in Firefox for Android content script context
	// while `this` is nsIContentFrameMessageManager
	// with an attribute `content` that corresponds to the window
	
	if (typeof module !== "undefined" && module.exports) {
	  module.exports.saveAs = saveAs;
	} else if (("function" !== "undefined" && __webpack_require__(104) !== null) && (__webpack_require__(105) !== null)) {
	  !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	    return saveAs;
	  }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}


/***/ }),
/* 104 */
/***/ (function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ }),
/* 105 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;
	
	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var secure_service_1 = __webpack_require__(86);
	var visa_service_1 = __webpack_require__(102);
	var tools_1 = __webpack_require__(73);
	exports.VisaManagerController = entcore_1.ng.controller('VisaManagerController', ['$scope', '$timeout', '$rootScope', function ($scope, $timeout, $rootScope) {
	        var vm = _this;
	        vm.items = [{ name: 'teacher1' }, { name: 'teacher2' }];
	        init();
	        function init() {
	            var getFilterPromise;
	            if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.VISA_ADMIN)) {
	                getFilterPromise = visa_service_1.VisaService.getFilters(entcore_1.model.me.structures[0]);
	            }
	            else if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.VISA_INSPECTOR)) {
	                getFilterPromise = visa_service_1.VisaService.getInspectorFilters(entcore_1.model.me.structures[0], entcore_1.model.me.userId);
	            }
	            getFilterPromise.then(function (filters) {
	                vm.filters = filters;
	                vm.filters.states = [
	                    { key: 'TODO_ONLY', value: entcore_1.idiom.translate('diary.visa.state.todo') },
	                    { key: 'ALL', value: entcore_1.idiom.translate('diary.visa.state.all') },
	                    { key: 'DID_ONLY', value: entcore_1.idiom.translate('diary.visa.state.did') }
	                ];
	                vm.filter = {
	                    state: vm.filters.states[0]
	                };
	            });
	        }
	        vm.listLessonHeight = function () {
	            vm.lessonHeight = ($('.popup-visa-lesson-list .content').innerHeight() -
	                $('.popup-visa-lesson-list .forheigth > h1').outerHeight() -
	                $($('.popup-visa-lesson-list .forheigth > div')[0]).outerHeight() -
	                50) + 'px';
	            setTimeout(function () {
	                vm.listLessonHeight();
	                $scope.$apply();
	            }, 500);
	        };
	        vm.searchAvailable = function () {
	            return vm.filter && (vm.filter.teacher || vm.filter.subject || vm.filter.audience);
	        };
	        vm.search = function () {
	            visa_service_1.VisaService.getAgregatedVisas(entcore_1.model.me.structures[0], vm.filter).then(function (result) {
	                vm.agregatedVisa = result;
	            });
	        };
	        vm.selectedContent = function () {
	            if (!vm.agregatedVisa) {
	                return [];
	            }
	            return vm.agregatedVisa.filter(function (e) {
	                return e.selected;
	            });
	        };
	        vm.calcRecapSelected = function () {
	            vm.recap = {
	                nbLesson: vm.getNbLesson(vm.currentAgregVisas),
	                nbTeacher: vm.getNbProps(vm.currentAgregVisas, "teacherId"),
	                nbSubject: vm.getNbProps(vm.currentAgregVisas, "subjectId"),
	                nbAudience: vm.getNbProps(vm.currentAgregVisas, "audienceId")
	            };
	        };
	        vm.getNbLesson = function (agregVisas) {
	            return agregVisas.reduce(function (acc, e) {
	                return acc +
	                    e.nbNotVised + (e.visas[0] ? e.visas[0].nbDirty : 0);
	            }, 0);
	        };
	        vm.getNbProps = function (agregVisas, props) {
	            var map = {};
	            agregVisas.map(function (e) {
	                map[e[props]] = true;
	            });
	            return Object.keys(map).length;
	        };
	        vm.createLightVisas = function (agregVisas) {
	            return entcore_1._.map(agregVisas, function (e) {
	                var result = entcore_1.angular.copy(e);
	                delete result.visas;
	                return result;
	            });
	        };
	        vm.applyVisa = function (withLock) {
	            applyVisa(vm.currentAgregVisas, withLock);
	        };
	        function applyVisa(agregVisas, lock) {
	            var applyVisa = {
	                comment: vm.comment,
	                resultVisaList: vm.createLightVisas(agregVisas),
	                ownerId: entcore_1.model.me.userId,
	                ownerName: entcore_1.model.me.username,
	                ownerType: secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.VISA_ADMIN) ? 'director' : 'inspector'
	            };
	            visa_service_1.VisaService.applyVisa(applyVisa, lock).then(function () {
	                vm.closeAllPopup();
	                vm.search();
	                //notify.info(lang.translate('progression.progression.saved'));
	                entcore_1.notify.info(entcore_1.idiom.translate("diary.visa.notify.saved"));
	            });
	        }
	        vm.closeAllPopup = function () {
	            $rootScope.$broadcast('closeallpop');
	        };
	        vm.showDetailVisa = function (agregVisa) {
	            vm.currentAgregVisas = [agregVisa];
	            visa_service_1.VisaService.getLessonForVisa(vm.currentAgregVisas).then(function (lessons) {
	                vm.selectedLessons = lessons;
	            });
	        };
	        vm.initSelectContent = function () {
	            vm.currentAgregVisas = vm.selectedContent();
	        };
	        vm.showSelected = function () {
	            vm.currentAgregVisas = vm.selectedContent();
	            visa_service_1.VisaService.getLessonForVisa(vm.createLightVisas(vm.currentAgregVisas)).then(function (lessons) {
	                vm.selectedLessons = lessons;
	            });
	        };
	        vm.checkAll = function (checkAll) {
	            vm.agregatedVisa.map(function (e) {
	                if ((e.nbNotVised + (e.visas[0] ? e.visas[0].nbDirty : 0)) > 0) {
	                    e.selected = checkAll;
	                }
	            });
	        };
	        vm.closepopup = function () {
	            $rootScope.$broadcast('closeallpop');
	        };
	        vm.pdf = function () {
	            visa_service_1.VisaService.getPdfForVisa(vm.createLightVisas(vm.currentAgregVisas));
	        };
	    }
	]);


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var _this = this;
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var history_service_1 = __webpack_require__(108);
	exports.HistoryController = entcore_1.ng.controller('HistoryController', ['$scope', function ($scope) {
	        var vm = _this;
	        init();
	        function init() {
	            history_service_1.HistoryService.getFilters(entcore_1.model.me.structures[0]).then(function (histories) {
	                vm.yearHistories = histories;
	            });
	        }
	        vm.loadpdf = function (key, value) {
	            var teacherId, audienceId;
	            if (vm.toogle === 'teacher') {
	                teacherId = key;
	            }
	            else {
	                audienceId = key;
	                if (entcore_1.model.isUserTeacher()) {
	                    teacherId = entcore_1.model.me.userId;
	                }
	            }
	            history_service_1.HistoryService.getPdfArchive(vm.selectedYearItem.yearLabel, vm.toogle, teacherId, audienceId, value);
	        };
	    }]);


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var FileSaver = __webpack_require__(103);
	/*
	 * History service as class
	 * used to manipulate History model
	 */
	var HistoryService = (function () {
	    function HistoryService() {
	    }
	    HistoryService.getFilters = function (structureId) {
	        var url = "/diary/history/filters";
	        return entcore_1.$http({
	            method: 'GET',
	            url: url,
	            params: {
	                structureId: structureId
	            }
	        }).then(function (result) {
	            return result.data;
	        });
	    };
	    HistoryService.getPdfArchive = function (yearLabel, type, teacherId, audienceId, value) {
	        var url = "/diary/history/pdf";
	        var params = {
	            yearLabel: yearLabel
	        };
	        params.teacherId = teacherId;
	        params.audienceId = audienceId;
	        entcore_1.$http({
	            url: url,
	            method: "GET",
	            params: params,
	            responseType: 'arraybuffer'
	        }).success(function (data, status, headers, config) {
	            var blob = new Blob([data], { type: " application/pdf" });
	            var date = entcore_1.moment().format("YYYY-MM-DD_HH-mm-ss");
	            var fileName = "CDT-archive_" + value + "_" + yearLabel + ".pdf";
	            FileSaver.saveAs(blob, fileName);
	        }).error(function (data, status, headers, config) {
	            //upload failed
	        });
	    };
	    return HistoryService;
	}());
	exports.HistoryService = HistoryService;


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(110));
	__export(__webpack_require__(111));
	__export(__webpack_require__(112));
	__export(__webpack_require__(113));
	__export(__webpack_require__(114));
	__export(__webpack_require__(115));
	__export(__webpack_require__(116));
	__export(__webpack_require__(117));
	__export(__webpack_require__(118));
	__export(__webpack_require__(119));
	__export(__webpack_require__(120));
	__export(__webpack_require__(121));
	__export(__webpack_require__(122));
	__export(__webpack_require__(123));
	__export(__webpack_require__(124));
	__export(__webpack_require__(125));
	__export(__webpack_require__(126)); /*
	export * from './common/calendar/calendar.directive';
	export * from './common/calendar/schedule-item.directive';
	export * from './common/sortable-list/diary-sortable-list.directive';
	export * from './common/tooltip.directive';*/


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.calendarDailyEvents = entcore_1.ng.directive('calendarDailyEvents', function () {
	    return {
	        scope: {
	            ngModel: '=',
	            bShowCalendar: '=',
	            bShowHomeworks: '=',
	            bShowHomeworksMinified: '='
	        },
	        restrict: 'E',
	        templateUrl: '/diary/public/template/directives/calendar-daily-events/calendar-daily-events.template.html',
	        controller: 'CalendarDailyEventsController',
	        link: function (scope, element, attributes) {
	            $('body').on('click', function (e) {
	                if (e.target !== element[0] && element.find(e.target).length === 0) {
	                    entcore_1.model.calendar.days.forEach(function (day) {
	                        day.openDailyEvents = false;
	                    });
	                    scope.$apply();
	                }
	            });
	        }
	    };
	});


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var zIndex = 100000;
	exports.confirmPopup = entcore_1.ng.directive('confirmPopup', function ($compile) {
	    return {
	        restrict: 'A',
	        /*controller : function($scope){
	          setTimeout(()=>{
	            $scope.apply
	          });
	        },*/
	        link: function (scope, element, attr) {
	            zIndex++;
	            var clickAction = attr.confirmedClick;
	            var html = "\n                     <lightbox show=\"display\" class=\"" + scope.confirmClass + "\" on-close=\"remove()\" style=\"z-index : " + zIndex + "\" >\n                       <div class=\"row\" ng-if=\"!confirmTemplate\">\n                          <h2> [[msg]] </h2>\n                           <div class=\"row\">\n                               <button class=\"right-magnet \" ng-click=\"confirm()\">[[yes]]</button>\n                               <input type=\"button\" class=\"right-magnet cancel\" i18n-value=\"[[cancel]]\" ng-click=\"remove()\"  />\n                           </div>\n                       </div>\n                       <div class=\"row\" ng-if=\"confirmTemplate\">\n                          <div ng-include=\"confirmTemplate\">\n                          </div>\n                       </div>\n                     </lightbox>\n                     ";
	            var lightbox;
	            element.bind('click', function (event) {
	                scope.msg = attr.confirmClick || "Etes vous sur?";
	                scope.yes = attr.confirmYes || "Ok";
	                scope.confirmClass = attr.confirmClass || "";
	                scope.confirmTemplate = attr.confirmTemplate;
	                scope.cancel = attr.confirmCancel || "Annuler";
	                scope.display = true;
	                lightbox = $compile(html)(scope);
	                $('body').append(lightbox);
	                lightbox.addClass(scope.confirmClass);
	                scope.$apply();
	            });
	            scope.$on('closeallpop', function () {
	                scope.remove();
	            });
	            scope.remove = function () {
	                scope.display = false;
	                if (lightbox) {
	                    lightbox.remove();
	                }
	            };
	            scope.confirm = function () {
	                scope.$eval(clickAction);
	                scope.remove();
	            };
	        }
	    };
	});


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.diaryDropDown = entcore_1.ng.directive('diaryDropDown', function () {
	    return { restrict: "E",
	        templateUrl: "diary/public/template/directives/diary-drop-down/diary-drop-down.template.html",
	        scope: {
	            placeholder: "@",
	            list: "=",
	            selected: "=",
	            property: "@",
	            nullable: "="
	        },
	        controller: function ($scope) {
	            $scope.selectItem = function (item) {
	                if ($scope.list) {
	                    $scope.list.map(function (e) {
	                        e.selected = false;
	                    });
	                    if (item) {
	                        item.selected = true;
	                    }
	                    $scope.selected = item;
	                    $scope.listVisible = false;
	                }
	            };
	        },
	        link: function (scope, element, attr) {
	            $(document).bind('click', function (event) {
	                var isClickedElementChildOfPopup = element
	                    .find(event.target)
	                    .length > 0;
	                if (isClickedElementChildOfPopup)
	                    return;
	                scope.$apply(function () {
	                    scope.listVisible = false;
	                });
	            });
	        }
	    };
	});


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(47);
	exports.entDropdown = entcore_1.ng.directive('entDropdown', function () {
	    return {
	        restrict: "E",
	        templateUrl: "diary/public/template/ent-dropdown.html",
	        scope: {
	            placeholder: "@",
	            list: "=",
	            selected: "=",
	            property: "@",
	            school: "=",
	            refreshFunc: "&",
	            loadPreviousFunc: "&",
	            lesson: "=",
	            homework: "="
	        },
	        link: function (scope, element, attrs) {
	            scope.listVisible = false;
	            scope.isPlaceholder = true;
	            scope.searchPerformed = false;
	            scope.otherAudiences = [];
	            scope.translated_placeholder = entcore_1.idiom.translate(scope.placeholder);
	            scope.select = function (audience) {
	                scope.isPlaceholder = false;
	                scope.selected = audience;
	                scope.listVisible = false;
	            };
	            scope.isSelected = function (audience) {
	                return scope.selected !== undefined && scope.selected != null && audience[scope.property] === scope.selected[scope.property];
	            };
	            scope.show = function () {
	                scope.listVisible = true;
	            };
	            scope.searchAudiences = function (cbe) {
	                axios_1.default.get('diary/classes/list/' + scope.school)
	                    .then(function (res) {
	                    var structureData = res.data;
	                    scope.otherAudiences = entcore_1._.map(structureData, function (data) {
	                        var audience = {};
	                        audience.structureId = scope.school;
	                        audience.type = 'class';
	                        audience.typeLabel = (data.className === 'class') ? entcore_1.idiom.translate('diary.audience.class') : entcore_1.idiom.translate('diary.audience.group');
	                        audience.id = data.classId;
	                        audience.name = data.className;
	                        return audience;
	                    });
	                    scope.otherAudiences = entcore_1._.reject(scope.otherAudiences, function (audience) {
	                        return entcore_1._.contains(entcore_1._.pluck(scope.list, 'name'), audience.name);
	                    });
	                    scope.searchPerformed = true;
	                    scope.listVisible = true;
	                    scope.$apply();
	                }).catch(function (error) {
	                    if (typeof cbe === 'function') {
	                        cbe(entcore_1.model.parseError(error));
	                    }
	                });
	            };
	            scope.$watch("selected", function (value) {
	                scope.isPlaceholder = true;
	                if (scope.selected !== null && scope.selected !== undefined) {
	                    scope.isPlaceholder = scope.selected[scope.property] === undefined;
	                    scope.display = scope.selected[scope.property];
	                    if (scope.lesson && scope.lesson.audience && scope.lesson.audience.id && scope.lesson.endTime) {
	                        if (scope.lesson.homeworks.all.length > 0) {
	                            scope.$parent.refreshHomeworkLoads(scope.lesson);
	                        }
	                        scope.lesson.previousLessonsLoaded = false;
	                        //scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
	                    }
	                    if (scope.homework && scope.homework.audience) {
	                        scope.$parent.showHomeworksLoad(scope.homework, null, null);
	                    }
	                }
	            });
	            function handler(event) {
	                var isClickedElementChildOfPopup = element
	                    .find(event.target)
	                    .length > 0;
	                if (isClickedElementChildOfPopup)
	                    return;
	                scope.$apply(function () {
	                    scope.listVisible = false;
	                });
	            }
	            $(document).bind('click', handler);
	            //free on detraoy element & handlers
	            scope.$on("$destroy", function () {
	                $(document).unbind('click', handler);
	            });
	        }
	    };
	});


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.itemCalendar = entcore_1.ng.directive('itemCalendar', function () {
	    return {
	        restrict: 'E',
	        templateUrl: '/diary/public/template/directives/item-calendar/item-calendar.template.html'
	    };
	});


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var visa_service_1 = __webpack_require__(102);
	var secure_service_1 = __webpack_require__(86);
	var tools_1 = __webpack_require__(73);
	exports.diaryMultiCalendarFilter = entcore_1.ng.directive('diaryMultiCalendarFilter', function () {
	    return {
	        restrict: "E",
	        templateUrl: "/diary/public/template/directives/diary-multi-calendar-filter/diary-multi-calendar-filter.template.html",
	        scope: {
	            structure: '=',
	            audience: '=',
	            teacher: '='
	        },
	        controller: function ($scope) {
	            var promiseFilter;
	            $scope.RIGHTS = tools_1.CONSTANTS.RIGHTS;
	            $scope.filters = {};
	            $scope.getFilters = function (structureId) {
	                if (!promiseFilter) {
	                    if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.VISA_ADMIN)) {
	                        promiseFilter = visa_service_1.VisaService.getFilters(structureId);
	                    }
	                    else if (secure_service_1.SecureService.hasRight(tools_1.CONSTANTS.RIGHTS.VISA_INSPECTOR)) {
	                        promiseFilter = visa_service_1.VisaService.getInspectorFilters(structureId, entcore_1.model.me.userId);
	                    }
	                }
	                if (promiseFilter) {
	                    promiseFilter.then(function (filters) {
	                        $scope.filters = filters;
	                    });
	                }
	            };
	            init();
	            function init() {
	                $scope.$watch("audience", function (n, o) {
	                    if (n) {
	                        $scope.teacher = undefined;
	                    }
	                });
	                $scope.$watch("teacher", function (n, o) {
	                    if (n) {
	                        $scope.audience = undefined;
	                    }
	                });
	                $scope.$watch("structure", function (n, o) {
	                    if (n !== o && n) {
	                        $scope.getFilters(n.id);
	                    }
	                });
	                if ($scope.structure) {
	                    $scope.getFilters($scope.structure.id);
	                }
	            }
	        }
	    };
	});


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.onFinishRender = entcore_1.ng.directive('onFinishRender', function ($timeout) {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attr) {
	            if (scope.$last === true) {
	                $timeout(function () {
	                    scope.$evalAsync(attr.onFinishRender);
	                });
	            }
	        }
	    };
	});


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.rightPanel = entcore_1.ng.directive('rightPanel', function () {
	    return {
	        restrict: "E",
	        templateUrl: "/diary/public/template/progression/right-panel/right-panel.html",
	        scope: {
	            label: '@',
	            contentUrl: '='
	        },
	        controller: function ($scope, $rootScope) {
	            $rootScope.currentRightPanelVisible = undefined;
	            var id = Date.now();
	            var vm = this;
	            $scope.panelVisible = false;
	            // $('.mainDiaryContainer').width('84%');
	            //$('.quick-search').width('16%');
	            $scope.$watch(function () {
	                return $rootScope.currentRightPanelVisible;
	            }, function (n) {
	                $scope.currentRightPanelVisible = n;
	            });
	            $scope.toggle = function (show) {
	                if (show) {
	                    $rootScope.currentRightPanelVisible = show;
	                }
	                else {
	                    $rootScope.currentRightPanelVisible = undefined;
	                }
	            };
	        }
	    };
	});


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.searchDropDown = entcore_1.ng.directive('searchDropDown', function () {
	    return {
	        restrict: "E",
	        templateUrl: "/diary/public/template/directives/search-drop-down/search-drop-down.template.html",
	        scope: {
	            items: '=',
	            showExpression: '@',
	            selectedItem: '=',
	            placeHolder: '@',
	            freeField: '='
	        },
	        controller: function ($scope, $sce, $timeout) {
	            $scope.showDropDown = false;
	            if (!$scope.showExpression) {
	                $scope.showExpression = 'item';
	            }
	            $scope.$watch('items', init);
	            $scope.$watch('searchFilter', init);
	            function init() {
	                if (!$scope.items) {
	                    return;
	                }
	                $scope.itemsToShow = $scope.items.map(function (item) {
	                    var result = "";
	                    var value = eval($scope.showExpression);
	                    var hightlightedText = highlight(value, $scope.searchFilter);
	                    return {
	                        text: value,
	                        hightlightedText: hightlightedText,
	                        item: item
	                    };
	                });
	                $scope.itemsToShow = $scope.itemsToShow.filter(function (e) {
	                    if (!e.text || !$scope.searchFilter) {
	                        return true;
	                    }
	                    return e.text.toLowerCase().indexOf($scope.searchFilter.toLowerCase()) > -1;
	                });
	            }
	            function highlight(text, phrase) {
	                if (phrase)
	                    text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
	                return text;
	            }
	            $scope.eraseSelected = function ($event) {
	                $scope.selectedItem = undefined;
	                entcore_1.angular.element($event.target).parent().parent().find('input')[0].focus();
	            };
	            $scope.selectItem = function (option) {
	                $scope.searchFilter = undefined;
	                $scope.selectedItem = option;
	                $scope.showDropDown = false;
	            };
	            $scope.blur = function () {
	                $timeout(function () {
	                    $scope.showDropDown = false;
	                    $scope.searchFilter = undefined;
	                });
	            };
	            $scope.enter = function (keyEvent) {
	                if (keyEvent.which === 13) {
	                    if (!$scope.searchFilter) {
	                        return;
	                    }
	                    var item = $scope.itemsToShow.find(function (e) {
	                        return e.text.toLowerCase() === $scope.searchFilter.toLowerCase();
	                    });
	                    if (item) {
	                        $scope.selectItem(item);
	                    }
	                }
	            };
	            $scope.change = function () {
	                $scope.showDropDown = $scope.searchFilter.length > 0;
	                $scope.selectedItem = undefined;
	            };
	        }
	    };
	});


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var secure_service_1 = __webpack_require__(86);
	exports.secure = entcore_1.ng.directive('secure', function () {
	    return {
	        restrict: "A",
	        link: function (scope, elem, attrs) {
	            if (!secure_service_1.SecureService.hasRight(attrs.secure)) {
	                elem[0].remove();
	            }
	        },
	    };
	});


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.structureDropDown = entcore_1.ng.directive('structureDropDown', function () {
	    return {
	        restrict: "E",
	        template: "\n                <diary-drop-down\n                    ng-if=\"!(hideIfSolo && structureList.length === 1)\"\n                    placeholder=\"select.structure\"\n                    list=\"structureList\"\n                    selected=\"structure\"\n                    nullable=\"false\"\n                    property=\"name\">\n                </diary-drop-down>\n                ",
	        scope: {
	            structure: "=",
	            hideIfSolo: "=",
	            isHidden: "="
	        },
	        controller: function ($scope) {
	            $scope.structureList = [];
	            var i = 0;
	            entcore_1.model.me.structures.forEach(function (structure) {
	                $scope.structureList.push({
	                    id: structure,
	                    name: entcore_1.model.me.structureNames[i++],
	                });
	            });
	            if (!$scope.structure) {
	                $scope.structure = $scope.structureList[0];
	            }
	            $scope.isHidden = ($scope.hideIfSolo && $scope.structureList.length === 1);
	        },
	    };
	});


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var tools_1 = __webpack_require__(73);
	var Subject_model_1 = __webpack_require__(77);
	exports.subjectPicker = entcore_1.ng.directive('subjectPicker', function () {
	    return {
	        scope: {
	            ngModel: '=',
	            ngChange: '&',
	            lesson: "=",
	            homework: "="
	        },
	        transclude: true,
	        replace: true,
	        restrict: 'E',
	        templateUrl: 'diary/public/template/subject-picker.html',
	        link: function (scope, element) {
	            var sortBySubjectLabel = function (a, b) {
	                if (a.label > b.label)
	                    return 1;
	                if (a.label < b.label)
	                    return -1;
	                return 0;
	            };
	            scope.search = null;
	            scope.displaySearch = false;
	            // init suggested subjects with all subjects
	            scope.suggestedSubjects = [];
	            // custom subject collection
	            // containing base subject collection + current ones being created by used
	            var subjects = [];
	            /*model.subjects.all.forEach(function(subject) {
	                subjects.push(subject);
	            });
	
	            subjects.sort(sortBySubjectLabel);
	            */
	            var setNewSubject = function (subjectLabel) {
	                if (!subjectLabel) {
	                    return;
	                }
	                subjectLabel = subjectLabel.trim();
	                var existingSubject = null;
	                for (var i = 0; i < subjects.length; i++) {
	                    if (tools_1.sansAccent(subjects[i].label).toUpperCase() === tools_1.sansAccent(subjectLabel).toUpperCase()) {
	                        existingSubject = subjects[i];
	                    }
	                }
	                if (!existingSubject) {
	                    scope.ngModel = new Subject_model_1.Subject();
	                    scope.ngModel.label = subjectLabel;
	                    scope.ngModel.id = null;
	                    if (scope.lesson && scope.lesson.audience) {
	                        scope.ngModel.school_id = scope.lesson.audience.structureId;
	                    }
	                    else if (scope.homework && scope.homework.audience) {
	                        scope.ngModel.school_id = scope.homework.audience.structureId;
	                    }
	                    if (!scope.ngModel.school_id) {
	                        scope.ngModel.school_id = entcore_1.model.me.structures[0];
	                    }
	                    //scope.ngModel.school_id = scope.lesson ? scope.lesson.audience.structureId : scope.homework && scope.homework.audience ?scope.homework.audience.structureId : undefined;
	                    scope.ngModel.teacher_id = entcore_1.model.me.userId;
	                    subjects.push(scope.ngModel);
	                }
	                else {
	                    scope.ngModel = existingSubject;
	                }
	            };
	            scope.$watch('lesson.audience.structureId', function () {
	                if (scope.ngModel && scope.lesson && scope.lesson.audience && scope.lesson.audience.structureId) {
	                    scope.ngModel.school_id = scope.lesson ? scope.lesson.audience.structureId : scope.homework.audience.structureId;
	                }
	            });
	            var initSuggestedSubjects = function () {
	                scope.suggestedSubjects = [];
	                subjects = [];
	                entcore_1.model.subjects.all.forEach(function (subject) {
	                    subjects.push(subject);
	                });
	                subjects.sort(sortBySubjectLabel);
	                for (var i = 0; i < subjects.length; i++) {
	                    scope.suggestedSubjects.push(subjects[i]);
	                }
	            };
	            scope.$watch(function () {
	                return entcore_1.model.subjects ? entcore_1.model.subjects.length() : undefined;
	            }, function () {
	                initSuggestedSubjects();
	            });
	            scope.goToSearchMode = function () {
	                scope.displaySearch = true;
	                scope.search = '';
	                initSuggestedSubjects();
	            };
	            scope.isSelected = function (subject) {
	                if (scope.ngModel && subject) {
	                    if (scope.ngModel.id) {
	                        return scope.ngModel.id === subject.id;
	                    }
	                    else {
	                        return tools_1.sansAccent(scope.ngModel.label) === tools_1.sansAccent(subject.label);
	                    }
	                }
	                else {
	                    return false;
	                }
	            };
	            /**
	             * Search subject from input by user
	             */
	            scope.searchSubject = function (event) {
	                if (event.type === 'keydown' && event.keyCode === 9) {
	                    scope.displaySearch = false;
	                    if (scope.search != '') {
	                        setNewSubject(scope.search);
	                    }
	                    return;
	                }
	                scope.search = scope.search.trim();
	                if (scope.search != '') {
	                    var matchingSubjects = entcore_1.model.findSubjectsByLabel(scope.search);
	                    scope.suggestedSubjects = new Array();
	                    for (var i = 0; i < matchingSubjects.length; i++) {
	                        scope.suggestedSubjects.push(matchingSubjects[i]);
	                    }
	                }
	                else {
	                    initSuggestedSubjects();
	                }
	            };
	            scope.selectSubject = function (subject) {
	                scope.ngModel = subject;
	                scope.displaySearch = false;
	                if (scope.lesson) {
	                    scope.lesson.previousLessonsLoaded = false;
	                }
	            };
	            $(element.context.ownerDocument).click(function (event) {
	                if (!$(event.target).is("item-suggest") && !$(event.target).is("#remove-subject") && !$(event.target).is("#input-subject")) {
	                    scope.displaySearch = false;
	                    // new subject that will need to be created on lesson/homework save
	                    if (scope.suggestedSubjects.length === 0) {
	                        setNewSubject(scope.search);
	                    }
	                    scope.$apply();
	                }
	            });
	            // function handler(event) {
	            //         var isClickedElementChildOfPopup = element
	            //                 .find(event.target)
	            //                 .length > 0;
	            //
	            //         if (isClickedElementChildOfPopup)
	            //                 return;
	            //
	            //         scope.$apply(function() {
	            //             scope.displaySearch = false;
	            //             if (scope.suggestedSubjects.length === 0) {
	            //                 setNewSubject(scope.search);
	            //             }
	            //         });
	            // }
	            // $(document).bind('click',handler );
	            //
	            // //free on detraoy element & handlers
	            // scope.$on("$destroy", function() {
	            //         $(document).unbind('click',handler );
	            // });
	        }
	    };
	});


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var Homework_model_1 = __webpack_require__(6);
	var Lesson_model_1 = __webpack_require__(79);
	var audiences_service_1 = __webpack_require__(87);
	exports.diaryTimeslotItem = entcore_1.ng.directive('diaryTimeslotItem', function ($rootScope) {
	    return {
	        restrict: "A",
	        scope: false,
	        link: function (scope, element) {
	            var timeslot = element;
	            var dragCounter = 0;
	            timeslot.on('dragover', function ($event) {
	                $event.preventDefault();
	            });
	            timeslot.bind('dragenter', onenter);
	            function onenter(event) {
	                dragCounter++;
	                timeslot.addClass("dragin");
	                //event.preventDefault();
	                return false;
	            }
	            timeslot.bind('dragleave', onleave);
	            function onleave(event) {
	                dragCounter--;
	                if (dragCounter === 0) {
	                    timeslot.removeClass("dragin");
	                }
	            }
	            function extractBeginEnd() {
	                var begin = entcore_1.moment().startOf('year').add(scope.day.index - 1, 'd');
	                var end = entcore_1.moment(begin);
	                begin = begin.add(scope.timeslot.start, 'h');
	                end = end.add(scope.timeslot.end, 'h');
	                return {
	                    startDate: begin,
	                    endDate: end
	                };
	            }
	            timeslot.on('drop', function ($event) {
	                timeslot.removeClass("dragin");
	                var scheduleItem = scope.$parent.item;
	                $event.preventDefault();
	                timeslot.css('background-color', '');
	                // duplicate dragged lesson
	                var pedagogicItemOfTheDay = JSON.parse($event.originalEvent.dataTransfer.getData("application/json"));
	                if (pedagogicItemOfTheDay.type_item !== 'lesson' && pedagogicItemOfTheDay.type_item !== 'progression' && pedagogicItemOfTheDay.type_item !== 'homework') {
	                    return;
	                }
	                if (pedagogicItemOfTheDay.type_item === 'homework') {
	                    initHomeworkFromCalendar(pedagogicItemOfTheDay);
	                    return;
	                }
	                var newLesson = new Lesson_model_1.Lesson();
	                newLesson.id = pedagogicItemOfTheDay.id;
	                // do not drop if item type is not a lesson
	                if (pedagogicItemOfTheDay.type_item === 'progression') {
	                    initLessonFromProgression(newLesson, pedagogicItemOfTheDay);
	                    return;
	                }
	                // do not drop if item type is not a lesson
	                if (pedagogicItemOfTheDay.type_item === 'lesson') {
	                    initLessonFromPreviousLesson(newLesson, scheduleItem);
	                    return;
	                }
	            });
	            function initLessonFromPreviousLesson(newLesson, scheduleItem) {
	                var timeslotsPerDay = $('.days .timeslot').length / 7;
	                var index = scope.$parent.$index * timeslotsPerDay + scope.$index;
	                var newLessonDayOfWeek = Math.floor(index / timeslotsPerDay) + 1;
	                var newLessonStartTime = entcore_1.model.startOfDay + (index % timeslotsPerDay);
	                var newLessonEndTime = newLessonStartTime + 1;
	                newLesson.load(true, function () {
	                    // will force new lesson to be created in DB
	                    newLesson.id = null;
	                    // startTime and end format from db is "HH:MM:SS" as text type
	                    // for lesson save startTime need to be moment time type with date
	                    newLesson.date = entcore_1.moment(newLesson.date);
	                    newLesson.startTime = entcore_1.moment(newLesson.date.format('YYYY-MM-DD') + ' ' + newLesson.startTime);
	                    newLesson.startTime.hour(newLessonStartTime);
	                    newLesson.startTime.minute(0);
	                    newLesson.startTime.day(newLessonDayOfWeek);
	                    newLesson.endTime = entcore_1.moment(newLesson.date.format('YYYY-MM-DD') + ' ' + newLesson.endTime);
	                    newLesson.endTime.hour(newLessonEndTime);
	                    newLesson.endTime.minute(0);
	                    newLesson.endTime.day(newLessonDayOfWeek);
	                    newLesson.endTime.week(entcore_1.model.calendar.week);
	                    newLesson.date.day(newLessonDayOfWeek);
	                    newLesson.date.week(entcore_1.model.calendar.week);
	                    newLesson.state = 'draft';
	                    if (newLesson.homeworks && newLesson.homeworks.all.length > 0) {
	                        newLesson.homeworks.all = entcore_1._.map(newLesson.homeworks.all, homeworkCloneMap); /*(h)=>{
	                                    var homework = new Homework();
	
	                                    homework.dueDate = h.dueDate;
	                                    homework.date = h.date;
	                                    homework.title = h.title;
	                                    homework.description = h.description;
	                                    homework.color = h.color;
	                                    homework.state = 'draft';
	                                    homework.type = _.findWhere(model.homeworkTypes.all,{'label' : h.type.label} );
	                                    homework.subject = _.findWhere(model.subjects.all,{'label' : h.subject.label} );
	                                    homework.expanded = true;
	                                    return homework;
	                                });*/
	                    }
	                    if (scheduleItem) {
	                        newLesson.date = entcore_1.moment(scheduleItem.startDate);
	                        newLesson.startTime = entcore_1.moment(scheduleItem.startDate);
	                        newLesson.startMoment = entcore_1.moment(scheduleItem.startDate);
	                        newLesson.endTime = entcore_1.moment(scheduleItem.endDate);
	                        newLesson.endMoment = entcore_1.moment(scheduleItem.endDate);
	                        audiences_service_1.AudienceService.getAudiencesAsMap(entcore_1.model.me.structures).then(function (audienceMap) {
	                            //get audience
	                            if (scheduleItem.data && scheduleItem.data.classes && scheduleItem.data.classes.length > 0) {
	                                newLesson.audience = audienceMap[scheduleItem.data.classes[0]];
	                            }
	                            //get room
	                            if (scheduleItem.data && scheduleItem.data.roomLabels && scheduleItem.data.roomLabels.length > 0) {
	                                newLesson.room = scheduleItem.data.roomLabels[0];
	                            }
	                        });
	                        entcore_1.model.newLesson = newLesson;
	                        window.location.href = window.location.host + '/diary#/createLessonView/timeFromCalendar';
	                    }
	                    else {
	                        newLesson.save(function (data) {
	                            window.location.href = window.location.host + '/diary#/editLessonView/' + newLesson.id;
	                        }, function (error) {
	                            console.error(error);
	                        });
	                    }
	                }, function (error) {
	                    console.error(error);
	                });
	            }
	            function homeworkCloneMap(h) {
	                var homeworkClone = new Homework_model_1.Homework();
	                homeworkClone.dueDate = h.dueDate;
	                homeworkClone.date = h.date;
	                homeworkClone.type = entcore_1._.findWhere(entcore_1.model.homeworkTypes.all, { 'label': h.type.label });
	                homeworkClone.subject = entcore_1._.findWhere(entcore_1.model.subjects.all, { 'label': h.subject.label });
	                homeworkClone.title = h.title;
	                homeworkClone.description = h.description;
	                homeworkClone.color = h.color;
	                homeworkClone.state = 'draft';
	                homeworkClone.expanded = true;
	                return homeworkClone;
	            }
	            function initLessonFromProgression(lesson, pedagogicItemOfTheDay) {
	                lesson.id = null;
	                // startTime and end format from db is "HH:MM:SS" as text type
	                // for lesson save startTime need to be moment time type with date
	                lesson.title = pedagogicItemOfTheDay.title;
	                lesson.description = pedagogicItemOfTheDay.description;
	                lesson.color = pedagogicItemOfTheDay.color;
	                lesson.subject = pedagogicItemOfTheDay.subject;
	                lesson.annotations = pedagogicItemOfTheDay.annotations;
	                lesson.type_item = 'progression';
	                lesson.homeworks = new entcore_1.Collection();
	                if (pedagogicItemOfTheDay.homeworks && pedagogicItemOfTheDay.homeworks.length > 0) {
	                    lesson.homeworks.all = entcore_1._.map(pedagogicItemOfTheDay.homeworks, homeworkCloneMap); /*(h)=>{
	                                var homeworkClone = new Homework();
	                                homeworkClone.dueDate = h.dueDate;
	                                homeworkClone.date = h.date;
	                                homeworkClone.type = _.findWhere(model.homeworkTypes.all,{'label' : h.type.label} );
	                                homeworkClone.subject = _.findWhere(model.subjects.all,{'label' : h.subject.label} );
	                                homeworkClone.title = h.title;
	                                homeworkClone.description = h.description;
	                                homeworkClone.color = h.color;
	                                homeworkClone.state = 'draft';
	                                homeworkClone.expanded = true;
	                                return homeworkClone;
	                            });*/
	                }
	                var timeslotDates = extractBeginEnd();
	                lesson.date = entcore_1.moment(timeslotDates.startDate);
	                lesson.startTime = entcore_1.moment(timeslotDates.startDate);
	                lesson.startMoment = entcore_1.moment(timeslotDates.startDate);
	                lesson.endTime = entcore_1.moment(timeslotDates.endDate);
	                lesson.endMoment = entcore_1.moment(timeslotDates.endDate);
	                entcore_1.model.newLesson = lesson;
	                window.location.href = window.location.host + '/diary#/createLessonView/timeFromCalendar';
	            }
	            function initHomeworkFromCalendar(pedagogicItemOfTheDay) {
	                var timeslotDates = extractBeginEnd();
	                var homework = new Homework_model_1.Homework();
	                homework.dueDate = entcore_1.moment(timeslotDates.startDate);
	                homework.date = entcore_1.moment(timeslotDates.startDate);
	                homework.type = entcore_1._.findWhere(entcore_1.model.homeworkTypes.all, { 'label': pedagogicItemOfTheDay.type_homework });
	                homework.subject = entcore_1._.findWhere(entcore_1.model.subjects.all, { 'label': pedagogicItemOfTheDay.subject });
	                homework.audience = entcore_1._.findWhere(entcore_1.model.audiences.all, { 'name': pedagogicItemOfTheDay.audience });
	                homework.title = pedagogicItemOfTheDay.title;
	                homework.description = pedagogicItemOfTheDay.description;
	                homework.color = pedagogicItemOfTheDay.color;
	                homework.state = 'draft';
	                homework.save(function (data) {
	                    var homeworkBd = entcore_1.model.homeworks.findWhere({
	                        id: parseInt(homework.id)
	                    });
	                    entcore_1.model.homeworks.remove(homeworkBd);
	                    window.location.href = window.location.host + '/diary#/editHomeworkView/' + homework.id;
	                }, function (error) {
	                    console.error(error);
	                });
	            }
	        }
	    };
	});


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var index_1 = __webpack_require__(3);
	var pedagogic_item_service_1 = __webpack_require__(96);
	exports.quickSearch = entcore_1.ng.directive('quickSearch', function () {
	    return {
	        restrict: "E",
	        templateUrl: "/diary/public/template/directives/quick-search/quick-search.html",
	        scope: {
	            /**
	             * Item type 'lesson' or 'homework'
	             */
	            itemType: "@"
	        },
	        link: function (scope, element, attrs, location) {
	        },
	        controller: function ($scope, $rootScope) {
	            var vm = this;
	            var id = Date.now();
	            /**
	             * Number of items displayed by default
	             * @type {number}
	             */
	            var defaultMaxPedagogicItemsDisplayed = 6;
	            $scope.maxPedagogicItemsDisplayed = defaultMaxPedagogicItemsDisplayed;
	            /**
	             * Max pedagofic items step increament
	             * @type {number}
	             */
	            var pedagogicDaysDisplayedStep = defaultMaxPedagogicItemsDisplayed;
	            /**
	             * If true the search if detailled panel is minified else not
	             * (by default minified/not visible)
	             * @type {boolean}
	             */
	            $scope.panelVisible = false;
	            /**
	             * Pedagogic items search results
	             * @type {Array}
	             */
	            $scope.pedagogicItems = [];
	            /**
	             * Last pressed key time
	             * Prevent searching
	             */
	            $scope.lastPressedKeyTime;
	            /**
	             * Pedagogic items of the day displayed.
	             * Max
	             */
	            $scope.quickSearchPedagogicDaysDisplayed = [];
	            /**
	             * Default search time = end of current week
	             */
	            $scope.endDate = entcore_1.moment().endOf('week');
	            /**
	             * Text for searching through label, title, ...
	             * @type {string}
	             */
	            $scope.multiSearch = "";
	            var timeout;
	            /**
	             * Flag indicating it's first search (used for not displaying the 'show more' arrow
	             * @type {boolean}
	             */
	            $scope.isFirstSearch = true;
	            var pedagogicItemDisplayedIdxStart = 0;
	            var pedagogicItemDisplayedIdxEnd = defaultMaxPedagogicItemsDisplayed - 1; // array index starts at 0
	            var isQuickSearchLesson = ($scope.itemType === 'lesson') ? true : false;
	            initQuickSearch();
	            /*
	             * initialisation
	             */
	            function initQuickSearch() {
	                $scope.endDate = entcore_1.moment().endOf('week');
	                $scope.quickSearchPedagogicDays = [];
	                $scope.itemType = isQuickSearchLesson ? 'lesson' : 'homework';
	                $scope.panelLabel = isQuickSearchLesson ? entcore_1.idiom.translate('diary.lessons') : entcore_1.idiom.translate('diary.homeworks');
	            }
	            $scope.$on('rightpanel.open', function (_, rightpanelid) {
	                if (id !== rightpanelid && $scope.panelVisible) {
	                    $scope.setPanelVisible(false, true);
	                }
	                /*else{
	                    if ($scope.panelVisible) {
	                        $('.mainDiaryContainer').width('84%');
	                        $('.quick-search').width('16%');
	                    }
	                }*/
	            });
	            $scope.$watch(function () {
	                return $rootScope.currentRightPanelVisible;
	            }, function (n) {
	                $scope.currentRightPanelVisible = n;
	            });
	            $scope.toogle = function (show) {
	                if (show) {
	                    $rootScope.currentRightPanelVisible = show;
	                    if ($scope.isFirstSearch) {
	                        $scope.quickSearch(true);
	                    }
	                }
	                else {
	                    $rootScope.currentRightPanelVisible = undefined;
	                }
	            };
	            $scope.setPanelVisible = function (isVisible, dontHide) {
	                /*
	                $scope.panelVisible = isVisible;
	                */
	                if ($scope.isFirstSearch) {
	                    $scope.quickSearch(true);
	                }
	                /*
	                // hide the other panel (panel or homework)
	                if ($scope.itemType == 'lesson') {
	                    // tricky way to get the other directive for homeworks
	                    if (isQuickSearchLesson && !dontHide) {
	                        $scope.$parent.$$childTail.panelVisible = false;
	                    }
	                } else if ($scope.itemType == 'homework') {
	                    if (!isQuickSearchLesson && !dontHide) {
	                        $scope.$parent.$$childHead.panelVisible = false;
	                    }
	                }
	
	                // let enough room to display quick search panel maximized
	                if (isVisible) {
	                    $rootScope.$broadcast('rightpanel.open',id);
	                } else {
	                    if (!dontHide){
	                        $('.mainDiaryContainer').width('97%');
	                        $('.quick-search').width('2%');
	                    }
	                }
	                */
	            };
	            /**
	             * By default X pedagogic items are displayed.
	             * This allows to display more items
	             */
	            $scope.quickSearchNextPedagogicDays = function () {
	                if (!$scope.isNextPedagogicDaysDisplayed) {
	                    return;
	                }
	                pedagogicItemDisplayedIdxStart += pedagogicDaysDisplayedStep;
	                pedagogicItemDisplayedIdxEnd += pedagogicDaysDisplayedStep;
	                $scope.maxPedagogicItemsDisplayed = Math.max($scope.maxPedagogicItemsDisplayed, pedagogicItemDisplayedIdxEnd);
	                $scope.quickSearch(false);
	            };
	            /**
	             *
	             */
	            $scope.quickSearchPreviousPedagogicDays = function () {
	                if (!$scope.isPreviousPedagogicDaysDisplayed) {
	                    return;
	                }
	                pedagogicItemDisplayedIdxStart -= pedagogicDaysDisplayedStep;
	                pedagogicItemDisplayedIdxStart = Math.max(0, pedagogicItemDisplayedIdxStart);
	                pedagogicItemDisplayedIdxEnd -= pedagogicDaysDisplayedStep;
	                $scope.quickSearch(false);
	            };
	            /**
	             *  If true will display the orange arrow to display more items
	             *  else not.
	             * @type {boolean}
	             */
	            $scope.isNextPedagogicDaysDisplayed = false;
	            /**
	             * Displays "no results" if true else blank
	             * @type {boolean}
	             */
	            $scope.displayNoResultsText = false;
	            /**
	             * Compute if the button for recent items should be displayed
	             * @returns {boolean}
	             */
	            var isPreviousPedagogicDaysDisplayed = function () {
	                return !$scope.isFirstSearch && 0 < pedagogicItemDisplayedIdxStart && $scope.quickSearchPedagogicDaysDisplayed.length > 0;
	            };
	            /**
	             * Returns true if the "next" arrow button should be displayed meaning
	             * there are other items
	             * @returns {boolean}
	             */
	            var isNextPedagogicDaysDisplayed = function (pedagogicItemCount) {
	                return !$scope.isFirstSearch &&
	                    pedagogicItemDisplayedIdxStart <= pedagogicItemCount &&
	                    $scope.quickSearchPedagogicDaysDisplayed.length > 0 &&
	                    $scope.quickSearchPedagogicDaysDisplayed.length >= pedagogicDaysDisplayedStep;
	            };
	            var performQuickSearch = function () {
	                clearTimeout(timeout); // this way will not run infinitely
	                var params = new index_1.SearchForm(true);
	                params.initForTeacher();
	                params.isQuickSearch = true;
	                params.limit = $scope.maxPedagogicItemsDisplayed + 1; // +1 thingy will help to know if extra items can be displayed
	                var period = entcore_1.moment(entcore_1.model.calendar.dayForWeek).day(1);
	                period.add(-60, 'days').format('YYYY-MM-DD');
	                params.startDate = period.format('YYYY-MM-DD');
	                params.endDate = entcore_1.moment($scope.endDate).add(1, 'days');
	                params.sortOrder = "DESC";
	                if ($scope.itemType == 'lesson') {
	                    params.multiSearchLesson = $scope.multiSearch.trim();
	                }
	                else {
	                    params.multiSearchHomework = $scope.multiSearch.trim();
	                }
	                params.returnType = $scope.itemType;
	                entcore_1.model.pedagogicDaysQuickSearch = [];
	                $scope.quickSearchPedagogicDaysDisplayed.length = 0;
	                $scope.performPedagogicItemSearch(params, entcore_1.model.isUserTeacher());
	            };
	            /*
	             * search pedagogic item
	             */
	            $scope.performPedagogicItemSearch = function (params, isTeacher) {
	                // global quick search panel
	                if (params.isQuickSearch) {
	                    if (params.returnType === 'lesson') {
	                        entcore_1.model.pedagogicDaysQuickSearchLesson = [];
	                    }
	                    else {
	                        entcore_1.model.pedagogicDaysQuickSearchHomework = [];
	                    }
	                }
	                else {
	                    entcore_1.model.pedagogicDays.reset();
	                }
	                // get pedagogicItems
	                return pedagogic_item_service_1.PedagogicItemService.getPedagogicItems(params).then(function (pedagogicItems) {
	                    var days = entcore_1._.groupBy(pedagogicItems, 'day');
	                    var pedagogicDays = [];
	                    var aDayIsSelected = false;
	                    for (var day in days) {
	                        if (days.hasOwnProperty(day)) {
	                            var pedagogicDay = new index_1.PedagogicDay();
	                            pedagogicDay.selected = false;
	                            //TODO is constants
	                            pedagogicDay.dayName = entcore_1.moment(day).format("dddd DD MMMM YYYY");
	                            pedagogicDay.shortName = pedagogicDay.dayName.substring(0, 2);
	                            //TODO is constants
	                            pedagogicDay.shortDate = entcore_1.moment(day).format("DD/MM");
	                            pedagogicDay.pedagogicItemsOfTheDay = days[day];
	                            var countItems = entcore_1._.groupBy(pedagogicDay.pedagogicItemsOfTheDay, 'type_item');
	                            pedagogicDay.nbLessons = countItems.lesson ? countItems.lesson.length : 0;
	                            pedagogicDay.nbHomeworks = countItems.homework ? countItems.homework.length : 0;
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
	                    $scope.isFirstSearch = false;
	                    $scope.quickSearchPedagogicDays = isQuickSearchLesson ? entcore_1.model.pedagogicDaysQuickSearchLesson : entcore_1.model.pedagogicDaysQuickSearchHomework;
	                    $scope.displayNoResultsText = ($scope.quickSearchPedagogicDays.length === 0);
	                    var idxSearchPedagogicItem = 0;
	                    $scope.quickSearchPedagogicDaysDisplayed = [];
	                    // count number of displayed items
	                    $scope.quickSearchPedagogicDays.forEach(function (pedagogicDay) {
	                        pedagogicDay.pedagogicItemsOfTheDay.forEach(function (pedagogicItemOfTheDay) {
	                            if ((pedagogicItemDisplayedIdxStart <= idxSearchPedagogicItem) && (idxSearchPedagogicItem <= pedagogicItemDisplayedIdxEnd)) {
	                                $scope.quickSearchPedagogicDaysDisplayed.push(pedagogicItemOfTheDay);
	                            }
	                            idxSearchPedagogicItem++;
	                        });
	                    });
	                    // enable/disable next/previous items arrow buttons
	                    $scope.isPreviousPedagogicDaysDisplayed = isPreviousPedagogicDaysDisplayed();
	                    $scope.isNextPedagogicDaysDisplayed = isNextPedagogicDaysDisplayed(idxSearchPedagogicItem);
	                });
	            };
	            $scope.quickSearch = function (resetMaxDisplayedItems) {
	                if (resetMaxDisplayedItems) {
	                    $scope.maxPedagogicItemsDisplayed = defaultMaxPedagogicItemsDisplayed;
	                    pedagogicItemDisplayedIdxStart = 0;
	                    pedagogicItemDisplayedIdxEnd = defaultMaxPedagogicItemsDisplayed - 1;
	                }
	                if (timeout) {
	                    clearTimeout(timeout);
	                    timeout = null;
	                }
	                // start searching after 0.4s (prevent spamming request to backend)
	                timeout = setTimeout(performQuickSearch, 400);
	            };
	            var handleCalendarHomeworksDrop = function () {
	                var timeslots = $('.homeworkpanel');
	                var homeworkSlotsPerDay = entcore_1.model.homeworksPerDayDisplayed; // 1;//timeslots.length / 7;
	                timeslots.each(function (index) {
	                    var timeslot = $(this);
	                    // allow drag
	                    timeslot.on('dragover', function (event) {
	                        event.preventDefault();
	                    });
	                    timeslot.on('dragenter', function ($event) {
	                        // FIXME red color not visible because overidden by grey color !important
	                        timeslot.css('border', 'blue 2px dashed');
	                        timeslot.css('border-radius', '3px');
	                        //timeslot.css('background-color', 'red');
	                    });
	                    timeslot.on('dragleave', function (event) {
	                        //timeslot.css('css', 'color: blue !important');
	                        timeslot.css('border', '');
	                        timeslot.css('border-radius', '');
	                    });
	                    timeslot.on('drop', function ($event) {
	                        $event.preventDefault();
	                        timeslot.css('background-color', '');
	                        // duplicate dragged lesson
	                        var pedagogicItemOfTheDay = JSON.parse($event.originalEvent['dataTransfer'].getData("application/json"));
	                        // do not drop if item type is not a lesson
	                        if (pedagogicItemOfTheDay.type_item !== 'homework') {
	                            return;
	                        }
	                        var newHomework = new index_1.Homework();
	                        newHomework.id = pedagogicItemOfTheDay.id;
	                        var newHomeworkDayOfWeek = Math.floor(index / homeworkSlotsPerDay) + 1;
	                        newHomework.load(function () {
	                            // will force new lesson to be created in DB
	                            newHomework.id = null;
	                            newHomework.lesson_id = null;
	                            newHomework.state = "draft";
	                            // startTime and end format from db is "HH:MM:SS" as text type for lesson save startTime need to be moment time type with date
	                            newHomework.dueDate = entcore_1.moment(newHomework.dueDate);
	                            newHomework.startTime = entcore_1.moment(newHomework.date.format('YYYY-MM-DD') + ' ' + newHomework.startTime);
	                            newHomework.startTime.day(newHomeworkDayOfWeek);
	                            // TODO refactor endTime = startTime + 1h
	                            newHomework.endTime = entcore_1.moment(newHomework.date.format('YYYY-MM-DD') + ' ' + newHomework.endTime);
	                            newHomework.endTime.day(newHomeworkDayOfWeek);
	                            newHomework.endTime.week(entcore_1.model.calendar.week);
	                            newHomework.dueDate.day(newHomeworkDayOfWeek);
	                            newHomework.dueDate.week(entcore_1.model.calendar.week);
	                            newHomework.save(function (data) {
	                                // remove homework from model so will force reload
	                                // needed because homework.dueDate need a specific format !
	                                var homework = entcore_1.model.homeworks.findWhere({
	                                    id: parseInt(newHomework.id)
	                                });
	                                entcore_1.model.homeworks.remove(homework);
	                                window.location.href = window.location.host + '/diary#/editHomeworkView/' + newHomework.id;
	                            }, function (error) {
	                                console.error(error);
	                            });
	                        }, function (error) {
	                            console.error(error);
	                        });
	                    });
	                });
	            };
	            // wait until calendar loaded
	            if (!entcore_1.model.homeworksDropHandled) {
	                setTimeout(handleCalendarHomeworksDrop, 2000);
	                entcore_1.model.homeworksDropHandled = true;
	            }
	        }
	    };
	});


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.quickSearchItem = entcore_1.ng.directive('quickSearchItem', function () {
	    return {
	        restrict: "E",
	        templateUrl: "/diary/public/template/directives/quick-search/quick-search-item.html",
	        scope: false,
	        link: function (scope, element) {
	            var angElement = entcore_1.angular.element(element);
	            angElement.on('drag', function (event) {
	                angElement.css('opacity', 0.9);
	            });
	            scope.dragCondition = function (item) {
	                return true;
	            };
	            scope.dropCondition = function (targetItem) {
	                return false;
	            };
	            scope.drag = function (item, $originalEvent) {
	                try {
	                    $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
	                }
	                catch (e) {
	                    $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
	                }
	            };
	        }
	    };
	});


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.attachment = entcore_1.ng.directive('attachment', function () {
	    return {
	        restrict: "E",
	        require: '^attachmentsx',
	        templateUrl: "diary/public/template/attachment.html",
	        scope: {
	            /**
	             * Attachment
	             */
	            attachment: '=',
	            /**
	             * Reference to lesson or homework
	             */
	            item: '=',
	            /**
	             *  If true, user won't be able to add or modify current attachments (for student for example)
	             */
	            readonly: '='
	        },
	        link: function (scope, element, attrs, location) {
	            /**
	             * As seen from entcore, behaviour.js
	             * @param attachment
	             */
	            scope.downloadAttachment = function () {
	                scope.attachment.download();
	            };
	            // detachFromItem = function (itemId, itemType, cb, cbe) {
	            /**
	             * Removes attachment from lesson or homework
	             * but DOES NOT remove the file physically
	             */
	            scope.removeAttachment = function () {
	                // do not modify current attachment if readonly
	                if (scope.readonly === true) {
	                    return;
	                }
	                scope.attachment.detachFromItem(scope.item, 
	                // callback function
	                function (cb) {
	                    entcore_1.notify.info(cb.message);
	                }, 
	                // callback on error function
	                function (cbe) {
	                    entcore_1.notify.error(cbe.message);
	                });
	            };
	        }
	    };
	});


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	var index_1 = __webpack_require__(3);
	exports.attachmentsx = entcore_1.ng.directive('attachmentsx', function () {
	    return {
	        restrict: "E",
	        templateUrl: "diary/public/template/attachments.html",
	        scope: {
	            /**
	             * Lesson or homework
	             */
	            item: '=',
	            /**
	             * If true, user won't be able to add or modify current attachments (for student for example)
	             */
	            readonly: '='
	        },
	        controller: function () { },
	        link: function ($scope) {
	            //$scope.selectedAttachments = new Array();
	            $scope.display = {};
	            $scope.display.showPersonalAttachments = false;
	            $scope.mediaLibraryScope = null;
	            /**
	             * Set selected or not documents within
	             * media library documents
	             */
	            var syncSelectedDocumentsFromItemAttachments = function () {
	                var theScope = getMediaLibraryScope();
	                theScope.documents.forEach(function (document) {
	                    document.selected = hasAttachmentInItem(document._id);
	                });
	                theScope.$apply();
	            };
	            /**
	             *
	             * @returns {*}
	             */
	            var getMediaLibraryScope = function () {
	                if ($scope.mediaLibraryScope != null) {
	                    return $scope.mediaLibraryScope;
	                }
	                // tricky way to get that mediaLibrary directive ...
	                var i = 0;
	                var mediaLibraryScope = null;
	                for (var cs = $scope.$$childHead; cs; cs = cs.$$nextSibling) {
	                    if (i === 0 && !cs.attachment) {
	                        mediaLibraryScope = cs.$$nextSibling.$$childTail.$$childTail.$$childTail;
	                        break;
	                    }
	                    i++;
	                }
	                $scope.mediaLibraryScope = mediaLibraryScope;
	            };
	            var mediaLibraryScope = null;
	            // open up personal storage
	            $scope.showPersonalAttachments = function () {
	                $scope.display.showPersonalAttachments = true;
	                setTimeout(function () {
	                    // FIXME can't find mediaLibrary scopre at first time !!
	                    syncSelectedDocumentsFromItemAttachments();
	                }, 300);
	            };
	            $scope.hidePersonalAttachments = function () {
	                $scope.display.showPersonalAttachments = false;
	            };
	            /**
	             * Selected attachments from media library directive
	             * see attachments.html
	             * @param selectedAttachments Selected attachments in personal storage view
	             */
	            $scope.updateSelectedAttachments = function (selectedAttachments) {
	                // TODO DELETE
	            };
	            /**
	             *
	             * @param documentId
	             */
	            var hasAttachmentInItem = function (documentId) {
	                var hasAttachment = false;
	                if (!$scope.item.attachments || $scope.item.attachments.length === 0) {
	                    hasAttachment = false;
	                }
	                else {
	                    $scope.item.attachments.forEach(function (itemAttachment) {
	                        if (itemAttachment.document_id === documentId) {
	                            hasAttachment = true;
	                        }
	                    });
	                }
	                return hasAttachment;
	            };
	            /**
	             *
	             * @returns {*}
	             */
	            var getSelectedDocuments = function () {
	                var selectedDocuments = entcore_1._.where(getMediaLibraryScope().documents, {
	                    selected: true
	                });
	                return selectedDocuments;
	            };
	            /**
	             *
	             * @param selectedAttachments Selected documents in media library directive
	             */
	            var addSelectedDocumentsToItem = function (newSelectedAttachments) {
	                if (!newSelectedAttachments || newSelectedAttachments.length === 0) {
	                    return;
	                }
	                var newAttachments = new Array();
	                newSelectedAttachments.forEach(function (selectedAttachment) {
	                    if (!hasAttachmentInItem(selectedAttachment._id)) {
	                        var itemAttachment = new index_1.Attachment();
	                        itemAttachment.user_id = entcore_1.model.me.userId;
	                        itemAttachment.document_id = selectedAttachment._id;
	                        itemAttachment.document_label = selectedAttachment.name;
	                        newAttachments.push(itemAttachment);
	                        $scope.item.addAttachment(itemAttachment);
	                    }
	                });
	            };
	            /**
	             * Associates the selected attachments from directive
	             * to current item (lesson or homework)
	             */
	            $scope.linkAttachmentsToItem = function () {
	                if (mediaLibraryScope == null) {
	                    mediaLibraryScope = getMediaLibraryScope();
	                }
	                var selectedAttachments = getSelectedDocuments();
	                if (selectedAttachments.length === 0) {
	                    entcore_1.notify.info('diary.attachments.selectattachmentstolink');
	                }
	                else {
	                    addSelectedDocumentsToItem(selectedAttachments);
	                    // close media library directive
	                    $scope.hidePersonalAttachments();
	                }
	            };
	            /**
	             * Removes the attachment from item (lesson or homework)
	             * @param attachment
	             */
	            $scope.removeAttachment = function (attachment) {
	                attachment.detachFromItem($scope.item.id, $scope.itemType, 
	                // callback function TODO handle
	                function () {
	                }, 
	                // callback on error function TODO handle
	                function () {
	                });
	            };
	            setInterval(function () {
	                var addButton = $('.right-magnet.vertical-spacing-twice');
	                addButton.hide();
	            }, 400);
	        }
	    };
	});


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(__webpack_require__(128));
	__export(__webpack_require__(129));
	__export(__webpack_require__(130));
	__export(__webpack_require__(131));
	__export(__webpack_require__(132));
	__export(__webpack_require__(133));
	__export(__webpack_require__(134));


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.arraytostring = entcore_1.ng.filter('arraytostring', function () {
	    return function (item) {
	        // return the current `item`, but call `toUpperCase()` on it
	        if (!item) {
	            return "";
	        }
	        var result = "";
	        entcore_1._.each(item, function (it) {
	            result += it + ",";
	        });
	        result = result.substring(0, result.length - 1);
	        return result;
	    };
	});


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.formatHour = entcore_1.ng.filter('formatHour', function () {
	    return function (text) {
	        if (!text) {
	            return text;
	        }
	        return text.substring(0, 5).replace(":", "h");
	    };
	});


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.highlight = entcore_1.ng.filter('highlight', function () {
	    return function (text, phrase) {
	        if (phrase)
	            text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
	        return entcore_1.$sce.trustAsHtml(text);
	    };
	});


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.maxChar = entcore_1.ng.filter('maxChar', function () {
	    return function (item, maxChar) {
	        if (!item) {
	            return item;
	        }
	        if (!item.indexOf) {
	            item = item.toString();
	        }
	        item = item.replace(/<\/?[^>]+(>|$)/g, " ");
	        var dynamicMaxChar = maxChar;
	        /*if (item.indexOf('</div>') < dynamicMaxChar){
	            dynamicMaxChar = item.indexOf('</div>') + 6;
	        }*/
	        if (item.length < dynamicMaxChar) {
	            return item;
	        }
	        else {
	            return item.substring(0, dynamicMaxChar) + " ...";
	        }
	    };
	});


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.sameDate = entcore_1.ng.filter('sameDate', function () {
	    return function (items, properties) {
	        var d = properties[Object.keys(properties)[0]];
	        if (!d) {
	            return items;
	        }
	        var valueCompare = entcore_1.moment(d);
	        var result = items.filter(function (item) {
	            var valueItem = entcore_1.moment(item.date);
	            return valueItem.isSame(valueCompare, 'd');
	        });
	        return result;
	    };
	});


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.translate = entcore_1.ng.filter('translate', function () {
	    return function (text) {
	        return entcore_1.idiom.translate(text);
	    };
	});


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	exports.trusthtml = entcore_1.ng.filter('trusthtml', function () {
	    return function (text) {
	        return entcore_1.$sce.trustAsHtml(text);
	    };
	});


/***/ })
/******/ ]);
//# sourceMappingURL=application.js.map