import {AngularExtensions} from '../app';
import {moment, model, _} from 'entcore';

import * as FileSaver from 'file-saver';
/*
 * History service as class
 * used to manipulate History model
 */
export default class HistoryService {

    $http: any;
    $q: any;
    constants: any;


    constructor($http, $q, constants) {
        this.$http = $http;
        this.$q = $q;
        this.constants = constants;
    }

    getFilters(structureId){
        let url = `/diary/history/filters`;

        return this.$http({
            method : 'GET',
            url : url,
            params : {
                structureId:structureId
            }
        }).then((result)=>{
            return result.data;
        });
    }

    getPdfArchive(yearLabel,type,teacherId,audienceId,value){
        let url = `/diary/history/pdf`;

        let params:any = {
            yearLabel : yearLabel
        };


        params.teacherId = teacherId;
        params.audienceId = audienceId;


        this.$http({
            url: url,
            method: "GET",
            params: params,
            responseType: 'arraybuffer'
        }).success(function (data, status, headers, config) {
            var blob = new Blob([data], {type: " application/pdf"});
            let date = moment().format("YYYY-MM-DD_HH-mm-ss");
            let fileName = `CDT-archive_${value}_${yearLabel}.pdf`;
            FileSaver.saveAs(blob,fileName);
        }).error(function (data, status, headers, config) {
            //upload failed
        });
    }

}


(function () {
    'use strict';
    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("HistoryService", HistoryService);
    });

})();
