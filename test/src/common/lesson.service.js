var dragAndDrop = require('html-dnd').code;

var srv = {
    createLessonFromCal: (itemNumber, isDraft) => {

        browser.waitForAngular();
        browser.sleep(1000);
        // URL: #/createLessonView/timeFromCalendar
        element.all(by.css('[ng-repeat="timeslot in day.timeSlots.all"]')).get(itemNumber).click();
        browser.waitForAngular();
        srv.selectAudience(4);
        srv.setTitleDescriptionAnnotaiton("Titre de la sceance",
            "Description de la sceance",
            "ceci est l'annotation");
        srv.saveLesson(isDraft);

    },
    setTitleDescriptionAnnotaiton : (title,description,annotation,update)=>{
        browser.waitForAngular();
        element(by.css('input[ng-model="editLessonCtrl.lesson.title"]')).click();
        element(by.css('input[ng-model="editLessonCtrl.lesson.title"]')).clear().sendKeys(title);
        element.all(by.css('[contenteditable]')).get(0).clear().sendKeys(description);
        browser.executeScript('window.scrollTo(0,200);');
        if (!update){
            element(by.css('.row.accordions > .accordion')).click();
        }
        element.all(by.css('[contenteditable]')).get(1).clear().sendKeys(annotation);
    },
    selectAudience : (nbAudience)=>{
        browser.waitForAngular();
        element(by.css('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(1)>span')).click();
        browser.sleep(200);
        element(by.css('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type('+nbAudience+')>span')).click();
    },
    saveLesson:(isDraft)=>{
        //button save
          browser.waitForAngular();
        let nbButton = isDraft ? 1 : 0;
        browser.sleep(200);
        browser.executeScript('window.scrollTo(0,0);');
        browser.sleep(200);
        element.all(by.css('button.right-magnet[type="submit"]')).get(nbButton).click();
        browser.sleep(500);
    },
    updateLessonFromCal: () => {
        browser.waitForAngular();
        browser.sleep(1500);
        element(by.css('[ng-if="item.calendarType!==\'shadow\'"]')).click();
        srv.setTitleDescriptionAnnotaiton("Titre de la sceance modifié",
            "Description de la sceance modifiée",
            "ceci est l'annotation modifiée",true);
        srv.saveLesson(true);

    },
    deleteLessonFromCal: () => {
        browser.waitForAngular();
        browser.sleep(400);
        browser.executeScript('window.scrollTo(0,0);');
        element(by.css('input[ng-model="item.selected"]')).click();
        browser.sleep(400);
        element(by.css('[ng-click="showConfirmPanel(\'confirm-delete\')"]')).click();
        browser.sleep(400);
        element(by.css('[ng-click="deleteSelectedItems()"]')).click();

    },
    dragAndDropLastLesson: (itemNumber,isDraft) => {
        browser.waitForAngular();
        element(by.css('quick-search:nth-of-type(1)>div:nth-of-type(1)')).click();
        browser.sleep(1000);
        var draggable = element(by.css('article.quick-search-card'));
        var droppable = element.all(by.css('[ng-repeat="timeslot in day.timeSlots.all"]')).get(itemNumber);
        browser.executeScript(dragAndDrop, draggable, droppable, 5, 5);
        browser.sleep(200);
        browser.waitForAngular();
        srv.selectAudience(4);
        srv.setTitleDescriptionAnnotaiton("Titre de la sceance",
            "Description de la sceance",
            "ceci est l'annotation",true);
        srv.saveLesson(isDraft);
    }
};

module.exports = srv;
