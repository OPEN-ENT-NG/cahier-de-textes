import { idiom as lang } from 'entcore';

export const DAYS_OF_WEEK = {
    days: {
        1: 'utils.day.1',
        2: 'utils.day.2',
        3: 'utils.day.3',
        4: 'utils.day.4',
        5: 'utils.day.5',
        6: 'utils.day.6',
        7: 'utils.day.7',
    },
    get: function (dayNumber: any) {
        return lang.translate(this.days[parseInt(dayNumber)]);
    }
};