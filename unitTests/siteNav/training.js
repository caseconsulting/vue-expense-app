const auth = require('./utils/login.js');
const vars = require('./utils/constants.js');

describe('testing sign-in', () => {
  before((browser) => {
    browser.windowMaximize('current');
    browser.url(vars.URL);
    auth.login(browser);
  });

  this.tags = ['trainingPage'];

  it('Test navigate to Training', (browser) => {
    browser
      .waitForElementVisible('#mdi-fire')
      .click('#mdi-fire')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'https://vt.edu')]");
  });
});
