
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


    it('Verify Calendar homework creation',function(){
        /*element.all(by.css('input[ng-model="item.selected"]')).then(function(items) {
            expect(items.length).toBe(0);
        });
        */
    });

    it('Should disconnect', function() {
        loginService.logout();
    });

});
