import {AngularExtensions} from '../../../app';

(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.directive('onFinishRender', directive);

        var tooltip ;
        function directive($compile,$timeout) {
            return {
               restrict: 'A',
               link: function (scope, element, attr) {
                   if (scope.$last === true) {
                       element.ready(function () {
                           $timeout(()=>{
                               scope.$eval(attr.onFinishRender);
                           },50);
                       });
                   }
               }

        };
}
    });

})();
