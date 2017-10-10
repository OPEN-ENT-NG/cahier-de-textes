/**
 * Default date format
 * @type {string}
 */
const DATE_FORMAT = 'YYYY-MM-DD';


/**
 * Model from table
 * diary.lesson_has_attachment
 * @constructor
 */
function LessonAttachment() {}
function Audience() { }
function HomeworksLoad(){}
function HomeworkType(){}

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

model.getConstants = function(){
    return angular.injector(['ng','app']).get("constants");
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

    return http().deleteJson(url, itemArray).done(function (b) {

        items.forEach(function (item) {
            item.deleteModelReferences();
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
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


var syncHomeworks = function (cb) {
    return model.homeworks.syncHomeworks().then(()=>{
        if (typeof cb === 'function') {
            cb();
        }
    });
};

var syncLessonsAndHomeworks = function (cb) {

    // need sync attached lesson homeworks
    return model.homeworks.syncHomeworks().then(()=>{
        if (typeof cb === 'function') {
            cb();
        }
    });
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
    return new Number(time.split(':')[0] * 60) + new Number(time.split(':')[1]);
};

model.parseError = function(e) {
    var error = {};
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
            homework.weekhomeworksload.push(sqlToJsHomeworkLoad(homeworkLoad));
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
        lesson.homeworks = new Collection(Homework);
        sqlHomeworks.forEach(function (sqlHomework) {
            lesson.homeworks.push(sqlToJsHomework(sqlHomework));
        });
        if (typeof cb === 'function') {
            cb();
        }
        return sqlHomeworks;
    });
};


/**
 * Get school ids of current authenticated user as string
 * seperated with ':'
 * @returns {string} schoolid_1:schoolid_2:...
 */
var getUserStructuresIdsAsString = function () {
    var structureIds = "";

    model.me.structures.forEach(function (structureId) {
        structureIds += structureId + ":";
    });

    return structureIds;
};


model.build = function () {

    calendar.startOfDay=8;
    calendar.endOfDay=19;
    calendar.dayHeight = 65;
    /*model.calendar = new calendar.Calendar({
        week: moment().week()
    });
    */

    // keeping start/end day values in cache so we can detect dropped zones (see ng-extensions.js)
    // note: model.calendar.startOfDay does not work in console.
    model.startOfDay = calendar.startOfDay;
    model.endOfDay = calendar.endOfDay;

    model.makeModels([HomeworkType, Audience, Subject, Lesson, Homework, PedagogicDay, Child]);
    Model.prototype.inherits(Lesson, calendar.ScheduleItem); // will allow to bind item.selected for checkbox

    this.searchForm = new SearchForm(false);
    this.currentSchool = {};

    this.collection(Lesson, {
        loading: false,
        syncLessons: function (cb, cbe) {
            console.warn("deprecated");
            return;
            /*var that = this;
            if (that.loading)
                return;

            var lessons = [];
            var start = moment(model.calendar.dayForWeek).day(1).format(DATE_FORMAT);
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format(DATE_FORMAT);

            model.lessons.all.splice(0, model.lessons.all.length);

            var urlGetLessons = '/diary/lesson/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';

            if (model.isUserParent() && model.child) {
                urlGetLessons += model.child.id;
            } else {
                urlGetLessons += '%20';
            }

            that.loading = true;
            model.getHttp()({
                method : 'GET',
                url : urlGetLessons
            }).then(function (data) {
                lessons = lessons.concat(data);
                that.addRange(
                    _.map(lessons, function (lesson) {
                        return sqlToJsLesson(lesson);
                    })
                );
                if(typeof cb === 'function'){
                    cb();
                }
                that.loading = false;
            },function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
            });*/
        },pushAll: function(datas) {

            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(Subject, {
        loading: false,
        syncSubjects: function (cb, cbe) {
            console.warn("deprecated");
            return ;
            /*
            this.all = [];
            var that = this;
            if (that.loading)
                return;

            that.loading = true;

            if (model.isUserTeacher()) {
                http().get('/diary/subject/initorlist').done(function (data) {
                if (data ===""){
                data = [];
                }
                    model.subjects.addRange(data);
                    if (typeof cb === 'function') {
                        cb();
                    }
                    that.loading = false;
                }.bind(that))
                    .error(function (e) {
                        if (typeof cbe === 'function') {
                            cbe(model.parseError(e));
                        }
                        that.loading = false;
                    });
            } else {
                http().get('/diary/subject/list/' + getUserStructuresIdsAsString()).done(function (data) {
                    model.subjects.addRange(data);
                    if (typeof cb === 'function') {
                        cb();
                    }
                    that.loading = false;
                }.bind(that))
                    .error(function (e) {
                        if (typeof cbe === 'function') {
                            cbe(model.parseError(e));
                        }
                        that.loading = false;
                    });
            }*/

        }
    });

    this.collection(Audience, {
        loading: false,
        syncAudiences: function (cb, cbe) {
            console.warn("deprecated");
            return;
            /*this.all = [];
            var nbStructures = model.me.structures.length;
            var that = this;
            if (that.loading)
                return;

            model.currentSchool = model.me.structures[0];
            that.loading = true;

            model.getAudienceService().getAudiences(model.me.structures).then((audiences)=>{
                this.addRange(structureData.classes);
                // TODO get groups
                nbStructures--;
                if (nbStructures === 0) {
                    this.trigger('sync');
                    this.trigger('change');
                    if(typeof cb === 'function'){
                        cb();
                    }
                }

                that.loading = false;
            });
            */
            /*model.me.structures.forEach(function (structureId) {
                http().get('/userbook/structure/' + structureId).done(function (structureData) {
                    structureData.classes = _.map(structureData.classes, function (audience) {
                        audience.structureId = structureId;
                        audience.type = 'class';
                        audience.typeLabel = lang.translate('diary.audience.class');
                        return audience;
                    });
                    this.addRange(structureData.classes);
                    // TODO get groups
                    nbStructures--;
                    if (nbStructures === 0) {
                        this.trigger('sync');
                        this.trigger('change');
                        if(typeof cb === 'function'){
                            cb();
                        }
                    }

                    that.loading = false;
                }.bind(that))
                .error(function (e) {
                    if (typeof cbe === 'function') {
                        cbe(model.parseError(e));
                    }
                    that.loading = false;
                });
            });*/
        }
    });

    this.collection(HomeworkType, {
        loading: false,
        syncHomeworkTypes: function(cb, cbe){

            var homeworkTypes = [];
            var that = this;

            if (that.loading)
                return;

            model.homeworkTypes.all.splice(0, model.homeworkTypes.all.length);

            var url = '/diary/homeworktype/initorlist';

            var urlGetHomeworkTypes = url;

            that.loading = true;
            return model.getHttp()({
                method : 'GET',
                url : urlGetHomeworkTypes
            }).then(function (result) {

                homeworkTypes = homeworkTypes.concat(result.data);
                that.addRange(
                    _.map(homeworkTypes, sqlToJsHomeworkType)
                );
                if (typeof cb === 'function') {
                    cb();
                }
                that.loading = false;
                return homeworkTypes;
            }).catch(function (e) {
                that.loading = false;
                throw e;
            });

        }, pushAll: function(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(Homework, {
        loading: false,
        syncHomeworks: function(cb, cbe){

            var homeworks = [];
            var start = moment(model.calendar.dayForWeek).day(1).format(DATE_FORMAT);
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format(DATE_FORMAT);
            var that = this;

            if (that.loading)
                return;

            model.homeworks.all.splice(0, model.homeworks.all.length);

            var urlGetHomeworks = '/diary/homework/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';

            if (model.isUserParent() && model.child) {
                urlGetHomeworks += model.child.id;
            } else {
                urlGetHomeworks += '%20';
            }


            that.loading = true;
            return model.getHttp()({
                method : 'GET',
                url : urlGetHomeworks
            }).then(function (result) {
                homeworks = homeworks.concat(result.data);
                that.addRange(
                    _.map(homeworks, sqlToJsHomework)
                );
                if(typeof cb === 'function'){
                    cb();
                }
                that.loading = false;
                return homeworks;
            }).catch(function (e) {
                that.loading = false;
                throw e;
            });

        }, pushAll: function(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(PedagogicDay, {
        reset: function() {
            model.pedagogicDays.selectAll();
            model.pedagogicDays.removeSelection();
        },
        syncPedagogicItems: function(cb, cbe){
            var params = model.searchForm.getSearch();
            model.performPedagogicItemSearch(params, model.isUserTeacher(), cb, cbe);
        },
        pushAll: function(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        },
        getItemsByLesson : function(lessonId) {
            var items = [];

            model.pedagogicDays.forEach(function (day) {
                var relatedToLesson = _.filter(day.pedagogicItemsOfTheDay, function(item) {
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
        reset: function() {
            // n.b: childs not 'children' since collection function adds a 's'
            model.childs.selectAll();
            model.childs.removeSelection();
        },
        syncChildren: function(cb, cbe){
            model.listChildren(cb, cbe);
        }, pushAll: function(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }
    });

    /**
     * Convert sql diary.lesson row to js row used in angular model
     * @param lesson Sql diary.lesson row
     */
    sqlToJsLesson = function (data) {
        console.warn("deprecated");
        return;
        var lessonHomeworks = new Array();

        // only initialize homeworks attached to lesson
        // with only id
        if (data.homework_ids) {
            for (var i = 0; i < data.homework_ids.length; i++) {
                var homework = new Homework();
                homework.id = data.homework_ids[i];
                homework.lesson_id = parseInt(data.lesson_id);
                homework.loaded = false; // means full data from sql not loaded
                lessonHomeworks.push(homework);
            }
        }

        var lesson =  {
            //for share directive you must have _id
            _id:  data.lesson_id,
            id: data.lesson_id,
            title: data.lesson_title,
            audience: model.audiences.findWhere({id: data.audience_id}),
            audienceId: data.audience_id,
            audienceLabel: data.audience_label,
            audienceType: data.audience_type,
            description: data.lesson_description,
            subject: model.subjects.findWhere({id: data.subject_id}),
            subjectId: data.subject_id,
            subjectLabel: data.subject_label,
            teacherId: data.teacher_display_name,
            teacherName: data.teacher_display_name,
            structureId: data.school_id,
            date: moment(data.lesson_date),
            startTime: data.lesson_start_time,
            endTime: data.lesson_end_time,
            color: data.lesson_color,
            room: data.lesson_room,
            annotations: data.lesson_annotation,
            startMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_start_time),
            endMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_end_time),
            state: data.lesson_state,
            is_periodic: false,
            homeworks: lessonHomeworks,
            tooltipText: '',
            locked: (!model.canEdit()) ? true : false
        };

        if('group' === lesson.audienceType){
            lesson.audienceTypeLabel = lang.translate('diary.audience.group');
        } else {
            lesson.audienceTypeLabel = lang.translate('diary.audience.class');
        }

        if (data.attachments) {
            lesson.attachments = _.map(JSON.parse(data.attachments), jsonToJsAttachment);
        }


        //var tooltip = getResponsiveLessonTooltipText(lesson);

        //lesson.tooltipText = tooltip;
        return lesson;
    };

    jsonToJsAttachment = function (data) {
        console.warn("deprecated");
        return;
        var att = new Attachment();
        att.id = data.id;
        att.user_id = data.user_id;
        att.creation_date = data.creation_date;
        att.document_id = data.document_id;
        att.document_label = data.document_label;

        return att;
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
     * Set lesson tooltip text depending on screen resolution.
     * Tricky responsive must be linked to additional.css behaviour
     * @param lesson
     */
    getResponsiveLessonTooltipText = function (lesson) {
        console.warn("deprecated use utils service");
        return;
        var tooltipText = lesson.title + ' ('+lang.translate(lesson.state)+')';
        var screenWidth = window.innerWidth;

        // < 900 px display room
        if (screenWidth < 900 && lesson.room) {
            tooltipText += '<br>' + lesson.room;
        }

        // < 650 px display hour start and hour end
        if (screenWidth < 650) {
            tooltipText += '<br>' + [[lesson.startMoment.format('HH')]] + 'h' + [[lesson.startMoment.format('mm')]];
            tooltipText += ' -> ' + [[lesson.endMoment.format('HH')]] + 'h' + [[lesson.endMoment.format('mm')]];
        }

        // < 600 px display subjectlabel
        if (screenWidth < 650 && lesson.subjectLabel) {
            tooltipText += '<br>' + lesson.subjectLabel;
        }

        tooltipText = tooltipText.trim();

        return tooltipText;
    };

    /**
     * Transform sql homework load data to json like
     * @param sqlHomeworkType
     */
    sqlToJsHomeworkLoad = function (sqlHomeworkload) {
        return {
            countLoad: sqlHomeworkload.countload,
            description: sqlHomeworkload.countload + ' ' + lang.translate('diary.homework.label'),
            day: moment(sqlHomeworkload.day).format('dddd').substring(0, 1).toUpperCase(), // 'lundi' -> 'lu' -> 'L'
            numDay: moment(sqlHomeworkload.day).format('DD') // 15
        };
    };

    /**
     * Transform sql homework type data to json like
     * @param sqlHomeworkType
     * @returns {{id: *, structureId: (*|T), label: *, category: *}}
     */
    sqlToJsHomeworkType = function (sqlHomeworkType) {
        return {
            id: sqlHomeworkType.id,
            structureId: sqlHomeworkType.school_id,
            label: sqlHomeworkType.homework_type_label,
            category: sqlHomeworkType.homework_type_category
        };
    };

    /**
     * Transform sql homework data (table diary.homework)
     * to json
     * @param sqlHomework
     * @returns {{id: *, description: *, audience: *, subjectId: *, subjectLabel: *, type: *, typeId: *, typeLabel: *, teacherId: *, structureId: (*|T), audienceId: *, audienceLabel: *, dueDate: *, date: *, title: *, color: *, startMoment: *, endMoment: *, state: *, is_periodic: boolean, lesson_id: *}}
     */
    sqlToJsHomework = function(sqlHomework){
        var homework =   {
            //for share directive you must have _id
            _id:  sqlHomework.id,
            id: sqlHomework.id,
            description: sqlHomework.homework_description,
            audienceId: sqlHomework.audience_id,
            audience: model.audiences.findWhere({ id: sqlHomework.audience_id }),
            subject: model.subjects.findWhere({ id: sqlHomework.subject_id }),
            subjectId: sqlHomework.subject_id,
            subjectLabel: sqlHomework.subject_label,
            type: model.homeworkTypes.findWhere({ id: sqlHomework.homework_type_id }),
            typeId: sqlHomework.homework_type_id,
            typeLabel: sqlHomework.homework_type_label,
            teacherId: sqlHomework.teacher_id,
            structureId: sqlHomework.structureId,
            audienceType: sqlHomework.audience_type,
            audienceLabel: sqlHomework.audience_label,
            // TODO delete dueDate? (seems redondant info vs date field)
            dueDate: moment(sqlHomework.homework_due_date),
            date: moment(sqlHomework.homework_due_date),
            title: sqlHomework.homework_title,
            color: sqlHomework.homework_color,
            startMoment: moment(sqlHomework.homework_due_date),
            endMoment: moment(sqlHomework.homework_due_date),
            state: sqlHomework.homework_state,
            is_periodic: false,
            lesson_id: sqlHomework.lesson_id
        };

        if (sqlHomework.attachments) {
            homework.attachments = _.map(JSON.parse(sqlHomework.attachments), jsonToJsAttachment);
        }

        if('group' === homework.audienceType){
            homework.audienceTypeLabel = lang.translate('diary.audience.group');
        } else {
            homework.audienceTypeLabel = lang.translate('diary.audience.class');
        }

        return homework;
    };


    /** Converts sql pedagogic item to js data */
    sqlToJsPedagogicItem = function (data) {
        //TODO use service
        var item = new PedagogicItem();
        item.type_item = data.type_item;
        item.id = data.id;
		//for share directive you must have _id
        item._id = data.id;
        item.lesson_id = data.lesson_id;
        item.title = data.title;
        item.subject = data.subject;
        item.audience = data.audience;
        item.start_hour = (data.type_item == "lesson") ? moment(data.day).minutes(model.getMinutes(data.start_time)).format("HH[h]mm") : "";
        item.end_hour = (data.type_item == "lesson") ? moment(data.day).minutes(model.getMinutes(data.end_time)).format("HH[h]mm") : "";
        item.type_homework = data.type_homework;
        item.teacher = data.teacher;
        item.description = data.description;
        item.expanded_description = false;
        item.state = data.state;
        item.color = data.color;
        item.getPreviewDescription();
        item.room = data.room;
        item.day = data.day;
        item.turn_in = (data.type_item == "lesson") ? "" : data.turn_in_type;
        item.selected = false;
        item.locked = data.locked;

        if (data.day) {
            item.dayFormatted = moment(data.day).format("DD/MM/YYYY");
            item.dayOfWeek = moment(data.day).format("dddd");
        }
        return item;
    };
};

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
 * Default color of lesson and homeworks
 * @type {string}
 */
const DEFAULT_ITEM_COLOR = '#CECEF6';

/**
 * Default state of lesson or homework when created
 * @type {string}
 */
const DEFAULT_STATE = 'draft';

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
        homework.color = DEFAULT_ITEM_COLOR;
        homework.state = DEFAULT_STATE;
    }

    model.loadHomeworksLoad(homework, moment(homework.date).format(DATE_FORMAT), homework.audience.id);

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
    lesson.color = DEFAULT_ITEM_COLOR;
    lesson.state = DEFAULT_STATE;
    lesson.title = lang.translate('diary.lesson.label');

    var newItem = {};

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


    // if (useDeltaStep) {
    //     if (lesson.allPreviousLessonsLoaded) {
    //         return;
    //     }
    // }/* else if (lesson.previousLessonsLoaded || lesson.previousLessonsLoading == true) {
    //     return;
    // }*/
    //
    // if (!useDeltaStep) {
    //     lesson.allPreviousLessonsLoaded = false;
    // }
    //
    // var defaultCount = 6;
    //
    // var idx_start = 0;
    // var idx_end = idx_start + defaultCount;
    //
    // if (useDeltaStep) {
    //     idx_start += defaultCount;
    //     idx_end += defaultCount;
    // }
    //
    // var params = {};
    //
    // params.offset = idx_start;
    // params.limit = idx_end;
    //
    // if (lesson.id) {
    //     params.excludeLessonId = lesson.id;
    // }
    //
    // // tricky way to detect if string date or moment date ...
    // // 12:00:00
    // if (lesson.endTime.length === 8) {
    //     params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + lesson.endTime;
    // } else {
    //     params.endDateTime = lesson.date.format(DATE_FORMAT) + ' ' + moment(lesson.endTime).format("HH:mm");
    // }
    //
    // var clonedLessonMoment = moment(new Date(lesson.date));
    // //params.startDate = clonedLessonMoment.add(-2, 'month').format(DATE_FORMAT);
    // params.subject = lesson.subject.id;
    // params.audienceId = lesson.audience.id;
    // params.returnType = 'lesson'; // will allow get lessons first, then homeworks later
    // params.homeworkLinkedToLesson = "true";
    // params.sortOrder = "DESC";
    //
    // if (!lesson.previousLessons) {
    //     lesson.previousLessons = new Array();
    // }
    // lesson.previousLessonsDisplayed = new Array();
    //
    // lesson.previousLessonsLoading = true;
    // http().postJson('/diary/pedagogicItems/list', params).done(function (items) {
    //
    //     // all lessons loaded
    //     if (items.length < defaultCount) {
    //         lesson.allPreviousLessonsLoaded = true;
    //     }
    //
    //     var previousLessonsAndHomeworks = _.map(items, sqlToJsPedagogicItem);
    //
    //     var groupByItemType = _.groupBy(previousLessonsAndHomeworks, 'type_item');
    //
    //     var previousLessons = groupByItemType.lesson;
    //
    //     if (previousLessons) {
    //         var previousLessonIds = new Array();
    //
    //         previousLessons.forEach(function (lesson) {
    //             previousLessonIds.push(lesson.id);
    //         });
    //
    //
    //         // load linked homeworks of previous lessons
    //         var paramsHomeworks = {};
    //         paramsHomeworks.returnType = 'homework';
    //         paramsHomeworks.homeworkLessonIds = previousLessonIds;
    //
    //         http().postJson('/diary/pedagogicItems/list', paramsHomeworks).done(function (items2) {
    //
    //             var previousHomeworks = _.map(items2, sqlToJsPedagogicItem);
    //
    //             previousLessons.forEach(function (lesson) {
    //                 lesson.homeworks = _.where(previousHomeworks, {lesson_id: lesson.id});
    //             });
    //
    //             lesson.previousLessons = lesson.previousLessons.concat(previousLessons);
    //             lesson.previousLessonsLoaded = true;
    //             lesson.previousLessonsLoading = false;
    //             lesson.previousLessonsDisplayed = lesson.previousLessons;
    //
    //             if (typeof cb === 'function') {
    //                 cb();
    //             }
    //         });
    //     } else {
    //         lesson.previousLessons = new Array();
    //         lesson.previousLessonsLoaded = true;
    //         lesson.previousLessonsLoading = false;
    //         lesson.previousLessonsDisplayed = lesson.previousLessons;
    //         if (typeof cb === 'function') {
    //             cb();
    //         }
    //     }
    //
    // }).error(function (e) {
    //     if (typeof cbe === 'function') {
    //         cbe(model.parseError(e));
    //     }
    // });
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
    }).then(function (result) {
        var items = result.data;
        var pedagogicItemsFromDB = _.map(items, sqlToJsPedagogicItem);

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

    model.childs.removeAll();

    return model.getHttp()({
        method : 'GET',
        url : '/diary/children/list'
    }).then(function (result) {

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
        var labelLowerCaseNoAccent = sansAccent(label).toLowerCase();

        model.subjects.all.forEach(function (subject) {
            var labelSubjectLowerCaseNoAccent = sansAccent(subject.label.toLowerCase());

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

/**
 * removes accent from any string
 * @param str
 * @returns {*}
 */
var sansAccent = function (str) {
  if (!str){
    return;
  }
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g // C, c
    ];
    var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];


    for (var i = 0; i < accent.length; i++) {
        str = str.replace(accent[i], noaccent[i]);
    }

    return str;
};
