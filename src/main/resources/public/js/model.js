function Homework() {


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
    delete: '/diary/homework/:id',
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
}

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

Homework.prototype.update = function(cb, cbe) {
    var url = '/diary/homework/' + this.id;

    var homework = this;
    http().putJson(url, this)
        .done(function(){
            // sync homeworks cache with updated lesson
            var found = false;

            // tricky way but updating object in collection do not work
            // have to remove and insert it in collection
            model.homeworks.forEach(function(homeworkModel){
                if(!found && homework.id === homeworkModel.id){
                    model.homeworks.remove(homeworkModel);
                    found = true;
                }
            });

            if(found){
                model.homeworks.push(homework);
            }

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
}

/**
 * Deletes a list of lessons
 * @param lessons Lessons to be deleted
 * @param cb Callback
 * @param cbe Callback on error
 */
Homework.prototype.deleteHomeworks = function (homeworks, cb, cbe) {


    var itemArray = {ids:model.getItemsIds(homeworks)};

    return http().deleteJson("/diary/deleteHomeworks", itemArray).done(function(r){

        homeworks.forEach(function (homework) {
            homework.deleteModelReferences();
        });

        if(typeof cb === 'function'){
            cb();
        }
    }).error(function(e){
        if(typeof cbe === 'function'){
            cbe(model.parseError(e));
        }
    });
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
 * Publishes or un publishes a list of lessons
 * @param itemArray Array of homeworks to publish or unpublish
 * @param cb Callback function
 * @param cbe Callback function on error
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
        homework_state: this.state
    };

    if (this.lesson_id) {
        json.lesson_id = this.lesson_id
    }

    return json;
};

function Attachment(){}
function Subject() { }
function Audience() { }
function HomeworkType(){}

function Lesson(data) {
    this.selected = false;
    this.collection(Attachment);
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

//TODO
Lesson.prototype.save = function(cb, cbe) {

    // startTime used for db save but startMoment in calendar view
    // startMoment day is given by lesson.date
    this.startMoment = getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.startTime));
    this.endMoment = getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.endTime));

    if(this.id) {
        this.update(cb, cbe);
    }
    else {
        this.create(cb, cbe);
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

            // sync lessons cache with updated lesson
            var found = false;

            // tricky way but updating object in collection do not work
            // have to remove and insert it in collection
            model.lessons.forEach(function(lessonModel){
                if(!found && lesson.id === lessonModel.id){
                    model.lessons.remove(lessonModel);
                    found = true;
                }
            });

            if(found){
                model.lessons.push(lesson);
            }

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
Lesson.prototype.deleteLessons = function (lessons, cb, cbe) {


    var itemArray = {ids:model.getItemsIds(lessons)};

    return http().deleteJson("/diary/deleteLessons", itemArray).done(function(r){

        lessons.forEach(function (lesson) {
            lesson.deleteModelReferences();
        });

        if(typeof cb === 'function'){
            cb();
        }
    }).error(function(e){
        if(typeof cbe === 'function'){
            cbe(model.parseError(e));
        }
    });
};

/**
 * Load lesson object from id
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Lesson.prototype.load = function (loadHomeworks, cb, cbe) {

    var lesson = this;

    http().get('/diary/lesson/' + this.id)
        .done(function (data) {
            lesson.updateData(sqlToJsLesson(data));

            if(loadHomeworks){
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
}

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
        audience_type: this.audienceType,
        audience_name: this.audience.name
    };

    if (this.room) {
        json.lesson_room = this.room;
    }

    return json;
};

Lesson.prototype.addHomework = function () {
    var homework = new Homework();
    homework.dueDate = this.date;
    homework.type = model.homeworkTypes.first();
    homework.state = this.state;
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

Teacher.prototype.create = function(cb) {

    model.me.structures.forEach(function (structureId) {
        http().postJson('/diary/teacher/' + structureId).done(function (e) {

            if (e.status == '201') {
                console.log('init subjects : ');
            }

            if(typeof cb === 'function'){
                cb();
            }
        });
    });
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

    var itemArray = [];
    items.forEach(function (item) {
        itemArray.push(item.id);
    });

    return itemArray;
}

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
            lesson.homeworks.push(convertSqlToJsHomework(sqlHomework));
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


model.build = function () {
    model.makeModels([HomeworkType, Audience, Subject, Lesson, Homework]);
    Model.prototype.inherits(Lesson, calendar.ScheduleItem); // will allow to bind item.selected for checkbox

    this.collection(Lesson, {
        syncLessons: function (cb) {

            var lessons = [];
            var start = moment(model.calendar.dayForWeek).day(1).format('YYYY-MM-DD');
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format('YYYY-MM-DD');
            var that = this;

            var countStructure = model.me.structures.length;
            model.lessons.all.splice(0, model.lessons.all.length);

            model.me.structures.forEach(function (structureId) {
                http().get('/diary/lesson/' + structureId + '/' + start + '/' + end).done(function (data) {
                    model.lessons.all.splice(0, model.lessons.all.length);
                    lessons = lessons.concat(data);
                    that.addRange(
                        _.map(lessons, function (lesson) {
                            return sqlToJsLesson(lesson);
                        })
                    );
                    countStructure--;
                    if (countStructure === 0) {
                        if(typeof cb === 'function'){
                            cb();
                        }
                    }
                });
            });
        }, pushAll: function(datas) {
            if (datas) {
                this.all = _.union(this.all, datas);
            }
        }
    });

    this.collection(Subject, {
        syncSubjects: function (cb) {
            this.all = [];
            var nbStructures = model.me.structures.length;
            var that = this;
            model.me.structures.forEach(function (structureId) {
                http().get('/diary/subject/list/' + structureId).done(function (data) {
                    model.subjects.addRange(data);
                    nbStructures--;
                    if (nbStructures === 0) {
                        if(typeof cb === 'function'){
                            cb();
                        }
                    }
                }.bind(that));
            });
        }
    });

    this.collection(Audience, {
        syncAudiences: function (cb) {
            this.all = [];
            var nbStructures = model.me.structures.length;
            var that = this;
            model.me.structures.forEach(function (structureId) {
                http().get('/userbook/structure/' + structureId).done(function (structureData) {
                    structureData.classes = _.map(structureData.classes, function (audience) {
                        audience.structureId = structureId;
                        return audience;
                    });
                    this.addRange(structureData.classes);
                    nbStructures--;
                    if (nbStructures === 0) {
                        this.trigger('sync');
                        this.trigger('change');
                        if(typeof cb === 'function'){
                            cb();
                        }
                    }
                }.bind(that));
            });
        }
    });

    this.collection(HomeworkType, {
        sync: function () {
            this.load([
                { id: 1, label: lang.translate('homework.type.home') }
            ]);
        }
    });

    this.collection(Homework, {
        syncHomeworks: function(cb){

            var homeworks = [];
            var start = moment(model.calendar.dayForWeek).day(1).format('YYYY-MM-DD');
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format('YYYY-MM-DD');
            var that = this;

            var countStructure = model.me.structures.length;
            model.homeworks.all.splice(0, model.homeworks.all.length);

            model.me.structures.forEach(function (structureId) {
                http().get('/diary/homework/' + structureId + '/' + start + '/' + end).done(function (data) {
                    model.homeworks.all.splice(0, model.homeworks.all.length);
                    homeworks = homeworks.concat(data);
                    that.addRange(
                        _.map(homeworks, convertSqlToJsHomework)
                    );
                    countStructure--;
                    if (countStructure === 0) {
                        if(typeof cb === 'function'){
                            cb();
                        }
                    }
                });
            });
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

        return {
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
            date: data.lesson_date,
            startTime: data.lesson_start_time,
            endTime: data.lesson_end_time,
            color: data.lesson_color,
            room: data.lesson_room,
            annotations: data.lesson_annotation,
            startMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_start_time),
            endMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_end_time),
            state: data.lesson_state,
            is_periodic: false,
            homeworks: lessonHomeworks
        }
    };


    /**
     * Transform sql homework data (table diary.homework)
     * to json
     * @param sqlHomework
     * @returns {{id: *, description: *, audience: *, subjectId: *, subjectLabel: *, type: *, typeId: *, typeLabel: *, teacherId: *, structureId: (*|T), audienceId: *, audienceLabel: *, dueDate: *, date: *, title: *, color: *, startMoment: *, endMoment: *, state: *, is_periodic: boolean, lesson_id: *}}
     */
    convertSqlToJsHomework = function(sqlHomework){
        return   {
            id: sqlHomework.id,
            description: sqlHomework.homework_description,
            audienceId: sqlHomework.audience_id,
            audience: model.audiences.findWhere({ id: sqlHomework.audience_id }),
            subjectId: sqlHomework.subject_id,
            subjectLabel: sqlHomework.subject_label,
            type: model.homeworkTypes.findWhere({ id: sqlHomework.homework_type_id }),
            typeId: sqlHomework.homework_type_id,
            typeLabel: sqlHomework.homework_type_label,
            teacherId: sqlHomework.teacher_id,
            structureId: sqlHomework.structureId,
            audienceId: sqlHomework.audience_id,
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

    };
}