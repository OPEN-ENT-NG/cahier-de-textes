import {  _ } from 'entcore';
import {AngularExtensions} from '../app';

import {Attachment} from '../model/Attachment.model';


/*
 * Attachement service as class
 * used to manipulate Attachement model
 */
export default class AttachementService  {

    $http: any;
    $q: any;
    constants: any;
    $sce: any;

    constructor($http, $q, constants ) {
        this.$http = $http;
        this.$q = $q;
        this.constants = constants;

    }

    /*
    *   Mapp homeworks
    */
    mappAttachement(attachements){
        return _.map(attachements,(attachementData) =>{
            var att = new Attachment();
            att.id = attachementData.id;
            att.user_id = attachementData.user_id;
            att.creation_date = attachementData.creation_date;
            att.document_id = attachementData.document_id;
            att.document_label = attachementData.document_label;

            return att;
        });
    }



}


(function () {
    'use strict';

    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("AttachementService", AttachementService);
    });

})();
