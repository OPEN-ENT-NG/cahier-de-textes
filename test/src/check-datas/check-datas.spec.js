var constants = require('../constants');
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var pgService = require('../common/pg.service.js');
var homeworkService = require('../common/homework.service.js');
var visaService = require('../common/visa.service.js');
// spec.js

describe('Protractor Check Datas', function() {

  it('Should remove datas ', function() {
      pgService.removeData();
  });

  it('Should connect', function() {
      let week = constants.momentWeek.format('YYYY-MM-DD');
      loginService.login("teacher","#/calendarView/"+week);
  });

  it('Should create draft lesson', function() {
      lessonService.createLessonFromCal(11,true);
  });

  it('Should create publish lesson 1', function() {
      lessonService.createLessonFromCal(22,false,'',17);
  });

  it('Should create publish lesson 2', function() {
      lessonService.createLessonFromCal(33,false,'',4);
  });

  // Create public homework 1
  it('Sould create first public homework from button', function() {
      homeworkService.createHomeworkFromButton(false,17,constants.momentWeek.format('DD/MM/YYYY'));
  });

  // Create public homework 2
  it('Sould create second public homework from button', function() {
      homeworkService.createHomeworkFromButton(false,4,constants.momentWeek2.format('DD/MM/YYYY'));
  });

  it('Should disconnect', function() {
      loginService.logout();
  });

  it('Should connect', function() {
      let week = constants.momentWeek.format('YYYY-MM-DD');
      loginService.login("student1","#/calendarView/"+week);
  });

  it('Verify Calendar has one lesson',function(){
      element.all(by.css('[ng-if="item.calendarType!==\'shadow\'"]')).then(function(items) {
          expect(items.length).toBe(1);
      });
  });

  // Check is 1 homework
  it('Verify Calendar has one homework student 1',function(){
      element.all(by.css('[ng-click="editSelectedHomework(dailyEvent, $event);"]')).then(function(items) {
          expect(items.length).toBe(2); // 2 au lieu de 1 car un homework identifié comme ça est 2 fois
      });
  });

  it('Should disconnect', function() {
      loginService.logout();
  });

  it('Should connect', function() {
      let week = constants.momentWeek.format('YYYY-MM-DD');
      loginService.login("student2","#/calendarView/"+week);
  });

  it('Verify Calendar has one lesson',function(){
      element.all(by.css('[ng-if="item.calendarType!==\'shadow\'"]')).then(function(items) {
          expect(items.length).toBe(1);
      });
  });

  // Check is 1 homework
  it('Verify Calendar has one homework student 2',function(){
      element.all(by.css('[ng-click="editSelectedHomework(dailyEvent, $event);"]')).then(function(items) {
          expect(items.length).toBe(2); // 2 au lieu de 1 car un homework identifié comme ça est 2 fois
      });
  });

  it('Should disconnect', function() {
      loginService.logout();
  });

  // Connect as parent
  it('Should connect', function() {
      let week = constants.momentWeek.format('YYYY-MM-DD');
      loginService.login("parent","#/calendarView/"+week);
  });

  // Check are 2 lessons
  it('Verify Calendar has one lesson',function(){
      element.all(by.css('[ng-if="item.calendarType!==\'shadow\'"]')).then(function(items) {
          expect(items.length).toBe(2);
      });
  });

  // Check are 2 homeworks
  it('Verify Calendar has one homework',function(){
      element.all(by.css('[ng-click="editSelectedHomework(dailyEvent, $event);"]')).then(function(items) {
          expect(items.length).toBe(4); // 4 au lieu de 2 car un homework identifié comme ça est 2 fois
      });
  });

  // Disconnect
  it('Should disconnect', function() {
      loginService.logout();
  });

  // Connect as Director
  it('Should connect', function() {
      let week = constants.momentWeek.format('YYYY-MM-DD');
      loginService.login("director","#/calendarView/"+week);
      browser.sleep(200);
  });

  // // Check are 2 lessons
  // it('Verify Calendar has one lesson',function(){
  //     element.all(by.css('[ng-if="item.calendarType!==\'shadow\'"]')).then(function(items) {
  //         expect(items.length).toBe(2);
  //     });
  // });
  //
  // // Check are 2 homeworks
  // it('Verify Calendar has one homework',function(){
  //     element.all(by.css('[ng-click="editSelectedHomework(dailyEvent, $event);"]')).then(function(items) {
  //         expect(items.length).toBe(2);
  //     });
  // });
  it('Should find one lesson and one homework from calendar 4b', function() {
    element.all(by.css('[ng-class="{ clicked: listVisible }"]')).get(1).click();
    browser.sleep(200);
    $('diary-drop-down>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(2)').click();
    element.all(by.css('[ng-class="{\'diary-schedule\' :item.calendarType===\'shadow\' }"]')).then(function(items) {
        expect(items.length).toBe(1);
    });
    element.all(by.css('[ng-click="editSelectedHomework(dailyEvent, $event);"]')).then(function(items) {
        expect(items.length).toBe(2);
    });
  });

  it('Should find one lesson and one homework from calendar 6b', function() {
    element.all(by.css('[ng-class="{ clicked: listVisible }"]')).get(1).click();
    browser.sleep(200);
    $('diary-drop-down>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(3)').click();
    element.all(by.css('[ng-class="{\'diary-schedule\' :item.calendarType===\'shadow\' }"]')).then(function(items) {
        expect(items.length).toBe(1);
    });
    element.all(by.css('[ng-click="editSelectedHomework(dailyEvent, $event);"]')).then(function(items) {
        expect(items.length).toBe(2);
    });
  });

  it('Should find two lessons director from visa', function() {
      // loginService.login("director");
      $('[secure="diary.visa.applyvisa"]').click();
      browser.waitForAngular();
      browser.sleep(200);
      visaService.selectTeacher(0);
      visaService.search();
      browser.sleep(200);

      $$('.visa-lesson-content').get(0).$$('.three').get(1).getText().then((text)=>{
        expect(text.trim()).toEqual("Scéance à viser : 1");
      });
      $$('.visa-lesson-content').get(1).$$('.three').get(1).getText().then((text)=>{
        expect(text.trim()).toEqual("Scéance à viser : 1");
      });
  });

  // Disconnect
  it('Should disconnect', function() {
      loginService.logout();
  });

});
