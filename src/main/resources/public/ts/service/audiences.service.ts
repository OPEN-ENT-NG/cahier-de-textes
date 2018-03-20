import { angular, _, idiom as lang } from 'entcore';
import http from 'axios';

/*
* Audience service as class
* used to manipulate Audience model
*/
export class AudienceService {
    static context = {
        processesPromise: []
    }
    static getAudiencesAsMap(structureIdArray){
        return this.getAudiences(structureIdArray).then((classes)=>{
            let result = {};
            _.each(classes,(classe)=>{
                result[classe.name] = classe;
            });
            return result;
        });
    }

    /*
    * get classes for all structureIds
    */
    static getAudiences(structureIdArray) {
        //cache the promises, this datas will not change in a uniq session
        let processes = [];
        _.each(structureIdArray,(structureId)=>{

            if (!this.context.processesPromise[structureId]){
                this.context.processesPromise[structureId] = [];
                let url = `/userbook/structure/${structureId}`;
                this.context.processesPromise[structureId] = http.get(url).then((result)=>{
                    return {
                        structureId : structureId,
                        structureData : result.data
                    };
                });
            }
            processes.push(this.context.processesPromise[structureId]);

        });

        //execute promises
        return Promise.all(processes).then((results) => {
            let result = [];
            _.each(results,(datas => {
                let structureId = datas.structureId;
                let structureData = datas.structureData;
                result = result.concat(this.mapAudiences(structureData.classes,structureId));
            }));
            return result;
        });

    }

    /*
    *   map an Audience
    */
    static mapAudiences(classes,structureId){
        return _.map(classes,  (audience) =>{
            audience.structureId = structureId;
            audience.type = 'class';
            audience.typeLabel = lang.translate('diary.audience.class');
            return audience;
        });
    }

};
