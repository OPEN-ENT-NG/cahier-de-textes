import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {User} from '../model';

export interface SearchItem {
    id?: string;
    groupName?: string;
    displayName?: string;
    groupId?: string;
    name?: string;
    type?: string;
    toString?: () => string;
}

export interface SearchService {
    search(structureId: string, value: string): Promise<SearchItem[]>;

    searchUser(structureId: string, value: string, profile: string): Promise<User[]>;

    searchGroup(structureId: string, value: string): Promise<SearchItem[]>;
}

export const SearchService: SearchService = {
    search: async (structureId: string, value: string): Promise<SearchItem[]> => {
        try {
            value = value.replace("\\s", "").toLowerCase();
            const {data}: AxiosResponse = await http.get(`/diary/search?structureId=${structureId}&q=${value}`);
            data.forEach((item) => item.toString = () => item.displayName);
            return data;
        } catch (err) {
            throw err;
        }
    },
    searchUser: async (structureId: string, value: string, profile: string): Promise<User[]> => {
        try {
            value = value.replace("\\s", "").toLowerCase();
            const {data}: AxiosResponse = await http.get(`/diary/search/users?structureId=${structureId}&profile=${profile}&q=${value}&field=firstName&field=lastName`);
            data.forEach((user) => user.toString = () => user.displayName);
            return data;
        } catch (err) {
            throw err;
        }
    },
    searchGroup: async (structureId: string, value: string): Promise<SearchItem[]> => {
        try {
            value = value.replace("\\s", "").toLowerCase();
            const {data}: AxiosResponse = await http.get(`/diary/search/groups?structureId=${structureId}&q=${value}&field=name`);
            return data;
        } catch (err) {
            throw err;
        }
    }
};

export const searchService = ng.service('SearchService', (): SearchService => SearchService);