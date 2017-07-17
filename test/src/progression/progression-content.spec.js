var constants = require('../constants');
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var progressionService = require('../common/progression.service.js');
var pgService = require('../common/pg.service.js');
var utilsService = require('../common/utils.service.js');
var dragAndDrop = require('html-dnd').code;
// spec.js
describe('Protractor Progression Calendar', function() {

    it('Should remove datas ', function() {
        pgService.removeData();
    });

    it('Should connect', function() {
        let week = constants.momentWeek.format('YYYY-MM-DD');
        loginService.login("teacher", "#/calendarView/" + week);
    });

    it('Should create a progression', function() {
        progressionService.openProgressionTab();
        $('.search-progression button').click();

        progressionService.createProgression('Titre1', 'Niveau1', 'Description1');

        $('[ng-if="!progressionManagerCtrl.selectedProgressionItem.edit"] p').getText().then((text) => {
            expect(text.trim()).toEqual('Description1');
        });

    });

    it('Should add content to the first progression', function() {

        $('[ng-click="progressionManagerCtrl.addNewLesson()"]').click();

        lessonService.setTitleDescriptionAnnotaiton("Titre de la sceance1",
            "Description de la sceance1",
            "ceci est l'annotation1");

        lessonService.saveLesson(false);

        $$('[diary-sortable-element]>div>article').then(function(items) {
            expect(items.length).toBe(1);
        });

        $('[ng-click="progressionManagerCtrl.addNewLesson()"]').click();

        lessonService.setTitleDescriptionAnnotaiton("Titre de la sceance2",
            "Description de la sceance2",
            "ceci est l'annotation2");
        let matter = "Physique";
        lessonService.createNewMatter(matter);
        lessonService.saveLesson(false);

        $$('[diary-sortable-element]>div>article').then(function(items) {
            expect(items.length).toBe(2);
        });

        expect($$('[diary-sortable-element]').get(1).$('.three label').getText()).toBe(matter);



    });

    it('Should edit content from the first progression', function() {
        progressionService.selectContentProgression(0);
        $('[ ng-click="progressionManagerCtrl.editSelectedContent()"]').click();
        browser.waitForAngular();
        lessonService.setTitleDescriptionAnnotaiton("Titre de la sceance1M",
            "Description de la sceance1M",
            "ceci est l'annotation1M");
        lessonService.saveLesson(false);
    });


    it('Should drag and drop content from the first progression', function() {

        $('.pedagogic-day-card').click();
        let liContentProgression1 = $$('[diary-sortable-element]').get(0);
        let liContentProgression2 = $$('[diary-sortable-element]').get(1);

        browser.sleep(400);
        expect(liContentProgression1.$('.six label').getText()).toBe("Titre de la sceance1M");
        expect(liContentProgression2.$('.six label').getText()).toBe("Titre de la sceance2");
        
        utilsService.dragAndDrop(liContentProgression2, liContentProgression1);
        browser.sleep(200);

        let liContentProgression1M = $$('[diary-sortable-element]>div>article').get(0);
        let liContentProgression2M = $$('[diary-sortable-element]>div>article').get(1);

        expect(liContentProgression1M.$('.six label').getText()).toBe("Titre de la sceance2");
        expect(liContentProgression2M.$('.six label').getText()).toBe("Titre de la sceance1M");

        utilsService.backToCalendar();
        browser.waitForAngular();
        browser.sleep(400);
        progressionService.openProgressionTab();
        browser.sleep(200);
        $('.search-progression button').click();
        browser.waitForAngular();
        $('.pedagogic-day-card').click();
        let liContentProgression1MA = $$('[diary-sortable-element]>div>article').get(0);
        let liContentProgression2MA = $$('[diary-sortable-element]>div>article').get(1);

        expect(liContentProgression1MA.$('.six label').getText()).toBe("Titre de la sceance2");
        expect(liContentProgression2MA.$('.six label').getText()).toBe("Titre de la sceance1M");

    });

    it('Should drag and drop 2 progression lesson', function() {
        utilsService.backToCalendar();
        browser.waitForAngular();
        browser.sleep(200);
        progressionService.openProgressionTab();

        progressionService.dragAndDropLastProgression(1, 14, false);
        browser.waitForAngular();
        browser.sleep(200);
        progressionService.openProgressionTab();
        progressionService.dragAndDropLastProgression(1, 24, true);
        browser.executeScript('window.scrollTo(0,0);');

        element.all(by.css('input[ng-model="item.selected"]')).then(function(items) {
            expect(items.length).toBe(2);
        });
    });

    it('Should delete content from the first progression', function() {
        progressionService.openProgressionTab();
        browser.sleep(200);
        $('.search-progression button').click();
        browser.waitForAngular();
        browser.sleep(200);
        $('.pedagogic-day-card').click();
        progressionService.selectContentProgression(0);

        $('[confirm-yes="Supprimer"]').click();
        browser.sleep(100);
        $('[ng-click="confirm()"]').click();
        browser.sleep(100);
        $$('[diary-sortable-element]>div>article').then(function(items) {
            expect(items.length).toBe(1);
        });
    });

    it('Should disconnect', function() {
        loginService.logout();
    });

});
