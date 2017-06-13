(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();
"use strict";

var AngularExtensions = {
    moduleConfigs: [],
    addModuleConfig: function addModuleConfig(callBack) {
        this.moduleConfigs.push(callBack);
    },
    init: function init(module) {
        angular.forEach(this.moduleConfigs, function (moduleConfig) {
            moduleConfig.apply(this, [module]);
        });
    }
};

"use strict";

(function () {
  'use strict';

  AngularExtensions.addModuleConfig(function (module) {
    //controller declaration
    module.value("constants", {
      CAL_DATE_PATTERN: "YYYY-MM-DD",
      CAL_DATE_PATTERN_NG: "dd-MM-yyyy",
      LONG_DATE_PATTERN: 'YYYY-MM-DD hh:mm:ss',
      RIGHTS: {
        CREATE_LESSON: 'diary.createLesson',
        VIEW: 'diary.view',
        CREATE_HOMEWORK_FOR_LESSON: 'createHomeworkForLesson',
        CREATE_FREE_HOMEWORK: 'diary.createFreeHomework',
        MANAGE_MODEL_WEEK: 'diary.manageModelWeek',
        MANAGE_VISA: 'diary.manageVisa'
      }
    });
  });
})();

'use strict';

(function () {
	'use strict';

	AngularExtensions.addModuleConfig(function (module) {

		module.directive('diaryCalendar', directive);

		function directive() {
			return {
				restrict: 'E',
				templateUrl: '/diary/public/js/common/directives/calendar/calendar.template.html',
				scope: {
					items: '=',
					mondayOfWeek: '=',
					itemTemplate: '@',
					readOnly: '=',
					displayTemplate: '=',
					onCreateOpenAction: '&',
					params: '=',
					templateSlotItem: '='
				},

				controller: 'DiaryCalendarController',
				controllerAs: "DiaryCalendarCtrl"
			};
		}
	});
})();

"use strict";

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        module.controller("DiaryCalendarController", controller);

        function controller($scope, $rootScope, $timeout, $window, $element, $location, AudienceService, SubjectService, SecureService, constants) {
            // use controllerAs practice
            var vm = this;

            /*
             * Initilisation function
             */
            init();

            function init() {
                //display options
                vm.display = {
                    editItem: false,
                    createItem: false,
                    readonly: false //!SecureService.hasRight(constants.RIGHTS.CREATE_LESSON)
                };

                /**
                 * Used to know if user clicked on calendar event
                 * or is dragging  to prevent ng-click
                 */
                vm.itemMouseEvent = {
                    lastMouseDownTime: undefined,
                    lastMouseClientX: undefined,
                    lastMouseClientY: undefined
                };

                bindEvents();
            }

            $scope.$watch("mondayOfWeek", function (n, o) {

                if (!$scope.mondayOfWeek) {
                    return;
                }

                var date = moment();

                // create calendar objet
                vm.calendar = new calendar.Calendar({
                    week: moment($scope.mondayOfWeek).week(),
                    year: moment($scope.mondayOfWeek).year()
                });

                /*
                * //TODO no a good practice but all the code refer to model.calendar
                * try to dissociate
                */
                model.calendar = vm.calendar;

                vm.calendar.week = $scope.mondayOfWeek.week();
                vm.calendar.setDate($scope.mondayOfWeek);

                $scope.lastDay = moment($scope.mondayOfWeek).add(6, 'd');
            });

            /*
            *   all events binded here
            */
            function bindEvents() {
                //set items watcher
                $scope.$watch('items', function (n, o) {
                    vm.refreshCalendar();
                });
                // add event listener
                $scope.$on('calendar.refreshItems', function () {
                    vm.refreshCalendar();
                });

                angular.element($window).bind('resize', _.throttle(function () {
                    $scope.$apply(function () {
                        disposeItems();
                    });
                }, 50));
            }

            /*
             * refresh calendar every items modification
             */
            vm.refreshCalendar = function () {
                if (!vm.calendar) {
                    return;
                }
                var date = moment();
                vm.calendar.clearScheduleItems();
                var scheduleItems = _.where(_.map($scope.items, function (item) {
                    item.beginning = item.startMoment;
                    item.end = item.endMoment;
                    return item;
                }), {
                    is_periodic: false
                });
                vm.calendar.addScheduleItems(scheduleItems);
                disposeItems();
            };

            //between not supported on the current underscore version
            vm.between = function (date, start, end) {
                return date.isAfter(start) && date.isBefore(end);
            };

            vm.removeCollisions = function (day) {
                _.each(day.scheduleItems, function (scheduleItem) {
                    delete scheduleItem.calendarGutter;
                });
            };

            //calc colisions
            vm.calcAllCollisions = function (item, day) {
                var calendarGutter = 0;
                var collision = true;
                var count = 0;
                while (collision) {
                    count++;
                    collision = false;
                    day.scheduleItems.forEach(function (scheduleItem) {
                        if (scheduleItem != item && (vm.between(item.beginning, scheduleItem.beginning, scheduleItem.end) || vm.between(item.end, scheduleItem.beginning, scheduleItem.end) || vm.between(scheduleItem.end, item.beginning, item.end) || scheduleItem.end.isSame(item.end) && scheduleItem.beginning.isSame(item.beginning))) {
                            if (scheduleItem.calendarGutter === calendarGutter) {
                                calendarGutter++;
                                collision = true;
                                item.hasCollision = true;
                            }
                        }
                    });
                }

                item.calendarGutter = calendarGutter;
            };

            /*
            * dispose item elements
            */
            function disposeItems() {
                //recal all collisions
                if (!vm.calendar) {
                    return;
                }
                _.each(vm.calendar.days.all, function (day) {
                    vm.removeCollisions(day);
                    _.each(day.scheduleItems.all, function (item) {
                        vm.calcAllCollisions(item, day);
                    });
                });

                _.each(vm.calendar.days.all, function (day) {
                    _.each(day.scheduleItems.all, function (item) {
                        disposeItem(item, day);
                    });
                });
            }

            function getWidth(scheduleItem, day) {

                var concurrentItems = _.filter(day.scheduleItems.all, function (item) {
                    return item.beginning.unix() <= scheduleItem.end.unix() && item.end.unix() >= scheduleItem.beginning.unix();
                });

                var maxGutter = 0;
                _.forEach(concurrentItems, function (item) {
                    if (item.calendarGutter && item.calendarGutter > maxGutter && !item.notShowOnCollision) {
                        maxGutter = item.calendarGutter;
                    }
                });
                maxGutter++;

                return Math.floor(99 / maxGutter);
            }
            /*
            * dispose on item
            */
            function disposeItem(item, day) {

                var itemWidth = getWidth(item, day);
                var dayWidth = $element.find('.day').width();

                var beginningMinutesHeight = item.beginning.minutes() * calendar.dayHeight / 60;
                var endMinutesHeight = item.end.minutes() * calendar.dayHeight / 60;
                var hours = calendar.getHours(item, day);
                var top = (hours.startTime - calendar.startOfDay) * calendar.dayHeight + beginningMinutesHeight;
                var containerTop = "0px";
                var containerHeight = "100%";

                var scheduleItemHeight = (hours.endTime - hours.startTime) * calendar.dayHeight - beginningMinutesHeight + endMinutesHeight;
                if (top < 0) {
                    containerTop = Math.abs(top) - 5 + 'px';
                    containerHeight = scheduleItemHeight + top + 5 + 'px';
                }

                var display = item.notShowOnCollision && item.hasCollision ? "none" : 'initial';

                item.position = {
                    scheduleItemStyle: {
                        width: itemWidth + '%',
                        top: top + 'px',
                        left: item.calendarGutter * (itemWidth * dayWidth / 100) + 'px',
                        height: scheduleItemHeight + 'px',
                        display: display
                    },
                    containerStyle: {
                        top: containerTop,
                        height: containerHeight
                    }
                };
            }

            vm.createItem = function (day, timeslot) {
                $scope.newItem = {};
                var year = vm.calendar.year;
                if (day.index < vm.calendar.firstDay.dayOfYear()) {
                    year++;
                }
                $scope.newItem.beginning = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.start).minute(0).second(0);
                $scope.newItem.end = moment($scope.newItem.beginning).add(1, 'h');
                vm.calendar.newItem = $scope.newItem;
                $scope.onCreateOpen();
            };

            vm.closeCreateWindow = function () {
                vm.display.createItem = false;
                $scope.onCreateClose();
            };

            vm.updateCalendarWeek = function () {
                //annoying new year workaround
                if (moment(vm.calendar.dayForWeek).week() === 1 && moment(vm.calendar.dayForWeek).dayOfYear() > 7) {
                    vm.calendar = new calendar.Calendar({
                        week: moment(vm.calendar.dayForWeek).week(),
                        year: moment(vm.calendar.dayForWeek).year() + 1
                    });
                } else if (moment(vm.calendar.dayForWeek).week() === 53 && moment(vm.calendar.dayForWeek).dayOfYear() < 7) {
                    vm.calendar = new calendar.Calendar({
                        week: moment(vm.calendar.dayForWeek).week(),
                        year: moment(vm.calendar.dayForWeek).year() - 1
                    });
                } else {
                    vm.calendar = new calendar.Calendar({
                        week: moment(vm.calendar.dayForWeek).week(),
                        year: moment(vm.calendar.dayForWeek).year()
                    });
                }
                model.trigger('calendar.date-change');
                vm.refreshCalendar();
            };

            $scope.previousTimeslots = function () {
                calendar.startOfDay--;
                calendar.endOfDay--;
                vm.calendar = new calendar.Calendar({
                    week: moment(vm.calendar.dayForWeek).week(),
                    year: moment(vm.calendar.dayForWeek).year()
                });
                vm.refreshCalendar();
            };

            $scope.nextTimeslots = function () {
                calendar.startOfDay++;
                calendar.endOfDay++;
                vm.calendar = new calendar.Calendar({
                    week: moment(vm.calendar.dayForWeek).week(),
                    year: moment(vm.calendar.dayForWeek).year()
                });
                vm.refreshCalendar();
            };

            $scope.onCreateOpen = function () {
                /*if (!allowCreate) {
                    return;
                }*/

                $scope.onCreateOpenAction();
                //$scope.$eval(attributes.onCreateOpen);
                vm.display = {
                    createItem: true
                };
            };
            $scope.onCreateClose = function () {
                $scope.$eval(attributes.onCreateClose);
            };

            $scope.setMouseDownTime = function ($event) {
                vm.itemMouseEvent.lastMouseDownTime = new Date().getTime();
                vm.itemMouseEvent.lastMouseClientX = $event.clientX;
                vm.itemMouseEvent.lastMouseClientY = $event.clientY;
            };

            /**
             * Redirect to path only when user is doind a real click.
             * If user is draging item redirect will not be called
             * @param item Lesson being clicked or dragged
             * @param $event
             */
            $scope.openOnClickSaveOnDrag = function (item, $event) {

                var path = '/editLessonView/' + item.id;

                // gap between days is quite important
                var xMouseMoved = Math.abs(vm.itemMouseEvent.lastMouseClientX - $event.clientX) > 30;
                // gap between minutes is tiny so y mouse move detection must be accurate
                // so user can change lesson time slightly
                var yMouseMoved = Math.abs(vm.itemMouseEvent.lastMouseClientY - $event.clientY) > 0;

                // fast click = no drag = real click
                // or cursor did not move
                if (!xMouseMoved && !yMouseMoved || new Date().getTime() - vm.itemMouseEvent.lastMouseDownTime < 300) {
                    // do not redirect to lesson view if user clicked on checkbox
                    if (!($event.target && $event.target.type === "checkbox")) {
                        $rootScope.redirect(path);
                    }
                } else {
                    //$timeout(vm.refreshCalendar);
                }
            };

            //TODO remove from here
            $scope.createNewtemFromSchedule = function (item) {
                $scope.newItem = {};
                var year = vm.calendar.year;

                //set beginning
                $scope.newItem.beginning = moment(item.startMoment);
                $scope.newItem.end = moment(item.endMoment);

                AudienceService.getAudiencesAsMap(model.me.structures).then(function (audienceMap) {
                    //get audience
                    if (item.data && item.data.classes && item.data.classes.length > 0) {
                        $scope.newItem.audience = audienceMap[item.data.classes[0]];
                    }
                    //get room
                    if (item.data && item.data.roomLabels && item.data.roomLabels.length > 0) {
                        $scope.newItem.room = item.data.roomLabels[0];
                    }

                    if (item.data && item.data.subject) {
                        //when the item comme from modelweek, the subject is already the good subject
                        //but if not, we need to grab the good subject object with the good id
                        // from EDT-UDT
                        if (item.data.subject.subjectId) {
                            $scope.newItem.subject = _.find(model.subjects.all, function (subject) {
                                return subject.originalsubjectid === item.data.subject.subjectId;
                            });
                            if (!$scope.newItem.subject) {

                                item.data.subject.teacher_id = model.me.userId;

                                $scope.newItem.subject = SubjectService.mapToDiarySubject(item.data.subject);
                            }
                        } else {
                            //data from modelweek
                            if (item.data.subject.id) {
                                $scope.newItem.subject = item.data.subject;
                            }
                        }
                    }
                    vm.calendar.newItem = $scope.newItem;
                    $scope.onCreateOpen();
                });
            };
        }
    });
})();

'use strict';

(function () {
                      'use strict';

                      AngularExtensions.addModuleConfig(function (module) {
                                            module.directive('diaryScheduleItem', function ($compile) {
                                                                  return {
                                                                                        restrict: 'E',
                                                                                        require: '^diary-calendar',
                                                                                        template: '<div class="schedule-item" resizable draggable horizontal-resize-lock\n                            ng-style="item.position.scheduleItemStyle"\n                            >\n                                <container template="schedule-display-template" ng-style="item.position.containerStyle" class="absolute"></container>\n                            </div>',
                                                                                        controller: function controller($scope, $element, $timeout) {

                                                                                                              var vm = this;

                                                                                                              $scope.item.$element = $element;

                                                                                                              var parentSchedule = $element.parents('.schedule');
                                                                                                              var scheduleItemEl = $element.children('.schedule-item');

                                                                                                              scheduleItemEl.find('container').append($compile($scope.displayTemplate)($scope));

                                                                                                              if ($scope.item.beginning.dayOfYear() !== $scope.item.end.dayOfYear() || $scope.item.locked) {
                                                                                                                                    scheduleItemEl.removeAttr('resizable');
                                                                                                                                    scheduleItemEl.removeAttr('draggable');
                                                                                                                                    scheduleItemEl.unbind('mouseover');
                                                                                                                                    scheduleItemEl.unbind('click');
                                                                                                                                    scheduleItemEl.data('lock', true);
                                                                                                              }

                                                                                                              vm.getTimeFromBoundaries = function () {

                                                                                                                                    var dayWidth = parentSchedule.find('.day').width();

                                                                                                                                    // compute element positon added to heiht of 7 hours ao avoid negative value side effect
                                                                                                                                    var topPos = scheduleItemEl.position().top + calendar.dayHeight * calendar.startOfDay;

                                                                                                                                    var startTime = moment(); //.utc();
                                                                                                                                    startTime.hour(Math.floor(topPos / calendar.dayHeight));
                                                                                                                                    startTime.minute(topPos % calendar.dayHeight * 60 / calendar.dayHeight);

                                                                                                                                    var endTime = moment(); //.utc();
                                                                                                                                    endTime.hour(Math.floor((topPos + scheduleItemEl.height()) / calendar.dayHeight));
                                                                                                                                    endTime.minute((topPos + scheduleItemEl.height()) % calendar.dayHeight * 60 / calendar.dayHeight);

                                                                                                                                    startTime.year(model.calendar.year);
                                                                                                                                    endTime.year(model.calendar.year);

                                                                                                                                    var days = $element.parents('.schedule').find('.day');
                                                                                                                                    var center = scheduleItemEl.offset().left + scheduleItemEl.width() / 2;
                                                                                                                                    var dayWidth = days.first().width();
                                                                                                                                    days.each(function (index, item) {
                                                                                                                                                          var itemLeft = $(item).offset().left;
                                                                                                                                                          if (itemLeft < center && itemLeft + dayWidth > center) {
                                                                                                                                                                                var day = index + 1;
                                                                                                                                                                                var week = model.calendar.week;
                                                                                                                                                                                endTime.week(week);
                                                                                                                                                                                startTime.week(week);
                                                                                                                                                                                if (day === 7) {
                                                                                                                                                                                                      day = 0;
                                                                                                                                                                                                      endTime.week(week + 1);
                                                                                                                                                                                                      startTime.week(week + 1);
                                                                                                                                                                                }
                                                                                                                                                                                endTime.day(day);
                                                                                                                                                                                startTime.day(day);
                                                                                                                                                          }
                                                                                                                                    });
                                                                                                                                    return {
                                                                                                                                                          startTime: startTime,
                                                                                                                                                          endTime: endTime
                                                                                                                                    };
                                                                                                              };

                                                                                                              scheduleItemEl.on('stopResize', function () {
                                                                                                                                    var newTime = vm.getTimeFromBoundaries();
                                                                                                                                    $scope.item.beginning = newTime.startTime;
                                                                                                                                    $scope.item.end = newTime.endTime;

                                                                                                                                    //$scope.item.date = newTime.startTime;
                                                                                                                                    $scope.item.startMoment = newTime.startTime;
                                                                                                                                    $scope.item.endMoment = moment(newTime.endTime);

                                                                                                                                    $scope.item.data.beginning = newTime.startTime;
                                                                                                                                    $scope.item.data.end = newTime.endTime;
                                                                                                                                    $scope.item.data.date = newTime.startTime;
                                                                                                                                    $scope.item.data.startMoment = newTime.startTime;
                                                                                                                                    $scope.item.data.endMoment = moment(newTime.endTime);

                                                                                                                                    $scope.item.startTime = moment(newTime.startTime).format('HH:mm:ss');
                                                                                                                                    $scope.item.endTime = moment(newTime.endTime).format('HH:mm:ss');

                                                                                                                                    $scope.$emit('calendar.refreshItems', $scope.item);
                                                                                                              });

                                                                                                              scheduleItemEl.on('stopDrag', function () {

                                                                                                                                    var newTime = vm.getTimeFromBoundaries();

                                                                                                                                    //concerve same duration on drag/drop
                                                                                                                                    var duration = $scope.item.end.diff($scope.item.beginning);
                                                                                                                                    newTime.endTime = moment(newTime.startTime).add(duration);

                                                                                                                                    $scope.item.beginning = newTime.startTime;
                                                                                                                                    $scope.item.end = newTime.endTime;

                                                                                                                                    $scope.item.date = newTime.startTime;
                                                                                                                                    $scope.item.startMoment = newTime.startTime;
                                                                                                                                    $scope.item.endMoment = moment(newTime.endTime);

                                                                                                                                    $scope.item.data.beginning = newTime.startTime;
                                                                                                                                    $scope.item.data.end = newTime.endTime;
                                                                                                                                    $scope.item.data.date = newTime.startTime;
                                                                                                                                    $scope.item.data.startMoment = newTime.startTime;
                                                                                                                                    $scope.item.data.endMoment = moment(newTime.endTime);

                                                                                                                                    $scope.item.startTime = moment(newTime.startTime).format('HH:mm:ss');
                                                                                                                                    $scope.item.endTime = moment(newTime.endTime).format('HH:mm:ss');

                                                                                                                                    $scope.$emit('calendar.refreshItems', $scope.item);
                                                                                                              });
                                                                                        },

                                                                                        link: function link(scope, element, attributes) {}
                                                                  };
                                            });
                      });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        module.directive('diarySortableList', sortableDirective);
        module.directive('diarySortableElement', sortableElementDirective);

        function sortableDirective($compile) {
            return {
                restrict: 'A',
                controller: function controller() {},
                compile: function compile(element, attributes, transclude) {
                    var initialHtml = element.html();
                    return function (scope, element, attributes) {
                        scope.updateElementsOrder = function (el) {

                            var sortables = element.find('[diary-sortable-element]');
                            //sortables.removeClass('animated');

                            var elements = _.sortBy(sortables, function (el) {
                                return $(el).offset().top;
                            });

                            _.each(elements, function (item, index) {
                                var itemScope = angular.element(item).scope();
                                if (index !== itemScope.ngModel) {
                                    itemScope.ngModel = index;
                                }
                            });
                            sortables.attr('style', '');
                            scope.$apply();
                        };
                    };
                }
            };
        }

        function sortableElementDirective($parse, $timeout) {
            return {
                scope: {
                    ngModel: '=',
                    ngChange: '&'
                },
                require: '^diarySortableList',
                template: '<div ng-transclude></div>',
                transclude: true,
                link: function link(scope, element, attributes) {
                    var sortables;
                    var oldValNgModel = void 0;

                    ui.extendElement.draggable(element, {
                        lock: {
                            horizontal: true
                        },
                        mouseUp: function mouseUp() {
                            scope.$parent.updateElementsOrder(element);

                            element.on('click', function () {
                                scope.$parent.$eval(attributes.ngClick);
                            });

                            if (typeof scope.ngChange === 'function') {
                                scope.ngChange();
                            }
                        },
                        startDrag: function startDrag() {
                            sortables = element.parents('[diary-sortable-list]').find('[diary-sortable-element]');
                            sortables.attr('style', '');
                            setTimeout(function () {
                                sortables.addClass('animated');
                            }, 20);
                            element.css({
                                'z-index': 1000
                            });
                            element.width(element.outerWidth());
                        },
                        tick: function tick() {
                            var moved = [];
                            sortables.each(function (index, sortable) {
                                if (element[0] === sortable) {
                                    return;
                                }
                                var sortableTopDistance = $(sortable).offset().top - parseInt($(sortable).css('margin-top'));
                                if (element.offset().top + element.height() / 2 > sortableTopDistance && element.offset().top + element.height() / 2 < sortableTopDistance + $(sortable).height()) {
                                    $(sortable).css({
                                        'margin-top': element.height()
                                    });
                                    moved.push(sortable);
                                }
                                //first widget case
                                if (element.offset().top + element.height() / 2 - 2 < sortableTopDistance && index === 0) {
                                    $(sortable).css({
                                        'margin-top': element.height()
                                    });
                                    moved.push(sortable);
                                }
                            });
                            sortables.each(function (index, sortable) {
                                if (moved.indexOf(sortable) === -1) {
                                    $(sortable).css({
                                        'margin-top': 0 + 'px'
                                    });
                                }
                            });
                        }
                    });
                }
            };
        }
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        module.directive('diaryTooltip', directive);

        var tooltip;
        function directive($compile) {
            //create one unique dom element to manage the tooltips
            if (!tooltip) {
                tooltip = $('<div />').addClass('diarytooltip').appendTo('body');
            }
            return {
                restrict: 'A',
                link: function link(scope, element, attributes) {
                    /*if (ui.breakpoints.tablette >= $(window).width()) {
                        return;
                    }*/
                    var tooltip = $('<div class="tooltip"/>').appendTo('body');
                    var position;

                    //create throttled function show
                    var showThrottled = _.throttle(function () {
                        if (!attributes.diaryTooltip || attributes.diaryTooltip === 'undefined') {
                            return;
                        }
                        var tip = tooltip.html($compile('<div class="arrow"></div><div class="content">' + lang.translate(attributes.diaryTooltip) + '</div> ')(scope));
                        position = {
                            top: parseInt(element.offset().top + element.height()),
                            left: parseInt(element.offset().left + element.width() / 2 - tip.width() / 2)
                        };
                        if (position.top < 5) {
                            position.top = 5;
                        }
                        if (position.left < 5) {
                            position.left = 5;
                        }

                        tooltip.css("top", position.top);
                        tooltip.css("left", position.left);

                        tooltip.fadeIn(100);
                    });
                    //bind show function
                    element.bind('mouseover', showThrottled);

                    //create debounced function hide
                    var hideDebounced = _.debounce(function () {
                        tooltip.fadeOut(100);
                    }, 100);
                    //bind leave function
                    element.bind('mouseleave', hideDebounced);

                    //free on detraoy element & handlers
                    scope.$on("$destroy", function () {
                        if (tooltip) {
                            tooltip.remove();
                        }
                        element.off();
                    });
                }
            };
        }
    });
})();

'use strict';

/**
 * Date calendar pattern for url date parsing
 * @type {string}
 */
var CAL_DATE_PATTERN = "YYYY-MM-DD";

