var contants = require('../constants');

module.exports = {
  login : (path)=>{

      browser.get(contants.pathurl);

      expect(browser.getTitle()).toEqual('Authentification');

      browser.sleep(1000);
      browser.driver.manage().window().setSize(1680, 1050);
        // URL:
      element(by.css('input[ng-model="user.email"]')).clear().sendKeys('mia.barbier2');
        // URL:
      element(by.css('input[ng-model="user.password"]')).clear().sendKeys('Ong_1234');
      browser.sleep(100);
      element(by.css('form>div>button')).click();
      browser.sleep(2000);
      if (path){        
        browser.get(contants.pathurl+path);
        browser.sleep(2000);
      }
  },


};
