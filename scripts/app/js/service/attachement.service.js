(function() {
    'use strict';

    /*
     * Attachement service as class
     * used to manipulate Attachement model
     */
    class AttachementService {


        constructor($http, $q, constants,UtilsService) {
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
            this.UtilsService=UtilsService;

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
    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("AttachementService", AttachementService);
    });

})();
