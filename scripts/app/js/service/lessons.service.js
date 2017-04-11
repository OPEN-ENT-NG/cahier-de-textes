(function() {
    'use strict';

    /*
    * Lesson service as class
    * used to manipulate Lesson model
    */
    class LessonService {


        constructor($http,$q) {
            this.$http = $http;
            this.$q = $q;
            this.context = {
                'dateFormat' : 'YYYY-MM-DD'
            };
        }


        /**
         * Init lesson
         * @returns {Lesson}
         */
        initLesson (calendarNewItem, selectedDate) {
            var lesson = new Lesson();

            lesson.audience = {}; //sets the default audience to undefined
            lesson.subject = model.subjects.first();
            lesson.audienceType = lesson.audience.type;
            lesson.color = DEFAULT_ITEM_COLOR;
            lesson.state = DEFAULT_STATE;
            lesson.title = lang.translate('diary.lesson.label');

            var newItem = {};

            if(calendarNewItem) {
                newItem = calendarNewItem;

                // force to HH:00 -> HH:00 + 1 hour
                newItem.beginning = newItem.beginning.minute(0).second(0);
                newItem.date = newItem.beginning;

                newItem.end = moment(newItem.beginning);
                newItem.end.minute(0).second(0).add(1, 'hours');
            }
            // init start/end time to now (HH:00) -> now (HH:00) + 1 hour or selectedDate ->
            else {
                var itemDate = (selectedDate) ? moment(selectedDate): moment();

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
        }


    }
    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("LessonService",LessonService);
    });

})();
