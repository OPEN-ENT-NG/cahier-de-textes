var constants = require('../constants');

module.exports = {
    login: (profil, path) => {
        browser.get(constants.pathurl);

        expect(browser.getTitle()).toEqual('Authentification');

        browser.sleep(1000);
        browser.driver.manage().window().setSize(1366, 768);
        browser.driver.manage().window().setPosition(0, 0);
        // URL:
        element(by.css('input[ng-model="user.email"]')).clear().sendKeys(constants.profils[profil].login);
        // URL:
        element(by.css('input[ng-model="user.password"]')).clear().sendKeys(constants.profils[profil].pwd);
        browser.sleep(100);
        element(by.css('form>div>button')).click();
        browser.sleep(2000);
        if (path) {
            browser.get(constants.pathurl + path);
            browser.sleep(2000);
        }
    },
    logout: () => {
        browser.waitForAngular();

        element(by.css('[logout]')).click();

        browser.sleep(1000);
    }

};
