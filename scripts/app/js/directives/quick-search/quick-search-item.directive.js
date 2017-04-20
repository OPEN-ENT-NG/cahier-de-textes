(function() {
	'use strict';

	AngularExtensions.addModuleConfig(function(module){

        /**
         * Directive for result items
         */
        module.directive('quickSearchItem', function () {
            return {
                restrict: "E",
                templateUrl: "/diary/public/js/directives/quick-search/quick-search-item.html",
                scope: false,
                link: function (scope, element) {

                    var angElement = angular.element(element);

                    angElement.on('drag', function(){
                        angElement.css('opacity', 0.9);
                    });

                    scope.dragCondition = function (item) {
                        return true;
                    };

                    scope.dropCondition = function (targetItem) {
                        return false;
                    };

                    scope.drag = function(item, $originalEvent) {
                        try {
                            $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
                        } catch (e) {
                            $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
                        }
                    };
                }
            }
        });
	});

})();
