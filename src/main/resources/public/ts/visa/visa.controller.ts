import {AngularExtensions} from '../app';
import { angular, model, _, idiom as lang, notify } from 'entcore';

(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {
        //controller declaration
        module.controller("VisaManagerController", controller);

        function controller($scope, $rootScope,$routeParams,VisaService,$window,$timeout,SecureService,constants) {
            let vm = this;

            vm.items = [{name : 'teacher1'},{name : 'teacher2'}];
            init();
            function init(){
                var getFilterPromise;
                if (SecureService.hasRight(constants.RIGHTS.VISA_ADMIN)){
                    getFilterPromise = VisaService.getFilters(model.me.structures[0]);
                }else if (SecureService.hasRight(constants.RIGHTS.VISA_INSPECTOR)){
                    getFilterPromise= VisaService.getInspectorFilters(model.me.structures[0],model.me.userId);
                }

                getFilterPromise.then((filters)=>{
                    vm.filters = filters;
                    vm.filters.states = [
                        { key : 'TODO_ONLY', value :lang.translate('diary.visa.state.todo')},
                        { key :'ALL' , value :lang.translate('diary.visa.state.all')},
                        { key :'DID_ONLY' , value :lang.translate('diary.visa.state.did')}
                    ];
                    vm.filter = {
                        state : vm.filters.states[0]
                    };
                });

            }

            vm.listLessonHeight = function(){
                vm.lessonHeight = ($('.popup-visa-lesson-list .content').innerHeight() -
                     $('.popup-visa-lesson-list .forheigth > h1').outerHeight() -
                    $($('.popup-visa-lesson-list .forheigth > div')[0]).outerHeight() -
                    50 ) + 'px';
                setTimeout(()=>{
                    vm.listLessonHeight();
                    $scope.$apply();
                },500);
            };

            vm.searchAvailable = function(){
              return vm.filter && (vm.filter.teacher || vm.filter.subject || vm.filter.audience);
            };
            vm.search = function(){
                VisaService.getAgregatedVisas(model.me.structures[0],vm.filter).then((result)=>{
                    vm.agregatedVisa = result;
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
                    nbLesson : vm.getNbLesson(vm.currentAgregVisas),
                    nbTeacher : vm.getNbProps(vm.currentAgregVisas,"teacherId"),
                    nbSubject : vm.getNbProps(vm.currentAgregVisas,"subjectId"),
                    nbAudience : vm.getNbProps(vm.currentAgregVisas,"audienceId")
                };
            };

            vm.getNbLesson = function(agregVisas){
                return agregVisas.reduce((acc,e) =>{
                    return acc +
                      e.nbNotVised + (e.visas[0] ? e.visas[0].nbDirty : 0);
                },0);
            };

            vm.getNbProps = function(agregVisas,props){
                let map = {};
                agregVisas.map((e)=>{
                    map[e[props]] = true;
                });
                return Object.keys(map).length;
            };

            vm.createLightVisas = function(agregVisas){
                return _.map(agregVisas,(e)=>{
                  let result = angular.copy(e);
                  delete result.visas;
                  return result;
              });
          };

            vm.applyVisa = function(withLock){
                applyVisa(vm.currentAgregVisas,withLock);
            };


            function applyVisa(agregVisas,lock){
                let applyVisa = {
                    comment : vm.comment,
                    resultVisaList: vm.createLightVisas(agregVisas),
                    ownerId : model.me.userId,
                    ownerName : model.me.username,
                    ownerType : SecureService.hasRight(constants.RIGHTS.VISA_ADMIN) ? 'director' : 'inspector'
                };
                VisaService.applyVisa(applyVisa,lock).then(()=>{
                    vm.closeAllPopup();
                    vm.search();
                    //notify.info(lang.translate('progression.progression.saved'));
                    notify.info(lang.translate("diary.visa.notify.saved"));
                });
            }

            vm.closeAllPopup = function(){
                $rootScope.$broadcast('closeallpop');
            };

            vm.showDetailVisa = function(agregVisa){
                vm.currentAgregVisas = [agregVisa];
                VisaService.getLessonForVisa(vm.currentAgregVisas).then((lessons) =>{
                  vm.selectedLessons = lessons;
                });
            };
            vm.initSelectContent = function(){
                vm.currentAgregVisas = vm.selectedContent();
            };

            vm.showSelected = function(){
                vm.currentAgregVisas = vm.selectedContent();
                VisaService.getLessonForVisa(vm.createLightVisas(vm.currentAgregVisas)).then((lessons) =>{
                  vm.selectedLessons = lessons;
                });
            };

            vm.checkAll = function(checkAll){
                vm.agregatedVisa.map((e)=>{
                    if ((e.nbNotVised + (e.visas[0] ? e.visas[0].nbDirty : 0))  > 0){
                        e.selected = checkAll;
                    }
                });
            };

            vm.closepopup = function(){
              $rootScope.$broadcast('closeallpop');
            };

            vm.pdf = function(){
                VisaService.getPdfForVisa(vm.createLightVisas(vm.currentAgregVisas));
            };
        }
    });


})();
