import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {notebookService} from "../../services";
import {INotebookRequest} from "../../model/Notebook";
import DoneCallback = jest.DoneCallback;

describe('notebookService', async () => {
    it('should call service first', async (done: DoneCallback) => {
        const mock = new MockAdapter(axios);
        const data = { response: true };
        mock.onGet(`/diary/notebooks?structure_id=`).reply(200, data);
        const notebookRequest: INotebookRequest = {};
        let response = await notebookService.getNotebooks(notebookRequest);
        expect(response).toEqual(data);
        expect(axios.get).toHaveBeenCalledWith(`/diary/notebooks?structure_id`);
        done();
    });
});