
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var pgService = require('../common/pg.service.js');
// spec.js
describe('Protractor Calendar', function() {


    it('Should remove datas ', function() {
        pgService.removeData();
    });

    it('Should connect', function() {
        let week = '2017-05-29';
        loginService.login("teacher","#/calendarView/"+week);
    });

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


});
