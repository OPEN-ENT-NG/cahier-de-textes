(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
    /**
         * Directive to perform a quick search among lessons and homeworks
         */
        module.directive('rightPanel', function () {
            return {
                restrict: "E",
                templateUrl: "/diary/public/js/progression/right-panel/right-panel.html",
                scope: {
                   label : '@',
                   contentUrl : '='
                },
                controller : 'RightPanelController'
           };
        });

	});

})();
