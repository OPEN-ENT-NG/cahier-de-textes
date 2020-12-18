import {ng} from 'entcore'
import http from 'axios';
import {User} from '../model';

export interface SearchItem {
    id: string;
    displayName: string;
    type: string;
}

export interface SearchService {
    search(structureId: string, value: string): Promise<SearchItem[]>;

    searchUser(structureId: string, value: string, profile: string): Promise<User[]>;
}

export const SearchService = ng.service('SearchService', (): SearchService => ({
    search: async (structureId: string, value: string) => {
        try {
            const {data} = await http.get(`/diary/search?structureId=${structureId}&q=${value}`);
            data.forEach((item) => item.toString = () => item.displayName);
            return data;
        } catch (err) {
            throw err;
        }
    },
    searchUser: async (structureId: string, value: string, profile: string) => {
        try {
            const {data} = await http.get(`/diary/search/users?structureId=${structureId}&profile=${profile}&q=${value}&field=firstName&field=lastName`);
            data.forEach((user) => user.toString = () => user.displayName);
            return data;
        } catch (err) {
            throw err;
        }
    }
}));