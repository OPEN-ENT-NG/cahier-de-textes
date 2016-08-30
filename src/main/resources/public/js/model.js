function Homework() {

    /**
     * used in ui in homework tab in lesson view
     * @type {boolean}
     */
    this.expanded = false;

    /**
     * Delete calendar references of current homework
     */
    this.deleteModelReferences = function () {
        var idxHomeworkToDelete = model.homeworks.indexOf(this);

        // delete homework in calendar cache
        if (idxHomeworkToDelete >= 0) {
            model.homeworks.splice(idxHomeworkToDelete, 1);
        }
    };
}

Homework.prototype.api = {
    delete: '/diary/homework/:id'
};

Homework.prototype.save = function(cb, cbe) {
    if(this.id) {
        this.update(cb, cbe);
    }
    else {
        this.create(cb, cbe);
    }
};

/**
 * Returns true if current homework is attached to a lesson
 * @returns {boolean}
 */
Homework.prototype.isAttachedToLesson = function() {
    return typeof this.lesson_id !== 'undefined' && this.lesson_id != null;
};

Homework.prototype.isDraft = function () {
    return this.state === "draft";
};

Homework.prototype.isPublished = function () {
    return !this.isDraft();
};

/**
 * A directly publishable homework must exist in database and not linked to a lesson
 * @param toPublish
 * @returns {*|boolean} true if homework can be published directly
 */
Homework.prototype.isPublishable = function (toPublish) {
    return this.id && (toPublish ? this.isDraft() : this.isPublished()) && this.lesson_id == null;
};

Homework.prototype.changeState = function (toPublish) {
    this.state = toPublish ? 'published' : 'draft';
};

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



Homework.prototype.update = function(cb, cbe) {
    var url = '/diary/homework/' + this.id;

    var homework = this;
    http().putJson(url, this)
        .done(function(){
            if (typeof cb === 'function') {
                cb();
            }
        }.bind(this))
        .error(function(e){
            if(typeof cbe === 'function'){
                cbe(model.parseError(e));
            }
        });
};

Homework.prototype.create = function(cb, cbe) {
    var homework = this;
    http().postJson('/diary/homework', this)
        .done(function(b){
            homework.updateData(b);
            model.homeworks.pushAll([homework]);
            if(typeof cb === 'function'){
                cb();
            }
        })
        .error(function(e){
            if(typeof cbe === 'function'){
                cbe(model.parseError(e));
            }
        });
};

/**
 * Load homework object from id
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Homework.prototype.load = function (cb, cbe) {

    var homework = this;

    var load = function () {
        http().get('/diary/homework/' + homework.id)
            .done(function (data) {
                homework.updateData(sqlToJsHomework(data));

                if (typeof cb === 'function') {
                    cb();
                }
            })
            .error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
            });
    };

    // might occur when user pressed F5 on lesson view
    // needed to fill homework.audience and subject properties
    if (model.audiences.all.length === 0) {
        model.audiences.syncAudiences(
            function () {
                model.subjects.syncSubjects(load);
            });
    } else {
        load();
    }
};

/**
 * Deletes a list of homeworks
 * @param homeworks Homeworks to be deleted
 * @param cb Callback
 * @param cbe Callback on error
 */
Homework.prototype.deleteList = function (homeworks, cb, cbe) {
    model.deleteItemList(homeworks, 'homework', cb, cbe);
};


/**
 * Deletes the homework
 * @param Optional lesson attached to homework
 * @param cb Callback after delete
 * @param cbe Callback on error
 */
Homework.prototype.delete = function (lesson, cb, cbe) {

    var homework = this;

    var deleteHomeworkReferences = function () {

        // delete homework from calendar cache
        model.homeworks.forEach(function (modelHomework) {
            if (modelHomework.id === homework.id) {
                model.homeworks.remove(modelHomework);
            }
        });

        if (lesson && lesson.homeworks) {
            lesson.homeworks.remove(homework);
        }
    };

    if (this.id) {
        http().delete('/diary/homework/' + this.id, this)
            .done(function (b) {

                deleteHomeworkReferences();

                if (typeof cb === 'function') {
                    cb();
                }
            })
            .error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
            });
    } else {
        deleteHomeworkReferences();

        if (typeof cb === 'function') {
            cb();
        }
    }
};

