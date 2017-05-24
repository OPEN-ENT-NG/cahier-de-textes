(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
      //controller declaration
      module.value("constants",{
        CAL_DATE_PATTERN : "YYYY-MM-DD",
        CAL_DATE_PATTERN_NG : "dd-MM-yyyy",
        LONG_DATE_PATTERN : 'YYYY-MM-DD hh:mm:ss',
        RIGHTS : {
          CREATE_LESSON : 'diary.createLesson',
          VIEW : 'diary.view',
          CREATE_HOMEWORK_FOR_LESSON : 'createHomeworkForLesson',
          CREATE_FREE_HOMEWORK : 'diary.createFreeHomework',
          MANAGE_MODEL_WEEK : 'diary.manageModelWeek'
        }
      });


  });
  })();