
function Subject() { }

/**
 * Saves the subject to databases.
 * It's auto-created if it does not exists in database
 * @param cb
 * @param cbe
 */
Subject.prototype.save = function(cb, cbe){
    if(this.id) {
        // not implemented yet at this stage/ not needed
    }
    else {
        this.create(cb, cbe);
    }
};

/**
 * Creates a subject
 * @param cb Callback function
 * @param cbe Callback on error function
 */
Subject.prototype.create = function (cb, cbe) {
    var subject = this;
    return model.getHttp()({
      method : 'POST',
      url : '/diary/subject',
      data : subject
    }).then(function (result) {
            subject.updateData(result.data);
            model.subjects.all.push(subject);
            if (typeof cb === 'function') {
                cb();
            }
            return result.data;
        });
};


Subject.prototype.toJSON = function () {

    return {
        id: this.id,
        school_id: this.school_id,
        subject_label: this.label,
        teacher_id: this.teacher_id,
        original_subject_id:this.originalsubjectid
    };
};
