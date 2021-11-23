import {ng} from 'entcore'
import http from 'axios';
import {Group} from "../model/group";
import {Mix} from "entcore-toolkit";

export interface GroupService {
    initGroupsFromStudentIds(studentIds: string[]): Promise<Group[]>;

    initGroupsFromClassIds(classIds: string[]): Promise<Group[]>;
}

export const groupService: GroupService = {
    initGroupsFromStudentIds: async (studentIds: string[]): Promise<Group[]> => {
        try {
            let studentParams: string = studentIds.map((id: string) => `student=${id}`).join('&');
            let {data} = await http.get(`/viescolaire/group/from/class?${studentParams}`);
            return Mix.castArrayAs(Group, data);
        } catch (err) {
            throw err;
        }
    },


    initGroupsFromClassIds: async (classIds: string[]): Promise<Group[]> => {
        try {
            let groupParams: string = classIds.map((id: string) => `classes=${id}`).join('&');
            let {data} = await http.get(`/viescolaire/group/from/class?${groupParams}`);
            return Mix.castArrayAs(Group, data);
        } catch (err) {
            throw err;
        }
    },
};

export const GroupService = ng.service('GroupService', (): GroupService => groupService);

