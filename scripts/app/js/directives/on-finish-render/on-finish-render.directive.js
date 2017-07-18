(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        /**
         * Directive for result items
         */
        module.directive('onFinishRender', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    if (scope.$last === true) {                        
                        $timeout(function() {
                          scope.$evalAsync(attr.onFinishRender);
                        });
                    }
                }
            };
        });
    });

})();
