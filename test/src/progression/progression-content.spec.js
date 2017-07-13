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
        let container = $('[diary-sortable-list]');
        browser.sleep(400);
        expect(liContentProgression1.$('.six label').getText()).toBe("Titre de la sceance1M");
        expect(liContentProgression2.$('.six label').getText()).toBe("Titre de la sceance2");

        //browser.pause();

        utilsService.dragAndDrop(liContentProgression2,container);

        /*
        let moveTo = "var fireEvent = arguments[0];" + "var evObj = document.createEvent('MouseEvents');" + "evObj.initEvent( 'mouseover', true, true );" + "fireEvent.dispatchEvent(evObj);";

        browser.executeScript(moveTo, liContentProgression2);
        browser.actions()
        .mouseDown().perform();

        browser.executeScript(moveTo, container);

        browser.actions()
        .mouseUp()
        .perform();
        */
        browser.sleep(200);

        let liContentProgression1M = $$('[diary-sortable-element]>div>article').get(0);
        let liContentProgression2M = $$('[diary-sortable-element]>div>article').get(1);
        //browser.pause();
        expect(liContentProgression1M.$('.six label').getText()).toBe("Titre de la sceance2");
        expect(liContentProgression2M.$('.six label').getText()).toBe("Titre de la sceance1M");


        progressionService.backToCalendar();
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

    /*
    it('Should delete content from the first progression', function() {
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
    */

});
