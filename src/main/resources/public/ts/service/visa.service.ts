import {AngularExtensions} from '../app';
import {_, model, moment} from 'entcore';
import * as FileSaver from 'file-saver';


/*
 * Visa service as class
 * used to manipulate Visa model
 */
export default class VisaService {
    $http: any;
    constants: any;
    $q: any;

    constructor($http, $q, constants) {
        this.$http = $http;
        this.$q = $q;
        this.constants = constants;
    }

    getFilters(structureId) {

        let url = `/diary/visa/filters/${structureId}`;

        return this.$http.get(url).then((result)=>{
            return result.data;
        });
    }

    getInspectorFilters(structureId,inspectorId) {
        let url = `/diary/visa/filtersinspector/${structureId}/${inspectorId}`;
        return this.$http.get(url).then((result)=>{
            return result.data;
        });
    }

    getAgregatedVisas(structureId, filter){
        let url = `/diary/visa/agregs`;
        return this.$http({
            url : url,
            method : 'GET',
            params : {
                structureId : structureId,
                teacherId: filter.teacher && filter.teacher.item ? filter.teacher.item.key : undefined,
                audienceId: filter.audience ? filter.audience.key : undefined,
                subjectId: filter.subject ? filter.subject.key : undefined,
                statut : filter.state.key //? (filter.state.key == "TODO" ? true : undefined): undefined
            }
        }).then((result)=>{
            return result.data;
        });
    }

    applyVisa(applyVisa,lock){
        let url = `/diary/visa/apply/${lock}`;
        return this.$http({
            url : url,
            method : 'POST',
            data : applyVisa
        }).then((result)=>{
            return result.data;
        });
    }

    getLessonForVisa(resultVisaList){
        let url = `/diary/visa/lessons`;
        return this.$http({
            url : url,
            method : 'POST',
            data : resultVisaList
        }).then((result)=>{
            return result.data;
        });
    }

    getPdfForVisa(resultVisaList){
        let url = `/diary/visa/pdf`;
        this.$http({
            url: url,
            method: "POST",
            data: resultVisaList,
            responseType: 'arraybuffer'
        }).success(function (data, status, headers, config) {
            var blob = new Blob([data], {type: " application/pdf"});
            let date = moment().format("YYYY-MM-DD_HH-mm-ss");
            let fileName = `ent-visa-generation_${date}.pdf`;
            FileSaver.saveAs(blob,fileName);
        }).error(function (data, status, headers, config) {
            //upload failed
        });
    }

    applyInspectorRight(structureId,inspectorId,teachers){
        let url = `/diary/inspect/right/${structureId}/${inspectorId}`;
        return this.$http({
            url: url,
            method: "POST",
            data: teachers,
        });
    }

    getInspectTeachers(structureId,inspectorId){
        let url = `/diary/inspect/getTeacher/${structureId}/${inspectorId}`;
        return this.$http({
            url : url,
            method : 'GET'
        }).then((result)=>{
            return result.data;
        });
    }

    getInspectorList(){
        let url = `/diary/inspect/getInspectors`;
        return this.$http({
            url : url,
            method : 'GET'
        }).then((result)=>{
            return result.data;
        });
    }
}


(function () {
    'use strict';
    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("VisaService", VisaService);
    });

})();