/**
 * Publishes or un publishes a list of homeworks
 * @param itemArray Array of homeworks to publish or unpublish
 */
model.publishHomeworks = function (itemArray, isPublish, cb, cbe) {

    var url = isPublish ? "/diary/publishHomeworks" : "/diary/unPublishHomeworks";

    return http().postJson(url, itemArray).done(function (r) {
        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};

Homework.prototype.toJSON = function () {

    var json = {
        homework_title: this.title,
        subject_id: this.subject.id,
        homework_type_id: this.type.id,
        teacher_id: model.me.userId,
        school_id: this.audience.structureId,
        audience_id: this.audience.id,
        homework_due_date: moment(this.dueDate).format('YYYY-MM-DD'),
        homework_description: this.description,
        homework_color: this.color,
        homework_state: this.state,
        // used to auto create postgresql diary.audience if needed
        // not this.audience object is originally from neo4j graph (see syncAudiences function)
        audience_type: this.audience.type,
        audience_name: this.audience.name
    };

    if (this.lesson_id) {
        json.lesson_id = this.lesson_id
    }

    if (!this.id) {
        created: moment(this.created).format('YYYY-MM-DD HH:mm:ss.SSSSS'); // "2016-07-05 11:48:22.18671"
    }

    return json;
};

function Attachment(){}
function Subject() { }
function Audience() { }
/**
 * Info about number of homeworks for a specific day
 * @constructor
 */
function HomeworksLoad(){}
function HomeworkType(){}
function Child() {
    this.id; //String
    this.displayName; //String
    this.classId; //String
    this.className; //String
    this.selected = false;
}
function PedagogicItem() {}
function PedagogicDay() {
    this.expanded = false;
    this.dayName = moment().format("dddd DD MMMM YYYY");
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

PedagogicItem.prototype.deleteModelReferences = function () {
    model.deletePedagogicItemReferences(this.id);
};

PedagogicItem.prototype.changeState = function (toPublish) {
    this.state = toPublish ? 'published' : 'draft';
};

PedagogicItem.prototype.isPublished = function () {
    return this.state === 'published';
};

PedagogicItem.prototype.descriptionMaxSize = 140;

PedagogicItem.prototype.getPreviewDescription = function () {

    if (this.description) {
        if (this.description.length >= this.descriptionMaxSize) {
            this.preview_description = '<p>' + $('<div>' + this.description + '</div>').text().substring(0, this.descriptionMaxSize) + '...' + '</p>';
        } else {
            this.preview_description = this.description;
        }
    } else {
        this.preview_description = this.description;
    }
};

PedagogicItem.prototype.isPublishable = function(toPublish){
    return this.id && this.state == (toPublish ? 'draft' : 'published') && (this.lesson_id == null || this.lesson_id == this.id); // id test to detect free homeworks
};

PedagogicItem.prototype.delete = function(cb, cbe) {

    var url = (this.type_item == "lesson") ? '/diary/lesson/' : '/diary/homework/';
    var idToDelete = this.id;
    http().delete(url + idToDelete, this).done(function (b) {

        model.deletePedagogicItemReferences(idToDelete);

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
     });
};

PedagogicItem.prototype.deleteList = function(items, cb, cbe) {

    // split into two arrays of PedagogicItem, one for the lessons, one for the homeworks
    var itemsByType = []; // array of array(s)

    if (items.length == 1) {
        itemsByType.push(items);
    } else {
        itemsByType = _.partition(items, function(item) {
            return item.type_item === 'lesson';
        });
    }

    var countdown = 0;

    if (itemsByType.length > 0 ) {
        countdown = itemsByType.length;

        itemsByType.forEach(function (arrayForTypeItem) {
            if (arrayForTypeItem.length > 0) {
                model.deleteItemList(arrayForTypeItem, arrayForTypeItem[0].type_item, function() {
                    countdown--;
                    if (countdown == 0) {
                        if (typeof cb === 'function') {
                            cb();
                        }
                    }
                }, cbe);
            } else {
                countdown--;
            }
        });
    }
};

PedagogicItem.prototype.isFiltered = function () {
    var subjectFilters = _.pluck(_.filter(model.searchForm.subjectsFilters, function(subject) {
        return !subject.selected;
    }), 'subjectName');
    return _.contains(subjectFilters, this.subject);
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

    model.initSubjectFilters();
};

function Lesson(data) {
    this.selected = false;
    //this.collection(Attachment);
    // initialize homeworks collection (see lib.js)
    if(!this.homeworks) {
        this.collection(Homework);
    }
    this.subject = (data) ? data.subject : new Subject();
    this.audience = (data) ? data.audience : new Audience();
    var that = this;

    /**
     * Delete calendar references of current lesson
     */
    this.deleteModelReferences = function () {
        model.lessons.forEach(function (lesson) {
            if (lesson.id === that.id) {
                model.lessons.remove(lesson);
            }
        });
        // delete associated homeworks references
        var lessonHomeworks = model.homeworks.filter(function (homework) {
            return homework && homework.lesson_id === that.id;
        });

        lessonHomeworks.forEach(function (homework) {
            model.homeworks.remove(homework);
        });
    };
}

Lesson.prototype.api = {
    delete: '/diary/lesson/:id'
};

/**
 * Triggered when lesson item has stopped being dragged in calendar view
 * see angular-app.js scheduleItemEl.on('stopDrag').
 * Will auto-save lesson in db on item move/resize
 * @param cb
 * @param cbe
 */
Lesson.prototype.calendarUpdate = function (cb, cbe) {

    // TODO date fields types are kinda messy
    // toJson method needs date fields to be in some specific format
    if (this.beginning) {
        this.date = this.beginning;
        this.startMoment = this.beginning;
        this.endMoment = this.end;
        this.startTime = this.startMoment;
        this.endTime = this.endMoment;
    }
    if (this.id) {
        this.update(function () {
            //model.refresh();
        }, function (error) {
            model.parseError(error);
        });
    }
};

/**
 * Save attached homeworks of lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.saveHomeworks = function (cb, cbe) {
    var homeworkSavedCount = 0;
    var homeworkCount = this.homeworks ? this.homeworks.all.length : 0;
    var that = this;

    // make sure subject and audience of homeworks are
    // same as the lesson
    if (homeworkCount > 0) {
        this.homeworks.forEach(function (homework) {
            homework.lesson_id = that.id;
            // needed fields as in model.js Homework.prototype.toJSON
            homework.audience = that.audience;
            homework.subject = that.subject;
            homework.color = that.color;

            homework.save(
                function (x) {
                    homeworkSavedCount++;
                    // callback function once all homeworks saved
                    if (homeworkSavedCount === homeworkCount) {
                        if (typeof cb === 'function') {
                            cb();
                        }
                    }
                },
                function (e) {
                    if (typeof cbe === 'function') {
                        cbe(model.parseError(e));
                    }
                });

        });
    } else {
        if (typeof cb === 'function') {
            cb();
        }
    }


};

/**
 * Save lesson and attached homeworks
 * and sync calendar lessons and homeworks cache
 * @param cb
 * @param cbe
 */
Lesson.prototype.save = function(cb, cbe) {

    // startTime used for db save but startMoment in calendar view
    // startMoment day is given by lesson.date
    this.startMoment = getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.startTime));
    this.endMoment = getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.endTime));
    var that = this;

    var saveHomeworksAndSync = function(){
        that.saveHomeworks(
            function(){
                syncLessonsAndHomeworks(cb);
            }
        );
    };

    if(this.id) {
        this.update(saveHomeworksAndSync, cbe);
    }
    else {
        this.create(saveHomeworksAndSync, cbe);
    }
};

