var dragAndDrop = require('html-dnd').code;

var srv = {
    createLessonFromCal: (itemNumber, isDraft, matter) => {
        browser.waitForAngular();
        browser.sleep(1000);
        // URL: #/createLessonView/timeFromCalendar
        element.all(by.css('[ng-repeat="timeslot in day.timeSlots.all"]')).get(itemNumber).click();
        browser.waitForAngular();
        srv.selectAudience(4);
        srv.setTitleDescriptionAnnotaiton("Titre de la sceance",
            "Description de la sceance",
            "ceci est l'annotation");
        if (matter){
            srv.createNewMatter(matter);
        }
        srv.saveLesson(isDraft);
    },
    createLessonFromButton: (itemNumber, isDraft, day,begin,end,matter) => {
        browser.waitForAngular();
        browser.sleep(200);
        // URL: #/createLessonView/timeFromCalendar
        $('[workflow="diary.createLesson"]').click();
        browser.waitForAngular();
        srv.selectAudience(4);
        srv.setTitleDescriptionAnnotaiton("Titre de la sceance",
            "Description de la sceance",
            "ceci est l'annotation");
        if (matter){
            srv.createNewMatter(matter);
        }
        browser.executeScript('window.scrollTo(0,0);');
        srv.setDay(day);
        srv.setHours(begin,end);
        srv.saveLesson(isDraft);
    },
    createNewMatter : (matter)=>{
        browser.waitForAngular();
        browser.executeScript('window.scrollTo(0,0);');
        $('span[ng-model="editLessonCtrl.lesson.subject"]>span:nth-of-type(1)>span:nth-of-type(1)>span').click();
        browser.sleep(100);
        $('input[ng-model="search"]').click();
        $('#input-subject').clear().sendKeys(matter);
        $('span[ng-model="editLessonCtrl.lesson.subject"]>div:nth-of-type(1)>div:nth-of-type(1)>div>span').click();
    },
    setTitleDescriptionAnnotaiton : (title,description,annotation,update)=>{
        browser.waitForAngular();
        $('input[ng-model="editLessonCtrl.lesson.title"]').click();
        $('input[ng-model="editLessonCtrl.lesson.title"]').clear().sendKeys(title);
        element.all(by.css('[contenteditable]')).get(0).clear().sendKeys(description);
        browser.executeScript('window.scrollTo(0,200);');
        if (!update){
            $('.row.accordions > .accordion').click();
        }
        element.all(by.css('[contenteditable]')).get(1).clear().sendKeys(annotation);
    },
    setDay : (day)=>{
        $('[ng-model="newItem.date"]').click();
        browser.sleep(100);
        let dateInputElement = $('[ng-model="newItem.date"]');
        dateInputElement.click().clear();
        for (var i=0;i<10;i++){
            dateInputElement.sendKeys(protractor.Key.BACK_SPACE);
        }
        dateInputElement.sendKeys(day);
    },
    setHours : (begin,end)=>{
        $('[ng-model="newItem.beginning"]').clear().sendKeys(begin);
        $('[ng-model="newItem.end"]').clear().sendKeys(end);
    },
    selectAudience : (nbAudience)=>{
        browser.waitForAngular();
        $('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(1)>span').click();
        browser.sleep(200);
        $('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type('+nbAudience+')>span').click();
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
        $('[ng-if="item.calendarType!==\'shadow\'"]').click();
        srv.setTitleDescriptionAnnotaiton("Titre de la sceance modifié",
            "Description de la sceance modifiée",
            "ceci est l'annotation modifiée",true);
        srv.saveLesson(true);

    },
    deleteLessonFromCal: () => {
        browser.waitForAngular();
        browser.sleep(400);
        browser.executeScript('window.scrollTo(0,0);');
        $('input[ng-model="item.selected"]').click();
        browser.sleep(400);
        $('[ng-click="showConfirmPanel(\'confirm-delete\')"]').click();
        browser.sleep(400);
        $('[ng-click="deleteSelectedItems()"]').click();

    },
    dragAndDropLastLesson: (itemNumber,isDraft) => {
        browser.waitForAngular();
        $('quick-search:nth-of-type(1)>div:nth-of-type(1)').click();
        browser.sleep(1000);
        var draggable = $('article.quick-search-card');
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
