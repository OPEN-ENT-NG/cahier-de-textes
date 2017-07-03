(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("QuickSearchController", controller);

        function controller($scope,$rootScope, PedagogicItemService) {
            var vm = this;

            let id = Date.now();
            /**
             * Number of items displayed by default
             * @type {number}
             */
            var defaultMaxPedagogicItemsDisplayed = 6;

            $scope.maxPedagogicItemsDisplayed = defaultMaxPedagogicItemsDisplayed;

            /**
             * Max pedagofic items step increament
             * @type {number}
             */
            var pedagogicDaysDisplayedStep = defaultMaxPedagogicItemsDisplayed;

            /**
             * If true the search if detailled panel is minified else not
             * (by default minified/not visible)
             * @type {boolean}
             */
            $scope.panelVisible = false;

            /**
             * Pedagogic items search results
             * @type {Array}
             */
            $scope.pedagogicItems = [];

            /**
             * Last pressed key time
             * Prevent searching
             */
            $scope.lastPressedKeyTime;

            /**
             * Pedagogic items of the day displayed.
             * Max
             */
            $scope.quickSearchPedagogicDaysDisplayed = [];

            /**
             * Default search time = end of current week
             */
            $scope.endDate = moment().endOf('week');

            /**
             * Text for searching through label, title, ...
             * @type {string}
             */
            $scope.multiSearch = "";

            var timeout;

            /**
             * Flag indicating it's first search (used for not displaying the 'show more' arrow
             * @type {boolean}
             */
            $scope.isFirstSearch = true;

            var pedagogicItemDisplayedIdxStart = 0;
            var pedagogicItemDisplayedIdxEnd = defaultMaxPedagogicItemsDisplayed - 1; // array index starts at 0
            var isQuickSearchLesson = ($scope.itemType === 'lesson') ? true : false;

            initQuickSearch();
            /*
             * initialisation
             */
            function initQuickSearch() {

                $scope.endDate = moment().endOf('week');
                $scope.quickSearchPedagogicDays = [];
                $scope.itemType = isQuickSearchLesson ? 'lesson' : 'homework';
                $scope.panelLabel = isQuickSearchLesson ? lang.translate('diary.lessons') : lang.translate('diary.homeworks');
            }

            $scope.$on('rightpanel.open',function(_,rightpanelid){
                if (id !== rightpanelid && $scope.panelVisible){
                    $scope.setPanelVisible(false,{
                        target : {
                            type : "text"
                        }
                    });
                }
            });

            $scope.setPanelVisible = function(isVisible, $event) {
                if (!$event.target || $event.target.type !== "text") {

                    $scope.panelVisible = isVisible;

                    /**
                     * On first panel maximize search items
                     */
                    if ($scope.isFirstSearch) {
                        $scope.quickSearch(true);
                    }

                    // hide the other panel (panel or homework)
                    if ($scope.itemType == 'lesson') {
                        // tricky way to get the other directive for homeworks
                        if (isQuickSearchLesson) {
                            $scope.$parent.$$childTail.panelVisible = false;
                        }
                    } else if ($scope.itemType == 'homework') {
                        if (!isQuickSearchLesson) {
                            $scope.$parent.$$childHead.panelVisible = false;
                        }
                    }

                    // let enough room to display quick search panel maximized
                    if (isVisible) {
                        $('.mainDiaryContainer').width('84%');
                        $('.quick-search').width('16%');
                        $rootScope.$broadcast('rightpanel.open',id);

                    } else {
                        $('.mainDiaryContainer').width('97%');
                        $('.quick-search').width('2%');
                    }
                }
            };

            /**
             * By default X pedagogic items are displayed.
             * This allows to display more items
             */
            $scope.quickSearchNextPedagogicDays = function() {

                if (!$scope.isNextPedagogicDaysDisplayed) {
                    return;
                }

                pedagogicItemDisplayedIdxStart += pedagogicDaysDisplayedStep;
                pedagogicItemDisplayedIdxEnd += pedagogicDaysDisplayedStep;

                $scope.maxPedagogicItemsDisplayed = Math.max($scope.maxPedagogicItemsDisplayed, pedagogicItemDisplayedIdxEnd);

                $scope.quickSearch(false);
            };

            /**
             *
             */
            $scope.quickSearchPreviousPedagogicDays = function() {

                if (!$scope.isPreviousPedagogicDaysDisplayed) {
                    return;
                }

                pedagogicItemDisplayedIdxStart -= pedagogicDaysDisplayedStep;
                pedagogicItemDisplayedIdxStart = Math.max(0, pedagogicItemDisplayedIdxStart);
                pedagogicItemDisplayedIdxEnd -= pedagogicDaysDisplayedStep;

                $scope.quickSearch(false);
            };

            /**
             *  If true will display the orange arrow to display more items
             *  else not.
             * @type {boolean}
             */
            $scope.isNextPedagogicDaysDisplayed = false;

            /**
             * Displays "no results" if true else blank
             * @type {boolean}
             */
            $scope.displayNoResultsText = false;

            /**
             * Compute if the button for recent items should be displayed
             * @returns {boolean}
             */
            var isPreviousPedagogicDaysDisplayed = function() {
                return !$scope.isFirstSearch && 0 < pedagogicItemDisplayedIdxStart && $scope.quickSearchPedagogicDaysDisplayed.length > 0;
            };

            /**
             * Returns true if the "next" arrow button should be displayed meaning
             * there are other items
             * @returns {boolean}
             */
            var isNextPedagogicDaysDisplayed = function(pedagogicItemCount) {
                return !$scope.isFirstSearch &&
                    pedagogicItemDisplayedIdxStart <= pedagogicItemCount &&
                    $scope.quickSearchPedagogicDaysDisplayed.length > 0 &&
                    $scope.quickSearchPedagogicDaysDisplayed.length >= pedagogicDaysDisplayedStep;
            };


            var performQuickSearch = function() {

                clearTimeout(timeout); // this way will not run infinitely

                var params = new SearchForm(true);
                params.initForTeacher();
                params.isQuickSearch = true;
                params.limit = $scope.maxPedagogicItemsDisplayed + 1; // +1 thingy will help to know if extra items can be displayed
                var period = moment(model.calendar.dayForWeek).day(1);
                period.add(-60, 'days').format('YYYY-MM-DD');
                params.startDate = period.format('YYYY-MM-DD');
                params.endDate = moment($scope.endDate).add(1, 'days');
                params.sortOrder = "DESC";

                if ($scope.itemType == 'lesson') {
                    params.multiSearchLesson = $scope.multiSearch.trim();
                } else {
                    params.multiSearchHomework = $scope.multiSearch.trim();
                }

                params.returnType = $scope.itemType;

                model.pedagogicDaysQuickSearch = [];
                $scope.quickSearchPedagogicDaysDisplayed.length = 0;


                $scope.performPedagogicItemSearch(params,model.isUserTeacher());

            };

            /*
             * search pedagogic item
             */
            $scope.performPedagogicItemSearch = function(params, isTeacher) {
                // global quick search panel
                if (params.isQuickSearch) {
                    if (params.returnType === 'lesson') {
                        model.pedagogicDaysQuickSearchLesson = [];
                    } else {
                        model.pedagogicDaysQuickSearchHomework = [];
                    }
                }
                // 'classical' view list
                else {
                    model.pedagogicDays.reset();
                }

                // get pedagogicItems
                return PedagogicItemService.getPedagogicItems(params).then((pedagogicItems) => {
                    var days = _.groupBy(pedagogicItems, 'day');
                    var pedagogicDays = [];
                    var aDayIsSelected = false;

                    for (var day in days) {
                        if (days.hasOwnProperty(day)) {
                            var pedagogicDay = new PedagogicDay();
                            pedagogicDay.selected = false;
                            //TODO is constants
                            pedagogicDay.dayName = moment(day).format("dddd DD MMMM YYYY");
                            pedagogicDay.shortName = pedagogicDay.dayName.substring(0, 2);
                            //TODO is constants
                            pedagogicDay.shortDate = moment(day).format("DD/MM");
                            pedagogicDay.pedagogicItemsOfTheDay = days[day];

                            var countItems = _.groupBy(pedagogicDay.pedagogicItemsOfTheDay, 'type_item');

                            pedagogicDay.nbLessons = countItems.lesson ? countItems.lesson.length : 0;
                            pedagogicDay.nbHomeworks = countItems.homework ? countItems.homework.length : 0;

                            //select default day
                            if (isTeacher) {
                                if (!aDayIsSelected) {
                                    pedagogicDay.selected = true;
                                    aDayIsSelected = true;
                                }
                            } else {
                                if (pedagogicDay.nbHomeworks > 0 && !aDayIsSelected) {
                                    pedagogicDay.selected = true;
                                    aDayIsSelected = true;
                                }
                            }
                            pedagogicDays.push(pedagogicDay);
                        }
                    }

                    if (pedagogicDays[0] && !aDayIsSelected) {
                        pedagogicDays[0].selected = true;
                    }

                    // global quick search panel
                    if (params.isQuickSearch) {
                        if (params.returnType === 'lesson') {
                            model.pedagogicDaysQuickSearchLesson = model.pedagogicDaysQuickSearchLesson.concat(pedagogicDays);
                        } else {
                            model.pedagogicDaysQuickSearchHomework = model.pedagogicDaysQuickSearchHomework.concat(pedagogicDays);
                        }
                    } else {
                        model.pedagogicDays.pushAll(pedagogicDays);
                    }

                    model.initSubjects();

                    $scope.isFirstSearch = false;
                    $scope.quickSearchPedagogicDays = isQuickSearchLesson ? model.pedagogicDaysQuickSearchLesson : model.pedagogicDaysQuickSearchHomework;
                    $scope.displayNoResultsText = ($scope.quickSearchPedagogicDays.length === 0);

                    var idxSearchPedagogicItem = 0;
                    $scope.quickSearchPedagogicDaysDisplayed = [];

                    // count number of displayed items
                    $scope.quickSearchPedagogicDays.forEach(function(pedagogicDay) {

                        pedagogicDay.pedagogicItemsOfTheDay.forEach(function(pedagogicItemOfTheDay) {
                            if ((pedagogicItemDisplayedIdxStart <= idxSearchPedagogicItem) && (idxSearchPedagogicItem <= pedagogicItemDisplayedIdxEnd)) {
                                $scope.quickSearchPedagogicDaysDisplayed.push(pedagogicItemOfTheDay);
                            }
                            idxSearchPedagogicItem++;
                        });
                    });

                    // enable/disable next/previous items arrow buttons
                    $scope.isPreviousPedagogicDaysDisplayed = isPreviousPedagogicDaysDisplayed();
                    $scope.isNextPedagogicDaysDisplayed = isNextPedagogicDaysDisplayed(idxSearchPedagogicItem);

                });

            };

            $scope.quickSearch = function(resetMaxDisplayedItems) {

                if (resetMaxDisplayedItems) {
                    $scope.maxPedagogicItemsDisplayed = defaultMaxPedagogicItemsDisplayed;
                    pedagogicItemDisplayedIdxStart = 0;
                    pedagogicItemDisplayedIdxEnd = defaultMaxPedagogicItemsDisplayed - 1;
                }

                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }

                // start searching after 0.4s (prevent spamming request to backend)
                timeout = setTimeout(performQuickSearch, 400);
            };


            var handleCalendarHomeworksDrop = function() {

                var timeslots = $('.homeworkpanel');

                var homeworkSlotsPerDay = model.homeworksPerDayDisplayed; // 1;//timeslots.length / 7;

                timeslots.each(function(index) {

                    var timeslot = $(this);

                    // allow drag
                    timeslot.on('dragover', function(event) {
                        event.preventDefault();
                    });

                    timeslot.on('dragenter', function($event) {
                        // FIXME red color not visible because overidden by grey color !important
                        timeslot.css('border', 'blue 2px dashed');
                        timeslot.css('border-radius', '3px');
                        //timeslot.css('background-color', 'red');
                    });

                    timeslot.on('dragleave', function(event) {
                        //timeslot.css('css', 'color: blue !important');
                        timeslot.css('border', '');
                        timeslot.css('border-radius', '');
                    });

                    timeslot.on('drop', function($event) {
                        $event.preventDefault();
                        timeslot.css('background-color', '');

                        // duplicate dragged lesson
                        var pedagogicItemOfTheDay = JSON.parse($event.originalEvent.dataTransfer.getData("application/json"));

                        // do not drop if item type is not a lesson
                        if (pedagogicItemOfTheDay.type_item !== 'homework') {
                            return;
                        }

                        var newHomework = new Homework();
                        newHomework.id = pedagogicItemOfTheDay.id;

                        var newHomeworkDayOfWeek = Math.floor(index / homeworkSlotsPerDay) + 1;

                        newHomework.load(function() {
                            // will force new lesson to be created in DB
                            newHomework.id = null;
                            newHomework.lesson_id = null;
                            newHomework.state = "draft"

                            // startTime and end format from db is "HH:MM:SS" as text type for lesson save startTime need to be moment time type with date
                            newHomework.dueDate = moment(newHomework.dueDate);
                            newHomework.startTime = moment(newHomework.date.format('YYYY-MM-DD') + ' ' + newHomework.startTime);
                            newHomework.startTime.day(newHomeworkDayOfWeek);

                            // TODO refactor endTime = startTime + 1h
                            newHomework.endTime = moment(newHomework.date.format('YYYY-MM-DD') + ' ' + newHomework.endTime);
                            newHomework.endTime.day(newHomeworkDayOfWeek);
                            newHomework.endTime.week(model.calendar.week);

                            newHomework.dueDate.day(newHomeworkDayOfWeek);
                            newHomework.dueDate.week(model.calendar.week);


                            newHomework.save(function(data) {
                                // remove homework from model so will force reload
                                // needed because homework.dueDate need a specific format !
                                var homework = model.homeworks.findWhere({
                                    id: parseInt(newHomework.id)
                                });
                                model.homeworks.remove(homework);
                                window.location = '/diary#/editHomeworkView/' + newHomework.id;
                            }, function(error) {
                                console.error(error);
                            });
                        }, function(error) {
                            console.error(error);
                        });
                    });
                });
            };

            // wait until calendar loaded
            if (!model.homeworksDropHandled) {
                setTimeout(handleCalendarHomeworksDrop, 2000);
                model.homeworksDropHandled = true;
            }


        }
    });


})();
