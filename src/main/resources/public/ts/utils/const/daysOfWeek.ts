import { idiom as lang } from 'entcore';

export const DAYS_OF_WEEK = {
    days: {
        1: 'cdt.utils.day.1',
        2: 'cdt.utils.day.2',
        3: 'cdt.utils.day.3',
        4: 'cdt.utils.day.4',
        5: 'cdt.utils.day.5',
        6: 'cdt.utils.day.6',
        7: 'cdt.utils.day.7',
    },
    get: function (dayNumber: any) {
        return lang.translate(this.days[parseInt(dayNumber)]);
    }
};