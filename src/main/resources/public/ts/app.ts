import { angular } from 'entcore';

export const AngularExtensions = {
    moduleConfigs : [],
    addModuleConfig : function(callBack){
        this.moduleConfigs.push(callBack);
    },
    init: function (module) {
        angular.forEach(this.moduleConfigs,function(moduleConfig){
            moduleConfig.apply(this,[module]);
        });
    }
};

export const DATE_FORMAT = 'YYYY-MM-DD';

