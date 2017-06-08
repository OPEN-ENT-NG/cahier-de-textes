(function() {
    'use strict';

    /*
     * Visa service as class
     * used to manipulate Visa model
     */
    class VisaService {


        constructor($http, $q, constants) {
            this.$http = $http;
            this.$q = $q;
            this.constants = constants;
        }

        getFilters(userStructuresId) {

            var urlGetHomeworks = `/diary/visa/filters/${userStructuresId}`;

            return this.$http.get(urlGetHomeworks).then((result)=>{
                return result.data;
            });
        }

    }
    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("VisaService", VisaService);
    });

})();
