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
                    model.placeCalendarAndHomeworksPanel = function (bShowCalendar, bShowHomeworks, bShowHomeworksMinified) {

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

                    // custom subject collection
                    // containing base subject collection + current ones being created by used
                    var subjects = new Array();

                    model.subjects.all.forEach(function (subject) {
                        subjects.push(subject);
                    });

                    subjects.sort(sortBySubjectLabel);

                    var setNewSubject = function (subjectLabel) {

                        if(!subjectLabel){
                            return;
                        }

                        subjectLabel = subjectLabel.trim();

                        var existingSubject = null;

                        for (var i = 0; i < subjects.length; i++) {
                            if (sansAccent(subjects[i].label).toUpperCase() === sansAccent(subjectLabel).toUpperCase()) {
                                existingSubject = subjects[i];
                            }
                        }

                        if (!existingSubject) {
                            scope.ngModel = new Subject();
                            scope.ngModel.label = subjectLabel;
                            scope.ngModel.id = null;
                            scope.ngModel.school_id = scope.lesson ? scope.lesson.audience.structureId : scope.homework.audience.structureId;
                            scope.ngModel.teacher_id = model.me.userId;
                            subjects.push(scope.ngModel);
                        } else {
                            scope.ngModel = existingSubject;
                        }
                    };

                    var initSuggestedSubjects = function() {
                        scope.suggestedSubjects = new Array();

                        for (var i = 0; i < subjects.length; i++) {
                            scope.suggestedSubjects.push(subjects[i]);
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
                        return scope.selected !== undefined && scope.selected != null && audience[scope.property] === scope.selected[scope.property];
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
                                scope.listVisible = true;
                                scope.$apply();
                            }).error(function (e) {
                            if (typeof cbe === 'function') {
                                cbe(model.parseError(e));
                            }
                        });
                    };

                    scope.$watch("selected", function(value) {
                        scope.isPlaceholder = true;
                        if (scope.selected !== null && scope.selected !== undefined) {
                            scope.isPlaceholder = scope.selected[scope.property] === undefined;
                            scope.display = scope.selected[scope.property];

                            if (scope.lesson && scope.lesson.id) {
                                if (scope.lesson.homeworks.all.length > 0) {
                                    scope.$parent.refreshHomeworkLoads(scope.lesson);
                                }
                                scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
                            }

                            if (scope.homework && scope.homework.audience) {
                                scope.$parent.showHomeworksLoad(scope.homework, null, scope.$apply);
                            }
                        }
                    });

                    $(element.context.ownerDocument).click(function (event) {
                        scope.listVisible = false;
                    });
                }
            }
        });

        /**
         * Directive to perform a quick search among lessons and homeworks
         */
        module.directive('attachmentsx', function () {
            return {
                restrict: "E",
                templateUrl: "diary/public/template/attachments.html",
                scope: {
                    /**
                     * Lesson or homework
                     */
                    item: '=',
                    /**
                     * If true, user won't be able to add or modify current attachments (for student for example)
                     */
                    readonly: '='
                },
                controller: function($scope){
                    $scope.removeAttachment = function (attachment) {

                        attachment.detachFromItem(scope.item,
                            // callback function TODO handle
                            function () {

                            },
                            // callback on error function TODO handle
                            function () {

                            }
                        );
                    }
                },
                link: function($scope){
                    //$scope.selectedAttachments = new Array();
                    $scope.display = {};
                    $scope.display.showPersonalAttachments = false;
                    setTimeout(function(){
                        var addButton =  $('.right-magnet.vertical-spacing-twice');
                        addButton.hide();
                    }, 500);

                    /**
                     *
                     * @returns {*}
                     */
                    var getMediaLibraryScope = function(){
                        // tricky way to get that mediaLibrary directive ...
                        var i = 0;
                        var mediaLibraryScope = null;

                        for (var cs = $scope.$$childHead; cs; cs = cs.$$nextSibling) {
                            if(i === 0 && !cs.attachment){
                                mediaLibraryScope = cs.$$nextSibling.$$childTail.$$childTail.$$childTail;
                                return mediaLibraryScope;
                            }
                            i ++;
                        }

                        return null;
                    };

                    var mediaLibraryScope = null;
;
                    // open up personal storage
                    $scope.showPersonalAttachments = function(){
                        $scope.display.showPersonalAttachments = true;
                    };

                    $scope.hidePersonalAttachments = function(){
                        $scope.display.showPersonalAttachments = false;
                    };


                    /**
                     * Selected attachments from media library directive
                     * see attachments.html
                     * @param selectedAttachments Selected attachments in personal storage view
                     */
                    $scope.updateSelectedAttachments = function (selectedAttachments) {
                        // TODO DELETE
                    };

                    /**
                     *
                     * @param documentId
                     */
                    var hasAttachmentInItem = function(documentId) {

                        var hasAttachment = false;

                        if(!$scope.item.attachments || $scope.item.attachments.length === 0){
                            hasAttachment = false;
                        } else {
                            $scope.item.attachments.forEach(function(itemAttachment){

                                if(itemAttachment.document_id === documentId){
                                    hasAttachment = true;
                                }
                            });
                        }

                        return hasAttachment;
                    };

                    /**
                     *
                     * @returns {*}
                     */
                    var getSelectedDocuments = function () {
                        var selectedDocuments = _.where(mediaLibraryScope.documents, {
                            selected: true
                        });

                        return selectedDocuments;
                    };

                    /**
                     *
                     * @param selectedAttachments Selected documents in media library directive
                     */
                    var addSelectedDocumentsToItem = function (newSelectedAttachments) {

                        if (!newSelectedAttachments || newSelectedAttachments.length === 0) {
                            return;
                        }

                        var newAttachments = new Array();

                        newSelectedAttachments.forEach(function (selectedAttachment) {

                            if (!hasAttachmentInItem(selectedAttachment._id)) {
                                var itemAttachment = new Attachment();

                                itemAttachment.user_id = model.me.userId;
                                itemAttachment.document_id = selectedAttachment._id;
                                itemAttachment.document_label = selectedAttachment.name;

                                newAttachments.push(itemAttachment);
                                $scope.item.addAttachment(itemAttachment);
                            }
                        });
                    };


                    /**
                     * Associates the selected attachments from directive
                     * to current item (lesson or homework)
                     */
                    $scope.linkAttachmentsToItem = function () {

                        if (mediaLibraryScope == null) {
                            mediaLibraryScope = getMediaLibraryScope();
                        }

                        var selectedAttachments = getSelectedDocuments();

                        if (selectedAttachments.length === 0) {
                            notify.info('diary.attachments.selectattachmentstolink');
                        }

                        else {
                            addSelectedDocumentsToItem(selectedAttachments);
                            // close media library directive
                            $scope.hidePersonalAttachments();
                        }

                    };

                    $scope.removeAttachmentXX = function (attachment) {

                        attachment.detachFromItem(scope.item.id, scope.itemType,
                            // callback function TODO handle
                            function () {

                            },
                            // callback on error function TODO handle
                            function () {

                            }
                        );
                    }
                }
            }
        });

        /**
         *
         */
        module.directive('attachment', function () {
            return {
                restrict: "E",
                require: '^attachmentsx',
                templateUrl: "diary/public/template/attachment.html",
                scope: {
                    /**
                     * Attachment
                     */
                    attachment: '=',
                    /**
                     * Reference to lesson or homework
                     */
                    item: '=',
                    /**
                     *  If true, user won't be able to add or modify current attachments (for student for example)
                     */
                    readonly: '='
                },
                link: function (scope, element, attrs, location) {

                    /**
                     * As seen from entcore, behaviour.js
                     * @param attachment
                     */
                    scope.downloadAttachment = function () {
                        scope.attachment.download();
                    };

                    // detachFromItem = function (itemId, itemType, cb, cbe) {
                    /**
                     * Removes attachment from lesson or homework
                     * but DOES NOT remove the file physically
                     */
                    scope.removeAttachment = function () {

                        // do not modify current attachment if readonly
                        if (scope.readonly === true) {
                            return;
                        }

                        scope.attachment.detachFromItem(scope.item,
                            // callback function
                            function (cb) {
                                notify.info(cb.message);
                            },
                            // callback on error function
                            function (cbe) {
                                notify.error(cbe.message);
                            }
                        );
                    }
                }
            }
        });


        /**
         * Directive to perform a quick search among lessons and homeworks
         */
        module.directive('quickSearch', function () {
            return {
                restrict: "E",
                templateUrl: "diary/public/template/quick-search.html",
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

                            var timeslot = $(this);

                            // allow drag
                            timeslot.on('dragover', function ($event) {
                                event.preventDefault();
                            });

                            timeslot.on('dragenter', function (event) {
                                timeslot.css('border', 'blue 2px dashed');
                                timeslot.css('border-radius', '3px');
                                //timeslot.css('background-color', 'blue');
                            });

                            timeslot.on('dragleave', function (event) {
                                //timeslot.css('background-color', '');
                                timeslot.css('border', '');
                                timeslot.css('border-radius', '');
                            });

                            timeslot.on('drop', function ($event) {
                                $event.preventDefault();

                                timeslot.css('background-color', '');

                                // duplicate dragged lesson
                                var pedagogicItemOfTheDay = JSON.parse($event.originalEvent.dataTransfer.getData("application/json"));

                                // do not drop if item type is not a lesson
                                if (pedagogicItemOfTheDay.type_item !== 'lesson') {
                                    return;
                                }

                                var newLesson = new Lesson();
                                newLesson.id = pedagogicItemOfTheDay.id;

                                var newLessonDayOfWeek = Math.floor(index / timeslotsPerDay) + 1;
                                var newLessonStartTime = model.startOfDay + (index % timeslotsPerDay);
                                var newLessonEndTime = newLessonStartTime + 1;

                                newLesson.load(false, function () {
                                    // will force new lesson to be created in DB
                                    newLesson.id = null;

                                    // startTime and end format from db is "HH:MM:SS" as text type
                                    // for lesson save startTime need to be moment time type with date
                                    newLesson.date = moment(newLesson.date);
                                    newLesson.startTime = moment(newLesson.date.format('YYYY-MM-DD') + ' ' + newLesson.startTime);
                                    newLesson.startTime.hour(newLessonStartTime);
                                    newLesson.startTime.minute(0);
                                    newLesson.startTime.day(newLessonDayOfWeek);

                                    newLesson.endTime = moment(newLesson.date.format('YYYY-MM-DD') + ' ' + newLesson.endTime);
                                    newLesson.endTime.hour(newLessonEndTime);
                                    newLesson.endTime.minute(0);
                                    newLesson.endTime.day(newLessonDayOfWeek);
                                    newLesson.endTime.week(model.calendar.week);

                                    newLesson.date.day(newLessonDayOfWeek);
                                    newLesson.date.week(model.calendar.week);

                                    newLesson.state = 'draft';

                                    newLesson.save(function (data) {
                                        window.location = '/diary#/editLessonView/' + newLesson.id;
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

        /**
         * Directive for result items
         */
        module.directive('quickSearchItem', function () {
            return {
                restrict: "E",
                templateUrl: "diary/public/template/quick-search-item.html",
                scope: false,
                link: function (scope, element) {

                    var angElement = angular.element(element);

                    angElement.on('drag', function(){
                        angElement.css('opacity', 0.9);
                    });

                    scope.dragCondition = function (item) {
                        return true;
                    };

                    scope.dropCondition = function (targetItem) {
                        return false;
                    };

                    scope.drag = function(item, $originalEvent) {
                        try {
                            $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
                        } catch (e) {
                            $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
                        }
                    };
                }
            }
        });

    },
    init: function (module) {
        this.addDirectives(module);
    }
};
