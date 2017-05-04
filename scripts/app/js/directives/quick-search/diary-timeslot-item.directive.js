(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.directive('diaryTimeslotItem', directive);

        function directive(AudienceService,$rootScope) {
            return {
                restrict: "A",
                scope: false,
                link: function(scope, element) {

                    var timeslot = element;

                    let dragCounter = 0;

                    timeslot.on('dragover', function($event) {
                        event.preventDefault();
                    });

                    timeslot.bind('dragenter', onenter);
                    function onenter(event) {
                        dragCounter ++;
                        timeslot.addClass("dragin");
                        //event.preventDefault();
                        return false;
                    }


                    timeslot.bind('dragleave',onleave);
                    function onleave (event) {
                        dragCounter--;
                        if(dragCounter === 0){
                            timeslot.removeClass("dragin");
                        }
                   }

                    timeslot.on('drop', function($event) {
                        console.log($event);

                        let scheduleItem = scope.$parent.item;
                        console.log("scheduleItem",scheduleItem);

                        $event.preventDefault();
                        var timeslotsPerDay = $('.days .timeslot').length / 7;
                        var index = scope.$parent.$index * timeslotsPerDay + scope.$index;
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

                        newLesson.load(false, function() {
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

                            if (scheduleItem){
                                newLesson.date = moment(scheduleItem.startDate);
                                newLesson.startTime=moment(scheduleItem.startDate);
                                newLesson.startMoment=moment(scheduleItem.startDate);
                                newLesson.endTime=moment(scheduleItem.endDate);
                                newLesson.endMoment=moment(scheduleItem.endDate);
                                console.log(newLesson.startTime);
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

                                model.newLesson =newLesson;

                                window.location = '/diary#/createLessonView/timeFromCalendar' ;
                            }else{

                                newLesson.save(function(data) {
                                    window.location = '/diary#/editLessonView/' + newLesson.id;
                                }, function(error) {
                                    console.error(error);
                                });
                            }
                        }, function(error) {
                            console.error(error);
                        });
                    });

                }
            };
        }
    });
})();
