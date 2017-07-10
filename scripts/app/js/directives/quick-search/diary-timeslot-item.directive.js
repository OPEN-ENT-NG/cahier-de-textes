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

                   function extractBeginEnd(){
                       var begin = moment().startOf('year').add(scope.day.index - 1,'d');
                       var end = moment(begin);
                       begin = begin.add(scope.timeslot.start,'h');
                       end = end.add(scope.timeslot.end,'h');
                       return {
                           startDate : begin,
                           endDate : end
                       };
                   }

                   function initLessonFromProgression(lesson,pedagogicItemOfTheDay){

                       lesson.id = null;
                       // startTime and end format from db is "HH:MM:SS" as text type
                       // for lesson save startTime need to be moment time type with date
                       lesson.title=pedagogicItemOfTheDay.title;
                       lesson.description=pedagogicItemOfTheDay.description;
                       lesson.color=pedagogicItemOfTheDay.color;
                       lesson.subject= pedagogicItemOfTheDay.subject;
                       lesson.annotations=pedagogicItemOfTheDay.annotations;
                       lesson.type_item = 'progression';
                       lesson.homeworks = new Collection();
                       if (pedagogicItemOfTheDay.homeworks && pedagogicItemOfTheDay.homeworks.length>0){
                           lesson.homeworks.all = _.map(pedagogicItemOfTheDay.homeworks,(homework)=>{
                               let hw = new Homework();
                               _.each(Object.keys(homework),(key)=>{
                                   hw[key] = homework[key];
                               });
                               return hw;
                           });
                       }

                       let timeslotDates = extractBeginEnd();

                       lesson.date = moment(timeslotDates.startDate);
                       lesson.startTime=moment(timeslotDates.startDate);
                       lesson.startMoment=moment(timeslotDates.startDate);
                       lesson.endTime=moment(timeslotDates.endDate);
                       lesson.endMoment=moment(timeslotDates.endDate);



                       model.newLesson =lesson;
                       console.log(model.newLesson);
                       window.location = '/diary#/createLessonView/timeFromCalendar' ;

                   }


                    timeslot.on('drop', function($event) {
                       timeslot.removeClass("dragin");
                        let scheduleItem = scope.$parent.item;

                        $event.preventDefault();
                        var timeslotsPerDay = $('.days .timeslot').length / 7;
                        var index = scope.$parent.$index * timeslotsPerDay + scope.$index;
                        timeslot.css('background-color', '');

                        // duplicate dragged lesson
                        var pedagogicItemOfTheDay = JSON.parse($event.originalEvent.dataTransfer.getData("application/json"));


                        if (pedagogicItemOfTheDay.type_item !== 'lesson' && pedagogicItemOfTheDay.type_item !== 'progression' && pedagogicItemOfTheDay.type_item !== 'homework') {
                            return;
                        }

                        var newLessonDayOfWeek = Math.floor(index / timeslotsPerDay) + 1;
                        var newLessonStartTime = model.startOfDay + (index % timeslotsPerDay);
                        var newLessonEndTime = newLessonStartTime + 1;

                        if (pedagogicItemOfTheDay.type_item === 'homework'){
                            copyHomework(pedagogicItemOfTheDay,scheduleItem);
                            return;
                        }

                        var newLesson = new Lesson();
                        newLesson.id = pedagogicItemOfTheDay.id;

                        // do not drop if item type is not a lesson
                        if (pedagogicItemOfTheDay.type_item === 'progression') {
                            initLessonFromProgression(newLesson,pedagogicItemOfTheDay);
                            return;
                        }

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

                    function copyHomework(pedagogicItemOfTheDay){
                        let timeslotDates = extractBeginEnd();
                        console.log(timeslotDates);
                        console.log(pedagogicItemOfTheDay);

                        var homework = new Homework();
                        homework.dueDate = moment(timeslotDates.startDate);
                        homework.date = moment(timeslotDates.startDate);
                        homework.type = _.findWhere(model.homeworkTypes.all,{'label' : pedagogicItemOfTheDay.type_homework} );
                        homework.subject = _.findWhere(model.subjects.all,{'label' : pedagogicItemOfTheDay.subject} );
                        homework.audience = _.findWhere(model.audiences.all,{'name' : pedagogicItemOfTheDay.audience} );
                        homework.title = pedagogicItemOfTheDay.title;
                        homework.description = pedagogicItemOfTheDay.description;
                        homework.color = pedagogicItemOfTheDay.color;
                        homework.state = 'draft';
                        /*
                        lesson.date = moment(timeslotDates.startDate);
                        lesson.startTime=moment(timeslotDates.startDate);
                        lesson.startMoment=moment(timeslotDates.startDate);
                        lesson.endTime=moment(timeslotDates.endDate);
                        lesson.endMoment=moment(timeslotDates.endDate);
                        */


                        $rootScope.$broadcast('edit-homework',homework);


                    }

                }
            };
        }
    });
})();
