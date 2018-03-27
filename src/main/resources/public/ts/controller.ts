import { ng, angular, model, moment, _, notify, template } from 'entcore';
import { syncLessonsAndHomeworks, syncHomeworks} from './tools';


import { Homework, Lesson, PedagogicItem } from './models/';
import { CourseService } from "./services/courses.service";
import { LessonService } from "./services/lessons.service";
import { SecureService } from "./services/secure.service";
import * as tools from './tools';
import {AudienceService} from "./services/audiences.service";


/**
 *
 * @param $scope
 * @param template
 * @param model
 * @param route
 * @param $location
 * @constructor
 */

export let DiaryController = ng.controller('DiaryController', [
    '$scope', '$rootScope', 'model', 'route', '$location', '$window', '$sce',
    function ($scope, $rootScope, model, route, $location, $window, $sce) {
    model.CourseService = CourseService;
    model.LessonService = LessonService;
    $scope.constants = tools.CONSTANTS;
    $scope.RIGHTS = tools.CONSTANTS.RIGHTS;
    $rootScope.model = model;

    $rootScope.currentRightPanelVisible = undefined ;//= 'test';

    $rootScope.$on('edit-homework',(_,data)=>{
        window.location.href = window.location.host+'/diary#/editHomeworkView/' + data.id;
        //$scope.openHomeworkView (data);
    });


    $scope.currentErrors = [];
    if (!model.filters){
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

    $rootScope.trusthtml = function(txt){
        return $sce.trustAsHtml(txt);
    };

    $rootScope.validationError = function(e) {
        if (typeof e !== 'undefined') {
            notify.error(e.error);
            $rootScope.currentErrors=[];
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
        showHistoryView:function(params){
            template.open('main', 'show-history');
        },
        manageVisaView: function (params) {
            template.open('main', 'visa-manager');
        },
        progressionEditLesson:function(params){
          template.open('main', 'progression-edit-lesson');
        },
        progressionManagerView: function (params) {
            template.open('main', 'progression-manager');
        },
        createLessonView: function (params) {
                //$scope.lesson = null;
                $scope.lessonDescriptionIsReadOnly = false;
                $scope.homeworkDescriptionIsReadOnly = false;
                //$scope.openLessonView(null, params);

                template.open('main', 'main');
                if (SecureService.hasRight(tools.CONSTANTS.RIGHTS.CREATE_LESSON)){
                  template.open('main-view', 'create-lesson');
              }
        },
        createHomeworkView: function () {
            $scope.homework = null;
            $scope.homeworkDescriptionIsReadOnly = false;
            $scope.openHomeworkView(null);
        },
        editLessonView: function(params) {
            template.open('main', 'main');
            if (SecureService.hasRight(tools.CONSTANTS.RIGHTS.CREATE_LESSON)){
              template.open('main-view', 'create-lesson');
            }else{
                template.open('main-view', 'view-lesson');
            }
        },
        showLessonView: function(params) {
            template.open('main', 'main');
            template.open('main-view', 'view-lesson');
        },
        editHomeworkView: function(params) {
            loadHomeworkFromRoute(params);
        },
        calendarView: function (params) {
            template.open('main', 'main');
            template.open('main-view', 'calendar');
            template.open('daily-event-details', 'daily-event-details');
            model.selectedViewMode = '/diary/public/template/calendar/calendar-view.template.html';
        },
        listView: function(){
            template.open('main', 'main');
            template.open('main-view', 'calendar');
            model.selectedViewMode = '/diary/public/template/calendar/list-view.template.html';
        },
        mainView: function(){
            if ($scope.display.showList) {
                $scope.goToListView(null);
            } else {
                $scope.goToCalendarView(null);
            }
        }
    });


    $scope.setLessonDescriptionMode = function(homeworkId) {
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
	$scope.changeHomeworkDescriptionMode = function(homeworkId, apercu) {
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
    $scope.setLessonDescriptionMode = function() {
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
    $scope.setHomeworkDescriptionMode = function() {
        if ($scope.homeworkDescriptionIsReadOnly) {
            $scope.homeworkDescriptionIsReadOnly = false;
        }
        else {
            $scope.homeworkDescriptionIsReadOnly = true;
        }
    };


    // Navigation
    $scope.showList = function() {
        $scope.display.showList = true;
        if($scope.isUserTeacher) {
            model.searchForm.initForTeacher();
        } else {
            model.searchForm.initForStudent();
        }

        $scope.selectedDueDate = undefined;
        model.pedagogicDays.syncPedagogicItems($scope.openListView, $rootScope.validationError);
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
     * @param pedagogicItem
     * @param newWindow if true will open item detail in new windows else in same window
     */
    $scope.goToItemDetail = function(pedagogicItem, newWindow) {
        var url = "";

        if (pedagogicItem.type_item === 'lesson') {

            url = pedagogicItem.locked ? "/showLessonView/" + pedagogicItem.id + "/" : "/editLessonView/" + pedagogicItem.id + "/";
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

    $rootScope.back=function(){
      $window.history.back();
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
        } else {
            if (model.calendar && model.calendar.week) {
                calendarViewPath += '/' + moment().week(model.calendar.week).weekday(0).format(tools.CONSTANTS.CAL_DATE_PATTERN);
            } else {
                calendarViewPath += '/' + moment().weekday(0).format(tools.CONSTANTS.CAL_DATE_PATTERN);
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
            $rootScope.$broadcast('refresh-list');
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
            $rootScope.redirect('/editLessonView/' + selectedLesson.id + '/');
        } else if (selectedHomework) {
            // open lesson view if homework is attached to a lesson
            if (selectedHomework.lesson_id) {
                // set default tab to homework tab
                $scope.tabs.createLesson = 'homeworks';
                $rootScope.redirect('/editLessonView/' + selectedHomework.lesson_id + '/' + selectedHomework.id);
            } else {
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
        return $scope.publishLessons(lessons, isPublish, notifyKey).then(()=>{
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

        return model.publishLessons({ids:model.getItemsIds(lessons)}, isPublish, publishCB(lessons, isPublish, notifyKey, cb), function (e) {
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
        $scope.publishHomeworks(homeworks, isPublish, notifyKey).then(()=>{
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
        return model.publishHomeworks({ids:model.getItemsIds(homeworks)}, isPublish, publishCB(homeworks, isPublish, notifyKey, cb), function (e) {
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
    var publishCB = function (list, toPublish, notifyKey, cb?) {
        list.forEach(function (item) {
            item.changeState(toPublish);
            item.selected=false;
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
        console.warn("deprecated");
        return;
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
            return model.publishLessons({ids: model.getItemsIds(lessons)}, toPublish, publishCB(lessons, toPublish, notifyKey),
                function (cbe) {
                    notify.error(cbe.message);
                })
        }

        if (homeworks.length > 0) {
            return model.publishHomeworks({ids: model.getItemsIds(homeworks)}, toPublish, publishCB(homeworks, toPublish, notifyKey),
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
        if (model && model.homeworks && model.homeworks.selection)
            return model.homeworks.selection();
        return [];
    };

    var getSelectedLessons = function(){
        if(model && model.lessons && model.lessons.selection)
            return model.lessons.selection();
        return [];
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
            //$scope.$apply();

            if (typeof cb === 'function') {
                cb();
            }
        }, function (e) {
            $rootScope.validationError(e);
        });
    };

    $scope.hideHomework = function(){
        if ($scope.homework)
        $scope.lesson = null;
        $scope.homework = null;
    };

    $scope.createOrUpdateHomework = async function (goToMainView) {
        $scope.currentErrors = [];
        if ($scope.newItem) {
            $scope.homework.dueDate = $scope.newItem.date;
        }
        try {
            await model.homeworks.sync();
            notify.info('homework.saved');
            $scope.homework.audience = model.audiences.findWhere({id: $scope.homework.audience.id});

            if (goToMainView) {
                $rootScope.back();
                $scope.lesson = null;
                $scope.homework = null;
            }
        } catch (e) {
            $scope.homework.errorValid = true;
            throw e;
        }
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
            if(!$scope.$$phase) {
                $scope.$apply();
              }            
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
        //$scope.$apply();
    };

    /**
     * Refresh calendar view for current week
     */
    $scope.refreshCalendarCurrentWeek = function(){
        $scope.show(moment(model.calendar.firstDay));
    };

    $scope.addHomeworkToLesson = function(lesson){
        lesson.addHomework(lesson);
    };

    $scope.getPedagogicItemSelectedCount = function () {
        return $scope.getSelectedPedagogicItems('lesson').length + $scope.getSelectedPedagogicItems('homework').length;
    };

    // gets the selected date from pedagogic items but can't be in the past.
    $scope.selectedDateInTheFuture = function (){
        var date = model.selectedPedagogicDate();
        return moment().min(moment(date), moment()).format("YYYY-MM-DD"); // see moment.js doc on min pre 2.7.0 version (highly confusing !)
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
     * Init homework object on create
     * @param dueDate if set the dueDate of the homework
     */
    var initHomework = function(dueDate) {
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
        model.getPreviousLessonsFromLesson(currentLesson, false, function(){$scope.$apply()}, $rootScope.validationError);
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

        var cb ;//= function (){};

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

        var audienceId = homework.audience ? homework.audience.id : homework.audienceId;
        model.loadHomeworksLoad(homework, formattedDate, audienceId, cb, callbackErrorFunc);
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
        function initAudiences (cb ?) {
            model.audiences.all = [];
            //var nbStructures = model.me.structures.length;

            model.currentSchool = model.me.structures[0];

            AudienceService.getAudiences(model.me.structures).then((audiences) => {

                model.audiences.addRange(audiences);
                model.audiences.trigger('sync');
                model.audiences.trigger('change');
                if (typeof cb === 'function') {
                    cb();
                }
            });
        };
        initAudiences();
}
]);
