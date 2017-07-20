
var constants = require('../constants');
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var pgService = require('../common/pg.service.js');
var homeworkService = require('../common/homework.service.js');
// spec.js
describe('Protractor Calendar', function() {


    it('Should remove datas ', function() {
        pgService.removeData();
    });

    it('Should connect', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("teacher","#/calendarView/"+week);
    });


    it('Verify Calendar has no homework',function(){
        element.all(by.css('input[ng-model="item.selected"]')).then(function(items) {
            expect(items.length).toBe(0);
        });
    });


    it('Sould create draft homework from button', function() {
        homeworkService.createHomeworkFromButton(true,constants.momentWeek.format('DD/MM/YYYY'));
    });

    it('Sould create public homework from button', function() {
        homeworkService.createHomeworkFromButton(false,constants.momentWeek.format('DD/MM/YYYY'));
    });

    it('Should delete selected homework', function() {
        homeworkService.deleteHomeworkFromBan()
    });

    it('Should create public homework from Calendar', function() {
        homeworkService.createHomeworkFromCal(24, false)
    });

    it('Should drag and drop', function() {
        homeworkService.dragAndDropLastHomework(25);
    });

    it('Should delete homework from Calendar', function() {
        homeworkService.deleteHomeworkFromCal()
    });

    it('Verify Calendar homework creation',function(){
        element.all(by.css('input[ng-model="item.selected"]')).then(function(items) {
            expect(items.length).toBe(0);
        });
    });

    it('Should disconnect', function() {
        loginService.logout();
    });

});
