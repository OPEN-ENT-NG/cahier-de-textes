import { ng } from 'entcore';

export const formatHour = ng.filter('formatHour', () => {

    return (text) => {



        if (!text){
            return text;
        }
        return text.substring(0,5).replace(":","h");
    };
});
