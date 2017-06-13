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
                        //{ key :'DID', value  :lang.translate('diary.visa.state.did')},
                        { key :'ALL' , value :lang.translate('diary.visa.state.all')},
                    ];
                });
            }

            vm.search = function(){
                VisaService.getAgregatedVisas(model.me.structures[0],vm.filter).then((result)=>{
                    vm.agregatedVisa = result;
                    console.log(vm.agregatedVisa);
                });

            };

            vm.selectedContent = function(){
                if (!vm.agregatedVisa){
                    return [];
                }
                return vm.agregatedVisa.filter((e)=>{
                    return e.selected;
                });
            };

            vm.calcRecapSelected = function(){
                vm.recap = {
                    nbLesson : vm.getNbLesson(),
                    nbTeacher : vm.getNbProps("teacherId"),
                    nbSubject : vm.getNbProps("subjectId"),
                    nbAudience : vm.getNbProps("audienceId")
                };
                console.log("recap",vm.recap);
            };

            vm.getNbLesson = function(){
                return vm.selectedContent().reduce((acc,e) =>{
                    return acc +
                      e.nbNotVised + (e.visas[0] ? e.visas[0].nbDirty : 0);
                },0);
            };

            vm.getNbProps = function(props){
                let map = {};
                vm.selectedContent().map((e)=>{
                    map[e[props]] = true;
                });
                return Object.keys(map).length;
            };

            vm.applyVisa = function(withLock){
                let applyVisa = {
                    comment : vm.comment,
                    resultVisaList:vm.selectedContent(),
                    ownerId : model.me.userId,
                    ownerName : model.me.username,
                    ownerType : 'director'
                };
                VisaService.applyVisa(applyVisa).then(()=>{
                    vm.search();
                });
            };

            vm.showSelected = function(){

            };

            vm.pdf = function(){

            };
        }
    });


})();