/**
 *
 * @param $scope
 * @param template
 * @param model
 * @param route
 * @param $location
 * @constructor
 */
function DiaryController($scope, $rootScope, template, model, route, $location, $window, CourseService, AudienceService, LessonService, SecureService, constants, $sce) {

    model.CourseService = CourseService;
    model.LessonService = LessonService;
    $scope.constants = constants;
    $scope.RIGHTS = constants.RIGHTS;

    $scope.currentErrors = [];

    $scope.data = {
        tabSelected: 'lesson'
    };

    $scope.tabs = {
        createLesson: 'lesson'
    };

    $rootScope.redirect = function (path) {
        $location.path(path);
    };

    $rootScope.trusthtml = function (txt) {
        return $sce.trustAsHtml(txt);
    };

    $rootScope.validationError = function (e) {
        if (typeof e !== 'undefined') {
            notify.error(e.error);
            $rootScope.currentErrors = [];
            $rootScope.currentErrors.push(e);
            $rootScope.$apply();
        }
    };

    $scope.lessonDescriptionIsReadOnly = false;
    $scope.homeworkDescriptionIsReadOnly = false;

    $scope.calendarLoaded = false;
    /**
     * Used when refreshing calendar
     * @type {boolean}
     */
    $scope.showCal = false;
    /**
     * If false hides the grid/content of calendar,
     * only remains the days at top
     * @type {boolean}
     */
    $scope.showCalGrid = true;
    // for static access to some global function
    $scope.newLesson = new Lesson();
    $scope.newHomework = new Homework();
    $scope.newPedagogicItem = new PedagogicItem();

    // variables for show list
    $scope.pedagogicLessonsSelected = new Array();
    $scope.pedagogicHomeworksSelected = new Array();

    $scope.getStaticItem = function (itemType) {
        if ($scope.display.showList == true) {
            $scope.newPedagogicItem.type_item = itemType;
            return $scope.newPedagogicItem;
        } else if (itemType === "lesson") {
            return $scope.newLesson;
        } else {
            return $scope.newHomework;
        }
    };

    $scope.confirmPanel = {
        item: undefined
    };

    $scope.display = {
        showPanel: false,
        showShareLessonPanel: false,
        showShareHomeworkPanel: false,
        showList: false,
        hideHomeworkPanel: false,
        hideCalendar: false
    };

    $scope.lessons = model.lessons;
    $scope.audiences = model.audiences;
    $scope.subjects = model.subjects;
    $scope.homeworkTypes = model.homeworkTypes;
    $scope.homeworks = model.homeworks;
    $scope.homeworksLoad = model.homeworksLoad;
    $scope.childs = model.childs;
    $scope.child = model.child;
    $scope.pedagogicDays = model.pedagogicDays;

    // Says whether or not current user can edit homework & lesson
    $scope.isLessonHomeworkEditable = model.canEdit();

    // Says whether or not current user is a teacher
    $scope.isUserTeacher = model.isUserTeacher();

    // Says whether or not current user is a parent
    $scope.isUserParent = model.isUserParent();

    $scope.searchForm = model.searchForm;

    // variable used to track number of call back calls (see publishCB)
    $scope.cbCount = 0;

    $scope.selectedDueDate = undefined; // date selected in list view. It can allow to init homework on a different due_date.

    initAudiences();
    route({
        manageVisaView: function manageVisaView(params) {
            template.open('main', 'visa-manager');
        },
        progressionEditLesson: function progressionEditLesson(params) {
            template.open('main', 'progression-edit-lesson');
        },
        progressionManagerView: function progressionManagerView(params) {
            template.open('main', 'progression-manager');
        },
        createLessonView: function createLessonView(params) {
            //$scope.lesson = null;
            $scope.lessonDescriptionIsReadOnly = false;
            $scope.homeworkDescriptionIsReadOnly = false;
            //$scope.openLessonView(null, params);

            template.open('main', 'main');
            if (SecureService.hasRight(constants.RIGHTS.CREATE_LESSON)) {
                template.open('main-view', 'create-lesson');
            }
        },
        createHomeworkView: function createHomeworkView() {
            $scope.homework = null;
            $scope.homeworkDescriptionIsReadOnly = false;
            $scope.openHomeworkView(null);
        },
        editLessonView: function editLessonView(params) {
            template.open('main', 'main');
            if (SecureService.hasRight(constants.RIGHTS.CREATE_LESSON)) {
                template.open('main-view', 'create-lesson');
            } else {
                template.open('main-view', 'view-lesson');
            }
        },
        editHomeworkView: function editHomeworkView(params) {
            loadHomeworkFromRoute(params);
        },
        calendarView: function calendarView(params) {
            template.open('main', 'main');
            template.open('main-view', 'calendar');
            template.open('daily-event-details', 'daily-event-details');
        },
        listView: function listView() {
            //$scope.lesson = null;
            $scope.homework = null;
            $scope.pedagogicLessonsSelected = [];
            $scope.pedagogicHomeworksSelected = [];
            $scope.showList();
        },
        mainView: function mainView() {
            if ($scope.display.showList) {
                $scope.goToListView(null);
            } else {
                $scope.goToCalendarView(null);
            }
        }
    });

    $scope.setLessonDescriptionMode = function (homeworkId) {
        if ($scope.lessonDescriptionIsReadOnly) {
            $scope.lessonDescriptionIsReadOnly = false;
        } else {
            $scope.lessonDescriptionIsReadOnly = true;
        }
    };

    /**
        * Permet de switcher entre l'aperçu  et l'édition de la description d'un devoir d'une leçon
        */
    $scope.changeHomeworkDescriptionMode = function (homeworkId, apercu) {
        var editor = $('#edit_' + homeworkId);
        var ro = $('#descr_' + homeworkId);
        var btnApercu = $('#btn_apercu_' + homeworkId);
        var btnEdit = $('#btn_edit_' + homeworkId);

        if (apercu) {
            editor.hide();
            btnApercu.hide();
            ro.show();
            btnEdit.show();
        } else {
            ro.hide();
            btnEdit.hide();
            editor.show();
            btnApercu.show();
        }
    };

    /**
     * Permet d'afficher un aperçu de la description d'une leçon en readonly
     */
    $scope.setLessonDescriptionMode = function () {
        if ($scope.lessonDescriptionIsReadOnly) {
            $scope.lessonDescriptionIsReadOnly = false;
        } else {
            $scope.lessonDescriptionIsReadOnly = true;
        }
    };

    /**
     * Permet d'afficher un aperçu de la description d'un TAF en readonly
     */
    $scope.setHomeworkDescriptionMode = function () {
        if ($scope.homeworkDescriptionIsReadOnly) {
            $scope.homeworkDescriptionIsReadOnly = false;
        } else {
            $scope.homeworkDescriptionIsReadOnly = true;
        }
    };

    // Navigation
    $scope.showList = function () {
        $scope.display.showList = true;
        if ($scope.isUserTeacher) {
            model.searchForm.initForTeacher();
        } else {
            model.searchForm.initForStudent();
        }

        $scope.selectedDueDate = undefined;
        model.pedagogicDays.syncPedagogicItems($scope.openListView, $rootScope.validationError);
    };

    $scope.openListView = function () {
        if (!$scope.isUserTeacher) {
            model.initSubjects();
        } else {
            model.initSubjects();
        }
        template.open('main', 'main');
        template.open('main-view', 'list-view');
        $scope.$apply();
    };

    /**
     *
     * @param pedagogicItem
     * @param newWindow if true will open item detail in new windows else in same window
     */
    $scope.goToItemDetail = function (pedagogicItem, newWindow) {
        var url = "";

        if (pedagogicItem.type_item === 'lesson') {
            url = "/editLessonView/" + pedagogicItem.id + "/";
        } else {
            // open lesson view if homework is attached to a lesson
            if (pedagogicItem.lesson_id) {
                // set default tab to homework tab
                $scope.tabs.createLesson = 'homeworks';
                url = "/editLessonView/" + pedagogicItem.lesson_id + "/" + pedagogicItem.id;
            } else {
                url = "/editHomeworkView/" + pedagogicItem.id;
            }
        }

        if (newWindow) {
            $window.open('/diary#' + url);
        } else {
            $location.url(url);
        }
    };

    //list-view interactions
    $scope.selectDay = function (day) {
        model.unselectDays();
        day.selected = true;
        $scope.selectedDueDate = moment(day.dayName, "dddd DD MMMM YYYY");
    };

    var loadHomeworkFromRoute = function loadHomeworkFromRoute(params) {
        // try find homework in current week homeworks cache
        var homework = model.homeworks.findWhere({ id: parseInt(params.idHomework) });

        if (homework != null) {
            $scope.homeworkDescriptionIsReadOnly = false;
            $scope.openHomeworkView(homework);
        }
        // load from db
        else {
                homework = new Homework();
                homework.id = parseInt(params.idHomework);

                homework.load(function () {
                    $scope.homeworkDescriptionIsReadOnly = false;
                    $scope.openHomeworkView(homework, params);
                }, function (cbe) {
                    notify.error(cbe.message);
                });
            }
    };

    $scope.openHomeworkView = function (homework, params) {

        if (homework) {
            if (!$scope.homework) {
                $scope.homework = new Homework();
            }

            $scope.homework.updateData(homework);
            $scope.newItem = {
                date: $scope.homework.date
            };
        } else {
            var dueDate = $scope.selectedDateInTheFuture();
            initHomework(dueDate);
        }

        $scope.showHomeworksLoad($scope.homework, null);

        template.open('main', 'main');
        if (!$scope.isLessonHomeworkEditable) {
            template.open('main-view', 'view-homework');
        } else {
            template.open('main-view', 'create-homework');
            template.open('homeworks-load', 'homeworks-load');
        }
    };

    /**
     * Switch to main view (list or calendar)
     * @param cb Callback function
     */
    $scope.goToMainView = function (cb) {
        $location.path('/mainView');

        if (typeof cb === 'function') {
            cb();
        }
    };

    /**
     * Go to list view
     * @param cb
     */
    $scope.goToListView = function (cb) {
        $location.path('/listView');
    };

    /**
     * Switch to calendar view
     * @param firstMonday First monday formatted as DD/MM/YYYY'
     * @param cb Callback function
     */
    $scope.goToCalendarView = function (firstMonday, cb) {

        var calendarViewPath = '/calendarView';

        if (typeof firstMonday != 'undefined' && firstMonday != null) {
            calendarViewPath += '/' + firstMonday;
        } else {
            if (model.calendar && model.calendar.week) {
                calendarViewPath += '/' + moment().week(model.calendar.week).weekday(0).format(CAL_DATE_PATTERN);
            } else {
                calendarViewPath += '/' + moment().weekday(0).format(CAL_DATE_PATTERN);
            }
        }

        $location.path(calendarViewPath);

        if (typeof cb === 'function') {
            cb();
        }
    };

    /**
     * Deletes selected items (lessons or homeworks)
     * in calendar view from database
     */
    $scope.deleteSelectedItems = function () {
        var selectedLessons = $scope.getSelectedPedagogicItems('lesson');
        var selectedHomeworks = $scope.getSelectedPedagogicItems('homework');

        if (selectedLessons.length + selectedHomeworks.length === 0) {
            notify.error('daily.nohomeworkorlesson.selected');
            return;
        }

        var selectHomeworksToBeDeleted = function selectHomeworksToBeDeleted(selectedHomeworks, selectedLessonsId) {
            return selectedHomeworks.filter(function (homework) {
                return homework.lesson_id == null || !_.contains(selectedLessonsId, homework.lesson_id);
            });
        };

        var postDelete = function postDelete() {
            notify.info('item.deleted');
            $scope.closeConfirmPanel();
            $scope.$apply();
        };

        var deleteHomeworks = function deleteHomeworks() {
            $scope.getStaticItem('homework').deleteList(homeworksToDelete, postDelete,
            // calback error function
            function (cbe) {
                notify.error(cbe.message);
            });
        };

        // remove pending delete homeworks
        // ever embedded in selected pending delete lessons
        var lessonIds = model.getItemsIds(selectedLessons);
        var homeworksToDelete = selectHomeworksToBeDeleted(selectedHomeworks, lessonIds);

        // note: associated homeworks are automatically deleted
        // sql delete cascade
        if (selectedLessons.length > 0) {
            $scope.getStaticItem('lesson').deleteList(selectedLessons, function () {
                if (homeworksToDelete.length > 0) {
                    deleteHomeworks();
                } else {
                    postDelete();
                }
            },
            // calback error function
            function (cbe) {
                notify.error(cbe.message);
            });
        } else {
            deleteHomeworks();
        }
    };

    /**
     * Open selected lesson or homework
     */
    $scope.editSelectedItem = function () {

        var selectedLessons = $scope.getSelectedPedagogicItems('lesson');
        var selectedLesson = selectedLessons.length > 0 ? selectedLessons[0] : null;

        var selectedHomeworks = $scope.getSelectedPedagogicItems('homework');
        var selectedHomework = selectedHomeworks.length > 0 ? selectedHomeworks[0] : null;

        if (selectedHomework && selectedLesson) {
            notify.error('Only one homework or lesson must be selected');
            return;
        }

        if (selectedLesson) {
            $rootScope.redirect('/editLessonView/' + selectedLesson.id + '/');
        } else if (selectedHomework) {
            // open lesson view if homework is attached to a lesson
            if (selectedHomework.lesson_id) {
                // set default tab to homework tab
                $scope.tabs.createLesson = 'homeworks';
                $rootScope.redirect('/editLessonView/' + selectedHomework.lesson_id + '/' + selectedHomework.id);
            } else {
                $rootScope.redirect('/editHomeworkView/' + selectedHomework.id);
            }
        }
    };

    /**
     * Create homework and publishes it
     * @param homework Homework being created
     * @param isPublish
     * @param goMainView
     */
    $scope.createAndPublishHomework = function (homework, isPublish, goMainView) {
        $scope.createOrUpdateHomework(goMainView, function () {
            $scope.publishHomeworkAndGoCalendarView(homework, isPublish);
        });
    };

    /**
     * un/Publish selected lessons
     */
    $scope.publishSelectedLessons = function (isPublish) {
        $scope.currentErrors = [];
        var notifyKey = isPublish ? 'item.published' : 'item.unpublished';
        $scope.publishLessons($scope.getSelectedPedagogicItems('lesson'), isPublish, notifyKey);
    };

    /**
     * Publishes or unpublishes lesson and go back to main view
     * @param lesson Lesson
     * @param isPublish if true publishes lesson else un-publishes it
     */
    $scope.publishLessonAndGoCalendarView = function (lesson, isPublish) {
        var lessons = [];
        lessons.push(lesson);
        var notifyKey = isPublish ? 'lesson.published' : 'lesson.unpublished';
        $scope.publishLessons(lessons, isPublish, notifyKey, $scope.goToMainView());
    };

    /**
     * Publish lessons
     * @param lessons Array of lessons to publish or unpublish
     * @param isPublish if true publishes the lessons else unpublishes them
     * @param cb Callback function
     * which is lesson id to delete
     */
    $scope.publishLessons = function (lessons, isPublish, notifyKey, cb) {
        $scope.currentErrors = [];
        $scope.processingData = true;

        model.publishLessons({ ids: model.getItemsIds(lessons) }, isPublish, publishCB(lessons, isPublish, notifyKey, cb), function (e) {
            $scope.processingData = false;
            $rootScope.validationError(e);
        });
    };

    /**
     * Publishes or unpublishes homework and go back to main view
     * @param homework Homework
     * @param isPublish if true publishes homework else un-publishes it
     */
    $scope.publishHomeworkAndGoCalendarView = function (homework, isPublish) {
        var homeworks = [];
        homeworks.push(homework);
        var notifyKey = isPublish ? 'item.published' : 'item.unpublished';
        $scope.publishHomeworks(homeworks, isPublish, notifyKey, $scope.goToMainView());
    };

    /**
     * Publish or un-publishes homeworks
     * @param homeworks Array of homeworks to publish or unpublish
     * @param isPublish If true publishes lesson else unpublishes it
     * @param cb Callback function
     */
    $scope.publishHomeworks = function (homeworks, isPublish, cb) {
        $scope.currentErrors = [];
        $scope.processingData = true;

        var notifyKey = isPublish ? 'item.published' : 'item.unpublished';
        model.publishHomeworks({ ids: model.getItemsIds(homeworks) }, isPublish, publishCB(homeworks, isPublish, notifyKey, cb), function (e) {
            $scope.processingData = false;
            $rootScope.validationError(e);
        });
    };

    /**
     * Callback method after publishing a lesson, homework or mixed list of items
     * @param list items to publish
     * @param toPublish If true publishes lesson else unpublishes it
     * @param notifyKey i18n key used to notify the user at the end of processing
     * @param cb calback function
     */
    var publishCB = function publishCB(list, toPublish, notifyKey, cb) {
        list.forEach(function (item) {
            item.changeState(toPublish);
        });

        $scope.cbCount--;
        $scope.closeConfirmPanel();

        if ($scope.cbCount <= 0) {
            $scope.cbCount = 0; // can't let cbCount go on negative to impact future calls.
            notify.info(notifyKey);
            if (typeof cb === 'function') {
                cb();
            }
        }
    };

    /**
     * Load homeworks for current lesson being edited
     * @param cb Callback function
     */
    $scope.loadHomeworksForCurrentLesson = function (cb) {
        console.warn("deprecated");
        return;

        // lesson not yet created do not retrieve homeworks
        if (!$scope.lesson.id) {
            return;
        }

        var needSqlSync = false;

        // if homeworks ever retrieved from db don't do it again!
        $scope.lesson.homeworks.forEach(function (homework) {
            if (!homework.loaded) {
                needSqlSync = true;
            }
        });

        // only reload homeworks if necessary
        if (needSqlSync) {
            model.loadHomeworksForLesson($scope.lesson, function () {
                if (typeof cb !== 'undefined') {
                    cb();
                }
                $scope.$apply();
            }, function (e) {
                $rootScope.validationError(e);
            });
        } else {
            if (typeof cb !== 'undefined') {
                cb();
            }
        }
    };

    // Date functions
    $scope.formatDate = function (date) {
        return $scope.formatMoment(moment(date));
    };

    $scope.formatMoment = function (moment) {
        return moment.lang('fr').format('DD/MM/YYYY');
    };

    $scope.formatTime = function (time) {
        return moment(time).lang('fr').format('H:mm');
    };

    /**
     * Close confirmation panel
     */
    $scope.closeConfirmPanel = function () {

        $scope.processingData = false;
        $scope.display.showPanel = false;
        template.close('lightbox');
    };

    /**
     * Display confirmation panel
     * @param panelContent Html confirm panel file
     * @param item Optional item
     */
    $scope.showConfirmPanel = function (panelContent, item) {
        template.open('lightbox', panelContent);
        $scope.display.showPanel = true;
        $scope.confirmPanel.item = item;
    };

    $rootScope.showConfirmPanel = $scope.showConfirmPanel;

    /**
     * Test in calendar view if there are one lesson
     * or one homework only selected (not both lessons and homeworks)
     * @returns {boolean}
     */
    $scope.isOneHomeworkOrLessonStriclySelected = function () {
        return $scope.getSelectedPedagogicItems('lesson').length + $scope.getSelectedPedagogicItems('homework').length == 1;
    };

    /**
     * Get selected items from calendar (lessons and homeworks)
     * and tidy them within un/publishable state
     */
    var getPublishableItemsSelected = function getPublishableItemsSelected() {

        var publishableSelectedLessons = [];
        var unPublishableSelectedLessons = [];
        var noStateChangeLessons = [];

        var publishableSelectedHomeworks = [];
        var unPublishableSelectedHomeworks = [];
        var noStateChangeHomeworks = []; // eg.: homework attached to a lesson

        $scope.getSelectedPedagogicItems('lesson').forEach(function (lesson) {
            if (lesson.isPublishable(true)) {
                publishableSelectedLessons.push(lesson);
            } else if (lesson.isPublishable(false)) {
                unPublishableSelectedLessons.push(lesson);
            } else {
                noStateChangeLessons.push(lesson);
            }
        });

        // only free homeworks can be published/unpublished
        $scope.getSelectedPedagogicItems('homework').forEach(function (homework) {
            if (homework.isPublishable(true)) {
                publishableSelectedHomeworks.push(homework);
            } else if (homework.isPublishable(false)) {
                unPublishableSelectedHomeworks.push(homework);
            } else {
                noStateChangeHomeworks.push(homework);
            }
        });

        return {
            publishableSelectedLessons: publishableSelectedLessons,
            unPublishableSelectedLessons: unPublishableSelectedLessons,
            noStateChangeLessons: noStateChangeLessons,
            publishableSelectedHomeworks: publishableSelectedHomeworks,
            unPublishableSelectedHomeworks: unPublishableSelectedHomeworks,
            noStateChangeHomeworks: noStateChangeHomeworks
        };
    };

    $scope.publishSelectedItems = function (toPublish) {

        var itemsToBePublished = getPublishableItemsSelected();
        var homeworks = toPublish ? itemsToBePublished.publishableSelectedHomeworks : itemsToBePublished.unPublishableSelectedHomeworks;
        var lessons = toPublish ? itemsToBePublished.publishableSelectedLessons : itemsToBePublished.unPublishableSelectedLessons;

        var notifyKey = toPublish ? 'item.published' : 'item.unpublished';
        $scope.processingData = true;
        var cbCount = (lessons.length > 0 ? 1 : 0) + (homeworks.length > 0 ? 1 : 0);
        $scope.cbCount = cbCount;

        if (lessons.length > 0) {
            model.publishLessons({ ids: model.getItemsIds(lessons) }, toPublish, publishCB(lessons, toPublish, notifyKey), function (cbe) {
                notify.error(cbe.message);
            });
        }

        if (homeworks.length > 0) {
            model.publishHomeworks({ ids: model.getItemsIds(homeworks) }, toPublish, publishCB(homeworks, toPublish, notifyKey), function (cbe) {
                notify.error(cbe.message);
            });
        }
    };

    $scope.getItemsPublishableSelectedCount = function (toPublish) {

        var itemsSelected = getPublishableItemsSelected();

        if (toPublish) {
            return itemsSelected.publishableSelectedLessons.length + itemsSelected.publishableSelectedHomeworks.length;
        } else {
            return itemsSelected.unPublishableSelectedLessons.length + itemsSelected.unPublishableSelectedHomeworks.length;
        }
    };

    /**
     * Telles whether it is possible to publish or not selected items.
     * It depends of type of items selected and current state
     * @param toPublish
     * @returns {boolean} true if selected items can be published
     * and are not ever in publish state otherwise false
     */
    $scope.hasPublishableOnlyItemsSelected = function (toPublish) {
        var itemsSelected = getPublishableItemsSelected();

        var publishableLessons = itemsSelected.publishableSelectedLessons;
        var unpublishableLessons = itemsSelected.unPublishableSelectedLessons;
        var noStateChangeLessons = itemsSelected.noStateChangeLessons;

        var publishableHomeworks = itemsSelected.publishableSelectedHomeworks;
        var unpublishableHomeworks = itemsSelected.unPublishableSelectedHomeworks;
        var noStateChangeHomeworks = itemsSelected.noStateChangeHomeworks;

        if (noStateChangeLessons.length > 0 || noStateChangeHomeworks.length > 0) {
            return false;
        }

        if (toPublish) {
            // nothing selected
            if (publishableLessons.length + publishableHomeworks.length == 0) {
                return false;
            } else {
                var noUnpublishableItems = unpublishableHomeworks.length == 0 && unpublishableLessons.length == 0;
                return publishableLessons.length > 0 && noUnpublishableItems || publishableHomeworks.length > 0 && noUnpublishableItems;
            }
        } else {
            // nothing selected
            if (unpublishableLessons.length + unpublishableHomeworks.length == 0) {
                return false;
            } else {
                var noPublishableItems = publishableLessons.length == 0 && publishableHomeworks.length == 0;
                return unpublishableLessons.length > 0 && noPublishableItems || unpublishableHomeworks.length > 0 && noPublishableItems;
            }
        }
    };

    var getSelectedHomeworks = function getSelectedHomeworks() {
        return model.homeworks.selection();
    };

    var getSelectedLessons = function getSelectedLessons() {
        return model.lessons.selection();
    };

    $scope.toggleShowHomeworkInLesson = function (homework) {
        homework.expanded = !homework.expanded;
    };

    $scope.deleteHomeworkAndCloseConfirmPanel = function (homework, lesson) {
        $scope.deleteHomework(homework, lesson, function () {
            $scope.closeConfirmPanel();
        });
    };

    /**
     * Deletes an homework
     * @param cb Callback function
     * @param homework Homework to be deleted
     * @param lesson Lesson attached to homework (optional)
     */
    $scope.deleteHomework = function (homework, lesson, cb) {

        homework.delete(lesson, function () {
            notify.info('homework.deleted');
            $scope.$apply();

            if (typeof cb === 'function') {
                cb();
            }
        }, function (e) {
            $rootScope.validationError(e);
        });
    };

    $scope.createOrUpdateHomework = function (goToMainView, cb) {

        $scope.currentErrors = [];
        if ($scope.newItem) {
            $scope.homework.dueDate = $scope.newItem.date;
        }

        var postHomeworkSave = function postHomeworkSave() {
            //$scope.showCal = !$scope.showCal;
            notify.info('homework.saved');
            $scope.homework.audience = model.audiences.findWhere({ id: $scope.homework.audience.id });
            $scope.$apply();

            if (typeof cb === 'function') {
                cb();
            }

            if (goToMainView) {
                $scope.goToMainView();
                $scope.lesson = null;
                $scope.homework = null;
            }
        };

        $scope.homework.save(function () {
            if (this.lesson_id) {
                syncHomeworks(postHomeworkSave);
            } else {
                syncLessonsAndHomeworks(postHomeworkSave);
            }
        }, function (e) {
            $rootScope.validationError(e);
        });
    };

    /**
     * Refresh homework load for all homeworks of current lesson
     */
    $scope.refreshHomeworkLoads = function (lesson) {

        $scope.countdown = lesson.homeworks.all.length;

        lesson.homeworks.all.forEach(function (homework) {
            model.loadHomeworksLoad(homework, moment(homework.date).format("YYYY-MM-DD"), lesson.audience.id, applyScopeOnFinish);
        });
    };

    var applyScopeOnFinish = function applyScopeOnFinish() {
        $scope.countdown--;

        if ($scope.countdown == 0) {
            $scope.$apply();
        }
    };

    var decrementCountdown = function decrementCountdown(bShowTemplates, cb) {
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

    var showTemplates = function showTemplates() {
        template.open('main', 'main');
        template.open('main-view', 'calendar');
        template.open('create-lesson', 'create-lesson');
        template.open('create-homework', 'create-homework');
        template.open('daily-event-details', 'daily-event-details');
        template.open('daily-event-item', 'daily-event-item');
        //$scope.$apply();
    };

    /**
     * Refresh calendar view for current week
     */
    $scope.refreshCalendarCurrentWeek = function () {
        $scope.show(moment(model.calendar.firstDay));
    };

    $scope.addHomeworkToLesson = function (lesson) {
        lesson.addHomework(lesson);
    };

    $scope.getPedagogicItemSelectedCount = function () {
        return $scope.getSelectedPedagogicItems('lesson').length + $scope.getSelectedPedagogicItems('homework').length;
    };

    // gets the selected date from pedagogic items but can't be in the past.
    $scope.selectedDateInTheFuture = function () {
        var date = model.selectedPedagogicDate();
        return moment().min(moment(date), moment()).format("YYYY-MM-DD"); // see moment.js doc on min pre 2.7.0 version (highly confusing !)
    };

    /**
    * update pedagogic items selected
    */
    $scope.updatePedagogicItemsSelected = function (itemType) {
        var selectedItems = new Array();
        model.pedagogicDays.forEach(function (day) {
            selectedItems = selectedItems.concat(day.pedagogicItemsOfTheDay.filter(function (item) {
                return item && item.type_item === itemType && item.selected;
            }));
        });

        if (itemType === 'homework') {
            $scope.pedagogicHomeworksSelected = selectedItems;
        } else {
            $scope.pedagogicLessonsSelected = selectedItems;
        }
    };

    /**
    * get selected pedagogic items from item type
    */
    $scope.getSelectedPedagogicItems = function (itemType) {

        // share from lesson view
        if ($scope.viewedLessonToShare) {
            return $scope.viewedLessonToShare;
        }
        // share from homework view
        else if ($scope.viewedHomeworkToShare) {
                return $scope.viewedHomeworkToShare;
            }

        // list view
        if ($scope.display.showList == true) {
            if (itemType === 'homework') {
                return $scope.pedagogicHomeworksSelected;
            } else {
                return $scope.pedagogicLessonsSelected;
            }
        }
        // calendar view
        else {
                if (itemType === 'homework') {
                    return getSelectedHomeworks();
                } else {
                    return getSelectedLessons();
                }
            }
    };

    /**
     * Init homework object on create
     * @param dueDate if set the dueDate of the homework
     */
    var initHomework = function initHomework(dueDate) {
        $scope.homework = model.initHomework(dueDate);
        $scope.newItem = {
            date: $scope.homework.date
        };
    };

    /**
     * Minify the homework panel or not
     * If it's minified, will only show one max homework
     * else 3
     */
    //TODO unused?
    /*  $scope.toggleHomeworkPanelMinified = function(){
          $scope.display.bShowHomeworksMinified = model.show.bShowHomeworksMinified;
          model.placeCalendarAndHomeworksPanel(model.show.bShowCalendar, model.show.bShowHomeworks, !model.show.bShowHomeworksMinified);
      };
      */

    $scope.toggleFilterOnHomework = function () {
        $scope.searchForm.displayHomework = model.searchForm.displayHomework;
        model.searchForm.displayHomework = !model.searchForm.displayHomework;
    };

    $scope.toggleFilterOnLesson = function () {
        $scope.searchForm.displayLesson = model.searchForm.displayLesson;
        model.searchForm.displayLesson = !model.searchForm.displayLesson;
    };

    $scope.performPedagogicItemSearch = function () {
        model.performPedagogicItemSearch($scope.searchForm.getSearch(), $scope.isUserTeacher, $scope.openListView, $rootScope.validationError);
    };

    /*
    $scope.loadMorePreviousLessonsFromLesson = function (currentLesson) {
        model.getPreviousLessonsFromLesson(currentLesson, true, function(){$scope.$apply()}, $rootScope.validationError);
    };
    */

    /**
     * Load previous lessons data from current lesson being edited
     * @param currentLesson Current lesson being edited
     */
    $scope.loadPreviousLessonsFromLesson = function (currentLesson) {
        model.getPreviousLessonsFromLesson(currentLesson, false, function () {
            $scope.$apply();
        }, $rootScope.validationError);
    };

    $scope.itemTypesDisplayed = function (item) {
        if (item.type_item == "lesson" && $scope.searchForm.displayLesson || item.type_item == "homework" && $scope.searchForm.displayHomework) {
            return true;
        }
        return false;
    };

    /**
     * Opens the share lesson panel
     * seee main;html -> getSelectedPedagogicItems
     * @param item
     */
    $scope.openShareLessonPanel = function (viewedLesson) {

        $scope.viewedHomeworkToShare = null;

        if (viewedLesson) {
            $scope.viewedLessonToShare = new Array();
            $scope.viewedLessonToShare.push(viewedLesson);
        } else {
            $scope.viewedLessonToShare = null;
        }

        $scope.display.showShareLessonPanel = true;
    };

    /**
     * Open the share homework panel
     * see main.html -> getSelectedPedagogicItems
     */
    $scope.openShareHomeworkPanel = function (viewedHomework) {

        $scope.viewedLessonToShare = null;

        if (viewedHomework) {
            $scope.viewedHomeworkToShare = new Array();
            $scope.viewedHomeworkToShare.push(viewedHomework);
        } else {
            $scope.viewedHomeworkToShare = null;
        }
        $scope.display.showShareHomeworkPanel = true;
    };

    /**
     * Display homework load for current homework
     * @param forcedDate Date in millis since 1970-1-1
     * @param homework
     */
    $scope.showHomeworksLoad = function (homework, forcedDate, callback) {

        var cb; //= function (){};

        if (callback) {
            if (typeof callback === 'function') {
                cb = callback;
            }
        }

        var callbackErrorFunc = function callbackErrorFunc() {
            // TODO propagate error to front
        };

        var date = forcedDate ? forcedDate : homework.date;
        var formattedDate = moment(date).format("YYYY-MM-DD");

        model.loadHomeworksLoad(homework, formattedDate, homework.audience.id, cb, callbackErrorFunc);
    };

    $scope.isHighHomeworkLoad = function (homeworkLoad) {
        return homeworkLoad.countLoad > 2;
    };

    $scope.isLowHomeworkLoad = function (homeworkLoad) {
        return homeworkLoad.countLoad == 1;
    };

    $scope.isMediumHomeworkLoad = function (homeworkLoad) {
        return homeworkLoad.countLoad == 2;
    };

    $scope.isNoHomeworkLoad = function (homeworkLoad) {
        return homeworkLoad.countLoad == 0;
    };

    $scope.displayPreviousLessonsTabAndLoad = function (lesson) {
        console.warn("deprecated");
        return;
        $scope.tabs.createLesson = 'previouslessons';
        $scope.loadPreviousLessonsFromLesson(lesson);
    };

    /**
     * Show more previous lessons.
     * By default number of previous lessons is 3.
     * Will increase displayed previous lesson by 3.
     */
    //TODO remove
    $scope.showMorePreviousLessons = function (lesson) {
        console.log("error not used");
        return;
        var displayStep = 3;
        lesson.previousLessonsDisplayed = lesson.previousLessons.slice(0, Math.min(lesson.previousLessons.length, lesson.previousLessonsDisplayed.length + displayStep));
    };

    function initAudiences() {
        model.audiences.all = [];
        //var nbStructures = model.me.structures.length;

        model.currentSchool = model.me.structures[0];

        AudienceService.getAudiences(model.me.structures).then(function (audiences) {
            model.audiences.addRange(audiences);
            model.audiences.trigger('sync');
            model.audiences.trigger('change');
            if (typeof cb === 'function') {
                cb();
            }
        });
    }
}

;'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("CalendarController", controller);

        function controller($scope, $rootScope, $timeout, CourseService, $routeParams, constants, $location, HomeworkService, UtilsService, LessonService, $q, SubjectService, ModelWeekService, SecureService) {

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
                $scope.$on('calendar.refreshItems', function (_, item) {
                    item.calendarUpdate();
                });
            }

            //watch delete or add
            $scope.$watch(function () {
                if (model && model.lessons && model.lessons.all) {
                    return model.lessons.all.length;
                } else {
                    return 0;
                }
            }, function () {
                $scope.itemsCalendar = [].concat(model.lessons.all).concat($scope.courses);
            });

            $scope.$watch('routeParams', function (n, o) {

                var mondayOfWeek = moment();
                // mondayOfWeek as string date formatted YYYY-MM-DD
                if ($scope.routeParams.mondayOfWeek) {
                    mondayOfWeek = moment($scope.routeParams.mondayOfWeek);
                } else {
                    if (model.mondayOfWeek) {
                        mondayOfWeek = model.mondayOfWeek;
                    } else {
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
            $scope.nextWeek = function () {
                var nextMonday = moment($scope.mondayOfWeek).add(7, 'd');
                $location.path('/calendarView/' + nextMonday.format(constants.CAL_DATE_PATTERN));
            };

            /**
             * Opens the previous week view of calendar
             */
            $scope.previousWeek = function () {
                var nextMonday = moment($scope.mondayOfWeek).add(-7, 'd');
                $location.path('/calendarView/' + nextMonday.format(constants.CAL_DATE_PATTERN));
            };

            /**
             * Load related data to lessons and homeworks from database
             * @param cb Callback function
             * @param bShowTemplates if true loads calendar templates after data loaded
             * might be used when
             */
            var initialization = function initialization(bShowTemplates, cb) {

                // will force quick search panel to load (e.g: when returning to calendar view)
                // see ng-extensions.js -> quickSearch directive
                model.lessonsDropHandled = false;
                model.homeworksDropHandled = false;

                $scope.countdown = 2;

                // auto creates diary.teacher
                if ("ENSEIGNANT" === model.me.type) {
                    var teacher = new Teacher();
                    teacher.create(decrementCountdown(bShowTemplates, cb), $rootScope.validationError);
                } else {
                    decrementCountdown(bShowTemplates, cb);
                }

                // subjects and audiences needed to fill in
                // homeworks and lessons props

                model.childs.syncChildren(function () {
                    $scope.child = model.child;
                    $scope.children = model.childs;
                    SubjectService.getCustomSubjects(model.isUserTeacher()).then(function (subjects) {
                        model.subjects.all = [];
                        if (subjects) {
                            model.subjects.addRange(subjects);
                        }
                    }).then(function () {
                        decrementCountdown(bShowTemplates, cb);
                        model.homeworkTypes.syncHomeworkTypes(function () {
                            // call lessons/homework sync after audiences sync since
                            // lesson and homework objects needs audience data to be built
                            refreshDatas(UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, model.isUserParent, model.child ? model.child.id : undefined);
                        }, $rootScope.validationError);
                    }, $rootScope.validationError);
                });
            };

            var decrementCountdown = function decrementCountdown(bShowTemplates, cb) {
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
            $scope.showCalendar = function (mondayOfWeek) {
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

                //$scope.lesson = null;
                //$scope.homework = null;


                refreshDatas(UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, model.isUserParent, model.child ? model.child.id : undefined);
            };

            function refreshDatas(structureIds, mondayOfWeek, isUserParent, childId) {

                var p1 = LessonService.getLessons(structureIds, mondayOfWeek, isUserParent, childId);
                var p2 = HomeworkService.getHomeworks(structureIds, mondayOfWeek, isUserParent, childId);

                //dont load courses if is not at teacher
                var p3 = $q.when([]);
                var p4 = $q.when([]);
                if (model.isUserTeacher()) {
                    //TODO use structureIds
                    p3 = CourseService.getMergeCourses(model.me.structures[0], model.me.userId, mondayOfWeek);
                    if (SecureService.hasRight(constants.RIGHTS.MANAGE_MODEL_WEEK)) {
                        p4 = ModelWeekService.getModelWeeks();
                    }
                }

                return $q.all([p1, p2, p3, p4]).then(function (results) {
                    var lessons = results[0];
                    var homeworks = results[1];
                    $scope.courses = results[2];
                    $scope.modelWeeks = results[3];

                    var p = void 0;
                    if (!$scope.courses || $scope.courses.length === 0) {
                        p = ModelWeekService.getCoursesModel($scope.mondayOfWeek).then(function (modelCourses) {
                            $scope.courses = modelCourses;
                        });
                    } else {
                        p = $q.when();
                    }

                    p.then(function () {
                        model.lessons.all.splice(0, model.lessons.all.length);
                        model.lessons.addRange(lessons);
                        model.homeworks.all.splice(0, model.homeworks.all.length);
                        model.homeworks.addRange(homeworks);
                        $scope.itemsCalendar = [].concat(model.lessons.all).concat($scope.courses);
                    });
                });
            }

            $scope.setChildFilter = function (child, cb) {

                $scope.children.forEach(function (theChild) {
                    theChild.selected = theChild.id === child.id;
                });

                child.selected = true;
                $scope.child = child;
                model.child = child;

                refreshDatas(UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, true, child.id);
            };

            $scope.showCalendarForChild = function (child) {
                $scope.setChildFilter(child);
            };

            var showTemplates = function showTemplates() {
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

                if (!$scope.display.bShowHomeworks && !$scope.display.bShowCalendar) {
                    $scope.display.bShowCalendar = true;
                }
            };

            /**
             * Display/hide calendar
             */
            $scope.toggleCalendar = function () {
                $scope.display.bShowCalendar = !$scope.display.bShowCalendar;
                if (!$scope.display.bShowHomeworks && !$scope.display.bShowCalendar) {
                    $scope.display.bShowHomeworks = true;
                }
            };

            $scope.setModel = function (alias) {
                ModelWeekService.setModelWeek(alias, $scope.mondayOfWeek).then(function (modelWeek) {
                    refreshDatas(UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, model.isUserParent, model.child ? model.child.id : undefined);
                });

                notify.info(lang.translate('diary.model.week.choice.effective') + " " + alias);
            };

            $scope.invert = function () {
                ModelWeekService.invertModelsWeek().then(function () {
                    refreshDatas(UtilsService.getUserStructuresIdsAsString(), $scope.mondayOfWeek, model.isUserParent, model.child ? model.child.id : undefined).then(function () {
                        notify.info('diary.model.week.invert.effective');
                    });
                });
            };

            $scope.redirect = function (path) {
                $location.path(path);
            };
        }
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("EditLessonController", controller);

        function controller($scope, $rootScope, $routeParams, PedagogicItemService, constants, $q, SubjectService) {

            var vm = this;

            init();

            function init() {
                //existing lesson
                $q.all([
                //need subjects
                loadSubjects(),
                //need homework types
                loadHomeworkTypes()]).then(function () {
                    if ($routeParams.idLesson) {
                        model.newLesson = null;
                        loadExistingLesson();
                    } else if (model.newLesson) {
                        createNewLessonFromPedagogicItem();
                    } else if ($routeParams.progressionId) {
                        //show the EditProgressionLessonController
                        loadNewLesson();
                        return;
                    } else {
                        //new lesson
                        loadNewLesson();
                    }

                    $scope.data.tabSelected = 'lesson';

                    //add watch on selection
                    $scope.$watch('lesson.audience', function () {
                        if (vm.lesson && vm.lesson.previousLessons) {
                            $scope.loadPreviousLessonsFromLesson(vm.lesson);
                        }
                    });
                    //add watch on selection
                    $scope.$watch('lesson.subject', function () {
                        if (vm.lesson && vm.lesson.previousLessons) {
                            $scope.loadPreviousLessonsFromLesson(vm.lesson);
                        }
                    });
                });
            }

            function loadHomeworkTypes() {
                if (!model.homeworkTypes || !model.homeworkTypes.all || model.homeworkTypes.all.length === 0) {
                    model.homeworkTypes.syncHomeworkTypes(function () {
                        return $q.when();
                    }, $rootScope.validationError);
                } else {
                    return $q.when();
                }
            }

            function loadSubjects() {
                if (!model.subjects || !model.subjects.all || model.subjects.all.length === 0) {
                    console.log("no subjects founds");
                    return SubjectService.getCustomSubjects(model.isUserTeacher()).then(function (subjects) {
                        model.subjects.all = [];
                        if (subjects) {
                            model.subjects.addRange(subjects);
                        }
                    });
                } else {
                    return $q.when();
                }
            }

            function createNewLessonFromPedagogicItem() {
                vm.lesson = model.newLesson;
                model.newLesson = null;
                //$scope.newItem = vm.lesson.newItem;
                populateExistingLesson();
            }

            function populateExistingLesson() {
                $scope.tabs.createLesson = $routeParams.idHomework ? 'homeworks' : 'lesson';
                $scope.tabs.showAnnotations = false;

                // open existing lesson for edit

                vm.lesson.previousLessonsLoaded = false; // will force reload
                $scope.newItem = {
                    date: moment(vm.lesson.date),
                    beginning: vm.lesson.startMoment, //moment(vm.lesson.beginning),
                    end: vm.lesson.endMoment //moment(vm.lesson.end)
                };

                $scope.loadHomeworksForCurrentLesson(function () {
                    vm.lesson.homeworks.forEach(function (homework) {
                        if (vm.lesson.homeworks.length || $routeParams.idHomework && $routeParams.idHomework == homework.id) {
                            homework.expanded = true;
                        }

                        model.loadHomeworksLoad(homework, moment(homework.date).format("YYYY-MM-DD"), vm.lesson.audience.id);
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
                vm.lesson = lesson;
                lesson.load(true, function () {
                    populateExistingLesson();
                }, function (cbe) {
                    notify.error(cbe.message);
                });
            }

            function loadNewLesson() {
                var selectedDate = $scope.selectedDateInTheFuture();

                vm.lesson = model.initLesson("timeFromCalendar" === $routeParams.timeFromCalendar, selectedDate);
                $scope.newItem = vm.lesson.newItem;
            }
            /**
             * Load homeworks for current lesson being edited
             * @param cb Callback function
             */
            $scope.loadHomeworksForCurrentLesson = function (cb) {

                // lesson not yet created do not retrieve homeworks
                if (!vm.lesson.id) {
                    return;
                }

                var needSqlSync = false;

                // if homeworks ever retrieved from db don't do it again!
                vm.lesson.homeworks.forEach(function (homework) {
                    if (!homework.loaded) {
                        needSqlSync = true;
                    }
                });

                // only reload homeworks if necessary
                if (needSqlSync) {
                    model.loadHomeworksForLesson(vm.lesson, function () {
                        if (typeof cb !== 'undefined') {
                            cb();
                        }
                        $scope.$apply();
                    }, function (e) {
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
            $scope.createOrUpdateLesson = function (goMainView, cb) {

                $scope.currentErrors = [];

                vm.lesson.startTime = $scope.newItem.beginning;
                vm.lesson.endTime = $scope.newItem.end;
                vm.lesson.date = $scope.newItem.date;

                vm.lesson.save(function () {
                    notify.info('lesson.saved');
                    vm.lesson.audience = model.audiences.findWhere({
                        id: vm.lesson.audience.id
                    });
                    if (goMainView) {
                        $scope.goToMainView();
                        vm.lesson = null;
                        $scope.homework = null;
                    }
                    if (typeof cb === 'function') {
                        cb();
                    }
                }, function (e) {
                    $rootScope.validationError(e);
                });
            };

            $scope.loadMorePreviousLessonsFromLesson = function (currentLesson) {
                if (currentLesson.allPreviousLessonsLoaded || currentLesson.previousLessonsLoading) {
                    return;
                }
                $scope.loadPreviousLessonsFromLesson(currentLesson, true);
            };

            var defaultCount = 6;
            var idx_start = 0;
            var idx_end = idx_start + defaultCount;

            $scope.loadPreviousLessonsFromLesson = function (lesson, useDeltaStep) {

                if (!useDeltaStep) {
                    lesson.allPreviousLessonsLoaded = false;
                }

                if (useDeltaStep) {
                    idx_start += defaultCount;
                    idx_end += defaultCount;
                }

                var params = {
                    offset: idx_start,
                    limit: idx_end,
                    excludeLessonId: lesson.id ? lesson.id : null,
                    startDate: moment(lesson.date).add(-2, 'month').format(DATE_FORMAT),
                    subject: lesson.subject.id,
                    audienceId: lesson.audience.id,
                    returnType: 'lesson',
                    homeworkLinkedToLesson: "true",
                    sortOrder: "DESC"
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
                PedagogicItemService.getPedagogicItems(params).then(function (pedagogicItems) {
                    //lesson.previousLessonsDisplayed = [];
                    if (pedagogicItems.length < defaultCount) {
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
                            returnType: 'homework',
                            homeworkLessonIds: previousLessonIds
                        };

                        PedagogicItemService.getPedagogicItems(paramsHomeworks).then(function (previousHomeworks) {
                            previousLessons.forEach(function (lesson) {
                                lesson.homeworks = _.where(previousHomeworks, { lesson_id: lesson.id });
                            });
                            if (idx_start !== 0) {
                                lesson.previousLessons = lesson.previousLessons.concat(previousLessons);
                            } else {
                                lesson.previousLessons = previousLessons;
                            }
                            lesson.previousLessonsLoaded = true;
                            lesson.previousLessonsLoading = false;
                            if (typeof cb === 'function') {
                                cb();
                            }
                        });
                    } else {
                        lesson.previousLessons = [];
                        lesson.previousLessonsLoaded = true;
                        lesson.previousLessonsLoading = false;
                        if (typeof cb === 'function') {
                            cb();
                        }
                    }
                });
            };

            $scope.createAndPublishLesson = function (lesson, isPublish, goMainView) {
                $scope.createOrUpdateLesson(goMainView, function () {
                    $scope.publishLessonAndGoCalendarView(lesson, isPublish);
                });
            };
        }
    });
})();

"use strict";

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("EditProgressionLessonController", controller);

        function controller($scope, $timeout, $routeParams, constants, $rootScope, ProgressionService) {
            var vm = this;

            $timeout(init);

            function init() {
                console.log("initForProgressionLesson");
                if ($routeParams.progressionId) {
                    $scope.data.tabSelected = 'lesson';
                    vm.isProgressionLesson = true;

                    if ($routeParams.editProgressionLessonId !== 'new') {
                        loadLesson($routeParams.editProgressionLessonId);
                    }
                }
            }
            function loadLesson(lessonId) {
                ProgressionService.getLessonProgression(lessonId).then(function (lesson) {
                    console.log("lesson = ", lesson);
                    $scope.$parent.editLessonCtrl.lesson = lesson;
                });
            }

            vm.cancel = function () {
                $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
            };

            vm.saveLesson = function (lesson) {
                if (!lesson.progressionId) {
                    lesson.progressionId = $routeParams.progressionId;
                }
                ProgressionService.saveLessonProgression(lesson).then(function (newLesson) {
                    notify.info(lang.translate('progression.content.saved'));
                    lesson.id = newLesson.id;
                    $rootScope.redirect('/progressionManagerView/' + $routeParams.progressionId);
                });
            };

            vm.addHomework = function (lesson) {
                if (!lesson.homeworks) {
                    lesson.homeworks = [];
                }
                var homework = model.initHomework();
                lesson.homeworks.push(homework);
            };

            vm.loadLesson = function (lessonId) {};
        }
    });
})();

'use strict';

(function () {
  'use strict';

  AngularExtensions.addModuleConfig(function (module) {

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
        link: function link(scope, element, attrs, location) {

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
            });
          };
        }
      };
    });
  });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
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
                controller: function controller() {},
                link: function link($scope) {
                    //$scope.selectedAttachments = new Array();
                    $scope.display = {};
                    $scope.display.showPersonalAttachments = false;
                    $scope.mediaLibraryScope = null;

                    /**
                     * Set selected or not documents within
                     * media library documents
                     */
                    var syncSelectedDocumentsFromItemAttachments = function syncSelectedDocumentsFromItemAttachments() {

                        var theScope = getMediaLibraryScope();

                        theScope.documents.forEach(function (document) {
                            document.selected = hasAttachmentInItem(document._id);
                        });

                        theScope.$apply();
                    };

                    /**
                     *
                     * @returns {*}
                     */
                    var getMediaLibraryScope = function getMediaLibraryScope() {

                        if ($scope.mediaLibraryScope != null) {
                            return $scope.mediaLibraryScope;
                        }

                        // tricky way to get that mediaLibrary directive ...
                        var i = 0;
                        var mediaLibraryScope = null;

                        for (var cs = $scope.$$childHead; cs; cs = cs.$$nextSibling) {
                            if (i === 0 && !cs.attachment) {
                                mediaLibraryScope = cs.$$nextSibling.$$childTail.$$childTail.$$childTail;
                                break;
                            }
                            i++;
                        }

                        $scope.mediaLibraryScope = mediaLibraryScope;
                    };

                    var mediaLibraryScope = null;

                    // open up personal storage
                    $scope.showPersonalAttachments = function () {
                        $scope.display.showPersonalAttachments = true;
                        setTimeout(function () {
                            // FIXME can't find mediaLibrary scopre at first time !!
                            syncSelectedDocumentsFromItemAttachments();
                        }, 300);
                    };

                    $scope.hidePersonalAttachments = function () {
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
                    var hasAttachmentInItem = function hasAttachmentInItem(documentId) {

                        var hasAttachment = false;

                        if (!$scope.item.attachments || $scope.item.attachments.length === 0) {
                            hasAttachment = false;
                        } else {
                            $scope.item.attachments.forEach(function (itemAttachment) {

                                if (itemAttachment.document_id === documentId) {
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
                    var getSelectedDocuments = function getSelectedDocuments() {
                        var selectedDocuments = _.where(getMediaLibraryScope().documents, {
                            selected: true
                        });

                        return selectedDocuments;
                    };

                    /**
                     *
                     * @param selectedAttachments Selected documents in media library directive
                     */
                    var addSelectedDocumentsToItem = function addSelectedDocumentsToItem(newSelectedAttachments) {

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
                        } else {
                            addSelectedDocumentsToItem(selectedAttachments);
                            // close media library directive
                            $scope.hidePersonalAttachments();
                        }
                    };

                    /**
                     * Removes the attachment from item (lesson or homework)
                     * @param attachment
                     */
                    $scope.removeAttachment = function (attachment) {

                        attachment.detachFromItem(scope.item.id, scope.itemType,
                        // callback function TODO handle
                        function () {},
                        // callback on error function TODO handle
                        function () {});
                    };

                    setInterval(function () {
                        var addButton = $('.right-magnet.vertical-spacing-twice');
                        addButton.hide();
                    }, 400);
                }
            };
        });
    });
})();

