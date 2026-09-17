// trick to fake "mock" entcore ng class in order to use service
jest.mock('entcore', () => ({
    ng: {service: jest.fn()}
}));

jest.mock('entcore-toolkit', () => Object.assign({}, (jest as any).requireActual('entcore-toolkit'), {
    http: {get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), postFile: jest.fn(), putFile: jest.fn()}
}));

import {http} from 'entcore-toolkit';
import {mockHttpResponse} from '../../test-utils/httpMock';
import {notebookArchiveService} from '../../services';
import DoneCallback = jest.DoneCallback;
import {NotebookArchiveParams, NotebookArchiveResponse} from "../../model";

describe('notebookArchiveService', () => {
    it('should call service first',  (done: DoneCallback) => {
        const data = { response: true };
        const structureId: string =  'structureId';
        (http.get as jest.Mock).mockResolvedValueOnce(mockHttpResponse(data, {url: `/diary/structures/${structureId}/notebooks/archives`}));
        const params: NotebookArchiveParams = {schoolYear: null};
        notebookArchiveService.getNotebookArchives(structureId, params).then((response: NotebookArchiveResponse) => {
            expect(response).toEqual(data);
        });
        done();
    });
});