(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();
"use strict";

var AngularExtensions = {
    moduleConfigs: [],
    addModuleConfig: function addModuleConfig(callBack) {
        this.moduleConfigs.push(callBack);
    },
    init: function init(module) {
        angular.forEach(this.moduleConfigs, function (moduleConfig) {
            moduleConfig.apply(this, [module]);
        });
    }
};

'use strict';

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
function DiaryController($scope, template, model, route, $location, $window, CourseService) {

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
    $scope.pedagogicLessonsSelected = new Array();
    $scope.pedagogicHomeworksSelected = new Array();

    $scope.getStaticItem = function (itemType) {
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
        createLessonView: function createLessonView(params) {
            var openFunc = function openFunc() {
                $scope.lesson = null;
                $scope.lessonDescriptionIsReadOnly = false;
                $scope.homeworkDescriptionIsReadOnly = false;
                $scope.openLessonView(null, params);
            };

            if ($scope.calendarLoaded) {
                openFunc();
            } else {
                initialization(false, openFunc);
            }
        },
        createHomeworkView: function createHomeworkView() {

            var openFunc = function openFunc() {
                $scope.homework = null;
                $scope.homeworkDescriptionIsReadOnly = false;
                $scope.openHomeworkView(null);
            };

            if ($scope.calendarLoaded) {
                openFunc();
            } else {
                initialization(false, openFunc);
            }
        },
        editLessonView: function editLessonView(params) {

            if (!params.idLesson) {
                $scope.goToMainView(notify.error('daily.lesson.id.notspecified'));
                return;
            }

            var lesson = model.lessons.findWhere({ id: parseInt(params.idLesson) });

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
                    lesson.load(true, function () {
                        $scope.openLessonView(lesson, params);
                    }, function (cbe) {
                        notify.error(cbe.message);
                    });
                }
        },
        editHomeworkView: function editHomeworkView(params) {
            loadHomeworkFromRoute(params);
        },
        calendarView: function calendarView(params) {
            $scope.display.showList = false;

            var mondayOfWeek = moment();

            // mondayOfWeek as string date formatted YYYY-MM-DD
            if (params.mondayOfWeek) {
                mondayOfWeek = moment(params.mondayOfWeek);
            } else {
                mondayOfWeek = mondayOfWeek.weekday(0);
            }

            $scope.showCalendar(mondayOfWeek);
        },
        listView: function listView() {
            $scope.lesson = null;
            $scope.homework = null;
            $scope.pedagogicLessonsSelected = new Array();
            $scope.pedagogicHomeworksSelected = new Array();
            $scope.showList();
        },
        mainView: function mainView() {
            if ($scope.display.showList) {
                $scope.goToListView(null);
            } else {
                $scope.goToCalendarView(null);
            }
        }
    });

    $scope.setLessonDescriptionMode = function (homeworkId) {
        if ($scope.lessonDescriptionIsReadOnly) {
            $scope.lessonDescriptionIsReadOnly = false;
        } else {
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
        } else {
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
        } else {
            $scope.lessonDescriptionIsReadOnly = true;
        }
    };

    /**
     * Permet d'afficher un aperçu de la description d'un TAF en readonly
     */
    $scope.setHomeworkDescriptionMode = function () {
        if ($scope.homeworkDescriptionIsReadOnly) {
            $scope.homeworkDescriptionIsReadOnly = false;
        } else {
            $scope.homeworkDescriptionIsReadOnly = true;
        }
    };

    // Navigation
    $scope.showList = function () {
        $scope.display.showList = true;
        if ($scope.isUserTeacher) {
            model.searchForm.initForTeacher();
        } else {
            model.searchForm.initForStudent();
        }

        $scope.selectedDueDate = undefined;
        model.pedagogicDays.syncPedagogicItems($scope.openListView, validationError);
    };

    $scope.openListView = function () {
        if (!$scope.isUserTeacher) {
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
    $scope.showCalendar = function (momentMondayOfWeek) {

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
    $scope.goToItemDetail = function (pedagogicItem, newWindow) {
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

        if (newWindow) {
            $window.open('/diary#' + url);
        } else {
            $location.url(url);
        }
    };

    //list-view interactions
    $scope.selectDay = function (day) {
        model.unselectDays();
        day.selected = true;
        $scope.selectedDueDate = moment(day.dayName, "dddd DD MMMM YYYY");
    };

    var loadHomeworkFromRoute = function loadHomeworkFromRoute(params) {
        // try find homework in current week homeworks cache
        var homework = model.homeworks.findWhere({ id: parseInt(params.idHomework) });

        if (homework != null) {
            $scope.homeworkDescriptionIsReadOnly = false;
            $scope.openHomeworkView(homework);
        }
        // load from db
        else {
                homework = new Homework();
                homework.id = parseInt(params.idHomework);

                homework.load(function () {
                    $scope.homeworkDescriptionIsReadOnly = false;
                    $scope.openHomeworkView(homework, params);
                }, function (cbe) {
                    notify.error(cbe.message);
                });
            }
    };

    /**
     *
     * @param lesson Lesson to view
     * @param params Parameters from url
     */
    $scope.openLessonView = function (lesson, params) {

        $scope.data.tabSelected = 'lesson';
        $scope.tabs.createLesson = params.idHomework ? 'homeworks' : 'lesson';
        $scope.tabs.showAnnotations = false;

        var openLessonTemplates = function openLessonTemplates() {
            template.open('main', 'main');
            if (!$scope.isLessonHomeworkEditable) {
                template.open('main-view', 'view-lesson');
            } else {
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
                $scope.lesson.homeworks.forEach(function (homework) {
                    if (lesson.homeworks.length || params.idHomework && params.idHomework == homework.id) {
                        homework.expanded = true;
                    }

                    model.loadHomeworksLoad(homework, moment(homework.date).format("YYYY-MM-DD"), lesson.audience.id);
                });
                openLessonTemplates();
            });
        }
        // create new lesson
        else {
                var isTimeFromCalendar = "timeFromCalendar" === params.timeFromCalendar;
                initLesson(isTimeFromCalendar);
                openLessonTemplates();
            }
    };

    $scope.openHomeworkView = function (homework, params) {

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
        if (!$scope.isLessonHomeworkEditable) {
            template.open('main-view', 'view-homework');
        } else {
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

        if (selectedLessons.length + selectedHomeworks.length === 0) {
            notify.error('daily.nohomeworkorlesson.selected');
            return;
        }

        var selectHomeworksToBeDeleted = function selectHomeworksToBeDeleted(selectedHomeworks, selectedLessonsId) {
            return selectedHomeworks.filter(function (homework) {
                return homework.lesson_id == null || !_.contains(selectedLessonsId, homework.lesson_id);
            });
        };

        var postDelete = function postDelete() {
            notify.info('item.deleted');
            $scope.closeConfirmPanel();
            $scope.$apply();
        };

        var deleteHomeworks = function deleteHomeworks() {
            $scope.getStaticItem('homework').deleteList(homeworksToDelete, postDelete,
            // calback error function
            function (cbe) {
                notify.error(cbe.message);
            });
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
                } else {
                    postDelete();
                }
            },
            // calback error function
            function (cbe) {
                notify.error(cbe.message);
            });
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


        $scope.createOrUpdateLesson(goMainView, function () {
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

        $scope.lesson.save(function () {
            notify.info('lesson.saved');
            $scope.lesson.audience = model.audiences.findWhere({ id: $scope.lesson.audience.id });
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

        model.publishLessons({ ids: model.getItemsIds(lessons) }, isPublish, publishCB(lessons, isPublish, notifyKey, cb), function (e) {
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
        model.publishHomeworks({ ids: model.getItemsIds(homeworks) }, isPublish, publishCB(homeworks, isPublish, notifyKey, cb), function (e) {
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
    var publishCB = function publishCB(list, toPublish, notifyKey, cb) {
        list.forEach(function (item) {
            item.changeState(toPublish);
        });

        $scope.cbCount--;
        $scope.closeConfirmPanel();

        if ($scope.cbCount <= 0) {
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
        if (!$scope.lesson.id) {
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
            model.loadHomeworksForLesson($scope.lesson, function () {
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
    $scope.formatDate = function (date) {
        return $scope.formatMoment(moment(date));
    };

    $scope.formatMoment = function (moment) {
        return moment.lang('fr').format('DD/MM/YYYY');
    };

    $scope.formatTime = function (time) {
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
        return $scope.getSelectedPedagogicItems('lesson').length + $scope.getSelectedPedagogicItems('homework').length == 1;
    };

    /**
     * Get selected items from calendar (lessons and homeworks)
     * and tidy them within un/publishable state
     */
    var getPublishableItemsSelected = function getPublishableItemsSelected() {

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
        var cbCount = (lessons.length > 0 ? 1 : 0) + (homeworks.length > 0 ? 1 : 0);
        $scope.cbCount = cbCount;

        if (lessons.length > 0) {
            model.publishLessons({ ids: model.getItemsIds(lessons) }, toPublish, publishCB(lessons, toPublish, notifyKey), function (cbe) {
                notify.error(cbe.message);
            });
        }

        if (homeworks.length > 0) {
            model.publishHomeworks({ ids: model.getItemsIds(homeworks) }, toPublish, publishCB(homeworks, toPublish, notifyKey), function (cbe) {
                notify.error(cbe.message);
            });
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
                return publishableLessons.length > 0 && noUnpublishableItems || publishableHomeworks.length > 0 && noUnpublishableItems;
            }
        } else {
            // nothing selected
            if (unpublishableLessons.length + unpublishableHomeworks.length == 0) {
                return false;
            } else {
                var noPublishableItems = publishableLessons.length == 0 && publishableHomeworks.length == 0;
                return unpublishableLessons.length > 0 && noPublishableItems || unpublishableHomeworks.length > 0 && noPublishableItems;
            }
        }
    };

    var getSelectedHomeworks = function getSelectedHomeworks() {
        return model.homeworks.selection();
    };

    var getSelectedLessons = function getSelectedLessons() {
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

        var postHomeworkSave = function postHomeworkSave() {
            $scope.showCal = !$scope.showCal;
            notify.info('homework.saved');
            $scope.homework.audience = model.audiences.findWhere({ id: $scope.homework.audience.id });
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
                syncLessonsAndHomeworks(postHomeworkSave);
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
    var initialization = function initialization(bShowTemplates, cb) {

        // will force quick search panel to load (e.g: when returning to calendar view)
        // see ng-extensions.js -> quickSearch directive
        model.lessonsDropHandled = false;
        model.homeworksDropHandled = false;

        $scope.countdown = 4;

        // auto creates diary.teacher
        if ("ENSEIGNANT" === model.me.type) {
            var teacher = new Teacher();
            teacher.create(decrementCountdown(bShowTemplates, cb), validationError);
        } else {
            decrementCountdown(bShowTemplates, cb);
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

    var applyScopeOnFinish = function applyScopeOnFinish() {
        $scope.countdown--;

        if ($scope.countdown == 0) {
            $scope.$apply();
        }
    };

    var decrementCountdown = function decrementCountdown(bShowTemplates, cb) {
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

    var showTemplates = function showTemplates() {
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
    $scope.refreshCalendarCurrentWeek = function () {
        $scope.show(moment(model.calendar.firstDay));
    };

    $scope.addHomeworkToLesson = function (lesson) {
        lesson.addHomework(lesson);
    };

    $scope.redirect = function (path) {
        $location.path(path);
    };

    $scope.getPedagogicItemSelectedCount = function () {
        return $scope.getSelectedPedagogicItems('lesson').length + $scope.getSelectedPedagogicItems('homework').length;
    };

    // gets the selected date from pedagogic items but can't be in the past.
    $scope.selectedDateInTheFuture = function () {
        var date = model.selectedPedagogicDate();
        return moment().min(moment(date), moment()).format("YYYY-MM-DD"); // see moment.js doc on min pre 2.7.0 version (highly confusing !)
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
        } else {
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
    var initLesson = function initLesson(timeFromCalendar) {

        var selectedDate = $scope.selectedDateInTheFuture();

        $scope.lesson = model.initLesson(timeFromCalendar, selectedDate);
        $scope.newItem = $scope.lesson.newItem;
    };

    /**
     * Init homework object on create
     * @param dueDate if set the dueDate of the homework
     */
    var initHomework = function initHomework(dueDate) {
        $scope.homework = model.initHomework(dueDate);
        $scope.newItem = {
            date: $scope.homework.date
        };
    };

    var validationError = function validationError(e) {

        if (typeof e !== 'undefined') {
            console.error(e);
            notify.error(e.error);
            $scope.currentErrors.push(e);
            $scope.$apply();
        }
    };

    $scope.setChildFilter = function (child, cb) {
        $scope.children.forEach(function (theChild) {
            theChild.selected = theChild.id === child.id;
        });

        child.selected = true;
        $scope.child = child;
        model.child = child;

        if (typeof cb === 'function') {
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
    $scope.toggleHomeworkPanelMinified = function () {
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

    $scope.loadMorePreviousLessonsFromLesson = function (currentLesson) {
        model.getPreviousLessonsFromLesson(currentLesson, true, function () {
            $scope.$apply();
        }, validationError);
    };

    /**
     * Load previous lessons data from current lesson being edited
     * @param currentLesson Current lesson being edited
     */
    $scope.loadPreviousLessonsFromLesson = function (currentLesson) {
        model.getPreviousLessonsFromLesson(currentLesson, false, function () {
            $scope.$apply();
        }, validationError);
    };

    $scope.itemTypesDisplayed = function (item) {
        if (item.type_item == "lesson" && $scope.searchForm.displayLesson || item.type_item == "homework" && $scope.searchForm.displayHomework) {
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
        } else {
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

        var cb = function cb() {};

        if (callback) {
            if (typeof callback === 'function') {
                cb = callback;
            }
        }

        var callbackErrorFunc = function callbackErrorFunc() {
            // TODO propagate error to front
        };

        var date = forcedDate ? forcedDate : homework.date;
        var formattedDate = moment(date).format("YYYY-MM-DD");

        model.loadHomeworksLoad(homework, formattedDate, homework.audience.id, cb, callbackErrorFunc);
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
        $scope.tabs.createLesson = 'previouslessons';
        $scope.loadPreviousLessonsFromLesson(lesson);
    };

    /**
     * Show more previous lessons.
     * By default number of previous lessons is 3.
     * Will increase displayed previous lesson by 3.
     */
    $scope.showMorePreviousLessons = function (lesson) {
        var displayStep = 3;
        lesson.previousLessonsDisplayed = lesson.previousLessons.slice(0, Math.min(lesson.previousLessons.length, lesson.previousLessonsDisplayed.length + displayStep));
    };
}

;"use strict";

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        console.log("CalendarController initialized");
        function controller($scope, $timeout, CourseService) {
            console.log("CalendarController called");
            $timeout(init);
            /*
            * initialisation calendar function
            */
            function init() {
                console.log(model.lessons.all);
                CourseService.getMergeCourses(model.me.structures[0], model.me.userId, moment('2017-04-03')).then(function (courses) {
                    $scope.itemsCalendar = [].concat(model.lessons.all).concat(courses);
                    console.log($scope.itemsCalendar);
                });
            }

            /**
             * Opens the next week view of calendar
             */
            $scope.nextWeek = function () {
                var nextMonday = moment(model.calendar.firstDay).add(7, 'day');
                //TODO dont call the parent
                $scope.$parent.goToCalendarView(nextMonday.format(CAL_DATE_PATTERN));
            };

            /**
             * Opens the previous week view of calendar
             */
            $scope.previousWeek = function () {
                var prevMonday = moment(model.calendar.firstDay).add(-7, 'day');
                //TODO dont call the parent
                $scope.$parent.goToCalendarView(prevMonday.format(CAL_DATE_PATTERN));
            };
        }
        module.controller("CalendarController", controller);
    });
})();

'use strict';

(function () {
  'use strict';

  AngularExtensions.addModuleConfig(function (module) {

    /**
     *
     */
    module.directive('attachment', function () {
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
        link: function link(scope, element, attrs, location) {

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
              notify.info(cb.message);
            },
            // callback on error function
            function (cbe) {
              notify.error(cbe.message);
            });
          };
        }
      };
    });
  });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        /**
         * Directive to perform a quick search among lessons and homeworks
         */
        module.directive('attachmentsx', function () {
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
                controller: function controller() {},
                link: function link($scope) {
                    //$scope.selectedAttachments = new Array();
                    $scope.display = {};
                    $scope.display.showPersonalAttachments = false;
                    $scope.mediaLibraryScope = null;

                    /**
                     * Set selected or not documents within
                     * media library documents
                     */
                    var syncSelectedDocumentsFromItemAttachments = function syncSelectedDocumentsFromItemAttachments() {

                        var theScope = getMediaLibraryScope();

                        console.log('TheScope');
                        console.log(theScope);

                        theScope.documents.forEach(function (document) {
                            document.selected = hasAttachmentInItem(document._id);
                        });

                        theScope.$apply();
                    };

                    /**
                     *
                     * @returns {*}
                     */
                    var getMediaLibraryScope = function getMediaLibraryScope() {

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
                    var hasAttachmentInItem = function hasAttachmentInItem(documentId) {

                        var hasAttachment = false;

                        if (!$scope.item.attachments || $scope.item.attachments.length === 0) {
                            hasAttachment = false;
                        } else {
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
                    var getSelectedDocuments = function getSelectedDocuments() {
                        var selectedDocuments = _.where(getMediaLibraryScope().documents, {
                            selected: true
                        });

                        return selectedDocuments;
                    };

                    /**
                     *
                     * @param selectedAttachments Selected documents in media library directive
                     */
                    var addSelectedDocumentsToItem = function addSelectedDocumentsToItem(newSelectedAttachments) {

                        if (!newSelectedAttachments || newSelectedAttachments.length === 0) {
                            return;
                        }

                        var newAttachments = new Array();

                        newSelectedAttachments.forEach(function (selectedAttachment) {

                            if (!hasAttachmentInItem(selectedAttachment._id)) {
                                var itemAttachment = new Attachment();

                                itemAttachment.user_id = model.me.userId;
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
                            notify.info('diary.attachments.selectattachmentstolink');
                        } else {
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

                        attachment.detachFromItem(scope.item.id, scope.itemType,
                        // callback function TODO handle
                        function () {},
                        // callback on error function TODO handle
                        function () {});
                    };

                    setInterval(function () {
                        var addButton = $('.right-magnet.vertical-spacing-twice');
                        addButton.hide();
                    }, 400);
                }
            };
        });
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        module.directive('calendarDailyEvents', function () {
            return {
                scope: {
                    ngModel: '='
                },
                restrict: 'E',
                template: '<span id="minimize_hw_span" class="ng-scope"><ul style="padding-left: 0px !important; padding-right: 0px !important; border: 0px !important;"><li>' + '<i class="resize-homeworks-panel"   style="float: left; width: 130px;">&nbsp;</i></li></ul></span>' + '<div class="days" style="z-index: 1000; ">' + '<div class="day homeworkpanel"  ng-repeat="day in calendar.days.all" style="height: 40px;">' +

                // <= 3 homeworks for current day
                // or 1 homework and homework panel minified
                '<div class="test" ng-if="showAllHomeworks(day)">' + '<div ng-repeat="dailyEvent in day.dailyEvents">' + '<container template="daily-event-item" style="padding-bottom: 1px;"></container>' + '</div>' + '</div>' +

                // > 3 homeworks for current day
                // or > 1 homework and homework panel minified
                '<div class="opener" ng-if="showNotAllHomeworks(day)" ' + 'ng-click="toggleShowHwDetail(day)">' + '<span id="dailyeventlongtitle"><i18n>daily.event</i18n></span>' + '<span id="dailyeventshorttitle">TAF ([[day.dailyEvents.length]])</span>' + '</div>' + '<div class="test daily-events" style="z-index: 1000;" id="hw-detail-[[day.index]]" ' + 'ng-click="toggleOpenDailyEvents(day, $event)" ' + 'ng-class="{ show: day.openDailyEvents && day.dailyEvents.length > 1 }">' + '<div ng-repeat="dailyEvent in day.dailyEvents">' + '<container template="daily-event-item" style="padding-bottom: 1px;"></container>' + '</div>' + '</div>' + '</div>' + '</div>',
                link: function link(scope, element, attributes) {
                    scope.calendar = model.calendar;
                    scope.isUserTeacher = model.isUserTeacher();

                    /**
                     * Open homeworks details when homeworks info is minimized
                     * or vice versa
                     * @param day
                     * @param $event
                     */
                    scope.toggleOpenDailyEvents = function (day, $event) {
                        if (!($event.target && $event.target.type === "checkbox")) {
                            day.openDailyEvents = !day.openDailyEvents;
                        }
                    };

                    /**
                     * Redirect to homework or lesson view if homework attached to some lesson
                     * @param homework Homework being clicked/selected
                     * @param $event
                     */
                    scope.editSelectedHomework = function (homework, $event) {

                        // prevent redirect on clicking on checkbox
                        if (!($event.target && $event.target.type === "checkbox")) {
                            if (homework.lesson_id == null) {
                                window.location = '/diary#/editHomeworkView/' + homework.id;
                            } else {
                                window.location = '/diary#/editLessonView/' + homework.lesson_id + '/' + homework.id;
                            }
                        }
                    };

                    /**
                     * Toggle show display homework panel detail of a day
                     * Note: jquery oldschool way since with angular could not fix some display problems
                     * @param day
                     */
                    scope.toggleShowHwDetail = function (day) {
                        hideOrShowHwDetail(day, undefined, true);
                    };

                    /**
                     *
                     * @param day
                     * @param hideHomeworks
                     * @param unselectHomeworksOnHide
                     */
                    var hideOrShowHwDetail = function hideOrShowHwDetail(day, hideHomeworks, unselectHomeworksOnHide) {

                        var hwDayDetail = $('#hw-detail-' + day.index);

                        var isNotHidden = hwDayDetail.hasClass('show');

                        if (typeof hideHomeworks === 'undefined') {
                            hideHomeworks = isNotHidden;
                        }

                        if (hideHomeworks) {
                            hwDayDetail.removeClass('show');
                        } else {
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
                    var getMaxHomeworksPerDay = function getMaxHomeworksPerDay() {
                        var max = 0;

                        scope.calendar.days.all.forEach(function (day) {
                            if (day.dailyEvents && day.dailyEvents.length > max) {
                                max = day.dailyEvents.length;
                            }
                        });

                        return max;
                    };

                    // default open state of calendar grid
                    // and homework panel
                    if (!model.show) {
                        model.show = {
                            bShowCalendar: true,
                            bShowHomeworks: true,
                            bShowHomeworksMinified: false
                        };
                    };

                    scope.show = model.show;

                    /**
                     * Minify the homework panel or not
                     * If it's minified, will only show one max homework
                     * else 3
                     */
                    scope.toggleHomeworkPanelMinized = function () {
                        model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, !model.show.bShowHomeworksMinified);
                    };

                    /**
                     *
                     * @param day
                     * @returns {Number|boolean}
                     */
                    scope.showNotAllHomeworks = function (day) {
                        return day.dailyEvents && day.dailyEvents.length && !scope.showAllHomeworks(day);
                    };

                    /**
                     *
                     * @param day Current day
                     * @returns {boolean} true if all homeworks of current day
                     * should be displayed in homework panel
                     */
                    scope.showAllHomeworks = function (day) {

                        if (!day.dailyEvents || day.dailyEvents && day.dailyEvents.length == 0) {
                            return false;
                        }

                        // calendar hidden and homework panel maximized -> show all
                        if (!model.show.bShowHomeworksMinified) {
                            return !model.show.bShowCalendar || day.dailyEvents.length <= 1;
                        } else {
                            return day.dailyEvents.length == 1;
                        }
                    };

                    scope.show = model.show;

                    /**
                     * Return the homework panel height that should be set
                     * depending on calendar grid displayed state and homework panel minimized state
                     * @param bShowCalendar True if calendar grid is visible
                     * @param bShowHomeworks True if homeworks panel is visible
                     * @param bShowHomeworksMinified True if homework panel is in minimized mode (max 1 homework displayed)
                     * @returns {number} Homework panel height
                     */
                    var getHomeworkPanelHeight = function getHomeworkPanelHeight(bShowCalendar, bShowHomeworks, bShowHomeworksMinified) {

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
                        } else {
                            homeworksPerDayDisplayed = 1;
                        }

                        // max homeworks per day displayed used for drag and drop directive
                        // to detect dropped day of the week area
                        model.homeworksPerDayDisplayed = homeworksPerDayDisplayed;

                        return homeworksPerDayDisplayed * HW_HEIGHT;
                    };

                    /**
                     * Display homeworks and lessons and set open state of homework panel
                     * and calendar grid
                     * @param bShowCalendar Show calendar panel
                     * @param bShowHomeworks Show homework panel
                     * @param bShowHomeworksMinified If true homework panel will be minified (max homeworks display with full detail = 1)
                     */
                    model.placeCalendarAndHomeworksPanel = function (bShowCalendar, bShowHomeworks, bShowHomeworksMinified) {

                        /**
                         * Calendar height
                         * @type {number}
                         */
                        var CAL_HEIGHT = 775;

                        var newHwPanelHeight = getHomeworkPanelHeight(bShowCalendar, bShowHomeworks, bShowHomeworksMinified);

                        // reduce height of homework panel if requested
                        $('.homeworkpanel').css('height', newHwPanelHeight);

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

                        calGrid.height(bShowCalendar ? newHwPanelHeight + CAL_HEIGHT : 0);

                        hoursBar.css('margin-top', newHwPanelHeight);
                        $('legend.timeslots').css('margin-top', '');
                        $('legend.timeslots').css('top', newHwPanelHeight);
                        nextTimeslotsBar.css('top', CAL_HEIGHT + newHwPanelHeight);

                        $('.schedule-item').css('margin-top', bShowCalendar ? newHwPanelHeight : 0);
                        calGrid.height(CAL_HEIGHT + (bShowCalendar ? newHwPanelHeight : 0));

                        // set homework panel size with max number of homeworks
                        $('.homeworkpanel').height(newHwPanelHeight);
                        $('.homeworkpanel').css('display', bShowHomeworks ? 'inherit' : 'none');

                        // toggle buttons
                        $('.show-homeworks').css('opacity', bShowHomeworks ? 1 : 0.3);
                        $('.show-calendar-grid').css('opacity', bShowCalendar ? 1 : 0.3);

                        $('#minimize_hw_span').css('display', newHwPanelHeight > 0 ? 'inherit' : 'none');

                        if (!bShowCalendar) {
                            model.calendar.days.all.forEach(function (day) {
                                hideOrShowHwDetail(day, true, true);
                            });
                        }

                        model.show.bShowCalendar = bShowCalendar;
                        model.show.bShowHomeworks = bShowHomeworks;
                        model.show.bShowHomeworksMinified = bShowHomeworksMinified;
                    };

                    function setDaysContent() {

                        model.calendar.days.forEach(function (day) {
                            day.dailyEvents = [];
                        });
                        scope.ngModel.forEach(function (item) {
                            var refDay = moment(model.calendar.dayForWeek).day(1);
                            model.calendar.days.forEach(function (day) {
                                if (item.dueDate && item.dueDate.format('YYYY-MM-DD') === refDay.format('YYYY-MM-DD')) {
                                    day.dailyEvents.push(item);
                                }

                                refDay.add('day', 1);
                            });
                        });

                        scope.calendar = model.calendar;

                        var timeslots = $('.timeslots');

                        if (timeslots.length === 8) {
                            model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, model.show.bShowHomeworksMinified);
                        }
                        // if days timeslots are not yet positioned
                        // wait until they are to create the homework panel
                        else {
                                var timerOccurences = 0;
                                var timer = setInterval(function () {
                                    timeslots = $('.timeslots');
                                    if (timeslots.length === 8) {
                                        clearInterval(timer);
                                        model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, model.show.bShowHomeworksMinified);
                                    }
                                    timerOccurences++;
                                    // 5s should be far than enough to have all timeslots loaded
                                    if (timerOccurences > 50) {
                                        clearInterval(timer);
                                    }
                                }, 100);
                            }
                    }

                    model.on('calendar.date-change', function () {
                        setDaysContent();
                        scope.$apply();
                    });

                    scope.$watchCollection('ngModel', function (newVal) {
                        setDaysContent();
                    });

                    $('body').on('click', function (e) {
                        if (e.target !== element[0] && element.find(e.target).length === 0) {
                            model.calendar.days.forEach(function (day) {
                                day.openDailyEvents = false;
                            });
                            scope.$apply();
                        }
                    });
                }
            };
        });
    });
})();

'use strict';

(function () {
		'use strict';

		AngularExtensions.addModuleConfig(function (module) {

				module.directive('diaryCalendar', function ($compile) {
						return {
								restrict: 'E',
								templateUrl: '/diary/public/js/directives/calendar/calendar.template.html',
								scope: {
										items: '=',
										itemTemplate: '@',
										readOnly: '=',
										displayTemplate: '=',
										onCreateOpenAction: '&'
								},

								controller: 'DiaryCalendarController',
								controllerAs: "DiaryCalendarCtrl",
								/*
              var refreshCalendar = function() {
                  model.calendar.clearScheduleItems();
                    $scope.items = _.where(_.map($scope.items, function(item) {
                      item.beginning = item.startMoment;
                      item.end = item.endMoment;
                      return item;
                  }), {
                      is_periodic: false
                  });
                    model.calendar.addScheduleItems($scope.items);
                  $scope.calendar = model.calendar;
                  $scope.moment = moment;
                  $scope.display.editItem = false;
                  $scope.display.createItem = false;
                    $scope.editItem = function(item) {
                      $scope.calendarEditItem = item;
                      $scope.display.editItem = true;
                  };
                    $scope.createItem = function(day, timeslot) {
                      $scope.newItem = {};
                      var year = model.calendar.year;
                      if (day.index < model.calendar.firstDay.dayOfYear()) {
                          year++;
                      }
                      $scope.newItem.beginning = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.start);
                      $scope.newItem.end = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.end);
                      model.calendar.newItem = $scope.newItem;
                      $scope.onCreateOpen();
                  };
                    $scope.closeCreateWindow = function() {
                      $scope.display.createItem = false;
                      $scope.onCreateClose();
                  };
                    $scope.updateCalendarWeek = function() {
                      //annoying new year workaround
                      if (moment(model.calendar.dayForWeek).week() === 1 && moment(model.calendar.dayForWeek).dayOfYear() > 7) {
                          model.calendar = new calendar.Calendar({
                              week: moment(model.calendar.dayForWeek).week(),
                              year: moment(model.calendar.dayForWeek).year() + 1
                          });
                      } else if (moment(model.calendar.dayForWeek).week() === 53 && moment(model.calendar.dayForWeek).dayOfYear() < 7) {
                          model.calendar = new calendar.Calendar({
                              week: moment(model.calendar.dayForWeek).week(),
                              year: moment(model.calendar.dayForWeek).year() - 1
                          });
                      } else {
                          model.calendar = new calendar.Calendar({
                              week: moment(model.calendar.dayForWeek).week(),
                              year: moment(model.calendar.dayForWeek).year()
                          });
                      }
                      model.trigger('calendar.date-change');
                      refreshCalendar();
                  };
                    $scope.previousTimeslots = function() {
                      calendar.startOfDay--;
                      calendar.endOfDay--;
                      model.calendar = new calendar.Calendar({
                          week: moment(model.calendar.dayForWeek).week(),
                          year: moment(model.calendar.dayForWeek).year()
                      });
                      refreshCalendar();
                  };
                    $scope.nextTimeslots = function() {
                      calendar.startOfDay++;
                      calendar.endOfDay++;
                      model.calendar = new calendar.Calendar({
                          week: moment(model.calendar.dayForWeek).week(),
                          year: moment(model.calendar.dayForWeek).year()
                      });
                      refreshCalendar();
                  };
              };
                calendar.setCalendar = function(cal) {
                  model.calendar = cal;
                    refreshCalendar();
              };
                $timeout(function() {
                  refreshCalendar();
                  $scope.$watchCollection('items', refreshCalendar);
              }, 0);
              $scope.refreshCalendar = refreshCalendar;
        */
								link: function link(scope, element, attributes) {
										/*
                 var allowCreate;
                 scope.display = {};
                 scope.display.readonly = false;
                 attributes.$observe('createTemplate', function() {
                     if (attributes.createTemplate) {
                         template.open('schedule-create-template', attributes.createTemplate);
                         allowCreate = true;
                     }
                     if (attributes.displayTemplate) {
                         template.open('schedule-display-template', attributes.displayTemplate);
                     }
                 });
                 attributes.$observe('readonly', function(){
                     if(attributes.readonly && attributes.readonly !== 'false'){
                         scope.display.readonly = true;
                     }
                     if(attributes.readonly && attributes.readonly == 'false'){
                         scope.display.readonly = false;
                     }
                 });
                   scope.items = scope.$eval(attributes.items);
                 scope.onCreateOpen = function() {
                     if (!allowCreate) {
                         return;
                     }
                     scope.$eval(attributes.onCreateOpen);
                     scope.display.createItem = true;
                 };
                 scope.onCreateClose = function() {
                     scope.$eval(attributes.onCreateClose);
                 };
                 scope.$watch(function() {
                     return scope.$eval(attributes.items)
                 }, function(newVal) {
                     scope.items = newVal;
                 });
          	*/
								}
						};
				});
		});
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        module.controller("DiaryCalendarController", controller);

        function controller($scope, $timeout) {
            // use controllerAs practice
            var vm = this;

            /*
             * Initilisation function
             */
            init();

            function init() {
                //display options
                vm.display = {
                    editItem: false,
                    createItem: false,
                    readonly: $scope.readOnly
                };

                $scope.firstDay = !$scope.firstDay ? moment() : $scope.firstDay;

                // create calendar objet
                vm.calendar = new calendar.Calendar({
                    week: moment($scope.firstDay).week(),
                    year: moment($scope.firstDay).year()
                });

                //set items watcher
                $scope.$watch('items', function (n, o) {
                    vm.refreshCalendar();
                });
                // add event listener
                $scope.$on('calendar.refreshItems', function () {
                    console.log("receive calendar refreshitems event");
                    vm.refreshCalendar();
                });

                /**
                 * Used to know if user clicked on calendar event
                 * or is dragging  to prevent ng-click
                 */
                vm.itemMouseEvent = {
                    lastMouseDownTime: undefined,
                    lastMouseClientX: undefined,
                    lastMouseClientY: undefined
                };
            }

            /*
             * refresh calendar every items modification
             */
            vm.refreshCalendar = function () {
                console.log("refresh calendar");
                vm.calendar.clearScheduleItems();

                var scheduleItems = _.where(_.map($scope.items, function (item) {
                    item.beginning = item.startMoment;
                    item.end = item.endMoment;
                    return item;
                }), {
                    is_periodic: false
                });
                vm.calendar.addScheduleItems(scheduleItems);
                $timeout(function () {
                    vm.disposeItems();
                });
            };

            /*
            * dispose item elements
            */
            vm.disposeItems = function () {
                //reinit colmap id
                console.log("disposeItems called");
                _.each(vm.calendar.days.all, function (day) {
                    vm.eraseColMapId(day);
                });
                //recal all collisions
                _.each(vm.calendar.days.all, function (day) {
                    //vm.calcAllCollisions(day);
                    _.each(day.scheduleItems.all, function (item) {
                        vm.calcAllCollisions2(item, day);
                    });
                });
                //dispose each items
                _.each(vm.calendar.days.all, function (day) {
                    _.each(day.scheduleItems.all, function (item) {
                        vm.disposeItem(item, day);
                    });
                });
            };

            /*
            *   erase col map id
            */
            vm.eraseColMapId = function (day) {
                _.each(day.scheduleItems.all, function (item) {
                    delete item.calendarGutter;
                    delete item.colMapId;
                });
            };

            vm.between = function (date, start, end) {
                return date.isAfter(start) && date.isBefore(end);
            };

            vm.calcAllCollisions2 = function (item, day) {
                var calendarGutter = 0;
                var collision = true;
                while (collision) {
                    collision = false;
                    day.scheduleItems.forEach(function (scheduleItem) {
                        if (scheduleItem === item) {
                            return;
                        }
                        /*if ((scheduleItem.beginning.isBefore(item.end) && scheduleItem.end.isAfter(item.beginning)) ||
                          (scheduleItem.end.isBefore(item.beginning) && scheduleItem.beginning.isAfter(item.end))) {
                          */
                        if (vm.between(item.beginning, scheduleItem.beginning, scheduleItem.end) || vm.between(item.end, scheduleItem.beginning, scheduleItem.end) || vm.between(scheduleItem.end, item.beginning, item.end)) {
                            console.log("collision found : ", scheduleItem, item);
                            if (scheduleItem.calendarGutter === calendarGutter) {
                                calendarGutter++;
                                collision = true;
                            }
                        } else {
                            console.log("no collision found : ", scheduleItem, item);
                        }
                    });
                }
                item.calendarGutter = calendarGutter;
            };

            /*
            * Calc all colision map
            */
            vm.calcAllCollisions = function (day) {
                var collisionMap = {};
                //erase old mapId referencies

                //cal collisionMap
                _.each(day.scheduleItems.all, function (item) {
                    vm.getItemCollisions(collisionMap, item, day);
                });

                //set indent id
                _.each(collisionMap, function (inCollision) {
                    var calendarGutter = 0;
                    // sort collision array to have decrease aparence
                    inCollision.sort(function (itema, itemb) {
                        return itema.startMoment.isAfter(itemb.startMoment);
                    });
                    _.each(inCollision, function (items) {
                        items.calendarGutter = calendarGutter++;
                    });
                });
                console.log("collisionMap", collisionMap);
            };

            /*
            *   populate the collision map for each item
            */
            vm.getItemCollisions = function (collisionMap, item, day) {

                if (item.colMapId !== undefined) {
                    return;
                }

                var collisionArray = [item];
                var colMapId = void 0;
                //collisionArray = collisionMap[item.colMapId];

                //get all collisions in an array
                _.each(day.scheduleItems.all, function (scheduleItem) {
                    if (scheduleItem !== item && scheduleItem.beginning < item.end && scheduleItem.end > item.beginning) {
                        //scheduleItem.colMapId = item.colMapId;
                        if (scheduleItem.colMapId !== undefined) {
                            console.log("foundColMapId", scheduleItem.colMapId);
                            colMapId = scheduleItem.colMapId;
                        } else {
                            collisionArray.push(scheduleItem);
                        }
                    }
                });

                //if not indexed
                if (colMapId === undefined) {
                    colMapId = Object.keys(collisionMap).length;
                    collisionMap[colMapId] = [];
                }
                // set colMapId
                collisionArray = _.map(collisionArray, function (it) {
                    console.log("set colMapId", colMapId);
                    it.colMapId = colMapId;
                    return it;
                });

                collisionMap[colMapId] = collisionMap[colMapId].concat(collisionArray);
            };

            /*
            * dispose on item
            */
            vm.disposeItem = function (item, day) {
                if (!item.$element) {
                    console.log("no element founds");
                    return;
                }
                var element = item.$element;

                var parentSchedule = element.parents('.schedule');
                var scheduleItemEl = element.children('.schedule-item');

                var cellWidth = element.parent().width() / 12;
                var startDay = item.beginning.dayOfYear();
                var endDay = item.end.dayOfYear();

                var hours = calendar.getHours(item, day);
                var itemWidth = day.scheduleItems.scheduleItemWidth(item);

                var dayWidth = parentSchedule.find('.day').width();

                scheduleItemEl.css({
                    width: itemWidth + '%'
                });

                var calendarGutter = 0;

                var beginningMinutesHeight = item.beginning.minutes() * calendar.dayHeight / 60;
                var endMinutesHeight = item.end.minutes() * calendar.dayHeight / 60;
                var top = (hours.startTime - calendar.startOfDay) * calendar.dayHeight + beginningMinutesHeight;
                scheduleItemEl.height((hours.endTime - hours.startTime) * calendar.dayHeight - beginningMinutesHeight + endMinutesHeight + 'px');

                scheduleItemEl.css({
                    top: top + 'px',
                    left: item.calendarGutter * (itemWidth * dayWidth / 100) + 'px'
                });

                var container = element.find('container');
                if (top < 0) {
                    container.css({
                        top: Math.abs(top) - 5 + 'px'
                    });
                    container.height(element.children('.schedule-item').height() + top + 5);
                } else {
                    container.css({
                        top: 0 + 'px'
                    });
                    container.css({
                        height: '100%'
                    });
                }
            };

            /*
             *   edit item
             *  TODO unused??
             */
            /*$scope.editItem = function(item) {
                $scope.calendarEditItem = item;
                vm.display.editItem = true;
            };*/

            vm.createItem = function (day, timeslot) {
                $scope.newItem = {};
                var year = vm.calendar.year;
                if (day.index < vm.calendar.firstDay.dayOfYear()) {
                    year++;
                }
                $scope.newItem.beginning = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.start);
                $scope.newItem.end = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.end);
                vm.calendar.newItem = $scope.newItem;
                $scope.onCreateOpen();
            };

            vm.closeCreateWindow = function () {
                vm.display.createItem = false;
                $scope.onCreateClose();
            };

            vm.updateCalendarWeek = function () {
                //annoying new year workaround
                if (moment(vm.calendar.dayForWeek).week() === 1 && moment(vm.calendar.dayForWeek).dayOfYear() > 7) {
                    vm.calendar = new calendar.Calendar({
                        week: moment(vm.calendar.dayForWeek).week(),
                        year: moment(vm.calendar.dayForWeek).year() + 1
                    });
                } else if (moment(vm.calendar.dayForWeek).week() === 53 && moment(vm.calendar.dayForWeek).dayOfYear() < 7) {
                    vm.calendar = new calendar.Calendar({
                        week: moment(vm.calendar.dayForWeek).week(),
                        year: moment(vm.calendar.dayForWeek).year() - 1
                    });
                } else {
                    vm.calendar = new calendar.Calendar({
                        week: moment(vm.calendar.dayForWeek).week(),
                        year: moment(vm.calendar.dayForWeek).year()
                    });
                }
                model.trigger('calendar.date-change');
                vm.refreshCalendar();
            };

            $scope.previousTimeslots = function () {
                calendar.startOfDay--;
                calendar.endOfDay--;
                vm.calendar = new calendar.Calendar({
                    week: moment(vm.calendar.dayForWeek).week(),
                    year: moment(vm.calendar.dayForWeek).year()
                });
                vm.refreshCalendar();
            };

            $scope.nextTimeslots = function () {
                calendar.startOfDay++;
                calendar.endOfDay++;
                vm.calendar = new calendar.Calendar({
                    week: moment(vm.calendar.dayForWeek).week(),
                    year: moment(vm.calendar.dayForWeek).year()
                });
                vm.refreshCalendar();
            };

            $scope.onCreateOpen = function () {
                /*if (!allowCreate) {
                    return;
                }*/

                $scope.onCreateOpenAction();
                //$scope.$eval(attributes.onCreateOpen);
                vm.display = {
                    createItem: true
                };
            };
            $scope.onCreateClose = function () {
                $scope.$eval(attributes.onCreateClose);
            };

            $scope.setMouseDownTime = function ($event) {
                vm.itemMouseEvent.lastMouseDownTime = new Date().getTime();
                vm.itemMouseEvent.lastMouseClientX = $event.clientX;
                vm.itemMouseEvent.lastMouseClientY = $event.clientY;
            };

            /**
             * Redirect to path only when user is doind a real click.
             * If user is draging item redirect will not be called
             * @param item Lesson being clicked or dragged
             * @param $event
             */
            $scope.openOnClickSaveOnDrag = function (item, $event) {

                return;
                console.log("openOnClickSaveOnDrag called");
                var path = '/editLessonView/' + item.id;

                // gap between days is quite important
                var xMouseMoved = Math.abs(vm.itemMouseEvent.lastMouseClientX - $event.clientX) > 30;
                // gap between minutes is tiny so y mouse move detection must be accurate
                // so user can change lesson time slightly
                var yMouseMoved = Math.abs(vm.itemMouseEvent.lastMouseClientY - $event.clientY) > 0;

                // fast click = no drag = real click
                // or cursor did not move
                if (!xMouseMoved && !yMouseMoved || new Date().getTime() - vm.itemMouseEvent.lastMouseDownTime < 300) {
                    // do not redirect to lesson view if user clicked on checkbox
                    if (!($event.target && $event.target.type === "checkbox")) {
                        $scope.redirect(path);
                    }
                } else {
                    $timeout(vm.refreshCalendar);
                }
            };
        }
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        module.directive('diaryScheduleItem', function ($compile) {
            return {
                restrict: 'E',
                require: '^diary-calendar',
                template: '<div class="schedule-item" resizable horizontal-resize-lock draggable>\n                                <container template="schedule-display-template" class="absolute"></container>\n                            </div>',
                controller: function controller($scope, $element, $timeout) {

                    console.log("new controller");
                    var vm = this;

                    $scope.item.$element = $element;
                    console.log("element : ", $scope.item.$element);

                    var parentSchedule = $element.parents('.schedule');
                    var scheduleItemEl = $element.children('.schedule-item');
                    scheduleItemEl.find('container').append($compile($scope.displayTemplate)($scope));

                    var dayWidth = parentSchedule.find('.day').width();

                    if ($scope.item.beginning.dayOfYear() !== $scope.item.end.dayOfYear() || $scope.item.locked) {
                        scheduleItemEl.removeAttr('resizable');
                        scheduleItemEl.removeAttr('draggable');
                        scheduleItemEl.unbind('mouseover');
                        scheduleItemEl.unbind('click');
                        scheduleItemEl.data('lock', true);
                    }

                    vm.getTimeFromBoundaries = function () {
                        console.log("getTimeFromBoundaries");
                        // compute element positon added to heiht of 7 hours ao avoid negative value side effect
                        var topPos = scheduleItemEl.position().top + calendar.dayHeight * calendar.startOfDay;
                        var startTime = moment(); //.utc();
                        startTime.hour(Math.floor(topPos / calendar.dayHeight));
                        startTime.minute(topPos % calendar.dayHeight * 60 / calendar.dayHeight);

                        var endTime = moment(); //.utc();
                        endTime.hour(Math.floor((topPos + scheduleItemEl.height()) / calendar.dayHeight));
                        endTime.minute((topPos + scheduleItemEl.height()) % calendar.dayHeight * 60 / calendar.dayHeight);

                        startTime.year(model.calendar.year);
                        endTime.year(model.calendar.year);

                        var days = $element.parents('.schedule').find('.day');
                        var center = scheduleItemEl.offset().left + scheduleItemEl.width() / 2;
                        var dayWidth = days.first().width();
                        days.each(function (index, item) {
                            var itemLeft = $(item).offset().left;
                            if (itemLeft < center && itemLeft + dayWidth > center) {
                                var day = index + 1;
                                var week = model.calendar.week;
                                endTime.week(week);
                                startTime.week(week);
                                if (day === 7) {
                                    day = 0;
                                    endTime.week(week + 1);
                                    startTime.week(week + 1);
                                }
                                endTime.day(day);
                                startTime.day(day);
                            }
                        });
                        return {
                            startTime: startTime,
                            endTime: endTime
                        };
                    };

                    scheduleItemEl.on('stopResize', function () {
                        console.log("stopResize called");
                        var newTime = vm.getTimeFromBoundaries();
                        $scope.item.beginning = newTime.startTime;
                        $scope.item.end = newTime.endTime;

                        //$scope.item.date = newTime.startTime;
                        $scope.item.startMoment = newTime.startTime;
                        $scope.item.endMoment = moment(newTime.endTime);

                        $scope.item.data.beginning = newTime.startTime;
                        $scope.item.data.end = newTime.endTime;
                        $scope.item.data.date = newTime.startTime;
                        $scope.item.data.startMoment = newTime.startTime;
                        $scope.item.data.endMoment = moment(newTime.endTime);

                        $scope.item.startTime = moment(newTime.startTime).format('HH:mm:ss');
                        $scope.item.endTime = moment(newTime.endTime).format('HH:mm:ss');

                        $scope.$emit('calendar.refreshItems');
                    });

                    scheduleItemEl.on('stopDrag', function () {
                        console.log("stopDrag called");
                        var newTime = vm.getTimeFromBoundaries();
                        console.log(newTime);
                        $scope.item.beginning = newTime.startTime;
                        $scope.item.end = newTime.endTime;

                        $scope.item.date = newTime.startTime;
                        $scope.item.startMoment = newTime.startTime;
                        $scope.item.endMoment = moment(newTime.endTime);

                        $scope.item.data.beginning = newTime.startTime;
                        $scope.item.data.end = newTime.endTime;
                        $scope.item.data.date = newTime.startTime;
                        $scope.item.data.startMoment = newTime.startTime;
                        $scope.item.data.endMoment = moment(newTime.endTime);

                        console.log($scope.item.data);

                        $scope.item.startTime = moment(newTime.startTime).format('HH:mm:ss');
                        console.log(moment(newTime.startTime).format('HH:mm:ss'));
                        $scope.item.endTime = moment(newTime.endTime).format('HH:mm:ss');

                        $timeout(function () {
                            $scope.$emit('calendar.refreshItems');
                        });
                    });
                },

                link: function link(scope, element, attributes) {}
            };
        });
    });
})();

'use strict';

(function () {
		'use strict';

		AngularExtensions.addModuleConfig(function (module) {
				module.directive('entDropdown', function () {
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
								link: function link(scope, element, attrs) {
										scope.listVisible = false;
										scope.isPlaceholder = true;
										scope.searchPerformed = false;
										scope.otherAudiences = [];
										scope.translated_placeholder = lang.translate(scope.placeholder);

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

										scope.searchAudiences = function () {
												http().get('diary/classes/list/' + scope.school).done(function (structureData) {
														scope.otherAudiences = _.map(structureData, function (data) {
																var audience = {};
																audience.structureId = scope.school;
																audience.type = 'class';
																audience.typeLabel = data.className === 'class' ? lang.translate('diary.audience.class') : lang.translate('diary.audience.group');
																audience.id = data.classId;
																audience.name = data.className;
																return audience;
														});

														scope.otherAudiences = _.reject(scope.otherAudiences, function (audience) {
																return _.contains(_.pluck(scope.list, 'name'), audience.name);
														});

														scope.searchPerformed = true;
														scope.listVisible = true;
														scope.$apply();
												}).error(function (e) {
														if (typeof cbe === 'function') {
																cbe(model.parseError(e));
														}
												});
										};

										scope.$watch("selected", function (value) {
												scope.isPlaceholder = true;
												if (scope.selected !== null && scope.selected !== undefined) {
														scope.isPlaceholder = scope.selected[scope.property] === undefined;
														scope.display = scope.selected[scope.property];

														if (scope.lesson && scope.lesson.id) {
																if (scope.lesson.homeworks.all.length > 0) {
																		scope.$parent.refreshHomeworkLoads(scope.lesson);
																}

																scope.lesson.previousLessonsLoaded = false;
																scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
														}

														if (scope.homework && scope.homework.audience) {
																scope.$parent.showHomeworksLoad(scope.homework, null, scope.$apply);
														}
												}
										});

										$(element.context.ownerDocument).click(function (event) {
												scope.listVisible = false;
										});
								}
						};
				});
		});
})();

'use strict';

(function () {
  'use strict';

  AngularExtensions.addModuleConfig(function (module) {
    module.directive("itemCalendar", directive);

    function directive() {
      return {
        restrict: 'E',
        templateUrl: '/diary/public/js/directives/item-calendar/item-calendar.template.html'
      };
    }
  });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        /**
         * Directive for result items
         */
        module.directive('quickSearchItem', function () {
            return {
                restrict: "E",
                templateUrl: "diary/public/template/quick-search-item.html",
                scope: false,
                link: function link(scope, element) {

                    var angElement = angular.element(element);

                    angElement.on('drag', function () {
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
                        } catch (e) {
                            $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
                        }
                    };
                }
            };
        });
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        /**
             * Directive to perform a quick search among lessons and homeworks
             */
        module.directive('quickSearch', function () {
            return {
                restrict: "E",
                templateUrl: "diary/public/template/quick-search.html",
                scope: {
                    ngModel: '=',
                    /**
                     * Item type 'lesson' or 'homework'
                     */
                    itemType: "="
                },
                link: function link(scope, element, attrs, location) {

                    /**
                     * Number of items displayed by default
                     * @type {number}
                     */
                    var defaultMaxPedagogicItemsDisplayed = 6;

                    scope.maxPedagogicItemsDisplayed = defaultMaxPedagogicItemsDisplayed;

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
                    scope.panelVisible = false;

                    /**
                     * Pedagogic items search results
                     * @type {Array}
                     */
                    scope.pedagogicItems = [];

                    /**
                     * Last pressed key time
                     * Prevent searching
                     */
                    scope.lastPressedKeyTime;

                    /**
                     * Pedagogic items of the day displayed.
                     * Max
                     */
                    scope.quickSearchPedagogicDaysDisplayed = new Array();

                    /**
                     * Default search time = end of current week
                     */
                    scope.endDate = moment().endOf('week');

                    /**
                     * Text for searching through label, title, ...
                     * @type {string}
                     */
                    scope.multiSearch = "";

                    var timeout;

                    /**
                     * Flag indicating it's first search (used for not displaying the 'show more' arrow
                     * @type {boolean}
                     */
                    scope.isFirstSearch = true;

                    var pedagogicItemDisplayedIdxStart = 0;
                    var pedagogicItemDisplayedIdxEnd = defaultMaxPedagogicItemsDisplayed - 1; // array index starts at 0


                    var initQuickSearch = function initQuickSearch() {
                        scope.endDate = moment().endOf('week');
                        scope.quickSearchPedagogicDays = new Array();
                    };

                    initQuickSearch();

                    var isQuickSearchLesson = attrs.itemType === 'lessontype' ? true : false;
                    scope.itemType = isQuickSearchLesson ? 'lesson' : 'homework';
                    scope.panelLabel = isQuickSearchLesson ? lang.translate('diary.lessons') : lang.translate('diary.homeworks');

                    scope.setPanelVisible = function (isVisible, $event) {

                        if (!$event.target || $event.target.type !== "text") {

                            scope.panelVisible = isVisible;

                            /**
                             * On first panel maximize search items
                             */
                            if (scope.isFirstSearch) {
                                scope.quickSearch(true);
                            }

                            // hide the other panel (panel or homework)
                            if (scope.itemType == 'lesson') {
                                // tricky way to get the other directive for homeworks
                                if (isQuickSearchLesson) {
                                    scope.$parent.$$childTail.panelVisible = false;
                                }
                            } else if (scope.itemType == 'homework') {
                                if (!isQuickSearchLesson) {
                                    scope.$parent.$$childHead.panelVisible = false;
                                }
                            }

                            // let enough room to display quick search panel maximized
                            if (isVisible) {
                                $('#mainDiaryContainer').width('84%');
                                $('.quick-search').width('16%');
                            } else {
                                $('#mainDiaryContainer').width('97%');
                                $('.quick-search').width('2%');
                            }
                        }
                    };

                    /**
                     * By default X pedagogic items are displayed.
                     * This allows to display more items
                     */
                    scope.quickSearchNextPedagogicDays = function () {

                        if (!scope.isNextPedagogicDaysDisplayed) {
                            return;
                        }

                        pedagogicItemDisplayedIdxStart += pedagogicDaysDisplayedStep;
                        pedagogicItemDisplayedIdxEnd += pedagogicDaysDisplayedStep;

                        scope.maxPedagogicItemsDisplayed = Math.max(scope.maxPedagogicItemsDisplayed, pedagogicItemDisplayedIdxEnd);

                        scope.quickSearch(false);
                    };

                    /**
                     *
                     */
                    scope.quickSearchPreviousPedagogicDays = function () {

                        if (!scope.isPreviousPedagogicDaysDisplayed) {
                            return;
                        }

                        pedagogicItemDisplayedIdxStart -= pedagogicDaysDisplayedStep;
                        pedagogicItemDisplayedIdxStart = Math.max(0, pedagogicItemDisplayedIdxStart);
                        pedagogicItemDisplayedIdxEnd -= pedagogicDaysDisplayedStep;

                        scope.quickSearch(false);
                    };

                    /**
                     *  If true will display the orange arrow to display more items
                     *  else not.
                     * @type {boolean}
                     */
                    scope.isNextPedagogicDaysDisplayed = false;

                    /**
                     * Displays "no results" if true else blank
                     * @type {boolean}
                     */
                    scope.displayNoResultsText = false;

                    /**
                     * Compute if the button for recent items should be displayed
                     * @returns {boolean}
                     */
                    var isPreviousPedagogicDaysDisplayed = function isPreviousPedagogicDaysDisplayed() {
                        return !scope.isFirstSearch && 0 < pedagogicItemDisplayedIdxStart && scope.quickSearchPedagogicDaysDisplayed.length > 0;
                    };

                    /**
                     * Returns true if the "next" arrow button should be displayed meaning
                     * there are other items
                     * @returns {boolean}
                     */
                    var isNextPedagogicDaysDisplayed = function isNextPedagogicDaysDisplayed(pedagogicItemCount) {
                        return !scope.isFirstSearch && pedagogicItemDisplayedIdxStart <= pedagogicItemCount && scope.quickSearchPedagogicDaysDisplayed.length > 0 && scope.quickSearchPedagogicDaysDisplayed.length >= pedagogicDaysDisplayedStep;
                    };

                    var performQuickSearch = function performQuickSearch() {

                        clearTimeout(timeout); // this way will not run infinitely

                        var params = new SearchForm(true);
                        params.initForTeacher();
                        params.isQuickSearch = true;
                        params.limit = scope.maxPedagogicItemsDisplayed + 1; // +1 thingy will help to know if extra items can be displayed
                        var period = moment(model.calendar.dayForWeek).day(1);
                        period.add(-60, 'days').format('YYYY-MM-DD');
                        params.startDate = period.format('YYYY-MM-DD');
                        params.endDate = moment(scope.endDate).add(1, 'days');
                        params.sortOrder = "DESC";

                        if (scope.itemType == 'lesson') {
                            params.multiSearchLesson = scope.multiSearch.trim();
                        } else {
                            params.multiSearchHomework = scope.multiSearch.trim();
                        }

                        params.returnType = scope.itemType;

                        model.pedagogicDaysQuickSearch = new Array();
                        scope.quickSearchPedagogicDaysDisplayed.length = 0;

                        model.performPedagogicItemSearch(params, model.isUserTeacher(),
                        // callback
                        function () {
                            scope.isFirstSearch = false;
                            scope.quickSearchPedagogicDays = isQuickSearchLesson ? model.pedagogicDaysQuickSearchLesson : model.pedagogicDaysQuickSearchHomework;
                            scope.displayNoResultsText = scope.quickSearchPedagogicDays.length == 0;

                            var idxSearchPedagogicItem = 0;
                            scope.quickSearchPedagogicDaysDisplayed = new Array();

                            // count number of displayed items
                            scope.quickSearchPedagogicDays.forEach(function (pedagogicDay) {

                                pedagogicDay.pedagogicItemsOfTheDay.forEach(function (pedagogicItemOfTheDay) {
                                    if (pedagogicItemDisplayedIdxStart <= idxSearchPedagogicItem && idxSearchPedagogicItem <= pedagogicItemDisplayedIdxEnd) {
                                        scope.quickSearchPedagogicDaysDisplayed.push(pedagogicItemOfTheDay);
                                    }
                                    idxSearchPedagogicItem++;
                                });
                            });

                            // enable/disable next/previous items arrow buttons
                            scope.isPreviousPedagogicDaysDisplayed = isPreviousPedagogicDaysDisplayed();
                            scope.isNextPedagogicDaysDisplayed = isNextPedagogicDaysDisplayed(idxSearchPedagogicItem);
                            scope.$apply();
                        },
                        // callback on error
                        function (cbe) {
                            console.error('Callback errors');
                            console.log(cbe);
                            notify.error(cbe.message);
                        });
                    };

                    scope.quickSearch = function (resetMaxDisplayedItems) {

                        if (resetMaxDisplayedItems) {
                            scope.maxPedagogicItemsDisplayed = defaultMaxPedagogicItemsDisplayed;
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

                    var handleCalendarLessonsDrop = function handleCalendarLessonsDrop() {

                        var timeslots = $('.days').find('.timeslot');

                        var timeslotsPerDay = timeslots.length / 7;

                        timeslots.each(function (index) {

                            var timeslot = $(this);

                            // allow drag
                            timeslot.on('dragover', function ($event) {
                                event.preventDefault();
                            });

                            timeslot.on('dragenter', function (event) {
                                timeslot.css('border', 'blue 2px dashed');
                                timeslot.css('border-radius', '3px');
                                //timeslot.css('background-color', 'blue');
                            });

                            timeslot.on('dragleave', function (event) {
                                //timeslot.css('background-color', '');
                                timeslot.css('border', '');
                                timeslot.css('border-radius', '');
                            });

                            timeslot.on('drop', function ($event) {
                                $event.preventDefault();

                                timeslot.css('background-color', '');

                                // duplicate dragged lesson
                                var pedagogicItemOfTheDay = JSON.parse($event.originalEvent.dataTransfer.getData("application/json"));

                                // do not drop if item type is not a lesson
                                if (pedagogicItemOfTheDay.type_item !== 'lesson') {
                                    return;
                                }

                                var newLesson = new Lesson();
                                newLesson.id = pedagogicItemOfTheDay.id;

                                var newLessonDayOfWeek = Math.floor(index / timeslotsPerDay) + 1;
                                var newLessonStartTime = model.startOfDay + index % timeslotsPerDay;
                                var newLessonEndTime = newLessonStartTime + 1;

                                newLesson.load(false, function () {
                                    // will force new lesson to be created in DB
                                    newLesson.id = null;

                                    // startTime and end format from db is "HH:MM:SS" as text type
                                    // for lesson save startTime need to be moment time type with date
                                    newLesson.date = moment(newLesson.date);
                                    newLesson.startTime = moment(newLesson.date.format('YYYY-MM-DD') + ' ' + newLesson.startTime);
                                    newLesson.startTime.hour(newLessonStartTime);
                                    newLesson.startTime.minute(0);
                                    newLesson.startTime.day(newLessonDayOfWeek);

                                    newLesson.endTime = moment(newLesson.date.format('YYYY-MM-DD') + ' ' + newLesson.endTime);
                                    newLesson.endTime.hour(newLessonEndTime);
                                    newLesson.endTime.minute(0);
                                    newLesson.endTime.day(newLessonDayOfWeek);
                                    newLesson.endTime.week(model.calendar.week);

                                    newLesson.date.day(newLessonDayOfWeek);
                                    newLesson.date.week(model.calendar.week);

                                    newLesson.state = 'draft';

                                    newLesson.save(function (data) {
                                        window.location = '/diary#/editLessonView/' + newLesson.id;
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
                    if (!model.lessonsDropHandled) {
                        setTimeout(handleCalendarLessonsDrop, 2000);
                        model.lessonsDropHandled = true;
                    }

                    var handleCalendarHomeworksDrop = function handleCalendarHomeworksDrop() {

                        var timeslots = $('.homeworkpanel');

                        var homeworkSlotsPerDay = model.homeworksPerDayDisplayed; // 1;//timeslots.length / 7;

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
                                var pedagogicItemOfTheDay = JSON.parse($event.originalEvent.dataTransfer.getData("application/json"));

                                // do not drop if item type is not a lesson
                                if (pedagogicItemOfTheDay.type_item !== 'homework') {
                                    return;
                                }

                                var newHomework = new Homework();
                                newHomework.id = pedagogicItemOfTheDay.id;

                                var newHomeworkDayOfWeek = Math.floor(index / homeworkSlotsPerDay) + 1;

                                newHomework.load(function () {
                                    // will force new lesson to be created in DB
                                    newHomework.id = null;
                                    newHomework.lesson_id = null;
                                    newHomework.state = "draft";

                                    // startTime and end format from db is "HH:MM:SS" as text type for lesson save startTime need to be moment time type with date
                                    newHomework.dueDate = moment(newHomework.dueDate);
                                    newHomework.startTime = moment(newHomework.date.format('YYYY-MM-DD') + ' ' + newHomework.startTime);
                                    newHomework.startTime.day(newHomeworkDayOfWeek);

                                    // TODO refactor endTime = startTime + 1h
                                    newHomework.endTime = moment(newHomework.date.format('YYYY-MM-DD') + ' ' + newHomework.endTime);
                                    newHomework.endTime.day(newHomeworkDayOfWeek);
                                    newHomework.endTime.week(model.calendar.week);

                                    newHomework.dueDate.day(newHomeworkDayOfWeek);
                                    newHomework.dueDate.week(model.calendar.week);

                                    newHomework.save(function (data) {
                                        // remove homework from model so will force reload
                                        // needed because homework.dueDate need a specific format !
                                        var homework = model.homeworks.findWhere({ id: parseInt(newHomework.id) });
                                        model.homeworks.remove(homework);
                                        window.location = '/diary#/editHomeworkView/' + newHomework.id;
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
                    if (!model.homeworksDropHandled) {
                        setTimeout(handleCalendarHomeworksDrop, 2000);
                        model.homeworksDropHandled = true;
                    }
                }
            };
        });
    });
})();

"use strict";

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        module.directive('subjectPicker', function () {
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
                link: function link(scope, element) {

                    var sortBySubjectLabel = function sortBySubjectLabel(a, b) {
                        if (a.label > b.label) return 1;
                        if (a.label < b.label) return -1;
                        return 0;
                    };

                    scope.search = null;
                    scope.displaySearch = false;

                    // init suggested subjects with all subjects
                    scope.suggestedSubjects = new Array();

                    // custom subject collection
                    // containing base subject collection + current ones being created by used
                    var subjects = new Array();

                    model.subjects.all.forEach(function (subject) {
                        subjects.push(subject);
                    });

                    subjects.sort(sortBySubjectLabel);

                    var setNewSubject = function setNewSubject(subjectLabel) {

                        if (!subjectLabel) {
                            return;
                        }

                        subjectLabel = subjectLabel.trim();

                        var existingSubject = null;

                        for (var i = 0; i < subjects.length; i++) {
                            if (sansAccent(subjects[i].label).toUpperCase() === sansAccent(subjectLabel).toUpperCase()) {
                                existingSubject = subjects[i];
                            }
                        }

                        if (!existingSubject) {
                            scope.ngModel = new Subject();
                            scope.ngModel.label = subjectLabel;
                            scope.ngModel.id = null;
                            scope.ngModel.school_id = scope.lesson ? scope.lesson.audience.structureId : scope.homework.audience.structureId;
                            scope.ngModel.teacher_id = model.me.userId;
                            subjects.push(scope.ngModel);
                        } else {
                            scope.ngModel = existingSubject;
                        }
                    };

                    var initSuggestedSubjects = function initSuggestedSubjects() {
                        scope.suggestedSubjects = new Array();

                        for (var i = 0; i < subjects.length; i++) {
                            scope.suggestedSubjects.push(subjects[i]);
                        }
                    };

                    initSuggestedSubjects();

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
                            // subject may not have id if it's new one
                            else {
                                    return sansAccent(scope.ngModel.label) === sansAccent(subject.label);
                                }
                        } else {
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
                            var matchingSubjects = model.findSubjectsByLabel(scope.search);
                            scope.suggestedSubjects = new Array();

                            for (var i = 0; i < matchingSubjects.length; i++) {
                                scope.suggestedSubjects.push(matchingSubjects[i]);
                            }
                        } else {
                            initSuggestedSubjects();
                        }
                    };

                    scope.selectSubject = function (subject) {
                        scope.ngModel = subject;
                        scope.displaySearch = false;
                        if (scope.lesson) {
                            scope.lesson.previousLessonsLoaded = false;
                            scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
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
                }
            };
        });
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        module.directive('timePicker', function () {
            return {
                scope: {
                    ngModel: '=',
                    ngChange: '&'
                },
                transclude: true,
                replace: true,
                restrict: 'E',
                template: "<input type='text' />",
                link: function link(scope, element, attributes) {
                    var hideFunction = function hideFunction(e) {
                        var timepicker = element.data('timepicker');
                        if (!timepicker || element[0] === e.target || $('.bootstrap-timepicker-widget').find(e.target).length !== 0) {
                            return;
                        }
                        timepicker.hideWidget();
                    };
                    $('body, lightbox').on('click', hideFunction);
                    $('body, lightbox').on('focusin', hideFunction);
                    if (!$.fn.timepicker) {
                        $.fn.timepicker = function () {};
                        loader.asyncLoad('/' + infraPrefix + '/public/js/bootstrap-timepicker.js', function () {
                            // does not seem to work properly
                            element.timepicker({
                                showMeridian: false,
                                defaultTime: 'current'
                            });
                        });
                    }

                    scope.$watch('ngModel', function (newVal) {
                        if (!newVal) {
                            return;
                        }
                        element.val(newVal.format("HH:mm"));
                    });

                    element.on('focus', function () {
                        element.timepicker({
                            showMeridian: false,
                            defaultTime: 'current',
                            minuteStep: 5
                        });
                    });

                    element.on('change', function () {
                        var time = element.val().split(':');
                        if (scope.ngModel && scope.ngModel.hour) {
                            scope.ngModel.set('hour', time[0]);
                            scope.ngModel.set('minute', time[1]);
                            scope.$apply('ngModel');
                            scope.$parent.$eval(scope.ngChange);
                            scope.$parent.$apply();
                        }
                    });

                    element.on('show.timepicker', function () {
                        element.parents().find('lightbox').on('click.timepicker', function (e) {
                            if (!(element.parent().find(e.target).length || timepicker.$widget.is(e.target) || timepicker.$widget.find(e.target).length)) {
                                timepicker.hideWidget();
                            }
                        });
                    });
                }
            };
        });
    });
})();

'use strict';

/**
 * Model of attachment from
 * table diary.attachment (DB)
 * @constructor
 */
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
};

/**
 * Download the attachment
 */
Attachment.prototype.download = function () {
    window.location = '/workspace/document/' + this.document_id;
};

/**
 * Detach attachment to a lesson
 * Attachment link will be detached to back end on lesson save
 * @param item Lesson or homework
 * @param cb Callback
 * @param cbe Callback on error
 */
Attachment.prototype.detachFromItem = function (item, cb, cbe) {

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
        } else typeof cbe === 'function';
        {
            cbe();
        }
    }
};

"use strict";

function Child() {
    this.id; //String
    this.displayName; //String
    this.classId; //String
    this.className; //String
    this.selected = false;
}

;'use strict';

function Homework() {

    /**
     * used in ui in homework tab in lesson view
     * @type {boolean}
     */
    this.expanded = false;

    /**
     * Attachments
     */
    if (!this.attachments) {
        this.attachments = new Array();
    }

    /**
     * Delete calendar references of current homework
     */
    this.deleteModelReferences = function () {
        var idxHomeworkToDelete = model.homeworks.indexOf(this);

        // delete homework in calendar cache
        if (idxHomeworkToDelete >= 0) {
            model.homeworks.splice(idxHomeworkToDelete, 1);
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
}

Homework.prototype.api = {
    delete: '/diary/homework/:id'
};

Homework.prototype.save = function (cb, cbe) {

    var that = this;

    var updateOrCreateHomework = function updateOrCreateHomework() {
        if (that.id) {
            that.update(cb, cbe);
        } else {
            that.create(cb, cbe);
        }
    };

    // autocreates subject if it does not exists
    if (!this.subject.id) {
        this.subject.save(updateOrCreateHomework);
    } else {
        updateOrCreateHomework();
    }
};

/**
 * Returns true if current homework is attached to a lesson
 * @returns {boolean}
 */
Homework.prototype.isAttachedToLesson = function () {
    return typeof this.lesson_id !== 'undefined' && this.lesson_id != null;
};

Homework.prototype.isDraft = function () {
    return this.state === "draft";
};

Homework.prototype.isPublished = function () {
    return !this.isDraft();
};

/**
 * A directly publishable homework must exist in database and not linked to a lesson
 * @param toPublish
 * @returns {*|boolean} true if homework can be published directly
 */
Homework.prototype.isPublishable = function (toPublish) {
    return this.id && (toPublish ? this.isDraft() : this.isPublished()) && this.lesson_id == null;
};

Homework.prototype.changeState = function (toPublish) {
    this.state = toPublish ? 'published' : 'draft';
};

Homework.prototype.update = function (cb, cbe) {
    var url = '/diary/homework/' + this.id;

    var homework = this;
    http().putJson(url, this).done(function () {
        if (typeof cb === 'function') {
            cb();
        }
    }.bind(this)).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

Homework.prototype.create = function (cb, cbe) {
    var homework = this;
    http().postJson('/diary/homework', this).done(function (b) {
        homework.updateData(b);
        model.homeworks.pushAll([homework]);
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Load homework object from id
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Homework.prototype.load = function (cb, cbe) {

    var homework = this;

    var load = function load() {
        http().get('/diary/homework/' + homework.id).done(function (data) {
            homework.updateData(sqlToJsHomework(data));

            if (typeof cb === 'function') {
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    };

    // might occur when user pressed F5 on lesson view
    // needed to fill homework.audience and subject properties
    if (model.audiences.all.length === 0) {
        model.audiences.syncAudiences(function () {
            model.subjects.syncSubjects(load);
        });
    } else {
        load();
    }
};

/**
 * Deletes a list of homeworks
 * @param homeworks Homeworks to be deleted
 * @param cb Callback
 * @param cbe Callback on error
 */
Homework.prototype.deleteList = function (homeworks, cb, cbe) {
    model.deleteItemList(homeworks, 'homework', cb, cbe);
};

/**
 * Deletes the homework
 * @param Optional lesson attached to homework
 * @param cb Callback after delete
 * @param cbe Callback on error
 */
Homework.prototype.delete = function (lesson, cb, cbe) {

    var homework = this;

    var deleteHomeworkReferences = function deleteHomeworkReferences() {

        // delete homework from calendar cache
        model.homeworks.forEach(function (modelHomework) {
            if (modelHomework.id === homework.id) {
                model.homeworks.remove(modelHomework);
            }
        });

        if (lesson && lesson.homeworks) {
            lesson.homeworks.remove(homework);
        }
    };

    if (this.id) {
        http().delete('/diary/homework/' + this.id).done(function (b) {

            deleteHomeworkReferences();

            if (typeof cb === 'function') {
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    } else {
        deleteHomeworkReferences();

        if (typeof cb === 'function') {
            cb();
        }
    }
};

Homework.prototype.toJSON = function () {

    var json = {
        homework_title: this.title,
        subject_id: this.subject.id,
        homework_type_id: this.type.id,
        teacher_id: model.me.userId,
        school_id: this.audience.structureId,
        audience_id: this.audience.id,
        homework_due_date: moment(this.dueDate).format(DATE_FORMAT),
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

    if (!this.id) {
        created: moment(this.created).format('YYYY-MM-DD HH:mm:ss.SSSSS'); // "2016-07-05 11:48:22.18671"
    }

    return json;
};

'use strict';

function Lesson(data) {
    this.selected = false;
    //this.collection(Attachment);
    // initialize homeworks collection (see lib.js)
    if (!this.homeworks) {
        this.collection(Homework);
    }
    this.subject = data ? data.subject : new Subject();
    this.audience = data ? data.audience : new Audience();

    /**
     * Attachments
     */
    if (!this.attachments) {
        this.attachments = new Array();
    }

    var that = this;

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
        model.lessons.forEach(function (lesson) {
            if (lesson.id === that.id) {
                model.lessons.remove(lesson);
            }
        });
        // delete associated homeworks references
        var lessonHomeworks = model.homeworks.filter(function (homework) {
            return homework && homework.lesson_id === that.id;
        });

        lessonHomeworks.forEach(function (homework) {
            model.homeworks.remove(homework);
        });
    };
}

Lesson.prototype.api = {
    delete: '/diary/lesson/:id'
};

/**
 * Triggered when lesson item has stopped being dragged in calendar view
 * see angular-app.js scheduleItemEl.on('stopDrag').
 * Will auto-save lesson in db on item move/resize
 * @param cb
 * @param cbe
 */
Lesson.prototype.calendarUpdate = function (cb, cbe) {

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
            model.parseError(error);
        });
    }
};

/**
 * Save attached homeworks of lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.saveHomeworks = function (cb, cbe) {
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

            homework.save(function (x) {
                homeworkSavedCount++;
                // callback function once all homeworks saved
                if (homeworkSavedCount === homeworkCount) {
                    if (typeof cb === 'function') {
                        cb();
                    }
                }
            }, function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
            });
        });
    } else {
        if (typeof cb === 'function') {
            cb();
        }
    }
};

/**
 * Save lesson and attached homeworks
 * and sync calendar lessons and homeworks cache
 * @param cb
 * @param cbe
 */
Lesson.prototype.save = function (cb, cbe) {

    // startTime used for db save but startMoment in calendar view
    // startMoment day is given by lesson.date
    this.startMoment = model.getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.startTime));
    this.endMoment = model.getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.endTime));
    var that = this;

    var saveHomeworksAndSync = function saveHomeworksAndSync() {
        that.saveHomeworks(function () {
            syncLessonsAndHomeworks(cb);
        });
    };

    var updateOrCreateLesson = function updateOrCreateLesson() {
        if (that.id) {
            that.update(saveHomeworksAndSync, cbe);
        } else {
            that.create(saveHomeworksAndSync, cbe);
        }
    };

    // autocreates subject if it does not exists
    if (!this.subject.id) {
        this.subject.save(updateOrCreateLesson);
    } else {
        updateOrCreateLesson();
    }
};

/**
 *
 * @param idHomework
 * @returns {boolean}
 */
Lesson.prototype.hasHomeworkWithId = function (idHomework) {

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

Lesson.prototype.update = function (cb, cbe) {
    var url = '/diary/lesson/' + this.id;

    var lesson = this;

    http().putJson(url, this).done(function () {

        if (typeof cb === 'function') {
            cb();
        }
    }.bind(this)).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

Lesson.prototype.create = function (cb, cbe) {
    var lesson = this;
    http().postJson('/diary/lesson', this).done(function (b) {
        lesson.updateData(b);
        model.lessons.pushAll([lesson]);
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Deletes the lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.delete = function (cb, cbe) {

    var lesson = this;

    http().delete('/diary/lesson/' + this.id, this).done(function (b) {

        lesson.deleteModelReferences();

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Deletes a list of lessons
 * @param lessons Lessons to be deleted
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.deleteList = function (lessons, cb, cbe) {
    model.deleteItemList(lessons, 'lesson', cb, cbe);
};

/**
 * Load lesson object from id
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Lesson.prototype.load = function (loadHomeworks, cb, cbe) {

    var lesson = this;

    var load = function load() {
        http().get('/diary/lesson/' + lesson.id).done(function (data) {
            lesson.updateData(sqlToJsLesson(data));

            if (loadHomeworks) {
                model.loadHomeworksForLesson(lesson, cb, cbe);
            }

            if (typeof cb === 'function') {
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    };

    // might occur when user pressed F5 on lesson view
    if (model.audiences.all.length === 0) {
        model.audiences.syncAudiences(function () {
            model.subjects.syncSubjects(load);
        });
    } else {
        load();
    }
};

/**
 * Publishes the lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.publish = function (cb, cbe) {

    var jsonLesson = new Lesson();
    jsonLesson.id = this.id;
    jsonLesson.audience.structureId = this.structureId;

    http().postJson('/diary/lesson/publish', jsonLesson).done(function () {
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 *
 * JSON object corresponding to sql diary.lesson table columns
 */
Lesson.prototype.toJSON = function () {

    var json = {
        lesson_id: this.id,
        subject_id: this.subject.id,
        school_id: this.audience.structureId,
        // TODO missing teacher_id
        audience_id: this.audience.id,
        lesson_title: this.title,
        lesson_color: this.color,
        lesson_date: moment(this.date).format(DATE_FORMAT),
        lesson_start_time: moment(this.startTime).format('HH:mm'),
        lesson_end_time: moment(this.endTime).format('HH:mm'),
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

Lesson.prototype.addHomework = function (cb) {
    var homework = model.initHomework(this);
    this.homeworks.push(homework);
};

Lesson.prototype.deleteHomework = function (homework) {

    homework.delete(function (cb) {}, function (cbe) {});

    var homework = new Homework();
    homework.dueDate = this.date;
    homework.type = model.homeworkTypes.first();
    this.homeworks.push(homework);
};

Lesson.prototype.isDraft = function () {
    return this.state === "draft";
};

Lesson.prototype.isPublished = function () {
    return !this.isDraft();
};

Lesson.prototype.isPublishable = function (toPublish) {
    return this.id && this.state == (toPublish ? 'draft' : 'published');
};

/**
 * Change state of current and associated homeworks
 * @param isPublished
 */
Lesson.prototype.changeState = function (isPublished) {
    this.state = isPublished ? 'published' : 'draft';

    // change state of associated homeworks
    this.homeworks.forEach(function (homework) {
        var lessonHomework = homework;
        homework.state = isPublished ? 'published' : 'draft';

        var found = false;

        // change state of homeworks cache in calendar for current week
        model.homeworks.forEach(function (homeworkCache) {
            if (!found && homeworkCache.id == lessonHomework.id) {
                homeworkCache.state = isPublished ? 'published' : 'draft';
                found = true;
            }
        });
    });
};

"use strict";

function PedagogicDay() {
    this.selected = false;
    this.dayName = moment().format("dddd DD MMMM YYYY");
    this.shortName = this.dayName.substring(0, 2);
    this.shortDate = moment().format("DD/MM");
    this.pedagogicItemsOfTheDay = [];
    this.nbLessons = 0;
    this.nbHomeworks = 0;
}

PedagogicDay.prototype.numberOfItems = function () {
    return this.nbLessons + this.nbHomeworks;
};

PedagogicDay.prototype.resetCountValues = function () {
    var countItems = _.groupBy(this.pedagogicItemsOfTheDay, 'type_item');
    this.nbLessons = countItems['lesson'] ? countItems['lesson'].length : 0;
    this.nbHomeworks = countItems['homework'] ? countItems['homework'].length : 0;
};

'use strict';

function PedagogicItem() {
    this.selected = false;
}

PedagogicItem.prototype.deleteModelReferences = function () {
    model.deletePedagogicItemReferences(this.id);
};

PedagogicItem.prototype.changeState = function (toPublish) {
    //if item is a lesson may need to upgrade his related homework
    if (this.type_item === 'lesson') {
        var relatedToLesson = model.pedagogicDays.getItemsByLesson(this.id);
        relatedToLesson.forEach(function (item) {
            item.state = toPublish ? 'published' : 'draft';
        });
    } else {
        this.state = toPublish ? 'published' : 'draft';
    }
};

PedagogicItem.prototype.isPublished = function () {
    return this.state === 'published';
};

PedagogicItem.prototype.descriptionMaxSize = 140;

PedagogicItem.prototype.getPreviewDescription = function () {

    if (this.description) {
        if (this.description.length >= this.descriptionMaxSize) {
            this.preview_description = '<p class="itemPreview">' + $('<div>' + this.description + '</div>').text().substring(0, this.descriptionMaxSize) + '...</p>';
        } else {
            this.preview_description = this.description;
        }
    } else {
        this.preview_description = this.description;
    }
};

PedagogicItem.prototype.isPublishable = function (toPublish) {
    return this.id && this.state == (toPublish ? 'draft' : 'published') && (this.lesson_id == null || this.lesson_id == this.id); // id test to detect free homeworks
};

PedagogicItem.prototype.delete = function (cb, cbe) {

    var url = this.type_item == "lesson" ? '/diary/lesson/' : '/diary/homework/';
    var idToDelete = this.id;
    http().delete(url + idToDelete, this).done(function (b) {

        model.deletePedagogicItemReferences(idToDelete);

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

PedagogicItem.prototype.deleteList = function (items, cb, cbe) {

    // split into two arrays of PedagogicItem, one for the lessons, one for the homeworks
    var itemsByType = []; // array of array(s)

    if (items.length == 1) {
        itemsByType.push(items);
    } else {
        itemsByType = _.partition(items, function (item) {
            return item.type_item === 'lesson';
        });
    }

    var countdown = 0;

    if (itemsByType.length > 0) {
        countdown = itemsByType.length;

        itemsByType.forEach(function (arrayForTypeItem) {
            if (arrayForTypeItem.length > 0) {
                model.deleteItemList(arrayForTypeItem, arrayForTypeItem[0].type_item, function () {
                    countdown--;
                    if (countdown == 0) {
                        if (typeof cb === 'function') {
                            cb();
                        }
                    }
                }, cbe);
            } else {
                countdown--;
            }
        });
    }
};

PedagogicItem.prototype.isFiltered = function () {
    if (model.searchForm.selectedSubject != null) {
        return !(this.subject === model.searchForm.selectedSubject);
    }
    return false;
};

"use strict";

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
    /**
     * If true search result will be stored in model.quickSearchPedagogicDays instead of model.pedagogicDays
     * @type {boolean}
     */
    this.isQuickSearch = isQuickSearch;
    /**
     * Custom pedagogic days array.
     * Avoid conflicting with model.pedagogicDays)
     * @type {Array}
     */
    this.customPedagogicDaysArray;
};

SearchForm.prototype.initForTeacher = function () {
    this.publishState = "";
    this.returnType = "both";
    var period = moment(model.calendar.dayForWeek).day(1);
    this.startDate = period.format(DATE_FORMAT);
    this.endDate = period.add(15, 'days').format(DATE_FORMAT);
    this.displayLesson = true;
    this.displayHomework = true;
    this.audienceId = "";
};

SearchForm.prototype.initForStudent = function () {
    this.publishState = "published";
    this.returnType = "both";
    var period = moment(model.calendar.dayForWeek).day(1);
    this.startDate = period.format(DATE_FORMAT);
    this.endDate = period.add(15, 'days').format(DATE_FORMAT);
    this.displayLesson = false;
    this.displayHomework = true;
};

SearchForm.prototype.getSearch = function () {

    var params = {};
    params.startDate = this.startDate;
    params.endDate = this.endDate;
    params.publishState = this.publishState;
    params.returnType = this.returnType;

    if (model.isUserParent()) {
        params.audienceId = model.child.classId;
    }
    return params;
};

'use strict';

function Subject() {}

/**
 * Saves the subject to databases.
 * It's auto-created if it does not exists in database
 * @param cb
 * @param cbe
 */
Subject.prototype.save = function (cb, cbe) {
    if (this.id) {
        // not implemented yet at this stage/ not needed
    } else {
        this.create(cb, cbe);
    }
};

/**
 * Creates a subject
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Subject.prototype.create = function (cb, cbe) {
    var subject = this;
    http().postJson('/diary/subject', this).done(function (b) {
        subject.updateData(b);
        model.subjects.all.push(subject);
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

Subject.prototype.toJSON = function () {

    return {
        id: this.id,
        school_id: this.school_id,
        subject_label: this.label,
        teacher_id: this.teacher_id
    };
};

'use strict';

function Teacher() {}

Teacher.prototype.create = function (cb, cbe) {

    model.me.structures.forEach(function (structureId) {
        http().postJson('/diary/teacher/' + structureId).done(function (e) {

            if (typeof cb === 'function') {
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    });
};

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        module.config(function ($routeProvider) {
            $routeProvider
            // go to create new lesson view
            .when('/createLessonView/:timeFromCalendar', {
                action: 'createLessonView'
            })
            // go to create/update homework view
            .when('/createHomeworkView', {
                action: 'createHomeworkView'
            }).when('/editLessonView/:idLesson', {
                action: 'editLessonView'
            })
            // opens lesson and set default tab view to homeworks one
            .when('/editLessonView/:idLesson/:idHomework', {
                action: 'editLessonView'
            }).when('/editHomeworkView/:idHomework', {
                action: 'editHomeworkView'
            }).when('/editHomeworkView/:idHomework/:idLesson', {
                action: 'editHomeworkView'
            }).when('/calendarView/:mondayOfWeek', {
                action: 'calendarView'
            }).when('/listView', {
                action: 'listView'
            }).when('/mainView', {
                action: 'mainView'
            })
            // default view
            .otherwise({
                action: 'calendarView'
            });
        });
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
    * Course service as class
    * used to manipulate Course model
    */

    var CourseService = function () {
        function CourseService($http, $q) {
            _classCallCheck(this, CourseService);

            console.log("instantiate courseService");
            this.$http = $http;
            this.$q = $q;
            this.context = {
                'dateFormat': 'YYYY-MM-DD'
            };
        }

        _createClass(CourseService, [{
            key: 'getMergeCourses',
            value: function getMergeCourses(structureId, teacherId, firstDayOfWeek) {
                var _this = this;

                return this.$q.all([this.getScheduleCourses(structureId, teacherId, firstDayOfWeek), this.getSubjects(structureId)]).then(function (results) {
                    var courses = results[0];
                    var subjects = results[1];
                    return _this.mappingCourses(courses, subjects);
                });
            }
        }, {
            key: 'mappingCourses',
            value: function mappingCourses(courses, subjects) {
                _.each(courses, function (course) {
                    course.subject = subjects[course.subjectId];
                    course.date = moment(course.startDate);
                    course.date.week(model.calendar.week);
                    //course.beginning = moment(course.startDate);
                    //course.end = moment(course.endDate);
                    course.startMoment = moment(course.startDate);
                    course.endMoment = moment(course.endDate);

                    course.startTime = moment(course.startDate).format('HH:mm:ss');
                    course.endTime = moment(course.endDate).format('HH:mm:ss');

                    course.type = "schedule";
                    course.is_periodic = false;
                });
                return courses;
            }
        }, {
            key: 'getScheduleCourses',
            value: function getScheduleCourses(structureId, teacherId, firstDayOfWeek) {
                var begin = moment(firstDayOfWeek);
                var end = moment(firstDayOfWeek).add(6, 'd');

                var url = '/directory/timetable/teacher/' + structureId + '/' + teacherId;
                var config = {
                    params: {
                        begin: begin.format(this.context.dateFormat),
                        end: end.format(this.context.dateFormat)
                    }
                };
                return this.$http.get(url, config).then(function (result) {
                    return result.data;
                });
            }
        }, {
            key: 'getSubjects',
            value: function getSubjects(structureId) {
                if (!this.context.subjectPromise) {
                    var url = '/directory/timetable/subjects/' + structureId;
                    this.context.subjectPromise = this.$http.get(url).then(function (result) {
                        //create a indexed array
                        var subjects = result.data;
                        var results = {};
                        _.each(subjects, function (subject) {
                            results[subject.subjectId] = subject;
                        });
                        return results;
                    });
                }
                return this.context.subjectPromise;
            }
        }]);

        return CourseService;
    }();
    /* create singleton */


    AngularExtensions.addModuleConfig(function (module) {
        module.service("CourseService", CourseService);
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
    * Lesson service as class
    * used to manipulate Lesson model
    */

    var LessonService = function () {
        function LessonService($http, $q) {
            _classCallCheck(this, LessonService);

            this.$http = $http;
            this.$q = $q;
            this.context = {
                'dateFormat': 'YYYY-MM-DD'
            };
        }

        /**
         * Init lesson
         * @returns {Lesson}
         */


        _createClass(LessonService, [{
            key: 'initLesson',
            value: function initLesson(calendarNewItem, selectedDate) {
                var lesson = new Lesson();

                lesson.audience = {}; //sets the default audience to undefined
                lesson.subject = model.subjects.first();
                lesson.audienceType = lesson.audience.type;
                lesson.color = DEFAULT_ITEM_COLOR;
                lesson.state = DEFAULT_STATE;
                lesson.title = lang.translate('diary.lesson.label');

                var newItem = {};

                if (calendarNewItem) {
                    newItem = calendarNewItem;

                    // force to HH:00 -> HH:00 + 1 hour
                    newItem.beginning = newItem.beginning.minute(0).second(0);
                    newItem.date = newItem.beginning;

                    newItem.end = moment(newItem.beginning);
                    newItem.end.minute(0).second(0).add(1, 'hours');
                }
                // init start/end time to now (HH:00) -> now (HH:00) + 1 hour or selectedDate ->
                else {
                        var itemDate = selectedDate ? moment(selectedDate) : moment();

                        newItem = {
                            date: itemDate,
                            beginning: moment().minute(0).second(0),
                            end: moment().minute(0).second(0).add(1, 'hours')
                        };
                    }

                lesson.newItem = newItem;
                lesson.startTime = newItem.beginning;
                lesson.endTime = newItem.end;
                lesson.date = newItem.date;

                return lesson;
            }
        }]);

        return LessonService;
    }();
    /* create singleton */


    AngularExtensions.addModuleConfig(function (module) {
        module.service("LessonService", LessonService);
    });
})();

"use strict";

"use strict";

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        console.log("CalendarController initialized");
        function controller($scope, $timeout, CourseService) {
            console.log("CalendarController called");

            $timeout(init);

            function init() {
                console.log(model.lessons.all);
                CourseService.getMergeCourses(model.me.structures[0], model.me.userId, moment('2017-04-03')).then(function (courses) {
                    $scope.itemsCalendar = [].concat(model.lessons.all).concat(courses);
                    /*$scope.itemsCalendar = [{
                      "obj1" : "obj2"
                    }];*/
                    console.log($scope.itemsCalendar);
                });
            }

            /**
             * Opens the next week view of calendar
             */
            $scope.nextWeek = function () {
                var nextMonday = moment(model.calendar.firstDay).add(7, 'day');
                //TODO dont call the parent
                $scope.$parent.goToCalendarView(nextMonday.format(CAL_DATE_PATTERN));
            };

            /**
             * Opens the previous week view of calendar
             */
            $scope.previousWeek = function () {
                var prevMonday = moment(model.calendar.firstDay).add(-7, 'day');
                //TODO dont call the parent
                $scope.$parent.goToCalendarView(prevMonday.format(CAL_DATE_PATTERN));
            };
        }
        module.controller("CalendarController", controller);
    });
})();

'use strict';

/**
 * Default date format
 * @type {string}
 */
var DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Model from table
 * diary.lesson_has_attachment
 * @constructor
 */
function LessonAttachment() {}
function Audience() {}
function HomeworksLoad() {}
function HomeworkType() {}

/**
 * Says whether or not current user can edit an homework
 * @returns {*|boolean}
 */
model.canEdit = function () {
    return model.me.type == "ENSEIGNANT";
};

model.getCourseService = function () {
    return angular.injector(['ng', 'app']).get("CourseService");
};

/**
 * Says whether or not current user is a teacher
 * @returns {*|boolean}
 */
model.isUserTeacher = function () {
    return model.me.type == "ENSEIGNANT";
};

/**
 * Says whether or not current user is a teacher
 * @returns {*|boolean}
 */
model.isUserParent = function () {
    return model.me.type == "PERSRELELEVE";
};

/**
 * Publishes or un publishes a list of homeworks
 * @param itemArray Array of homeworks to publish or unpublish
 */
model.publishHomeworks = function (itemArray, isPublish, cb, cbe) {

    var url = isPublish ? "/diary/publishHomeworks" : "/diary/unPublishHomeworks";

    return http().postJson(url, itemArray).done(function (r) {
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

model.deleteItemList = function (items, itemType, cb, cbe) {
    var url = itemType == "lesson" ? '/diary/deleteLessons' : '/diary/deleteHomeworks';

    var itemArray = { ids: model.getItemsIds(items) };

    return http().deleteJson(url, itemArray).done(function (b) {

        items.forEach(function (item) {
            item.deleteModelReferences();
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

model.deletePedagogicItemReferences = function (itemId) {
    model.pedagogicDays.forEach(function (day) {
        day.pedagogicItemsOfTheDay = _.reject(day.pedagogicItemsOfTheDay, function (item) {
            return !item || item.lesson_id == itemId || item.id == itemId;
        });
        day.resetCountValues();
    });

    model.pedagogicDays.all = _.filter(model.pedagogicDays.all, function (day) {
        return day.numberOfItems() > 0;
    });

    model.initSubjects();
};

model.unselectDays = function () {
    model.pedagogicDays.forEach(function (day) {
        day.selected = undefined;
    });
};

// gets the selected date from pedagogic items
model.selectedPedagogicDate = function () {
    var selectedDay = _.findWhere(model.pedagogicDays.all, { selected: true });
    if (selectedDay) {
        return moment(selectedDay.dayName, "dddd DD MMMM YYYY").format("YYYY-MM-DD");
    } else {
        return moment();
    }
};

var syncHomeworks = function syncHomeworks(cb) {
    model.homeworks.syncHomeworks(function () {
        if (typeof cb === 'function') {
            cb();
        }
    });
};

var syncLessonsAndHomeworks = function syncLessonsAndHomeworks(cb) {
    model.lessons.syncLessons();
    // need sync attached lesson homeworks
    model.homeworks.syncHomeworks();

    if (typeof cb === 'function') {
        cb();
    }
};

/**
 * Given a moment which contain reliable time data,
 * return a moment time with this time and the date specified.
 * @param date Date
 * @param momentTime Moment date
 * @returns {*}
 */
model.getMomentDateTimeFromDateAndMomentTime = function (date, momentTime) {
    var dateMoment = moment(date);

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
model.publishLessons = function (itemArray, isPublish, cb, cbe) {

    var url = isPublish ? "/diary/publishLessons" : "/diary/unPublishLessons";

    return http().postJson(url, itemArray).done(function (r) {

        var updateLessons = new Array();

        // update lesson cache
        // bad code but collection does not seem to update on state change
        // so have to delete and add modified lessons ...
        model.lessons.forEach(function (lessonModel) {
            if (itemArray.ids.indexOf(lessonModel.id) != -1) {
                model.lessons.remove(lessonModel);

                lessonModel.changeState(isPublish);
                // update tooltip text (has state label in it)
                lessonModel.tooltipText = getResponsiveLessonTooltipText(lessonModel);
                updateLessons.push(lessonModel);
            }
        });

        model.lessons.addRange(updateLessons);

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

model.getMinutes = function (time) {
    return new Number(time.split(':')[0] * 60) + new Number(time.split(':')[1]);
};

model.parseError = function (e) {
    var error = {};
    try {
        error = JSON.parse(e.responseText);
    } catch (err) {
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
model.getItemsIds = function (items) {
    return _.toArray(_.pluck(items, 'id'));
};

/**
 * Loads homework load data for current week of homework
 * @param homework
 * @param cb
 * @param cbe
 */
model.loadHomeworksLoad = function (homework, date, audienceId, cb, cbe) {

    http().get('/diary/homework/load/' + date + '/' + audienceId).done(function (sqlHomeworksLoads) {

        homework.weekhomeworksload = new Array();

        sqlHomeworksLoads.forEach(function (homeworkLoad) {
            homework.weekhomeworksload.push(sqlToJsHomeworkLoad(homeworkLoad));
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Get homeworks linked to a lesson
 *
 * @param lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
model.loadHomeworksForLesson = function (lesson, cb, cbe) {

    if (!lesson.id) {
        return;
    }

    http().get('/diary/homework/list/' + lesson.id).done(function (sqlHomeworks) {

        lesson.homeworks = new Collection(Homework);

        sqlHomeworks.forEach(function (sqlHomework) {
            lesson.homeworks.push(sqlToJsHomework(sqlHomework));
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Get school ids of current authenticated user as string
 * seperated with ':'
 * @returns {string} schoolid_1:schoolid_2:...
 */
var getUserStructuresIdsAsString = function getUserStructuresIdsAsString() {
    var structureIds = "";

    model.me.structures.forEach(function (structureId) {
        structureIds += structureId + ":";
    });

    return structureIds;
};

model.build = function () {
    calendar.startOfDay = 8;
    calendar.endOfDay = 19;
    calendar.dayHeight = 65;
    model.calendar = new calendar.Calendar({
        week: moment().week()
    });

    // keeping start/end day values in cache so we can detect dropped zones (see ng-extensions.js)
    // note: model.calendar.startOfDay does not work in console.
    model.startOfDay = calendar.startOfDay;
    model.endOfDay = calendar.endOfDay;

    model.makeModels([HomeworkType, Audience, Subject, Lesson, Homework, PedagogicDay, Child]);
    Model.prototype.inherits(Lesson, calendar.ScheduleItem); // will allow to bind item.selected for checkbox

    this.searchForm = new SearchForm(false);
    this.currentSchool = {};

    this.collection(Lesson, {
        loading: false,
        syncLessons: function syncLessons(cb, cbe) {
            var that = this;
            if (that.loading) return;

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
            http().get(urlGetLessons).done(function (data) {
                lessons = lessons.concat(data);
                that.addRange(_.map(lessons, function (lesson) {
                    return sqlToJsLesson(lesson);
                }));

                if (typeof cb === 'function') {
                    cb();
                }
                that.loading = false;
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
            });
        }, pushAll: function pushAll(datas) {

            if (datas) {
                this.all = _.union(this.all, datas);
            }
            console.log(model.lessons);
        }, behaviours: 'diary'
    });

    this.collection(Subject, {
        loading: false,
        syncSubjects: function syncSubjects(cb, cbe) {
            this.all = [];
            var that = this;
            if (that.loading) return;

            that.loading = true;

            if (model.isUserTeacher()) {
                http().get('/diary/subject/initorlist').done(function (data) {
                    if (data === "") {
                        data = [];
                    }
                    model.subjects.addRange(data);
                    if (typeof cb === 'function') {
                        cb();
                    }
                    that.loading = false;
                }.bind(that)).error(function (e) {
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
                }.bind(that)).error(function (e) {
                    if (typeof cbe === 'function') {
                        cbe(model.parseError(e));
                    }
                    that.loading = false;
                });
            }
        }
    });

    this.collection(Audience, {
        loading: false,
        syncAudiences: function syncAudiences(cb, cbe) {
            this.all = [];
            var nbStructures = model.me.structures.length;
            var that = this;
            if (that.loading) return;

            model.currentSchool = model.me.structures[0];
            that.loading = true;
            model.me.structures.forEach(function (structureId) {
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
                        if (typeof cb === 'function') {
                            cb();
                        }
                    }

                    that.loading = false;
                }.bind(that)).error(function (e) {
                    if (typeof cbe === 'function') {
                        cbe(model.parseError(e));
                    }
                    that.loading = false;
                });
            });
        }
    });

    this.collection(HomeworkType, {
        loading: false,
        syncHomeworkTypes: function syncHomeworkTypes(cb, cbe) {

            var homeworkTypes = [];
            var that = this;

            if (that.loading) return;

            model.homeworkTypes.all.splice(0, model.homeworkTypes.all.length);

            var url = '/diary/homeworktype/initorlist';

            var urlGetHomeworkTypes = url;

            that.loading = true;
            http().get(urlGetHomeworkTypes).done(function (data) {
                homeworkTypes = homeworkTypes.concat(data);
                that.addRange(_.map(homeworkTypes, sqlToJsHomeworkType));
                if (typeof cb === 'function') {
                    cb();
                }
                that.loading = false;
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
            });
        }, pushAll: function pushAll(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(Homework, {
        loading: false,
        syncHomeworks: function syncHomeworks(cb, cbe) {

            var homeworks = [];
            var start = moment(model.calendar.dayForWeek).day(1).format(DATE_FORMAT);
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format(DATE_FORMAT);
            var that = this;

            if (that.loading) return;

            model.homeworks.all.splice(0, model.homeworks.all.length);

            var urlGetHomeworks = '/diary/homework/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';

            if (model.isUserParent() && model.child) {
                urlGetHomeworks += model.child.id;
            } else {
                urlGetHomeworks += '%20';
            }

            that.loading = true;
            http().get(urlGetHomeworks).done(function (data) {
                homeworks = homeworks.concat(data);
                that.addRange(_.map(homeworks, sqlToJsHomework));
                if (typeof cb === 'function') {
                    cb();
                }
                that.loading = false;
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
            });
        }, pushAll: function pushAll(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(PedagogicDay, {
        reset: function reset() {
            model.pedagogicDays.selectAll();
            model.pedagogicDays.removeSelection();
        },
        syncPedagogicItems: function syncPedagogicItems(cb, cbe) {
            var params = model.searchForm.getSearch();
            model.performPedagogicItemSearch(params, model.isUserTeacher(), cb, cbe);
        },
        pushAll: function pushAll(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        },
        getItemsByLesson: function getItemsByLesson(lessonId) {
            var items = [];

            model.pedagogicDays.forEach(function (day) {
                var relatedToLesson = _.filter(day.pedagogicItemsOfTheDay, function (item) {
                    return item.lesson_id == lessonId;
                });
                items = _.union(items, relatedToLesson);
            });

            return items;
        }
    });

    /**
     *
     */
    this.collection(Child, {
        reset: function reset() {
            // n.b: childs not 'children' since collection function adds a 's'
            model.childs.selectAll();
            model.childs.removeSelection();
        },
        syncChildren: function syncChildren(cb, cbe) {
            model.listChildren(cb, cbe);
        }, pushAll: function pushAll(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }
    });

    /**
     * Convert sql diary.lesson row to js row used in angular model
     * @param lesson Sql diary.lesson row
     */
    sqlToJsLesson = function sqlToJsLesson(data) {

        var lessonHomeworks = new Array();

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

        var lesson = {
            //for share directive you must have _id
            _id: data.lesson_id,
            id: data.lesson_id,
            title: data.lesson_title,
            audience: model.audiences.findWhere({ id: data.audience_id }),
            audienceId: data.audience_id,
            audienceLabel: data.audience_label,
            audienceType: data.audience_type,
            description: data.lesson_description,
            subject: model.subjects.findWhere({ id: data.subject_id }),
            subjectId: data.subject_id,
            subjectLabel: data.subject_label,
            teacherId: data.teacher_display_name,
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
            locked: !model.canEdit() ? true : false
        };

        if ('group' === lesson.audienceType) {
            lesson.audienceTypeLabel = lang.translate('diary.audience.group');
        } else {
            lesson.audienceTypeLabel = lang.translate('diary.audience.class');
        }

        if (data.attachments) {
            lesson.attachments = _.map(JSON.parse(data.attachments), jsonToJsAttachment);
        }

        var tooltip = getResponsiveLessonTooltipText(lesson);

        lesson.tooltipText = tooltip;
        return lesson;
    };

    jsonToJsAttachment = function jsonToJsAttachment(data) {
        var att = new Attachment();
        att.id = data.id;
        att.user_id = data.user_id;
        att.creation_date = data.creation_date;
        att.document_id = data.document_id;
        att.document_label = data.document_label;

        return att;
    };

    /**
     * On window resize compute lesson tooltips (responsive design)
     */
    window.addEventListener('resize', function (event) {

        model.lessons.forEach(function (lesson) {
            lesson.tooltipText = getResponsiveLessonTooltipText(lesson);
        });
    });

    /**
     * Set lesson tooltip text depending on screen resolution.
     * Tricky responsive must be linked to additional.css behaviour
     * @param lesson
     */
    getResponsiveLessonTooltipText = function getResponsiveLessonTooltipText(lesson) {

        var tooltipText = lesson.title + ' (' + lang.translate(lesson.state) + ')';
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

        return tooltipText;
    };

    /**
     * Transform sql homework load data to json like
     * @param sqlHomeworkType
     */
    sqlToJsHomeworkLoad = function sqlToJsHomeworkLoad(sqlHomeworkload) {
        return {
            countLoad: sqlHomeworkload.countload,
            description: sqlHomeworkload.countload + ' ' + lang.translate('diary.homework.label'),
            day: moment(sqlHomeworkload.day).format('dddd').substring(0, 1).toUpperCase(), // 'lundi' -> 'lu' -> 'L'
            numDay: moment(sqlHomeworkload.day).format('DD') // 15
        };
    };

    /**
     * Transform sql homework type data to json like
     * @param sqlHomeworkType
     * @returns {{id: *, structureId: (*|T), label: *, category: *}}
     */
    sqlToJsHomeworkType = function sqlToJsHomeworkType(sqlHomeworkType) {
        return {
            id: sqlHomeworkType.id,
            structureId: sqlHomeworkType.school_id,
            label: sqlHomeworkType.homework_type_label,
            category: sqlHomeworkType.homework_type_category
        };
    };

    /**
     * Transform sql homework data (table diary.homework)
     * to json
     * @param sqlHomework
     * @returns {{id: *, description: *, audience: *, subjectId: *, subjectLabel: *, type: *, typeId: *, typeLabel: *, teacherId: *, structureId: (*|T), audienceId: *, audienceLabel: *, dueDate: *, date: *, title: *, color: *, startMoment: *, endMoment: *, state: *, is_periodic: boolean, lesson_id: *}}
     */
    sqlToJsHomework = function sqlToJsHomework(sqlHomework) {
        var homework = {
            //for share directive you must have _id
            _id: sqlHomework.id,
            id: sqlHomework.id,
            description: sqlHomework.homework_description,
            audienceId: sqlHomework.audience_id,
            audience: model.audiences.findWhere({ id: sqlHomework.audience_id }),
            subject: model.subjects.findWhere({ id: sqlHomework.subject_id }),
            subjectId: sqlHomework.subject_id,
            subjectLabel: sqlHomework.subject_label,
            type: model.homeworkTypes.findWhere({ id: sqlHomework.homework_type_id }),
            typeId: sqlHomework.homework_type_id,
            typeLabel: sqlHomework.homework_type_label,
            teacherId: sqlHomework.teacher_id,
            structureId: sqlHomework.structureId,
            audienceType: sqlHomework.audience_type,
            audienceLabel: sqlHomework.audience_label,
            // TODO delete dueDate? (seems redondant info vs date field)
            dueDate: moment(sqlHomework.homework_due_date),
            date: moment(sqlHomework.homework_due_date),
            title: sqlHomework.homework_title,
            color: sqlHomework.homework_color,
            startMoment: moment(sqlHomework.homework_due_date),
            endMoment: moment(sqlHomework.homework_due_date),
            state: sqlHomework.homework_state,
            is_periodic: false,
            lesson_id: sqlHomework.lesson_id
        };

        if (sqlHomework.attachments) {
            homework.attachments = _.map(JSON.parse(sqlHomework.attachments), jsonToJsAttachment);
        }

        if ('group' === homework.audienceType) {
            homework.audienceTypeLabel = lang.translate('diary.audience.group');
        } else {
            homework.audienceTypeLabel = lang.translate('diary.audience.class');
        }

        return homework;
    };

    /** Converts sql pedagogic item to js data */
    sqlToJsPedagogicItem = function sqlToJsPedagogicItem(data) {
        var item = new PedagogicItem();
        item.type_item = data.type_item;
        item.id = data.id;
        //for share directive you must have _id
        item._id = data.id;
        item.lesson_id = data.lesson_id;
        item.title = data.title;
        item.subject = data.subject;
        item.audience = data.audience;
        item.start_hour = data.type_item == "lesson" ? moment(data.day).minutes(model.getMinutes(data.start_time)).format("HH[h]mm") : "";
        item.end_hour = data.type_item == "lesson" ? moment(data.day).minutes(model.getMinutes(data.end_time)).format("HH[h]mm") : "";
        item.type_homework = data.type_homework;
        item.teacher = data.teacher;
        item.description = data.description;
        item.expanded_description = false;
        item.state = data.state;
        item.color = data.color;
        item.getPreviewDescription();
        item.room = data.room;
        item.day = data.day;
        item.turn_in = data.type_item == "lesson" ? "" : data.turn_in_type;
        item.selected = false;

        if (data.day) {
            item.dayFormatted = moment(data.day).format("DD/MM/YYYY");
            item.dayOfWeek = moment(data.day).format("dddd");
        }
        return item;
    };
};

/**
 * Returns default audience of connected user.
 * @returns {*}
 */
model.getDefaultAudience = function () {
    var defaultAudience = null;

    if (model.me.classes && model.me.classes.length > 0) {
        defaultAudience = model.audiences.findWhere({ id: model.me.classes[0] });
    }

    if (!defaultAudience) {
        defaultAudience = model.audiences.first();
    }

    return defaultAudience;
};

model.showHomeworkPanel = true;

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
 * Init homework object on created.
 * Set default attribute values
 * @param homework
 * @param cb Callback function
 * @param cbe Callback function on error
 * @returns {*}
 */
model.initHomework = function (dueDate, lesson) {

    var homework = new Homework();

    homework.created = new Date();
    homework.expanded = true;
    homework.type = model.homeworkTypes.first();
    homework.title = homework.type.label;
    homework.date = dueDate ? dueDate : moment().minute(0).second(0);

    // create homework attached to lesson
    if (lesson) {
        homework.audience = lesson.audience;
        homework.subject = lesson.subject;
        homework.audienceType = homework.audience.type;
        homework.color = lesson.color;
        homework.state = lesson.state;
    }
    // free homework
    else {
            homework.audience = {}; //sets the default audience to undefined
            homework.subject = model.subjects.first();
            homework.audienceType = homework.audience.type;
            homework.color = DEFAULT_ITEM_COLOR;
            homework.state = DEFAULT_STATE;
        }

    model.loadHomeworksLoad(homework, moment(homework.date).format(DATE_FORMAT), homework.audience.id);

    return homework;
};

/**
 * Load previous lessons from current one
 * Attached homeworks to lessons are also loaded
 * @param lesson
 * @param useDeltaStep
 * @param cb Callback function
 * @param cbe Callback on error function
 */
model.getPreviousLessonsFromLesson = function (lesson, useDeltaStep, cb, cbe) {

    if (useDeltaStep) {
        if (lesson.allPreviousLessonsLoaded) {
            return;
        }
    } else if (lesson.previousLessonsLoaded || lesson.previousLessonsLoading == true) {
        return;
    }

    if (!useDeltaStep) {
        lesson.allPreviousLessonsLoaded = false;
    }

    var defaultCount = 6;

    var idx_start = 0;
    var idx_end = idx_start + defaultCount;

    if (useDeltaStep) {
        idx_start += defaultCount;
        idx_end += defaultCount;
    }

    var params = {};

    params.offset = idx_start;
    params.limit = idx_end;

    if (lesson.id) {
        params.excludeLessonId = lesson.id;
    }

    // tricky way to detect if string date or moment date ...
    // 12:00:00
    if (lesson.endTime.length === 8) {
        params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + lesson.endTime;
    } else {
        params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + moment(lesson.endTime).format("HH:mm");
    }

    var clonedLessonMoment = moment(new Date(lesson.date));
    //params.startDate = clonedLessonMoment.add(-2, 'month').format(DATE_FORMAT);
    params.subject = lesson.subject.id;
    params.audienceId = lesson.audience.id;
    params.returnType = 'lesson'; // will allow get lessons first, then homeworks later
    params.homeworkLinkedToLesson = "true";
    params.sortOrder = "DESC";

    if (!lesson.previousLessons) {
        lesson.previousLessons = new Array();
    }
    lesson.previousLessonsDisplayed = new Array();

    lesson.previousLessonsLoading = true;
    http().postJson('/diary/pedagogicItems/list', params).done(function (items) {

        // all lessons loaded
        if (items.length < defaultCount) {
            lesson.allPreviousLessonsLoaded = true;
        }

        var previousLessonsAndHomeworks = _.map(items, sqlToJsPedagogicItem);

        var groupByItemType = _.groupBy(previousLessonsAndHomeworks, 'type_item');

        var previousLessons = groupByItemType.lesson;

        if (previousLessons) {
            var previousLessonIds = new Array();

            previousLessons.forEach(function (lesson) {
                previousLessonIds.push(lesson.id);
            });

            // load linked homeworks of previous lessons
            var paramsHomeworks = {};
            paramsHomeworks.returnType = 'homework';
            paramsHomeworks.homeworkLessonIds = previousLessonIds;

            http().postJson('/diary/pedagogicItems/list', paramsHomeworks).done(function (items2) {

                var previousHomeworks = _.map(items2, sqlToJsPedagogicItem);

                previousLessons.forEach(function (lesson) {
                    lesson.homeworks = _.where(previousHomeworks, { lesson_id: lesson.id });
                });

                lesson.previousLessons = lesson.previousLessons.concat(previousLessons);
                lesson.previousLessonsLoaded = true;
                lesson.previousLessonsLoading = false;
                lesson.previousLessonsDisplayed = lesson.previousLessons;

                if (typeof cb === 'function') {
                    cb();
                }
            });
        } else {
            lesson.previousLessons = new Array();
            lesson.previousLessonsLoaded = true;
            lesson.previousLessonsLoading = false;
            lesson.previousLessonsDisplayed = lesson.previousLessons;
            if (typeof cb === 'function') {
                cb();
            }
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

model.performPedagogicItemSearch = function (params, isTeacher, cb, cbe) {

    // global quick search panel
    if (params.isQuickSearch) {
        if (params.returnType === 'lesson') {
            model.pedagogicDaysQuickSearchLesson = new Array();
        } else {
            model.pedagogicDaysQuickSearchHomework = new Array();
        }
    }
    // 'classical' view list
    else {
            model.pedagogicDays.reset();
        }

    http().postJson('/diary/pedagogicItems/list', params).done(function (items) {

        var pedagogicItemsFromDB = _.map(items, sqlToJsPedagogicItem);

        var days = _.groupBy(pedagogicItemsFromDB, 'day');

        var pedagogicDays = [];

        var aDayIsSelected = false;

        for (var day in days) {
            if (days.hasOwnProperty(day)) {
                var pedagogicDay = new PedagogicDay();
                pedagogicDay.selected = false;
                pedagogicDay.dayName = moment(day).format("dddd DD MMMM YYYY");
                pedagogicDay.shortName = pedagogicDay.dayName.substring(0, 2);
                pedagogicDay.shortDate = moment(day).format("DD/MM");
                pedagogicDay.pedagogicItemsOfTheDay = days[day];

                var countItems = _.groupBy(pedagogicDay.pedagogicItemsOfTheDay, 'type_item');

                pedagogicDay.nbLessons = countItems['lesson'] ? countItems['lesson'].length : 0;
                pedagogicDay.nbHomeworks = countItems['homework'] ? countItems['homework'].length : 0;

                //select default day
                if (isTeacher) {
                    if (!aDayIsSelected) {
                        pedagogicDay.selected = true;
                        aDayIsSelected = true;
                    }
                } else {
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
                model.pedagogicDaysQuickSearchLesson = model.pedagogicDaysQuickSearchLesson.concat(pedagogicDays);
            } else {
                model.pedagogicDaysQuickSearchHomework = model.pedagogicDaysQuickSearchHomework.concat(pedagogicDays);
            }
        } else {
            model.pedagogicDays.pushAll(pedagogicDays);
        }

        model.initSubjects();

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * List children of current authenticated user (if parent)
 * @param cb Callback function
 * @param cbe Callback error function
 */
model.listChildren = function (cb, cbe) {

    // no children - abort
    if (!model.me.childrenIds || model.me.childrenIds.length == 0) {
        if (typeof cb === 'function') {
            cb();
        }
        return;
    }

    model.childs.removeAll();

    http().get('/diary/children/list').done(function (data) {

        model.childs.addRange(data);

        if (model.childs.all.length > 0) {
            model.child = model.childs.all[0];
            model.child.selected = true;
        }

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

//builds the set of different subjects encountered in the pedagogic items of the list
model.initSubjects = function () {

    var subjects = [];

    model.pedagogicDays.forEach(function (pedagogicDay) {
        pedagogicDay.pedagogicItemsOfTheDay.forEach(function (pedagogicItem) {
            var subjectName = pedagogicItem.subject;
            if (!_.contains(subjects, subjectName)) {
                subjects.push(subjectName);
            }
        });
    });

    model.searchForm.subjects = subjects;
};

/**
 * Find subject by id
 * @param subjectId
 * @returns {null} Subject with id set
 */
model.findSubjectById = function (subjectId) {

    var subjectMatch = null;

    model.subjects.all.forEach(function (subject) {

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
model.findSubjectsByLabel = function (label) {

    var subjectsFound = new Array();

    if (label.length > 0) {
        var labelLowerCaseNoAccent = sansAccent(label).toLowerCase();

        model.subjects.all.forEach(function (subject) {
            var labelSubjectLowerCaseNoAccent = sansAccent(subject.label.toLowerCase());

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
model.createSubject = function (label, cb, cbe) {

    var subject = new Subject();
    subject.label = label;
    subject.save(cb, cbe);
};

/**
 * removes accent from any string
 * @param str
 * @returns {*}
 */
var sansAccent = function sansAccent(str) {
    var accent = [/[\300-\306]/g, /[\340-\346]/g, // A, a
    /[\310-\313]/g, /[\350-\353]/g, // E, e
    /[\314-\317]/g, /[\354-\357]/g, // I, i
    /[\322-\330]/g, /[\362-\370]/g, // O, o
    /[\331-\334]/g, /[\371-\374]/g, // U, u
    /[\321]/g, /[\361]/g, // N, n
    /[\307]/g, /[\347]/g // C, c
    ];
    var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

    for (var i = 0; i < accent.length; i++) {
        str = str.replace(accent[i], noaccent[i]);
    }

    return str;
};


//# sourceMappingURL=app.js.map