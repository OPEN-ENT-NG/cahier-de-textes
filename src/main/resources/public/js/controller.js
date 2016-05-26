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
        .when('/calendarView/:startDate', {
            action: 'calendarView'
        })
        // default view
        .otherwise({
            action: 'calendarView'
        })
})

/**
 *
 * @param $scope
 * @param template
 * @param model
 * @param route
 * @param date
 * @param $location
 * @constructor
 */
function DiaryController($scope, template, model, route, date, $location) {

    $scope.currentErrors = [];
    $scope.tabs = {
        createLesson: 'lesson'
    };

    $scope.showCal = false;
    $scope.newLesson = new Lesson();
    // for static access to some global function
    $scope.newHomework = new Homework();

    $scope.display = {
        showPanel: false
    };

    $scope.lessons = model.lessons;
    $scope.audiences = model.audiences;
    $scope.subjects = model.subjects;
    $scope.homeworkTypes = model.homeworkTypes;
    $scope.homeworks = model.homeworks;

    route({
        createLessonView: function(params){
            $scope.lesson = null;
            $scope.openLessonView(null, params);
        },
        createHomeworkView: function(params){
            $scope.homework = null;
            $scope.openHomeworkView(null, params);
            template.open('main', 'main');
            template.open('main-view', 'create-homework');
        },
        editLessonView: function(params) {

            if(!params.idLesson){
                $scope.goToCalendarView(notify.error('daily.lesson.id.notspecified'));
                return;
            }

            var lesson = model.lessons.findWhere({id: parseInt(params.idLesson)});

            if (lesson != null) {
                $scope.openLessonView(lesson, params);
            } else {
                $scope.goToCalendarView(notify.error('daily.lesson.idnotfound'));
            }
        },
        editHomeworkView: function(params) {
            loadHomeworkFromRoute(params.idHomework);
            template.open('main', 'main');
            template.open('main-view', 'create-homework');
        },
        calendarView: function(params){
            if (params.startDate != null) {
                //put the start date in the scope?
            }
            template.open('main', 'main');
            template.open('main-view', 'calendar');
            template.open('daily-event-details', 'daily-event-details');
            $scope.lesson = null;
            $scope.homework = null;
        }
    });


    var loadHomeworkFromRoute = function(idHomework) {
        var homework = model.homeworks.findWhere({ id: parseInt(idHomework)});
        if (homework != null) {
            $scope.openHomeworkView(homework);
        }
    };

    /**
     *
     * @param lesson Lesson to view
     * @param params Parameters from url
     */
    $scope.openLessonView = function(lesson, params){

        $scope.tabs.createLesson = params.idHomework ? 'homeworks' : 'lesson';
        $scope.tabs.showAnnotations = false;

        // open existing lesson for edit
        if (lesson) {
            if (!$scope.lesson) {
                $scope.lesson = new Lesson();
            }
            $scope.lesson.updateData(lesson);
            $scope.newItem = {
                date: moment($scope.lesson.date),
                beginning: moment($scope.lesson.beginning),
                end: moment($scope.lesson.end)
            }
        }
        // create new lesson
        else {
            var isTimeFromCalendar = ("timeFromCalendar" === params.timeFromCalendar);
            initLesson(isTimeFromCalendar);
        }

        var openLessonTemplates = function(){
            template.open('main', 'main');
            template.open('main-view', 'create-lesson');
        }

        // open homeworks tab view so we need load homework data
        // first (which is not loaded by default on lesson tab view)
        if (params.idHomework) {
            $scope.loadHomeworksForCurrentLesson(function () {
                openLessonTemplates();
            });
        } else {
            openLessonTemplates();
        }
    };

    $scope.openHomeworkView = function(homework, params){

        if (homework) {
            if (!$scope.homework) {
                $scope.homework = new Homework();
            }

            $scope.homework.updateData(homework);

            if (!$scope.homework.audience) {
                $scope.homework.audience = model.audiences.findWhere({id: $scope.homework.audienceId});
            }

            if (!$scope.homework.subject) {
                $scope.homework.subject = model.subjects.findWhere({id: $scope.homework.subjectId});
            }

            if (!$scope.homework.type) {
                $scope.homework.type = model.homeworkTypes.findWhere({ id: $scope.homework.typeId });
            }
        } else {
            initHomework();
        }
    };

    $scope.closeLesson = function() {

    };

    /**
     * Switch to calendar view
     * @param cb Callback function
     */
    $scope.goToCalendarView = function (cb) {
        $location.path('/calendarView');

        if (typeof cb === 'function') {
            cb();
        }
    }

    /**
     * Deletes selected items (lessons or homeworks)
     * in calendar view from database
     */
    $scope.deleteSelectedItems = function () {
        var selectedLessons = getSelectedLessons();
        var selectedHomeworks = getSelectedHomeworks();

        if ((selectedLessons.length + selectedHomeworks.length) === 0) {
            notify.error('daily.nohomeworkorlesson.selected');
            return;
        }

        // remove pending delete homeworks
        // ever embedded in selected pending delete lessons
        var homeworksToDelete = selectedHomeworks.filter(function (homework) {

            var homeworkInSelectedLesson = false;

            selectedLessons.forEach(function(lesson){
                if(!homeworkInSelectedLesson && lesson.hasHomeworkWithId(homework.id)){
                    homeworkInSelectedLesson = true;
                }
            });

            return !homeworkInSelectedLesson;
        });

        var postDelete = function(){
            notify.info('item.deleted');
            $scope.closeConfirmPanel();
        }

        var deleteHomeworks = function(){
            $scope.newHomework.deleteHomeworks(homeworksToDelete,
                function () {
                    postDelete();
                },
                // calback error function
                function (cbe) {notify.error(cbe.message)}
            );
        }

        // note: associated homeworks are automatically deleted
        // sql delete cascade
        if (selectedLessons.length > 0) {
            $scope.newLesson.deleteLessons(selectedLessons,
                function (cb) {
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
    }

    /**
     * Open selected lesson or homework
     */
    $scope.editSelectedItem = function () {

        var selectedLessons = getSelectedLessons();
        var selectedLesson = selectedLessons.length > 0 ? selectedLessons[0] : null;

        var selectedHomeworks = getSelectedHomeworks();
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
    }


    /**
     * Create or update lesson to database from page fields
     * @param goToCalendarView if true will switch to calendar view
     * after create/update else stay on current page
     */
    $scope.createOrUpdateLesson = function (goToCalendarView) {

        $scope.currentErrors = [];

        $scope.lesson.startTime = $scope.newItem.beginning;
        $scope.lesson.endTime = $scope.newItem.end;
        $scope.lesson.date = $scope.newItem.date;


        $scope.lesson.save(
            function () {
                // homeworks associated with lesson
                // TODO move to model and refactor
                if ($scope.lesson.homeworks && $scope.lesson.homeworks.all.length > 0) {

                    var homeworkSavedCount = 0;
                    var homeworkCount = $scope.lesson.homeworks.all.length;
                    var execASyncPostLessonSave = true;

                    $scope.lesson.homeworks.forEach(function (homework) {

                        homework.lesson_id = $scope.lesson.id;
                        // needed fields as in model.js Homework.prototype.toJSON
                        homework.audience = $scope.lesson.audience;
                        homework.subject = $scope.lesson.subject;
                        homework.color = $scope.lesson.color;

                        // homework might not have been sql loaded if user stayed on lesson tab
                        if(typeof homework.loaded === 'undefined' || homework.loaded) {
                            execASyncPostLessonSave = false;
                            homework.save(
                                // go back to calendar view once all homeworks saved ('back' button)
                                function (x) {
                                    homeworkSavedCount ++;
                                    if (homeworkSavedCount == homeworkCount) {
                                        $scope.postLessonSave(goToCalendarView);
                                    }
                                },
                                function (e) {
                                    validationError(e);
                                });
                        }
                    });

                    if(execASyncPostLessonSave){
                        $scope.postLessonSave(goToCalendarView);
                    }
                } else {
                    $scope.postLessonSave(goToCalendarView);
                }
        }, function (e) {
            validationError(e);
        });
    };

    $scope.postLessonSave = function(goToCalendarView){
        notify.info('lesson.saved');

        // TODO remove sync and investigate more
        // actually there are some differences between the lesson object
        // created from Lesson.prototype.create
        // and the one retreived from db specially date fields as string or date or moment
        model.lessons.syncLessons(function(){
            model.homeworks.syncHomeworks(function(){
                $scope.$apply();
                if (goToCalendarView) {
                    $scope.goToCalendarView();
                    $scope.lesson = null;
                    $scope.homework = null;
                }
            });
        });
    };

    /**
     * un/Publish selected lessons
     */
    $scope.publishSelectedLessons = function (isPublish) {
        $scope.currentErrors = [];
        $scope.publishLessons($scope.getSelectedLessons(), isPublish);
    };


    /**
     * Publishes or unpublishes homework and go back to calendar view
     * @param homework Homework
     * @param isPublish if true publishes homework else un-publishes it
     */
    $scope.publishHomeworkAndGoCalendarView = function (homework, isPublish) {
        $scope.publishHomework(homework, isPublish, $scope.goToCalendarView());
    }

    /**
     * Publishes or unpublishes lesson and go back to calendar view
     * @param lesson Lesson
     * @param isPublish if true publishes lesson else un-publishes it
     */
    $scope.publishLessonAndGoCalendarView = function (lesson, isPublish) {
        $scope.publishLesson(lesson, isPublish, $scope.goToCalendarView());
    }

    /**
     * Publish lesson
     * @param isPublish If true publishes the lesson (back to draft mode) else unpublishes it
     * @param cb Callback function
     */
    $scope.publishLesson = function (lesson, isPublish, cb) {
        var lessons = new Array();
        lessons.push(lesson);
        $scope.publishLessons(lessons, isPublish, cb);
    }

     /**
     * Publish lessons
     * @param lessons Array of lessons to publish or unpublish
     * @param isPublish if true publishes the lessons else unpublishes them
     * which is lesson id to delete
     */
    $scope.publishLessons = function (lessons, isPublish, cb) {
        $scope.currentErrors = [];
        $scope.processingData = true;

        model.publishLessons({ids:model.getItemsIds(lessons)}, isPublish, function () {

            // refresh state of lessons un/published
            lessons.forEach(function (lesson) {
                lesson.changeState(isPublish);
            });

            $scope.closeConfirmPanel();

            notify.info(isPublish ? 'lesson.published' : 'lesson.unpublished');

            if (typeof cb === 'function') {
                cb();
            }
        }, function (e) {
            $scope.processingData = false;
            validationError(e);
        });
    };

    /**
     * Publish lesson
     * @param isUPublish If true publishes the lesson (back to draft mode) else unpublishes it
     * @param cb Callback function
     */
    $scope.publishHomework = function (homework, isPublish, cb) {
        var homeworks = new Array();
        homeworks.push(homework);
        $scope.publishHomeworks(homeworks, isPublish, cb);
    }

    /**
     * Publish or un-publishes lessons
     * @param lessons Array of lessons to publish or unpublish
     * @param isPublish If true publishes lesson else unpublishes it
     * which is lesson id to delete
     */
    $scope.publishHomeworks = function (homeworks, isPublish, cb) {
        $scope.currentErrors = [];
        $scope.processingData = true;

        model.publishHomeworks({ids:model.getItemsIds(homeworks)}, isPublish, function () {

            // refresh state of homeworks to published or unpublished
            homeworks.forEach(function (homework) {
                homework.state = isPublish ? 'published' : 'draft';
            });

            $scope.closeConfirmPanel();

            notify.info(isPublish ? 'item.published' : 'item.unpublished');

            if (typeof cb === 'function') {
                cb();
            }
        }, function (e) {
            $scope.processingData = false;
            validationError(e);
        });
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


    /**
     * Close confirmation panel
     */
    $scope.closeConfirmPanel = function () {

        $scope.processingData = false;
        $scope.display.showPanel = false;
        template.close('lightbox');
        $scope.$apply();
    };

    /**
     * Display confirmation panel
     */
    $scope.showConfirmPanel = function (panelContent) {
        template.open('lightbox', panelContent);
        $scope.display.showPanel = true;
    };


    /**
     * Test in calendar view if there are one lesson
     * or one homework only selected (not both lessons and homeworks)
     * @returns {boolean}
     */
    $scope.isOneHomeworkOrLessonStriclySelected = function () {
        var hasLessonOnlySelected = $scope.lessons.selection().length == 1 && $scope.homeworks.selection().length == 0;
        var hasHomeworkOnlySelected = $scope.homeworks.selection().length == 1 && $scope.lessons.selection().length == 0;

        return hasLessonOnlySelected || hasHomeworkOnlySelected;
    }


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

        $scope.lessons.forEach(function (lesson) {
            if (lesson.selected) {
                if (lesson.isPublishable(true)) {
                    publishableSelectedLessons.push(lesson);
                } else if (lesson.isPublishable(false)) {
                    unPublishableSelectedLessons.push(lesson);
                } else {
                    noStateChangeLessons.push(lesson);
                }
            }
        });

        // only free homeworks can be published/unpublished
        $scope.homeworks.forEach(function (homework) {
            if (homework.selected) {
                if (homework.isPublishable(true)) {
                    publishableSelectedHomeworks.push(homework);
                } else if (homework.isPublishable(false)) {
                    unPublishableSelectedHomeworks.push(homework);
                } else {
                    noStateChangeHomeworks.push(homework);
                }
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

        var postPublishFunction = function () {
            $scope.processingData = false;

            if(toPublish) {
                notify.info('item.published');
            } else {
                notify.info('item.unpublished')
            }
            $scope.closeConfirmPanel();
            $scope.$apply();
        }

        if (lessons.length > 0) {

            model.publishLessons({ids: model.getItemsIds(lessons)}, toPublish,
                function (cb) {
                    lessons.forEach(function (lesson) {
                        lesson.changeState(toPublish);
                    });
                    postPublishFunction();
                }, function (cbe) {
                    notify.error(cbe.message);
                })
        }

        if (homeworks.length > 0) {

            model.publishHomeworks({ids: model.getItemsIds(homeworks)}, toPublish,
                function (cb) {
                    homeworks.forEach(function (homework) {
                        homework.state = toPublish ? 'published' : 'draft';
                    });
                    postPublishFunction();
                }, function (cbe) {
                    notify.error(cbe.message);
                })
        }
    }

    $scope.getItemsPublishableSelectedCount = function (toPublish) {

        var itemsSelected = getPublishableItemsSelected();

        if (toPublish) {
            return itemsSelected.publishableSelectedLessons.length + itemsSelected.publishableSelectedHomeworks.length;
        } else {
            return itemsSelected.unPublishableSelectedLessons.length + itemsSelected.unPublishableSelectedHomeworks.length;
        }
    }

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


        if (toPublish) {
            // nothing selected
            if (publishableLessons.length + publishableHomeworks.length == 0) {
                return false;
            } else {
                var noUnpublishableItems = unpublishableHomeworks.length == 0 && unpublishableLessons.length == 0;
                return (publishableLessons.length > 0 && noUnpublishableItems  && noStateChangeLessons.length == 0)
                    || (publishableHomeworks.length > 0 && noUnpublishableItems && noStateChangeHomeworks.length == 0);
            }
        } else {
            // nothing selected
            if (unpublishableLessons.length + unpublishableHomeworks.length == 0) {
                return false;
            } else {
                var noPublishableItems = publishableLessons.length == 0 && publishableHomeworks.length == 0;
                return (unpublishableLessons.length > 0 && noPublishableItems && noStateChangeLessons.length == 0)
                    || (unpublishableHomeworks.length > 0 && noPublishableItems && noStateChangeHomeworks.length == 0);
            }
        }
    }

    /**
     * Tells if at least one draft is selected and only drafts
     * @returns {boolean} true if one draft lesson selected else false
     */
    $scope.isOneDraftOnlyInSelected = function () {

        var selected = false;

        model.lessons.selection().forEach(function (lesson) {
            if (lesson.isDraft()) {
                selected = true;
            } else {
                return false;
            }
        });

        return selected;
    }

    /**
     * Tells if at least one published lesson is selected and only published ones
     * @returns {boolean} true if one draft lesson published else false
     */
    $scope.isOnePublishedOnlyInSelected = function () {

        var selected = false;

        model.lessons.selection().forEach(function (lesson) {
            if (lesson.isPublished()) {
                selected = true;
            } else {
                return false;
            }
        });

        return selected;
    }

    $scope.getSelectedLessons = function(){
        var itemArray = [];

        model.lessons.selection().forEach(function (lesson) {
            itemArray.push(lesson);
        });

        return itemArray;
    }



    /**
     * Delete selected lessons
     * @param item Lesson
     */
    $scope.deleteSelectedLessons = function () {
        $scope.currentErrors = [];
        $scope.deleteLessons($scope.getSelectedLessons());
    };

    /**
     * Delete lessons
     * @param Lessons Lessons to be deleted
     * which is lesson id to delete
     */
    $scope.deleteLessons = function (lessons) {
        $scope.currentErrors = [];

        $scope.newLesson.deleteLessons(lessons, function () {

            // refresh current lessons cache to sync with lessons deleted
            lessons.forEach(function (deletedLesson) {
                deletedLesson.deleteModelReferences();
            });

            $scope.closeConfirmPanel();
            notify.info('item.deleted');
        },function (e) {
            validationError(e);
        });
    };

    /**
     * Deletes an homework
     * @param homework Homework to be deleted
     * @param lesson Lesson attached to homework (optional)
     */
    $scope.deleteHomework = function (homework, lesson) {

        // TODO user confirm panel?
        homework.delete(lesson, function () {
            notify.info('homework.deleted');
            $scope.$apply();
        }, function (e) {
            validationError(e);
        });
    };


    $scope.createOrUpdateHomework = function (goToCalendarView) {
        $scope.currentErrors = [];
        if ($scope.newItem) {
            $scope.homework.dueDate = $scope.newItem.date;
        }

        $scope.homework.save(function () {
            model.homeworks.syncHomeworks();
            $scope.showCal = !$scope.showCal;
            notify.info('homework.saved');
            $scope.$apply();

            if (goToCalendarView) {
                $scope.goToCalendarView();
                $scope.lesson = null;
                $scope.homework = null;
            }

        }, function (e) {
            validationError(e);
        });
    };


    /**
     * Load related data to lessons and homeworks from database
     */
    $scope.initialization = function () {
        $scope.countdown = 5;
        var teacher = new Teacher();
        teacher.create($scope.decrementCountdown);
        model.subjects.syncSubjects($scope.decrementCountdown);
        model.audiences.syncAudiences(function(){
            $scope.decrementCountdown();

            // call lessons/homework sync after audiences sync since
            // lesson and homework objects needs audience data to be built
            model.lessons.syncLessons($scope.decrementCountdown);
            model.homeworks.syncHomeworks(
                function(){
                    model.homeworksLoaded = true;
                    $scope.decrementCountdown();

                    // tricky way to trigger displaying the homework panel in calendar
                    model.calendar.setDate(moment(model.calendar.firstDay));
                }
            );
        });

    };

    /**
     * Used when using consecutive callbacks
     * and execute function once X callbacks have processed
     * (for example init templates once all sync functions (homeworks, lessons, ...) have been processed)
     * @param countDownVar Variable number to decrement at each call of this function
     * @param cb Function to execute once the number of occurences have been reached
     */
    $scope.decrementSyncCountdown = function (countDownVar, cb) {
        countDownVar--;

        if (countDownVar == 0) {

            if (typeof cb === 'function') {
                cb();
            }
        }
    }

    // TODO merge/use with decrementSyncCountDown
    $scope.decrementCountdown = function () {
        $scope.countdown--;
        if ($scope.countdown == 0) {
            $scope.initTemplates();
        }
    };

    $scope.initTemplates = function () {
        template.open('main', 'main');
        template.open('create-lesson', 'create-lesson');
        template.open('create-homework', 'create-homework');
        template.open('daily-event-details', 'daily-event-details');
        template.open('daily-event-item', 'daily-event-item');
        $scope.showCal = !$scope.showCal;
        $scope.$apply();
    };

    $scope.nextWeek = function () {
        model.homeworksLoaded = undefined;
        var next = moment(model.calendar.firstDay).add(7, 'day');
        model.calendar.setDate(next);
        model.lessons.syncLessons();
        model.homeworks.syncHomeworks(function(){
            model.homeworksLoaded = true;
            $scope.showCal = !$scope.showCal;
            $scope.$apply();

            // tricky way to trigger displaying the homework panel in calendar
            // once data loaded
            model.calendar.setDate(moment(model.calendar.firstDay));
        });
    };

    $scope.previousWeek = function () {
        model.homeworksLoaded = undefined;
        var prev = moment(model.calendar.firstDay).subtract(7, 'day');
        model.calendar.setDate(prev);
        model.lessons.syncLessons();
        model.homeworks.syncHomeworks(function(){
            model.homeworksLoaded = true;
            $scope.showCal = !$scope.showCal;
            $scope.$apply();

            // tricky way to trigger displaying the homework panel in calendar
            // once data loaded
            model.calendar.setDate(moment(model.calendar.firstDay));
        });
    };

    $scope.redirect = function(path){
        $location.path(path);
    };



    /**
     *
     * @returns {*}
     */
    var getSelectedHomeworks = function(){
        var selectedHomeworks = model.homeworks.filter(function (homework) {
            return homework && homework.selected;
        });

        return selectedHomeworks;
    }


    $scope.getLessonsOrHomeworksSelectedCount = function () {
        return getSelectedLessons().length + getSelectedHomeworks().length;
    }

    /**
     *
     * @returns {*}
     */
    var getSelectedLessons = function(){
        var selectedLessons = model.lessons.filter(function (lesson) {
            return lesson && lesson.selected;
        });

        return selectedLessons;
    }

    /**
     * Init lesson object
     * @param initTimeFromCalendar If true will init start time/end time to calendar start/end time user choice
     * else to now -> now + 1 hour starting at the very beginning of hour (HH:00)
     */
    var initLesson = function (timeFromCalendar) {

        $scope.lesson = new Lesson();
        $scope.homework = new Homework();

        $scope.lesson.audience = $scope.homework.audienc = model.audiences.first();
        $scope.lesson.subject = $scope.homework.subject = model.subjects.first();
        $scope.lesson.audienceType = $scope.homework.audienceType = 'class';
        $scope.lesson.color = $scope.homework.color = 'pink';
        $scope.lesson.state = 'draft';
        $scope.homework.type = model.homeworkTypes.first();

        // init start/end time to calendar user's choice (HH:00) -> now (HH:00) + 1 hour
        if (timeFromCalendar) {
            $scope.newItem = model.calendar.newItem;

            // force to HH:00 -> HH:00 + 1 hour
            $scope.newItem.beginning = $scope.newItem.beginning.minute(0).second(0);
            $scope.newItem.date = $scope.newItem.beginning;

            $scope.newItem.end = moment($scope.newItem.beginning);
            $scope.newItem.end.minute(0).second(0).add(1, 'hours');
        }
        // init start/end time to now (HH:00) -> now (HH:00) + 1 hour
        else {
            $scope.newItem = {
                date: moment().minute(0).second(0),
                beginning: moment().minute(0).second(0),
                end: moment().minute(0).second(0).add(1, 'hours')
            }
        }

        $scope.lesson.date = $scope.newItem.date;
    }

    var initHomework = function() {

        if (!$scope.homework) {
            $scope.homework = new Homework();
        }

        $scope.homework.audience = model.audiences.first();
        $scope.homework.subject = model.subjects.first();
        $scope.homework.audienceType = 'class';
        $scope.homework.color = 'pink';
        $scope.homework.type = model.homeworkTypes.first();
        $scope.homework.state = 'draft';
        $scope.newItem = {
            date: moment().minute(0).second(0)
        };
    }

    var validationError = function(e){
        notify.error(e.error);
        $scope.currentErrors.push(e);
        $scope.$apply();
    };
}
