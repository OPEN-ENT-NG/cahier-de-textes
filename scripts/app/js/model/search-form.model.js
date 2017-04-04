
function SearchForm(isQuickSearch) {
    this.startDate = {};
    this.endDate = {};
    this.publishState = {};
    this.returnType = {};
    this.displayLesson = {};
    this.displayHomework = {};
    this.audienceId = {};
    this.subjects = [];
    this.selectedSubject = null;
    this.subjectsFilters = [];
    /**
     * If true search result will be stored in model.quickSearchPedagogicDays instead of model.pedagogicDays
     * @type {boolean}
     */
    this.isQuickSearch = isQuickSearch;
    /**
     * Custom pedagogic days array.
     * Avoid conflicting with model.pedagogicDays)
     * @type {Array}
     */
    this.customPedagogicDaysArray;
};

SearchForm.prototype.initForTeacher = function () {
    this.publishState = "";
    this.returnType = "both";
    var period = moment(model.calendar.dayForWeek).day(1);
    this.startDate = period.format(DATE_FORMAT);
    this.endDate = period.add(15, 'days').format(DATE_FORMAT);
    this.displayLesson = true;
    this.displayHomework = true;
    this.audienceId = "";
};

SearchForm.prototype.initForStudent = function () {
    this.publishState = "published";
    this.returnType = "both";
    var period = moment(model.calendar.dayForWeek).day(1);
    this.startDate = period.format(DATE_FORMAT);
    this.endDate = period.add(15, 'days').format(DATE_FORMAT);
    this.displayLesson = false;
    this.displayHomework = true;
};

SearchForm.prototype.getSearch = function () {

    var params = {};
    params.startDate = this.startDate;
    params.endDate = this.endDate;
    params.publishState = this.publishState;
    params.returnType = this.returnType;

    if (model.isUserParent()) {
        params.audienceId = model.child.classId;
    }
    return params;
};
