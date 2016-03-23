function DiaryController($scope, model, route, date) {
    $scope.lightboxes = {
    };
    $scope.tabs = {
        createLesson: 'lesson'
    };

    template.open('main', 'main');
    template.open('create-lesson', 'create-lesson');
    template.open('create-homework', 'create-homework');
    template.open('daily-event-details', 'daily-event-details');

    $scope.lesson = new Lesson();
    $scope.homework = new Homework();

    model.on('classrooms.sync', function () {
        $scope.lesson.classroom = $scope.homework.classroom = model.classrooms.first();
        $scope.lesson.subject = $scope.homework.subject = model.subjects.first();
        $scope.lesson.audienceType = $scope.homework.audienceType = 'class';
        $scope.lesson.color = $scope.homework.color = 'pink';
        $scope.homework.type = model.homeworkTypes.first();
    });

    $scope.lessons = model.lessons;
    $scope.classrooms = model.classrooms;
    $scope.subjects = model.subjects;
    $scope.homeworkTypes = model.homeworkTypes;
    $scope.homeworks = model.homeworks;

    $scope.openLessonView = function(){
        $scope.lightboxes.createLesson = true;
        $scope.newItem = {
            beginning: moment(),
            end: moment()
        }
    }

    $scope.createLesson = function (start, end) {
        $scope.lesson.startTime = start;
        $scope.lesson.endTime = end;
        $scope.lesson.date = start;
        $scope.lesson.save();
    };
    
    $scope.createHomework = function () {
        $scope.homework.save();
    };

    //fixme, Camille can we manage the load order with another way
    $scope.initialization = function () {
        $scope.subjects.sync();
        $scope.classrooms.sync(function () {
            model.lessons.sync();
            $scope.$apply();
        });
    };

    $scope.nextWeek = function () {
        var next = moment(model.calendar.firstDay).add(7, 'day');
        model.calendar.setDate(next);
        model.trigger('calendar.date-change');
    };

    $scope.previousWeek = function () {
        var prev = moment(model.calendar.firstDay).subtract(7, 'day');
        model.calendar.setDate(prev);
        model.trigger('calendar.date-change');
    };
}
