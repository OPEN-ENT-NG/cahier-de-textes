
var constants = require('../constants');
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var progressionService = require('../common/progression.service.js');
var pgService = require('../common/pg.service.js');
var utilsService = require('../common/utils.service.js');
// spec.js
describe('Protractor Progression Calendar', function() {

    it('Should remove datas ', function() {
        pgService.removeData();
    });

    it('Should connect', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("teacher","#/calendarView/"+week);
    });

    it('Should create two progressions', function() {
      progressionService.openProgressionTab();
      $('.search-progression button').click();

      progressionService.createProgression('Titre1','Niveau1','Description1');
      utilsService.backToCalendar();

      progressionService.openProgressionTab();
      $('.search-progression button').click();

      element.all(by.css('.pedagogic-day-container ul li')).then(function(items) {
          expect(items.length).toBe(1);
      });

      progressionService.createProgression('Titre2','Niveau2','Description2');
      utilsService.backToCalendar();

      progressionService.openProgressionTab();
      $('.search-progression button').click();

      element.all(by.css('.pedagogic-day-container ul li')).then(function(items) {
          expect(items.length).toBe(2);
      });

      element.all(by.css('.pedagogic-day-container ul li')).get(0).click();

      element.all(by.css('.icon.pencil')).then(function(items) {
          expect(items.length).toBe(1);
      });

      $('[ng-if="!progressionManagerCtrl.selectedProgressionItem.edit"] p').getText().then((text)=>{
        expect(text.trim()).toEqual('Description1');
      });

  });
  /***********
  ************
  ***********/
    it('Should modify progression informations', function() {

      element.all(by.css('.pedagogic-day-container ul li')).get(0).click();

      progressionService.editProgression('TitreM','NiveauM','DescriptionM');

      element.all(by.css('.pedagogic-day-container ul li')).then(function(items) {
          expect(items.length).toBe(2);
      });

      $('[ng-if="!progressionManagerCtrl.selectedProgressionItem.edit"] p').getText().then((text)=>{
        expect(text.trim()).toEqual('DescriptionM');
      });

    });

    it('Should delete progression', function() {
      //browser.pause();
      $('.edit-button').click();
      browser.sleep(200);
      $('[confirm-yes="Supprimer"]').click();
      browser.sleep(200);
      $('[ng-click="confirm()"]').click();
      element.all(by.css('.pedagogic-day-container ul li')).then(function(items) {
          expect(items.length).toBe(1);
      });
    });


    it('Should disconnect', function() {
        loginService.logout();
    });

});
