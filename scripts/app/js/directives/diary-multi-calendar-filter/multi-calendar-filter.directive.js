(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        /**
         * Directive for result items
         */
        module.directive('diaryMultiCalendarFilter', function() {
            return {
                restrict: "E",
                templateUrl: "/diary/public/js/directives/diary-multi-calendar-filter/diary-multi-calendar-filter.template.html",
                scope: {
                    structure: '=',
                    audience: '=',
                    teacher: '='
                },
                controller: 'diaryMultiCalendarFilterController as diaryMultiCalendarFilterCtrl'
            };
        });

        module.controller("diaryMultiCalendarFilterController", controller);

        function controller($scope,SecureService,VisaService,constants) {

            let vm = this;
            let promiseFilter;
            $scope.RIGHTS = constants.RIGHTS;
            vm.filters = {};

            vm.getFilters = function(structureId){
                if (!promiseFilter) {
                    if (SecureService.hasRight(constants.RIGHTS.VISA_ADMIN)){
                        promiseFilter= VisaService.getFilters(structureId);
                    }else if (SecureService.hasRight(constants.RIGHTS.VISA_INSPECTOR)){
                        promiseFilter = VisaService.getInspectorFilters(structureId,model.me.userId);
                    }
                }
                if(promiseFilter){
                  promiseFilter.then((filters)=>{
                      vm.filters = filters;
                  });
                }
            };

            init();
            function init(){
                $scope.$watch("audience",(n,o)=>{
                    if (n){
                        $scope.teacher= undefined;
                    }
                });
                $scope.$watch("teacher",(n,o)=>{
                    if (n){
                        $scope.audience= undefined;
                    }
                });
                $scope.$watch("structure",(n,o)=>{
                    if (n !== o && n ){
                        vm.getFilters(n.id);
                    }
                });
                if ($scope.structure){
                    vm.getFilters($scope.structure.id);
                }
            }


        }

    });

})();
