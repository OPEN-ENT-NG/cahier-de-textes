import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {Mix} from "entcore-toolkit";
import {
    Audience,
    Course,
    Courses,
    DateUtils,
    Structure,
    Student,
    Students,
    Teacher,
} from "../model";
import {Group} from "../model/group";
import {ArrayUtils} from "../utils/array.utils";
import {Moment} from "moment";
import {UserUtils} from "../utils/user.utils";

export interface CourseService {
    initCourses(structure: Structure, momentStartAt: Moment, momentEndAt: Moment, teachers?: Teacher[],
                audience?: Audience[], groups?: Group[]): Promise<Course[]>;

    initCoursesFromStudents(structure: Structure, studentIds: string[], momentStartAt: Moment, momentEndAt: Moment): Promise<Course[]>;
}

export const courseService: CourseService = {
    initCourses: async (structure: Structure, momentStartAt: Moment, momentEndAt: Moment, teachers?: Teacher[],
                        audience?: Audience[], groups?: Group[]): Promise<Course[]> => {
        let startAt: string = DateUtils.getFormattedDate(momentStartAt);
        let endAt: string = DateUtils.getFormattedDate(momentEndAt);

        let teacherParams: string = teachers ? teachers.map((teacher: Teacher) => `teacherId=${teacher.id}`).join('&') : null;
        let audiencesParams: string = audience ? audience.map((audience: Audience) => `group=${audience.name}`).join('&') : null;
        let groupsParams: string = groups ? ArrayUtils.flat(
            groups.map((group: Group) => group.name_groups.map((name: string) => `group=${name}`))
        ).join('&') : null;

        const addFilter = (param: string, filter: string): string => `${(!filter.trim().length || !param) ? '' : '&'}${param ? param : ''}`;
        let filter: string = addFilter(teacherParams, '');
        filter += addFilter(audiencesParams, filter);
        filter += addFilter(groupsParams, filter);

        try {
            let {data}: AxiosResponse =
                await http.get(`/viescolaire/common/courses/${structure.id}/${startAt}/${endAt}?${filter}`)
            return Mix.castArrayAs(Course, Courses.formatSqlDataToModel(data));
        } catch (err) {
            throw err;
        }

    },

    initCoursesFromStudents: async (structure: Structure, studentIds: string[], momentStartAt: Moment, momentEndAt: Moment): Promise<Course[]> => {
        let audiences:  Audience[];
        let groups:  Group[];
        if (UserUtils.amIStudent()) {
            audiences = structure.audiences.all;
            groups = structure.groups.all;
        } else {
            let students: Students = new Students(null).set(structure.students.all.filter(
                (student: Student) => studentIds.find((id: string) => id === student.id))
            );
            audiences = students.getAudiences();
            groups = students.getGroups();
        }
        return courseService.initCourses(structure, momentStartAt, momentEndAt, null, audiences, groups);
    },

};

export const CourseService = ng.service('CourseService', (): CourseService => courseService);

