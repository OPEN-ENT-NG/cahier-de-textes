import { model, ng } from 'entcore';
import {HistoryService} from "../services/history.service";

export const HistoryController = ng.controller('HistoryController',
    ['$scope', ($scope) => {
        let vm = this;
        init();
        function init(){
            HistoryService.getFilters(model.me.structures[0]).then((histories)=>{
                vm.yearHistories = histories;
            });
        }

        vm.loadpdf = function(key,value){
            let teacherId,audienceId;
            if (vm.toogle==='teacher'){
                teacherId=key;
            }else{
                audienceId=key;
                if (model.isUserTeacher()){
                    teacherId = model.me.userId;
                }
            }

            HistoryService.getPdfArchive(vm.selectedYearItem.yearLabel,vm.toogle,teacherId,audienceId,value);
        };

    }]);
