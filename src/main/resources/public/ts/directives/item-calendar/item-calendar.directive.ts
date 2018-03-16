import {AngularExtensions} from '../../app';

(function(){
  'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        module.directive("itemCalendar",directive);

        function directive(){
          return {
            restrict : 'E',
            templateUrl : '/diary/public/js/directives/item-calendar/item-calendar.template.html'
          };
        }
    });

})();