/**
 *
 * @param idHomework
 * @returns {boolean}
 */
Lesson.prototype.hasHomeworkWithId = function (idHomework) {

    var found = false;

    if (!idHomework || !this.homeworks) {
        found = false;
    }


    this.homeworks.forEach(function (homework) {
        if (homework.id === idHomework) {
            found = true;
        }
    });

    return found;
};


var syncHomeworks = function (cb) {
    model.homeworks.syncHomeworks(
        function () {
            if (typeof cb === 'function') {
                cb();
            }
        });
};

var syncLessonsAndHomeworks = function (cb) {
    model.lessons.syncLessons();
    // need sync attached lesson homeworks
    model.homeworks.syncHomeworks();

    if (typeof cb === 'function') {
        cb();
    }
};

/**
 * Given a moment which contain reliable time data,
 * return a moment time with this time and the date specified.
 * @param date Date
 * @param momentTime Moment date
 * @returns {*}
 */
var getMomentDateTimeFromDateAndMomentTime = function (date, momentTime) {
    var dateMoment = moment(date);

    momentTime.set('year', dateMoment.get('year'));
    momentTime.set('month', dateMoment.get('month'));
    momentTime.set('date', dateMoment.get('date'));

    return momentTime;
}

Lesson.prototype.update = function(cb, cbe) {
    var url = '/diary/lesson/' + this.id;

    var lesson = this;

    http().putJson(url, this)
        .done(function(){

            if(typeof cb === 'function'){
                cb();
            }
        }.bind(this))
        .error(function(e){
            if(typeof cbe === 'function'){
                cbe(model.parseError(e));
            }
        });
};

