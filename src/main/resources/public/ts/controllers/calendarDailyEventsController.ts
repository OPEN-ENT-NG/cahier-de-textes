import { ng, template, notify, moment, _, Behaviours, model, angular } from 'entcore';

export let calendarDailyEventsController = ng.controller('CalendarDailyEventsController',
    ['$scope', 'route', '$location', '$timeout', async function ($scope, route, $location, $timeout) {

        init();

        function init() {
            handlers();
        }

        /*
        * bind events behaviours
        */
        function handlers() {
            //watch calendar recreation
            $scope.$watch(function () {
                return model.calendar;
            }, function () {
                $scope.calendar = model.calendar;
                placeCalendarAndHomeworksPanel();
            });

            //watch toggle options
            $scope.$watch(function () {
                return "" + $scope.bShowCalendar + $scope.bShowHomeworks + $scope.bShowHomeworksMinified;
            }, function () {
                placeCalendarAndHomeworksPanel();
            });
        }

        /**
         * Open homeworks details when homeworks info is minimized
         * or vice versa
         * @param day
         * @param $event
         */
        $scope.toggleOpenDailyEvents = function (day, $event) {
            if (!($event.target && $event.target.type === "checkbox")) {
                day.openDailyEvents = !day.openDailyEvents;
            }
        };

        /**
         * Redirect to homework or lesson view if homework attached to some lesson
         * @param homework Homework being clicked/selected
         * @param $event
         */
        $scope.editSelectedHomework = function (homework, $event) {
            // prevent redirect on clicking on checkbox
            if (!($event.target && $event.target.type === "checkbox")) {
                if (!homework.lesson_id) {
                    //window.location = '/diary#/editHomeworkView/' + homework.id;
                } else {
                    //window.location = '/diary#/editLessonView/' + homework.lesson_id + '/' + homework.id;
                }
            }
        };

        /**
         * Toggle show display homework panel detail of a day
         * Note: jquery oldschool way since with angular could not fix some display problems
         * @param day
         */
        $scope.toggleShowHwDetail = function (day) {
            hideOrShowHwDetail(day, undefined, true);
        };

        /**
         *
         * @param day
         * @param hideHomeworks
         * @param unselectHomeworksOnHide
         */
        var hideOrShowHwDetail = function hideOrShowHwDetail(day, hideHomeworks, unselectHomeworksOnHide) {
            if (!day.dailyEvents) {
                return;
            }
            var hwDayDetail = $('#hw-detail-' + day.index);

            var isNotHidden = hwDayDetail.hasClass('show');

            if (typeof hideHomeworks === 'undefined') {
                hideHomeworks = isNotHidden;
            }

            if (hideHomeworks) {
                hwDayDetail.removeClass('show');
            } else {
                hwDayDetail.addClass('show');
            }

            if (hideHomeworks && unselectHomeworksOnHide) {
                day.dailyEvents.forEach(function (dailyEvent) {
                    dailyEvent.selected = false;
                });
            }
        };

        /**
         * Get the maximum number of homeworks of a day for current week
         */
        var getMaxHomeworksPerDay = function getMaxHomeworksPerDay() {
            var max = 0;

            $scope.calendar.days.all.forEach(function (day) {
                if (day.dailyEvents && day.dailyEvents.length > max) {
                    max = day.dailyEvents.length;
                }
            });

            return max;
        };

        //$scope.show = model.show;

        /**
         * Minify the homework panel or not
         * If it's minified, will only show one max homework
         * else 3
         */
        $scope.toggleHomeworkPanelMinized = function () {
            placeCalendarAndHomeworksPanel();
        };

        /**
         *
         * @param day
         * @returns {Number|boolean}
         */
        $scope.showNotAllHomeworks = function (day) {
            return day.dailyEvents && day.dailyEvents.length && !$scope.showAllHomeworks(day);
        };

        /**
         *
         * @param day Current day
         * @returns {boolean} true if all homeworks of current day
         * should be displayed in homework panel
         */
        $scope.showAllHomeworks = function (day) {

            if (!day.dailyEvents || day.dailyEvents && day.dailyEvents.length == 0) {
                return false;
            }

            // calendar hidden and homework panel maximized -> show all
            if (!$scope.bShowHomeworksMinified) {
                return !$scope.bShowCalendar || day.dailyEvents.length <= 1;
            } else {
                return day.dailyEvents.length == 1;
            }
        };

        /**
         * Return the homework panel height that should be set
         * depending on calendar grid displayed state and homework panel minimized state
         * @param bShowCalendar True if calendar grid is visible
         * @param bShowHomeworks True if homeworks panel is visible
         * @returns {number} Homework panel height
         */
        var getHomeworkPanelHeight = function getHomeworkPanelHeight(bShowCalendar, bShowHomeworks) {

            /**
             * Height of a single homework in homework panel
             * @type {number}
             */
            var HW_HEIGHT = 40;
            var homeworksPerDayDisplayed = 0;

            if (!bShowHomeworks) {
                return 0;
            }

            if (!bShowCalendar) {
                homeworksPerDayDisplayed = getMaxHomeworksPerDay();
            } else {
                homeworksPerDayDisplayed = 1;
            }

            // max homeworks per day displayed used for drag and drop directive
            // to detect dropped day of the week area
            model.homeworksPerDayDisplayed = homeworksPerDayDisplayed;

            return homeworksPerDayDisplayed * HW_HEIGHT;
        };

        /**
         * Display homeworks and lessons and set open state of homework panel
         * and calendar grid
         */
        function placeCalendarAndHomeworksPanel() {

            var bShowCalendar = $scope.bShowCalendar;
            var bShowHomeworks = $scope.bShowHomeworks;
            var bShowHomeworksMinified = $scope.bShowHomeworksMinified;

            let i = 0;
            if(i == 0) return;
            /**
             * Calendar height
             * @type {number}
             */

            //return;
            /*var CAL_HEIGHT = 775;

            var newHwPanelHeight = getHomeworkPanelHeight(bShowCalendar, bShowHomeworks);

            // reduce height of homework panel if requested

            var prevTimeslotsBar = $('.previous-timeslots');
            var nextTimeslotsBar = $('.next-timeslots');

            // hours legend at left
            var hoursBar = $('.timeslots');
            var calItems = $('calendar .schedule-item-content');
            var calGrid = $('.schedule .days');

            // show/hide calendar items
            hoursBar.css('display', bShowCalendar ? 'inherit' : 'none');
            calItems.css('display', bShowCalendar ? 'inherit' : 'none');

            // do not hide previous timeslots bar
            // or else would make so hole/gap
            if (bShowCalendar) {
                prevTimeslotsBar.removeAttr('disabled');
            } else {
                prevTimeslotsBar.attr('disabled', 'disabled');
            }

            nextTimeslotsBar.css('display', bShowCalendar ? 'inherit' : 'none');

            calGrid.height(bShowCalendar ? newHwPanelHeight + CAL_HEIGHT : 0);

            hoursBar.css('margin-top', newHwPanelHeight);
            $('legend.timeslots').css('margin-top', '');
            $('legend.timeslots').css('top', newHwPanelHeight + "px");
            nextTimeslotsBar.css('top', CAL_HEIGHT + newHwPanelHeight);

            $('.schedule-item').css('margin-top', bShowCalendar ? newHwPanelHeight : 0);
            calGrid.height(CAL_HEIGHT + (bShowCalendar ? newHwPanelHeight : 0));

            // set homework panel size with max number of homeworks

            //$('.homeworkpanel').css('height', newHwPanelHeight +"px");
            $('.homeworkpanel').css('display', bShowHomeworks ? 'inherit' : 'none');

            // toggle buttons
            $('.show-homeworks').css('opacity', bShowHomeworks ? 1 : 0.3);
            $('.show-calendar-grid').css('opacity', bShowCalendar ? 1 : 0.3);

            $('#minimize_hw_span').css('display', newHwPanelHeight > 0 ? 'inherit' : 'none');

            if (!bShowCalendar) {
                model.calendar.days.all.forEach(function (day) {
                    hideOrShowHwDetail(day, true, true);
                });
            }*/
        }

        function setDaysContent() {
            model.calendar.days.forEach(function (day) {
                day.dailyEvents = [];
            });

            if(!!$scope.ngModel){
                $scope.ngModel.forEach(function (item) {
                    var refDay = moment(model.calendar.firstDay).day(1);
                    model.calendar.days.forEach(function (day) {

                        if (item.dueDate && moment(item.dueDate).format('YYYY-MM-DD') === refDay.format('YYYY-MM-DD')) {
                            day.dailyEvents.push(item);
                        }

                        refDay.add(1, 'day');
                    });
                });
            }

            $scope.calendar = model.calendar;

            var timeslots = $('.timeslots');

            if (timeslots.length === 8) {
                placeCalendarAndHomeworksPanel();
            }
            // if days timeslots are not yet positioned
            // wait until they are to create the homework panel
            else {
                var timerOccurences = 0;
                var timer = setInterval(function () {
                    timeslots = $('.timeslots');
                    if (timeslots.length === 8) {
                        clearInterval(timer);
                        placeCalendarAndHomeworksPanel();
                    }
                    timerOccurences++;
                    // 5s should be far than enough to have all timeslots loaded
                    if (timerOccurences > 50) {
                        clearInterval(timer);
                    }
                }, 100);
            }
        }

        model.on('calendar.date-change', function () {
            setDaysContent();
            $scope.safeApply();
        });

        $scope.$watchCollection('ngModel', function (newVal) {
            setDaysContent();
        });

        $scope.$watch(() => $scope.calendar.timeSlots.all[0].beginning,  (newVal, oldVal) => {
            setDaysContent();
            $scope.safeApply();
        });


        $scope.safeApply = (): Promise<any> => {
            return new Promise((resolve, reject) => {
                let phase = $scope.$root.$$phase;
                if (phase === '$apply' || phase === '$digest') {
                    if (resolve && (typeof(resolve) === 'function')) {
                        resolve();
                    }
                } else {
                    if (resolve && (typeof(resolve) === 'function')) {
                        $scope.$apply(resolve);
                    } else {
                        $scope.$apply()();
                    }
                }
            });
        };
    }]);