import { _, moment } from 'entcore';

export class PedagogicDay {
    selected = false;
    dayName = moment().format("dddd DD MMMM YYYY");
    shortName = this.dayName.substring(0,2);
    shortDate = moment().format("DD/MM");
    pedagogicItemsOfTheDay = [];
    nbLessons = 0;
    nbHomeworks = 0;

    constructor() { }

    numberOfItems = function () {
        return this.nbLessons + this.nbHomeworks;
    };

    resetCountValues = function () {
        var countItems = _.groupBy(this.pedagogicItemsOfTheDay, 'type_item');
        this.nbLessons = (countItems['lesson']) ? countItems['lesson'].length : 0;
        this.nbHomeworks = (countItems['homework']) ? countItems['homework'].length : 0;
    };
}