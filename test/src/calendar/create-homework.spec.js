
var constants = require('../constants');
var loginService = require('../common/login.service');
var lessonService = require('../common/lesson.service.js');
var pgService = require('../common/pg.service.js');
var homeworkService = require('../common/homework.service.js');
var progressionService = require('../common/progression.service.js');
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

    it('Should create public homework from Calendar', function() {
        homeworkService.createHomeworkFromCal(24, false)
    });

    it('Should drag and drop Homework', function() {
        homeworkService.dragAndDropLastHomework(25);
    });

    it('Should delete homework from Calendar', function() {
        homeworkService.deleteHomeworkFromCal()
    });

    it('Should create public homework from Calendar', function() {
        homeworkService.createHomeworkFromCal(24, false)
    });

    it('Should drag and drop lesson with homework', function () {
        homeworkService.dragAndDropLastLessonWithHomework(36);
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

        browser.executeScript('window.scrollTo(0,0);');
        $('[data-ng-click="data.tabSelected = \'homeworks\'"]').click()
        browser.sleep(200);
        $('[data-ng-click="editProgressionLessonCtrl.addHomework(editLessonCtrl.lesson)"]').click()
        browser.sleep(400);
        homeworkService.setTitleDescriptionHomework("Titre du devoir maison", "Description du devoir maison");

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
        browser.executeScript('window.scrollTo(0,0);');
        $('[data-ng-click="data.tabSelected = \'homeworks\'"]').click()
        browser.sleep(200);
        $('[data-ng-click="editProgressionLessonCtrl.addHomework(editLessonCtrl.lesson)"]').click()
        browser.sleep(400);
        homeworkService.setTitleDescriptionHomework("Titre du devoir maison", "Description du devoir maison");
        lessonService.saveLesson(false);

        $$('[diary-sortable-element]>div>article').then(function(items) {
            expect(items.length).toBe(2);
        });
        expect($$('[diary-sortable-element]').get(1).$('.three label').getText()).toBe(matter);
        browser.get('http://localhost:8090/diary');
    });

    it('Should drag and drop progression with homework', function () {
        homeworkService.dragAndDropLastProgressionWithHomework(1, 14, false);
    });

    it('Should delette publish lesson', function() {
        lessonService.deleteLessonFromCal();
    });

    it('Should delette publish lesson', function() {
        lessonService.deleteLessonFromCal();
    });

    it('Should delette publish lesson', function() {
        lessonService.deleteLessonFromCal();
    });

    it('Should delete selected homework', function() {
        homeworkService.deleteHomeworkFromBan()
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
