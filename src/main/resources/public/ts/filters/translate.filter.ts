import { ng, idiom as lang } from 'entcore';

export const translate = ng.filter('translate', () => {

    return (text) => {


        return lang.translate(text);
    };
});

