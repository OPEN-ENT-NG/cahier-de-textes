// trick to fake "mock" entcore ng class in order to use service
jest.mock('entcore', () => ({
    ng: {service: jest.fn()}
}));

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {subjectService} from "../SubjectService";
import DoneCallback = jest.DoneCallback;
import {Subject} from "../../model";

describe('subjectService',  () => {
    it('should call getTimetableSubjects service first', (done: DoneCallback) => {
        const structureId: string = '111';
        const mock = new MockAdapter(axios);
        const data = { response: true };
        mock.onGet(`/diary/timetableSubjects/${structureId}`).reply(200, data);
        subjectService.getTimetableSubjects(structureId).then((response: Subject[]) => {
            console.log(response);
            expect(response).toEqual(data);
        });
        done();
    });
});