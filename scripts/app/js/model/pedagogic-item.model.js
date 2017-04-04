function PedagogicItem() {
    this.selected = false;
}


PedagogicItem.prototype.deleteModelReferences = function () {
    model.deletePedagogicItemReferences(this.id);
};

PedagogicItem.prototype.changeState = function (toPublish) {
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

PedagogicItem.prototype.isPublished = function () {
    return this.state === 'published';
};

PedagogicItem.prototype.descriptionMaxSize = 140;

PedagogicItem.prototype.getPreviewDescription = function () {

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
    if (model.searchForm.selectedSubject != null) {
        return !(this.subject === model.searchForm.selectedSubject);
    }
    return false;
};
