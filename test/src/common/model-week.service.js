var dragAndDrop = require('html-dnd').code;
var constants = require('../constants');
var srv = {
   selectWeek: (nb)=>{
      $$('select-list[display="diary.model.week.title"]>div').get(0).click();
      browser.sleep(200);
      $$('select-list .options opt').get(nb).click();
   }
};

module.exports = srv;
