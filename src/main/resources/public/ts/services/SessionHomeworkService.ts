import {model, moment, ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {DateUtils, Homework, ISessionHomeworkBody, ISessionHomeworkService} from "../model";

export const sessionHomeworkService: ISessionHomeworkService = {
    create: async (sessionHomework: ISessionHomeworkBody): Promise<AxiosResponse> => {
        const formatPostHomeworks = (homeworks: Array<Homework>) => {
            return homeworks.map(h => {
                let res = basicFormatHomework(h);
                if (h.attachedToSession) {
                    res['sessions'] = h.sessions.map(s => {
                        return {
                            id: s.id ? s.id : null,
                            subject_id: s.subject.id,
                            type_id: s.type.id ? s.type.id : s.type_id,
                            structure_id: s.structure.id,
                            audience_id: s.audience.id,
                            title: "Séance du " + moment(s.date).format("DD/MM/YYYY"),
                            room: s.room,
                            color: s.color,
                            description: "",
                            annotation: s.annotation,
                            is_published: s.isPublished ? s.isPublished : null,
                            course_id: s.courseId ? s.courseId : null,
                            date: DateUtils.getFormattedDate(s.date),
                            start_time: DateUtils.getFormattedTime(s.startTime),
                            end_time: DateUtils.getFormattedTime(s.endTime),
                            due_date: DateUtils.getFormattedDate(s.date),
                        }
                    });
                } else {
                    res['due_date'] = DateUtils.getFormattedDate(h.dueDate);
                }
                return res;
            });
        };

        return http.post(`/diary/sessions/homework`, {homeworks: formatPostHomeworks(sessionHomework.homeworks)});
    },

    update: async (sessionHomework: ISessionHomeworkBody): Promise<AxiosResponse> => {
        const formatPutHomeworks = (homeworks: Array<Homework>) => {
            return homeworks.map(h => basicFormatHomework(h));
        };
        return http.put(`/diary/sessions/homework`, {homeworks: formatPutHomeworks(sessionHomework.homeworks)});
    },
};

const basicFormatHomework = (h: Homework) => {
    return {
        id: h.id ? h.id : null,
        subject_id: h.subject.id,
        audience_id: h.audience.id,
        teacher_id: model.me.userId,
        structure_id: h.structure.id,
        estimatedTime: h.estimatedTime ? h.estimatedTime : 0,
        color: h.color,
        description: DateUtils.htmlToXhtml(h.description),
        is_published: h.isPublished,
        type_id: h.type.id
    };
};

export const SessionHomeworkService = ng.service('SessionHomeworkService', (): ISessionHomeworkService => sessionHomeworkService);
