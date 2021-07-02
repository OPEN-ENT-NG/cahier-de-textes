// trick to fake "mock" entcore ng class in order to use service
jest.mock('entcore', () => ({
    ng: {service: jest.fn()}
}));

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {notebookArchiveService} from '../../services';
import DoneCallback = jest.DoneCallback;
import {NotebookArchiveParams, NotebookArchiveResponse} from "../../model";

describe('notebookArchiveService', () => {
    it('should call service first',  (done: DoneCallback) => {
        const mock = new MockAdapter(axios);
        const data = { response: true };
        const structureId: string =  'structureId';
        mock.onGet(`/diary/structures/${structureId}/notebooks/archives`).reply(200, data);
        const params: NotebookArchiveParams = {schoolYear: null};
        notebookArchiveService.getNotebookArchives(structureId, params).then((response: NotebookArchiveResponse) => {
            expect(response).toEqual(data);
        });
        done();
    });
});