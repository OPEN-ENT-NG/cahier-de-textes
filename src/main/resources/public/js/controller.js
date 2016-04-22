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

    $scope.lessons = model.lessons;
    $scope.audiences = model.audiences;
    $scope.subjects = model.subjects;
    $scope.homeworkTypes = model.homeworkTypes;
    $scope.homeworks = model.homeworks;

    route({
        createLessonView: function(params){
            $scope.lesson = null;
            $scope.tabs.createLesson = 'lesson';
            var lessonTimeFromCalendar = ("timeFromCalendar" === params.timeFromCalendar);
            $scope.openLessonView(null, params, lessonTimeFromCalendar);
            template.open('main', 'main');
            template.close('calendar');
            template.close('create-homework');
            template.open('create-lesson', 'create-lesson');
        },
        createHomeworkView: function(params){
            $scope.homework = null;
            $scope.openHomeworkView(null, params);
            template.open('main', 'main');
            template.close('calendar');
            template.close('create-lesson');
            template.open('create-homework', 'create-homework');
        },
        editLessonView: function(params) {
            loadLessonFromRoute(params.idLesson);
            template.open('main', 'main');
            template.close('calendar');
            template.close('create-homework');
            template.open('create-lesson', 'create-lesson');
        },
        editHomeworkView: function(params) {
            loadHomeworkFromRoute(params.id);
            template.open('main', 'main');
            template.close('calendar');
            template.close('create-lesson');
            template.open('create-homework', 'create-homework');
        },
        calendarView: function(params){
            if (params.startDate != null) {
                //put the start date in the scope?
            }
            template.open('main', 'main');
            template.close('create-lesson');
            template.close('create-homework');
            template.open('calendar', 'calendar');
            template.open('daily-event-details', 'daily-event-details');
        }
    });

    var loadLessonFromRoute = function (idLesson) {

        var lesson = model.lessons.findWhere({id: parseInt(idLesson)});

        if (lesson != null) {
            $scope.openLessonView(lesson);
        }
    };

    var loadHomeworkFromRoute = function(idHomework) {
        var homework = model.homeworks.findWhere({ id:  idHomework });
        if (homework != null) {
            $scope.openHomeworkView(homework);
        }
    };

    /**
     * @param initFromCalendar If true start and end time will be initialized to user choice in calendar
     * else will be initialized to today for start time and start time + 1 hour for end time
     */
    $scope.openLessonView = function(lesson, params, timeFromCalendar){

        // open existing lesson for edit
        if (lesson) {
            $scope.lesson = new Lesson();
            $scope.lesson.updateData(lesson);
            $scope.newItem = {
                date: moment($scope.lesson.date),
                beginning: moment($scope.lesson.beginning),
                end: moment($scope.lesson.end)
            }
        }
        // create new lesson
        else {
            initLesson(timeFromCalendar);
        }

    };

    $scope.openHomeworkView = function(homework, params){

        if (homework) {
            $scope.homework = new Homework();
            $scope.homework.updateData(homework);
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
     * 
     */
    $scope.editSelectedLesson = function(){
        var selectedLessons = model.lessons.filter(function (someLesson) {
            return someLesson && someLesson.selected;
        });
        
        var selectedLesson = selectedLessons.length > 0 ? selectedLessons[0] : null;
        
        if(selectedLesson){
            $scope.redirect('/editLessonView/' + selectedLesson.id);
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


        $scope.lesson.save(function () {
            //TODO don't reload all calendar view
            model.lessons.syncLessons();
            $scope.showCal = !$scope.showCal;
            notify.info('lesson.saved.draft');
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
     * Delete selected lessons
     * @param item Lesson
     */
    $scope.publishSelectedLessons = function () {
        $scope.currentErrors = [];

        var selectedLessons = model.lessons.filter(function (someLesson) {
            return someLesson && someLesson.selected;
        });

        $scope.countdownPublish = selectedLessons.length;

        selectedLessons.forEach(function (lessonToDelete) {
            lessonToDelete.publish(function () {
                $scope.decrementDeleteCountdown();
            }, function (e) {
                validationError(e);
            });
        });
    };

    /**
     * Display confirmation panel for lesson deletion
     */
    $scope.showConfirmDeleteLessonPanel = function () {
        template.open('lightbox', 'confirm-delete-lesson');
        $scope.showConfirmPanel = true;
    };


    /**
     * Close confirmation panel
     */
    $scope.closeConfirmPanel = function () {

        $scope.showConfirmPanel = false;
        template.close('lightbox');
    };

    /**
     * Delete selected lessons
     * @param item Lesson
     */
    $scope.deleteSelectedLessons = function () {
        $scope.currentErrors = [];

        var selectedLessons = model.lessons.filter(function (someLesson) {
            return someLesson && someLesson.selected;
        });

        if (selectedLessons.length == 0) {
            return;
        }

        $scope.processingData = true;
        $scope.countdownDelete = selectedLessons.length;

        selectedLessons.forEach(function (lessonToDelete) {
            lessonToDelete.delete(function () {
                $scope.decrementDeleteCountdown();
            }, function (e) {
                validationError(e);
            });
        });
    };


    $scope.createHomework = function () {
        $scope.currentErrors = [];
        $scope.homework.save(function () {
            //TODO don't reload all calendar view
            model.homeworks.syncHomeworks();
            $scope.goToCalendarView();
            $scope.$apply();
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
            model.homeworks.syncHomeworks($scope.decrementCountdown);
        });

    };

    $scope.decrementDeleteCountdown = function () {
        $scope.countdownDelete--;

        if ($scope.countdownDelete == 0) {
            $scope.showCal = !$scope.showCal;
            $scope.processingData = false;
            $scope.closeConfirmPanel();
            notify.info('lesson.deleted');
        }
    }

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
        $scope.showCal = !$scope.showCal;
        $scope.$apply();
    };

    $scope.nextWeek = function () {
        $scope.showCal = !$scope.showCal;
        var next = moment(model.calendar.firstDay).add(7, 'day');
        model.calendar.setDate(next);
        model.lessons.syncLessons();
        model.homeworks.syncHomeworks();
    };

    $scope.previousWeek = function () {
        $scope.showCal = !$scope.showCal;
        var prev = moment(model.calendar.firstDay).subtract(7, 'day');
        model.calendar.setDate(prev);
        model.lessons.syncLessons();
        model.homeworks.syncHomeworks();
    };

	$scope.redirect = function(path){
        $location.path(path);
    };


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
    }

    var validationError = function(e){
        notify.error(e.error);
        $scope.currentErrors.push(e);
        $scope.$apply();
    };
}
