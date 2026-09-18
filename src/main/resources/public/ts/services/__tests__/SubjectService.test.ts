// trick to fake "mock" entcore ng class in order to use service
jest.mock('entcore', () => ({
    ng: {service: jest.fn()}
}));

jest.mock('entcore-toolkit', () => Object.assign({}, (jest as any).requireActual('entcore-toolkit'), {
    http: {get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), postFile: jest.fn(), putFile: jest.fn()}
}));

import {http} from 'entcore-toolkit';
import {mockHttpResponse} from '../../test-utils/httpMock';
import {subjectService} from "../SubjectService";
import DoneCallback = jest.DoneCallback;
import {Subject} from "../../model";

describe('subjectService',  () => {
    it('should call getTimetableSubjects service first', (done: DoneCallback) => {
        const structureId: string = '111';
        const data = { response: true };
        (http.get as jest.Mock).mockResolvedValueOnce(mockHttpResponse(data, {url: `/diary/timetableSubjects/${structureId}`}));
        subjectService.getTimetableSubjects(structureId).then((response: Subject[]) => {
            console.log(response);
            expect(response).toEqual(data);
        });
        done();
    });
});