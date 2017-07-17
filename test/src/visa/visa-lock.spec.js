
var constants = require('../constants');
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var pgService = require('../common/pg.service.js');
var visaService = require('../common/visa.service.js');
var utilsService = require('../common/utils.service.js');
// spec.js
describe('Protractor Visa', function() {


    it('Should remove datas ', function() {
        pgService.removeData();
    });

    it('Should connect teacher', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("teacher","#/calendarView/"+week);
    });

    it('Should create two lesson ', function() {
        lessonService.createLessonFromCal(24,false);
    });

    it('Should disconnect', function() {
        loginService.logout();
    });

    it('Should find two sceance director', function() {
        loginService.login("director");
        $('[secure="diary.visa.applyvisa"]').click();
        browser.waitForAngular();
        browser.sleep(200);
        visaService.selectTeacher(0);
        visaService.search();
        browser.sleep(200);

        $$('.visa-lesson-content').get(0).$$('.three').get(1).getText().then((text)=>{
          expect(text.trim()).toEqual("Scéance à viser : 1");
        });
    });

    it('Should create visa', function() {
        $$('.visa-lesson-content').get(0).$('label.checkbox').click();
        //viser
        browser.sleep(200);

        browser.actions().mouseMove($$('.toggle button').get(0)).click().perform();


        browser.sleep(200);
        $('[ng-model="visaManagerCtrl.comment"]').clear().sendKeys("Good job");

        browser.actions().mouseMove($('[ng-click="visaManagerCtrl.applyVisa(false)"]')).click().perform();
        browser.sleep(400);
        $$('.visa-lesson-content').then(function(items) {
            expect(items.length).toBe(0);
        });
    });

    it('Should show already visa', function() {
        visaService.selectStatut(1);
        visaService.search();
        browser.sleep(400);
        $$('.visa-lesson-content').get(0).$$('.three').get(1).getText().then((text)=>{
          expect(text.trim()).toEqual("Scéance à viser : 0");
        });
    });


    it('Should disconnect', function() {
        loginService.logout();
    });

    it('Should connect teacher', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("teacher","#/calendarView/"+week);
        browser.sleep(500);
        lessonService.updateLessonFromCal();
    });

    it('Should disconnect', function() {
        loginService.logout();
    });


    it('Should find two sceance director', function() {
        loginService.login("director");
        $('[secure="diary.visa.applyvisa"]').click();
        browser.waitForAngular();
        browser.sleep(200);

        visaService.selectTeacher(0);
        visaService.search();
        browser.sleep(200);

        $$('.visa-lesson-content').get(0).$$('.three').get(1).getText().then((text)=>{
          expect(text.trim()).toEqual("Scéance à viser : 1");
        });
    });

    it('Should create visa', function() {
        $$('.visa-lesson-content').get(0).$('label.checkbox').click();
        //viser
        browser.sleep(200);

        browser.actions().mouseMove($$('.toggle button').get(0)).click().perform();

        browser.sleep(200);
        $('[ng-model="visaManagerCtrl.comment"]').clear().sendKeys("Good job bis");

        browser.actions().mouseMove($('[ng-click="visaManagerCtrl.applyVisa(true)"]')).click().perform();
        browser.sleep(400);
        $$('.visa-lesson-content').then(function(items) {
            expect(items.length).toBe(0);
        });
    });

    it('Should show already visa', function() {
        visaService.selectStatut(1);
        visaService.search();
        browser.sleep(400);
        $$('.visa-lesson-content').get(0).$$('.three').get(1).getText().then((text)=>{
          expect(text.trim()).toEqual("Scéance à viser : 0");
        });
    });

    it('Should disconnect', function() {
        loginService.logout();
    });

    it('Should connect teacher', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("teacher","#/calendarView/"+week);
        browser.sleep(500);
        $$('i.icon.lock-alt').then(function(items) {
            expect(items.length).toBe(1);
        });
        
    });

    it('Should disconnect', function() {
        loginService.logout();
    });
});
