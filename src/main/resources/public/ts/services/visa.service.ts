import {_, model, moment, $http} from 'entcore';
import * as FileSaver from 'file-saver';
import http from 'axios';


/*
 * Visa service as class
 * used to manipulate Visa modelH
 */
export class VisaService {

    static getFilters(structureId) {

        let url = `/diary/visa/filters/${structureId}`;

        return http.get(url).then((result)=>{
            return result.data;
        });
    }

    static getInspectorFilters(structureId,inspectorId) {
        let url = `/diary/visa/filtersinspector/${structureId}/${inspectorId}`;
        return http.get(url).then((result)=>{
            return result.data;
        });
    }

    static getAgregatedVisas(structureId, filter){
        let url = `/diary/visa/agregs`;
        return http({
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

    static applyVisa(applyVisa,lock){
        let url = `/diary/visa/apply/${lock}`;
        return http({
            url : url,
            method : 'POST',
            data : applyVisa
        }).then((result)=>{
            return result.data;
        });
    }

    static getLessonForVisa(resultVisaList){
        let url = `/diary/visa/lessons`;
        return http({
            url : url,
            method : 'POST',
            data : resultVisaList
        }).then((result)=>{
            return result.data;
        });
    }

    static getPdfForVisa(resultVisaList){
        let url = `/diary/visa/pdf`;
        http({
            url: url,
            method: "POST",
            data: resultVisaList,
            responseType: 'arraybuffer'
        }).then(function (data) {
            var blob = new Blob([data], {type: " application/pdf"});
            let date = moment().format("YYYY-MM-DD_HH-mm-ss");
            let fileName = `ent-visa-generation_${date}.pdf`;
            FileSaver.saveAs(blob,fileName);
        });
    }

    static applyInspectorRight(structureId,inspectorId,teachers){
        let url = `/diary/inspect/right/${structureId}/${inspectorId}`;
        return http({
            url: url,
            method: "POST",
            data: teachers,
        });
    }

    static getInspectTeachers(structureId,inspectorId){
        let url = `/diary/inspect/getTeacher/${structureId}/${inspectorId}`;
        return http({
            url : url,
            method : 'GET'
        }).then((result)=>{
            return result.data;
        });
    }

    static getInspectorList(){
        let url = `/diary/inspect/getInspectors`;
        return http({
            url : url,
            method : 'GET'
        }).then((result)=>{
            return result.data;
        });
    }
}
