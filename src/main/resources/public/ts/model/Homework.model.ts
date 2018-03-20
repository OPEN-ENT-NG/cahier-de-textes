import { model, moment } from 'entcore';
import http from 'axios';
import { DATE_FORMAT, sqlToJsHomework } from '../tools';

export class Homework {

    /**
     * used in ui in homework tab in lesson view
     * @type {boolean}
     */
    id: any;
    created: any;
    expanded:any = false;
    type: any;
    title: any;
    date: any;

    audience: any;
    subject: any;
    audienceType: any;
    color: any;
    state: any;

    dueDate: any;
    description: any;
    attachments:any;

    CrudApi:any;

    constructor(){
        this.expanded = false;
    }

    /**
     * Delete calendar references of current homework
     */
    deleteModelReferences = function () {
        var idxHomeworkToDelete = model.homeworks.indexOf(this);

        // delete homework in calendar cache
        if (idxHomeworkToDelete >= 0) {
            model.homeworks.splice(idxHomeworkToDelete, 1);
        }
    };


    /**
     * Adds an attachment
     * @param attachment
     */
    addAttachment = function (attachment) {
        this.attachments.push(attachment);
    };

    /**
     * Removes attachment associated to this lesson
     * @param attachment
     * @param cb
     * @param cbe
     */
    detachAttachment = function (attachment, cb, cbe) {
        attachment.detachFromItem(this.id, 'lesson', cb, cbe);
    };


    api = {
        delete: '/diary/homework/:id'
    };

    save = function(cb, cbe) {

        var that = this;
        var promise = model.$q().when({});

        if(!this.subject.id){
            promise = this.subject.save();
        }

        return promise.then(()=>{
            if (that.id) {
                return that.update(cb, cbe);
            }
            else {
                return that.create(cb, cbe);
            }
        });

    };

    /**
     * Returns true if current homework is attached to a lesson
     * @returns {boolean}
     */
    isAttachedToLesson = function() {
        return typeof this.lesson_id !== 'undefined' && this.lesson_id != null;
    };

    isDraft = function () {
        return this.state === "draft";
    };

    isPublished = function () {
        return !this.isDraft();
    };

    /**
     * A directly publishable homework must exist in database and not linked to a lesson
     * @param toPublish
     * @returns {*|boolean} true if homework can be published directly
     */
    isPublishable = function (toPublish) {
        return this.id && (toPublish ? this.isDraft() : this.isPublished()) && this.lesson_id == null;
    };

    changeState = function (toPublish) {
        this.state = toPublish ? 'published' : 'draft';
    };

    update = function(cb, cbe) {
        var url = '/diary/homework/' + this.id;

        var homework = this;
        return model.getHttp()({
            method : 'PUT',
            url : url,
            data : homework
        }).then(function(){
            if (typeof cb === 'function') {
                cb();
            }
        }).catch(function(e) {
            if (cbe){
                cbe();
            }
        });
    };

    create = function(cb, cbe) {
        var homework = this;
        model.getHttp()({
            method : 'POST',
            url : '/diary/homework',
            data : homework
        }).then(function(result){
            homework.updateData(result.data);
            model.homeworks.pushAll([homework]);
            if(typeof cb === 'function'){
                cb();
            }
            return result.data;
        }).catch(function(e) {
            if (cbe){
                cbe();
            }
        });
    };

    /**
     * Load homework object from id
     * @param cb Callback function
     * @param cbe Callback on error function
     */
    load = function (cb, cbe) {

        var homework = this;


        http.get('/diary/homework/' + homework.id)
            .then(function (res) {
                homework.updateData(sqlToJsHomework(res.data));

                if (typeof cb === 'function') {
                    cb();
                }
            })
            .catch(function (e) {
                if (typeof cbe === 'function') {
                    cbe(model.parseError(e));
                }
            });
    };

    /**
     * Deletes a list of homeworks
     * @param homeworks Homeworks to be deleted
     * @param cb Callback
     * @param cbe Callback on error
     */
    deleteList = function (homeworks, cb, cbe) {
        model.deleteItemList(homeworks, 'homework', cb, cbe);
    };


    /**
     * Deletes the homework
     * @param Optional lesson attached to homework
     * @param cb Callback after delete
     * @param cbe Callback on error
     */
    delete = function (lesson, cb, cbe) {

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
            http.delete('/diary/homework/' + this.id)
                .then(function (b) {

                    deleteHomeworkReferences();

                    if (typeof cb === 'function') {
                        cb();
                    }
                })
                .catch(function (error) {
                    if (typeof cbe === 'function') {
                        cbe(model.parseError(error));
                    }
                });
        } else {
            deleteHomeworkReferences();

            if (typeof cb === 'function') {
                cb();
            }
        }
    };


    toJSON = function () {

        let json:any = {
            homework_title: this.title,
            subject_id: this.subject.id,
            homework_type_id: this.type.id,
            teacher_id: model.me.userId,
            school_id: this.audience.structureId,
            audience_id: this.audience.id,
            homework_due_date: moment(this.dueDate).format(DATE_FORMAT),
            homework_description: this.description,
            homework_color: this.color,
            homework_state: this.state,
            // used to auto create postgresql diary.audience if needed
            // not this.audience object is originally from neo4j graph (see syncAudiences function)
            audience_type: this.audience.type,
            audience_name: this.audience.name,
            attachments: this.attachments
        };

        if (this.lesson_id) {
            json.lesson_id = this.lesson_id;
        }

        /*if (!this.id) {
            created: moment(this.created).format('YYYY-MM-DD HH:mm:ss.SSSSS'); // "2016-07-05 11:48:22.18671"
        }*/

        return json;
    };
};
