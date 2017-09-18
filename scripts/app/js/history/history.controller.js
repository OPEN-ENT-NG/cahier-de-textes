(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("HistoryController", controller);

        function controller($scope,HistoryService) {
            let vm = this;
            init();
            function init(){
              HistoryService.getFilters(model.me.structures[0]).then((histories)=>{
                  vm.yearHistories = histories;
              });
            }

            vm.loadpdf = function(key,value){
                HistoryService.getPdfArchive(vm.selectedYearItem.yearLabel,vm.toogle,key,value);
            };

        }
    });


})();
