import {ng, $sce} from 'entcore';

export const trusthtml = ng.filter('trusthtml', () => {

    return (text) => {

        return $sce.trustAsHtml(text);
    };
});

