import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';

export interface StructureSlot {
    _id: string;
    name: string;
    slots: TimeSlot[];
}

export interface TimeSlot {
    name: string;
    startHour: string;
    endHour: string;
    id: string;
    _id?: string;
}

export interface StructureService {
    initStructure(structure_id: string): Promise<AxiosResponse>;
    getSlotProfile(structureId: string): Promise<StructureSlot>;
    fetchInitializationStatus(structure_id: string): Promise<boolean>;
}

export const structureService: StructureService = {
    initStructure: async (structure_id: string): Promise<AxiosResponse> => {
        return http.get(`/diary/init/structures/${structure_id}`);
    },

    getSlotProfile: async (structureId: string) => {
        try {
            const {data} = await http.get(`/viescolaire/structures/${structureId}/time-slot`);
            return data;
        } catch (err) {
            throw err;
        }
    },

    fetchInitializationStatus: async (structure_id: string): Promise<boolean> => {
        try {
            const {data} = await http.get(`/diary/initialization/structures/${structure_id}`);
            if ('initialized' in data) {
                // case structure with initialized exists
                return data.initialized;
            } else {
                // case no structure with initialized exists (not initialized either way)
                return false;
            }
        } catch (err) {
            throw err;
        }
    }
};

export const StructureService = ng.service('StructureService', (): StructureService => structureService);

