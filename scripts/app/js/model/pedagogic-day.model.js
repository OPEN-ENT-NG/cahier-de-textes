function PedagogicDay() {
    this.selected = false;
    this.dayName = moment().format("dddd DD MMMM YYYY");
    this.shortName = this.dayName.substring(0,2);
    this.shortDate = moment().format("DD/MM");
    this.pedagogicItemsOfTheDay = [];
    this.nbLessons = 0;
    this.nbHomeworks = 0;
}

PedagogicDay.prototype.numberOfItems = function () {
    return this.nbLessons + this.nbHomeworks;
};

PedagogicDay.prototype.resetCountValues = function () {
    var countItems = _.groupBy(this.pedagogicItemsOfTheDay, 'type_item');
    this.nbLessons = (countItems['lesson']) ? countItems['lesson'].length : 0;
    this.nbHomeworks = (countItems['homework']) ? countItems['homework'].length : 0;
};
