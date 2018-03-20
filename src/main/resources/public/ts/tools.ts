import {angular, moment, _, idiom as lang, model } from 'entcore';
import { PedagogicItem } from "./model/PedagogicItem.model";

export const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * removes accent from any string
 * @param str
 * @returns {*}
 */
export const sansAccent = function (str) {
    if (!str) {
        return;
    }
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g // C, c
    ];
    var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];


    for (var i = 0; i < accent.length; i++) {
        str = str.replace(accent[i], noaccent[i]);
    }

    return str;
};

/**
 * Transform sql homework data (table diary.homework)
 * to json
 * @param sqlHomework
 * @returns {{id: *, description: *, audience: *, subjectId: *, subjectLabel: *, type: *, typeId: *, typeLabel: *, teacherId: *, structureId: (*|T), audienceId: *, audienceLabel: *, dueDate: *, date: *, title: *, color: *, startMoment: *, endMoment: *, state: *, is_periodic: boolean, lesson_id: *}}
 */
export const sqlToJsHomework = (sqlHomework) => {
    let homework: any = {
        //for share directive you must have _id
        _id: sqlHomework.id,
        id: sqlHomework.id,
        description: sqlHomework.homework_description,
        audienceId: sqlHomework.audience_id,
        audience: model.audiences.findWhere({id: sqlHomework.audience_id}),
        subject: model.subjects.findWhere({id: sqlHomework.subject_id}),
        subjectId: sqlHomework.subject_id,
        subjectLabel: sqlHomework.subject_label,
        type: model.homeworkTypes.findWhere({id: sqlHomework.homework_type_id}),
        typeId: sqlHomework.homework_type_id,
        typeLabel: sqlHomework.homework_type_label,
        teacherId: sqlHomework.teacher_id,
        structureId: sqlHomework.structureId,
        audienceType: sqlHomework.audience_type,
        audienceLabel: sqlHomework.audience_label,
        // TODO delete dueDate? (seems redondant info vs date field)
        dueDate: moment(sqlHomework.homework_due_date),
        date: moment(sqlHomework.homework_due_date),
        title: sqlHomework.homework_title,
        color: sqlHomework.homework_color,
        startMoment: moment(sqlHomework.homework_due_date),
        endMoment: moment(sqlHomework.homework_due_date),
        state: sqlHomework.homework_state,
        is_periodic: false,
        lesson_id: sqlHomework.lesson_id
    };

    if (sqlHomework.attachments) {
        homework.attachments = JSON.parse(sqlHomework.attachments);
    }

    if ('group' === homework.audienceType) {
        homework.audienceTypeLabel = lang.translate('diary.audience.group');
    } else {
        homework.audienceTypeLabel = lang.translate('diary.audience.class');
    }

    return homework;
};


/** Converts sql pedagogic item to js data */
export const sqlToJsPedagogicItem = (data) => {
    //TODO use service
    var item = new PedagogicItem();
    item.type_item = data.type_item;
    item.id = data.id;
    //for share directive you must have _id
    item._id = data.id;
    item.lesson_id = data.lesson_id;
    item.title = data.title;
    item.subject = data.subject;
    item.audience = data.audience;
    item.start_hour = (data.type_item == "lesson") ? moment(data.day).minutes(model.getMinutes(data.start_time)).format("HH[h]mm") : "";
    item.end_hour = (data.type_item == "lesson") ? moment(data.day).minutes(model.getMinutes(data.end_time)).format("HH[h]mm") : "";
    item.type_homework = data.type_homework;
    item.teacher = data.teacher;
    item.description = data.description;
    item.expanded_description = false;
    item.state = data.state;
    item.color = data.color;
    item.getPreviewDescription();
    item.room = data.room;
    item.day = data.day;
    item.turn_in = (data.type_item == "lesson") ? "" : data.turn_in_type;
    item.selected = false;
    item.locked = data.locked;

    if (data.day) {
        item.dayFormatted = moment(data.day).format("DD/MM/YYYY");
        item.dayOfWeek = moment(data.day).format("dddd");
    }
    return item;
};


export const syncHomeworks = function (cb?) {
    return model.homeworks.syncHomeworks().then(() => {
        if (typeof cb === 'function') {
            cb();
        }
    });
};

export const syncLessonsAndHomeworks = function (cb?) {

    // need sync attached lesson homeworks
    return model.homeworks.syncHomeworks().then(() => {
        if (typeof cb === 'function') {
            cb();
        }
    });
};


/**
 * Convert sql diary.lesson row to js row used in angular model
 * @param lesson Sql diary.lesson row
 */
