import { model, _} from 'entcore';
import {AngularExtensions} from '../../app';

(function() {
    'use strict';


    class SecureService {


        constructor() {
        }

        hasRight(right){
            let result = false;            
            _.each(model.me.authorizedActions,(authorizedAction)=>{
                if (authorizedAction.displayName === right){
                    result=true;
                }
            });
            return result;
        }

    }

    AngularExtensions.addModuleConfig(function(module) {
        module.service("SecureService",SecureService);
    });

})();
