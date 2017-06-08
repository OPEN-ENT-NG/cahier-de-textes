(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        /**
         * Directive for result items
         */
        module.directive('searchDropDown', function() {
            return {
                restrict: "E",
                templateUrl: "/diary/public/js/directives/search-drop-down/search-drop-down.template.html",
                scope: {
                    items: '=',
                    showExpression : '@',
                    selectedItem: '=',
                    placeHolder : '@',
                    freeField : '='
                },
                controller: 'SearchDropDownController'
            };
        });

        module.controller("SearchDropDownController", controller);

        function controller($scope,$sce,$timeout) {

            $scope.showDropDown = false;
            if (!$scope.showExpression){
                $scope.showExpression = 'item';
            }

            $scope.$watch('items',init);
            $scope.$watch('searchFilter',init);

            function init() {
                $scope.itemsToShow = $scope.items.map((item)=>{
                    let result = "";
                    let value = eval($scope.showExpression);
                    let hightlightedText= highlight(value,$scope.searchFilter);
                    return {
                        text : value,
                        hightlightedText : hightlightedText,
                        item : item
                    };
                });

                $scope.itemsToShow = $scope.itemsToShow.filter((e)=>{
                    if (!e.text || !$scope.searchFilter){
                        return true;
                    }
                    return e.text.toLowerCase().indexOf($scope.searchFilter.toLowerCase())>-1;
                });
                console.log($scope.itemsToShow);
            }

            function highlight(text, phrase) {
                if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
                return text;
            }
            $scope.eraseSelected = function($event){
                $scope.selectedItem=undefined;
                angular.element($event.target).parent().parent().find('input')[0].focus();
            };
            $scope.selectItem = function(option){
                $scope.searchFilter =undefined;
                $scope.selectedItem = option;
                $scope.showDropDown=false;
            };
            $scope.blur = function(){
                $timeout(()=>{
                    $scope.showDropDown = false;
                });
            };
            $scope.enter = function(keyEvent){

                if (keyEvent.which === 13){
                    if (!$scope.searchFilter){
                        return;
                    }
                    let item = $scope.itemsToShow.find((e)=>{
                        return e.text.toLowerCase() === $scope.searchFilter.toLowerCase();
                    });
                    if (item){
                        $scope.selectItem(item);
                    }
                }
            };
            $scope.change = function(){
                $scope.showDropDown = $scope.searchFilter.length>0;
                $scope.selectedItem = undefined;
            };
        }

    });

})();
