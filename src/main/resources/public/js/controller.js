function DiaryController($scope, model, route, date) {
    $scope.lightboxes = {
    };
    $scope.tabs = {
        createLesson: 'lesson'
    };

    template.open('main', 'main');
    template.open('create-lesson', 'create-lesson');
    template.open('create-homework', 'create-homework');

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

    $scope.createLesson = function (start, end) {
        $scope.lesson.startTime = start;
        $scope.lesson.endTime = end;
        $scope.lesson.date = start;
        $scope.lesson.save();
    };

    $scope.nextWeek = function () {
        var next = moment(model.calendar.firstDay).add(7, 'day');
        model.calendar.setDate(next);
    };

    $scope.previousWeek = function () {
        var prev = moment(model.calendar.firstDay).subtract(7, 'day');
        model.calendar.setDate(prev);
    };
}
