import {ng} from 'entcore'
import {ISchoolYearPeriod} from "../model";
import http from "axios";

export interface IViescolaireService {
    getSchoolYearDates(structureId): Promise<ISchoolYearPeriod>;
}

export const ViescolaireService: IViescolaireService = {
    getSchoolYearDates: async (structureId: string): Promise<ISchoolYearPeriod> => {
        let {data} = await http.get(`viescolaire/settings/periode/schoolyear?structureId=` + structureId);
        return data;
    }
};

export const viescolaireService = ng.service('ViescolaireService', (): IViescolaireService => ViescolaireService);