
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
        let week = constants.week;
        loginService.login("teacher","#/calendarView/"+week);
    });

    it('Verify Calendar has no lessons',function(){
        element.all(by.css('input[ng-model="item.selected"]')).then(function(items) {
            expect(items.length).toBe(0);
        });
    });

    it('Should create draft lesson with new matter', function() {
      let matter = "Physique";
      lessonService.createLessonFromCal(14,true,matter);
      browser.sleep(1500);
      element.all(by.css('input[ng-model="item.selected"]')).then(function(items) {
          expect(items.length).toBe(1);

      });

      element(by.css('#subjectlabel')).getText().then((text)=>{
        expect(text.trim()).toEqual(matter);
      });

  });

    it('Should disconnect', function() {
        loginService.logout();
    });

});
