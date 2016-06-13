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
        .when('/mainView', {
            action: 'mainView'
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

    $scope.calendarLoaded = false;
    $scope.showCal = false;
    $scope.newLesson = new Lesson();
    // for static access to some global function
    $scope.newHomework = new Homework();

    $scope.confirmPanel = {
        item: undefined
    }

    $scope.display = {
        showPanel: false,
        showList: false
    };

    /**
     * Used to know if user clicked on calendar event
     * or is dragging  to prevent ng-click
     */
    $scope.itemMouseEvent = {
        lastMouseDownTime: undefined,
        lastMouseClientX: undefined,
        lastMouseClientY: undefined,
    }

    $scope.pedagogicItems = {
        days : [
            {   dayName :"Vendredi 29 janvier 2016",
                nbLessons : 2,
                nbHomeworks : 2,
                expanded : true,
                pedagogicItemsOfTheDay : [
                    {
                        typeItem : "homework",
                        title : "Exercices de trigonométrie",
                        subject : "Mathématiques",
                        audience : "TS1",
                        startHour : "",
                        endHour : "",
                        typeHomework : "Devoir maison",
                        teacher : "Alain Bono",
                        description : "Faire les exercices 5, 6 et 7 de la page 22 du livre de mathématique. Réaliser les exercices avec soin sur une double feuille à petits carrés.",
                        published : true,
                        color: "#FF60EB"
                    },
                    {
                        typeItem : "homework",
                        title : "Exercices de trigonométrie",
                        subject : "Mathématiques",
                        audience : "2NDE A GR1",
                        startHour : "",
                        endHour : "",
                        typeHomework : "Exercice en cours",
                        teacher : "Alain Bono",
                        description : "Suivre les consignes indiquées dans le fichier PDF ci-joint afin de réaliser les exercices 1, 2 et 4. Les formules à utiliser sont indiquées dans la fiche de description de la leçon.",
                        published : true,
                        color: "#63FF31"
                    },
                    {
                        typeItem : "lesson",
                        title : "Cours de trigonométrie (séance 4/5)",
                        subject : "Mathématiques",
                        audience : "2NDE A GR1",
                        startHour : "8h55",
                        endHour : "11h00",
                        typeHomework : "",
                        teacher : "Alain Bono",
                        description : "Présentation de la trigonométrie. 3) Corrections croisées des exercices par les élèves...",
                        published : true,
                        color: "#63FF31"
                    },
                    {
                        typeItem : "lesson",
                        title : "Statistiques les bases",
                        subject : "Mathématiques",
                        audience : "TS2",
                        startHour : "11h05",
                        endHour : "12h",
                        typeHomework : "",
                        teacher : "Alain Bono",
                        description : "Premier cours magistral sur les calculs de statistiques.",
                        published : false,
                        color: "#8B21FF"
                    }
                ]
            },
            {   dayName :"Jeudi 28 janvier 2016",
                nbLessons : 1,
                nbHomeworks : 2,
                expanded : false,
                pedagogicItemsOfTheDay : [
                    {
                        typeItem : "homework",
                        title : "Exercices de trigonométrie",
                        subject : "Mathématiques",
                        audience : "TS1",
                        startHour : "",
                        endHour : "",
                        typeHomework : "Devoir maison",
                        teacher : "Alain Bono",
                        description : "Faire les exercices 5, 6 et 7 de la page 22 du livre de mathématique. Réaliser les exercices avec soin sur une double feuille à petits carrés.",
                        published : true,
                        color: "#FF60EB"
                    },
                    {
                        typeItem : "homework",
                        title : "Exercices de trigonométrie",
                        subject : "Mathématiques",
                        audience : "2NDE A GR1",
                        startHour : "",
                        endHour : "",
                        typeHomework : "Exercice en cours",
                        teacher : "Alain Bono",
                        description : "Suivre les consignes indiquées dans le fichier PDF ci-joint afin de réaliser les exercices 1, 2 et 4. Les formules à utiliser sont indiquées dans la fiche de description de la leçon.",
                        published : true,
                        color: "#63FF31"
                    },
                    {
                        typeItem: "lesson",
                        title: "Cours de trigonométrie (séance 2/5)",
                        subject: "Mathématiques",
                        audience: "2NDE A GR1",
                        startHour: "8h55",
                        endHour: "11h00",
                        typeHomework: "",
                        teacher: "Alain Bono",
                        description: "Présentation de la trigonométrie. 2) Réalisation d'exercices en cours.",
                        published: true,
                        color: "#63FF31"
                    }
                ]
            },
            {   dayName :"Mardi 26 janvier 2016",
                nbLessons : 2,
                nbHomeworks : 0,
                expanded : false,
                pedagogicItemsOfTheDay : [
                    {
                        typeItem : "lesson",
                        title : "Cours de trigonométrie (séance 1/5)",
                        subject : "Mathématiques",
                        audience : "2NDE B GR1",
                        startHour : "8h55",
                        endHour : "11h00",
                        typeHomework : "",
                        teacher : "Alain Bono",
                        description : "Présentation de la trigonométrie. Cours est découpé en 3 parties : 1) Définitions et présentation sous forme d'exemple. 2) Réalisation d'exercices en cours. 3) Corrections croisées des exercices par les élèves...",
                        published : true,
                        color: "#C1FF45"
                    },
                    {
                        typeItem : "lesson",
                        title : "Cours de trigonométrie (séance 1/5)",
                        subject : "Mathématiques",
                        audience : "2NDE A GR1",
                        startHour : "14h05",
                        endHour : "17h00",
                        typeHomework : "",
                        teacher : "Alain Bono",
                        description : "Présentation de la trigonométrie. Cours est découpé en 3 parties : 1) Définitions et présentation sous forme d'exemple. 2) Réalisation d'exercices en cours. 3) Corrections croisées des exercices par les élèves...",
                        published : true,
                        color: "#63FF31"
                    }
                ]
            }
        ]
    }

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
        },
        editLessonView: function(params) {

            if(!params.idLesson){
                $scope.goToMainView(notify.error('daily.lesson.id.notspecified'));
                return;
            }

            var lesson = model.lessons.findWhere({id: parseInt(params.idLesson)});

            if (lesson != null) {
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
        calendarView: function(params){
            if (params.startDate != null) {
                //put the start date in the scope?
            }
            $scope.lesson = null;
            $scope.homework = null;
            initialization();
        },
        mainView: function(params){
            if ($scope.display.showList) {
                $scope.showList();
            } else {
                $scope.lesson = null;
                $scope.homework = null;
                if($scope.calendarLoaded) {
                    $scope.showCalendar();
                } else {
                    initialization();
                }
            }
        }
    });

    // Navigation
    $scope.showList = function() {
        $scope.display.showList = true;
        //load stuff
        $scope.getListViewData($scope.openListView());
    };

    $scope.openListView = function () {
        template.open('main', 'main');
        template.open('main-view', 'list-view');
    };

    $scope.showCalendar = function() {
        $scope.display.showList = false;
        template.open('main', 'main');
        template.open('main-view', 'calendar');
        template.open('daily-event-details', 'daily-event-details');
    };

    //list-view interactions
    $scope.expandDay = function(day) {
        day.expanded = true;
    };

    $scope.collapseDay = function(day) {
        day.expanded = undefined;
    };

    $scope.getListViewData = function(cb) {

        var items = [];
        var lessons = $scope.lessons;
        var homeworks = $scope.homeworks;

        var days = [];
        lessons.forEach(function (lesson) {
            if (_.contains(days, lesson.date) == false) {
                days.push(lesson.date);
            }
        });

        homeworks.forEach(function (homework) {
            if (_.contains(days, homework.homework_due_date) == false) {
                days.push(homework.homework_due_date);
            }
        });

        console.log("nb days = " + days.length);

        days.forEach(function (day) {

            var pedagogicItemsOfTheDay = [];

            var lessonsOfTheDay = lessons.filter(function (lesson) {
                return lesson.date == day;
            }).map (function(lesson) {
                return $scope.convertLessonToPedagogicItem(lesson);
            });

            console.log("day: " + day + " nb lessonsOfTheDay = " + lessonsOfTheDay.length);

            var homeworksOfTheDay = homeworks.filter(function (homework) {
                return homework.homework_due_date == day;
            }).map (function(homework) {
                return $scope.convertHomeworkToPedagogicItem(homework);
            });

            console.log("nb homeworksOfTheDay = " + homeworksOfTheDay.length);

            pedagogicItemsOfTheDay = homeworksOfTheDay.concat(lessonsOfTheDay);

            console.log("nb pedagogicItemsOfTheDay = " + pedagogicItemsOfTheDay.length);

            var pedagogicDay = {};
            pedagogicDay.pedagogicItemsOfTheDay = pedagogicItemsOfTheDay;
            pedagogicDay.dayName = moment(day.split(' ')[0]).format("dddd DD MMMM YYYY");
            pedagogicDay.nbLessons = lessonsOfTheDay.length;
            pedagogicDay.nbHomeworks = homeworksOfTheDay.length;
            pedagogicDay.expanded = false;
            items.push(pedagogicDay);
        });

        $scope.pedagogicItems = items;
        if(typeof cb === 'function'){
            cb();
        }
    }

    $scope.convertLessonToPedagogicItem = function (lesson) {
        var item = {};
        item.typeItem = "lesson";
        item.id = lesson.id;
        item.title = lesson.title;
        item.subject = lesson.subjectLabel;
        item.audience = lesson.audienceLabel;
        item.startHour = moment(lesson.date).minutes($scope.getMinutes(lesson.startTime)).format("HH[h]mm");
        item.endHour = moment(lesson.date).minutes($scope.getMinutes(lesson.endTime)).format("HH[h]mm");
        item.typeHomework = "";
        item.teacher = lesson.teacherId;
        item.description = lesson.description;
        item.published = lesson.state == "published";
        item.color = lesson.color;
        return item;
    }



    $scope.convertHomeworkToPedagogicItem = function (homework) {
        var item = {};
        item.typeItem = "homework";
        item.id = homework.id;
        item.title = homework.homework_title;
        item.subject = homework.subject_label;
        item.audience = homework.audience_label;
        item.startHour = "";
        item.endHour = "";
        item.typeHomework = homework.homework_type_label;
        item.teacher = "teacher";
        item.description = homework.homework_description;
        item.published = homework.homework_state == "published";
        item.color = homework.homework_color;
        return item;
    }

    $scope.getMinutes = function (time) {
        return time.split(':')[0] * 60 + time.split(':')[1];
    }

    var loadHomeworkFromRoute = function(params) {
        // try find homework in current week homeworks cache
        var homework = model.homeworks.findWhere({ id: parseInt(params.idHomework)});

        if (homework != null) {
            $scope.openHomeworkView(homework);
        }
        // load from db
        else {
            homework = new Homework();
            homework.id = parseInt(params.idHomework);

            homework.load(function(){
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

        $scope.tabs.createLesson = params.idHomework ? 'homeworks' : 'lesson';
        $scope.tabs.showAnnotations = false;

        var openLessonTemplates = function(){
            template.open('main', 'main');
            template.open('main-view', 'create-lesson');
        }

        // open existing lesson for edit
        if (lesson) {
            if (!$scope.lesson) {
                $scope.lesson = new Lesson();
            }
            $scope.lesson.updateData(lesson);
            $scope.newItem = {
                date: moment($scope.lesson.date),
                beginning: $scope.lesson.startMoment, //moment($scope.lesson.beginning),
                end: $scope.lesson.endMoment //moment($scope.lesson.end)
            }

            $scope.loadHomeworksForCurrentLesson(function () {
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
        } else {
            initHomework();
        }

        template.open('main', 'main');
        template.open('main-view', 'create-homework');
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
    }

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
     * @param goMainView if true will switch to calendar or list view
     * after create/update else stay on current page
     */
    $scope.createOrUpdateLesson = function (goMainView) {

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
            }, function (e) {
            validationError(e);
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
     * Publishes or unpublishes homework and go back to main view
     * @param homework Homework
     * @param isPublish if true publishes homework else un-publishes it
     */
    $scope.publishHomeworkAndGoCalendarView = function (homework, isPublish) {
        $scope.publishHomework(homework, isPublish, $scope.goToMainView());
    }

    /**
     * Publishes or unpublishes lesson and go back to main view
     * @param lesson Lesson
     * @param isPublish if true publishes lesson else un-publishes it
     */
    $scope.publishLessonAndGoCalendarView = function (lesson, isPublish) {
        $scope.publishLesson(lesson, isPublish, $scope.goToMainView());
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


    $scope.deleteHomeworkAndCloseConfirmPanel = function (homework, lesson) {
        $scope.deleteHomework(homework, lesson, function(){
            $scope.closeConfirmPanel();
        });
    }

    /**
     * Deletes an homework
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


    $scope.createOrUpdateHomework = function (goToMainView) {
        $scope.currentErrors = [];
        if ($scope.newItem) {
            $scope.homework.dueDate = $scope.newItem.date;
        }

        var postHomeworkSave = function () {
            model.homeworks.syncHomeworks();
            $scope.showCal = !$scope.showCal;
            notify.info('homework.saved');
            $scope.homework.audience = model.audiences.findWhere({id: $scope.homework.audience.id});
            $scope.$apply();

            if (goToMainView) {
                $scope.goToMainView();
                $scope.lesson = null;
                $scope.homework = null;
            }
        }

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
     */
    var initialization = function () {

        $scope.countdown = 4;
        var teacher = new Teacher();
        teacher.create(decrementCountdown());

        // subjects and audiences needed to fill in
        // homeworks and lessons props
        model.subjects.syncSubjects(function () {
            model.audiences.syncAudiences(function () {
                decrementCountdown();

                // call lessons/homework sync after audiences sync since
                // lesson and homework objects needs audience data to be built
                model.lessons.syncLessons(decrementCountdown());
                model.homeworks.syncHomeworks(decrementCountdown());
            });
        });
    };


    // TODO merge/use with decrementSyncCountDown
    var decrementCountdown = function () {
        $scope.countdown--;
        if ($scope.countdown == 0) {
            $scope.calendarLoaded = true;
            showTemplates();
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

    $scope.nextWeek = function () {
        var nextMonday = moment(model.calendar.firstDay).add(7, 'day');
        model.calendar.week++;
        refreshCalendar(nextMonday);
    };

    $scope.previousWeek = function () {
        var prevMonday = moment(model.calendar.firstDay).subtract(7, 'day');
        model.calendar.week--;
        refreshCalendar(prevMonday);
    };

    /**
     * Refresh calendar from given date.
     * Will refresh ui and lessons and homeworks week data cache
     * @param momentDate Start date (monday only)
     */
    var refreshCalendar = function (momentDate) {
        model.calendar.setDate(momentDate);
        model.lessons.syncLessons();
        model.homeworks.syncHomeworks(function () {
            $scope.showCal = !$scope.showCal;
            $scope.$apply();
        });
    };


    $scope.setMouseDownTime = function ($event) {
        $scope.itemMouseEvent.lastMouseDownTime = new Date().getTime();
        $scope.itemMouseEvent.lastMouseClientX = $event.clientX;
        $scope.itemMouseEvent.lastMouseClientY = $event.clientY;
    }

    /**
     * Redirect to path only when user is doind a real click.
     * If user is draging item redirect will not be called
     * @param path
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
    }

    $scope.redirect = function (path) {
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
        $scope.lesson.color = $scope.homework.color = '#ff8000'; // orange
        $scope.lesson.state = 'draft';
        $scope.lesson.title = lang.translate('diary.lesson.label');
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
        $scope.homework.color = '#ff8000'; // orange
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
