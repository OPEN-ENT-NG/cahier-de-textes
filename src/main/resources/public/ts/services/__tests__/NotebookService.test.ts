// trick to fake "mock" entcore ng class in order to use service
jest.mock('entcore', () => ({
    ng: {service: jest.fn()}
}));

jest.mock('entcore-toolkit', () => Object.assign({}, (jest as any).requireActual('entcore-toolkit'), {
    http: {get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), postFile: jest.fn(), putFile: jest.fn()}
}));

import {http} from 'entcore-toolkit';
import {mockHttpResponse} from '../../test-utils/httpMock';
import {notebookService} from "../NotebookService";
import {INotebookRequest, INotebookResponse} from "../../model/Notebook";
import DoneCallback = jest.DoneCallback;

describe('notebookService',  () => {
    it('should call service first', (done: DoneCallback) => {
        const data = { response: true };
        (http.get as jest.Mock).mockResolvedValueOnce(mockHttpResponse(data, {url: `/diary/notebooks?structure_id=`}));
        const notebookRequest: INotebookRequest = {};
        notebookService.getNotebooks(notebookRequest).then((response: INotebookResponse) => {
            expect(response).toEqual(data);
        });
        done();
    });
});