import {ng} from 'entcore';
import http, {AxiosResponse} from 'axios';
import {Audience, Student} from "../model";

export interface CollectiveAbsenceService {

    getCollectiveAbsence(audience: Audience, structureId: string): Promise<Student[]>;

}

export const collectiveAbsenceService: CollectiveAbsenceService = {

    /**
     * Get students from audience.
     * @param audience          audience  by which we want to collect students
     * @param structureId       structure identifier
     */
    getCollectiveAbsence : async (audience: Audience, structureId: string): Promise<Student[]> => {
        return http.get(`/diary/structures/${structureId}/audiences/${audience.id}/students`)
            .then((res: AxiosResponse) => { return res.data; });
    },
};

export const CollectiveAbsenceService = ng.service('CollectiveAbsenceService',
    (): CollectiveAbsenceService => collectiveAbsenceService);