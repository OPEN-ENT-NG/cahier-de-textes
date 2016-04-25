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
    this.collection(Homework);
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
                                is_periodic: false
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
                        _.map(homeworks, function(homework){
                            return {
                                id: homework.id,
                                description: homework.homework_description,
                                audience: model.audiences.findWhere({ id: homework.audience_id }),
                                subjectId: homework.subject_id,
                                subjectLabel: homework.subject_label,
                                typeId: homework.type_id,
                                typeLabel: homework.type_label,
                                teacherId: homework.teacher_id,
                                structureId: homework.structureId,
                                audienceId: homework.audience_id,
                                audienceLabel: homework.audience_label,
                                dueDate: homework.homework_due_date,
                                date: moment(homework.homework_due_date),
                                title: homework.homework_title,
                                color: homework.homework_color,
                                startMoment: moment(homework.homework_due_date),
                                endMoment: moment(homework.homework_due_date),
                                state: homework.homework_state,
                                is_periodic: false,
                                lesson_id: homework.lesson_id
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

}