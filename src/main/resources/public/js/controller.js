function DiaryController($scope, model, route, date) {
    $scope.lightboxes = {
    };
    $scope.currentErrors = [];
    $scope.tabs = {
        createLesson: 'lesson'
    };

    $scope.lesson = new Lesson();
    $scope.homework = new Homework();
    $scope.showCal = false;

   /* model.on('audiences.sync', function () {
        $scope.lesson.audience = $scope.homework.audience = model.audiences.first();
        $scope.lesson.subject = $scope.homework.subject = model.subjects.first();
        $scope.lesson.audienceType = $scope.homework.audienceType = 'class';
        $scope.lesson.color = $scope.homework.color = 'pink';
        $scope.homework.type = model.homeworkTypes.first();
    });*/

    $scope.lessons = model.lessons;
    $scope.audiences = model.audiences;
    $scope.subjects = model.subjects;
    $scope.homeworkTypes = model.homeworkTypes;
    $scope.homeworks = model.homeworks;

    $scope.openLessonView = function(lesson){
        if (lesson) {
            $scope.lesson = new Lesson();
            $scope.lesson.updateData(lesson);
            $scope.newItem = {
                beginning: moment($scope.lesson.beginning),
                end: moment($scope.lesson.end)
            }
        } else {
            $scope.lesson = new Lesson();
            initLesson();
            $scope.newItem = {
                beginning: moment().minute(0).second(0),
                end: moment().minute(0).second(0)
            }
        }
        $scope.lightboxes.createLesson = true;
    };

    $scope.openHomeworkView = function(homework){
        if (homework) {
            $scope.homework = new Homework();
            $scope.homework.updateData(homework);
        } else {
            $scope.homework = new Homework();
            initHomework();
        }
        $scope.lightboxes.createHomework = true;
    };

    $scope.closeLesson = function() {

    };

    $scope.createLesson = function (start, end) {
        $scope.currentErrors = [];
        $scope.lesson.startTime = start;
        $scope.lesson.endTime = end;
        $scope.lesson.date = start;
        $scope.lesson.save(function () {
            $scope.lightboxes.createLesson = false;
            //TODO don't reload all calendar view
            model.lessons.syncLessons();
            $scope.showCal = !$scope.showCal;
            $scope.$apply();
        }, function (e) {
            validationError(e);
        });
    };

    $scope.updateLesson = function () {
        $scope.currentErrors = [];
        $scope.lesson.save(function () {
            $scope.lightboxes.createLesson = false;
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
            $scope.lightboxes.createHomework = false;
            //TODO don't reload all calendar view
            model.homeworks.syncHomeworks();
            $scope.$apply();
        }, function (e) {
            validationError(e);
        });
    };

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
        if (countdown == 0) {
            initTemplates();
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

    var initLesson = function() {
        $scope.lesson.audience = $scope.homework.audienc = model.audiences.first();
        $scope.lesson.subject = $scope.homework.subject = model.subjects.first();
        $scope.lesson.audienceType = $scope.homework.audienceType = 'class';
        $scope.lesson.color = $scope.homework.color = 'pink';
        $scope.homework.type = model.homeworkTypes.first();
    }

    var initHomework = function() {
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
