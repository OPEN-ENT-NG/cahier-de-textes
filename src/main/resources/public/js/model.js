function Homework() {

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
};

/**
 * Publishes or un publishes a list of lessons
 * @param itemArray Array of homeworks to publish or unpublish
 * @param cb Callback function
 * @param cbe Callback function on error
 */
model.publishHomeworks = function (itemArray, isUnpublish, cb, cbe) {

    var url = isUnpublish ? "/diary/unPublishHomeworks" : "/diary/publishHomeworks";

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

Homework.prototype.toJSON = function(){
    return {
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
        lesson_id: this.lesson_id
    }
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
}

Lesson.prototype.api = {
    delete: '/diary/lesson/:id'
};
//TODO
Lesson.prototype.save = function(cb, cbe) {
    if(this.id) {
        this.update(cb, cbe);
    }
    else {
        this.create(cb, cbe);
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

    // startTime used for db save but startMoment in calendar view
    // startMoment day is given by lesson.date
    lesson.startMoment = getMomentDateTimeFromDateAndMomentTime(lesson.date, lesson.startMoment ? lesson.startMoment : moment(lesson.startTime));
    lesson.endMoment = getMomentDateTimeFromDateAndMomentTime(lesson.date, lesson.endMoment ? lesson.endMoment : moment(lesson.endTime));

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

            var idxLessonToDelete = model.lessons.indexOf(lesson);

            // update calendar lessons cache
            if (idxLessonToDelete >= 0) {
                model.lessons.splice(model.lessons.indexOf(lesson), 1);
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

/**
 * Deletes a list of lessons
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.deleteLessons = function (itemArray, cb, cbe) {
    return http().deleteJson("/diary/deleteLessons", itemArray).done(function(r){
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
Lesson.prototype.publishLessons = function (itemArray, isUnpublish, cb, cbe) {

    var url = isUnpublish ? "/diary/unPublishLessons" : "/diary/publishLessons";

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


/**
 * 
 * JSON object corresponding to sql diary.lesson table columns
 */
Lesson.prototype.toJSON = function () {
    return {
        lesson_id: this.id,
        subject_id: this.subject.id,
        school_id: this.audience.structureId,
        // TODO missing teacher_id
        audience_id: this.audience.id,
        lesson_title: this.title,
        lesson_room: this.room,
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
        // end columns not in lesson table
    }
};

Lesson.prototype.addHomework = function () {
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
 * @param lessons Collection of homeworks
 * @returns {Array} Array of id of the homeworks
 */
model.getHomeworkIds = function(homeworks){

    var itemArray = [];
    homeworks.forEach(function (homework) {
        itemArray.push(homework.id);
    });

    return itemArray;
}

/**
 *
 * @param lessons Collection of lessons
 * @returns {Array} Array of id of the lessons
 */
model.getLessonIds = function(lessons){

    var itemArray = [];
    lessons.forEach(function (lesson) {
        itemArray.push(lesson.id);
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
                    lessons = lessons.concat(data);
                    that.addRange(
                        _.map(lessons, function (lesson) {

                            var lessonHomeworks = new Array();

                            // only initialize homeworks attached to lesson
                            // with only id
                            for (var i = 0; i < lesson.homework_id.length; i++) {
                                var homework = new Homework();
                                homework.lesson_id = parseInt(lesson.lesson_id);
                                homework.loaded = false; // means full data from sql not loaded
                                lessonHomeworks.push(homework);
                            }

                            return {
                                id: lesson.lesson_id,
                                title: lesson.lesson_title,
                                audience: model.audiences.findWhere({ id: lesson.audience_id }),
                                audienceId: lesson.audience_id,
                                audienceLabel: lesson.audience_label,
                                audienceType: lesson.audience_type,
                                description: lesson.lesson_description,
                                subject: model.subjects.findWhere({ code: lesson.subject_code }),
                                subjectId: lesson.subject_id,
                                subjectLabel: lesson.subject_label,
                                teacherId: lesson.teacher_display_name,
                                structureId: lesson.school_id,
                                date: lesson.lesson_date,
                                startTime: lesson.lesson_start_time,
                                endTime: lesson.lesson_end_time,
                                color: lesson.lesson_color,
                                room: lesson.lesson_room,
                                annotations: lesson.lesson_annotation,
                                startMoment: moment(lesson.lesson_date.split(' ')[0] + ' ' + lesson.lesson_start_time),
                                endMoment: moment(lesson.lesson_date.split(' ')[0] + ' ' + lesson.lesson_end_time),
                                state: lesson.lesson_state,
                                is_periodic: false,
                                homeworks: lessonHomeworks
                            }
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
            dueDate: sqlHomework.homework_due_date,
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