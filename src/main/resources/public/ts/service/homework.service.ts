import { _, idiom as lang, moment, model, $http } from 'entcore';
import { jsonToJsAttachment, CONSTANTS } from '../tools';



/*
* Homework service as class
* used to manipulate Homework model
*/
export class HomeworkService {

    static getHomeworks(userStructuresIds,mondayOfWeek,isUserParent,childId, fromDate, toDate){
        var start = moment(mondayOfWeek).day(1).format(CONSTANTS.CAL_DATE_PATTERN);
        var end = moment(mondayOfWeek).day(1).add(1, 'week').format(CONSTANTS.CAL_DATE_PATTERN);
        if (fromDate){
            start = fromDate.format(CONSTANTS.CAL_DATE_PATTERN);
            end = toDate.format(CONSTANTS.CAL_DATE_PATTERN);
        }
        var urlGetHomeworks = `/diary/homework/${userStructuresIds}/${start}/${end}/`;

        if (isUserParent && childId) {
            urlGetHomeworks += childId;
        } else {
            urlGetHomeworks += '%20';
        }

        return $http.get(urlGetHomeworks).then((result)=>{
            return this.mappHomework(result.data);
        });
    }

    static getOtherHomeworks(userStructuresIds,mondayOfWeek,teacher,audience, fromDate, toDate){
        var start = moment(mondayOfWeek).day(1).format(CONSTANTS.CAL_DATE_PATTERN);
        var end = moment(mondayOfWeek).day(1).add(1, 'week').format(CONSTANTS.CAL_DATE_PATTERN);
        if (fromDate){
            start = fromDate.format(CONSTANTS.CAL_DATE_PATTERN);
            end = toDate.format(CONSTANTS.CAL_DATE_PATTERN);
        }
        let type = teacher ? "teacher" : "audience";
        let id = teacher ? teacher.key : audience.key;

        var urlGetHomeworks = `/diary/homework/external/${userStructuresIds}/${start}/${end}/${type}/${id}`;

        return $http.get(urlGetHomeworks).then((result)=>{
            return this.mappHomework(result.data);
        });
    }

    /*
    *   Mapp homeworks
    */
    static mappHomework(homeworks){
        return _.map(homeworks,(sqlHomework) =>{
            let homework:any =   {
                //for share directive you must have _id
                _id:  sqlHomework.id,
                id: sqlHomework.id,
                description: sqlHomework.homework_description,
                audienceId: sqlHomework.audience_id,
                audience: model.audiences.findWhere({ id: sqlHomework.audience_id }),
                subject: model.subjects.findWhere({ id: sqlHomework.subject_id }),
                subjectId: sqlHomework.subject_id,
                subjectLabel: sqlHomework.subject_label,
                type: model.homeworkTypes.findWhere({ id: sqlHomework.homework_type_id }),
                typeId: sqlHomework.homework_type_id,
                typeLabel: sqlHomework.homework_type_label,
                teacherId: sqlHomework.teacher_id,
                structureId: sqlHomework.structureId,
                audienceType: sqlHomework.audience_type,
                audienceLabel: sqlHomework.audience_label,
                teacherName: sqlHomework.teacher_display_name,
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
                homework.attachments = _.map(JSON.parse(sqlHomework.attachments), jsonToJsAttachment);
            }

            if('group' === homework.audienceType){
                homework.audienceTypeLabel = lang.translate('diary.audience.group');
            } else {
                homework.audienceTypeLabel = lang.translate('diary.audience.class');
            }

            return homework;
        });
    }


};