export const sqlToJsLesson = (data) => {

    console.warn("deprecated");
    return;
    /*var lessonHomeworks = new Array();

    // only initialize homeworks attached to lesson
    // with only id
    if (data.homework_ids) {
        for (var i = 0; i < data.homework_ids.length; i++) {
            var homework = new Homework();
            homework.id = data.homework_ids[i];
            homework.lesson_id = parseInt(data.lesson_id);
            homework.loaded = false; // means full data from sql not loaded
            lessonHomeworks.push(homework);
        }
    }

    let lesson: any = {
        //for share directive you must have _id
        _id: data.lesson_id,
        id: data.lesson_id,
        title: data.lesson_title,
        audience: model.audiences.findWhere({id: data.audience_id}),
        audienceId: data.audience_id,
        audienceLabel: data.audience_label,
        audienceType: data.audience_type,
        description: data.lesson_description,
        subject: model.subjects.findWhere({id: data.subject_id}),
        subjectId: data.subject_id,
        subjectLabel: data.subject_label,
        teacherId: data.teacher_display_name,
        teacherName: data.teacher_display_name,
        structureId: data.school_id,
        date: moment(data.lesson_date),
        startTime: data.lesson_start_time,
        endTime: data.lesson_end_time,
        color: data.lesson_color,
        room: data.lesson_room,
        annotations: data.lesson_annotation,
        startMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_start_time),
        endMoment: moment(data.lesson_date.split(' ')[0] + ' ' + data.lesson_end_time),
        state: data.lesson_state,
        is_periodic: false,
        homeworks: lessonHomeworks,
        tooltipText: '',
        locked: (!model.canEdit()) ? true : false
    };

    if ('group' === lesson.audienceType) {
        lesson.audienceTypeLabel = lang.translate('diary.audience.group');
    } else {
        lesson.audienceTypeLabel = lang.translate('diary.audience.class');
    }

    if (data.attachments) {
        lesson.attachments = _.map(JSON.parse(data.attachments), jsonToJsAttachment);
    }


    //var tooltip = getResponsiveLessonTooltipText(lesson);

    //lesson.tooltipText = tooltip;
    return lesson;*/
};

export const jsonToJsAttachment = (data) => {

    console.warn("deprecated");
    return;
    /*var att = new Attachment();
    att.id = data.id;
    att.user_id = data.user_id;
    att.creation_date = data.creation_date;
    att.document_id = data.document_id;
    att.document_label = data.document_label;

    return att;*/
};

/**
 * Set lesson tooltip text depending on screen resolution.
 * Tricky responsive must be linked to additional.css behaviour
 * @param lesson
 */
export const getResponsiveLessonTooltipText = (lesson) => {

    console.warn("deprecated use utils service");
    return;
    /*var tooltipText = lesson.title + ' (' + lang.translate(lesson.state) + ')';
    var screenWidth = window.innerWidth;

    // < 900 px display room
    if (screenWidth < 900 && lesson.room) {
        tooltipText += '<br>' + lesson.room;
    }

    // < 650 px display hour start and hour end
    if (screenWidth < 650) {
        tooltipText += '<br>' + [[lesson.startMoment.format('HH')]] + 'h' + [[lesson.startMoment.format('mm')]];
        tooltipText += ' -> ' + [[lesson.endMoment.format('HH')]] + 'h' + [[lesson.endMoment.format('mm')]];
    }

    // < 600 px display subjectlabel
    if (screenWidth < 650 && lesson.subjectLabel) {
        tooltipText += '<br>' + lesson.subjectLabel;
    }

    tooltipText = tooltipText.trim();

    return tooltipText;*/
};

/**
 * Transform sql homework load data to json like
 * @param sqlHomeworkType
 */
export const sqlToJsHomeworkLoad = (sqlHomeworkload) => {
    return {
        countLoad: sqlHomeworkload.countload,
        description: sqlHomeworkload.countload + ' ' + (sqlHomeworkload.countload > 1 ? lang.translate('diary.homework.labels') : lang.translate('diary.homework.label')),
        day: moment(sqlHomeworkload.day).format('dddd').substring(0, 1).toUpperCase(), // 'lundi' -> 'lu' -> 'L'
        numDay: moment(sqlHomeworkload.day).format('DD') // 15
    };
};

/**
 * Transform sql homework type data to json like
 * @param sqlHomeworkType
 * @returns {{id: *, structureId: (*|T), label: *, category: *}}
 */
export const sqlToJsHomeworkType = (sqlHomeworkType) => {
    return {
        id: sqlHomeworkType.id,
        structureId: sqlHomeworkType.school_id,
        label: sqlHomeworkType.homework_type_label,
        category: sqlHomeworkType.homework_type_category
    };
};

export const CONSTANTS = {
    CAL_DATE_PATTERN: "YYYY-MM-DD",
    CAL_DATE_PATTERN_NG: "dd-MM-yyyy",
    CAL_DATE_PATTERN_SLASH: "dd/MM/yyyy",
    LONG_DATE_PATTERN: 'YYYY-MM-DD hh:mm:ss',
    RIGHTS: {
        CREATE_LESSON: 'diary.createLesson',
        VIEW: 'diary.view',
        CREATE_HOMEWORK_FOR_LESSON: 'createHomeworkForLesson',
        CREATE_FREE_HOMEWORK: 'diary.createFreeHomework',

        MANAGE_MODEL_WEEK: 'diary.manageModelWeek.update',
        MANAGE_HISTORY: 'diary.manageHistory.apply',
        SHOW_HISTORY: 'diary.showHistory.filters',
        VISA_APPLY_VISA: "diary.visa.applyvisa",
        VISA_INSPECTOR: "diary.visa.inspect.filters",
        VISA_ADMIN: "diary.visa.admin.filters",
        MANAGE_INSPECTOR: "diary.manageInspect.apply",
        SHOW_OTHER_TEACHER: "diary.view.otherteacher"
    }
};