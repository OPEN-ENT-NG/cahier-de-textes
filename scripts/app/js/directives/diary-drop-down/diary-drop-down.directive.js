(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        module.directive('diaryDropDown', function() {
            return {
                restrict: "E",
                templateUrl: "diary/public/js/directives/diary-drop-down/diary-drop-down.template.html",
                scope: {
                    placeholder: "@",
                    list: "=",
                    selected: "=",
                    property: "@",
                    nullable:"="
                },
                controller: function($scope) {
                    $scope.selectItem = function(item) {
                        if ($scope.list) {
                            $scope.list.map((e) => {
                                e.selected = false;
                            });
                            if (item){
                                item.selected = true;
                            }                            
                            $scope.selected = item;
                            $scope.listVisible = false;
                        }
                    };
                },
                link: function(scope, element, attr) {

                    $(document).bind('click', function(event) {
                        var isClickedElementChildOfPopup = element
                            .find(event.target)
                            .length > 0;

                        if (isClickedElementChildOfPopup)
                            return;

                        scope.$apply(function() {
                            scope.listVisible = false;
                        });
                    });
                }
            };
        });
    });

})();
