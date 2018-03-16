import {module} from 'entcore';

(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
      //controller declaration
      module.value("constants",{
        CAL_DATE_PATTERN : "YYYY-MM-DD",
        CAL_DATE_PATTERN_NG : "dd-MM-yyyy",
        CAL_DATE_PATTERN_SLASH : "dd/MM/yyyy",
        LONG_DATE_PATTERN : 'YYYY-MM-DD hh:mm:ss',
        RIGHTS : {
          CREATE_LESSON : 'diary.createLesson',
          VIEW : 'diary.view',
          CREATE_HOMEWORK_FOR_LESSON : 'createHomeworkForLesson',
          CREATE_FREE_HOMEWORK : 'diary.createFreeHomework',

          MANAGE_MODEL_WEEK : 'diary.manageModelWeek.update',
          MANAGE_HISTORY : 'diary.manageHistory.apply',
          SHOW_HISTORY : 'diary.showHistory.filters',
          VISA_APPLY_VISA : "diary.visa.applyvisa",
          VISA_INSPECTOR : "diary.visa.inspect.filters",
          VISA_ADMIN : "diary.visa.admin.filters",
          MANAGE_INSPECTOR : "diary.manageInspect.apply",
          SHOW_OTHER_TEACHER : "diary.view.otherteacher"
        }
      });
  });
  })();
