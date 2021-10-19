import {ng} from 'entcore'
import http from 'axios';
import {Student, Students} from "../model";
import {Mix} from "entcore-toolkit";

export interface StudentService {
    initStudents(): Promise<Student[]>;
}

export const studentService: StudentService = {
    initStudents: async (): Promise<Student[]> => {
        try {
            let {data} = await http.get('/diary/children/list');
            return Mix.castArrayAs(Student, Students.formatSqlDataToModel(data));
        } catch (err) {
            throw err;
        }
    }
};

export const StudentService = ng.service('StudentService', (): StudentService => studentService);

