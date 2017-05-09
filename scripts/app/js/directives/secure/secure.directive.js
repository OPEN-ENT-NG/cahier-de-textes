(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.directive('secure', directive);

        function directive(SecureService) {
            return {
                restrict: "A",
                scope: {
                    right : '='
                },
                link: function(scope, element) {
                    SecureService.hasRight(scope.right);
                }
            };
        }
    });
})();
