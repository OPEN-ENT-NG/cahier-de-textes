import {ng} from 'entcore'
import http, {AxiosResponse} from 'axios';
import {INotebook, INotebookRequest, INotebookResponse} from "../model/Notebook";

/**
 * notebook represents a diary gathering of sessions/homeworks
 * all together depending on their subject, audience and teacher id
 */

export interface INotebookService {
    getNotebooks(notebookRequest: INotebookRequest): Promise<INotebookResponse>;
    getNotebooksSessionsContent(notebookRequest: INotebookRequest): Promise<Array<INotebook>>;
}

export const notebookService: INotebookService = {
    getNotebooks: async (notebookRequest: INotebookRequest): Promise<INotebookResponse> => {
        let teacherParams: string = '';
        if (notebookRequest.teacher_ids) {
            notebookRequest.teacher_ids.forEach(teacherId => {
                teacherParams += `&teacher_id=${teacherId}`;
            });
        }

        let audienceParams: string = '';
        if (notebookRequest.audience_ids) {
            notebookRequest.audience_ids.forEach(audienceId => {
                audienceParams += `&audience_id=${audienceId}`;
            });
        }
        const visa: string = (notebookRequest.visa !== undefined && notebookRequest.visa !== null)
            ? `&visa=${notebookRequest.visa}` : '';

        const visaOrder: string = (notebookRequest.visa === null || notebookRequest.visa) ?
            `&orderVisa=${notebookRequest.orderVisa ? 'ASC' : 'DESC' }` : '';

        const isPublished: string = (notebookRequest.published !== undefined && notebookRequest.published !== null)
            ? `&is_published=${notebookRequest.published}` : '';

        const page: string = `&page=${notebookRequest.page.toString()}`;

        const structureUrl: string = `?structure_id=${notebookRequest.structure_id}`;
        const dateUrl: string = `&start_at=${notebookRequest.start_at}&end_at=${notebookRequest.end_at}`;
        const urlParams: string = `${visa}${visaOrder}${isPublished}${teacherParams}${audienceParams}${page}`;
        const {data}: AxiosResponse = await http.get(`/diary/notebooks${structureUrl}${dateUrl}${urlParams}`);
        return data;
    },

    getNotebooksSessionsContent: async (notebookRequest: INotebookRequest): Promise<Array<INotebook>> => {
        const teacher: string = `&teacher_id=${notebookRequest.teacher_id}`;
        const subject: string = `&subject_id=${notebookRequest.subject_id}`;
        const audience: string = `&audience_id=${notebookRequest.audience_id}`;

        const structureUrl: string = `?structure_id=${notebookRequest.structure_id}`;
        const dateUrl: string = `&start_at=${notebookRequest.start_at}&end_at=${notebookRequest.end_at}`;
        const visa: string = (notebookRequest.visa !== undefined && notebookRequest.visa !== null)
            ? `&visa=${notebookRequest.visa}` : '';
        const isPublished: string = (notebookRequest.published !== undefined && notebookRequest.published !== null)
            ? `&is_published=${notebookRequest.published}` : '';
        const urlParams: string = `${teacher}${subject}${audience}${visa}${isPublished}`;
        const {data}: AxiosResponse = await http.get(`/diary/notebooks/sessions/homeworks${structureUrl}${dateUrl}${urlParams}`);
        return data;
    }
};

export const NotebookService = ng.service('NotebookService', (): INotebookService => notebookService);
