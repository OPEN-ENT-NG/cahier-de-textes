var constants = require('../constants');
var dragAndDrop = require('html-dnd').code;
var fs = require('fs');
var rimraf = require('rimraf');

srv = {
    dragAndDrop2 : (source,target)=>{
        browser.executeScript(dragAndDrop, source, target, 5, 5);
        browser.sleep(200);
    },
    dragAndDrop : (source,target)=>{

        browser.actions().mouseMove(source).perform();
        browser.actions().mouseDown().perform();

        browser.sleep(100);
        browser.actions().mouseMove(target).perform();

        browser.sleep(100);
        browser.actions().mouseUp().perform();

        browser.sleep(100);

    },
    backToCalendar : ()=>{
      $('a[href="#"]').click();
    },
    checkFileIsDownloaded : (elemToClick)=>{
        let dir = constants.tempdir;
        if (fs.existsSync(dir)){
           return rimraf(dir,function(){
               return srv.createAndWait(elemToClick);
           });
       }else{
           return srv.createAndWait(elemToClick);
       }

    },
     createAndWait : (elemToClick)=>{
         let dir = constants.tempdir;
         fs.mkdirSync(dir);
         elemToClick.click();
         browser.sleep(400);
         return browser.driver.wait(function() {
             // Wait until the file has been downloaded.
             // We need to wait thus as otherwise protractor has a nasty habit of
             // trying to do any following tests while the file is still being
             // downloaded and hasn't been moved to its final location.
             let files =  fs.readdirSync(dir);
             return files.length > 0 ;
         }, 5000);
     }

};

module.exports = srv;
