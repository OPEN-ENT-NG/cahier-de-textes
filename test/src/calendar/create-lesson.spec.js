
var constants = require('../constants');
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var pgService = require('../common/pg.service.js');
// spec.js
describe('Protractor Calendar', function() {


    it('Should remove datas ', function() {
        pgService.removeData();
    });

    it('Should connect', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("teacher","#/calendarView/"+week);
    });

    it('Verify Calendar has no lessons',function(){
        element.all(by.css('input[ng-model="item.selected"]')).then(function(items) {
            expect(items.length).toBe(0);
        });
    });
    /*
    it('Should create draft lesson', function() {
        lessonService.createLessonFromCal(14,true);
    });

    it('Should update draft lesson', function() {
        lessonService.updateLessonFromCal();
    });


    it('Should drag and drop', function() {
        lessonService.dragAndDropLastLesson(25);
    });


    it('Should delete first draft lesson', function() {
        lessonService.deleteLessonFromCal();
    });

    it('Should delete second draft lesson', function() {
        lessonService.deleteLessonFromCal();
    });

    it('Should create publish lesson', function() {
        lessonService.createLessonFromCal(14,false);
    });

    it('Should update publish lesson', function() {
        lessonService.updateLessonFromCal();
    });

    it('Should delette publish lesson', function() {
        lessonService.deleteLessonFromCal();
    });
    */

    it('Should create draft lesson from button', function() {
        lessonService.createLessonFromButton(14,true,constants.momentWeek.format('DD/MM/YYYY'),"10:00","11:00");
    });

    it('Should create publish lesson from button', function() {
        lessonService.createLessonFromButton(24,false,constants.momentWeek.format('DD/MM/YYYY'),"11:00","12:00");
    });

    it('Should delette publish lesson', function() {
        lessonService.deleteLessonFromCal();
    });

    it('Should delette publish lesson', function() {
        lessonService.deleteLessonFromCal();
    });

    it('Verify Calendar lesson creation',function(){
        element.all(by.css('input[ng-model="item.selected"]')).then(function(items) {
            expect(items.length).toBe(0);
        });
    });

    it('Should disconnect', function() {
        loginService.logout();
    });

});
