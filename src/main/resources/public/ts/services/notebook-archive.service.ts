import {ng} from 'entcore';
import http, {AxiosResponse} from 'axios';
import {NotebookArchiveParams, NotebookArchiveResponse, NotebookArchiveSearchResponse} from '../model';


export interface INotebookArchiveService {
    getNotebookArchives(structureId: string, params: NotebookArchiveParams): Promise<NotebookArchiveResponse>;

    getArchiveYears(structureId: string): Promise<Array<string>>;

    exportNotebookArchives(structureId: string, archiveId: Array<number>): void;

    searchTeacher(structureId: string, teacherName: string): Promise<Array<string>>;

    searchAudience(structureId: string, audienceName: string): Promise<Array<string>>;
}

export const notebookArchiveService: INotebookArchiveService = {
    /**
     * Get notebook archive list.
     * @param structureId   structure identifier
     * @param params        notebook archives filter parameters
     */
    getNotebookArchives: async (structureId: string, params: NotebookArchiveParams): Promise<NotebookArchiveResponse> => {
        let urlParams: string = `?schoolYear=${params.schoolYear}`;

        if (params.teacherName) {
            for (let i = 0; i < params.teacherName.length; i++) {
                urlParams += `&teacherName=${params.teacherName[i]}`;
            }
        }
        if (params.audienceLabel) {
            for (let i = 0; i < params.audienceLabel.length; i++) {
                urlParams += `&audienceLabel=${params.audienceLabel[i]}`;
            }
        }

        urlParams += (params.page !== undefined && params.page !== null)  ? `&page=${params.page}` : '';

        return http.get(`/diary/structures/${structureId}/notebooks/archives${urlParams}`)
            .then((res: AxiosResponse) => {
                return res.data;
            });
    },

    /**
     * Get notebook archive school year list
     * @param structureId       structure identifier
     */
    getArchiveYears: async (structureId: string): Promise<Array<string>> => {
        return http.get(`/diary/structures/${structureId}/notebooks/archives/periods`)
            .then((res: AxiosResponse) => {
                return res.data.archiveSchoolYears;
            });
    },

    /**
     * Download notebook archives as PDF
     * @param structureId       structure identifier
     * @param archiveId         archive(s) identifier(s)
     */
    exportNotebookArchives: (structureId: string, archiveId: Array<number>): void => {

        let archiveParams: string = `?archiveId=${archiveId[0]}`;

        if (archiveId.length > 1) {
            for (let i = 1; i < archiveId.length ; i++) {
                archiveParams += `&archiveId=${archiveId[i]}`;
            }
        }

        window.open(`/diary/structures/${structureId}/notebooks/archives/export${archiveParams}`);
    },

    searchTeacher: (structureId: string, teacherName: string): Promise<Array<string>> => {
        return http.get(`/diary/structures/${structureId}/notebooks/archives/teachers/${teacherName}`)
            .then((res: NotebookArchiveSearchResponse) => {
                return res.data.teacherNames;
            });
    },

    searchAudience: (structureId: string, audienceName: string): Promise<Array<string>> => {
        return http.get(`/diary/structures/${structureId}/notebooks/archives/audiences/${audienceName}`)
            .then((res: NotebookArchiveSearchResponse) => {
                return res.data.audienceNames;
            });
    }
};

export const NotebookArchiveService = ng.service('NotebookArchiveService',
    (): INotebookArchiveService => notebookArchiveService);