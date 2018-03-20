import {moment, model, $http, _} from 'entcore';

import * as FileSaver from 'file-saver';
/*
 * History service as class
 * used to manipulate History model
 */
export class HistoryService {

    static getFilters(structureId){
        let url = `/diary/history/filters`;

        return $http({
            method : 'GET',
            url : url,
            params : {
                structureId:structureId
            }
        }).then((result)=>{
            return result.data;
        });
    }

    static getPdfArchive(yearLabel,type,teacherId,audienceId,value){
        let url = `/diary/history/pdf`;

        let params:any = {
            yearLabel : yearLabel
        };


        params.teacherId = teacherId;
        params.audienceId = audienceId;


        $http({
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