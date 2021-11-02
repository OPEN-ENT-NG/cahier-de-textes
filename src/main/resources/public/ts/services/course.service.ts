import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {Mix} from "entcore-toolkit";
import {Audience, Course, Courses, DateUtils, Structure, Student, Students} from "../model";
import {Group} from "../model/group";
import {ArrayUtils} from "../utils/array.utils";
import {Moment} from "moment";

export interface CourseService {
    initCoursesFromStudents(structure: Structure, studentIds: string[], momentStartAt: Moment, momentEndAt: Moment): Promise<Course[]>;
}

export const courseService: CourseService = {
    initCoursesFromStudents: async (structure: Structure, studentIds: string[], momentStartAt: Moment, momentEndAt: Moment): Promise<Course[]> => {
        let startAt: string = DateUtils.getFormattedDate(momentStartAt);
        let endAt: string = DateUtils.getFormattedDate(momentEndAt);
        let students: Students = new Students(null).set(structure.students.all.filter(
            (student: Student) => studentIds.find((id: string) => id === student.id))
        );
        let audiencesParams: string = students.getAudiences().map((audience: Audience) => `group=${audience.name}`).join('&');
        let groupsParams: string = ArrayUtils.flat(
            students.getGroups().map((group: Group) => group.name_groups.map((name: string) => `group=${name}`))
        ).join('&');

        let filter: string = !audiencesParams.trim().length ? groupsParams : `${audiencesParams}&${groupsParams}`
        try {
            let {data}: AxiosResponse =
                await http.get(`/viescolaire/common/courses/${structure.id}/${startAt}/${endAt}?${filter}`)
            return Mix.castArrayAs(Course, Courses.formatSqlDataToModel(data));
        } catch (err) {
            throw err;
        }
    },
};

export const CourseService = ng.service('CourseService', (): CourseService => courseService);

