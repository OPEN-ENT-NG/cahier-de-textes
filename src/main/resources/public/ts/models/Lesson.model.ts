import {model, moment, collection} from 'entcore';
import { Selectable } from "entcore-toolkit";
import * as tools from '../tools';
import {Mix} from 'entcore-toolkit';

import {Homework, Homeworks, Subject} from './';
import {Audience} from '../model';

export class Lesson implements Selectable {
    homeworks: any;


    id: any;
    subject: any;
    audience: any;
    title: any;
    color: any = tools.DEFAULT_ITEM_COLOR;
    date: any;
    startTime: any;
    endTime: any;
    description: any;
    annotations: any;
    state: any = tools.DEFAULT_STATE;
    attachments: any;

    newItem: any;
    room: any;
    audienceType: any;

    selected: boolean;
    startMoment: any;
    endMoment: any;
    end: any;
    beginning: any;
    structureId:any;

    constructor(data?) {

        this.selected = false;
        //this.collection(Attachment);
        // initialize homeworks collection (see lib.js)
        if (!this.homeworks) {
           this.homeworks = new Homeworks();
        }
        this.subject = (data) ? data.subject : new Subject();
        this.audience = (data) ? data.audience : new Audience();

        /**
         *
         * Attachments
         */
        if (!this.attachments) {
            this.attachments = new Array();
        }
    }

    api = {delete: '/diary/lesson/:id'};

    /**
     * Adds an attachment
     * @param attachment
     */
    addAttachment (attachment) {
        this.attachments.push(attachment);
    };


    /**
     * Delete calendar references of current lesson
     */
    deleteModelReferences () {
        var that = this;
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

    /**
     * Triggered when lesson item has stopped being dragged in calendar view
     * see angular-app.js scheduleItemEl.on('stopDrag').
     * Will auto-save lesson in db on item move/resize
     * @param cb
     * @param cbe
     */
    calendarUpdate (cb, cbe) {

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
    saveHomeworks (cb, cbe) {

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
                homework.state = that.state;
                homework.save().then(() => {
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
        } else {
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
    save (cb, cbe) {



        // startTime used for db save but startMoment in calendar view
        // startMoment day is given by lesson.date
        this.startMoment = model.getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.startTime));
        this.endMoment = model.getMomentDateTimeFromDateAndMomentTime(this.date, moment(this.endTime));
        var that = this;
        var subjectPromise = model.$q().when();
        var lessonPromise;
        if (!this.subject.id) {
            subjectPromise = this.subject.save();
        }

        return subjectPromise.then(() => {
            if (that.id) {
                lessonPromise = that.update(cb, cbe);
            }
            else {
                lessonPromise = that.create(cb, cbe);
            }

            return lessonPromise.then(() => {
                return that.saveHomeworks(cb, cbe).then(() => {
                    return tools.syncLessonsAndHomeworks(cb);
                });
            });
        });
    };

    /**
     *
     * @param idHomework
     * @returns {boolean}
     */
    hasHomeworkWithId (idHomework) {

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


    update (cb, cbe) {
        var url = '/diary/lesson/' + this.id;

        var lesson = this;

        return model.getHttp()({
            method: 'PUT',
            url: url,
            data: lesson
        }).then(function () {
            if (typeof cb === 'function') {
                cb();
            }
        });
    };

    create (cb, cbe) {
        var lesson = this;

        let subject = model.subjects.all.find((l) => {
            return l.label = lesson.subject.label
        });

        let createSubjectPromise = model.$q().when();

        if (!subject) {
            createSubjectPromise = model.createSubject(lesson.subject.label).then((newSubject) => {
                lesson.subject = newSubject;
            });
        } else {
            lesson.subject = subject;
        }

        return createSubjectPromise.then(() => {
            return model.getHttp()({
                method: 'POST',
                url: '/diary/lesson',
                data: lesson
            }).then((result) => {
                Mix.extend(this, result.data);
                model.lessons.pushAll([lesson]);
                if (typeof cb === 'function') {
                    cb();
                }
            });
        })
    };


    /**
     * Deletes the lesson
     * @param cb Callback
     * @param cbe Callback on error
     */
    delete (cb, cbe) {

        var lesson = this;

        model.getHttp()({
            method: 'DELETE',
            url: '/diary/lesson/' + this.id,
            data: lesson
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
    deleteList (lessons, cb, cbe) {
        model.deleteItemList(lessons, 'lesson', cb, cbe);
    };

    /**
     * Load lesson object from id
     * @param cb Callback function
     * @param cbe Callback on error function
     */
    load (loadHomeworks, cb, cbe) {

        var lesson = this;

        let url = '/diary/lesson/';
        if (model.getSecureService().hasRight(model.getConstants().RIGHTS.SHOW_OTHER_TEACHER)) {
            url = '/diary/lesson/external/';
        }


        return model.getHttp()({
            method: 'GET',
            url: url + lesson.id
        }).then((result) => {
            Mix.extend(this, model.LessonService.mapLesson(result.data));


            if (loadHomeworks) {
                model.loadHomeworksForLesson(lesson, cb, cbe);
            } else {
                if (typeof cb === 'function') {
                    cb();
                }
            }
        });


    };

    /**
     * Publishes the lesson
     * @param cb Callback
     * @param cbe Callback on error
     */
    publish (cb, cbe) {

        var jsonLesson = new Lesson();
        jsonLesson.id = this.id;
        jsonLesson.audience.structureId = this.structureId;

        return model.getHttp()({
            method: 'POST',
            url: '/diary/lesson/publish',
            data: jsonLesson
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
    toJSON () {

        let json: any = {
            lesson_id: this.id,
            subject_id: this.subject.id,
            school_id: this.audience.structureId,
            // TODO missing teacher_id
            audience_id: this.audience.id,
            lesson_title: this.title,
            lesson_color: this.color,
            lesson_date: moment(this.date).format(tools.DATE_FORMAT),
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

    addHomework (cb) {
        let date = moment.isMoment(this.startTime) ? this.startTime : (this.startMoment ? this.startMoment : moment());
        let dueDate = date.second(0);
        var homework = model.initHomework(dueDate, this);
        this.homeworks.push(homework);
    };

    deleteHomework (homework) {

        homework.delete();

        homework = new Homework();
        homework.dueDate = this.date;
        homework.type = model.homeworkTypes.first();
        this.homeworks.push(homework);
    };

    isDraft () {
        return this.state === "draft";
    };

    isPublished () {
        return !this.isDraft();
    };

    isPublishable (toPublish) {
        return this.id && this.state == (toPublish ? 'draft' : 'published')
    };

    /**
     * Change state of current and associated homeworks
     * @param isPublished
     */
    changeState (isPublished) {
        this.state = isPublished ? 'published' : 'draft';
        let that = this;
        // change state of associated homeworks
        this.homeworks.forEach(function (homework) {
            var lessonHomework = homework;
            homework.state = isPublished ? 'published' : 'draft';

            var found = false;
        });

        // change state of homeworks cache in calendar for current week
        model.homeworks.all.filter((h) => {
            return h.lesson_id = that.id
        }).forEach((homeworkCache) => {
            homeworkCache.state = that.state;
        });

    };
}