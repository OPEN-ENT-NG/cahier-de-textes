
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
// spec.js
describe('Protractor Calendar', function() {
    it('Should connect', function() {
        let week = '2017-05-29';
        loginService.login("#/calendarView/"+week);
        browser.sleep(2000);
    });


    it('Should create draft lesson', function() {
        lessonService.createLessonFromCal(14,true);
    });

    it('Should update draft lesson', function() {
        lessonService.updateLessonFromCal();
    });

    it('Should delete draft lesson', function() {
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
