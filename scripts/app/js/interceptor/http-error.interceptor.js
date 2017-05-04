(function() {
    'use strict';

    AngularExtensions.addModuleConfig(function(module) {

        module.config(function($httpProvider) {
            $httpProvider.interceptors.push(['$q', '$location', function ($q, $location) {

                    function parseError(e){
                        var error = e;

                        if (!error.error){
                          error.error = "diary.error.unknown";
                        }                          
                        return error;
                    }

                    return {
                        'responseError': function(response) {
                            if(response.status === 400) {
                                console.warn("error execution request");
                                console.warn(response);
                                let error = parseError(response.data);
                                notify.error(error.error);
                            }
                            return $q.reject();
                        }
                    };
                }]);
        });
    });
})();
