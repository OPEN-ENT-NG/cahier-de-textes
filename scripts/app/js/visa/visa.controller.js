(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("VisaManagerController", controller);

        function controller($scope, $rootScope,$routeParams,VisaService) {
            let vm = this;

            vm.items = [{name : 'teacher1'},{name : 'teacher2'}];
            init();
            function init(){
                VisaService.getFilters(model.me.structures[0]).then((filters)=>{
                    vm.filters = filters;
                    vm.filters.states = [
                        { key : 'TODO', value :lang.translate('diary.visa.state.todo')},
                        { key :'DID', value  :lang.translate('diary.visa.state.did')},
                        { key :'ALL' , value :lang.translate('diary.visa.state.all')},
                    ];
                });
            }

            vm.search = function(){
                console.log(vm.filter);
            };
        }
    });


})();
