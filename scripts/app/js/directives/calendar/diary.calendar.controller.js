(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.controller("DiaryCalendarController", controller);

        function controller($scope,$timeout) {
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
                    readonly: $scope.readOnly
                };

                $scope.firstDay = !$scope.firstDay ? moment() : $scope.firstDay;

                // create calendar objet
                vm.calendar = new calendar.Calendar({
                    week: moment($scope.firstDay).week(),
                    year: moment($scope.firstDay).year()
                });

                //set items watcher
                $scope.$watch('items', function(n, o) {
                    vm.refreshCalendar();
                });
                // add event listener
                $scope.$on('calendar.refreshItems',function(){
                    console.log("receive calendar refreshitems event");
                    vm.refreshCalendar();
                });

                /**
                 * Used to know if user clicked on calendar event
                 * or is dragging  to prevent ng-click
                 */
                vm.itemMouseEvent = {
                    lastMouseDownTime: undefined,
                    lastMouseClientX: undefined,
                    lastMouseClientY: undefined
                };
            }

            /*
             * refresh calendar every items modification
             */
            vm.refreshCalendar = function() {
                console.log("refresh calendar");
                vm.calendar.clearScheduleItems();

                let scheduleItems = _.where(_.map($scope.items, function(item) {
                    item.beginning = item.startMoment;
                    item.end = item.endMoment;
                    return item;
                }), {
                    is_periodic: false
                });
                vm.calendar.addScheduleItems(scheduleItems);
                $timeout(function(){
                    vm.disposeItems();
                });
            };

            /*
            * dispose item elements
            */
            vm.disposeItems = function(){
                //reinit colmap id
                console.log("disposeItems called");
                _.each(vm.calendar.days.all,(day)=>{
                    vm.eraseColMapId(day);
                });
                //recal all collisions
                _.each(vm.calendar.days.all,(day)=>{
                    //vm.calcAllCollisions(day);
                    _.each(day.scheduleItems.all, (item) => {
                        vm.calcAllCollisions2(item,day);
                    });
                });
                //dispose each items
                _.each(vm.calendar.days.all,(day)=>{
                    _.each(day.scheduleItems.all, (item) => {
                        vm.disposeItem(item,day);
                    });
                });
            };

            /*
            *   erase col map id
            */
            vm.eraseColMapId = function(day){
                _.each(day.scheduleItems.all,(item) =>{
                    delete item.calendarGutter;
                    delete item.colMapId;
                });
            };

            vm.between=function(date,start,end){
                return date.isAfter(start) && date.isBefore(end);
            };

            vm.calcAllCollisions2 = function(item,day){
                var calendarGutter = 0;
                var collision = true;
                while (collision) {
                    collision = false;
                    day.scheduleItems.forEach(function(scheduleItem) {
                        if (scheduleItem === item) {
                            return;
                        }
                        /*if ((scheduleItem.beginning.isBefore(item.end) && scheduleItem.end.isAfter(item.beginning)) ||
                          (scheduleItem.end.isBefore(item.beginning) && scheduleItem.beginning.isAfter(item.end))) {
                          */
                          if( vm.between(item.beginning,scheduleItem.beginning,scheduleItem.end) ||
                              vm.between(item.end,scheduleItem.beginning,scheduleItem.end) ||
                              vm.between(scheduleItem.end,item.beginning,item.end)){
                              console.log("collision found : ", scheduleItem,item);
                            if (scheduleItem.calendarGutter === calendarGutter) {
                                calendarGutter++;
                                collision = true;
                            }
                        }else{
                            console.log("no collision found : ", scheduleItem,item);
                        }
                    });
                }
                item.calendarGutter = calendarGutter;
            };

            /*
            * Calc all colision map
            */
            vm.calcAllCollisions = function(day){
                let collisionMap = {};
                //erase old mapId referencies

                //cal collisionMap
                _.each(day.scheduleItems.all,(item) =>{
                    vm.getItemCollisions(collisionMap,item,day);
                });

                //set indent id
                _.each(collisionMap,(inCollision) => {
                    var calendarGutter = 0;
                    // sort collision array to have decrease aparence
                    inCollision.sort(function(itema,itemb){
                        return itema.startMoment.isAfter(itemb.startMoment);
                    });
                    _.each(inCollision,function(items){
                        items.calendarGutter=calendarGutter++;
                    });
                });
                console.log("collisionMap",collisionMap);
            };

            /*
            *   populate the collision map for each item
            */
            vm.getItemCollisions = function(collisionMap,item,day){

                if(item.colMapId !== undefined){
                    return;
                }

                var collisionArray = [item];
                let colMapId;
                //collisionArray = collisionMap[item.colMapId];

                //get all collisions in an array
                _.each(day.scheduleItems.all,(scheduleItem) =>{
                    if (scheduleItem!==item && scheduleItem.beginning < item.end && scheduleItem.end > item.beginning) {
                        //scheduleItem.colMapId = item.colMapId;
                        if(scheduleItem.colMapId !== undefined){
                            console.log("foundColMapId",scheduleItem.colMapId);
                            colMapId = scheduleItem.colMapId;
                        }else{
                            collisionArray.push(scheduleItem);
                        }
                    }
                });

                //if not indexed
                if(colMapId === undefined){
                    colMapId = Object.keys(collisionMap).length;
                    collisionMap[colMapId]=[];
                }
                // set colMapId
                collisionArray = _.map(collisionArray, (it) => {
                    console.log("set colMapId",colMapId);
                    it.colMapId = colMapId;
                    return it;
                });

                collisionMap[colMapId] = collisionMap[colMapId].concat(collisionArray);
            };


            /*
            * dispose on item
            */
            vm.disposeItem = function(item,day){
                if (!item.$element){
                    console.log("no element founds");
                    return ;
                }
                var element = item.$element;

                var parentSchedule = element.parents('.schedule');
                var scheduleItemEl = element.children('.schedule-item');

                var cellWidth = element.parent().width() / 12;
                var startDay = item.beginning.dayOfYear();
                var endDay = item.end.dayOfYear();

                var hours = calendar.getHours(item, day);
                var itemWidth = day.scheduleItems.scheduleItemWidth(item);

                var dayWidth = parentSchedule.find('.day').width();

                scheduleItemEl.css({
                    width: itemWidth + '%'
                });

                var calendarGutter = 0;

                var beginningMinutesHeight = item.beginning.minutes() * calendar.dayHeight / 60;
                var endMinutesHeight = item.end.minutes() * calendar.dayHeight / 60;
                var top = (hours.startTime - calendar.startOfDay) * calendar.dayHeight + beginningMinutesHeight;
                scheduleItemEl.height(((hours.endTime - hours.startTime) * calendar.dayHeight - beginningMinutesHeight + endMinutesHeight) + 'px');

                scheduleItemEl.css({
                    top: top + 'px',
                    left: (item.calendarGutter * (itemWidth * dayWidth / 100)) + 'px'
                });

                var container = element.find('container');
                if (top < 0) {
                    container.css({
                        top: (Math.abs(top) - 5) + 'px'
                    });
                    container.height(element.children('.schedule-item').height() + top + 5);
                } else {
                    container.css({
                        top: 0 + 'px'
                    });
                    container.css({
                        height: '100%'
                    });
                }
            };


            /*
             *   edit item
             *  TODO unused??
             */
            /*$scope.editItem = function(item) {
                $scope.calendarEditItem = item;
                vm.display.editItem = true;
            };*/

            vm.createItem = function(day, timeslot) {
                $scope.newItem = {};
                var year = vm.calendar.year;
                if (day.index < vm.calendar.firstDay.dayOfYear()) {
                    year++;
                }
                $scope.newItem.beginning = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.start);
                $scope.newItem.end = moment().utc().year(year).dayOfYear(day.index).hour(timeslot.end);
                vm.calendar.newItem = $scope.newItem;
                $scope.onCreateOpen();
            };

            vm.closeCreateWindow = function() {
                vm.display.createItem = false;
                $scope.onCreateClose();
            };

            vm.updateCalendarWeek = function() {
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

            $scope.previousTimeslots = function() {
                calendar.startOfDay--;
                calendar.endOfDay--;
                vm.calendar = new calendar.Calendar({
                    week: moment(vm.calendar.dayForWeek).week(),
                    year: moment(vm.calendar.dayForWeek).year()
                });
                vm.refreshCalendar();
            };

            $scope.nextTimeslots = function() {
                calendar.startOfDay++;
                calendar.endOfDay++;
                vm.calendar = new calendar.Calendar({
                    week: moment(vm.calendar.dayForWeek).week(),
                    year: moment(vm.calendar.dayForWeek).year()
                });
                vm.refreshCalendar();
            };

            $scope.onCreateOpen = function() {
                /*if (!allowCreate) {
                    return;
                }*/

                $scope.onCreateOpenAction();
                //$scope.$eval(attributes.onCreateOpen);
                vm.display = {
                    createItem: true
                };
            };
            $scope.onCreateClose = function() {
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
            $scope.openOnClickSaveOnDrag = function(item, $event) {

                return ;
                console.log("openOnClickSaveOnDrag called");
                var path = '/editLessonView/' + item.id;

                // gap between days is quite important
                var xMouseMoved = Math.abs(vm.itemMouseEvent.lastMouseClientX - $event.clientX) > 30;
                // gap between minutes is tiny so y mouse move detection must be accurate
                // so user can change lesson time slightly
                var yMouseMoved = Math.abs(vm.itemMouseEvent.lastMouseClientY - $event.clientY) > 0;

                // fast click = no drag = real click
                // or cursor did not move
                if ((!xMouseMoved && !yMouseMoved) || (new Date().getTime() - vm.itemMouseEvent.lastMouseDownTime) < 300) {
                    // do not redirect to lesson view if user clicked on checkbox
                    if (!($event.target && $event.target.type === "checkbox")) {
                        $scope.redirect(path);
                    }
                }else{
                    $timeout(vm.refreshCalendar);
                }
            };

        }

    });

})();
