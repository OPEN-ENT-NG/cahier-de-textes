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
            $scope.RIGHTS = constants.RIGHTS;
            vm.filters = {};
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

            vm.getFilters = function(structureId){

                if (SecureService.hasRight(constants.RIGHTS.VISA_ADMIN)){
                    VisaService.getFilters(structureId).then((filters)=>{
                        vm.filters = filters;
                    });
                }else if (SecureService.hasRight(constants.RIGHTS.VISA_INSPECTOR)){
                    VisaService.getInspectorFilters(structureId,model.me.userId).then((filters)=>{
                        vm.filters = filters;
                    });
                }
            };
        }

    });

})();
