import { angular, ng, model, moment, _, calendar, Model } from 'entcore';
import {DiaryController} from './controller';

ng.controllers.push(DiaryController);


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