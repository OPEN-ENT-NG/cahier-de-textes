(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.directive('secure', directive);

        function directive(SecureService) {
            return {
                restrict: "A",
                link : function(scope,elem,attrs){
                    if(!SecureService.hasRight(attrs.secure)){
                        elem[0].remove();
                     }
                },
            };
        }
    });
})();
