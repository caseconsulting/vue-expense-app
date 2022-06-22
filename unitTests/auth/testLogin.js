const auth = require('./utils/login.js');
const vars = require('./utils/constants.js');

describe('testing sign-in', () => {
  before((browser) => {
    browser.windowMaximize('current');
    browser.url(vars.URL);
    auth.login(browser);
  });

  this.tags = ['login'];

  it('Test home page loaded after sign-in for users', (browser) => {
    browser
      .waitForElementVisible('#home-greeting', 30000)
      .assert.urlEquals('http://localhost:8080/home')
      .assert.visible('#home-greeting')
      .assert.visible('#t-sheets-data')
      .assert.visible('#home-available-budgets')
      .assert.visible('#home-anniversary')
      .assert.visible('#home-activity-feed')
      .assert.visible('#home-twitter-feed');
  });
});