"use strict";

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("CalendarDailyEventsController", controller);

        function controller($scope) {

            init();

            function init() {
                $scope.isUserTeacher = model.isUserTeacher();

                // default open state of calendar grid
                // and homework panel
                //TODO remove and delegate to calendar controler

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
                //var bShowHomeworks = $scope.bShowHomeworks;
                var bShowHomeworksMinified = $scope.bShowHomeworksMinified;

                /**
                 * Calendar height
                 * @type {number}
                 */

                return;
                var CAL_HEIGHT = 775;

                var newHwPanelHeight = getHomeworkPanelHeight(bShowCalendar, bShowHomeworks, bShowHomeworksMinified);

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
                }
            }

            function setDaysContent() {
                model.calendar.days.forEach(function (day) {
                    day.dailyEvents = [];
                });

                $scope.ngModel.forEach(function (item) {
                    var refDay = moment(model.calendar.dayForWeek).day(1);
                    model.calendar.days.forEach(function (day) {

                        if (item.dueDate && item.dueDate.format('YYYY-MM-DD') === refDay.format('YYYY-MM-DD')) {
                            day.dailyEvents.push(item);
                        }

                        refDay.add('day', 1);
                    });
                });

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
                $scope.$apply();
            });

            $scope.$watchCollection('ngModel', function (newVal) {
                setDaysContent();
            });
        }
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        module.directive('calendarDailyEvents', function () {
            return {
                scope: {
                    ngModel: '=',
                    bShowCalendar: '=',
                    bShowHomeworks: '=',
                    bShowHomeworksMinified: '='
                },
                restrict: 'E',
                templateUrl: '/diary/public/js/directives/calendar-daily-events/calendar-daily-events.template.html',
                controller: 'CalendarDailyEventsController',

                link: function link(scope, element, attributes) {

                    $('body').on('click', function (e) {
                        if (e.target !== element[0] && element.find(e.target).length === 0) {
                            model.calendar.days.forEach(function (day) {
                                day.openDailyEvents = false;
                            });
                            scope.$apply();
                        }
                    });
                }
            };
        });
    });
})();

