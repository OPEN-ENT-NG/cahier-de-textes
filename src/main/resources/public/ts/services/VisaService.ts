import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {IVisa} from "../model";

export interface IVisaService {
    getVisas(structure_id: string, sessionIds: Array<number>, homeworkIds: Array<number>): Promise<Array<IVisa>>;
}

export const visaService: IVisaService = {
    getVisas: async (structure_id: string, sessionIds: Array<number>, homeworkIds: Array<number>): Promise<Array<IVisa>> => {
        const structureUrl: string = `?structure_id=${structure_id}`;
        let sessionParams: string = '';
        if (sessionIds) {
            sessionIds.forEach((id: number) => {
                sessionParams += `&session_id=${id}`;
            });
        }
        let homeworkParams: string = '';
        if (homeworkIds) {
            homeworkIds.forEach((id: number) => {
                homeworkParams += `&homework_id=${id}`;
            });
        }
        const {data}: AxiosResponse = await http.get(`/diary/visas${structureUrl}${sessionParams}${homeworkParams}`);
        return data;
    }
};

export const VisaService = ng.service('VisaService', (): IVisaService => visaService);
