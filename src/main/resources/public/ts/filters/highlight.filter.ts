import {ng, $sce} from 'entcore';

export const highlight = ng.filter('highlight', () => {

    return (text, phrase) => {


        if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="highlighted">$1</span>');
        return $sce.trustAsHtml(text);
    };
});

