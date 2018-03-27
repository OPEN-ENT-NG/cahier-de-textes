import {ng, _} from 'entcore';

export const arraytostring = ng.filter('arraytostring', () => {

    return (item) => {

        // return the current `item`, but call `toUpperCase()` on it

        if (!item){
            return "";
        }
        let result = "";
        _.each(item,(it)=>{
            result+= it + ",";
        });
        result = result.substring(0,result.length -1);
        return result;
    };

});
