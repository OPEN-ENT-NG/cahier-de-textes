var constants = require('../constants');
var dragAndDrop = require('html-dnd').code;

module.exports = {
    dragAndDrop : (source,target)=>{

        browser.actions().mouseMove(source).perform();
        browser.actions().mouseDown().perform();

        browser.sleep(100);
        browser.actions().mouseMove(target).perform();

        browser.sleep(100);
        browser.actions().mouseUp().perform();

         browser.sleep(100);

    }

};
