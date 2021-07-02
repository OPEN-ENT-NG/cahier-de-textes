// trick to fake "mock" entcore ng class in order to use service
jest.mock('entcore', () => ({
    ng: {service: jest.fn()}
}));

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {notebookService} from "../NotebookService";
import {INotebookRequest, INotebookResponse} from "../../model/Notebook";
import DoneCallback = jest.DoneCallback;

describe('notebookService',  () => {
    it('should call service first', (done: DoneCallback) => {
        const mock = new MockAdapter(axios);
        const data = { response: true };
        mock.onGet(`/diary/notebooks?structure_id=`).reply(200, data);
        const notebookRequest: INotebookRequest = {};
        notebookService.getNotebooks(notebookRequest).then((response: INotebookResponse) => {
            expect(response).toEqual(data);
        });
        done();
    });
});