(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.directive('diaryTimeslotItem', directive);

        function directive() {
            return {
                restrict: "A",
                scope: false,
                link: function(scope, element) {
                    console.log("init diaryTimeslotItem");
                    var timeslot = element;
                    console.log("element : ", element);

                    //var timeslots = element.parent('.days').find('.timeslot');
                    var timeslotsPerDay = $('.days .timeslot').length / 7;
                    var index = scope.$parent.$index * timeslotsPerDay + scope.$index;
                    // allow drag
                    timeslot.on('dragover', function($event) {
                        event.preventDefault();
                    });

                    timeslot.on('dragenter', function(event) {
                        timeslot.css('border', 'blue 2px dashed');
                        timeslot.css('border-radius', '3px');
                        //timeslot.css('background-color', 'blue');
                    });

                    timeslot.on('dragleave', function(event) {
                        //timeslot.css('background-color', '');
                        timeslot.css('border', '');
                        timeslot.css('border-radius', '');
                    });

 

                    timeslot.on('drop', function($event) {
                        $event.preventDefault();
                        console.log(scope);
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

                            newLesson.save(function(data) {
                                window.location = '/diary#/editLessonView/' + newLesson.id;
                            }, function(error) {
                                console.error(error);
                            });
                        }, function(error) {
                            console.error(error);
                        });
                    });




                }
            };
        }
    });
})();
