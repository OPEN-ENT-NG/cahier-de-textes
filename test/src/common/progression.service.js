var dragAndDrop = require('html-dnd').code;

var srv = {
  openProgressionTab : ()=>{
    browser.waitForAngular();
    element.all(by.css('.quick-search-label-minified')).get(2).click();
    browser.sleep(200);
  },

  createProgression : (title,level,description)=>{
    browser.waitForAngular();
    $('[ng-click="progressionManagerCtrl.setNewProgression()"]').click();
    srv.setProgressionInfos(title,level,description);
    srv.saveProgression();
  },
  saveProgression : ()=>{
    $('[ng-click="progressionManagerCtrl.saveProgression(progressionManagerCtrl.selectedProgressionItem)"]').click();
    browser.sleep(200);
  },
  setProgressionInfos : (title,level,description)=>{
    browser.sleep(200);
    $('input[ng-model="progressionManagerCtrl.selectedProgressionItem.title"]').clear().sendKeys(title);
    $('input[ng-model="progressionManagerCtrl.selectedProgressionItem.level"]').clear().sendKeys(level);
    $('textarea[ng-model="progressionManagerCtrl.selectedProgressionItem.description"]').clear().sendKeys(description);
  },
  backToCalendar : ()=>{
    $('a[href="#"]').click();
  },
  editProgression : (title,level,description)=>{
    browser.sleep(200);
    $('.edit-button').click();
    srv.setProgressionInfos(title,level,description);
    srv.saveProgression();
  },
  selectContentProgression : (nbItem)=>{
    let liContentProgression = $$('[diary-sortable-element]>div>article').get(nbItem);
    liContentProgression.$('label.checkbox').click();
    browser.sleep(200);
  }

};

module.exports = srv;
