(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
    /**
         * Directive to perform a quick search among lessons and homeworks
         */
        module.directive('quickSearch', function () {
            return {
                restrict: "E",
                templateUrl: "/diary/public/js/directives/quick-search/quick-search.html",
                scope: {
                    ngModel: '=',
                    /**
                     * Item type 'lesson' or 'homework'
                     */
                    itemType: "="
                },
                link: function (scope, element, attrs, location) {

                    /**
                     * Number of items displayed by default
                     * @type {number}
                     */
                    var defaultMaxPedagogicItemsDisplayed = 6;

                    scope.maxPedagogicItemsDisplayed = defaultMaxPedagogicItemsDisplayed;

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
                    scope.panelVisible = false;

                    /**
                     * Pedagogic items search results
                     * @type {Array}
                     */
                    scope.pedagogicItems = [];

                    /**
                     * Last pressed key time
                     * Prevent searching
                     */
                    scope.lastPressedKeyTime;

                    /**
                     * Pedagogic items of the day displayed.
                     * Max
                     */
                    scope.quickSearchPedagogicDaysDisplayed = new Array();

                    /**
                     * Default search time = end of current week
                     */
                    scope.endDate = moment().endOf('week');

                    /**
                     * Text for searching through label, title, ...
                     * @type {string}
                     */
                    scope.multiSearch = "";


                    var timeout;

                    /**
                     * Flag indicating it's first search (used for not displaying the 'show more' arrow
                     * @type {boolean}
                     */
                    scope.isFirstSearch = true;

                    var pedagogicItemDisplayedIdxStart = 0;
                    var pedagogicItemDisplayedIdxEnd = defaultMaxPedagogicItemsDisplayed - 1; // array index starts at 0


                    var initQuickSearch = function () {
                        scope.endDate = moment().endOf('week');
                        scope.quickSearchPedagogicDays = new Array();
                    };

                    initQuickSearch();

                    var isQuickSearchLesson = (attrs.itemType === 'lessontype') ? true : false;
                    scope.itemType = isQuickSearchLesson ? 'lesson' : 'homework';
                    scope.panelLabel = isQuickSearchLesson ? lang.translate('diary.lessons') : lang.translate('diary.homeworks');



                    scope.setPanelVisible = function (isVisible, $event) {


                        if (!$event.target || $event.target.type !== "text") {

                            scope.panelVisible = isVisible;

                            /**
                             * On first panel maximize search items
                             */
                            if (scope.isFirstSearch) {
                                scope.quickSearch(true);
                            }

                            // hide the other panel (panel or homework)
                            if (scope.itemType == 'lesson') {
                                // tricky way to get the other directive for homeworks
                                if (isQuickSearchLesson) {
                                    scope.$parent.$$childTail.panelVisible = false;
                                }
                            } else if (scope.itemType == 'homework') {
                                if (!isQuickSearchLesson) {
                                    scope.$parent.$$childHead.panelVisible = false;
                                }
                            }

                            // let enough room to display quick search panel maximized
                            if (isVisible) {
                                $('#mainDiaryContainer').width('84%');
                                $('.quick-search').width('16%');
                            } else {
                                $('#mainDiaryContainer').width('97%');
                                $('.quick-search').width('2%');
                            }
                        }
                    };

                    /**
                     * By default X pedagogic items are displayed.
                     * This allows to display more items
                     */
                    scope.quickSearchNextPedagogicDays = function () {

                        if (!scope.isNextPedagogicDaysDisplayed) {
                            return;
                        }

                        pedagogicItemDisplayedIdxStart += pedagogicDaysDisplayedStep;
                        pedagogicItemDisplayedIdxEnd += pedagogicDaysDisplayedStep;

                        scope.maxPedagogicItemsDisplayed = Math.max(scope.maxPedagogicItemsDisplayed, pedagogicItemDisplayedIdxEnd);

                        scope.quickSearch(false);
                    };

                    /**
                     *
                     */
                    scope.quickSearchPreviousPedagogicDays = function () {

                        if (!scope.isPreviousPedagogicDaysDisplayed) {
                            return;
                        }

                        pedagogicItemDisplayedIdxStart -= pedagogicDaysDisplayedStep;
                        pedagogicItemDisplayedIdxStart = Math.max(0, pedagogicItemDisplayedIdxStart);
                        pedagogicItemDisplayedIdxEnd -= pedagogicDaysDisplayedStep;

                        scope.quickSearch(false);
                    };

                    /**
                     *  If true will display the orange arrow to display more items
                     *  else not.
                     * @type {boolean}
                     */
                    scope.isNextPedagogicDaysDisplayed = false;

                    /**
                     * Displays "no results" if true else blank
                     * @type {boolean}
                     */
                    scope.displayNoResultsText = false;

                    /**
                     * Compute if the button for recent items should be displayed
                     * @returns {boolean}
                     */
                    var isPreviousPedagogicDaysDisplayed = function () {
                        return !scope.isFirstSearch &&  0 < pedagogicItemDisplayedIdxStart && scope.quickSearchPedagogicDaysDisplayed.length > 0;
                    };

                    /**
                     * Returns true if the "next" arrow button should be displayed meaning
                     * there are other items
                     * @returns {boolean}
                     */
                    var isNextPedagogicDaysDisplayed = function (pedagogicItemCount) {
                        return !scope.isFirstSearch
                            &&  pedagogicItemDisplayedIdxStart <= pedagogicItemCount
                            && scope.quickSearchPedagogicDaysDisplayed.length > 0
                            && scope.quickSearchPedagogicDaysDisplayed.length >= pedagogicDaysDisplayedStep;
                    };


                    var performQuickSearch = function() {

                        clearTimeout(timeout); // this way will not run infinitely

                        var params = new SearchForm(true);
                        params.initForTeacher();
                        params.isQuickSearch = true;
                        params.limit = scope.maxPedagogicItemsDisplayed + 1; // +1 thingy will help to know if extra items can be displayed
                        var period = moment(model.calendar.dayForWeek).day(1);
                        period.add(-60, 'days').format('YYYY-MM-DD');
                        params.startDate = period.format('YYYY-MM-DD');
                        params.endDate = moment(scope.endDate).add(1, 'days');
                        params.sortOrder = "DESC";

                        if (scope.itemType == 'lesson') {
                            params.multiSearchLesson = scope.multiSearch.trim();
                        } else {
                            params.multiSearchHomework = scope.multiSearch.trim();
                        }

                        params.returnType = scope.itemType;

                        model.pedagogicDaysQuickSearch = new Array();
                        scope.quickSearchPedagogicDaysDisplayed.length = 0;

                        model.performPedagogicItemSearch(params, model.isUserTeacher(),
                            // callback
                            function () {
                                scope.isFirstSearch = false;
                                scope.quickSearchPedagogicDays = isQuickSearchLesson ? model.pedagogicDaysQuickSearchLesson : model.pedagogicDaysQuickSearchHomework;
                                scope.displayNoResultsText = (scope.quickSearchPedagogicDays.length == 0);

                                var idxSearchPedagogicItem = 0;
                                scope.quickSearchPedagogicDaysDisplayed = new Array();

                                // count number of displayed items
                                scope.quickSearchPedagogicDays.forEach(function (pedagogicDay) {

                                    pedagogicDay.pedagogicItemsOfTheDay.forEach(function (pedagogicItemOfTheDay) {
                                        if ((pedagogicItemDisplayedIdxStart <= idxSearchPedagogicItem) && (idxSearchPedagogicItem <= pedagogicItemDisplayedIdxEnd)) {
                                            scope.quickSearchPedagogicDaysDisplayed.push(pedagogicItemOfTheDay);
                                        }
                                        idxSearchPedagogicItem++;
                                    });
                                });

                                // enable/disable next/previous items arrow buttons
                                scope.isPreviousPedagogicDaysDisplayed = isPreviousPedagogicDaysDisplayed();
                                scope.isNextPedagogicDaysDisplayed = isNextPedagogicDaysDisplayed(idxSearchPedagogicItem);
                                scope.$apply();
                            },
                            // callback on error
                            function (cbe) {
                                console.error('Callback errors');
                                console.log(cbe);
                                notify.error(cbe.message);
                            }
                        );
                    };

                    scope.quickSearch = function (resetMaxDisplayedItems) {

                        if (resetMaxDisplayedItems) {
                            scope.maxPedagogicItemsDisplayed = defaultMaxPedagogicItemsDisplayed;
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

                    var handleCalendarLessonsDrop = function () {

                        var timeslots = $('.days').find('.timeslot');

                        var timeslotsPerDay = timeslots.length / 7;

                        timeslots.each(function (index) {

                            // var timeslot = $(this);
														//
                            // // allow drag
                            // timeslot.on('dragover', function ($event) {
                            //     event.preventDefault();
                            // });
														//
                            // timeslot.on('dragenter', function (event) {
                            //     timeslot.css('border', 'blue 2px dashed');
                            //     timeslot.css('border-radius', '3px');
                            //     //timeslot.css('background-color', 'blue');
                            // });
														//
                            // timeslot.on('dragleave', function (event) {
                            //     //timeslot.css('background-color', '');
                            //     timeslot.css('border', '');
                            //     timeslot.css('border-radius', '');
                            // });
														//
                            // timeslot.on('drop', function ($event) {
                            //     $event.preventDefault();
														//
                            //     timeslot.css('background-color', '');
														//
                            //     // duplicate dragged lesson
                            //     var pedagogicItemOfTheDay = JSON.parse($event.originalEvent.dataTransfer.getData("application/json"));
														//
                            //     // do not drop if item type is not a lesson
                            //     if (pedagogicItemOfTheDay.type_item !== 'lesson') {
                            //         return;
                            //     }
														//
                            //     var newLesson = new Lesson();
                            //     newLesson.id = pedagogicItemOfTheDay.id;
														//
                            //     var newLessonDayOfWeek = Math.floor(index / timeslotsPerDay) + 1;
                            //     var newLessonStartTime = model.startOfDay + (index % timeslotsPerDay);
                            //     var newLessonEndTime = newLessonStartTime + 1;
														//
                            //     newLesson.load(false, function () {
                            //         // will force new lesson to be created in DB
                            //         newLesson.id = null;
														//
                            //         // startTime and end format from db is "HH:MM:SS" as text type
                            //         // for lesson save startTime need to be moment time type with date
                            //         newLesson.date = moment(newLesson.date);
                            //         newLesson.startTime = moment(newLesson.date.format('YYYY-MM-DD') + ' ' + newLesson.startTime);
                            //         newLesson.startTime.hour(newLessonStartTime);
                            //         newLesson.startTime.minute(0);
                            //         newLesson.startTime.day(newLessonDayOfWeek);
														//
                            //         newLesson.endTime = moment(newLesson.date.format('YYYY-MM-DD') + ' ' + newLesson.endTime);
                            //         newLesson.endTime.hour(newLessonEndTime);
                            //         newLesson.endTime.minute(0);
                            //         newLesson.endTime.day(newLessonDayOfWeek);
                            //         newLesson.endTime.week(model.calendar.week);
														//
                            //         newLesson.date.day(newLessonDayOfWeek);
                            //         newLesson.date.week(model.calendar.week);
														//
                            //         newLesson.state = 'draft';
														//
                            //         newLesson.save(function (data) {
                            //             window.location = '/diary#/editLessonView/' + newLesson.id;
                            //         }, function (error) {
                            //             console.error(error);
                            //         });
                            //     }, function (error) {
                            //         console.error(error);
                            //     });
                            // });
                        });
                    };

                    // wait until calendar loaded
                    if (!model.lessonsDropHandled) {
                        setTimeout(handleCalendarLessonsDrop, 2000);
                        model.lessonsDropHandled = true;
                    }

                    var handleCalendarHomeworksDrop = function () {

                        var timeslots = $('.homeworkpanel');

                        var homeworkSlotsPerDay = model.homeworksPerDayDisplayed;// 1;//timeslots.length / 7;

                        timeslots.each(function (index) {

                            var timeslot = $(this);

                            // allow drag
                            timeslot.on('dragover', function (event) {
                                event.preventDefault();
                            });

                            timeslot.on('dragenter', function ($event) {
                                // FIXME red color not visible because overidden by grey color !important
                                timeslot.css('border', 'blue 2px dashed');
                                timeslot.css('border-radius', '3px');
                                //timeslot.css('background-color', 'red');
                            });

                            timeslot.on('dragleave', function (event) {
                                //timeslot.css('css', 'color: blue !important');
                                timeslot.css('border', '');
                                timeslot.css('border-radius', '');
                            });

                            timeslot.on('drop', function ($event) {
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

                                newHomework.load(function () {
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


                                    newHomework.save(function (data) {
                                        // remove homework from model so will force reload
                                        // needed because homework.dueDate need a specific format !
                                        var homework = model.homeworks.findWhere({ id: parseInt(newHomework.id)});
                                        model.homeworks.remove(homework);
                                        window.location = '/diary#/editHomeworkView/' + newHomework.id;
                                    }, function (error) {
                                        console.error(error);
                                    });
                                }, function (error) {
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
            }
        });

	});

})();