Lesson.prototype.create = function(cb, cbe) {
    var lesson = this;
    http().postJson('/diary/lesson', this)
        .done(function(b){
            lesson.updateData(b);
            model.lessons.pushAll([lesson]);
            if(typeof cb === 'function'){
                cb();
            }
        })
        .error(function(e){
            if(typeof cbe === 'function'){
                cbe(model.parseError(e));
            }
        });
};


/**
 * Deletes the lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.delete = function (cb, cbe) {

    var lesson = this;

    http().delete('/diary/lesson/' + this.id, this)
        .done(function (b) {

            lesson.deleteModelReferences();

            if (typeof cb === 'function') {
                cb();
            }
        })
        .error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
};

/**
 * Deletes a list of lessons
 * @param lessons Lessons to be deleted
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.deleteList = function (lessons, cb, cbe) {
    model.deleteItemList(lessons, 'lesson', cb, cbe);
};

/**
 * Load lesson object from id
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Lesson.prototype.load = function (loadHomeworks, cb, cbe) {

    var lesson = this;

    var load = function () {
        http().get('/diary/lesson/' + lesson.id)
            .done(function (data) {
                lesson.updateData(sqlToJsLesson(data));

                if (loadHomeworks) {
                    model.loadHomeworksForLesson(lesson, cb, cbe);
                }

                if (typeof cb === 'function') {
                    cb();
                }
            })
            .error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
            });
    };

    // might occur when user pressed F5 on lesson view
    if (model.audiences.all.length === 0) {
        model.audiences.syncAudiences(
            function () {
                model.subjects.syncSubjects(load)
            });
    } else {
        load();
    }
};

/**
 * Publishes the lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.publish = function (cb, cbe) {

    var jsonLesson = new Lesson();
    jsonLesson.id = this.id;
    jsonLesson.audience.structureId = this.structureId;

    http().postJson('/diary/lesson/publish', jsonLesson)
        .done(function () {
            if (typeof cb === 'function') {
                cb();
            }
        })
        .error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
};

/**
 * Publishes or un publishes a list of lessons
 * @param cb Callback
 * @param cbe Callback on error
 */
