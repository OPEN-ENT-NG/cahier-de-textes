
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
        lessonService.createLessonFromCal(14,true);
        lessonService.createLessonFromCal(24,false);

    });

    it('Should create two lesson ', function() {

        lessonService.createLessonFromCal(23,false);
        lessonService.createLessonFromCal(13,false,"Physique");
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
          expect(text.trim()).toEqual("Scéance à viser : 2");
        });
        $$('.visa-lesson-content').get(1).$$('.three').get(1).getText().then((text)=>{
          expect(text.trim()).toEqual("Scéance à viser : 1");
        });
    });

    it('Should show visas', function() {
        $$('.visa-lesson-content').get(0).$('label.checkbox').click();
        browser.sleep(400);
        $$('.toggle button').get(1).click();
        browser.sleep(400);

        $$('.popup-visa-lesson-list .lesson-list article').then(function(items) {
            expect(items.length).toBe(2);
        });
        //back$
        browser.actions().mouseMove($('.popup-visa-lesson-list .close-2x')).click().perform();

        browser.sleep(200);

        $$('.visa-lesson-content').get(1).$('label.checkbox').click();
        $$('.toggle button').get(1).click();
        browser.sleep(400);

        $$('.popup-visa-lesson-list .lesson-list article').then(function(items) {
            expect(items.length).toBe(3);
        });

        browser.actions().mouseMove($$('.toggle').get(1).$$('button').get(0)).click().perform();

    });

    it('Should generate pdf visas', function() {
        utilsService.checkFileIsDownloaded($$('.toggle button').get(2));

        browser.sleep(1000);
    });

    it('Should create visa', function() {
        //viser
        $$('.toggle button').get(0).click();
        browser.sleep(200);
        $('[ng-model="visaManagerCtrl.comment"]').clear().sendKeys("Good job");
        $('[ng-click="visaManagerCtrl.applyVisa(false)"]').click();

        $$('.visa-lesson-content').then(function(items) {
            expect(items.length).toBe(0);
        });
    });

    it('Should disconnect', function() {
        loginService.logout();
    });


});
