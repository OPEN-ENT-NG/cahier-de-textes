var dragAndDrop = require('html-dnd').code;

var srv = {
    createHomeworkFromCal: (itemNumber, isDraft, matter) => {
        browser.waitForAngular();
        browser.sleep(1000);
        // URL: #/createLessonView/timeFromCalendar
        element.all(by.css('[ng-repeat="timeslot in day.timeSlots.all"]')).get(itemNumber).click();
        browser.waitForAngular();
        srv.selectAudience(4);
        browser.sleep(400);
        srv.setTitleDescriptionLesson("Titre de la sceance",
            "Description de la sceance");
        if (matter){
            srv.createNewMatter(matter);
        }
        browser.executeScript('window.scrollTo(0,0);');
        $('[data-ng-class="{\'selected\': data.tabSelected === \'homeworks\'}"]').click();
        browser.sleep(200);
        $('[data-ng-click="addHomeworkToLesson(editLessonCtrl.lesson)"]').click();
        browser.sleep(400);
        srv.setTitleDescriptionHomework("Titre du devoir maison", "Description du devoir maison");
        srv.saveHomework(isDraft);
    },
    createHomeworkFromButton: (isDraft,audience,day,matter) => {
        browser.waitForAngular();
        browser.sleep(600);
        // URL: #/createLessonView/timeFromCalendar
        $('[workflow="diary.createFreeHomework"]').click();
        browser.waitForAngular();
        if (audience){
          srv.selectAudience(audience);
        }
        srv.setTitleDescriptionHomework("Titre du travail a faire",
            "Description du travail a faire");
        if (matter){
            srv.createNewMatter(matter);
        }
        browser.executeScript('window.scrollTo(0,0);');
        srv.setDay(day);
        // srv.setType(type);
        srv.saveHomework(isDraft);
    },
    selectAudience : (nbAudience)=>{
        browser.waitForAngular();
        $('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(1)>span').click();
        browser.sleep(200);
        $('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type('+nbAudience+')>span').click();
    },
    setTitleDescriptionHomework : (title,description)=>{
        browser.waitForAngular();
        $('input[ng-model="homework.title"]').click();
        $('input[ng-model="homework.title"]').clear().sendKeys(title);
        element.all(by.css('[contenteditable]')).get(0).clear().sendKeys(description);
        browser.executeScript('window.scrollTo(0,200);');
    },
    setTitleDescriptionHomeworkdad : (title,description)=>{
        browser.waitForAngular();
        $('[ng-model="homework.title"]').click();
        $('[ng-model="homework.title"]').clear().sendKeys(title);
        element.all(by.css('[contenteditable]')).get(0).clear().sendKeys(description);
        browser.executeScript('window.scrollTo(0,200);');
    },
    setTitleDescriptionLesson : (title,description)=>{
        browser.waitForAngular();
        $('[ng-model="editLessonCtrl.lesson.title"]').click();
        $('[ng-model="editLessonCtrl.lesson.title"]').clear().sendKeys(title);
        element.all(by.css('[contenteditable]')).get(0).clear().sendKeys(description);
        browser.executeScript('window.scrollTo(0,200);');
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
    saveHomework:(isDraft)=>{
      //button save
      browser.waitForAngular();
      let nbButton = isDraft ? 1 : 0;
      browser.sleep(200);
      browser.executeScript('window.scrollTo(0,0);');
      browser.sleep(200);
      element.all(by.css('button.right-magnet[type="submit"]')).get(nbButton).click();
      browser.sleep(500);
    },
    // setType : (type)=>{
    //   browser.waitForAngular();
    //   element(by.css('select[ng-model="homework.type"]')).click();
    //   browser.sleep(200);
    //   element(by.css('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type('+nbAudience+')>span')).click();
    // },
    deleteHomeworkFromBan: ()=>{
        browser.waitForAngular();
        browser.sleep(400);
        browser.executeScript('window.scrollTo(0,0);');
        $('[ng-click="toggleShowHwDetail(day)"]').click();
        browser.sleep(400);
        $$('[ng-model="dailyEvent.selected"]').get(0).click();
        $$('[ng-model="dailyEvent.selected"]').get(1).click();
        $$('[ng-model="dailyEvent.selected"]').get(2).click();
        browser.sleep(400);
        $('[ng-click="showConfirmPanel(\'confirm-delete\')"]').click();
        browser.sleep(400);
        $('[ng-click="deleteSelectedItems()"]').click();
    },
    deleteHomeworkFromCal: ()=>{
      browser.waitForAngular();
      browser.sleep(400);
      $('[ng-if="item.calendarType!==\'shadow\'"]').click();
      browser.executeScript('window.scrollTo(0,0);');
      $('[data-ng-class="{\'selected\': data.tabSelected === \'homeworks\'}"]').click();
      browser.sleep(200);
      browser.executeScript('window.scrollTo(0,document.body.scrollHeight);');
      $('[ng-click="showConfirmPanel(\'confirm-delete-homeworklesson\', {homework: homework, lesson : editLessonCtrl.lesson })"]').click();
      $('[ng-click="deleteHomeworkAndCloseConfirmPanel(confirmPanel.item.homework, confirmPanel.item.lesson)"]').click();
      browser.executeScript('window.scrollTo(0,0);');
      $('[ng-click="back()"]').click();
      $('[ng-model="item.selected"]').click();
      browser.sleep(400);
      $('[ng-click="showConfirmPanel(\'confirm-delete\')"]').click();
      browser.sleep(400);
      $('[ng-click="deleteSelectedItems()"]').click();
    },
    dragAndDropLastHomework: (itemNumber,isDraft)=>{
      browser.waitForAngular();
      $('quick-search:nth-of-type(2)>div:nth-of-type(1)').click();
      browser.sleep(1000);
      var draggable = $('article.quick-search-card');
      var droppable = element.all(by.css('[ng-repeat="timeslot in day.timeSlots.all"]')).get(itemNumber);
      browser.executeScript(dragAndDrop, draggable, droppable, 5, 5);
      browser.sleep(200);
      browser.waitForAngular();
      srv.selectAudience(4);
      srv.setTitleDescriptionHomework("Titre du devoir maison modifié", "Description du devoir maison modifié");
      srv.saveHomework(isDraft);
    },
    dragAndDropLastLessonWithHomework: (itemNumber,isDraft) => {
        browser.waitForAngular();
        $('quick-search:nth-of-type(1)>div:nth-of-type(1)').click();
        browser.sleep(1000);
        var draggable = $('article.quick-search-card');
        var droppable = element.all(by.css('[ng-repeat="timeslot in day.timeSlots.all"]')).get(itemNumber);
        browser.executeScript(dragAndDrop, draggable, droppable, 5, 5);
        browser.sleep(200);
        browser.waitForAngular();
        srv.selectAudience(4);
        srv.setTitleDescriptionLesson("Titre de la sceance modifiée",
            "Description de la sceance modifiée",
            "ceci est l'annotation",true);
        browser.executeScript('window.scrollTo(0,0);');
        $('[data-ng-class="{\'selected\': data.tabSelected === \'homeworks\'}"]').click();
        browser.sleep(200);
        srv.setTitleDescriptionHomework("Titre du devoir maison", "Description du devoir maison");
        srv.saveHomework(isDraft);
    },
    dragAndDropLastProgressionWithHomework: (itemNumberSrc,itemNumberTarget,isDraft) => {
        browser.waitForAngular();
        browser.executeScript('window.scrollTo(0,document.body.scrollHeight);');
        $('right-panel:nth-of-type(1)>div:nth-of-type(1)>div').click();
        $$('[ng-click="progressionRightPanelCtrl.selectProgression(progression)"]>article').get(0).click();
        browser.sleep(200);
        var draggable = $$('.content-lesson>div').get(itemNumberSrc);
        var droppable = element.all(by.css('[ng-repeat="timeslot in day.timeSlots.all"]')).get(itemNumberTarget);
        browser.executeScript(dragAndDrop, draggable, droppable, 5, 5);
        browser.sleep(200);
        browser.waitForAngular();
        srv.selectAudience(4);
        srv.setTitleDescriptionLesson("Titre de la sceance modifiée",
            "Description de la sceance modifiée",
            "ceci est l'annotation",true);
        browser.executeScript('window.scrollTo(0,0);');
        $('[data-ng-class="{\'selected\': data.tabSelected === \'homeworks\'}"]').click();
        browser.sleep(200);
        srv.setTitleDescriptionHomeworkdad("Titre du devoir maison", "Description du devoir maison");
        srv.saveHomework(isDraft);
    }
};

module.exports = srv;
