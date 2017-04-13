(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("CalendarDailyEventsController", controller);

        function controller($scope) {

            $scope.$watch(()=>{
                return model.calendar;
            },()=>{
                console.log("model calendar updated");
                $scope.calendar = model.calendar;
                //setDaysContent();
            });
            //$scope.calendar = model.calendar;
            $scope.isUserTeacher = model.isUserTeacher();

            /**
             * Open homeworks details when homeworks info is minimized
             * or vice versa
             * @param day
             * @param $event
             */
            $scope.toggleOpenDailyEvents = function(day, $event) {
                if (!($event.target && $event.target.type === "checkbox")) {
                    day.openDailyEvents = !day.openDailyEvents;
                }
            };

            /**
             * Redirect to homework or lesson view if homework attached to some lesson
             * @param homework Homework being clicked/selected
             * @param $event
             */
            $scope.editSelectedHomework = function(homework, $event) {

                // prevent redirect on clicking on checkbox
                if (!($event.target && $event.target.type === "checkbox")) {
                    if (homework.lesson_id == null) {
                        window.location = '/diary#/editHomeworkView/' + homework.id;
                    } else {
                        window.location = '/diary#/editLessonView/' + homework.lesson_id + '/' + homework.id;
                    }
                }
            };

            /**
             * Toggle show display homework panel detail of a day
             * Note: jquery oldschool way since with angular could not fix some display problems
             * @param day
             */
            $scope.toggleShowHwDetail = function(day) {
                hideOrShowHwDetail(day, undefined, true);
            };

            /**
             *
             * @param day
             * @param hideHomeworks
             * @param unselectHomeworksOnHide
             */
            var hideOrShowHwDetail = function(day, hideHomeworks, unselectHomeworksOnHide) {

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
                    day.dailyEvents.forEach(function(dailyEvent) {
                        dailyEvent.selected = false;
                    });
                }
            };


            /**
             * Get the maximum number of homeworks of a day for current week
             */
            var getMaxHomeworksPerDay = function() {
                var max = 0;

                $scope.calendar.days.all.forEach(function(day) {
                    if (day.dailyEvents && day.dailyEvents.length > max) {
                        max = day.dailyEvents.length;
                    }
                });

                return max;
            };

            // default open state of calendar grid
            // and homework panel
            if (!model.show) {
                model.show = {
                    bShowCalendar: true,
                    bShowHomeworks: true,
                    bShowHomeworksMinified: false
                }
            };


            $scope.show = model.show;

            /**
             * Minify the homework panel or not
             * If it's minified, will only show one max homework
             * else 3
             */
            $scope.toggleHomeworkPanelMinized = function() {
                model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, !model.show.bShowHomeworksMinified);
            };

            /**
             *
             * @param day
             * @returns {Number|boolean}
             */
            $scope.showNotAllHomeworks = function(day) {
                return day.dailyEvents && day.dailyEvents.length && !$scope.showAllHomeworks(day);
            };

            /**
             *
             * @param day Current day
             * @returns {boolean} true if all homeworks of current day
             * should be displayed in homework panel
             */
            $scope.showAllHomeworks = function(day) {

                if (!day.dailyEvents || (day.dailyEvents && day.dailyEvents.length == 0)) {
                    return false;
                }

                // calendar hidden and homework panel maximized -> show all
                if (!model.show.bShowHomeworksMinified) {
                    return !model.show.bShowCalendar || (day.dailyEvents.length <= 1);
                } else {
                    return day.dailyEvents.length == 1;
                }
            };

            $scope.show = model.show;


            /**
             * Return the homework panel height that should be set
             * depending on calendar grid displayed state and homework panel minimized state
             * @param bShowCalendar True if calendar grid is visible
             * @param bShowHomeworks True if homeworks panel is visible
             * @param bShowHomeworksMinified True if homework panel is in minimized mode (max 1 homework displayed)
             * @returns {number} Homework panel height
             */
            var getHomeworkPanelHeight = function(bShowCalendar, bShowHomeworks, bShowHomeworksMinified) {

                /**
                 * Height of a single homework in homework panel
                 * @type {number}
                 */
                const HW_HEIGHT = 40;
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
             * @param bShowCalendar Show calendar panel
             * @param bShowHomeworks Show homework panel
             * @param bShowHomeworksMinified If true homework panel will be minified (max homeworks display with full detail = 1)
             */
            model.placeCalendarAndHomeworksPanel = function(bShowCalendar, bShowHomeworks, bShowHomeworksMinified) {

                /**
                 * Calendar height
                 * @type {number}
                 */
                const CAL_HEIGHT = 775;

                var newHwPanelHeight = getHomeworkPanelHeight(bShowCalendar, bShowHomeworks, bShowHomeworksMinified);

                // reduce height of homework panel if requested
                $('.homeworkpanel').css('height', newHwPanelHeight);

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

                calGrid.height(bShowCalendar ? (newHwPanelHeight + CAL_HEIGHT) : 0);

                hoursBar.css('margin-top', newHwPanelHeight);
                $('legend.timeslots').css('margin-top', '');
                $('legend.timeslots').css('top', newHwPanelHeight);
                nextTimeslotsBar.css('top', CAL_HEIGHT + newHwPanelHeight);

                $('.schedule-item').css('margin-top', bShowCalendar ? newHwPanelHeight : 0);
                calGrid.height(CAL_HEIGHT + (bShowCalendar ? newHwPanelHeight : 0));

                // set homework panel size with max number of homeworks
                $('.homeworkpanel').height(newHwPanelHeight);
                $('.homeworkpanel').css('display', bShowHomeworks ? 'inherit' : 'none');

                // toggle buttons
                $('.show-homeworks').css('opacity', bShowHomeworks ? 1 : 0.3);
                $('.show-calendar-grid').css('opacity', bShowCalendar ? 1 : 0.3);


                $('#minimize_hw_span').css('display', (newHwPanelHeight > 0) ? 'inherit' : 'none');

                if (!bShowCalendar) {
                    model.calendar.days.all.forEach(function(day) {
                        hideOrShowHwDetail(day, true, true);
                    });
                }

                model.show.bShowCalendar = bShowCalendar;
                model.show.bShowHomeworks = bShowHomeworks;
                model.show.bShowHomeworksMinified = bShowHomeworksMinified;

            };


            function setDaysContent() {
                console.log("setDaysContent called");
                model.calendar.days.forEach(function(day) {
                    day.dailyEvents = [];
                });


                $scope.ngModel.forEach(function(item) {
                    var refDay = moment(model.calendar.dayForWeek).day(1);
                    model.calendar.days.forEach(function(day) {                        

                        if (item.dueDate && item.dueDate.format('YYYY-MM-DD') === refDay.format('YYYY-MM-DD')) {
                            day.dailyEvents.push(item);
                        }

                        refDay.add('day', 1);
                    });
                });

                $scope.calendar = model.calendar;

                var timeslots = $('.timeslots');

                if (timeslots.length === 8) {
                    model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, model.show.bShowHomeworksMinified);
                }
                // if days timeslots are not yet positioned
                // wait until they are to create the homework panel
                else {
                    var timerOccurences = 0;
                    var timer = setInterval(
                        function() {
                            timeslots = $('.timeslots');
                            if (timeslots.length === 8) {
                                clearInterval(timer);
                                model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, model.show.bShowHomeworksMinified);
                            }
                            timerOccurences++;
                            // 5s should be far than enough to have all timeslots loaded
                            if (timerOccurences > 50) {
                                clearInterval(timer);
                            }
                        }, 100);
                }
            }

            model.on('calendar.date-change', function() {
                setDaysContent();
                $scope.$apply();
            });

            $scope.$watchCollection('ngModel', function(newVal) {
                console.log("ngModel changed",$scope.ngModel);
                setDaysContent();
            });
        }
    });

})();
