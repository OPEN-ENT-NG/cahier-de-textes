import { model, _} from 'entcore';


export class SecureService {


    static hasRight(right){
        let result = false;
        _.each(model.me.authorizedActions,(authorizedAction)=>{
            if (authorizedAction.displayName === right){
                result=true;
            }
        });
        return result;
    }

}

