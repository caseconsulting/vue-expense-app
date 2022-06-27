const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');

describe('testing sign-in', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['login'];

  it('Test home page loaded after sign-in for users', (browser) => {
    browser
      .waitForElementVisible('#home-greeting', vars.WAIT_TIME)
      .assert.urlEquals(`${vars.URL}/${vars.nav.home.route}`)
      .assert.visible('#home-greeting')
      .assert.visible('#t-sheets-data')
      .assert.visible('#home-available-budgets')
      .assert.visible('#home-anniversary')
      .assert.visible('#home-activity-feed')
      .assert.visible('#home-twitter-feed');
  });
});