'use strict';

(function () {
  'use strict';

  AngularExtensions.addModuleConfig(function (module) {
    module.directive("confirmPopup", directive);

    function directive($compile) {
      return {
        restrict: 'A',
        link: function link(scope, element, attr) {
          console.log("confirm click linked");

          var clickAction = attr.confirmedClick;
          var html = '\n                     <lightbox show="display" on-close="remove()">\n                       <div class="row" ng-if="!confirmTemplate">\n                          <h2> [[msg]] </h2>\n                           <div class="row">\n                               <button class="right-magnet " ng-click="confirm()">[[yes]]</button>\n                               <input type="button" class="right-magnet cancel" i18n-value="[[cancel]]" ng-click="remove()"  />\n                           </div>\n                       </div>\n                       <div class="row" ng-if="confirmTemplate">\n                          <div ng-include="confirmTemplate">\n                          </div>\n                       </div>\n                     </lightbox>\n                     ';
          var lightbox;
          element.bind('click', function (event) {
            scope.msg = attr.confirmClick || "Etes vous sur?";
            scope.yes = attr.confirmYes || "Ok";
            scope.confirmClass = attr.confirmClass || "";
            scope.confirmTemplate = attr.confirmTemplate;
            scope.cancel = attr.confirmCancel || "Annuler";
            scope.display = true;
            lightbox = $compile(html)(scope);
            $('body').append(lightbox);
            lightbox.addClass(scope.confirmClass);
            scope.$apply();
          });
          scope.remove = function () {
            scope.display = false;
            if (lightbox) {
              lightbox.remove();
            }
          };
          scope.confirm = function () {
            scope.$eval(clickAction);
            scope.remove();
          };
        }
      };
    }
  });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        module.directive('diaryDropDown', function () {
            return {
                restrict: "E",
                templateUrl: "diary/public/js/directives/diary-drop-down/diary-drop-down.template.html",
                scope: {
                    placeholder: "@",
                    list: "=",
                    selected: "=",
                    property: "@"
                },
                controller: function controller($scope) {
                    $scope.selectItem = function (item) {
                        if ($scope.list) {
                            $scope.list.map(function (e) {
                                e.selected = false;
                            });
                            item.selected = true;
                            $scope.selected = item;
                            $scope.listVisible = false;
                        }
                    };
                },
                link: function link(scope, element, attr) {

                    $(document).bind('click', function (event) {
                        var isClickedElementChildOfPopup = element.find(event.target).length > 0;

                        if (isClickedElementChildOfPopup) return;

                        scope.$apply(function () {
                            scope.listVisible = false;
                        });
                    });
                }
            };
        });
    });
})();

'use strict';

