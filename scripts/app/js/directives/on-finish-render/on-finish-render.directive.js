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
                    console.log("link !");
                    if (scope.$last === true) {
                        console.log("rendered");
                        $timeout(function() {
                          scope.$evalAsync(attr.onFinishRender);
                        });
                    }
                }
            };
        });
    });

})();
