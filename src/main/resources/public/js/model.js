function Homework() {

}

Homework.prototype.api = {
    put: '/diary/homework/:id',
    delete: '/diary/homework/:id',
    post: '/diary/homework'
};

Homework.prototype.toJSON = function(){
    return {
        homework_title: this.title,
        subject_label: this.subject.label,
        subject_code: this.subject.code,
        homework_type_id: this.type.id,
        teacher_id: model.me.userId,
        school_id: this.classroom.structureId,
        audience_type: this.audienceType,
        audience_id: this.classroom.id,
        audience_label: this.classroom.name,
        homework_due_date: this.dueDate.format('YYYY-MM-DD'),
        homework_description: this.description,
        homework_color: this.color
    }
};

function Attachment(){}
function Subject() { }
function Classroom() { }
function StudentGroup() { }
function HomeworkType(){}

function Lesson(data) {
    this.collection(Attachment);
    this.collection(Homework);
    this.subject = new Subject();
    this.classroom = new Classroom();
}

Lesson.prototype.api = {
    put: '/diary/lesson/:id',
    delete: '/diary/lesson/:id',
    post: '/diary/lesson'
};

Lesson.prototype.toJSON = function () {
    return {
        lesson_title: this.title,
        subject_code: this.subject.code,
        subject_label: this.subject.label,
        school_id: this.classroom.structureId,
        audience_type: this.audienceType,
        audience_id: this.classroom.id,
        audience_label: this.classroom.name,
        lesson_date: this.date.format('YYYY-MM-DD'),
        lesson_start_time: this.startTime.format('HH:mm'),
        lesson_end_time: this.endTime.format('HH:mm'),
        lesson_description: this.description,
        lesson_annotation: this.annotations,
        lesson_room: this.room,
        lesson_color: this.color
    }
};

Lesson.prototype.addHomework = function () {
    var homework = new Homework();
    homework.dueDate = this.date;
    homework.type = model.homeworkTypes.first();
    this.homeworks.push(homework);
};

model.build = function () {
    model.makeModels([HomeworkType, Classroom, Subject, Lesson, Homework]);

    this.collection(Lesson, {
        sync: function () {
            var lessons = [];
            var start = moment(model.calendar.dayForWeek).day(1).format('YYYY-MM-DD');
            var end = moment(model.calendar.dayForWeek).day(1).add(1, 'week').format('YYYY-MM-DD');
            var that = this;

            if(model.classrooms.all.length === 0 || model.subjects.all.length ===0){
                return;
            }

            model.me.structures.forEach(function (structureId) {
                http().get('/diary/lesson/' + structureId + '/' + start + '/' + end).done(function (data) {
                    lessons = lessons.concat(data);
                    that.load(
                        _.map(lessons, function (lesson) {
                            return {
                                id: lesson.lesson_id,
                                title: lesson.lesson_title,
                                description: lesson.lesson_description,
                                /* fixme Object can't used in calendar item template, why empty */
                                subject: model.subjects.findWhere({ code: lesson.subject_code }),
                                subjectLabel: model.subjects.findWhere({ code: lesson.subject_code }).label,
                                teacherId: lesson.teacher_display_name,
                                structureId: lesson.school_id,
                                /* fixme Object can't used in calendar item template, why empty */
                                classroom: model.classrooms.findWhere({ id: lesson.audience_id }),
                                classroomName: model.classrooms.findWhere({ id: lesson.audience_id }).name,
                                date: lesson.lesson_date,
                                startTime: lesson.lesson_start_time,
                                endTime: lesson.lesson_end_time,
                                color: lesson.lesson_color,
                                room: lesson.lesson_room,
                                annotation: lesson.lesson_annotation,
                                startMoment: moment(lesson.lesson_date.split(' ')[0] + ' ' + lesson.lesson_start_time),
                                endMoment: moment(lesson.lesson_date.split(' ')[0] + ' ' + lesson.lesson_end_time),
                                is_periodic: false
                            }
                        })
                    );
                });
            });
        }
    });

    this.collection(Subject, {
        sync: function () {
            this.load([
                { label: 'test', code: 'test' }
            ]);
        }
    });

    this.collection(Classroom, {
        sync: function (cb) {
            this.all = [];
            var nbStructures = model.me.structures.length;
            var that = this;
            model.me.structures.forEach(function (structureId) {
                http().get('/userbook/structure/' + structureId).done(function (structureData) {
                    structureData.classes = _.map(structureData.classes, function (classroom) {
                        classroom.structureId = structureId;
                        return classroom;
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
        sync: function(){
            model.one('classrooms.sync', function(){
                http().get('/diary/public/json/homeworks.json').done(function(homeworks){
                this.load(
                    _.map(homeworks, function(homework){
                            return {
                                id: homework.id,
                                description: homework.homework_description,
                                subject: model.subjects.findWhere({ code: homework.subject_code }),
                                type: model.homeworkTypes.findWhere({ id: homework.type_id }),
                                teacherId: homework.teacher_id,
                                structureId: homework.structureId,
                                classroom: model.classrooms.findWhere({ id: homework.audience_id }),
                                dueDate: homework.homework_due_date,
                                date: moment(homework.homework_due_date),
                                title: homework.homework_title,
                                color: homework.homework_color
                            }  
                    })
                ) 
                }.bind(this));
            }.bind(this));
        }
    });

    model.on('calendar.date-change', function () { model.lessons.sync() })
}