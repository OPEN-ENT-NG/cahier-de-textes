function Lesson(data) {
    this.selected = false;
    //this.collection(Attachment);
    // initialize homeworks collection (see lib.js)
    if(!this.homeworks) {
        this.collection(Homework);
    }
    this.subject = (data) ? data.subject : new Subject();
    this.audience = (data) ? data.audience : new Audience();

    /**
     * Attachments
     */
    if (!this.attachments) {
        this.attachments = new Array();
    }

    var that = this;

    /**
     * Adds an attachment
     * @param attachment
     */
    this.addAttachment = function (attachment) {
        this.attachments.push(attachment);
    };


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

    var deferred = model.$q().defer();

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
            homework.save().then(()=>{
                homeworkSavedCount++;
                // callback function once all homeworks saved
                if (homeworkSavedCount === homeworkCount) {
                    if (typeof cb === 'function') {
                        cb();
                    }
                    deferred.resolve();
                }
            });

        });
    }else{
      deferred.resolve();
    }

    return deferred.promise;
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
    this.startMoment = model.getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.startTime));
    this.endMoment = model.getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.endTime));
    var that = this;
    var subjectPromise = model.$q().when();
    var lessonPromise;
    if(!this.subject.id){
        subjectPromise = this.subject.save(updateOrCreateLesson);
    }

    return subjectPromise.then(()=>{
        if (that.id) {
            lessonPromise = that.update();
        }
        else {
            lessonPromise = that.create();
        }

        return lessonPromise.then(()=>{
            return that.saveHomeworks().then(()=>{
                return syncLessonsAndHomeworks(cb);
            });
        });
    });
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


Lesson.prototype.update = function(cb, cbe) {
    var url = '/diary/lesson/' + this.id;

    var lesson = this;

    return model.getHttp()({
      method : 'PUT',
      url : url,
      data : lesson
    }).then(function(){
        if(typeof cb === 'function'){
            cb();
        }
    });
};

Lesson.prototype.create = function(cb, cbe) {
    var lesson = this;
    return model.getHttp()({
        method : 'POST',
        url : '/diary/lesson',
        data : lesson
    }).then(function(result){
            lesson.updateData(result.data);
            model.lessons.pushAll([lesson]);
            if(typeof cb === 'function'){
                cb();
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

    model.getHttp()({
        method : 'DELETE',
        url : '/diary/lesson/' + this.id,
        data : lesson
    }).then(function (b) {
            lesson.deleteModelReferences();
            if (typeof cb === 'function') {
                cb();
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

    let url = '/diary/lesson/';
    if (model.getSecureService().hasRight(model.getConstants().RIGHTS.SHOW_OTHER_TEACHER)){
        url = '/diary/lesson/external/';
    }

    var load = function () {
        model.getHttp()({
            method : 'GET',
            url : url + lesson.id
        }).then(function (result) {
                lesson.updateData(model.LessonService.mapLesson(result.data));

                if (loadHomeworks) {
                    model.loadHomeworksForLesson(lesson, cb, cbe);
                }

                if (typeof cb === 'function') {
                    cb();
                }
            });
    };

    // might occur when user pressed F5 on lesson view
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
 * Publishes the lesson
 * @param cb Callback
 * @param cbe Callback on error
 */
Lesson.prototype.publish = function (cb, cbe) {

    var jsonLesson = new Lesson();
    jsonLesson.id = this.id;
    jsonLesson.audience.structureId = this.structureId;

    return model.getHttp()({
        method : 'POST',
        url : '/diary/lesson/publish',
        data : jsonLesson
    }).then(function () {
        if (typeof cb === 'function') {
            cb();
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
        lesson_date: moment(this.date).format(DATE_FORMAT),
        lesson_start_time: moment(this.startTime).format('HH:mm'),
        lesson_end_time: moment(this.endTime).format('HH:mm'),
        lesson_description: this.description,
        lesson_annotation: this.annotations,
        lesson_state: this.state,
        // start columns not in lesson table TODO move
        audience_type: this.audience.type,
        audience_name: this.audience.name,
        attachments: this.attachments
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

    homework.delete();

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
