import {ng} from '../../model/__mocks__/entcore';

import {DateUtils} from "../dateUtils";
import DoneCallback = jest.DoneCallback;

describe('dateUtils',  () => {
    it('test convertHtmlToPlainText method', (done: DoneCallback) => {
        let html: string = "";
        let expected: string = "";
        expect(DateUtils.convertHtmlToPlainText(html)).toEqual(expected);
        html = "Bonjour";
        expected = "Bonjour";
        expect(DateUtils.convertHtmlToPlainText(html)).toEqual(expected);
        html = "<html></html>";
        expected = "";
        expect(DateUtils.convertHtmlToPlainText(html)).toEqual(expected);
        html = "<html>Bonjour<div>A</div><p>Tous</p></html>";
        expected = "BonjourA Tous";
        expect(DateUtils.convertHtmlToPlainText(html)).toEqual(expected);
        html = "<html>Bonjour <img source\"urlsource\"/><p>World</p></html>";
        expected = "Bonjour <img source\"urlsource\"/>World";
        expect(DateUtils.convertHtmlToPlainText(html)).toEqual(expected);
        html = "<html>Bonjour <img source\"urlsource\">World</img></html>";
        expected = "Bonjour <img source\"urlsource\">World</img>";
        expect(DateUtils.convertHtmlToPlainText(html)).toEqual(expected);
        done();
    });
});