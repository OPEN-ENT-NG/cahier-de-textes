import {model, moment} from 'entcore';
import {DATE_FORMAT} from '../tools';

export class SearchForm {

    startDate = {};
    endDate = {};
    publishState = {};
    returnType = {};
    displayLesson = {};
    displayHomework = {};
    audienceId = {};
    subjects = [];
    selectedSubject = null;
    subjectsFilters = [];
    multiSearchHomework: any;
    multiSearchLesson: any;
    limit: any;
    sortOrder:any;

    /**
     * If true search result will be stored in model.quickSearchPedagogicDays instead of model.pedagogicDays
     * @type {boolean}
     */
    isQuickSearch: any;
    /**
     * Custom pedagogic days array.
     * Avoid conflicting with model.pedagogicDays)
     * @type {Array}
     */
    customPedagogicDaysArray;

    constructor(isQuickSearch) {
        this.isQuickSearch = isQuickSearch;
    }

    initForTeacher = function () {
        this.publishState = "";
        this.returnType = "both";
        var period = moment(model.calendar.dayForWeek).day(1);
        this.startDate = period.format(DATE_FORMAT);
        this.endDate = period.add(15, 'days').format(DATE_FORMAT);
        this.displayLesson = true;
        this.displayHomework = true;
        this.audienceId = "";
    };

    initForStudent = function () {
        this.publishState = "published";
        this.returnType = "both";
        var period = moment(model.calendar.dayForWeek).day(1);
        this.startDate = period.format(DATE_FORMAT);
        this.endDate = period.add(15, 'days').format(DATE_FORMAT);
        this.displayLesson = false;
        this.displayHomework = true;
    };

    getSearch = function () {

        let params: any = {};
        params.startDate = this.startDate;
        params.endDate = this.endDate;
        params.publishState = this.publishState;
        params.returnType = this.returnType;

        if (model.isUserParent()) {
            params.audienceId = model.child.classId;
        }
        return params;
    };
};