routes.define(function ($routeProvider) {
    $routeProvider
        // create new lesson
        .when('/createLessonView/:calendar', {
            action: 'createLesson'
        })
        // create/update homework view
        .when('/createHomeworkView', {
            action: 'createHomework'
        })
        // calendar view (normally default one for first time access)
        .when('/calendarView', {
            action: 'calendar'
        })
        // default view
        .otherwise({
            action: 'default'
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


    /**
     *
     * @param lesson
     * @param params
     * @param initFromCalendar If true start and end time will be initialized to user choice in calendar
     * else will be initialized to today for start time and start time + 1 hour for end time
     */
    $scope.initLessonViewData = function(lesson, params, initFromCalendar){

        // open existing lesson for edit
        if (lesson) {
            $scope.lesson.updateData(lesson);
            $scope.newItem = {
                date: moment($scope.lesson.date),
                beginning: moment($scope.lesson.beginning),
                end: moment($scope.lesson.end)
            }
        }
        // create new lesson
        else {
            initLesson(initFromCalendar);
        }

    };

    $scope.initHomeworkViewData = function(homework, params){

        if (homework) {
            $scope.homework.updateData(homework);
        } else {
            initHomework();
        }
    };

    route({
        // TODO default view calendar
        default: function(){
            window.location.hash = '';
        },
        createLesson: function(params){
            $scope.lesson = null;
            var initFromCalendar = ("calendar" === params.calendar);
            $scope.initLessonViewData($scope.lesson, params, initFromCalendar);
            template.open('main', 'create-lesson');
        },
        createHomework: function(params){
            params.calendar === true
            $scope.homework = null;
            $scope.initHomeworkViewData($scope.lesson, params);
            template.open('main', 'create-homework');
        },
        calendar: function(params){
            template.close('main');
            template.open('main', 'main');
        }
    });

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
     * Update lesson object from page fields
     * and save it to DB.
     */
    $scope.createLesson = function () {
        $scope.currentErrors = [];

        $scope.lesson.startTime = $scope.newItem.beginning;
        $scope.lesson.endTime = $scope.newItem.end;
        $scope.lesson.date = $scope.newItem.date;


        $scope.lesson.save(function () {
            //TODO don't reload all calendar view
            model.lessons.syncLessons();
            $scope.showCal = !$scope.showCal;
            $scope.lesson = null; // needed if we create another lesson just after this one
            $scope.goToCalendarView();
            $scope.$apply();
        }, function (e) {
            validationError(e);
        });
    };

    $scope.updateLesson = function () {
        $scope.currentErrors = [];
        $scope.lesson.save(function () {
            //TODO don't reload all calendar view
            model.lessons.syncLessons();
            $scope.showCal = !$scope.showCal;
            $scope.$apply();
        }, function (e) {
            validationError(e);
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
        model.audiences.syncAudiences($scope.decrementCountdown);
        model.lessons.syncLessons($scope.decrementCountdown);
        model.homeworks.syncHomeworks($scope.decrementCountdown);
    };

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
    var initLesson = function (initTimeFromCalendar) {

        if (!$scope.lesson) {
            $scope.lesson = new Lesson();
            $scope.homework = new Homework();
        }

        $scope.lesson.audience = $scope.homework.audienc = model.audiences.first();
        $scope.lesson.subject = $scope.homework.subject = model.subjects.first();
        $scope.lesson.audienceType = $scope.homework.audienceType = 'class';
        $scope.lesson.color = $scope.homework.color = 'pink';
        $scope.homework.type = model.homeworkTypes.first();

        // init start/end time to calendar user's choice (HH:00) -> now (HH:00) + 1 hour
        if (initTimeFromCalendar) {
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

        $scope.homework.audience = $scope.homework.audience = model.audiences.first();
        $scope.homework.subject = $scope.homework.subject = model.subjects.first();
        $scope.homework.audienceType = $scope.homework.audienceType = 'class';
        $scope.homework.color = $scope.homework.color = 'pink';
        $scope.homework.type = model.homeworkTypes.first();
    }

    var validationError = function(e){
        notify.error(e.error);
        $scope.currentErrors.push(e);
        $scope.$apply();
    };
}
