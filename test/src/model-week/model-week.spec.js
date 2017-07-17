var constants = require('../constants');
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var progressionService = require('../common/progression.service.js');
var pgService = require('../common/pg.service.js');
var utilsService = require('../common/utils.service.js');
var dragAndDrop = require('html-dnd').code;
var modelWeekService = require('../common/model-week.service.js');
// spec.js
describe('Protractor Progression Calendar', function() {

    it('Should remove datas ', function() {
        pgService.removeData();
    });

    it('Should connect', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("teacher", "#/calendarView/" + week);
    });

    it('Should be in week A', function() {
        browser.sleep(400);
        $('.current-week-indicator').getText().then((text)=>{
          expect(text.trim()).toEqual("Semaine courante A");
        });
        lessonService.createLessonFromCal(14,true);
    });

    it('Should set week A', function() {

        modelWeekService.selectWeek(0);

        browser.sleep(400);

        $('[ng-if="isModelWeek"]').getText().then((text)=>{
          expect(text.trim()).toEqual("( cette semaine est enregistrée comme modèle de semaine A )");
        });

        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(0);
        });

        $('[ng-click="nextWeek();"]').click();
        browser.sleep(400);
        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(0);
        });

        $('[ng-click="nextWeek();"]').click();
        browser.sleep(400);
        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(1);
        });

        $('[ng-click="previousWeek();"]').click();
        browser.sleep(400);
        $('[ng-click="previousWeek();"]').click();
        browser.sleep(400);
        lessonService.createLessonFromCal(36,true);

        $('[ng-click="nextWeek();"]').click();
        browser.sleep(400);
        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(0);
        });

        $('[ng-click="nextWeek();"]').click();
        browser.sleep(400);
        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(2);
        });
    });

    it('Should set week B', function() {
        $('[ng-click="previousWeek();"]').click();
        browser.sleep(400);

        lessonService.createLessonFromCal(12,true);

        modelWeekService.selectWeek(1);

        $('[ng-if="isModelWeek"]').getText().then((text)=>{
          expect(text.trim()).toEqual("( cette semaine est enregistrée comme modèle de semaine B )");
        });

        $('[ng-click="nextWeek();"]').click();
        browser.sleep(400);
        $('[ng-click="nextWeek();"]').click();
        browser.sleep(400);
        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(1);
        });
        $('[ng-click="previousWeek();"]').click();
        browser.sleep(400);
        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(2);
        });
    });

    it('Should invert week A and week B', function() {
        //browser.pause();
        modelWeekService.selectWeek(2);
        browser.sleep(400);
        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(1);
        });
        $('[ng-click="nextWeek();"]').click();
        browser.sleep(400);
        $$('[ng-click="createNewtemFromSchedule(item)"]').then(function(items) {
          expect(items.length).toBe(2);
        });
    });

    it('Should createNewtemFromSchedule', function() {
        $$('[ng-click="createNewtemFromSchedule(item)"]').get(0).click();
        lessonService.saveLesson(true);
        browser.sleep(800);
        expect($$('[ng-click="createNewtemFromSchedule(item)"]').get(0).isDisplayed()).toBe(false);
        expect($$('[ng-click="createNewtemFromSchedule(item)"]').get(1).isDisplayed()).toBe(true);

        $$('[ng-click="createNewtemFromSchedule(item)"]').get(1).click();
        lessonService.saveLesson(false);
        browser.sleep(800);
        expect($$('[ng-click="createNewtemFromSchedule(item)"]').get(0).isDisplayed()).toBe(false);
        expect($$('[ng-click="createNewtemFromSchedule(item)"]').get(1).isDisplayed()).toBe(false);

    });

    it('Should disconnect', function() {
        loginService.logout();
    });

});
