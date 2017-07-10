

module.exports = {
  createLessonFromCal : (itemNumber,isDraft)=>{
 

        // URL: #/createLessonView/timeFromCalendar
        element.all(by.css('[ng-repeat="timeslot in day.timeSlots.all"]')).get(itemNumber).click();
        browser.sleep(500);
        element(by.css('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(1)>span')).click();
        browser.sleep(100);
        element(by.css('ent-dropdown>div:nth-of-type(1)>div:nth-of-type(2)>div:nth-of-type(1)>div:nth-of-type(4)>span')).click();
        element(by.css('input[ng-model="editLessonCtrl.lesson.title"]')).click();
        element(by.css('input[ng-model="editLessonCtrl.lesson.title"]')).clear().sendKeys('Ceci est le titre de la scéance');
        element.all(by.css('[contenteditable]')).get(0).clear().sendKeys('Ceci est le text de la scéance');
        element(by.css('.row.accordions > .accordion')).click();
        element.all(by.css('[contenteditable]')).get(1).clear().sendKeys('Ceci est une anotation');
        //button save
        let nbButton = isDraft ? 1 : 0;
        element.all(by.css('button.right-magnet[type="submit"]')).get(nbButton).click();
        browser.sleep(1000);
  },
  updateLessonFromCal : ()=>{
        element(by.css('[ng-if="item.calendarType!==\'shadow\'"]')).click();
        element(by.css('input[ng-model="editLessonCtrl.lesson.title"]')).click();
        element(by.css('input[ng-model="editLessonCtrl.lesson.title"]')).clear().sendKeys('Ceci est le titre de la scéance modifié');
        element.all(by.css('[contenteditable]')).get(0).clear().sendKeys('Ceci est le text de la scéance modifié');
        element(by.css('.row.accordions > .accordion')).click();
        element.all(by.css('[contenteditable]')).get(1).clear();
        //button save
        element.all(by.css('button.right-magnet[type="submit"]')).get(1).click();
        browser.sleep(1000);
  },
  deleteLessonFromCal : ()=>{
        element(by.css('input[ng-model="item.selected"]')).click();
        browser.sleep(500);
        element(by.css('[ng-click="showConfirmPanel(\'confirm-delete\')"]')).click();
        browser.sleep(500);
        element(by.css('[ng-click="deleteSelectedItems()"]')).click();
        browser.sleep(1000);
  }
};
