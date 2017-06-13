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

            let url = `/diary/visa/filters/${userStructuresId}`;

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
                    teacherId: filter.teacher ? filter.teacher.key : undefined,
                    audienceId: filter.audience ? filter.audience.key : undefined,
                    subjectId: filter.subject ? filter.subject.key : undefined,
                    showTodoOnly : filter.state ? (filter.state.key = "TODO" ? true : undefined): undefined
                }
            }).then((result)=>{
                return result.data;
            });
        }

        applyVisa(applyVisa){
          let url = `/diary/visa/apply`;
          return this.$http({
              url : url,
              method : 'POST',
              data : applyVisa
          }).then((result)=>{
              return result.data;
          });
        }

    }
    /* create singleton */
    AngularExtensions.addModuleConfig(function(module) {
        module.service("VisaService", VisaService);
    });

})();
