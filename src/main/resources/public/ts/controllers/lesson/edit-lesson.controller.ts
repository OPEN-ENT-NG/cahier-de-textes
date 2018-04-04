import {ng, model, moment, _, notify, idiom as lang } from 'entcore';
import {DATE_FORMAT } from '../../tools';
import { Lesson } from '../../models/index';
import {SubjectService} from "../../services/subject.service";
import {PedagogicItemService} from "../../services/pedagogic-item.service";
import {ProgressionService} from "../../services/progression.service";


export const EditLessonController = ng.controller('EditLessonController',
    ['$scope', '$rootScope', '$routeParams', ($scope, $rootScope, $routeParams) => {

        let vm = this;
        init();

        async function init() {
            this.lesson = new Lesson();
            $scope.lesson = this.lesson;
            //existing lesson
            $scope.tabs.showAnnotations = false;
            await loadSubjects();
            await loadHomeworkTypes();

            if ($routeParams.idLesson) {
                model.newLesson = null;
                loadExistingLesson();
            } else if(model.newLesson){
                createNewLessonFromPedagogicItem();
            }else if ($routeParams.progressionId){
                //show the EditProgressionLessonController
                loadNewLesson();
                return ;
            }else{
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
            // $q.all([
            //     //need subjects
            //     loadSubjects(),
            //     //need homework types
            //     loadHomeworkTypes()
            // ]).then(()=>{
            //     if ($routeParams.idLesson) {
            //         model.newLesson = null;
            //         loadExistingLesson();
            //     } else if(model.newLesson){
            //         createNewLessonFromPedagogicItem();
            //     }else if ($routeParams.progressionId){
            //         //show the EditProgressionLessonController
            //         loadNewLesson();
            //         return ;
            //     }else{
            //         //new lesson
            //         loadNewLesson();
            //     }
            //
            //     $scope.data.tabSelected = 'lesson';
            //
            //     //add watch on selection
            //     $scope.$watch('lesson.audience',()=>{
            //         if($scope.lesson && $scope.lesson.previousLessons){
            //             $scope.loadPreviousLessonsFromLesson($scope.lesson);
            //         }
            //     });
            //     //add watch on selection
            //     $scope.$watch('lesson.subject',()=>{
            //         if ($scope.lesson && $scope.lesson.previousLessons){
            //             $scope.loadPreviousLessonsFromLesson($scope.lesson);
            //         }
            //     });
            // });

            //progression init
            if ($routeParams.progressionId) {
                $scope.data.tabSelected = 'lesson';
                $scope.isProgressionLesson = true;

                if ($routeParams.editProgressionLessonId !== 'new') {
                    loadLesson($routeParams.editProgressionLessonId);
                }
            }
            //end progression init
        }

        async function loadHomeworkTypes(){
            console.log('load  Homework types');
            if (!model.homeworkTypes || !model.homeworkTypes.all || model.homeworkTypes.all.length === 0){
                try {
                    await model.homeworkTypes.syncHomeworkTypes();
                } catch  (e) {
                    $rootScope.validationError(e);
                }
            }
            return;
        }

        async function loadSubjects(){
            if (!model.subjects || !model.subjects.all || model.subjects.all.length === 0) {
                const subjects = await SubjectService.getCustomSubjects(model.isUserTeacher());
                model.subjects.all = [];
                if (subjects) {
                    model.subjects.addRange(subjects);
                }
            } else {
                return false;
            }
            // if (!model.subjects || !model.subjects.all || model.subjects.all.length === 0){
            //     return SubjectService.getCustomSubjects(model.isUserTeacher()).then((subjects)=>{
            //         model.subjects.all=[];
            //         if(subjects){
            //             model.subjects.addRange(subjects);
            //         }
            //     });
            // }else{
            //     return $q.when();
            // }
        }

        function createNewLessonFromPedagogicItem (){
            $scope.lesson = model.newLesson;
            model.newLesson=null;
            //$scope.newItem = $scope.lesson.newItem;
            populateExistingLesson();
        }

        function populateExistingLesson(){
            $scope.tabs.createLesson = $routeParams.idHomework ? 'homeworks' : 'lesson';

            $scope.tabs.showAnnotations = !!$scope.lesson.annotations;
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
            var lesson = new Lesson();
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

        /** Progression Part **/
        function loadLesson(lessonId) {
            ProgressionService.getLessonProgression(lessonId).then((lesson) => {

                $scope.$parent.editLessonCtrl.lesson = lesson;
            });
        }

        function cancel() {
            $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
        };

        function saveLesson(lesson) {
            if (!lesson.progressionId) {
                lesson.progressionId = $routeParams.progressionId;
            }
            ProgressionService.saveLessonProgression(lesson).then((newLesson) => {
                notify.info(lang.translate('progression.content.saved'));
                lesson.id = newLesson.id;
                $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
            });
        };

        function addHomework(lesson) {
            if (!lesson.homeworks) {
                lesson.homeworks = [];
            }
            let homework = model.initHomework();
            lesson.homeworks.push(homework);
        };

        /** End Progression Part **/


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
                    },
                    function(e) {
                        $rootScope.validationError(e);
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
        var createOrUpdateLesson = function(goMainView?, cb?) {

            $scope.currentErrors = [];

            $scope.lesson.startTime = $scope.newItem.begFinning;
            $scope.lesson.endTime = $scope.newItem.end;
            $scope.lesson.date = $scope.newItem.date;

            return $scope.lesson.save(function() {
                notify.info('lesson.saved');
                $scope.lesson.audience = model.audiences.findWhere({
                    id: $scope.lesson.audience.id
                });
                if (goMainView) {
                    $scope.lesson = null;
                    $scope.homework = null;
                }
                if (typeof cb === 'function') {
                    cb();
                }
            }).catch(function(e) {
                vm.errorValid = true;
                throw e;
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
            //const DATE_FORMAT = "dd/MM/yyyy";
            let params:any = {
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
                        /*if (typeof cb === 'function') {
                            cb();
                        }*/
                    });

                } else {
                    lesson.previousLessons = [];
                    lesson.previousLessonsLoaded = true;
                    lesson.previousLessonsLoading = false;
                    /* if (typeof cb === 'function') {
                         cb();
                     }*/
                }

            });
        };

        $scope.createAndPublishLesson = function (lesson, isPublish, goMainView) {
            return createOrUpdateLesson().then(() =>{
                return $scope.publishLesson(lesson, isPublish).then(()=>{
                    $rootScope.back();
                });
            });
        };

        $scope.createOrUpdateLesson = function(){
            return createOrUpdateLesson().then(() =>{
                $rootScope.back();
            });
        };
    }]);
