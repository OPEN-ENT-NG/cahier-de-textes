import { model, Model} from 'entcore';

export class Subject extends Model {

    id:any;
    school_id;any;
    label:any;
    originalsubjectid:any;
    teacher_id:any;


    constructor(data?) {
        super();
        if (data) {
            for (let key in data) {
                this[key] = data[key]
            }
        }
    }

    /**
     * Saves the subject to databases.
     * It's auto-created if it does not exists in database
     * @param cb
     * @param cbe
     */
    save = function (cb, cbe) {
        if (this.id) {
            // not implemented yet at this stage/ not needed
        }
        else {
            return this.create(cb, cbe);
        }
    };

    /**
     * Creates a subject
     * @param cb Callback function
     * @param cbe Callback on error function
     */
    create = function (cb, cbe) {
        var subject = this;

        if (!this.school_id) {
            this.school_id = model.me.structures[0];
        }

        return model.getHttp()({
            method: 'POST',
            url: '/diary/subject',
            data: subject
        }).then(function (result) {
            //subject.updateData(subject);
            subject.updateData(result.data);
            model.subjects.all.push(subject);
            if (typeof cb === 'function') {
                cb();
            }
            return subject;
        });
    };


    toJSON = function () {

        return {
            id: this.id,
            school_id: this.school_id,
            subject_label: this.label,
            teacher_id: this.teacher_id,
            original_subject_id: this.originalsubjectid
        };
    };
}