model.publishLessons = function (itemArray, isPublish, cb, cbe) {

    var url = isPublish ? "/diary/publishLessons" : "/diary/unPublishLessons";

    return http().postJson(url, itemArray).done(function (r) {

        var updateLessons = new Array();

        // update lesson cache
        // bad code but collection does not seem to update on state change
        // so have to delete and add modified lessons ...
        model.lessons.forEach(function(lessonModel){
            if(itemArray.ids.indexOf(lessonModel.id) != -1){
                model.lessons.remove(lessonModel);

                lessonModel.changeState(isPublish);
                updateLessons.push(lessonModel);
            }
        });

        model.lessons.addRange(updateLessons);

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};


/**
 *
 * JSON object corresponding to sql diary.lesson table columns
 */
Lesson.prototype.toJSON = function () {

    var json = {
        lesson_id: this.id,
        subject_id: this.subject.id,
        school_id: this.audience.structureId,
        // TODO missing teacher_id
        audience_id: this.audience.id,
        lesson_title: this.title,
        lesson_color: this.color,
        lesson_date: moment(this.date).format('YYYY-MM-DD'),
        lesson_start_time: moment(this.startTime).format('HH:mm'),
        lesson_end_time: moment(this.endTime).format('HH:mm'),
        lesson_description: this.description,
        lesson_annotation: this.annotations,
        lesson_state: this.state,
        // start columns not in lesson table TODO move
        audience_type: this.audience.type,
        audience_name: this.audience.name
    };

    if (this.room) {
        json.lesson_room = this.room;
    }

    return json;
};

Lesson.prototype.addHomework = function (cb) {
    var homework = model.initHomework(this);
    this.homeworks.push(homework);
};

Lesson.prototype.deleteHomework = function (homework) {

    homework.delete(function(cb){

    }, function(cbe){

    });

    var homework = new Homework();
    homework.dueDate = this.date;
    homework.type = model.homeworkTypes.first();
    this.homeworks.push(homework);
};

Lesson.prototype.isDraft = function () {
    return this.state === "draft";
};

Lesson.prototype.isPublished = function () {
    return !this.isDraft();
};

Lesson.prototype.isPublishable = function(toPublish){
    return this.id && this.state == (toPublish ? 'draft' : 'published')
};

/**
 * Change state of current and associated homeworks
 * @param isPublished
 */
Lesson.prototype.changeState = function (isPublished) {
    this.state = isPublished ? 'published' : 'draft';

    // change state of associated homeworks
    this.homeworks.forEach(function (homework) {
        var lessonHomework = homework;
        homework.state = isPublished ? 'published' : 'draft';

        var found = false;

        // change state of homeworks cache in calendar for current week
        model.homeworks.forEach(function (homeworkCache) {
            if (!found && homeworkCache.id == lessonHomework.id) {
                homeworkCache.state = isPublished ? 'published' : 'draft';
                found = true;
            }
        });
    });
};

function Teacher() {}

Teacher.prototype.create = function(cb, cbe) {

    model.me.structures.forEach(function (structureId) {
        http().postJson('/diary/teacher/' + structureId).done(function (e) {

            if(typeof cb === 'function'){
                cb();
            }
        }).error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
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

    http().get('/diary/homework/load/' + date + '/' + audienceId).done(function (sqlHomeworksLoads) {

        homework.weekhomeworksload = new Array();

        sqlHomeworksLoads.forEach(function (homeworkLoad) {
            homework.weekhomeworksload.push(sqlToJsHomeworkLoad(homeworkLoad));
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
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

    http().get('/diary/homework/list/' + lesson.id).done(function (sqlHomeworks) {

        lesson.homeworks = new Collection(Homework);

        sqlHomeworks.forEach(function (sqlHomework) {
            lesson.homeworks.push(sqlToJsHomework(sqlHomework));
        });

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
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

function SearchForm() {
    this.startDate = {};
    this.endDate = {};
    this.publishState = {};
    this.returnType = {};
    this.displayLesson = {};
    this.displayHomework = {};
    this.audienceId = {};
    this.subjectsFilters = [];
};

SearchForm.prototype.initForTeacher = function () {
    this.publishState = "";
    this.returnType = "both";
    var period = moment(model.calendar.dayForWeek).day(1);
    this.startDate = period.format('YYYY-MM-DD');
    this.endDate = period.add(15, 'days').format('YYYY-MM-DD');
    this.displayLesson = true;
    this.displayHomework = true;
    this.audienceId = "";
};

SearchForm.prototype.initForStudent = function () {
    this.publishState = "published";
    this.returnType = "both";
    var period = moment(model.calendar.dayForWeek).day(1);
    this.startDate = period.format('YYYY-MM-DD');
    this.endDate = period.add(15, 'days').format('YYYY-MM-DD');
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

function SubjectFilter() {
    this.subjectName = {};
    this.subjectColor = {};
    this.subjectInitials = {};
    this.selected = true;
};

SubjectFilter.prototype.toggleSelected = function () {
    this.selected = !this.selected;
};

// computes, sets and returns a unique string as initials for this subject.
SubjectFilter.prototype.setInitials = function (initials) {
    var charAt = 1;
    var initial = this.nextInitials(initials, charAt);
    while (_.contains(initials, initial)){
        initial = this.nextInitials(initials, charAt++);
    }
    this.subjectInitials = initial;

    return this.subjectInitials;
};

// returns the 1st Letter and the charAt letter to form initials for the given subject name.
SubjectFilter.prototype.nextInitials = function (initials, charAt) {
    var initial = this.subjectName.charAt(0) + this.subjectName.charAt(charAt);
    return initial;
};

model.build = function () {
    model.makeModels([HomeworkType, Audience, Subject, Lesson, Homework, PedagogicDay, Child]);
    Model.prototype.inherits(Lesson, calendar.ScheduleItem); // will allow to bind item.selected for checkbox

    this.searchForm = new SearchForm();

    this.collection(Lesson, {
        loading: false,
        syncLessons: function (cb, cbe) {
            var that = this;
            if (that.loading)
                return;

            var lessons = [];
            var start = moment(model.calendar.dayForWeek).day(1).format('YYYY-MM-DD');
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format('YYYY-MM-DD');

            model.lessons.all.splice(0, model.lessons.all.length);

            var urlGetLessons = '/diary/lesson/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';

            if (model.isUserParent() && model.child) {
                urlGetLessons += model.child.classId;
            } else {
                urlGetLessons += '%20';
            }

            that.loading = true;
            http().get(urlGetLessons).done(function (data) {
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
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
            });
        }, pushAll: function(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }, behaviours: 'diary'
    });

    this.collection(Subject, {
        loading: false,
        syncSubjects: function (cb, cbe) {
            this.all = [];
            var that = this;
            if (that.loading)
                return;

            that.loading = true;

            if (model.isUserTeacher()) {
                http().get('/diary/subject/initorlist').done(function (data) {
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
            }
        }
    });

    this.collection(Audience, {
        loading: false,
        syncAudiences: function (cb, cbe) {
            this.all = [];
            var nbStructures = model.me.structures.length;
            var that = this;
            if (that.loading)
                return;

            that.loading = true;
            model.me.structures.forEach(function (structureId) {
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
            });
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
            http().get(urlGetHomeworkTypes).done(function (data) {
                homeworkTypes = homeworkTypes.concat(data);
                that.addRange(
                    _.map(homeworkTypes, sqlToJsHomeworkType)
                );
                if (typeof cb === 'function') {
                    cb();
                }
                that.loading = false;
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
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
            var start = moment(model.calendar.dayForWeek).day(1).format('YYYY-MM-DD');
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format('YYYY-MM-DD');
            var that = this;

            if (that.loading)
                return;

            model.homeworks.all.splice(0, model.homeworks.all.length);

            var urlGetHomeworks = '/diary/homework/' + getUserStructuresIdsAsString() + '/' + start + '/' + end + '/';

            if (model.isUserParent() && model.child) {
                urlGetHomeworks += model.child.classId;
            } else {
                urlGetHomeworks += '%20';
            }

            that.loading = true;
            http().get(urlGetHomeworks).done(function (data) {
                homeworks = homeworks.concat(data);
                that.addRange(
                    _.map(homeworks, sqlToJsHomework)
                );
                if(typeof cb === 'function'){
                    cb();
                }
                that.loading = false;
            }).error(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
                that.loading = false;
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
            model.performPedagogicItemSearch(params, cb, cbe);
        }, pushAll: function(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
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

        var lessonHomeworks = new Array();

        // only initialize homeworks attached to lesson
        // with only id
        if (data.homework_id) {
            for (var i = 0; i < data.homework_id.length; i++) {
                var homework = new Homework();
                homework.id = data.homework_id[i];
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
            locked: (!model.canEdit()) ? true : false
        };

        if('group' === lesson.audienceType){
            lesson.audienceTypeLabel = lang.translate('diary.audience.group');
        } else {
            lesson.audienceTypeLabel = lang.translate('diary.audience.class');
        }

        return lesson;
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

        if('group' === homework.audienceType){
            homework.audienceTypeLabel = lang.translate('diary.audience.group');
        } else {
            homework.audienceTypeLabel = lang.translate('diary.audience.class');
        }

        return homework;
    };


    /** Converts sql pedagogic item to js data */
    sqlToJsPedagogicItem = function (data) {
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

        if (data.day) {
            item.dayFormatted = moment(data.day).format("DD/MM/YYYY");
        }
        return item;
    }
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
const DEFAULT_ITEM_COLOR = '#ff8000';

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
model.initHomework = function (lesson) {

    var homework = new Homework();

    homework.created = new Date();
    homework.expanded = true;
    homework.type = model.homeworkTypes.first();
    homework.title = homework.type.label;
    homework.date = moment().minute(0).second(0);

    // create homework attached to lesson
    if (lesson) {
        homework.audience = lesson.audience
        homework.subject = lesson.subject;
        homework.audienceType = homework.audience.type;
        homework.color = lesson.color;
        homework.state = lesson.state;
    }
    // free homework
    else {
        homework.audience = model.getDefaultAudience();
        homework.subject = model.subjects.first();
        homework.audienceType = homework.audience.type;
        homework.color = DEFAULT_ITEM_COLOR;
        homework.state = DEFAULT_STATE;
    }

    model.loadHomeworksLoad(homework, homework.date, homework.audience.id);

    return homework;
};

/**
 * Init lesson
 * @returns {Lesson}
 */
model.initLesson = function (timeFromCalendar) {
    var lesson = new Lesson();

    lesson.audience = model.getDefaultAudience();
    lesson.subject = model.subjects.first();
    lesson.audienceType = lesson.audience.type;
    lesson.color = DEFAULT_ITEM_COLOR;
    lesson.state = DEFAULT_STATE;
    lesson.title = lang.translate('diary.lesson.label');

    var newItem = {};

    if(timeFromCalendar) {
        newItem = model.calendar.newItem;

        // force to HH:00 -> HH:00 + 1 hour
        newItem.beginning = newItem.beginning.minute(0).second(0);
        newItem.date = newItem.beginning;

        newItem.end = moment(newItem.beginning);
        newItem.end.minute(0).second(0).add(1, 'hours');
    }
    // init start/end time to now (HH:00) -> now (HH:00) + 1 hour
    else {
        newItem = {
            date: moment().minute(0).second(0),
            beginning: moment().minute(0).second(0),
            end: moment().minute(0).second(0).add(1, 'hours')
        }
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
 * @param params
 * @param cb
 * @param cbe
 */
model.getPreviousLessonsFromLesson = function (lesson, cb, cbe) {

    var params = {};

    if (lesson.id) {
        params.excludeLessonId = lesson.id;
        params.endDateTime = lesson.date.format("YYYY-MM-DD") + ' ' + lesson.endTime;
    } else {
        params.endDateTime = lesson.date.format("YYYY-MM-DD") + ' ' + moment(lesson.endTime).format("HH:mm");
    }

    params.subject = lesson.subject.id;
    params.audienceId = lesson.audience.id;
    params.returnType = 'both';
    params.homeworkLinkedToLesson = "true";
    params.limit = 20;

    http().postJson('/diary/pedagogicItems/list', params).done(function (items) {

        var previousLessonsAndHomeworks = _.map(items, sqlToJsPedagogicItem);

        var groupByItemType = _.groupBy(previousLessonsAndHomeworks, 'type_item');

        var previousLessons = groupByItemType.lesson;

        if (previousLessons) {
            var previousHomeworks = groupByItemType.homework;

            previousLessons.forEach(function (lesson) {
                lesson.homeworks = _.where(previousHomeworks, {lesson_id: lesson.id});
            });

            lesson.previousLessons = previousLessons;
        }

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
    });
};


model.performPedagogicItemSearch = function (params, cb, cbe) {
    model.pedagogicDays.reset();

    http().postJson('/diary/pedagogicItems/list', params).done(function (items) {

        var pedagogicItemsFromDB = _.map(items, sqlToJsPedagogicItem);

        var days = _.groupBy(pedagogicItemsFromDB, 'day');

        var pedagogicDays = [];

        var dayExpanded = true;

        for (var day in days) {
            if (days.hasOwnProperty(day)) {
                var pedagogicDay = new PedagogicDay();
                pedagogicDay.expanded = dayExpanded;
                pedagogicDay.dayName = moment(day).format("dddd DD MMMM YYYY");
                pedagogicDay.pedagogicItemsOfTheDay = days[day];

                var countItems = _.groupBy(pedagogicDay.pedagogicItemsOfTheDay, 'type_item');

                pedagogicDay.nbLessons = (countItems['lesson']) ? countItems['lesson'].length : 0;
                pedagogicDay.nbHomeworks = (countItems['homework']) ? countItems['homework'].length : 0;
                pedagogicDays.push(pedagogicDay);
                dayExpanded = false;
            }
        }

        model.pedagogicDays.pushAll(pedagogicDays);

        if (typeof cb === 'function') {
            cb();
        }
    }).error(function (e) {
        if (typeof cbe === 'function') {
            cbe(model.parseError(e));
        }
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

    http().get('/diary/children/list')
        .done(function (data) {

            model.childs.addRange(data);

            if(model.childs.all.length > 0) {
                model.child = model.childs.all[0];
                model.child.selected = true;
            }

            if (typeof cb === 'function') {
                cb();
            }
        })
        .error(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });

};

//builds the set of different subjects encountered in the pedagogic items of the list
model.initSubjectFilters = function () {

    var initials = [];
    var subjects = [];
    var filters = [];

    model.pedagogicDays.forEach(function(pedagogicDay) {
        pedagogicDay.pedagogicItemsOfTheDay.forEach(function(pedagogicItem) {
            var subjectName = pedagogicItem.subject;
            if (!_.contains(subjects, subjectName)) {
                subjects.push(subjectName);
                var filter = new SubjectFilter();
                filter.subjectName = subjectName;
                filter.subjectColor = pedagogicItem.color;
                filter.subjectInitials = filter.setInitials(initials);
                initials.push(filter.subjectInitials);
                filters.push(filter);
            }
        });
    });

    model.searchForm.subjectsFilters = filters;
};