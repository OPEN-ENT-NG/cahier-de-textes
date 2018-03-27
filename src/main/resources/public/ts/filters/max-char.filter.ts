import {ng, $sce} from 'entcore';

export const maxChar = ng.filter('maxChar', () => {

    return (item, maxChar) => {
        if (!item) {
            return item;
        }
        if (!item.indexOf) {
            item = item.toString();
        }

        item = item.replace(/<\/?[^>]+(>|$)/g, " ");

        let dynamicMaxChar = maxChar;

        /*if (item.indexOf('</div>') < dynamicMaxChar){
            dynamicMaxChar = item.indexOf('</div>') + 6;
        }*/
        if (item.length < dynamicMaxChar) {
            return item;
        } else {
            return item.substring(0, dynamicMaxChar) + " ...";
        }

    };
});

