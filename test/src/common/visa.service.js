var dragAndDrop = require('html-dnd').code;
var constants = require('../constants');
var srv = {
   selectTeacher:(nb)=>{
      $('[placeholder="enseignant"]').click();
      $$('search-drop-down li').get(nb).click();
   },
   search:()=>{
      element(by.buttonText('Rechercher')).click();
   },
   selectStatut:(nb)=>{
     $('diary-drop-down[list="visaManagerCtrl.filters.states"] .dropdown-display').click();
     browser.sleep(200);
     $$('diary-drop-down[list="visaManagerCtrl.filters.states"] .item-list').get(nb).click();
     browser.sleep(200);
   }
};

module.exports = srv;
