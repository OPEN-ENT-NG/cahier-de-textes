import {ng} from 'entcore';
import { PEDAGOGIC_TYPES } from '../core/const/pedagogicTypes';

export let pedagogicItemFilter = ng.filter('pedagogicItemFilter', function () {
    return function (items: any[], displaySession: boolean, displayHomework: boolean) {
        if(items !== undefined) {
            return items.filter(i =>
                (displayHomework && !displaySession && i.pedagogicType === PEDAGOGIC_TYPES.TYPE_HOMEWORK) ||
                (displayHomework && displaySession && i.pedagogicType === PEDAGOGIC_TYPES.TYPE_HOMEWORK && !i.session_id) ||
                (displaySession && (i.pedagogicType === PEDAGOGIC_TYPES.TYPE_SESSION || i.pedagogicType === PEDAGOGIC_TYPES.TYPE_COURSE))
            );
        }
    };
});