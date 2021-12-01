import {ng} from 'entcore'
import http from 'axios';
import {Group} from "../model/group";
import {Mix} from "entcore-toolkit";
import {RestrictedGroup} from "../model/RestrictedGroup";

export interface RestrictedGroupService {
    saveRestrictedGroup(restrictedGroup: RestrictedGroup): Promise<Group[]>;
}

export const restrictedGroupService: RestrictedGroupService = {
    saveRestrictedGroup: async (restrictedGroup: RestrictedGroup): Promise<Group[]> => {
        try {
            console.log(restrictedGroup)
            let {data} = await http.post(`/diary/restrictedGroup`, restrictedGroup);
            return Mix.castArrayAs(Group, data);
        } catch (err) {
            throw err;
        }
    },
};

export const RestrictedGroupService = ng.service('RestrictedGroupService', (): RestrictedGroupService => restrictedGroupService);

