(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("CalendarController", controller);

        function controller($scope, $timeout, CourseService, $routeParams, constants, $location, HomeworkService, UtilsService, LessonService, $q, SubjectService,ModelWeekService, SecureService) {

            var vm = this;

            $timeout(init);
            /*
             * initialisation calendar function
             */
            function init() {
                //view controls
                $scope.display.showList = false;
                //calendarDailyEvent directive options
                $scope.display.bShowCalendar = true;
                $scope.display.bShowHomeworks = true;
                $scope.display.bShowHomeworksMinified = false;
                //$scope.showCal = false;
                //calendar Params
                $scope.calendarParams = {
                    isUserTeacher: $scope.isUserTeacher
                };

                //handler calendar updates :
                $scope.$on('calendar.refreshItems', (_, item) => {
                    item.calendarUpdate();
                });
            }

            //watch delete or add
            $scope.$watch(()=>{
                if (model && model.lessons && model.lessons.all){
                    return model.lessons.all.length;
                }else{
                    return 0;
                }
            }, () =>{
                $scope.itemsCalendar = [].concat(model.lessons.all).concat($scope.courses);
            });

            $scope.$watch('routeParams', function(n, o) {

                var mondayOfWeek = moment();
                // mondayOfWeek as string date formatted YYYY-MM-DD
                if ($scope.routeParams.mondayOfWeek) {
                    mondayOfWeek = moment($scope.routeParams.mondayOfWeek);
                } else {
                    if (model.mondayOfWeek){
                        mondayOfWeek = model.mondayOfWeek;
                    }else{
                        mondayOfWeek = mondayOfWeek.weekday(0);
                    }
                }
                model.mondayOfWeek = mondayOfWeek;
                $scope.showCalendar(mondayOfWeek);

            }, true);

            $scope.routeParams = $routeParams;

            /**
             * Opens the next week view of calendar
             */
            $scope.nextWeek = function() {
                var nextMonday = moment($scope.mondayOfWeek).add(7, 'd');
                $location.path('/calendarView/' + nextMonday.format(constants.CAL_DATE_PATTERN));
            };

            /**
             * Opens the previous week view of calendar
             */
            $scope.previousWeek = function() {
                var nextMonday = moment($scope.mondayOfWeek).add(-7, 'd');
                $location.path('/calendarView/' + nextMonday.format(constants.CAL_DATE_PATTERN));
            };


            var validationError = function(e) {

                if (typeof e !== 'undefined') {
                    console.error(e);
                    notify.error(e.error);
                    $scope.currentErrors.push(e);
                    $scope.$apply();
                }
            };

            /**
             * Load related data to lessons and homeworks from database
             * @param cb Callback function
             * @param bShowTemplates if true loads calendar templates after data loaded
             * might be used when
             */
            var initialization = function(bShowTemplates, cb) {

                // will force quick search panel to load (e.g: when returning to calendar view)
                // see ng-extensions.js -> quickSearch directive
                model.lessonsDropHandled = false;
                model.homeworksDropHandled = false;

                $scope.countdown = 2;

                // auto creates diary.teacher
                if ("ENSEIGNANT" === model.me.type) {
                    var teacher = new Teacher();
                    teacher.create(decrementCountdown(bShowTemplates, cb), validationError);
                } else {
                    decrementCountdown(bShowTemplates, cb);
                }

                // subjects and audiences needed to fill in
                // homeworks and lessons props

                model.childs.syncChildren(function() {
                    $scope.child = model.child;
                    $scope.children = model.childs;
                    SubjectService.getCustomSubjects(model.isUserTeacher()).then((subjects)=>{
                        model.subjects.all=[];
                        if(subjects){
                          model.subjects.addRange(subjects);
                        }
                    }).then(()=>{
                        //model.audiences.syncAudiences(function() {
                            decrementCountdown(bShowTemplates, cb);
                            model.homeworkTypes.syncHomeworkTypes(function() {
                                // call lessons/homework sync after audiences sync since
                                // lesson and homework objects needs audience data to be built
                                refreshDatas(UtilsService.getUserStructuresIdsAsString(),
                                    $scope.mondayOfWeek,
                                    model.isUserParent,
                                    model.child ? model.child.id : undefined);

                            }, validationError);
                        //}, validationError);
                        }, validationError);
                    });
            };


            var decrementCountdown = function(bShowTemplates, cb) {
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

            /**
             *
             * @param momentMondayOfWeek First day (monday) of week to display lessons and homeworks
             */
            $scope.showCalendar = function(mondayOfWeek) {
                $scope.display.showList = false;

                $scope.mondayOfWeek = mondayOfWeek;
                if (!$scope.calendarLoaded) {
                    initialization(true);
                    return;
                }

                if (!$scope.mondayOfWeek) {
                    $scope.mondayOfWeek = moment();
                }

                $scope.mondayOfWeek = $scope.mondayOfWeek.weekday(0);

                model.lessonsDropHandled = false;
                model.homeworksDropHandled = false;
                $scope.display.showList = false;

                // need reload lessons or homeworks if week changed
                var syncItems = true; //momentMondayOfWeek.week() != model.calendar.week;

                $scope.lesson = null;
                $scope.homework = null;


                refreshDatas(UtilsService.getUserStructuresIdsAsString(),
                    $scope.mondayOfWeek,
                    model.isUserParent,
                    model.child ? model.child.id : undefined);
            };



            function refreshDatas(structureIds, mondayOfWeek, isUserParent, childId) {

                var p1 = LessonService.getLessons(structureIds, mondayOfWeek, isUserParent, childId);
                var p2 = HomeworkService.getHomeworks(structureIds, mondayOfWeek, isUserParent, childId);

                //dont load courses if is not at teacher
                var p3 = $q.when([]);
                var p4 = $q.when([]);
                if (model.isUserTeacher()){
                    //TODO use structureIds
                    p3 = CourseService.getMergeCourses(model.me.structures[0], model.me.userId, mondayOfWeek);
                    if (SecureService.hasRight(constants.RIGHTS.MANAGE_MODEL_WEEK)){
                        p4 = ModelWeekService.getModelWeeks();
                    }
                }

                return $q.all([p1, p2, p3,p4]).then(results => {
                    let lessons = results[0];
                    let homeworks = results[1];
                    $scope.courses = results[2];
                    $scope.modelWeeks = results[3];

                    let p;
                    if (!$scope.courses || $scope.courses.length === 0){
                        p = ModelWeekService.getCoursesModel($scope.mondayOfWeek).then((modelCourses)=>{
                            $scope.courses = modelCourses;
                        });
                    }else{
                        p = $q.when();
                    }

                    p.then(()=>{
                        model.lessons.all.splice(0, model.lessons.all.length);
                        model.lessons.addRange(lessons);
                        model.homeworks.all.splice(0, model.homeworks.all.length);
                        model.homeworks.addRange(homeworks);
                        $scope.itemsCalendar = [].concat(model.lessons.all).concat($scope.courses);
                    });
                });
            }


            $scope.setChildFilter = function(child, cb){

                $scope.children.forEach(function(theChild){
                    theChild.selected = (theChild.id === child.id);
                });

                child.selected = true;
                $scope.child = child;
                model.child = child;

                 refreshDatas(UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, true, child.id);
            };

            $scope.showCalendarForChild = function (child) {
                $scope.setChildFilter(child);
            };


            var showTemplates = function() {
                template.open('main', 'main');
                template.open('main-view', 'calendar');
                template.open('create-lesson', 'create-lesson');
                template.open('create-homework', 'create-homework');
                template.open('daily-event-details', 'daily-event-details');
                template.open('daily-event-item', 'daily-event-item');
            };

            /**
             * Display or hide the homework panel
             * in calendar view
             */
            $scope.toggleHomeworkPanel = function () {
                $scope.display.bShowHomeworks = !$scope.display.bShowHomeworks;

                if (  !$scope.display.bShowHomeworks && !$scope.display.bShowCalendar){
                  $scope.display.bShowCalendar =true;
                }
            };

            /**
             * Display/hide calendar
             */
            $scope.toggleCalendar = function () {
                $scope.display.bShowCalendar = !$scope.display.bShowCalendar;
                if (  !$scope.display.bShowHomeworks && !$scope.display.bShowCalendar){
                  $scope.display.bShowHomeworks =true;
                }
            };

            $scope.setModel = function(alias) {
                ModelWeekService.setModelWeek(alias,$scope.mondayOfWeek).then((modelWeek)=>{
                    refreshDatas(UtilsService.getUserStructuresIdsAsString(),
                        $scope.mondayOfWeek,
                        model.isUserParent,
                        model.child ? model.child.id : undefined);
                });

                notify.info(lang.translate('diary.model.week.choice.effective') + " " + alias);
            };

            $scope.invert = function() {
                ModelWeekService.invertModelsWeek().then(()=>{
                    refreshDatas(UtilsService.getUserStructuresIdsAsString(),
                        $scope.mondayOfWeek,
                        model.isUserParent,
                        model.child ? model.child.id : undefined).then(()=>{
                            notify.info('diary.model.week.invert.effective');
                        });
                });
            };

        }
    });


})();
