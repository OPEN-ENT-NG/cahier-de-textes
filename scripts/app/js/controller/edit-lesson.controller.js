(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("EditLessonController", controller);

        function controller($scope, $routeParams,PedagogicItemService,constants) {

            var vm = this;

            init();

            function init() {
                //existing lesson
                if ($routeParams.idLesson) {
                    model.newLesson = null;
                    loadExistingLesson();
                } else if(model.newLesson){
                    createNewLessonFromPedagogicItem();
                }else {
                    //new lesson
                    loadNewLesson();
                }

                $scope.data.tabSelected = 'lesson';

                //add watch on selection
                $scope.$watch('lesson.audience',()=>{
                    if($scope.lesson && $scope.lesson.previousLessons){
                        $scope.loadPreviousLessonsFromLesson($scope.lesson);
                    }
                });
                //add watch on selection
                $scope.$watch('lesson.subject',()=>{
                    if ($scope.lesson && $scope.lesson.previousLessons){
                        $scope.loadPreviousLessonsFromLesson($scope.lesson);
                    }
                });
            }



            function createNewLessonFromPedagogicItem (){
                $scope.lesson = model.newLesson;
                model.newLesson=null;
                //$scope.newItem = $scope.lesson.newItem;
                populateExistingLesson();
            }

            function populateExistingLesson(){
                $scope.tabs.createLesson = $routeParams.idHomework ? 'homeworks' : 'lesson';
                $scope.tabs.showAnnotations = false;

                // open existing lesson for edit

                $scope.lesson.previousLessonsLoaded = false; // will force reload
                $scope.newItem = {
                    date: moment($scope.lesson.date),
                    beginning: $scope.lesson.startMoment, //moment($scope.lesson.beginning),
                    end: $scope.lesson.endMoment //moment($scope.lesson.end)
                };

                $scope.loadHomeworksForCurrentLesson(function() {
                    $scope.lesson.homeworks.forEach(function(homework) {
                        if ($scope.lesson.homeworks.length || ($routeParams.idHomework && $routeParams.idHomework == homework.id)) {
                            homework.expanded = true;
                        }

                        model.loadHomeworksLoad(homework, moment(homework.date).format("YYYY-MM-DD"), $scope.lesson.audience.id);
                    });
                });

            }
            /*
            * load existing lesson
            */
            function loadExistingLesson() {
                let lesson = new Lesson();
                model.lesson = lesson;
                lesson.id = parseInt($routeParams.idLesson);

                $scope.lessonDescriptionIsReadOnly = false;
                $scope.homeworkDescriptionIsReadOnly = false;
                $scope.lesson = lesson;
                lesson.load(true, ()=> {
                    populateExistingLesson();
                }, function(cbe) {
                    notify.error(cbe.message);
                });
            }

            function loadNewLesson(){
                var selectedDate = $scope.selectedDateInTheFuture();

                $scope.lesson = model.initLesson(("timeFromCalendar" === $routeParams.timeFromCalendar), selectedDate);
                $scope.newItem = $scope.lesson.newItem;
            }
            /**
             * Load homeworks for current lesson being edited
             * @param cb Callback function
             */
            $scope.loadHomeworksForCurrentLesson = function(cb) {

                // lesson not yet created do not retrieve homeworks
                if (!$scope.lesson.id) {
                    return;
                }

                var needSqlSync = false;

                // if homeworks ever retrieved from db don't do it again!
                $scope.lesson.homeworks.forEach(function(homework) {
                    if (!homework.loaded) {
                        needSqlSync = true;
                    }
                });

                // only reload homeworks if necessary
                if (needSqlSync) {
                    model.loadHomeworksForLesson($scope.lesson,

                        function() {
                            if (typeof cb !== 'undefined') {
                                cb();
                            }
                            $scope.$apply();
                        },
                        function(e) {
                            validationError(e);
                        });
                } else {
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
            $scope.createOrUpdateLesson = function(goMainView, cb) {

                $scope.currentErrors = [];

                $scope.lesson.startTime = $scope.newItem.beginning;
                $scope.lesson.endTime = $scope.newItem.end;
                $scope.lesson.date = $scope.newItem.date;

                $scope.lesson.save(function() {
                    notify.info('lesson.saved');
                    $scope.lesson.audience = model.audiences.findWhere({
                        id: $scope.lesson.audience.id
                    });
                    if (goMainView) {
                        $scope.goToMainView();
                        $scope.lesson = null;
                        $scope.homework = null;
                    }
                    if (typeof cb === 'function') {
                        cb();
                    }
                }, function(e) {
                    validationError(e);
                });
            };

            $scope.loadMorePreviousLessonsFromLesson = function (currentLesson) {
                if (currentLesson.allPreviousLessonsLoaded || currentLesson.previousLessonsLoading){
                    return;
                }
                $scope.loadPreviousLessonsFromLesson(currentLesson, true);
            };



            var defaultCount = 6;
            var idx_start = 0;
            var idx_end = idx_start + defaultCount;


            $scope.loadPreviousLessonsFromLesson = function (lesson,useDeltaStep) {

                if (!useDeltaStep) {
                    lesson.allPreviousLessonsLoaded = false;
                }

                if (useDeltaStep) {
                    idx_start += defaultCount;
                    idx_end += defaultCount;
                }

                var params = {
                    offset : idx_start,
                    limit : idx_end,
                    excludeLessonId : lesson.id ? lesson.id : null,
                    startDate : moment(lesson.date).add(-2, 'month').format(DATE_FORMAT),
                    subject : lesson.subject.id,
                    audienceId : lesson.audience.id,
                    returnType : 'lesson',
                    homeworkLinkedToLesson : "true",
                    sortOrder : "DESC"
                };

                // tricky way to detect if string date or moment date ...
                // 12:00:00
                if (lesson.endTime.length === 8) {
                      params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + lesson.endTime;
                  } else {
                      params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + moment(lesson.endTime).format("HH:mm");
                  }

                if (!lesson.previousLessons) {
                    lesson.previousLessons = [];
                }

                lesson.previousLessonsLoading = true;
                PedagogicItemService.getPedagogicItems(params).then((pedagogicItems) => {
                    //lesson.previousLessonsDisplayed = [];
                    if (pedagogicItems.length < defaultCount){
                        lesson.allPreviousLessonsLoaded = true;
                    }

                    var groupByItemType = _.groupBy(pedagogicItems, 'type_item');
                    var previousLessons = groupByItemType.lesson;

                    if (previousLessons) {
                        var previousLessonIds = [];

                        previousLessons.forEach(function (lesson) {
                            previousLessonIds.push(lesson.id);
                        });

                        // load linked homeworks of previous lessons
                        var paramsHomeworks = {
                            returnType : 'homework',
                            homeworkLessonIds : previousLessonIds
                        };

                        PedagogicItemService.getPedagogicItems(paramsHomeworks).then((previousHomeworks)=>{
                            previousLessons.forEach(function (lesson) {
                                lesson.homeworks = _.where(previousHomeworks, {lesson_id: lesson.id});
                            });
                            if (idx_start !==0){
                                lesson.previousLessons = lesson.previousLessons.concat(previousLessons);
                            }else{
                                lesson.previousLessons = previousLessons;
                            }
                            lesson.previousLessonsLoaded = true;
                            lesson.previousLessonsLoading = false;
                            //lesson.previousLessonsDisplayed = lesson.previousLessons;

                            if (typeof cb === 'function') {
                                cb();
                            }
                        });

                    } else {
                        lesson.previousLessons = [];
                        lesson.previousLessonsLoaded = true;
                        lesson.previousLessonsLoading = false;
                        //lesson.previousLessonsDisplayed = lesson.previousLessons;
                        if (typeof cb === 'function') {
                            cb();
                        }
                    }

                });
            };


        }
    });

})();
