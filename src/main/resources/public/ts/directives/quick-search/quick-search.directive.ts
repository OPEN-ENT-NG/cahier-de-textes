import {AngularExtensions} from '../../app';

(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){
    /**
         * Directive to perform a quick search among lessons and homeworks
         */
        module.directive('quickSearch', function () {
            return {
                restrict: "E",
                templateUrl: "/diary/public/js/directives/quick-search/quick-search.html",
                scope: {
                    /**
                     * Item type 'lesson' or 'homework'
                     */
                    itemType: "@"
                },
                controller : 'QuickSearchController',
                link: function (scope, element, attrs, location) {
                }
           };
        });

	});

})();
