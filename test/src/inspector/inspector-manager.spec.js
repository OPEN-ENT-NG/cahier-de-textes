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
        loginService.login("teacher", "#/calendarView/" + week);
    });

    it('Should create two lesson ', function() {
        lessonService.createLessonFromCal(14, true);
        lessonService.createLessonFromCal(24, false);

    });

    it('Should create two lesson ', function() {

        lessonService.createLessonFromCal(23, false);
        lessonService.createLessonFromCal(13, false, "Physique");
    });


    it('Should disconnect', function() {
        loginService.logout();
    });

    //set habilitation to the inspector
    it('Should find two sceance director', function() {
        loginService.login("director");
        $('[secure="diary.visa.applyvisa"]').click();
        browser.waitForAngular();
        browser.sleep(200);

        $('[secure="diary.manageInspect.apply"]').click();

        browser.waitForAngular();
        browser.sleep(200);

        $$('[list="habilitationCtrl.filters.inspectors"]>div>div').get(0).click();
        browser.sleep(200);
        $$('[list="habilitationCtrl.filters.inspectors"]>div>div .item-list').get(1).click();
        browser.sleep(200);

        $('search-drop-down[items="habilitationCtrl.filters.teachers"] [ng-model="searchFilter"]').click();
        browser.sleep(200);

        //browser.pause();
        $$('search-drop-down[items="habilitationCtrl.filters.teachers"] ul li').get(0).click();
        browser.sleep(200);
        browser.actions().mouseMove($('.popup-visa-habilitation .close-lightbox .close-2x')).click().perform();
    });

    it('Should disconnect', function() {
        loginService.logout();
    });

    it('Should connect teacher', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("inspector", "#/calendarView/" + week);
        browser.waitForAngular();
        browser.sleep(200);

        $('search-drop-down input').click();
        browser.sleep(200);
        $$('search-drop-down ul li').get(0).click();
        browser.sleep(200);
        $$('.diary-item-calendar.schedule-item-content').then(function(items) {
            expect(items.length).toBe(3);
        });
    });


});
