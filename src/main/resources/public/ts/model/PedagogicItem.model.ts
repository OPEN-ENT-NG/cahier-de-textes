import { model, _ } from 'entcore';
import http from 'axios';

export class PedagogicItem {
    selected:any;
    type_item: any;
    id: any;
    _id: any;
    lesson_id: any;
    title: any;
    subject: any;
    audience: any;
    start_hour: any;
    end_hour: any;
    type_homework: any;
    teacher: any;
    description: any;
    expanded_description: any;
    state: any;
    color: any;
    getPreviewDescription: any;
    room: any;
    day: any;
    turn_in: any;
    locked: any;
    dayFormatted: any;
    dayOfWeek: any;

    constructor(){
        this.selected = false;
    }

    deleteModelReferences = function () {
        model.deletePedagogicItemReferences(this.id);
    };

    changeState = function (toPublish) {
        //if item is a lesson may need to upgrade his related homework
        if (this.type_item === 'lesson') {
            var relatedToLesson = model.pedagogicDays.getItemsByLesson(this.id);
            relatedToLesson.forEach(function (item) {
                item.state = toPublish ? 'published' : 'draft';
            })
        } else {
            this.state = toPublish ? 'published' : 'draft';
        }
    };

    isPublished = function () {
        return this.state === 'published';
    };

    descriptionMaxSize = 140;

    getPreviewDescription = function () {

        if (this.description) {
            if (this.description.length >= this.descriptionMaxSize) {
                this.preview_description = '<p class="itemPreview">' + $('<div>' + this.description + '</div>').text().substring(0, this.descriptionMaxSize) + '...</p>';
            } else {
                this.preview_description = this.description;
            }
        } else {
            this.preview_description = this.description;
        }
    };

    isPublishable = function(toPublish){
        return this.id && this.state == (toPublish ? 'draft' : 'published') && (this.lesson_id == null || this.lesson_id == this.id); // id test to detect free homeworks
    };

    delete = function(cb, cbe) {

        var url = (this.type_item == "lesson") ? '/diary/lesson/' : '/diary/homework/';
        var idToDelete = this.id;
        http.delete(url + idToDelete, this).then(function (b) {

            model.deletePedagogicItemReferences(idToDelete);

            if (typeof cb === 'function') {
                cb();
            }
        }).catch(function (e) {
            if (typeof cbe === 'function') {
                cbe(model.parseError(e));
            }
        });
    };

    deleteList = function(items, cb, cbe) {

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

    isFiltered = function () {
        if (model.searchForm.selectedSubject != null) {
            return !(this.subject === model.searchForm.selectedSubject);
        }
        return false;
    };
};