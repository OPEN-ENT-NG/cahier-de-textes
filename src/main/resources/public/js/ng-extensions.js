var AngularExtensions = {
    addDirectives: function(module){
        module.directive('calendarDailyEvents', function(){
            return {
                scope: {
                    ngModel: '='
                },
                restrict: 'E',
                template: '<span id="minimize_hw_span" class="ng-scope"><ul style="padding-left: 0px !important; padding-right: 0px !important; border: 0px !important;"><li>' +
                '<i class="resize-homeworks-panel"   style="float: left; width: 130px;">&nbsp;</i></li></ul></span>'+
                '<div class="days" style="z-index: 1000; ">' +
                    '<div class="day homeworkpanel"  ng-repeat="day in calendar.days.all" style="height: 40px;">' +

                        // <= 3 homeworks for current day
                        // or 1 homework and homework panel minified
                        '<div class="test" ng-if="showAllHomeworks(day)">' +
                            '<div ng-repeat="dailyEvent in day.dailyEvents">' +
                            '<container template="daily-event-item" style="padding-bottom: 1px;"></container>' +
                            '</div>' +
                        '</div>' +

                        // > 3 homeworks for current day
                        // or > 1 homework and homework panel minified
                        '<div class="opener" ng-if="showNotAllHomeworks(day)" ' +
                            'ng-click="toggleShowHwDetail(day)">' +
                            '<span id="dailyeventlongtitle"><i18n>daily.event</i18n></span>' +
                            '<span id="dailyeventshorttitle">TAF ([[day.dailyEvents.length]])</span>' +
                        '</div>' +
                        '<div class="test daily-events" style="z-index: 1000;" id="hw-detail-[[day.index]]" ' +
                            'ng-click="toggleOpenDailyEvents(day, $event)" ' +
                            'ng-class="{ show: day.openDailyEvents && day.dailyEvents.length > 1 }">' +
                            '<div ng-repeat="dailyEvent in day.dailyEvents">' +
                            '<container template="daily-event-item" style="padding-bottom: 1px;"></container>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
                link: function(scope, element, attributes){
                    scope.calendar = model.calendar;
                    scope.isUserTeacher = model.isUserTeacher();

                    /**
                     * Open homeworks details when homeworks info is minimized
                     * or vice versa
                     * @param day
                     * @param $event
                     */
                    scope.toggleOpenDailyEvents = function (day, $event) {
                        if (!($event.target && $event.target.type === "checkbox")) {
                            day.openDailyEvents = !day.openDailyEvents;
                        }
                    };

                    /**
                     * Redirect to homework or lesson view if homework attached to some lesson
                     * @param homework Homework being clicked/selected
                     * @param $event
                     */
                    scope.editSelectedHomework = function (homework, $event) {

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
                    scope.toggleShowHwDetail = function (day) {
                        hideOrShowHwDetail(day, undefined, true);
                    };

                    /**
                     *
                     * @param day
                     * @param hideHomeworks
                     * @param unselectHomeworksOnHide
                     */
                    var hideOrShowHwDetail = function (day, hideHomeworks, unselectHomeworksOnHide) {

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
                    var getMaxHomeworksPerDay = function () {
                        var max = 0;

                        scope.calendar.days.all.forEach(function (day) {
                            if (day.dailyEvents && day.dailyEvents.length > max) {
                                max = day.dailyEvents.length;
                            }
                        });

                        return max;
                    };

                    // default open state of calendar grid
                    // and homework panel
                    if(!model.show){
                        model.show = {
                            bShowCalendar: true,
                            bShowHomeworks: true,
                            bShowHomeworksMinified: false
                        }
                    };


                    scope.show = model.show;

                    /**
                     * Minify the homework panel or not
                     * If it's minified, will only show one max homework
                     * else 3
                     */
                    scope.toggleHomeworkPanelMinized = function () {
                        model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, !model.show.bShowHomeworksMinified);
                    };

                    /**
                     *
                     * @param day
                     * @returns {Number|boolean}
                     */
                    scope.showNotAllHomeworks = function (day) {
                        return day.dailyEvents && day.dailyEvents.length && !scope.showAllHomeworks(day);
                    };

                    /**
                     *
                     * @param day Current day
                     * @returns {boolean} true if all homeworks of current day
                     * should be displayed in homework panel
                     */
                    scope.showAllHomeworks = function (day) {

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

                    scope.show = model.show;


                    /**
                     * Return the homework panel height that should be set
                     * depending on calendar grid displayed state and homework panel minimized state
                     * @param bShowCalendar True if calendar grid is visible
                     * @param bShowHomeworks True if homeworks panel is visible
                     * @param bShowHomeworksMinified True if homework panel is in minimized mode (max 1 homework displayed)
                     * @returns {number} Homework panel height
                     */
                    var getHomeworkPanelHeight = function (bShowCalendar, bShowHomeworks, bShowHomeworksMinified) {

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

                        return homeworksPerDayDisplayed * HW_HEIGHT;
                    };


                    /**
                     * Display homeworks and lessons and set open state of homework panel
                     * and calendar grid
                     * @param bShowCalendar Show calendar panel
                     * @param bShowHomeworks Show homework panel
                     * @param bShowHomeworksMinified If true homework panel will be minified (max homeworks display with full detail = 1)
                     */
                    model.placeCalendarAndHomeworksPanel = function (bShowCalendar, bShowHomeworks, bShowHomeworksMinified) {

                        /**
                         * Calendar height
                         * @type {number}
                         */
                        const CAL_HEIGHT = 587;

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
                            model.calendar.days.all.forEach(function (day) {
                                hideOrShowHwDetail(day, true, true);
                            });
                        }

                        model.show.bShowCalendar = bShowCalendar;
                        model.show.bShowHomeworks = bShowHomeworks;
                        model.show.bShowHomeworksMinified = bShowHomeworksMinified;

                    };


                    function setDaysContent() {

                        model.calendar.days.forEach(function (day) {
                            day.dailyEvents = [];
                        });
                        scope.ngModel.forEach(function(item){
                            var refDay = moment(model.calendar.dayForWeek).day(1);
                            model.calendar.days.forEach(function(day){
                                if(item.dueDate && item.dueDate.format('YYYY-MM-DD') === refDay.format('YYYY-MM-DD')){
                                    day.dailyEvents.push(item);
                                }

                                refDay.add('day', 1);
                            });
                        });

                        scope.calendar = model.calendar;

                        var timeslots = $('.timeslots');

                        if (timeslots.length === 8) {
                            model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, model.show.bShowHomeworksMinified);
                        }
                        // if days timeslots are not yet positioned
                        // wait until they are to create the homework panel
                        else {
                            var timerOccurences = 0;
                            var timer = setInterval(
                                function () {
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

                    model.on('calendar.date-change', function(){
                        setDaysContent();
                        scope.$apply();
                    });

                    scope.$watchCollection('ngModel', function(newVal){
                        setDaysContent()
                    });

                    $('body').on('click', function(e){
                        if(e.target !== element[0] && element.find(e.target).length === 0){
                            model.calendar.days.forEach(function(day){
                                day.openDailyEvents = false;
                            });
                            scope.$apply();
                        }
                    });
                }
            }
        });

        module.directive('timePicker', function () {
            return {
                scope: {
                    ngModel: '=',
                    ngChange: '&'
                },
                transclude: true,
                replace: true,
                restrict: 'E',
                template: "<input type='text' />",
                link: function (scope, element, attributes) {
                    var hideFunction = function (e) {
                        var timepicker = element.data('timepicker');
                        if (!timepicker || element[0] === e.target || $('.bootstrap-timepicker-widget').find(e.target).length !== 0) {
                            return;
                        }
                        timepicker.hideWidget();
                    };
                    $('body, lightbox').on('click', hideFunction);
                    $('body, lightbox').on('focusin', hideFunction);
                    if (!$.fn.timepicker) {
                        $.fn.timepicker = function () { };
                        loader.asyncLoad('/' + infraPrefix + '/public/js/bootstrap-timepicker.js', function () {
                            // does not seem to work properly
                            element.timepicker({
                                showMeridian: false,
                                defaultTime: 'current'
                            });
                        });
                    }

                    scope.$watch('ngModel', function (newVal) {
                        if (!newVal) {
                            return;
                        }
                        element.val(newVal.format("HH:mm"));
                    });

                    element.on('focus', function () {
                        element.timepicker({
                            showMeridian: false,
                            defaultTime: 'current',
                            minuteStep: 5
                        });
                    });

                    element.on('change', function () {
                        var time = element.val().split(':');
                        if(scope.ngModel && scope.ngModel.hour){
                            scope.ngModel.set('hour', time[0]);
                            scope.ngModel.set('minute', time[1]);
                            scope.$apply('ngModel');
                            scope.$parent.$eval(scope.ngChange);
                            scope.$parent.$apply();
                        }
                    });

                    element.on('show.timepicker', function () {
                        element.parents().find('lightbox').on('click.timepicker', function (e) {
                            if (!(element.parent().find(e.target).length ||
                                timepicker.$widget.is(e.target) ||
                                timepicker.$widget.find(e.target).length)) {
                                timepicker.hideWidget();
                            }
                        });
                    });
                }
            }
        });

        module.directive('subjectPicker', function () {
            return {
                scope: {
                    ngModel: '=',
                    ngChange: '&',
                    lesson: "=",
                    homework: "="
                },
                transclude: true,
                replace: true,
                restrict: 'E',
                templateUrl: 'diary/public/template/subject-picker.html',
                link: function (scope, element) {


                    var sortBySubjectLabel = function (a, b) {
                        if (a.label > b.label)
                            return 1;
                        if (a.label < b.label)
                            return -1;
                        return 0;
                    };

                    scope.search = null;
                    scope.displaySearch = false;

                    // init suggested subjects with all subjects
                    scope.suggestedSubjects = new Array();
                    model.subjects.all.sort(sortBySubjectLabel);

                    var setNewSubject = function (subjectLabel) {

                        if(!subjectLabel){
                            return;
                        }

                        subjectLabel = subjectLabel.trim();

                        var existingSubject = null;

                        for (var i = 0; i < model.subjects.all.length; i++) {
                            if (sansAccent(model.subjects.all[i].label).toUpperCase() === sansAccent(subjectLabel).toUpperCase()) {
                                existingSubject = model.subjects.all[i];
                            }
                        }

                        if (!existingSubject) {
                            scope.ngModel.label = subjectLabel;
                            scope.ngModel.id = null;
                            scope.ngModel.school_id = scope.lesson ? scope.lesson.audience.structureId : scope.homework.audience.structureId;
                            scope.ngModel.teacher_id = model.me.userId;
                        } else {
                            scope.ngModel = existingSubject;
                        }
                    };

                    var initSuggestedSubjects = function() {
                        scope.suggestedSubjects = new Array();

                        for (var i = 0; i < model.subjects.all.length; i++) {
                            scope.suggestedSubjects.push(model.subjects.all[i]);
                        }
                    };

                    initSuggestedSubjects();

                    scope.goToSearchMode = function(){
                        scope.displaySearch = true;
                        scope.search = '';
                        initSuggestedSubjects();
                    };

                    scope.isSelected = function (subject) {

                        if(scope.ngModel && subject){
                            if(scope.ngModel.id){
                                return scope.ngModel.id === subject.id;
                            }
                            // subject may not have id if it's new one
                            else {
                                return sansAccent(scope.ngModel.label) === sansAccent(subject.label);
                            }
                        } else {
                            return false;
                        }
                    };

                    /**
                     * Search subject from input by user
                     */
                    scope.searchSubject = function (event) {

                        if (event.type === 'keydown' && event.keyCode === 9) {
                            scope.displaySearch = false;

                            if (scope.search != '') {
                                setNewSubject(scope.search);
                            }
                            return;
                        }

                        scope.search = scope.search.trim();

                        if (scope.search != '') {
                            var matchingSubjects = model.findSubjectsByLabel(scope.search);
                            scope.suggestedSubjects = new Array();

                            for (var i = 0; i < matchingSubjects.length; i++) {
                                scope.suggestedSubjects.push(matchingSubjects[i]);
                            }

                            scope.$apply();
                        } else {
                            initSuggestedSubjects();
                        }
                    };

                    scope.selectSubject = function (subject) {
                        scope.ngModel = subject;
                        scope.displaySearch = false;
                        if (scope.lesson) {
                            scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
                        }
                    };

                    $(element.context.ownerDocument).click(function (event) {
                        if (!$(event.target).is("item-suggest") && !$(event.target).is("#remove-subject") && !$(event.target).is("#input-subject")) {
                            scope.displaySearch = false;

                            // new subject that will need to be created on lesson/homework save
                            if (scope.suggestedSubjects.length === 0) {
                                setNewSubject(scope.search);
                            }
                            scope.$apply();
                        }
                    });
                }
            }
        });

        module.directive('entDropdown', function () {
            return {
                restrict: "E",
                templateUrl: "diary/public/template/ent-dropdown.html",
                scope: {
                    placeholder: "@",
                    list: "=",
                    selected: "=",
                    property: "@",
                    school: "=",
                    refreshFunc: "&",
                    loadPreviousFunc: "&",
                    lesson: "=",
                    homework: "="
                },
                link: function(scope, element, attrs) {
                    scope.listVisible = false;
                    scope.isPlaceholder = true;
                    scope.searchPerformed = false;
                    scope.otherAudiences = [];
                    scope.translated_placeholder = lang.translate(scope.placeholder);

                    scope.select = function(audience) {
                        scope.isPlaceholder = false;
                        scope.selected = audience;
                        scope.listVisible = false;
                    };

                    scope.isSelected = function(audience) {
                        // FIXME scope.selected can be undefined (?)
                        return scope.selected !== undefined && audience[scope.property] === scope.selected[scope.property];
                    };

                    scope.show = function() {
                        scope.listVisible = true;
                    };

                    scope.searchAudiences = function () {
                        http().get('diary/classes/list/' + scope.school)
                            .done(function (structureData) {
                                scope.otherAudiences = _.map(structureData, function (data) {
                                    var audience = {};
                                    audience.structureId = scope.school;
                                    audience.type = 'class';
                                    audience.typeLabel = (data.className === 'class') ? lang.translate('diary.audience.class') :  lang.translate('diary.audience.group');
                                    audience.id= data.classId;
                                    audience.name = data.className;
                                    return audience;
                                });

                                scope.otherAudiences = _.reject(scope.otherAudiences, function(audience) {
                                    return _.contains(_.pluck(scope.list, 'name') , audience.name);
                                });

                                scope.searchPerformed = true;
                                scope.$apply();
                            }).error(function (e) {
                            if (typeof cbe === 'function') {
                                cbe(model.parseError(e));
                            }
                        });
                    };

                    scope.$watch("selected", function(value) {
                        scope.isPlaceholder = scope.selected[scope.property] === undefined;
                        scope.display = scope.selected[scope.property];

                        if (scope.lesson) {
                            if (scope.lesson.homeworks.all.length > 0) {
                                scope.$parent.refreshHomeworkLoads(scope.lesson);
                            }
                            scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
                        }

                        if (scope.homework) {
                            scope.$parent.showHomeworksLoad(scope.homework, null, scope.$apply);
                        }
                    });
                }
            }
        });

    },
    init: function (module) {
        this.addDirectives(module);
    }
};