(function () {
		'use strict';

		AngularExtensions.addModuleConfig(function (module) {
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
								link: function link(scope, element, attrs) {
										scope.listVisible = false;
										scope.isPlaceholder = true;
										scope.searchPerformed = false;
										scope.otherAudiences = [];
										scope.translated_placeholder = lang.translate(scope.placeholder);

										scope.select = function (audience) {
												scope.isPlaceholder = false;
												scope.selected = audience;
												scope.listVisible = false;
										};

										scope.isSelected = function (audience) {
												return scope.selected !== undefined && scope.selected != null && audience[scope.property] === scope.selected[scope.property];
										};

										scope.show = function () {
												scope.listVisible = true;
										};

										scope.searchAudiences = function () {
												http().get('diary/classes/list/' + scope.school).done(function (structureData) {
														scope.otherAudiences = _.map(structureData, function (data) {
																var audience = {};
																audience.structureId = scope.school;
																audience.type = 'class';
																audience.typeLabel = data.className === 'class' ? lang.translate('diary.audience.class') : lang.translate('diary.audience.group');
																audience.id = data.classId;
																audience.name = data.className;
																return audience;
														});

														scope.otherAudiences = _.reject(scope.otherAudiences, function (audience) {
																return _.contains(_.pluck(scope.list, 'name'), audience.name);
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

										scope.$watch("selected", function (value) {
												scope.isPlaceholder = true;
												if (scope.selected !== null && scope.selected !== undefined) {
														scope.isPlaceholder = scope.selected[scope.property] === undefined;
														scope.display = scope.selected[scope.property];

														if (scope.lesson && scope.lesson.id && scope.lesson.endTime) {
																if (scope.lesson.homeworks.all.length > 0) {
																		scope.$parent.refreshHomeworkLoads(scope.lesson);
																}

																scope.lesson.previousLessonsLoaded = false;
																//scope.$parent.loadPreviousLessonsFromLesson(scope.lesson);
														}

														if (scope.homework && scope.homework.audience) {
																scope.$parent.showHomeworksLoad(scope.homework, null, null);
														}
												}
										});

										$(element.context.ownerDocument).click(function (event) {
												scope.listVisible = false;
										});
								}
						};
				});
		});
})();

'use strict';

(function () {
  'use strict';

  AngularExtensions.addModuleConfig(function (module) {
    module.directive("itemCalendar", directive);

    function directive() {
      return {
        restrict: 'E',
        templateUrl: '/diary/public/js/directives/item-calendar/item-calendar.template.html'
      };
    }
  });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        module.directive('diaryTimeslotItem', directive);

        function directive(AudienceService, $rootScope) {
            return {
                restrict: "A",
                scope: false,
                link: function link(scope, element) {

                    var timeslot = element;

                    var dragCounter = 0;

                    timeslot.on('dragover', function ($event) {
                        event.preventDefault();
                    });

                    timeslot.bind('dragenter', onenter);
                    function onenter(event) {

                        dragCounter++;
                        timeslot.addClass("dragin");
                        //event.preventDefault();
                        return false;
                    }

                    timeslot.bind('dragleave', onleave);
                    function onleave(event) {

                        dragCounter--;
                        if (dragCounter === 0) {
                            timeslot.removeClass("dragin");
                        }
                    }

                    function extractBeginEnd() {
                        var begin = moment().startOf('year').add(scope.day.index - 1, 'd');
                        var end = moment(begin);
                        begin = begin.add(scope.timeslot.start, 'h');
                        end = end.add(scope.timeslot.end, 'h');
                        return {
                            startDate: begin,
                            endDate: end
                        };
                    }

                    function initLessonFromProgression(lesson, pedagogicItemOfTheDay) {

                        lesson.id = null;
                        // startTime and end format from db is "HH:MM:SS" as text type
                        // for lesson save startTime need to be moment time type with date
                        lesson.title = pedagogicItemOfTheDay.title;
                        lesson.description = pedagogicItemOfTheDay.description;
                        lesson.color = pedagogicItemOfTheDay.color;
                        lesson.subject = pedagogicItemOfTheDay.subject;
                        lesson.annotations = pedagogicItemOfTheDay.annotations;
                        lesson.type_item = 'progression';
                        lesson.homeworks = new Collection();
                        if (pedagogicItemOfTheDay.homeworks && pedagogicItemOfTheDay.homeworks.length > 0) {
                            lesson.homeworks.all = _.map(pedagogicItemOfTheDay.homeworks, function (homework) {
                                var hw = new Homework();
                                _.each(Object.keys(homework), function (key) {
                                    hw[key] = homework[key];
                                });
                                return hw;
                            });
                        }

                        var timeslotDates = extractBeginEnd();

                        lesson.date = moment(timeslotDates.startDate);
                        lesson.startTime = moment(timeslotDates.startDate);
                        lesson.startMoment = moment(timeslotDates.startDate);
                        lesson.endTime = moment(timeslotDates.endDate);
                        lesson.endMoment = moment(timeslotDates.endDate);

                        model.newLesson = lesson;
                        console.log(model.newLesson);
                        window.location = '/diary#/createLessonView/timeFromCalendar';
                    }

                    timeslot.on('drop', function ($event) {
                        timeslot.removeClass("dragin");
                        var scheduleItem = scope.$parent.item;

                        $event.preventDefault();
                        var timeslotsPerDay = $('.days .timeslot').length / 7;
                        var index = scope.$parent.$index * timeslotsPerDay + scope.$index;
                        timeslot.css('background-color', '');

                        // duplicate dragged lesson
                        var pedagogicItemOfTheDay = JSON.parse($event.originalEvent.dataTransfer.getData("application/json"));

                        if (pedagogicItemOfTheDay.type_item !== 'lesson' && pedagogicItemOfTheDay.type_item !== 'progression') {
                            return;
                        }

                        var newLesson = new Lesson();
                        newLesson.id = pedagogicItemOfTheDay.id;

                        var newLessonDayOfWeek = Math.floor(index / timeslotsPerDay) + 1;
                        var newLessonStartTime = model.startOfDay + index % timeslotsPerDay;
                        var newLessonEndTime = newLessonStartTime + 1;

                        // do not drop if item type is not a lesson
                        if (pedagogicItemOfTheDay.type_item === 'progression') {
                            initLessonFromProgression(newLesson, pedagogicItemOfTheDay);
                            return;
                        }

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

                            if (scheduleItem) {
                                newLesson.date = moment(scheduleItem.startDate);
                                newLesson.startTime = moment(scheduleItem.startDate);
                                newLesson.startMoment = moment(scheduleItem.startDate);
                                newLesson.endTime = moment(scheduleItem.endDate);
                                newLesson.endMoment = moment(scheduleItem.endDate);
                                AudienceService.getAudiencesAsMap(model.me.structures).then(function (audienceMap) {
                                    //get audience
                                    if (scheduleItem.data && scheduleItem.data.classes && scheduleItem.data.classes.length > 0) {
                                        newLesson.audience = audienceMap[scheduleItem.data.classes[0]];
                                    }
                                    //get room
                                    if (scheduleItem.data && scheduleItem.data.roomLabels && scheduleItem.data.roomLabels.length > 0) {
                                        newLesson.room = scheduleItem.data.roomLabels[0];
                                    }
                                });

                                model.newLesson = newLesson;

                                window.location = '/diary#/createLessonView/timeFromCalendar';
                            } else {

                                newLesson.save(function (data) {
                                    window.location = '/diary#/editLessonView/' + newLesson.id;
                                }, function (error) {
                                    console.error(error);
                                });
                            }
                        }, function (error) {
                            console.error(error);
                        });
                    });
                }
            };
        }
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        /**
         * Directive for result items
         */
        module.directive('quickSearchItem', function () {
            return {
                restrict: "E",
                templateUrl: "/diary/public/js/directives/quick-search/quick-search-item.html",
                scope: false,
                link: function link(scope, element) {

                    var angElement = angular.element(element);

                    angElement.on('drag', function (event) {
                        angElement.css('opacity', 0.9);
                    });

                    scope.dragCondition = function (item) {
                        return true;
                    };

                    scope.dropCondition = function (targetItem) {
                        return false;
                    };

                    scope.drag = function (item, $originalEvent) {
                        try {
                            $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
                        } catch (e) {
                            $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
                        }
                    };
                }
            };
        });
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("QuickSearchController", controller);

        function controller($scope, $rootScope, PedagogicItemService) {
            var vm = this;

            var id = Date.now();
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
            var isQuickSearchLesson = $scope.itemType === 'lesson' ? true : false;

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

            $scope.$on('rightpanel.open', function (_, rightpanelid) {
                if (id !== rightpanelid && $scope.panelVisible) {
                    $scope.setPanelVisible(false, {
                        target: {
                            type: "text"
                        }
                    });
                }
            });

            $scope.setPanelVisible = function (isVisible, $event) {
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
                        $('#mainDiaryContainer').width('84%');
                        $('.quick-search').width('16%');
                        $rootScope.$broadcast('rightpanel.open', id);
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
            $scope.quickSearchNextPedagogicDays = function () {

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
            $scope.quickSearchPreviousPedagogicDays = function () {

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
            var isPreviousPedagogicDaysDisplayed = function isPreviousPedagogicDaysDisplayed() {
                return !$scope.isFirstSearch && 0 < pedagogicItemDisplayedIdxStart && $scope.quickSearchPedagogicDaysDisplayed.length > 0;
            };

            /**
             * Returns true if the "next" arrow button should be displayed meaning
             * there are other items
             * @returns {boolean}
             */
            var isNextPedagogicDaysDisplayed = function isNextPedagogicDaysDisplayed(pedagogicItemCount) {
                return !$scope.isFirstSearch && pedagogicItemDisplayedIdxStart <= pedagogicItemCount && $scope.quickSearchPedagogicDaysDisplayed.length > 0 && $scope.quickSearchPedagogicDaysDisplayed.length >= pedagogicDaysDisplayedStep;
            };

            var performQuickSearch = function performQuickSearch() {

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

                $scope.performPedagogicItemSearch(params, model.isUserTeacher());
            };

            /*
             * search pedagogic item
             */
            $scope.performPedagogicItemSearch = function (params, isTeacher) {
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
                return PedagogicItemService.getPedagogicItems(params).then(function (pedagogicItems) {
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
                    $scope.displayNoResultsText = $scope.quickSearchPedagogicDays.length === 0;

                    var idxSearchPedagogicItem = 0;
                    $scope.quickSearchPedagogicDaysDisplayed = [];

                    // count number of displayed items
                    $scope.quickSearchPedagogicDays.forEach(function (pedagogicDay) {

                        pedagogicDay.pedagogicItemsOfTheDay.forEach(function (pedagogicItemOfTheDay) {
                            if (pedagogicItemDisplayedIdxStart <= idxSearchPedagogicItem && idxSearchPedagogicItem <= pedagogicItemDisplayedIdxEnd) {
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

            $scope.quickSearch = function (resetMaxDisplayedItems) {

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

            var handleCalendarHomeworksDrop = function handleCalendarHomeworksDrop() {

                var timeslots = $('.homeworkpanel');

                var homeworkSlotsPerDay = model.homeworksPerDayDisplayed; // 1;//timeslots.length / 7;

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
                            newHomework.state = "draft";

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
                                var homework = model.homeworks.findWhere({
                                    id: parseInt(newHomework.id)
                                });
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
    });
})();

'use strict';

(function () {
  'use strict';

  AngularExtensions.addModuleConfig(function (module) {
    /**
         * Directive to perform a quick search among lessons and homeworks
         */
    module.directive('quickSearch', function () {
      return {
        restrict: "E",
        templateUrl: "/diary/public/js/directives/quick-search/quick-search.html",
        scope: {
          /**
           * Item type 'lesson' or 'homework'
           */
          itemType: "@"
        },
        controller: 'QuickSearchController',
        link: function link(scope, element, attrs, location) {}
      };
    });
  });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        /**
         * Directive for result items
         */
        module.directive('searchDropDown', function () {
            return {
                restrict: "E",
                templateUrl: "/diary/public/js/directives/search-drop-down/search-drop-down.template.html",
                scope: {
                    items: '=',
                    showExpression: '@',
                    selectedItem: '=',
                    placeHolder: '@',
                    freeField: '='
                },
                controller: 'SearchDropDownController'
            };
        });

        module.controller("SearchDropDownController", controller);

        function controller($scope, $sce, $timeout) {

            $scope.showDropDown = false;
            if (!$scope.showExpression) {
                $scope.showExpression = 'item';
            }

            $scope.$watch('items', init);
            $scope.$watch('searchFilter', init);

            function init() {
                $scope.itemsToShow = $scope.items.map(function (item) {
                    var result = "";
                    var value = eval($scope.showExpression);
                    var hightlightedText = highlight(value, $scope.searchFilter);
                    return {
                        text: value,
                        hightlightedText: hightlightedText,
                        item: item
                    };
                });

                $scope.itemsToShow = $scope.itemsToShow.filter(function (e) {
                    if (!e.text || !$scope.searchFilter) {
                        return true;
                    }
                    return e.text.toLowerCase().indexOf($scope.searchFilter.toLowerCase()) > -1;
                });
                console.log($scope.itemsToShow);
            }

            function highlight(text, phrase) {
                if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
                return text;
            }
            $scope.eraseSelected = function ($event) {
                $scope.selectedItem = undefined;
                angular.element($event.target).parent().parent().find('input')[0].focus();
            };
            $scope.selectItem = function (option) {
                $scope.searchFilter = undefined;
                $scope.selectedItem = option;
                $scope.showDropDown = false;
            };
            $scope.blur = function () {
                $timeout(function () {
                    $scope.showDropDown = false;
                    $scope.searchFilter = undefined;
                });
            };
            $scope.enter = function (keyEvent) {

                if (keyEvent.which === 13) {
                    if (!$scope.searchFilter) {
                        return;
                    }
                    var item = $scope.itemsToShow.find(function (e) {
                        return e.text.toLowerCase() === $scope.searchFilter.toLowerCase();
                    });
                    if (item) {
                        $scope.selectItem(item);
                    }
                }
            };
            $scope.change = function () {
                $scope.showDropDown = $scope.searchFilter.length > 0;
                $scope.selectedItem = undefined;
            };
        }
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        module.directive('secure', directive);

        function directive(SecureService) {
            return {
                restrict: "A",
                link: function link(scope, elem, attrs) {
                    if (!SecureService.hasRight(attrs.secure)) {
                        elem[0].remove();
                    }
                }
            };
        }
    });
})();

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    var SecureService = function () {
        function SecureService() {
            _classCallCheck(this, SecureService);
        }

        _createClass(SecureService, [{
            key: "hasRight",
            value: function hasRight(right) {
                var result = false;
                _.each(model.me.authorizedActions, function (authorizedAction) {
                    if (authorizedAction.displayName === right) {
                        result = true;
                    }
                });
                return result;
            }
        }]);

        return SecureService;
    }();

    AngularExtensions.addModuleConfig(function (module) {
        module.service("SecureService", SecureService);
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
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
                link: function link(scope, element) {
                    var sortBySubjectLabel = function sortBySubjectLabel(a, b) {
                        if (a.label > b.label) return 1;
                        if (a.label < b.label) return -1;
                        return 0;
                    };

                    scope.search = null;
                    scope.displaySearch = false;

                    // init suggested subjects with all subjects
                    scope.suggestedSubjects = [];

                    // custom subject collection
                    // containing base subject collection + current ones being created by used
                    var subjects = [];

                    /*model.subjects.all.forEach(function(subject) {
                        subjects.push(subject);
                    });
                      subjects.sort(sortBySubjectLabel);
                    */

                    var setNewSubject = function setNewSubject(subjectLabel) {

                        if (!subjectLabel) {
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
                    scope.$watch('lesson.audience.structureId', function () {
                        if (scope.ngModel && scope.lesson && scope.lesson.audience && scope.lesson.audience.structureId) {
                            scope.ngModel.school_id = scope.lesson ? scope.lesson.audience.structureId : scope.homework.audience.structureId;
                        }
                    });
                    var initSuggestedSubjects = function initSuggestedSubjects() {
                        scope.suggestedSubjects = [];

                        subjects = [];

                        model.subjects.all.forEach(function (subject) {
                            subjects.push(subject);
                        });

                        subjects.sort(sortBySubjectLabel);

                        for (var i = 0; i < subjects.length; i++) {
                            scope.suggestedSubjects.push(subjects[i]);
                        }
                    };

                    scope.$watch(function () {
                        return model.subjects ? model.subjects.length() : undefined;
                    }, function () {
                        initSuggestedSubjects();
                    });
                    scope.goToSearchMode = function () {
                        scope.displaySearch = true;
                        scope.search = '';
                        initSuggestedSubjects();
                    };

                    scope.isSelected = function (subject) {

                        if (scope.ngModel && subject) {
                            if (scope.ngModel.id) {
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
                            scope.lesson.previousLessonsLoaded = false;
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
            };
        });
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
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
                link: function link(scope, element, attributes) {
                    var hideFunction = function hideFunction(e) {
                        var timepicker = element.data('timepicker');
                        if (!timepicker || element[0] === e.target || $('.bootstrap-timepicker-widget').find(e.target).length !== 0) {
                            return;
                        }
                        timepicker.hideWidget();
                    };
                    $('body, lightbox').on('click', hideFunction);
                    $('body, lightbox').on('focusin', hideFunction);
                    if (!$.fn.timepicker) {
                        $.fn.timepicker = function () {};
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
                        if (scope.ngModel && scope.ngModel.hour) {
                            scope.ngModel.set('hour', time[0]);
                            scope.ngModel.set('minute', time[1]);
                            scope.$apply('ngModel');
                            scope.$parent.$eval(scope.ngChange);
                            scope.$parent.$apply();
                        }
                    });

                    element.on('show.timepicker', function () {
                        element.parents().find('lightbox').on('click.timepicker', function (e) {
                            if (!(element.parent().find(e.target).length || timepicker.$widget.is(e.target) || timepicker.$widget.find(e.target).length)) {
                                timepicker.hideWidget();
                            }
                        });
                    });
                }
            };
        });
    });
})();

'use strict';

(function () {
	'use strict';

	AngularExtensions.addModuleConfig(function (module) {
		module.filter('arraytostring', filter);

		function filter() {
			return function (item) {
				// return the current `item`, but call `toUpperCase()` on it

				if (!item) {
					return "";
				}
				var result = "";
				_.each(item, function (it) {
					result += it + ",";
				});
				result = result.substring(0, result.length - 1);
				return result;
			};
		}
	});
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        module.filter('highlight', filter);

        function filter($sce) {
            return function (text, phrase) {
                if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
                return $sce.trustAsHtml(text);
            };
        }
    });
})();

'use strict';

(function () {
	'use strict';

	AngularExtensions.addModuleConfig(function (module) {
		module.filter('maxChar', filter);

		function filter() {
			return function (item, maxChar) {
				if (!item) {
					return item;
				}
				if (!item.indexOf) {
					item = item.toString();
				}

				item = item.replace(/<\/?[^>]+(>|$)/g, " ");

				var dynamicMaxChar = maxChar;

				/*if (item.indexOf('</div>') < dynamicMaxChar){
     dynamicMaxChar = item.indexOf('</div>') + 6;
    }*/
				if (item.length < dynamicMaxChar) {
					return item;
				} else {
					return item.substring(0, dynamicMaxChar) + " ...";
				}
			};
		}
	});
})();

'use strict';

(function () {
	'use strict';

	AngularExtensions.addModuleConfig(function (module) {
		module.filter('translate', filter);

		function filter() {
			return function (text) {
				return lang.translate(text);
			};
		}
	});
})();

'use strict';

(function () {
	'use strict';

	AngularExtensions.addModuleConfig(function (module) {
		module.filter('trusthtml', filter);

		function filter($sce) {
			return function (text) {
				return $sce.trustAsHtml(text);
			};
		}
	});
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        module.config(function ($httpProvider) {
            $httpProvider.interceptors.push(['$q', '$location', function ($q, $location) {

                function parseError(e) {
                    var error = e;

                    if (!error.error) {
                        error.error = "diary.error.unknown";
                    }
                    return error;
                }

                return {
                    'responseError': function responseError(response) {
                        if (response.status === 400) {
                            console.warn("error execution request");
                            console.warn(response);
                            var error = parseError(response.data);
                            notify.error(error.error);
                        }
                        return $q.reject();
                    }
                };
            }]);
        });
    });
})();

'use strict';

/**
 * Model of attachment from
 * table diary.attachment (DB)
 * @constructor
 */
function Attachment() {
    /**
     * Attachment id as in diary.attachment table
     * @type {number}
     */
    this.id = null;

    this.user_id = null;
    /**
     * Id of stored document within the document module
     * (see mongodb -> Documents table)
     * E.G: "b88a3c42-7e4f-4e1c-ab61-11c8872ef795"
     * @type {string}
     */
    this.document_id = null;
    /***
     * Creation date
     * @type {null}
     */
    this.creation_date = null;
    /**
     * Filename of attachment
     * @type {string}
     */
    this.document_label = null;
};

/**
 * Download the attachment
 */
Attachment.prototype.download = function () {
    window.location = '/workspace/document/' + this.document_id;
};

/**
 * Detach attachment to a lesson
 * Attachment link will be detached to back end on lesson save
 * @param item Lesson or homework
 * @param cb Callback
 * @param cbe Callback on error
 */
Attachment.prototype.detachFromItem = function (item, cb, cbe) {

    var that = this;

    if (item && item.attachments) {

        var udpatedAttachments = new Array();

        item.attachments.forEach(function (attachment) {
            if (attachment && attachment.document_id !== that.document_id) {
                udpatedAttachments.push(attachment);
            }
        });

        item.attachments = udpatedAttachments;

        if (typeof cb === 'function') {
            cb();
        } else typeof cbe === 'function';
        {
            cbe();
        }
    }
};

"use strict";

function Child() {
    this.id; //String
    this.displayName; //String
    this.classId; //String
    this.className; //String
    this.selected = false;
}

;'use strict';

function Homework() {

    /**
     * used in ui in homework tab in lesson view
     * @type {boolean}
     */
    this.expanded = false;

    /**
     * Attachments
     */
    if (!this.attachments) {
        this.attachments = new Array();
    }

    /**
     * Delete calendar references of current homework
     */
    this.deleteModelReferences = function () {
        var idxHomeworkToDelete = model.homeworks.indexOf(this);

        // delete homework in calendar cache
        if (idxHomeworkToDelete >= 0) {
            model.homeworks.splice(idxHomeworkToDelete, 1);
        }
    };

    /**
     * Adds an attachment
     * @param attachment
     */
    this.addAttachment = function (attachment) {
        this.attachments.push(attachment);
    };

    /**
     * Removes attachment associated to this lesson
     * @param attachment
     * @param cb
     * @param cbe
     */
    this.detachAttachment = function (attachment, cb, cbe) {
        attachment.detachFromItem(this.id, 'lesson', cb, cbe);
    };
}

Homework.prototype.api = {
    delete: '/diary/homework/:id'
};

Homework.prototype.save = function (cb, cbe) {

    var that = this;

    var updateOrCreateHomework = function updateOrCreateHomework() {
        if (that.id) {
            that.update(cb, cbe);
        } else {
            that.create(cb, cbe);
        }
    };

    // autocreates subject if it does not exists
    if (!this.subject.id) {
        this.subject.save(updateOrCreateHomework);
    } else {
        updateOrCreateHomework();
    }
};

/**
 * Returns true if current homework is attached to a lesson
 * @returns {boolean}
 */
Homework.prototype.isAttachedToLesson = function () {
    return typeof this.lesson_id !== 'undefined' && this.lesson_id != null;
};

Homework.prototype.isDraft = function () {
    return this.state === "draft";
};

Homework.prototype.isPublished = function () {
    return !this.isDraft();
};

/**
 * A directly publishable homework must exist in database and not linked to a lesson
 * @param toPublish
 * @returns {*|boolean} true if homework can be published directly
 */
Homework.prototype.isPublishable = function (toPublish) {
    return this.id && (toPublish ? this.isDraft() : this.isPublished()) && this.lesson_id == null;
};

Homework.prototype.changeState = function (toPublish) {
    this.state = toPublish ? 'published' : 'draft';
};

Homework.prototype.update = function (cb, cbe) {
    var url = '/diary/homework/' + this.id;

    var homework = this;
    http().putJson(url, this).done(function () {
        if (typeof cb === 'function') {
            cb();
        }
    }.bind(this)).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

Homework.prototype.create = function (cb, cbe) {
    var homework = this;
    http().postJson('/diary/homework', this).done(function (b) {
        homework.updateData(b);
        model.homeworks.pushAll([homework]);
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Load homework object from id
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Homework.prototype.load = function (cb, cbe) {

    var homework = this;

    var load = function load() {
        http().get('/diary/homework/' + homework.id).done(function (data) {
            homework.updateData(sqlToJsHomework(data));

            if (typeof cb === 'function') {
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    };

    // might occur when user pressed F5 on lesson view
    // needed to fill homework.audience and subject properties
    if (model.audiences.all.length === 0) {
        model.audiences.syncAudiences(function () {
            model.subjects.syncSubjects(load);
        });
    } else {
        load();
    }
};

/**
 * Deletes a list of homeworks
 * @param homeworks Homeworks to be deleted
 * @param cb Callback
 * @param cbe Callback on error
 */
Homework.prototype.deleteList = function (homeworks, cb, cbe) {
    model.deleteItemList(homeworks, 'homework', cb, cbe);
};

/**
 * Deletes the homework
 * @param Optional lesson attached to homework
 * @param cb Callback after delete
 * @param cbe Callback on error
 */
Homework.prototype.delete = function (lesson, cb, cbe) {

    var homework = this;

    var deleteHomeworkReferences = function deleteHomeworkReferences() {

        // delete homework from calendar cache
        model.homeworks.forEach(function (modelHomework) {
            if (modelHomework.id === homework.id) {
                model.homeworks.remove(modelHomework);
            }
        });

        if (lesson && lesson.homeworks) {
            lesson.homeworks.remove(homework);
        }
    };

    if (this.id) {
        http().delete('/diary/homework/' + this.id).done(function (b) {

            deleteHomeworkReferences();

            if (typeof cb === 'function') {
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    } else {
        deleteHomeworkReferences();

        if (typeof cb === 'function') {
            cb();
        }
    }
};

Homework.prototype.toJSON = function () {

    var json = {
        homework_title: this.title,
        subject_id: this.subject.id,
        homework_type_id: this.type.id,
        teacher_id: model.me.userId,
        school_id: this.audience.structureId,
        audience_id: this.audience.id,
        homework_due_date: moment(this.dueDate).format(DATE_FORMAT),
        homework_description: this.description,
        homework_color: this.color,
        homework_state: this.state,
        // used to auto create postgresql diary.audience if needed
        // not this.audience object is originally from neo4j graph (see syncAudiences function)
        audience_type: this.audience.type,
        audience_name: this.audience.name,
        attachments: this.attachments
    };

    if (this.lesson_id) {
        json.lesson_id = this.lesson_id;
    }

    if (!this.id) {
        created: moment(this.created).format('YYYY-MM-DD HH:mm:ss.SSSSS'); // "2016-07-05 11:48:22.18671"
    }

    return json;
};

'use strict';

function Lesson(data) {
    this.selected = false;
    //this.collection(Attachment);
    // initialize homeworks collection (see lib.js)
    if (!this.homeworks) {
        this.collection(Homework);
    }
    this.subject = data ? data.subject : new Subject();
    this.audience = data ? data.audience : new Audience();

    /**
     * Attachments
     */
    if (!this.attachments) {
        this.attachments = new Array();
    }

    var that = this;

    /**
     * Adds an attachment
     * @param attachment
     */
    this.addAttachment = function (attachment) {
        this.attachments.push(attachment);
    };

    /**
     * Delete calendar references of current lesson
     */
    this.deleteModelReferences = function () {
        model.lessons.forEach(function (lesson) {
            if (lesson.id === that.id) {
                model.lessons.remove(lesson);
            }
        });
        // delete associated homeworks references
        var lessonHomeworks = model.homeworks.filter(function (homework) {
            return homework && homework.lesson_id === that.id;
        });

        lessonHomeworks.forEach(function (homework) {
            model.homeworks.remove(homework);
        });
    };
}

Lesson.prototype.api = {
    delete: '/diary/lesson/:id'
};

/**
 * Triggered when lesson item has stopped being dragged in calendar view
 * see angular-app.js scheduleItemEl.on('stopDrag').
 * Will auto-save lesson in db on item move/resize
 * @param cb
 * @param cbe
 */
Lesson.prototype.calendarUpdate = function (cb, cbe) {

    // TODO date fields types are kinda messy
    // toJson method needs date fields to be in some specific format
    if (this.beginning) {
        this.date = this.beginning;
        this.startMoment = this.beginning;
        this.endMoment = this.end;
        this.startTime = this.startMoment;
        this.endTime = this.endMoment;
    }
    if (this.id) {
        this.update(function () {
            //model.refresh();
        }, function (error) {
            model.parseError(error);
        });
    }
};

/**
 * Save attached homeworks of lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.saveHomeworks = function (cb, cbe) {
    var homeworkSavedCount = 0;
    var homeworkCount = this.homeworks ? this.homeworks.all.length : 0;
    var that = this;

    // make sure subject and audience of homeworks are
    // same as the lesson
    if (homeworkCount > 0) {
        this.homeworks.forEach(function (homework) {
            homework.lesson_id = that.id;
            // needed fields as in model.js Homework.prototype.toJSON
            homework.audience = that.audience;
            homework.subject = that.subject;
            homework.color = that.color;

            homework.save(function (x) {
                homeworkSavedCount++;
                // callback function once all homeworks saved
                if (homeworkSavedCount === homeworkCount) {
                    if (typeof cb === 'function') {
                        cb();
                    }
                }
            }, function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
            });
        });
    } else {
        if (typeof cb === 'function') {
            cb();
        }
    }
};

/**
 * Save lesson and attached homeworks
 * and sync calendar lessons and homeworks cache
 * @param cb
 * @param cbe
 */
Lesson.prototype.save = function (cb, cbe) {

    // startTime used for db save but startMoment in calendar view
    // startMoment day is given by lesson.date
    this.startMoment = model.getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.startTime));
    this.endMoment = model.getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.endTime));
    var that = this;

    var saveHomeworksAndSync = function saveHomeworksAndSync() {
        that.saveHomeworks(function () {
            syncLessonsAndHomeworks(cb);
        });
    };

    var updateOrCreateLesson = function updateOrCreateLesson() {
        if (that.id) {
            that.update(saveHomeworksAndSync, cbe);
        } else {
            that.create(saveHomeworksAndSync, cbe);
        }
    };

    // autocreates subject if it does not exists
    if (!this.subject.id) {
        this.subject.save(updateOrCreateLesson);
    } else {
        updateOrCreateLesson();
    }
};

/**
 *
 * @param idHomework
 * @returns {boolean}
 */
Lesson.prototype.hasHomeworkWithId = function (idHomework) {

    var found = false;

    if (!idHomework || !this.homeworks) {
        found = false;
    }

    this.homeworks.forEach(function (homework) {
        if (homework.id === idHomework) {
            found = true;
        }
    });

    return found;
};

Lesson.prototype.update = function (cb, cbe) {
    var url = '/diary/lesson/' + this.id;

    var lesson = this;

    http().putJson(url, this).done(function () {

        if (typeof cb === 'function') {
            cb();
        }
    }.bind(this)).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

Lesson.prototype.create = function (cb, cbe) {
    var lesson = this;
    http().postJson('/diary/lesson', this).done(function (b) {
        lesson.updateData(b);
        model.lessons.pushAll([lesson]);
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Deletes the lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.delete = function (cb, cbe) {

    var lesson = this;

    http().delete('/diary/lesson/' + this.id, this).done(function (b) {

        lesson.deleteModelReferences();

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Deletes a list of lessons
 * @param lessons Lessons to be deleted
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.deleteList = function (lessons, cb, cbe) {
    model.deleteItemList(lessons, 'lesson', cb, cbe);
};

/**
 * Load lesson object from id
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Lesson.prototype.load = function (loadHomeworks, cb, cbe) {

    var lesson = this;

    var load = function load() {
        http().get('/diary/lesson/' + lesson.id).done(function (data) {
            lesson.updateData(model.LessonService.mapLesson(data));

            if (loadHomeworks) {
                model.loadHomeworksForLesson(lesson, cb, cbe);
            }

            if (typeof cb === 'function') {
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    };

    // might occur when user pressed F5 on lesson view
    if (model.audiences.all.length === 0) {
        model.audiences.syncAudiences(function () {
            model.subjects.syncSubjects(load);
        });
    } else {
        load();
    }
};

/**
 * Publishes the lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.publish = function (cb, cbe) {

    var jsonLesson = new Lesson();
    jsonLesson.id = this.id;
    jsonLesson.audience.structureId = this.structureId;

    http().postJson('/diary/lesson/publish', jsonLesson).done(function () {
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 *
 * JSON object corresponding to sql diary.lesson table columns
 */
Lesson.prototype.toJSON = function () {

    var json = {
        lesson_id: this.id,
        subject_id: this.subject.id,
        school_id: this.audience.structureId,
        // TODO missing teacher_id
        audience_id: this.audience.id,
        lesson_title: this.title,
        lesson_color: this.color,
        lesson_date: moment(this.date).format(DATE_FORMAT),
        lesson_start_time: moment(this.startTime).format('HH:mm'),
        lesson_end_time: moment(this.endTime).format('HH:mm'),
        lesson_description: this.description,
        lesson_annotation: this.annotations,
        lesson_state: this.state,
        // start columns not in lesson table TODO move
        audience_type: this.audience.type,
        audience_name: this.audience.name,
        attachments: this.attachments
    };

    if (this.room) {
        json.lesson_room = this.room;
    }

    return json;
};

Lesson.prototype.addHomework = function (cb) {
    var homework = model.initHomework(this);
    this.homeworks.push(homework);
};

Lesson.prototype.deleteHomework = function (homework) {

    homework.delete(function (cb) {}, function (cbe) {});

    var homework = new Homework();
    homework.dueDate = this.date;
    homework.type = model.homeworkTypes.first();
    this.homeworks.push(homework);
};

Lesson.prototype.isDraft = function () {
    return this.state === "draft";
};

Lesson.prototype.isPublished = function () {
    return !this.isDraft();
};

Lesson.prototype.isPublishable = function (toPublish) {
    return this.id && this.state == (toPublish ? 'draft' : 'published');
};

/**
 * Change state of current and associated homeworks
 * @param isPublished
 */
Lesson.prototype.changeState = function (isPublished) {
    this.state = isPublished ? 'published' : 'draft';

    // change state of associated homeworks
    this.homeworks.forEach(function (homework) {
        var lessonHomework = homework;
        homework.state = isPublished ? 'published' : 'draft';

        var found = false;

        // change state of homeworks cache in calendar for current week
        model.homeworks.forEach(function (homeworkCache) {
            if (!found && homeworkCache.id == lessonHomework.id) {
                homeworkCache.state = isPublished ? 'published' : 'draft';
                found = true;
            }
        });
    });
};

"use strict";

function PedagogicDay() {
    this.selected = false;
    this.dayName = moment().format("dddd DD MMMM YYYY");
    this.shortName = this.dayName.substring(0, 2);
    this.shortDate = moment().format("DD/MM");
    this.pedagogicItemsOfTheDay = [];
    this.nbLessons = 0;
    this.nbHomeworks = 0;
}

PedagogicDay.prototype.numberOfItems = function () {
    return this.nbLessons + this.nbHomeworks;
};

PedagogicDay.prototype.resetCountValues = function () {
    var countItems = _.groupBy(this.pedagogicItemsOfTheDay, 'type_item');
    this.nbLessons = countItems['lesson'] ? countItems['lesson'].length : 0;
    this.nbHomeworks = countItems['homework'] ? countItems['homework'].length : 0;
};

'use strict';

function PedagogicItem() {
    this.selected = false;
}

PedagogicItem.prototype.deleteModelReferences = function () {
    model.deletePedagogicItemReferences(this.id);
};

PedagogicItem.prototype.changeState = function (toPublish) {
    //if item is a lesson may need to upgrade his related homework
    if (this.type_item === 'lesson') {
        var relatedToLesson = model.pedagogicDays.getItemsByLesson(this.id);
        relatedToLesson.forEach(function (item) {
            item.state = toPublish ? 'published' : 'draft';
        });
    } else {
        this.state = toPublish ? 'published' : 'draft';
    }
};

PedagogicItem.prototype.isPublished = function () {
    return this.state === 'published';
};

PedagogicItem.prototype.descriptionMaxSize = 140;

PedagogicItem.prototype.getPreviewDescription = function () {

    if (this.description) {
        if (this.description.length >= this.descriptionMaxSize) {
            this.preview_description = '<p class="itemPreview">' + $('<div>' + this.description + '</div>').text().substring(0, this.descriptionMaxSize) + '...</p>';
        } else {
            this.preview_description = this.description;
        }
    } else {
        this.preview_description = this.description;
    }
};

PedagogicItem.prototype.isPublishable = function (toPublish) {
    return this.id && this.state == (toPublish ? 'draft' : 'published') && (this.lesson_id == null || this.lesson_id == this.id); // id test to detect free homeworks
};

PedagogicItem.prototype.delete = function (cb, cbe) {

    var url = this.type_item == "lesson" ? '/diary/lesson/' : '/diary/homework/';
    var idToDelete = this.id;
    http().delete(url + idToDelete, this).done(function (b) {

        model.deletePedagogicItemReferences(idToDelete);

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

PedagogicItem.prototype.deleteList = function (items, cb, cbe) {

    // split into two arrays of PedagogicItem, one for the lessons, one for the homeworks
    var itemsByType = []; // array of array(s)

    if (items.length == 1) {
        itemsByType.push(items);
    } else {
        itemsByType = _.partition(items, function (item) {
            return item.type_item === 'lesson';
        });
    }

    var countdown = 0;

    if (itemsByType.length > 0) {
        countdown = itemsByType.length;

        itemsByType.forEach(function (arrayForTypeItem) {
            if (arrayForTypeItem.length > 0) {
                model.deleteItemList(arrayForTypeItem, arrayForTypeItem[0].type_item, function () {
                    countdown--;
                    if (countdown == 0) {
                        if (typeof cb === 'function') {
                            cb();
                        }
                    }
                }, cbe);
            } else {
                countdown--;
            }
        });
    }
};

PedagogicItem.prototype.isFiltered = function () {
    if (model.searchForm.selectedSubject != null) {
        return !(this.subject === model.searchForm.selectedSubject);
    }
    return false;
};

"use strict";

function SearchForm(isQuickSearch) {
    this.startDate = {};
    this.endDate = {};
    this.publishState = {};
    this.returnType = {};
    this.displayLesson = {};
    this.displayHomework = {};
    this.audienceId = {};
    this.subjects = [];
    this.selectedSubject = null;
    this.subjectsFilters = [];
    /**
     * If true search result will be stored in model.quickSearchPedagogicDays instead of model.pedagogicDays
     * @type {boolean}
     */
    this.isQuickSearch = isQuickSearch;
    /**
     * Custom pedagogic days array.
     * Avoid conflicting with model.pedagogicDays)
     * @type {Array}
     */
    this.customPedagogicDaysArray;
};

SearchForm.prototype.initForTeacher = function () {
    this.publishState = "";
    this.returnType = "both";
    var period = moment(model.calendar.dayForWeek).day(1);
    this.startDate = period.format(DATE_FORMAT);
    this.endDate = period.add(15, 'days').format(DATE_FORMAT);
    this.displayLesson = true;
    this.displayHomework = true;
    this.audienceId = "";
};

SearchForm.prototype.initForStudent = function () {
    this.publishState = "published";
    this.returnType = "both";
    var period = moment(model.calendar.dayForWeek).day(1);
    this.startDate = period.format(DATE_FORMAT);
    this.endDate = period.add(15, 'days').format(DATE_FORMAT);
    this.displayLesson = false;
    this.displayHomework = true;
};

SearchForm.prototype.getSearch = function () {

    var params = {};
    params.startDate = this.startDate;
    params.endDate = this.endDate;
    params.publishState = this.publishState;
    params.returnType = this.returnType;

    if (model.isUserParent()) {
        params.audienceId = model.child.classId;
    }
    return params;
};

'use strict';

function Subject() {}

/**
 * Saves the subject to databases.
 * It's auto-created if it does not exists in database
 * @param cb
 * @param cbe
 */
Subject.prototype.save = function (cb, cbe) {
    if (this.id) {
        // not implemented yet at this stage/ not needed
    } else {
        this.create(cb, cbe);
    }
};

/**
 * Creates a subject
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Subject.prototype.create = function (cb, cbe) {
    var subject = this;
    http().postJson('/diary/subject', this).done(function (b) {
        subject.updateData(b);
        model.subjects.all.push(subject);
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

Subject.prototype.toJSON = function () {

    return {
        id: this.id,
        school_id: this.school_id,
        subject_label: this.label,
        teacher_id: this.teacher_id,
        original_subject_id: this.originalsubjectid
    };
};

'use strict';

function Teacher() {}

Teacher.prototype.create = function (cb, cbe) {

    model.me.structures.forEach(function (structureId) {
        http().postJson('/diary/teacher/' + structureId).done(function (e) {

            if (typeof cb === 'function') {
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    });
};

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("ProgressionManagerController", controller);

        function controller($scope, $rootScope, ProgressionService, $timeout, $routeParams) {
            var vm = this;
            function init() {
                vm.loadProgressions();
            }
            $timeout(init);

            vm.edit = function () {
                vm.originalProgressionItem = angular.copy(vm.selectedProgressionItem);
                vm.selectedProgressionItem.edit = true;
            };

            vm.hasProgressItem = function () {
                return vm.selectedProgressionItem === undefined;
            };
            vm.cancel = function () {
                if (vm.selectedProgressionItem.id) {
                    vm.selectedProgressionItem.title = vm.originalProgressionItem.title;
                    vm.selectedProgressionItem.level = vm.originalProgressionItem.level;
                    vm.selectedProgressionItem.description = vm.originalProgressionItem.description;
                    vm.originalProgressionItem = null;
                    vm.selectedProgressionItem.edit = false;
                } else {
                    vm.selectedProgressionItem = undefined;
                }
            };
            vm.setNewProgression = function () {
                vm.selectedProgressionItem = {
                    edit: true
                };
            };

            vm.selectProgression = function (progressionItem) {
                $rootScope.redirect('/progressionManagerView/' + progressionItem.id);
                vm.selectedProgressionItem = progressionItem;
                progressionItem.edit = false;
                vm.loadLessonsFromProgression(vm.selectedProgressionItem);
            };

            vm.addNewLesson = function () {
                $rootScope.redirect('/progressionEditLesson/' + vm.selectedProgressionItem.id + '/new');
            };

            vm.editLesson = function (id) {
                $rootScope.redirect('/progressionEditLesson/' + vm.selectedProgressionItem.id + '/' + id);
            };

            vm.loadProgressions = function () {
                ProgressionService.getProgressions().then(function (progressions) {
                    vm.progressionItems = progressions;
                    if ($routeParams.selectedProgressionId !== 'none') {
                        var progressionToLoad = _.findWhere(vm.progressionItems, { id: parseInt($routeParams.selectedProgressionId) });
                        if (progressionToLoad) {
                            vm.selectProgression(progressionToLoad);
                        }
                    }
                });
            };

            vm.loadLessonsFromProgression = function (progression) {
                progression.lessonItems = null;
                ProgressionService.getLessonsProgression(progression.id).then(function (lessons) {
                    progression.lessonItems = lessons;
                });
            };

            vm.saveLesson = function (lesson) {
                ProgressionService.saveLessonProgression(lesson).then(function (newLesson) {
                    lesson.id = newLesson.id;
                    notify.info(lang.translate('progression.content.saved'));
                });
            };

            vm.selectedContent = function () {
                return _.filter(vm.selectedProgressionItem.lessonItems, { 'selected': true });
            };

            vm.saveProgression = function (progression) {
                ProgressionService.saveProgression(progression).then(function (newProgression) {
                    if (!progression.id) {
                        vm.progressionItems.push(newProgression);
                    } else {
                        var oldProgressionItems = _.findWhere(vm.progressionItems, { 'id': newProgression.id });
                        if (oldProgressionItems) {
                            vm.progressionItems[vm.progressionItems.indexOf(oldProgressionItems)] = newProgression;
                        }
                    }
                    vm.selectedProgressionItem = newProgression;
                    notify.info(lang.translate('progression.progression.saved'));
                });
            };

            vm.saveOrder = function (progression) {
                ProgressionService.saveLessonOrder(progression);
            };

            vm.removeSelectedContent = function () {
                ProgressionService.deleteLessons(vm.selectedContent()).then(function () {
                    vm.loadLessonsFromProgression(vm.selectedProgressionItem);
                    notify.info(lang.translate('progression.content.deleted'));
                });
            };

            vm.removeProgression = function () {
                ProgressionService.deleteProgression(vm.selectedProgressionItem.id).then(function () {
                    vm.selectedProgressionItem = undefined;
                    notify.info(lang.translate('progression.progression.deleted'));
                    vm.loadProgressions();
                });
            };

            vm.editSelectedContent = function () {
                vm.editLesson(vm.selectedContent()[0].id);
            };
        }
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
    * Progression service as class
    * used to manipulate Progression model
    */

    var ProgressionService = function () {
        function ProgressionService($http, $q, constants, $sce) {
            _classCallCheck(this, ProgressionService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.$sce = $sce;
            console.log(this.$sce);
        }

        _createClass(ProgressionService, [{
            key: 'getProgressions',
            value: function getProgressions() {
                var _this = this;

                var url = '/diary/progression';
                return this.$http.get(url).then(function (result) {
                    var progressions = result.data;
                    _.each(progressions, function (progression) {
                        progression.lessons = _.map(progression.lessons, _this.mapApiToLesson);
                    });
                    return progressions;
                });
            }
        }, {
            key: 'saveProgression',
            value: function saveProgression(progression) {
                var progressionLight = angular.copy(progression);
                delete progressionLight.lessonItems;
                delete progressionLight.nbLessons;
                var url = '/diary/progression';
                return this.$http({
                    url: url,
                    method: 'POST',
                    data: progressionLight
                }).then(function (result) {
                    return result.data;
                });
            }
        }, {
            key: 'deleteProgression',
            value: function deleteProgression(progressionId) {
                var url = '/diary/progression/' + progressionId;

                return this.$http({
                    url: url,
                    method: 'DELETE'
                }).then(function (result) {
                    return result.data;
                });
            }
        }, {
            key: 'deleteLessons',
            value: function deleteLessons(lessons) {

                var lessonsIds = _.map(lessons, function (lesson) {
                    return lesson.id;
                });

                var url = '/diary/progression/lessons';

                return this.$http({
                    url: url,
                    method: 'DELETE',
                    data: lessonsIds
                }).then(function (result) {
                    return result.data;
                });
            }
        }, {
            key: 'saveLessonProgression',
            value: function saveLessonProgression(lesson) {
                var url = '/diary/progression/lesson';

                return this.$http({
                    url: url,
                    method: 'POST',
                    data: this.mapLessonToApi(lesson)
                }).then(function (result) {
                    return result.data;
                });
            }
        }, {
            key: 'getLessonsProgression',
            value: function getLessonsProgression(progressionId) {
                var _this2 = this;

                var url = '/diary/progression/' + progressionId + '/lessons';

                return this.$http.get(url).then(function (result) {
                    return _.map(result.data, function (lesson) {
                        return _this2.mapApiToLesson(lesson);
                    });
                });
            }
        }, {
            key: 'getLessonProgression',
            value: function getLessonProgression(lessonId) {
                var _this3 = this;

                var url = '/diary/progression/lesson/' + lessonId;

                return this.$http.get(url).then(function (result) {
                    return _this3.mapApiToLesson(result.data);
                });
            }
        }, {
            key: 'saveLessonOrder',
            value: function saveLessonOrder(progression) {
                var url = '/diary/progression/order';

                return this.$http({
                    url: url,
                    method: 'POST',
                    data: this.extractOrderInformations(progression)
                });
            }
        }, {
            key: 'mapApiToLesson',
            value: function mapApiToLesson(apiLesson) {
                var _this4 = this;

                var lesson = apiLesson; //angular.copy(apiLesson);
                lesson.subject = JSON.parse(lesson.subject);
                lesson.type_item = 'progression';
                if (lesson.description) {
                    lesson.descriptionTrusted = this.$sce.trustAsHtml(lesson.description);
                }

                lesson.homeworks = JSON.parse(lesson.homeworks);
                _.each(lesson.homeworks, function (homework) {
                    if (homework.description) {
                        homework.descriptionTrusted = _this4.$sce.trustAsHtml(homework.description);
                    }
                });

                var homeworks = new Collection();
                homeworks.all = lesson.homeworks;
                lesson.homeworks = homeworks;
                return lesson;
            }
        }, {
            key: 'mapHomeworkToApi',
            value: function mapHomeworkToApi(homework) {
                return JSON.stringify(homework.data);
            }
        }, {
            key: 'mapAttachementsToApi',
            value: function mapAttachementsToApi(attachment) {
                return attachment;
            }
        }, {
            key: 'mapLessonToApi',
            value: function mapLessonToApi(lesson) {

                var result = {
                    id: lesson.id,
                    title: lesson.title,
                    description: lesson.description,
                    subjectLabel: lesson.subject.subject_label,
                    color: lesson.color,
                    annotations: lesson.annotations,
                    orderIndex: lesson.orderIndex,
                    subject: lesson.subject,
                    progressionId: lesson.progressionId,
                    homeworks: lesson.homeworks && lesson.homeworks.all ? _.map(lesson.homeworks.all, this.mapHomeworkToApi) : []
                };

                if (lesson.homeworks) {
                    result.homeworks = JSON.stringify(_.map(lesson.homeworks.all, this.mapObject));
                }

                result.subject = JSON.stringify(result.subject.data);
                return result;
            }
        }, {
            key: 'mapObject',
            value: function mapObject(obj) {
                obj.toJSON = undefined;
                return obj;
            }
        }, {
            key: 'extractOrderInformations',
            value: function extractOrderInformations(progression) {
                var lessonsOrder = [];
                _.each(progression.lessonItems, function (lesson) {
                    lessonsOrder.push({
                        id: lesson.id,
                        orderIndex: lesson.orderIndex
                    });
                });
                return lessonsOrder;
            }
        }]);

        return ProgressionService;
    }();

    AngularExtensions.addModuleConfig(function (module) {
        module.service("ProgressionService", ProgressionService);
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("ProgressionRightPanelController", controller);

        function controller($scope, $location, ProgressionService) {
            var vm = this;

            init();

            function init() {
                ProgressionService.getProgressions().then(function (progressions) {
                    vm.progressionItems = progressions;
                });
            }

            vm.selectProgression = function (progression) {
                vm.selected = 'detail';
                vm.progressionSelected = progression;
                vm.filterLesson = undefined;
                progression.lessonItems = null;
                ProgressionService.getLessonsProgression(progression.id).then(function (lessons) {
                    progression.lessonItems = lessons;
                });
            };

            $scope.redirect = function (path) {
                $location.path(path);
            };

            vm.dragCondition = function (item) {
                return true;
            };

            vm.dropCondition = function (targetItem) {
                return false;
            };

            vm.drag = function (item, $originalEvent) {
                try {
                    $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
                } catch (e) {
                    $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
                }
            };
        }
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("RightPanelController", controller);

        function controller($scope, $rootScope, ProgressionService) {
            var id = Date.now();
            var vm = this;
            $scope.panelVisible = false;

            $scope.toggle = function () {
                if (!$scope.panelVisible) {
                    $scope.$parent.$$childTail.panelVisible = false;
                    $scope.$parent.$$childHead.panelVisible = false;
                    $rootScope.$broadcast('rightpanel.open', id);
                }
                $scope.panelVisible = !$scope.panelVisible;

                if ($scope.panelVisible) {
                    $('#mainDiaryContainer').width('84%');
                    $('.quick-search').width('16%');
                } else {
                    $('#mainDiaryContainer').width('97%');
                    $('.quick-search').width('2%');
                }
            };

            $scope.$on('rightpanel.open', function (_, rightpanelid) {
                if (id !== rightpanelid && $scope.panelVisible) {
                    $scope.toggle();
                }
            });
        }
    });
})();

'use strict';

(function () {
  'use strict';

  AngularExtensions.addModuleConfig(function (module) {
    /**
         * Directive to perform a quick search among lessons and homeworks
         */
    module.directive('rightPanel', function () {
      return {
        restrict: "E",
        templateUrl: "/diary/public/js/progression/right-panel/right-panel.html",
        scope: {
          label: '@',
          contentUrl: '='
        },
        controller: 'RightPanelController'
      };
    });
  });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {

        module.config(function ($routeProvider) {
            $routeProvider
            // manage visa
            .when('/manageVisaView/:teacherId', {
                action: 'manageVisaView'
            })
            // go to create new lesson view
            .when('/progressionManagerView/:selectedProgressionId', {
                action: 'progressionManagerView'
            }).when('/progressionEditLesson/:progressionId/:editProgressionLessonId', {
                action: 'editLessonView'
            })
            // go to create new lesson view
            .when('/createLessonView/:timeFromCalendar', {
                action: 'createLessonView'
            })
            // go to create/update homework view
            .when('/createHomeworkView', {
                action: 'createHomeworkView'
            }).when('/editLessonView/:idLesson', {
                action: 'editLessonView'
            })
            // opens lesson and set default tab view to homeworks one
            .when('/editLessonView/:idLesson/:idHomework', {
                action: 'editLessonView'
            }).when('/editHomeworkView/:idHomework', {
                action: 'editHomeworkView'
            }).when('/editHomeworkView/:idHomework/:idLesson', {
                action: 'editHomeworkView'
            }).when('/calendarView/:mondayOfWeek', {
                action: 'calendarView'
            }).when('/listView', {
                action: 'listView'
            }).when('/mainView', {
                action: 'mainView'
            })
            // default view
            .otherwise({
                action: 'calendarView'
            });
        });
    });
})();

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
     * Attachement service as class
     * used to manipulate Attachement model
     */

    var AttachementService = function () {
        function AttachementService($http, $q, constants, UtilsService) {
            _classCallCheck(this, AttachementService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.UtilsService = UtilsService;
        }

        /*
        *   Mapp homeworks
        */


        _createClass(AttachementService, [{
            key: "mappAttachement",
            value: function mappAttachement(attachements) {
                return _.map(attachements, function (attachementData) {
                    var att = new Attachment();
                    att.id = attachementData.id;
                    att.user_id = attachementData.user_id;
                    att.creation_date = attachementData.creation_date;
                    att.document_id = attachementData.document_id;
                    att.document_label = attachementData.document_label;

                    return att;
                });
            }
        }]);

        return AttachementService;
    }();
    /* create singleton */


    AngularExtensions.addModuleConfig(function (module) {
        module.service("AttachementService", AttachementService);
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
    * Audience service as class
    * used to manipulate Audience model
    */

    var AudienceService = function () {
        function AudienceService($http, $q, constants) {
            _classCallCheck(this, AudienceService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.context = {
                processesPromise: []
            };
        }

        /*
        * get a map indexed by label
        */


        _createClass(AudienceService, [{
            key: 'getAudiencesAsMap',
            value: function getAudiencesAsMap(structureIdArray) {
                return this.getAudiences(structureIdArray).then(function (classes) {
                    var result = {};
                    _.each(classes, function (classe) {
                        result[classe.name] = classe;
                    });
                    return result;
                });
            }

            /*
            * get classes for all structureIds
            */

        }, {
            key: 'getAudiences',
            value: function getAudiences(structureIdArray) {
                var _this = this;

                //cache the promises, this datas will not change in a uniq session
                var processes = [];
                _.each(structureIdArray, function (structureId) {

                    if (!_this.context.processesPromise[structureId]) {
                        _this.context.processesPromise[structureId] = [];
                        var url = '/userbook/structure/' + structureId;
                        _this.context.processesPromise[structureId] = _this.$http.get(url).then(function (result) {
                            return {
                                structureId: structureId,
                                structureData: result.data
                            };
                        });
                    }
                    processes.push(_this.context.processesPromise[structureId]);
                });

                //execute promises
                return this.$q.all(processes).then(function (results) {
                    var result = [];
                    _.each(results, function (datas) {
                        var structureId = datas.structureId;
                        var structureData = datas.structureData;
                        result = result.concat(_this.mapAudiences(structureData.classes, structureId));
                    });
                    return result;
                });
            }

            /*
            *   map an Audience
            */

        }, {
            key: 'mapAudiences',
            value: function mapAudiences(classes, structureId) {
                return _.map(classes, function (audience) {
                    audience.structureId = structureId;
                    audience.type = 'class';
                    audience.typeLabel = lang.translate('diary.audience.class');
                    return audience;
                });
            }
        }]);

        return AudienceService;
    }();

    AngularExtensions.addModuleConfig(function (module) {
        module.service("AudienceService", AudienceService);
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
    * Course service as class
    * used to manipulate Course model
    */

    var CourseService = function () {
        function CourseService($http, $q, constants, SubjectService) {
            _classCallCheck(this, CourseService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.context = {};
            this.SubjectService = SubjectService;
        }

        _createClass(CourseService, [{
            key: 'getMergeCourses',
            value: function getMergeCourses(structureId, teacherId, firstDayOfWeek) {
                var _this = this;

                return this.$q.all([this.getScheduleCourses(structureId, teacherId, firstDayOfWeek), this.SubjectService.getStructureSubjectsAsMap(structureId)]).then(function (results) {
                    var courses = results[0];
                    var subjects = results[1];
                    return _this.mappingCourses(courses, subjects);
                });
            }
        }, {
            key: 'mappCourse',
            value: function mappCourse(course) {
                course.date = moment(course.startDate);
                course.date.week(model.calendar.week);
                //course.beginning = moment(course.startDate);
                //course.end = moment(course.endDate);
                course.startMoment = moment(course.startDate);
                course.endMoment = moment(course.endDate);

                course.startTime = moment(course.startDate).format('HH:mm:ss');
                course.endTime = moment(course.endDate).format('HH:mm:ss');
                course.calendarType = "shadow";
                course.locked = true;
                course.is_periodic = false;
                course.notShowOnCollision = true;
            }
        }, {
            key: 'mappingCourses',
            value: function mappingCourses(courses, subjects) {
                var _this2 = this;

                _.each(courses, function (course) {
                    course.subject = subjects[course.subjectId];
                    _this2.mappCourse(course);
                });
                return courses;
            }
        }, {
            key: 'getScheduleCourses',
            value: function getScheduleCourses(structureId, teacherId, firstDayOfWeek) {
                var begin = moment(firstDayOfWeek);
                var end = moment(firstDayOfWeek).add(6, 'd');

                var url = '/directory/timetable/courses/teacher/' + structureId;
                var config = {
                    params: {
                        begin: begin.format(this.constants.CAL_DATE_PATTERN),
                        end: end.format(this.constants.CAL_DATE_PATTERN),
                        teacherId: teacherId
                    }
                };
                return this.$http.get(url, config).then(function (result) {
                    return result.data;
                });
            }
        }]);

        return CourseService;
    }();

    AngularExtensions.addModuleConfig(function (module) {
        module.service("CourseService", CourseService);
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
    * Homework service as class
    * used to manipulate Homework model
    */

    var HomeworkService = function () {
        function HomeworkService($http, $q, constants) {
            _classCallCheck(this, HomeworkService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
        }

        /*
        * get homeworks
        */


        _createClass(HomeworkService, [{
            key: 'getHomeworks',
            value: function getHomeworks(userStructuresIds, mondayOfWeek, isUserParent, childId) {
                var _this = this;

                var start = moment(mondayOfWeek).day(1).format(this.constants.CAL_DATE_PATTERN);
                var end = moment(mondayOfWeek).day(1).add(1, 'week').format(this.constants.CAL_DATE_PATTERN);

                var urlGetHomeworks = '/diary/homework/' + userStructuresIds + '/' + start + '/' + end + '/';

                if (isUserParent && childId) {
                    urlGetHomeworks += childId;
                } else {
                    urlGetHomeworks += '%20';
                }

                return this.$http.get(urlGetHomeworks).then(function (result) {
                    return _this.mappHomework(result.data);
                });
            }

            /*
            *   Mapp homeworks
            */

        }, {
            key: 'mappHomework',
            value: function mappHomework(homeworks) {
                return _.map(homeworks, function (sqlHomework) {
                    var homework = {
                        //for share directive you must have _id
                        _id: sqlHomework.id,
                        id: sqlHomework.id,
                        description: sqlHomework.homework_description,
                        audienceId: sqlHomework.audience_id,
                        audience: model.audiences.findWhere({ id: sqlHomework.audience_id }),
                        subject: model.subjects.findWhere({ id: sqlHomework.subject_id }),
                        subjectId: sqlHomework.subject_id,
                        subjectLabel: sqlHomework.subject_label,
                        type: model.homeworkTypes.findWhere({ id: sqlHomework.homework_type_id }),
                        typeId: sqlHomework.homework_type_id,
                        typeLabel: sqlHomework.homework_type_label,
                        teacherId: sqlHomework.teacher_id,
                        structureId: sqlHomework.structureId,
                        audienceType: sqlHomework.audience_type,
                        audienceLabel: sqlHomework.audience_label,
                        // TODO delete dueDate? (seems redondant info vs date field)
                        dueDate: moment(sqlHomework.homework_due_date),
                        date: moment(sqlHomework.homework_due_date),
                        title: sqlHomework.homework_title,
                        color: sqlHomework.homework_color,
                        startMoment: moment(sqlHomework.homework_due_date),
                        endMoment: moment(sqlHomework.homework_due_date),
                        state: sqlHomework.homework_state,
                        is_periodic: false,
                        lesson_id: sqlHomework.lesson_id
                    };

                    if (sqlHomework.attachments) {
                        homework.attachments = _.map(JSON.parse(sqlHomework.attachments), jsonToJsAttachment);
                    }

                    if ('group' === homework.audienceType) {
                        homework.audienceTypeLabel = lang.translate('diary.audience.group');
                    } else {
                        homework.audienceTypeLabel = lang.translate('diary.audience.class');
                    }

                    return homework;
                });
            }
        }]);

        return HomeworkService;
    }();

    AngularExtensions.addModuleConfig(function (module) {
        module.service("HomeworkService", HomeworkService);
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
     * Lesson service as class
     * used to manipulate Lesson model
     */

    var LessonService = function () {
        function LessonService($http, $q, constants, UtilsService, AttachementService) {
            _classCallCheck(this, LessonService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.UtilsService = UtilsService;
            this.AttachementService = AttachementService;
        }

        _createClass(LessonService, [{
            key: 'getLessons',
            value: function getLessons(userStructuresIds, mondayOfWeek, isUserParent, childId) {
                var _this = this;

                var start = moment(mondayOfWeek).day(1).format(this.constants.CAL_DATE_PATTERN);
                var end = moment(mondayOfWeek).day(1).add(1, 'week').format(this.constants.CAL_DATE_PATTERN);

                var urlGetHomeworks = '/diary/lesson/' + userStructuresIds + '/' + start + '/' + end + '/';

                if (isUserParent && childId) {
                    urlGetHomeworks += childId;
                } else {
                    urlGetHomeworks += '%20';
                }

                return this.$http.get(urlGetHomeworks).then(function (result) {
                    return _this.mappLessons(result.data);
                });
            }

            /*
            *   Map lesson
            */

        }, {
            key: 'mappLessons',
            value: function mappLessons(lessons) {
                var _this2 = this;

                return _.map(lessons, function (lessonData) {
                    return _this2.mapLesson(lessonData);
                });
            }

            /*
            *  Map one lesson
            */

        }, {
            key: 'mapLesson',
            value: function mapLesson(lessonData) {
                var lessonHomeworks = [];

                // only initialize homeworks attached to lesson
                // with only id
                if (lessonData.homework_ids) {
                    for (var i = 0; i < lessonData.homework_ids.length; i++) {
                        var homework = new Homework();
                        homework.id = lessonData.homework_ids[i];
                        homework.lesson_id = parseInt(lessonData.lesson_id);
                        homework.loaded = false; // means full lessonData from sql not loaded
                        lessonHomeworks.push(homework);
                    }
                }

                var lesson = {
                    //for share directive you must have _id
                    _id: lessonData.lesson_id,
                    id: lessonData.lesson_id,
                    title: lessonData.lesson_title,
                    audience: model.audiences.findWhere({ id: lessonData.audience_id }),
                    audienceId: lessonData.audience_id,
                    audienceLabel: lessonData.audience_label,
                    audienceType: lessonData.audience_type,
                    description: lessonData.lesson_description,
                    subject: model.subjects.findWhere({ id: lessonData.subject_id }),
                    subjectId: lessonData.subject_id,
                    subjectLabel: lessonData.subject_label,
                    teacherId: lessonData.teacher_display_name,
                    structureId: lessonData.school_id,
                    date: moment(lessonData.lesson_date),
                    startTime: lessonData.lesson_start_time,
                    endTime: lessonData.lesson_end_time,
                    color: lessonData.lesson_color,
                    room: lessonData.lesson_room,
                    annotations: lessonData.lesson_annotation,
                    startMoment: moment(lessonData.lesson_date.split(' ')[0] + ' ' + lessonData.lesson_start_time),
                    endMoment: moment(lessonData.lesson_date.split(' ')[0] + ' ' + lessonData.lesson_end_time),
                    state: lessonData.lesson_state,
                    is_periodic: false,
                    homeworks: lessonHomeworks,
                    tooltipText: '',
                    locked: !model.canEdit() ? true : false
                };
                lesson.subject = new Subject();
                lesson.subject.label = lessonData.subject_label;
                lesson.subject.id = lessonData.subject_id;
                lesson.subject.teacher_id = lessonData.teacher_display_name;

                if ('group' === lesson.audienceType) {
                    lesson.audienceTypeLabel = lang.translate('diary.audience.group');
                } else {
                    lesson.audienceTypeLabel = lang.translate('diary.audience.class');
                }

                if (lessonData.attachments) {
                    lesson.attachments = AttachementService.mappAttachement(JSON.parse(lessonData.attachments));
                }

                var tooltip = this.UtilsService.getResponsiveLessonTooltipText(lesson);

                lesson.tooltipText = tooltip;
                return lesson;
            }
        }]);

        return LessonService;
    }();
    /* create singleton */


    AngularExtensions.addModuleConfig(function (module) {
        module.service("LessonService", LessonService);
    });
})();

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    var ModelWeekService = function () {
        function ModelWeekService($http, $q, constants, CourseService) {
            _classCallCheck(this, ModelWeekService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.CourseService = CourseService;
        }

        _createClass(ModelWeekService, [{
            key: "setModelWeek",
            value: function setModelWeek(alias, date) {
                var dateParam = moment(date).format(this.constants.CAL_DATE_PATTERN);
                var url = "/diary/modelweek/" + alias + "/" + dateParam;
                return this.$http.post(url);
            }
        }, {
            key: "getModelWeeks",
            value: function getModelWeeks() {
                var url = "/diary/modelweek/list";
                return this.$http.get(url).then(function (result) {
                    var modelWeeks = result.data;
                    _.each(modelWeeks, function (modelWeek) {
                        modelWeek.startDate = moment(modelWeek.startDate).toDate();
                        modelWeek.endDate = moment(modelWeek.endDate).toDate();
                    });

                    var transformedResult = {
                        "A": _.findWhere(modelWeeks, { "weekAlias": "A" }),
                        "B": _.findWhere(modelWeeks, { "weekAlias": "B" })
                    };
                    return transformedResult;
                });
            }
        }, {
            key: "invertModelsWeek",
            value: function invertModelsWeek() {
                var url = "/diary/modelweek/invert";
                return this.$http.post(url).then(function (result) {
                    return result.data;
                });
            }
        }, {
            key: "getCoursesModel",
            value: function getCoursesModel(date) {
                var _this = this;

                var dateParam = moment(date).format(this.constants.CAL_DATE_PATTERN);
                var url = "/diary/modelweek/items/" + dateParam;

                return this.$http.get(url).then(function (result) {
                    var courses = result.data;
                    if (!courses) {
                        courses = [];
                    }
                    _this.mappModelWeekToCourse(courses);
                    return courses;
                });
            }
        }, {
            key: "mappModelWeekToCourse",
            value: function mappModelWeekToCourse(courses) {
                var _this2 = this;

                _.each(courses, function (course) {
                    course.startDate = moment(course.startDate);
                    course.endDate = moment(course.endDate);
                    _this2.CourseService.mappCourse(course);
                    course.subject = model.subjects.findWhere({ id: course.subjectId });
                    course.subject.subjectLabel = course.subjectLabel;
                    course.subjectId = course.subjectId;
                });

                return courses;
            }
        }]);

        return ModelWeekService;
    }();

    AngularExtensions.addModuleConfig(function (module) {
        module.service("ModelWeekService", ModelWeekService);
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    var PedagogicItemService = function () {
        function PedagogicItemService($http, $q, constants, UtilsService) {
            _classCallCheck(this, PedagogicItemService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.UtilsService = UtilsService;
        }

        _createClass(PedagogicItemService, [{
            key: 'getPedagogicItems',
            value: function getPedagogicItems(params) {
                var _this = this;

                var options = {
                    method: 'POST',
                    url: '/diary/pedagogicItems/list',
                    data: params
                };

                return this.$http(options).then(function (result) {
                    return _.map(result.data, _this.mapPedagogicItem);
                });
            }
        }, {
            key: 'mapPedagogicItem',
            value: function mapPedagogicItem(data) {
                var item = new PedagogicItem();
                item.type_item = data.type_item;
                item.id = data.id;
                //for share directive you must have _id
                item._id = data.id;
                item.lesson_id = data.lesson_id;
                item.title = data.title;
                item.subject = data.subject;
                item.audience = data.audience;
                item.start_hour = data.type_item == "lesson" ? moment(data.day).minutes(model.getMinutes(data.start_time)).format("HH[h]mm") : "";
                item.end_hour = data.type_item == "lesson" ? moment(data.day).minutes(model.getMinutes(data.end_time)).format("HH[h]mm") : "";
                item.type_homework = data.type_homework;
                item.teacher = data.teacher;
                item.description = data.description;
                item.expanded_description = false;
                item.state = data.state;
                item.color = data.color;
                item.getPreviewDescription();
                item.room = data.room;
                item.day = data.day;
                item.turn_in = data.type_item == "lesson" ? "" : data.turn_in_type;
                item.selected = false;

                if (data.day) {
                    item.dayFormatted = moment(data.day).format("DD/MM/YYYY");
                    item.dayOfWeek = moment(data.day).format("dddd");
                }
                return item;
            }
        }]);

        return PedagogicItemService;
    }();
    /* create singleton */


    AngularExtensions.addModuleConfig(function (module) {
        module.service("PedagogicItemService", PedagogicItemService);
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
     * Subject service as class
     * used to manipulate Subject model
     */

    var SubjectService = function () {
        function SubjectService($http, $q, constants, UtilsService) {
            _classCallCheck(this, SubjectService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.UtilsService = UtilsService;
            this.context = {
                subjectPromise: []
            };
        }

        /*
        *   Get all subject from a structureId as map
        *   used to map a course from the subject id
        */


        _createClass(SubjectService, [{
            key: 'getStructureSubjectsAsMap',
            value: function getStructureSubjectsAsMap(structureId) {
                return this.getStructureSubjects(structureId).then(function (result) {
                    var subjects = result;
                    var results = {};
                    _.each(subjects, function (subject) {
                        results[subject.subjectId] = subject;
                    });
                    return results;
                });
            }

            /*
            *   Get all subject from a structureId
            *   used to map a course from the subject id
            */

        }, {
            key: 'getStructureSubjects',
            value: function getStructureSubjects(structureId) {
                if (!this.context.subjectPromise[structureId]) {
                    var url = '/directory/timetable/subjects/' + structureId;
                    this.context.subjectPromise[structureId] = this.$http.get(url).then(function (result) {
                        return result.data;
                    });
                }
                return this.context.subjectPromise[structureId];
            }

            /*
            *   get subjects created by the teacher
            *   used to edit a lesson
            */

        }, {
            key: 'getCustomSubjects',
            value: function getCustomSubjects(isTeacher) {
                var urlGetSubjects = '';
                if (isTeacher) {
                    urlGetSubjects = '/diary/subject/initorlist';
                } else {
                    urlGetSubjects = '/diary/subject/list/' + this.UtilsService.getUserStructuresIdsAsString();
                }

                return this.$http.get(urlGetSubjects).then(function (result) {
                    return result.data;
                });
            }

            /*
            * map original subject to diary subject
            */

        }, {
            key: 'mapToDiarySubject',
            value: function mapToDiarySubject(subject) {
                var result = new Subject();

                result.id = null;
                result.school_id = subject.school_id;
                result.label = subject.subjectLabel;
                result.originalsubjectid = subject.subjectId;
                result.teacher_id = subject.teacher_id;
                return result;
            }
        }]);

        return SubjectService;
    }();

    AngularExtensions.addModuleConfig(function (module) {
        module.service("SubjectService", SubjectService);
    });
})();

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
     * Utils service as class
     * used to manipulate Utils model
     */

    var UtilsService = function () {
        function UtilsService($http, $q, constants) {
            _classCallCheck(this, UtilsService);

            this.constants = constants;
        }

        _createClass(UtilsService, [{
            key: "getUserStructuresIdsAsString",
            value: function getUserStructuresIdsAsString() {
                var structureIds = "";

                model.me.structures.forEach(function (structureId) {
                    structureIds += structureId + ":";
                });

                return structureIds;
            }

            /**
             * Set lesson tooltip text depending on screen resolution.
             * Tricky responsive must be linked to additional.css behaviour
             * @param lesson
             */

        }, {
            key: "getResponsiveLessonTooltipText",
            value: function getResponsiveLessonTooltipText(lesson) {
                var tooltipText = lesson.title + ' (' + lang.translate(lesson.state) + ')';
                var screenWidth = window.innerWidth;

                // < 900 px display room
                if (screenWidth < 900 && lesson.room) {
                    tooltipText += '<br>' + lesson.room;
                }

                // < 650 px display hour start and hour end
                if (screenWidth < 650) {
                    tooltipText += '<br>' + [[lesson.startMoment.format('HH')]] + 'h' + [[lesson.startMoment.format('mm')]];
                    tooltipText += ' -> ' + [[lesson.endMoment.format('HH')]] + 'h' + [[lesson.endMoment.format('mm')]];
                }

                // < 600 px display subjectlabel
                if (screenWidth < 650 && lesson.subjectLabel) {
                    tooltipText += '<br>' + lesson.subjectLabel;
                }

                tooltipText = tooltipText.trim();

                return tooltipText;
            }
        }]);

        return UtilsService;
    }();

    AngularExtensions.addModuleConfig(function (module) {
        module.service("UtilsService", UtilsService);
    });
})();

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    'use strict';

    /*
     * Visa service as class
     * used to manipulate Visa model
     */

    var VisaService = function () {
        function VisaService($http, $q, constants) {
            _classCallCheck(this, VisaService);

            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
        }

        _createClass(VisaService, [{
            key: 'getFilters',
            value: function getFilters(userStructuresId) {

                var url = '/diary/visa/filters/' + userStructuresId;

                return this.$http.get(url).then(function (result) {
                    return result.data;
                });
            }
        }, {
            key: 'getAgregatedVisas',
            value: function getAgregatedVisas(structureId, filter) {
                var url = '/diary/visa/agregs';
                return this.$http({
                    url: url,
                    method: 'GET',
                    params: {
                        structureId: structureId,
                        teacherId: filter.teacher ? filter.teacher.key : undefined,
                        audienceId: filter.audience ? filter.audience.key : undefined,
                        subjectId: filter.subject ? filter.subject.key : undefined,
                        showTodoOnly: filter.state ? filter.state.key = "TODO" ? true : undefined : undefined
                    }
                }).then(function (result) {
                    return result.data;
                });
            }
        }, {
            key: 'applyVisa',
            value: function applyVisa(_applyVisa) {
                var url = '/diary/visa/apply';
                return this.$http({
                    url: url,
                    method: 'POST',
                    data: _applyVisa
                }).then(function (result) {
                    return result.data;
                });
            }
        }]);

        return VisaService;
    }();
    /* create singleton */


    AngularExtensions.addModuleConfig(function (module) {
        module.service("VisaService", VisaService);
    });
})();

'use strict';

(function () {
    'use strict';

    AngularExtensions.addModuleConfig(function (module) {
        //controller declaration
        module.controller("VisaManagerController", controller);

        function controller($scope, $rootScope, $routeParams, VisaService) {
            var vm = this;

            vm.items = [{ name: 'teacher1' }, { name: 'teacher2' }];
            init();
            function init() {
                VisaService.getFilters(model.me.structures[0]).then(function (filters) {
                    vm.filters = filters;
                    vm.filters.states = [{ key: 'TODO', value: lang.translate('diary.visa.state.todo') },
                    //{ key :'DID', value  :lang.translate('diary.visa.state.did')},
                    { key: 'ALL', value: lang.translate('diary.visa.state.all') }];
                });
            }

            vm.search = function () {
                VisaService.getAgregatedVisas(model.me.structures[0], vm.filter).then(function (result) {
                    vm.agregatedVisa = result;
                    console.log(vm.agregatedVisa);
                });
            };

            vm.selectedContent = function () {
                if (!vm.agregatedVisa) {
                    return [];
                }
                return vm.agregatedVisa.filter(function (e) {
                    return e.selected;
                });
            };

            vm.calcRecapSelected = function () {
                vm.recap = {
                    nbLesson: vm.getNbLesson(),
                    nbTeacher: vm.getNbProps("teacherId"),
                    nbSubject: vm.getNbProps("subjectId"),
                    nbAudience: vm.getNbProps("audienceId")
                };
                console.log("recap", vm.recap);
            };

            vm.getNbLesson = function () {
                return vm.selectedContent().reduce(function (acc, e) {
                    return acc + e.nbNotVised + (e.visas[0] ? e.visas[0].nbDirty : 0);
                }, 0);
            };

            vm.getNbProps = function (props) {
                var map = {};
                vm.selectedContent().map(function (e) {
                    map[e[props]] = true;
                });
                return Object.keys(map).length;
            };

            vm.applyVisa = function (withLock) {
                var applyVisa = {
                    comment: vm.comment,
                    resultVisaList: vm.selectedContent(),
                    ownerId: model.me.userId,
                    ownerName: model.me.username,
                    ownerType: 'director'
                };
                VisaService.applyVisa(applyVisa).then(function () {
                    vm.search();
                });
            };

            vm.showSelected = function () {};

            vm.pdf = function () {};
        }
    });
})();

"use strict";

/**
 * Default date format
 * @type {string}
 */
var DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Model from table
 * diary.lesson_has_attachment
 * @constructor
 */
function LessonAttachment() {}
function Audience() {}
function HomeworksLoad() {}
function HomeworkType() {}

model.homeworksPerDayDisplayed = 1;
/**
 * Says whether or not current user can edit an homework
 * @returns {*|boolean}
 */
model.canEdit = function () {
    return model.me.type == "ENSEIGNANT";
};

/**
 * Says whether or not current user is a teacher
 * @returns {*|boolean}
 */
model.isUserTeacher = function () {
    return model.me.type == "ENSEIGNANT";
};

/**
 * Says whether or not current user is a teacher
 * @returns {*|boolean}
 */
model.isUserParent = function () {
    return model.me.type == "PERSRELELEVE";
};

/**
 * Publishes or un publishes a list of homeworks
 * @param itemArray Array of homeworks to publish or unpublish
 */
model.publishHomeworks = function (itemArray, isPublish, cb, cbe) {

    var url = isPublish ? "/diary/publishHomeworks" : "/diary/unPublishHomeworks";

    return http().postJson(url, itemArray).done(function (r) {
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

model.deleteItemList = function (items, itemType, cb, cbe) {
    var url = itemType == "lesson" ? '/diary/deleteLessons' : '/diary/deleteHomeworks';

    var itemArray = { ids: model.getItemsIds(items) };

    return http().deleteJson(url, itemArray).done(function (b) {

        items.forEach(function (item) {
            item.deleteModelReferences();
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

model.deletePedagogicItemReferences = function (itemId) {
    model.pedagogicDays.forEach(function (day) {
        day.pedagogicItemsOfTheDay = _.reject(day.pedagogicItemsOfTheDay, function (item) {
            return !item || item.lesson_id == itemId || item.id == itemId;
        });
        day.resetCountValues();
    });

    model.pedagogicDays.all = _.filter(model.pedagogicDays.all, function (day) {
        return day.numberOfItems() > 0;
    });

    model.initSubjects();
};

model.unselectDays = function () {
    model.pedagogicDays.forEach(function (day) {
        day.selected = undefined;
    });
};

// gets the selected date from pedagogic items
model.selectedPedagogicDate = function () {
    var selectedDay = _.findWhere(model.pedagogicDays.all, { selected: true });
    if (selectedDay) {
        return moment(selectedDay.dayName, "dddd DD MMMM YYYY").format("YYYY-MM-DD");
    } else {
        return moment();
    }
};

var syncHomeworks = function syncHomeworks(cb) {
    model.homeworks.syncHomeworks(function () {
        if (typeof cb === 'function') {
            cb();
        }
    });
};

var syncLessonsAndHomeworks = function syncLessonsAndHomeworks(cb) {
    model.lessons.syncLessons();
    // need sync attached lesson homeworks
    model.homeworks.syncHomeworks();

    if (typeof cb === 'function') {
        cb();
    }
};

/**
 * Given a moment which contain reliable time data,
 * return a moment time with this time and the date specified.
 * @param date Date
 * @param momentTime Moment date
 * @returns {*}
 */
model.getMomentDateTimeFromDateAndMomentTime = function (date, momentTime) {
    var dateMoment = moment(date);

    momentTime.set('year', dateMoment.get('year'));
    momentTime.set('month', dateMoment.get('month'));
    momentTime.set('date', dateMoment.get('date'));

    return momentTime;
};

/**
 * Publishes or un publishes a list of lessons
 * @param cb Callback
 * @param cbe Callback on error
 */
model.publishLessons = function (itemArray, isPublish, cb, cbe) {

    var url = isPublish ? "/diary/publishLessons" : "/diary/unPublishLessons";

    return http().postJson(url, itemArray).done(function (r) {

        var updateLessons = new Array();

        // update lesson cache
        // bad code but collection does not seem to update on state change
        // so have to delete and add modified lessons ...
        model.lessons.forEach(function (lessonModel) {
            if (itemArray.ids.indexOf(lessonModel.id) != -1) {
                model.lessons.remove(lessonModel);

                lessonModel.changeState(isPublish);
                // update tooltip text (has state label in it)
                lessonModel.tooltipText = getResponsiveLessonTooltipText(lessonModel);
                updateLessons.push(lessonModel);
            }
        });

        model.lessons.addRange(updateLessons);

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

model.getMinutes = function (time) {
    return new Number(time.split(':')[0] * 60) + new Number(time.split(':')[1]);
};

model.parseError = function (e) {
    var error = {};
    try {
        error = JSON.parse(e.responseText);
    } catch (err) {
        error.error = "diary.error.unknown";
    }
    error.status = e.status;

    return error;
};

/**
 *
 * @param items Collection of items (lessons or homeworks)
 * @returns {Array} Array of id of the items
 */
model.getItemsIds = function (items) {
    return _.toArray(_.pluck(items, 'id'));
};

/**
 * Loads homework load data for current week of homework
 * @param homework
 * @param cb
 * @param cbe
 */
model.loadHomeworksLoad = function (homework, date, audienceId, cb, cbe) {

    http().get('/diary/homework/load/' + date + '/' + audienceId).done(function (sqlHomeworksLoads) {

        homework.weekhomeworksload = new Array();

        sqlHomeworksLoads.forEach(function (homeworkLoad) {
            homework.weekhomeworksload.push(sqlToJsHomeworkLoad(homeworkLoad));
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Get homeworks linked to a lesson
 *
 * @param lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
model.loadHomeworksForLesson = function (lesson, cb, cbe) {

    if (!lesson.id) {
        return;
    }

    http().get('/diary/homework/list/' + lesson.id).done(function (sqlHomeworks) {

        lesson.homeworks = new Collection(Homework);

        sqlHomeworks.forEach(function (sqlHomework) {
            lesson.homeworks.push(sqlToJsHomework(sqlHomework));
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * Get school ids of current authenticated user as string
 * seperated with ':'
 * @returns {string} schoolid_1:schoolid_2:...
 */
var getUserStructuresIdsAsString = function getUserStructuresIdsAsString() {
    var structureIds = "";

    model.me.structures.forEach(function (structureId) {
        structureIds += structureId + ":";
    });

    return structureIds;
};

model.build = function () {

    calendar.startOfDay = 8;
    calendar.endOfDay = 19;
    calendar.dayHeight = 65;
    /*model.calendar = new calendar.Calendar({
        week: moment().week()
    });
    */

    // keeping start/end day values in cache so we can detect dropped zones (see ng-extensions.js)
    // note: model.calendar.startOfDay does not work in console.
    model.startOfDay = calendar.startOfDay;
    model.endOfDay = calendar.endOfDay;

    model.makeModels([HomeworkType, Audience, Subject, Lesson, Homework, PedagogicDay, Child]);
    Model.prototype.inherits(Lesson, calendar.ScheduleItem); // will allow to bind item.selected for checkbox

    this.searchForm = new SearchForm(false);
    this.currentSchool = {};

    this.collection(Lesson, {
        loading: false,
        syncLessons: function syncLessons(cb, cbe) {
            console.warn("deprecated");
            return;
            var that = this;
            if (that.loading) return;

            var lessons = [];
            var start = moment(model.calendar.dayForWeek).day(1).format(DATE_FORMAT);
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format(DATE_FORMAT);

            model.lessons.all.splice(0, model.lessons.all.length);

            var urlGetLessons = '/diary/lesson/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';

            if (model.isUserParent() && model.child) {
                urlGetLessons += model.child.id;
            } else {
                urlGetLessons += '%20';
            }

            that.loading = true;
            http().get(urlGetLessons).done(function (data) {
                lessons = lessons.concat(data);
                that.addRange(_.map(lessons, function (lesson) {
                    return sqlToJsLesson(lesson);
                }));

                if (typeof cb === 'function') {
                    cb();
                }
                that.loading = false;
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
            });
        }, pushAll: function pushAll(datas) {

            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(Subject, {
        loading: false,
        syncSubjects: function syncSubjects(cb, cbe) {
            console.warn("deprecated");
            return;

            this.all = [];
            var that = this;
            if (that.loading) return;

            that.loading = true;

            if (model.isUserTeacher()) {
                http().get('/diary/subject/initorlist').done(function (data) {
                    if (data === "") {
                        data = [];
                    }
                    model.subjects.addRange(data);
                    if (typeof cb === 'function') {
                        cb();
                    }
                    that.loading = false;
                }.bind(that)).error(function (e) {
                    if (typeof cbe === 'function') {
                        cbe(model.parseError(e));
                    }
                    that.loading = false;
                });
            } else {
                http().get('/diary/subject/list/' + getUserStructuresIdsAsString()).done(function (data) {
                    model.subjects.addRange(data);
                    if (typeof cb === 'function') {
                        cb();
                    }
                    that.loading = false;
                }.bind(that)).error(function (e) {
                    if (typeof cbe === 'function') {
                        cbe(model.parseError(e));
                    }
                    that.loading = false;
                });
            }
        }
    });

    this.collection(Audience, {
        loading: false,
        syncAudiences: function syncAudiences(cb, cbe) {
            var _this = this;

            console.warn("deprecated");
            return;
            this.all = [];
            var nbStructures = model.me.structures.length;
            var that = this;
            if (that.loading) return;

            model.currentSchool = model.me.structures[0];
            that.loading = true;

            model.getAudienceService().getAudiences(model.me.structures).then(function (audiences) {
                _this.addRange(structureData.classes);
                // TODO get groups
                nbStructures--;
                if (nbStructures === 0) {
                    _this.trigger('sync');
                    _this.trigger('change');
                    if (typeof cb === 'function') {
                        cb();
                    }
                }

                that.loading = false;
            });

            /*model.me.structures.forEach(function (structureId) {
                http().get('/userbook/structure/' + structureId).done(function (structureData) {
                    structureData.classes = _.map(structureData.classes, function (audience) {
                        audience.structureId = structureId;
                        audience.type = 'class';
                        audience.typeLabel = lang.translate('diary.audience.class');
                        return audience;
                    });
                    this.addRange(structureData.classes);
                    // TODO get groups
                    nbStructures--;
                    if (nbStructures === 0) {
                        this.trigger('sync');
                        this.trigger('change');
                        if(typeof cb === 'function'){
                            cb();
                        }
                    }
                      that.loading = false;
                }.bind(that))
                .error(function (e) {
                    if (typeof cbe === 'function') {
                        cbe(model.parseError(e));
                    }
                    that.loading = false;
                });
            });*/
        }
    });

    this.collection(HomeworkType, {
        loading: false,
        syncHomeworkTypes: function syncHomeworkTypes(cb, cbe) {

            var homeworkTypes = [];
            var that = this;

            if (that.loading) return;

            model.homeworkTypes.all.splice(0, model.homeworkTypes.all.length);

            var url = '/diary/homeworktype/initorlist';

            var urlGetHomeworkTypes = url;

            that.loading = true;
            http().get(urlGetHomeworkTypes).done(function (data) {
                homeworkTypes = homeworkTypes.concat(data);
                that.addRange(_.map(homeworkTypes, sqlToJsHomeworkType));
                if (typeof cb === 'function') {
                    cb();
                }
                that.loading = false;
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
            });
        }, pushAll: function pushAll(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(Homework, {
        loading: false,
        syncHomeworks: function syncHomeworks(cb, cbe) {

            var homeworks = [];
            var start = moment(model.calendar.dayForWeek).day(1).format(DATE_FORMAT);
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format(DATE_FORMAT);
            var that = this;

            if (that.loading) return;

            model.homeworks.all.splice(0, model.homeworks.all.length);

            var urlGetHomeworks = '/diary/homework/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';

            if (model.isUserParent() && model.child) {
                urlGetHomeworks += model.child.id;
            } else {
                urlGetHomeworks += '%20';
            }

            that.loading = true;
            http().get(urlGetHomeworks).done(function (data) {
                homeworks = homeworks.concat(data);
                that.addRange(_.map(homeworks, sqlToJsHomework));
                if (typeof cb === 'function') {
                    cb();
                }
                that.loading = false;
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
            });
        }, pushAll: function pushAll(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(PedagogicDay, {
        reset: function reset() {
            model.pedagogicDays.selectAll();
            model.pedagogicDays.removeSelection();
        },
        syncPedagogicItems: function syncPedagogicItems(cb, cbe) {
            var params = model.searchForm.getSearch();
            model.performPedagogicItemSearch(params, model.isUserTeacher(), cb, cbe);
        },
        pushAll: function pushAll(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        },
        getItemsByLesson: function getItemsByLesson(lessonId) {
            var items = [];

            model.pedagogicDays.forEach(function (day) {
                var relatedToLesson = _.filter(day.pedagogicItemsOfTheDay, function (item) {
                    return item.lesson_id == lessonId;
                });
                items = _.union(items, relatedToLesson);
            });

            return items;
        }
    });

    /**
     *
     */
    this.collection(Child, {
        reset: function reset() {
            // n.b: childs not 'children' since collection function adds a 's'
            model.childs.selectAll();
            model.childs.removeSelection();
        },
        syncChildren: function syncChildren(cb, cbe) {
            model.listChildren(cb, cbe);
        }, pushAll: function pushAll(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }
    });

    /**
     * Convert sql diary.lesson row to js row used in angular model
     * @param lesson Sql diary.lesson row
     */
    sqlToJsLesson = function sqlToJsLesson(data) {
        console.warn("deprecated");
        return;
        var lessonHomeworks = new Array();

        // only initialize homeworks attached to lesson
        // with only id
        if (data.homework_ids) {
            for (var i = 0; i < data.homework_ids.length; i++) {
                var homework = new Homework();
                homework.id = data.homework_ids[i];
                homework.lesson_id = parseInt(data.lesson_id);
                homework.loaded = false; // means full data from sql not loaded
                lessonHomeworks.push(homework);
            }
        }

        var lesson = {
            //for share directive you must have _id
            _id: data.lesson_id,
            id: data.lesson_id,
            title: data.lesson_title,
            audience: model.audiences.findWhere({ id: data.audience_id }),
            audienceId: data.audience_id,
            audienceLabel: data.audience_label,
            audienceType: data.audience_type,
            description: data.lesson_description,
            subject: model.subjects.findWhere({ id: data.subject_id }),
            subjectId: data.subject_id,
            subjectLabel: data.subject_label,
            teacherId: data.teacher_display_name,
            structureId: data.school_id,
            date: moment(data.lesson_date),
            startTime: data.lesson_start_time,
            endTime: data.lesson_end_time,
            color: data.lesson_color,
            room: data.lesson_room,
            annotations: data.lesson_annotation,
            startMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_start_time),
            endMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_end_time),
            state: data.lesson_state,
            is_periodic: false,
            homeworks: lessonHomeworks,
            tooltipText: '',
            locked: !model.canEdit() ? true : false
        };

        if ('group' === lesson.audienceType) {
            lesson.audienceTypeLabel = lang.translate('diary.audience.group');
        } else {
            lesson.audienceTypeLabel = lang.translate('diary.audience.class');
        }

        if (data.attachments) {
            lesson.attachments = _.map(JSON.parse(data.attachments), jsonToJsAttachment);
        }

        var tooltip = getResponsiveLessonTooltipText(lesson);

        lesson.tooltipText = tooltip;
        return lesson;
    };

    jsonToJsAttachment = function jsonToJsAttachment(data) {
        console.warn("deprecated");
        return;
        var att = new Attachment();
        att.id = data.id;
        att.user_id = data.user_id;
        att.creation_date = data.creation_date;
        att.document_id = data.document_id;
        att.document_label = data.document_label;

        return att;
    };

    /**
     * On window resize compute lesson tooltips (responsive design)
     */
    /*window.addEventListener('resize', function(event){
          model.lessons.forEach(function (lesson) {
            lesson.tooltipText = getResponsiveLessonTooltipText(lesson);
        });
    });*/

    /**
     * Set lesson tooltip text depending on screen resolution.
     * Tricky responsive must be linked to additional.css behaviour
     * @param lesson
     */
    getResponsiveLessonTooltipText = function getResponsiveLessonTooltipText(lesson) {
        console.warn("deprecated use utils service");
        return;
        var tooltipText = lesson.title + ' (' + lang.translate(lesson.state) + ')';
        var screenWidth = window.innerWidth;

        // < 900 px display room
        if (screenWidth < 900 && lesson.room) {
            tooltipText += '<br>' + lesson.room;
        }

        // < 650 px display hour start and hour end
        if (screenWidth < 650) {
            tooltipText += '<br>' + [[lesson.startMoment.format('HH')]] + 'h' + [[lesson.startMoment.format('mm')]];
            tooltipText += ' -> ' + [[lesson.endMoment.format('HH')]] + 'h' + [[lesson.endMoment.format('mm')]];
        }

        // < 600 px display subjectlabel
        if (screenWidth < 650 && lesson.subjectLabel) {
            tooltipText += '<br>' + lesson.subjectLabel;
        }

        tooltipText = tooltipText.trim();

        return tooltipText;
    };

    /**
     * Transform sql homework load data to json like
     * @param sqlHomeworkType
     */
    sqlToJsHomeworkLoad = function sqlToJsHomeworkLoad(sqlHomeworkload) {
        return {
            countLoad: sqlHomeworkload.countload,
            description: sqlHomeworkload.countload + ' ' + lang.translate('diary.homework.label'),
            day: moment(sqlHomeworkload.day).format('dddd').substring(0, 1).toUpperCase(), // 'lundi' -> 'lu' -> 'L'
            numDay: moment(sqlHomeworkload.day).format('DD') // 15
        };
    };

    /**
     * Transform sql homework type data to json like
     * @param sqlHomeworkType
     * @returns {{id: *, structureId: (*|T), label: *, category: *}}
     */
    sqlToJsHomeworkType = function sqlToJsHomeworkType(sqlHomeworkType) {
        return {
            id: sqlHomeworkType.id,
            structureId: sqlHomeworkType.school_id,
            label: sqlHomeworkType.homework_type_label,
            category: sqlHomeworkType.homework_type_category
        };
    };

    /**
     * Transform sql homework data (table diary.homework)
     * to json
     * @param sqlHomework
     * @returns {{id: *, description: *, audience: *, subjectId: *, subjectLabel: *, type: *, typeId: *, typeLabel: *, teacherId: *, structureId: (*|T), audienceId: *, audienceLabel: *, dueDate: *, date: *, title: *, color: *, startMoment: *, endMoment: *, state: *, is_periodic: boolean, lesson_id: *}}
     */
    sqlToJsHomework = function sqlToJsHomework(sqlHomework) {
        var homework = {
            //for share directive you must have _id
            _id: sqlHomework.id,
            id: sqlHomework.id,
            description: sqlHomework.homework_description,
            audienceId: sqlHomework.audience_id,
            audience: model.audiences.findWhere({ id: sqlHomework.audience_id }),
            subject: model.subjects.findWhere({ id: sqlHomework.subject_id }),
            subjectId: sqlHomework.subject_id,
            subjectLabel: sqlHomework.subject_label,
            type: model.homeworkTypes.findWhere({ id: sqlHomework.homework_type_id }),
            typeId: sqlHomework.homework_type_id,
            typeLabel: sqlHomework.homework_type_label,
            teacherId: sqlHomework.teacher_id,
            structureId: sqlHomework.structureId,
            audienceType: sqlHomework.audience_type,
            audienceLabel: sqlHomework.audience_label,
            // TODO delete dueDate? (seems redondant info vs date field)
            dueDate: moment(sqlHomework.homework_due_date),
            date: moment(sqlHomework.homework_due_date),
            title: sqlHomework.homework_title,
            color: sqlHomework.homework_color,
            startMoment: moment(sqlHomework.homework_due_date),
            endMoment: moment(sqlHomework.homework_due_date),
            state: sqlHomework.homework_state,
            is_periodic: false,
            lesson_id: sqlHomework.lesson_id
        };

        if (sqlHomework.attachments) {
            homework.attachments = _.map(JSON.parse(sqlHomework.attachments), jsonToJsAttachment);
        }

        if ('group' === homework.audienceType) {
            homework.audienceTypeLabel = lang.translate('diary.audience.group');
        } else {
            homework.audienceTypeLabel = lang.translate('diary.audience.class');
        }

        return homework;
    };

    /** Converts sql pedagogic item to js data */
    sqlToJsPedagogicItem = function sqlToJsPedagogicItem(data) {
        //TODO use service
        var item = new PedagogicItem();
        item.type_item = data.type_item;
        item.id = data.id;
        //for share directive you must have _id
        item._id = data.id;
        item.lesson_id = data.lesson_id;
        item.title = data.title;
        item.subject = data.subject;
        item.audience = data.audience;
        item.start_hour = data.type_item == "lesson" ? moment(data.day).minutes(model.getMinutes(data.start_time)).format("HH[h]mm") : "";
        item.end_hour = data.type_item == "lesson" ? moment(data.day).minutes(model.getMinutes(data.end_time)).format("HH[h]mm") : "";
        item.type_homework = data.type_homework;
        item.teacher = data.teacher;
        item.description = data.description;
        item.expanded_description = false;
        item.state = data.state;
        item.color = data.color;
        item.getPreviewDescription();
        item.room = data.room;
        item.day = data.day;
        item.turn_in = data.type_item == "lesson" ? "" : data.turn_in_type;
        item.selected = false;

        if (data.day) {
            item.dayFormatted = moment(data.day).format("DD/MM/YYYY");
            item.dayOfWeek = moment(data.day).format("dddd");
        }
        return item;
    };
};

/**
 * Returns default audience of connected user.
 * @returns {*}
 */
model.getDefaultAudience = function () {
    var defaultAudience = null;

    if (model.me.classes && model.me.classes.length > 0) {
        defaultAudience = model.audiences.findWhere({ id: model.me.classes[0] });
    }

    if (!defaultAudience) {
        defaultAudience = model.audiences.first();
    }

    return defaultAudience;
};

model.showHomeworkPanel = true;

/**
 * Default color of lesson and homeworks
 * @type {string}
 */
var DEFAULT_ITEM_COLOR = '#CECEF6';

/**
 * Default state of lesson or homework when created
 * @type {string}
 */
var DEFAULT_STATE = 'draft';

/**
 * Init homework object on created.
 * Set default attribute values
 * @param homework
 * @param cb Callback function
 * @param cbe Callback function on error
 * @returns {*}
 */
model.initHomework = function (dueDate, lesson) {

    var homework = new Homework();

    homework.created = new Date();
    homework.expanded = true;
    homework.type = model.homeworkTypes.first();
    homework.title = homework.type.label;
    homework.date = dueDate ? dueDate : moment().minute(0).second(0);

    // create homework attached to lesson
    if (lesson) {
        homework.audience = lesson.audience;
        homework.subject = lesson.subject;
        homework.audienceType = homework.audience.type;
        homework.color = lesson.color;
        homework.state = lesson.state;
    }
    // free homework
    else {
            homework.audience = {}; //sets the default audience to undefined
            homework.subject = model.subjects.first();
            homework.audienceType = homework.audience.type;
            homework.color = DEFAULT_ITEM_COLOR;
            homework.state = DEFAULT_STATE;
        }

    model.loadHomeworksLoad(homework, moment(homework.date).format(DATE_FORMAT), homework.audience.id);

    return homework;
};

/**
 * Init lesson
 * @returns {Lesson}
 */
model.initLesson = function (timeFromCalendar, selectedDate) {
    var lesson = new Lesson();

    lesson.audience = {}; //sets the default audience to undefined
    lesson.subject = model.subjects.first();
    lesson.audienceType = lesson.audience.type;
    lesson.color = DEFAULT_ITEM_COLOR;
    lesson.state = DEFAULT_STATE;
    lesson.title = lang.translate('diary.lesson.label');

    var newItem = {};

    if (timeFromCalendar) {
        newItem = model.calendar.newItem;

        // force to HH:00 -> HH:00 + 1 hour
        newItem.beginning = newItem.beginning.second(0);
        newItem.date = newItem.beginning;
        if (!newItem.beginning.isBefore(newItem.end)) {
            newItem.end = moment(newItem.beginning);
            newItem.end.minute(0).second(0).add(1, 'hours');
        }
        if (newItem.audience) {
            lesson.audience = newItem.audience;
            lesson.audienceType = lesson.audience.type;
        }

        if (newItem.room) {
            lesson.room = newItem.room;
        }

        if (newItem.subject) {
            lesson.subject = newItem.subject;
        }
    }
    // init start/end time to now (HH:00) -> now (HH:00) + 1 hour or selectedDate ->
    else {
            var itemDate = selectedDate ? moment(selectedDate) : moment();

            newItem = {
                date: itemDate,
                beginning: moment().minute(0).second(0),
                end: moment().minute(0).second(0).add(1, 'hours')
            };
        }

    lesson.newItem = newItem;
    lesson.startTime = newItem.beginning;
    lesson.endTime = newItem.end;
    lesson.date = newItem.date;

    return lesson;
};

/**
 * Load previous lessons from current one
 * Attached homeworks to lessons are also loaded
 * @param lesson
 * @param useDeltaStep
 * @param cb Callback function
 * @param cbe Callback on error function
 */
model.getPreviousLessonsFromLesson = function (lesson, useDeltaStep, cb, cbe) {

    console.warn("deprecated");
    return;

    // if (useDeltaStep) {
    //     if (lesson.allPreviousLessonsLoaded) {
    //         return;
    //     }
    // }/* else if (lesson.previousLessonsLoaded || lesson.previousLessonsLoading == true) {
    //     return;
    // }*/
    //
    // if (!useDeltaStep) {
    //     lesson.allPreviousLessonsLoaded = false;
    // }
    //
    // var defaultCount = 6;
    //
    // var idx_start = 0;
    // var idx_end = idx_start + defaultCount;
    //
    // if (useDeltaStep) {
    //     idx_start += defaultCount;
    //     idx_end += defaultCount;
    // }
    //
    // var params = {};
    //
    // params.offset = idx_start;
    // params.limit = idx_end;
    //
    // if (lesson.id) {
    //     params.excludeLessonId = lesson.id;
    // }
    //
    // // tricky way to detect if string date or moment date ...
    // // 12:00:00
    // if (lesson.endTime.length === 8) {
    //     params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + lesson.endTime;
    // } else {
    //     params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + moment(lesson.endTime).format("HH:mm");
    // }
    //
    // var clonedLessonMoment = moment(new Date(lesson.date));
    // //params.startDate = clonedLessonMoment.add(-2, 'month').format(DATE_FORMAT);
    // params.subject = lesson.subject.id;
    // params.audienceId = lesson.audience.id;
    // params.returnType = 'lesson'; // will allow get lessons first, then homeworks later
    // params.homeworkLinkedToLesson = "true";
    // params.sortOrder = "DESC";
    //
    // if (!lesson.previousLessons) {
    //     lesson.previousLessons = new Array();
    // }
    // lesson.previousLessonsDisplayed = new Array();
    //
    // lesson.previousLessonsLoading = true;
    // http().postJson('/diary/pedagogicItems/list', params).done(function (items) {
    //
    //     // all lessons loaded
    //     if (items.length < defaultCount) {
    //         lesson.allPreviousLessonsLoaded = true;
    //     }
    //
    //     var previousLessonsAndHomeworks = _.map(items, sqlToJsPedagogicItem);
    //
    //     var groupByItemType = _.groupBy(previousLessonsAndHomeworks, 'type_item');
    //
    //     var previousLessons = groupByItemType.lesson;
    //
    //     if (previousLessons) {
    //         var previousLessonIds = new Array();
    //
    //         previousLessons.forEach(function (lesson) {
    //             previousLessonIds.push(lesson.id);
    //         });
    //
    //
    //         // load linked homeworks of previous lessons
    //         var paramsHomeworks = {};
    //         paramsHomeworks.returnType = 'homework';
    //         paramsHomeworks.homeworkLessonIds = previousLessonIds;
    //
    //         http().postJson('/diary/pedagogicItems/list', paramsHomeworks).done(function (items2) {
    //
    //             var previousHomeworks = _.map(items2, sqlToJsPedagogicItem);
    //
    //             previousLessons.forEach(function (lesson) {
    //                 lesson.homeworks = _.where(previousHomeworks, {lesson_id: lesson.id});
    //             });
    //
    //             lesson.previousLessons = lesson.previousLessons.concat(previousLessons);
    //             lesson.previousLessonsLoaded = true;
    //             lesson.previousLessonsLoading = false;
    //             lesson.previousLessonsDisplayed = lesson.previousLessons;
    //
    //             if (typeof cb === 'function') {
    //                 cb();
    //             }
    //         });
    //     } else {
    //         lesson.previousLessons = new Array();
    //         lesson.previousLessonsLoaded = true;
    //         lesson.previousLessonsLoading = false;
    //         lesson.previousLessonsDisplayed = lesson.previousLessons;
    //         if (typeof cb === 'function') {
    //             cb();
    //         }
    //     }
    //
    // }).error(function (e) {
    //     if (typeof cbe === 'function') {
    //         cbe(model.parseError(e));
    //     }
    // });
};

model.performPedagogicItemSearch = function (params, isTeacher, cb, cbe) {

    // global quick search panel
    if (params.isQuickSearch) {
        if (params.returnType === 'lesson') {
            model.pedagogicDaysQuickSearchLesson = new Array();
        } else {
            model.pedagogicDaysQuickSearchHomework = new Array();
        }
    }
    // 'classical' view list
    else {
            model.pedagogicDays.reset();
        }

    http().postJson('/diary/pedagogicItems/list', params).done(function (items) {

        var pedagogicItemsFromDB = _.map(items, sqlToJsPedagogicItem);

        var days = _.groupBy(pedagogicItemsFromDB, 'day');

        var pedagogicDays = [];

        var aDayIsSelected = false;

        for (var day in days) {
            if (days.hasOwnProperty(day)) {
                var pedagogicDay = new PedagogicDay();
                pedagogicDay.selected = false;
                pedagogicDay.dayName = moment(day).format("dddd DD MMMM YYYY");
                pedagogicDay.shortName = pedagogicDay.dayName.substring(0, 2);
                pedagogicDay.shortDate = moment(day).format("DD/MM");
                pedagogicDay.pedagogicItemsOfTheDay = days[day];

                var countItems = _.groupBy(pedagogicDay.pedagogicItemsOfTheDay, 'type_item');

                pedagogicDay.nbLessons = countItems['lesson'] ? countItems['lesson'].length : 0;
                pedagogicDay.nbHomeworks = countItems['homework'] ? countItems['homework'].length : 0;

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

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

/**
 * List children of current authenticated user (if parent)
 * @param cb Callback function
 * @param cbe Callback error function
 */
model.listChildren = function (cb, cbe) {

    // no children - abort
    if (!model.me.childrenIds || model.me.childrenIds.length == 0) {
        if (typeof cb === 'function') {
            cb();
        }
        return;
    }

    model.childs.removeAll();

    http().get('/diary/children/list').done(function (data) {

        model.childs.addRange(data);

        if (model.childs.all.length > 0) {
            model.child = model.childs.all[0];
            model.child.selected = true;
        }

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

//builds the set of different subjects encountered in the pedagogic items of the list
model.initSubjects = function () {

    var subjects = [];

    model.pedagogicDays.forEach(function (pedagogicDay) {
        pedagogicDay.pedagogicItemsOfTheDay.forEach(function (pedagogicItem) {
            if (!pedagogicItem) {
                return;
            }
            var subjectName = pedagogicItem.subject;
            if (!_.contains(subjects, subjectName)) {
                subjects.push(subjectName);
            }
        });
    });

    model.searchForm.subjects = subjects;
};

/**
 * Find subject by id
 * @param subjectId
 * @returns {null} Subject with id set
 */
model.findSubjectById = function (subjectId) {

    var subjectMatch = null;

    model.subjects.all.forEach(function (subject) {

        if (subject.id == subjectId) {
            subjectMatch = subject;
        }
    });

    return subjectMatch;
};

/**
 * Find subjects matching label user inputed.
 * @param label Label subject (might be partial, not case sensitive)
 */
model.findSubjectsByLabel = function (label) {

    var subjectsFound = new Array();

    if (label.length > 0) {
        var labelLowerCaseNoAccent = sansAccent(label).toLowerCase();

        model.subjects.all.forEach(function (subject) {
            var labelSubjectLowerCaseNoAccent = sansAccent(subject.label.toLowerCase());

            if (labelSubjectLowerCaseNoAccent.indexOf(labelLowerCaseNoAccent) != -1) {
                subjectsFound.push(subject);
            }
        });
    }

    return subjectsFound;
};

/**
 * Creates new subject
 */
model.createSubject = function (label, cb, cbe) {

    var subject = new Subject();
    subject.label = label;
    subject.save(cb, cbe);
};

/**
 * removes accent from any string
 * @param str
 * @returns {*}
 */
var sansAccent = function sansAccent(str) {
    if (!str) {
        return;
    }
    var accent = [/[\300-\306]/g, /[\340-\346]/g, // A, a
    /[\310-\313]/g, /[\350-\353]/g, // E, e
    /[\314-\317]/g, /[\354-\357]/g, // I, i
    /[\322-\330]/g, /[\362-\370]/g, // O, o
    /[\331-\334]/g, /[\371-\374]/g, // U, u
    /[\321]/g, /[\361]/g, // N, n
    /[\307]/g, /[\347]/g // C, c
    ];
    var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

    for (var i = 0; i < accent.length; i++) {
        str = str.replace(accent[i], noaccent[i]);
    }

    return str;
};


//# sourceMappingURL=app.js.map