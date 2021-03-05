import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {notebookArchiveService} from '../../services';
import DoneCallback = jest.DoneCallback;
import {NotebookArchiveParams} from "../../model";

describe('notebookArchiveService', async () => {
    it('should call service first', async (done: DoneCallback) => {
        const mock = new MockAdapter(axios);
        const data = { response: true };
        const structureId: string =  'structureId';
        mock.onGet(`/diary/structures/${structureId}/notebooks/archives`).reply(200, data);
        const params: NotebookArchiveParams = {schoolYear: null};
        let response = await notebookArchiveService.getNotebookArchives(structureId, params);
        expect(response).toEqual(data);
        expect(axios.get).toHaveBeenCalledWith(`/diary/structures/${structureId}/notebooks/archives`);
        done();
    });
});