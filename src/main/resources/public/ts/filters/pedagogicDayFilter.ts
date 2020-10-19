import {ng} from 'entcore';
import { PEDAGOGIC_TYPES } from '../core/const/pedagogicTypes';

export let pedagogicDayFilter = ng.filter('pedagogicDayFilter', function () {
    return function (items: any[], displaySession: boolean, displayHomework: boolean) {
        if(items !== undefined) {
            return items.filter(d =>
                d.pedagogicItems.find(i =>
                    (displayHomework && i.pedagogicType === PEDAGOGIC_TYPES.TYPE_HOMEWORK) ||
                    (displaySession && (i.pedagogicType === PEDAGOGIC_TYPES.TYPE_SESSION || i.pedagogicType === PEDAGOGIC_TYPES.TYPE_COURSE))
                )
            );
        }
    };
});