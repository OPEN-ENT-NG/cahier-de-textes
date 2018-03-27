import { angular, model, moment, _, idiom as lang, Model, calendar } from 'entcore';
import http from 'axios';
import * as tools from './tools';

import {Homework, Homeworks, PedagogicDay, Child, Subject, SearchForm} from './models/index';
import { Lesson } from './models/Lesson.model';
import {AudienceService} from "./services/audiences.service";

/**
 * Model from table
 * diary.lesson_has_attachmentH
 * @constructor
 */
export class LessonAttachment extends Model {
    constructor() {
        super();
    }
};
export class Audience extends Model {
    constructor(audience?) {
        super();
    }
};
export class HomeworksLoad extends Model {
    constructor() {
        super();
    }
};
export class HomeworkType extends Model{
    constructor() {
        super();
    }
};

export const InitBuild = function () {

    calendar.startOfDay = 8;
    calendar.endOfDay = 19;
    calendar.dayHeight = 65;
    /*model.calendar = new calendar.Calendar({
        week: moment().week()
    });
    */

    this.makeModels([
        HomeworkType,
        Audience,
        Subject,
        Lesson,
        Homework,
        PedagogicDay,
        Child
    ]);


    // keeping start/end day values in cache so we can detect dropped zones (see ng-extensions.js)
    // note: model.calendar.startOfDay does not work in console.
    model.startOfDay = calendar.startOfDay;
    model.endOfDay = calendar.endOfDay;

    Model.prototype.inherits(Lesson, calendar.ScheduleItem); // will allow to bind item.selected for checkbox

    this.searchForm = new SearchForm(false);
    this.currentSchool = {};

    this.collection(Lesson, {
        loading: false,
        syncLessons: function (cb, cbe) {
            console.warn("deprecated");
            return;

        }, pushAll: function (datas) {

            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(Subject, {
        loading: false,
        syncSubjects: function (cb, cbe) {
            console.warn("deprecated");
            return;
        }
    });

    this.collection(Audience, {
        loading: false,
        syncAudiences: function syncAudiences(cb, cbe) {
            console.warn("deprecated");
            return;
        }
    });

    this.collection(HomeworkType, {
        loading: false,
        syncHomeworkTypes: async function () {
            var homeworkTypes = [];
            var that = this;

            if (that.loading)
                return;

            model.homeworkTypes.all.splice(0, model.homeworkTypes.all.length);

            var url = '/diary/homeworktype/initorlist';

            var urlGetHomeworkTypes = url;

            that.loading = true;
            try {
                const { data } = await model.getHttp()({
                    method: 'GET',
                    url: urlGetHomeworkTypes
                });
                homeworkTypes = homeworkTypes.concat(data);
                that.addRange(
                    _.map(homeworkTypes, tools.sqlToJsHomeworkType)
                );
                that.loading = false;
                return homeworkTypes;
            } catch (e) {
                that.loading = false;
                throw e;
            }
        }, pushAll: function (datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    model.homeworks = new Homeworks();

    this.collection(PedagogicDay, {
        reset: function () {
            model.pedagogicDays.selectAll();
            model.pedagogicDays.removeSelection();
        },
        syncPedagogicItems: function (cb, cbe) {
            var params = model.searchForm.getSearch();
            model.performPedagogicItemSearch(params, model.isUserTeacher(), cb, cbe);
        },
        pushAll: function (datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        },
        getItemsByLesson: function (lessonId) {
            var items = [];

            model.pedagogicDays.forEach(function (day) {
                var relatedToLesson = _.filter(day.pedagogicItemsOfTheDay, function (item) {
                    return item.lesson_id == lessonId;
                });
                items = _.union(items, relatedToLesson);
            });

            return items;
        }
    });

    /**
     *
     */
    this.collection(Child, {
        reset: function () {
            // n.b: childs not 'children' since collection function adds a 's'
            model.childs.selectAll();
            model.childs.removeSelection();
        },
        syncChildren: function (cb, cbe) {
            model.listChildren(cb, cbe);
        }, pushAll: function (datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }
    });
};


model.getHttp = function(){
    return  angular.element($('html')).injector().get("$http");
};

model.$q = function(){
    return  angular.element($('html')).injector().get("$q");
};

model.getSecureService = function(){
    return angular.injector(['ng','app']).get("SecureService");
};

model.getUtilsService = function(){
    return angular.element($('html')).injector().get("UtilsService");
};

model.homeworksPerDayDisplayed = 1;
/**
 * Says whether or not current user can edit an homework
 * @returns {*|boolean}
 */
model.canEdit = function () {
    return model.me.type == "ENSEIGNANT";
};

/**
 * Says whether or not current user is a teacher
 * @returns {*|boolean}
 */
model.isUserTeacher = function () {
    return model.me.type == "ENSEIGNANT";
};


/**
 * Says whether or not current user is a teacher
 * @returns {*|boolean}
 */
model.isUserParent = function () {
    return model.me.type == "PERSRELELEVE";
};



/**
 * Publishes or un publishes a list of homeworks
 * @param itemArray Array of homeworks to publish or unpublish
 */
model.publishHomeworks = function (itemArray, isPublish, cb, cbe) {

    var url = isPublish ? "/diary/publishHomeworks" : "/diary/unPublishHomeworks";

    return model.getHttp()({
        method : 'POST',
        url : url,
        data : itemArray
    }).then(function (r) {
        if (typeof cb === 'function') {
            cb();
        }
        return r.data;
    });
};



model.deleteItemList = function (items, itemType, cb, cbe) {
    var url = (itemType == "lesson") ? '/diary/deleteLessons' : '/diary/deleteHomeworks';

    var itemArray = {ids:model.getItemsIds(items)};

    return http.delete(url, {data: itemArray}).then(function (b) {

        items.forEach(function (item) {
            item.deleteModelReferences();
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).catch(function (error) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(error));
        }
    });
}

model.deletePedagogicItemReferences = function(itemId) {
    model.pedagogicDays.forEach(function (day) {
        day.pedagogicItemsOfTheDay = _.reject(day.pedagogicItemsOfTheDay, function (item) {
            return !item || item.lesson_id == itemId || item.id == itemId;
        });
        day.resetCountValues();
    });

    model.pedagogicDays.all = _.filter(model.pedagogicDays.all, function(day){
        return day.numberOfItems() > 0;
    });

    model.initSubjects();
};

model.unselectDays = function (){
    model.pedagogicDays.forEach(function (day) {
        day.selected = undefined;
    });
};

// gets the selected date from pedagogic items
model.selectedPedagogicDate = function (){
    var selectedDay = _.findWhere(model.pedagogicDays.all, {selected : true});
    if (selectedDay) {
        return moment(selectedDay.dayName, "dddd DD MMMM YYYY").format("YYYY-MM-DD");
    } else {
        return moment();
    }
};

/**
 * Given a moment which contain reliable time data,
 * return a moment time with this time and the date specified.
 * @param date Date
 * @param momentTime Moment date
 * @returns {*}
 */
model.getMomentDateTimeFromDateAndMomentTime = function (date, momentTime) {
    var dateMoment = moment(date);

    momentTime.set('year', dateMoment.get('year'));
    momentTime.set('month', dateMoment.get('month'));
    momentTime.set('date', dateMoment.get('date'));

    return momentTime;
};


/**
 * Publishes or un publishes a list of lessons
 * @param cb Callback
 * @param cbe Callback on error
 */
model.publishLessons = function (itemArray, isPublish, cb, cbe) {

    var url = isPublish ? "/diary/publishLessons" : "/diary/unPublishLessons";

    return model.getHttp()({
        method : 'POST',
        url : url,
        data : itemArray
    }).then(function (r) {
        var updateLessons = new Array();

        // update lesson cache
        // bad code but collection does not seem to update on state change
        // so have to delete and add modified lessons ...
        model.lessons.forEach(function(lessonModel){
            if(itemArray.ids.indexOf(lessonModel.id) != -1){

                lessonModel.changeState(isPublish);
                lessonModel.selected=false;
                lessonModel.tooltipText = model.getUtilsService().getResponsiveLessonTooltipText(lessonModel);
            }
        });

        model.lessons.addRange(updateLessons);

        if (typeof cb === 'function') {
            cb();
        }
        return r.data;
    });
};

model.getMinutes = function (time) {

    return (parseInt(time.split(':')[0]) * 60) + (parseInt(time.split(':')[1]));
};

model.parseError = function(e) {
    let error:any = {};
    try {
        error = JSON.parse(e.responseText);
    }
    catch (err) {
        error.error = "diary.error.unknown";
    }
    error.status = e.status;

    return error;
};

/**
 *
 * @param items Collection of items (lessons or homeworks)
 * @returns {Array} Array of id of the items
 */
model.getItemsIds = function (items) {
    return _.toArray(_.pluck(items, 'id'));
};

/**
 * Loads homework load data for current week of homework
 * @param homework
 * @param cb
 * @param cbe
 */
model.loadHomeworksLoad = function (homework, date, audienceId, cb, cbe) {

    return model.getHttp()({
        method : 'GET',
        url : '/diary/homework/load/'+ date + '/' + audienceId
    }).then(function (result) {
        var sqlHomeworksLoads = result.data;
        homework.weekhomeworksload = [];

        sqlHomeworksLoads.forEach(function (homeworkLoad) {
            homework.weekhomeworksload.push(tools.sqlToJsHomeworkLoad(homeworkLoad));
        });

        if (typeof cb === 'function') {
            cb();
        }
        return sqlHomeworksLoads;
    });
};


/**
 * Get homeworks linked to a lesson
 *
 * @param lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
model.loadHomeworksForLesson = function (lesson, cb, cbe) {

    if (!lesson.id) {
        return;
    }
    let url = '/diary/homework/list/';
    if(model.getSecureService().hasRight(model.getConstants().RIGHTS.SHOW_OTHER_TEACHER)){
        url = '/diary/homework/external/list/';
    }
    return model.getHttp()({
        method : 'GET',
        url : url + lesson.id
    }).then(function (result) {
        var sqlHomeworks = result.data;
        lesson.homeworks = this.collection(Homework);
        sqlHomeworks.forEach(function (sqlHomework) {
            lesson.homeworks.push(tools.sqlToJsHomework(sqlHomework));
        });
        if (typeof cb === 'function') {
            cb();
        }
        return sqlHomeworks;
    });
};


/**
 * On window resize compute lesson tooltips (responsive design)
 */
/*window.addEventListener('resize', function(event){

    model.lessons.forEach(function (lesson) {
        lesson.tooltipText = getResponsiveLessonTooltipText(lesson);
    });
});*/


/**
 * Returns default audience of connected user.
 * @returns {*}
 */
model.getDefaultAudience = function(){
    var defaultAudience = null;

    if(model.me.classes && model.me.classes.length > 0){
        defaultAudience = model.audiences.findWhere({id: model.me.classes[0]});
    }

    if(!defaultAudience){
        defaultAudience = model.audiences.first();
    }

    return defaultAudience;
};

model.showHomeworkPanel = true;

/**
 * Init homework object on created.
 * Set default attribute values
 * @param homework
 * @param cb Callback function
 * @param cbe Callback function on error
 * @returns {*}
 */
model.initHomework = function (dueDate, lesson) {

    var homework = new Homework();

    homework.created = new Date();
    homework.expanded = true;
    homework.type = model.homeworkTypes.first();
    homework.title = homework.type.label;
    homework.date = (dueDate) ? dueDate : moment().minute(0).second(0);

    // create homework attached to lesson
    if (lesson) {
        homework.audience = lesson.audience;
        homework.subject = lesson.subject;
        homework.audienceType = homework.audience.type;
        homework.color = lesson.color;
        homework.state = lesson.state;
    }
    // free homework
    else {
        homework.audience = {}; //sets the default audience to undefined
        homework.subject = model.subjects.first();
        homework.audienceType = homework.audience.type;
        homework.color = tools.DEFAULT_ITEM_COLOR;
        homework.state = tools.DEFAULT_STATE;
    }

    model.loadHomeworksLoad(homework, moment(homework.date).format(tools.DATE_FORMAT), homework.audience.id);

    return homework;
};

/**
 * Init lesson
 * @returns {Lesson}
 */
model.initLesson = function (timeFromCalendar, selectedDate) {
    var lesson = new Lesson();

    lesson.audience = {}; //sets the default audience to undefined
    lesson.subject = model.subjects.first();
    lesson.audienceType = lesson.audience.type;
    lesson.color = tools.DEFAULT_ITEM_COLOR;
    lesson.state = tools.DEFAULT_STATE;
    lesson.title = lang.translate('diary.lesson.label');

    let newItem:any;

    if(timeFromCalendar) {
        newItem = model.calendar.newItem;

        // force to HH:00 -> HH:00 + 1 hour
        newItem.beginning = newItem.beginning.second(0);
        newItem.date = newItem.beginning;
        if (!newItem.beginning.isBefore(newItem.end)){
            newItem.end = moment(newItem.beginning);
            newItem.end.minute(0).second(0).add(1, 'hours');
        }
        if (newItem.audience){
            lesson.audience = newItem.audience;
            lesson.audienceType = lesson.audience.type;
        }

        if (newItem.room){
            lesson.room = newItem.room;
        }

        if (newItem.subject){
            lesson.subject = newItem.subject;
        }

    }
    // init start/end time to now (HH:00) -> now (HH:00) + 1 hour or selectedDate ->
    else {
        var itemDate = (selectedDate) ? moment(selectedDate): moment();

        newItem = {
            date: itemDate,
            beginning: moment().minute(0).second(0),
            end: moment().minute(0).second(0).add(1, 'hours')
        };
    }

    lesson.newItem = newItem;
    lesson.startTime = newItem.beginning;
    lesson.endTime = newItem.end;
    lesson.date = newItem.date;

    return lesson;
};


/**
 * Load previous lessons from current one
 * Attached homeworks to lessons are also loaded
 * @param lesson
 * @param useDeltaStep
 * @param cb Callback function
 * @param cbe Callback on error function
 */
model.getPreviousLessonsFromLesson = function (lesson, useDeltaStep, cb, cbe) {

    console.warn("deprecated");
    return;
};


model.performPedagogicItemSearch = function (params, isTeacher, cb, cbe) {

    // global quick search panel
    if (params.isQuickSearch) {
        if (params.returnType === 'lesson') {
            model.pedagogicDaysQuickSearchLesson = new Array();
        } else {
            model.pedagogicDaysQuickSearchHomework = new Array();
        }
    }
    // 'classical' view list
    else {
        model.pedagogicDays.reset();
    }

    return model.getHttp()({
        method : 'POST',
        url : '/diary/pedagogicItems/list',
        data : params
    }).then( (result) => {
        var items = result.data;
        var pedagogicItemsFromDB = _.map(items, tools.sqlToJsPedagogicItem);

        var days = _.groupBy(pedagogicItemsFromDB, 'day');

        var pedagogicDays = [];

        var aDayIsSelected = false;

        for (var day in days) {
            if (days.hasOwnProperty(day)) {
                var pedagogicDay = new PedagogicDay();
                pedagogicDay.selected = false;
                pedagogicDay.dayName = moment(day).format("dddd DD MMMM YYYY");
                pedagogicDay.shortName = pedagogicDay.dayName.substring(0,2);
                pedagogicDay.shortDate = moment(day).format("DD/MM");
                pedagogicDay.pedagogicItemsOfTheDay = days[day];

                var countItems = _.groupBy(pedagogicDay.pedagogicItemsOfTheDay, 'type_item');

                pedagogicDay.nbLessons = (countItems['lesson']) ? countItems['lesson'].length : 0;
                pedagogicDay.nbHomeworks = (countItems['homework']) ? countItems['homework'].length : 0;

                //select default day
                if (isTeacher) {
                    if (!aDayIsSelected) {
                        pedagogicDay.selected = true;
                        aDayIsSelected = true;
                    }
                } else {
                    if (pedagogicDay.nbHomeworks > 0 && !aDayIsSelected) {
                        pedagogicDay.selected = true;
                        aDayIsSelected = true;
                    }
                }
                pedagogicDays.push(pedagogicDay);
            }
        }

        if (pedagogicDays[0] && !aDayIsSelected) {
            pedagogicDays[0].selected = true;
        }

        // global quick search panel
        if (params.isQuickSearch) {
            if (params.returnType === 'lesson') {
                model.pedagogicDaysQuickSearchLesson = model.pedagogicDaysQuickSearchLesson.concat(pedagogicDays);
            } else {
                model.pedagogicDaysQuickSearchHomework = model.pedagogicDaysQuickSearchHomework.concat(pedagogicDays);
            }
        } else {
            model.pedagogicDays.pushAll(pedagogicDays);
        }

        model.initSubjects();

        if (typeof cb === 'function') {
            cb();
        }
        return pedagogicDays;
    });
};

/**
 * List children of current authenticated user (if parent)
 * @param cb Callback function
 * @param cbe Callback error function
 */
model.listChildren = function (cb, cbe) {
    // no children - abort
    if (!model.me.childrenIds || model.me.childrenIds.length == 0) {
        if (typeof cb === 'function') {
            cb();
        }
        return;
    }
    return model.getHttp()({
        method : 'GET',
        url : '/diary/children/list'
    }).then(function (result) {
        model.childs.removeAll();
        model.childs.addRange(result.data);

        if(model.childs.all.length > 0) {
            model.child = model.childs.all[0];
            model.child.selected = true;
        }

        if (typeof cb === 'function') {
            cb();
        }
    });
};

//builds the set of different subjects encountered in the pedagogic items of the list
model.initSubjects = function () {

    var subjects = [];

    model.pedagogicDays.forEach(function(pedagogicDay) {
        pedagogicDay.pedagogicItemsOfTheDay.forEach(function(pedagogicItem) {
            if (!pedagogicItem){
                return;
            }
            var subjectName = pedagogicItem.subject;
            if (!_.contains(subjects, subjectName)) {
                subjects.push(subjectName);
            }
        });
    });

    model.searchForm.subjects = subjects;
};

/**
 * Find subject by id
 * @param subjectId
 * @returns {null} Subject with id set
 */
model.findSubjectById = function(subjectId){

    var subjectMatch = null;

    model.subjects.all.forEach(function (subject) {

        if(subject.id == subjectId){
            subjectMatch = subject;
        }
    });

    return subjectMatch;
};

/**
 * Find subjects matching label user inputed.
 * @param label Label subject (might be partial, not case sensitive)
 */
model.findSubjectsByLabel = function (label) {

    var subjectsFound = new Array();

    if (label.length > 0) {
        var labelLowerCaseNoAccent = tools.sansAccent(label).toLowerCase();

        model.subjects.all.forEach(function (subject) {
            var labelSubjectLowerCaseNoAccent = tools.sansAccent(subject.label.toLowerCase());

            if (labelSubjectLowerCaseNoAccent.indexOf(labelLowerCaseNoAccent) != -1) {
                subjectsFound.push(subject);
            }
        });
    }

    return subjectsFound;
};


/**
 * Creates new subject
 */
model.createSubject = function(label, cb, cbe){

    var subject = new Subject();
    subject.label = label;
    return subject.save(cb, cbe);
};