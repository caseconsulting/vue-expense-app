const auth = require('./utils/login.js');
const vars = require('./utils/constants.js');

describe('testing sign-in', () => {
  describe('testing sign-in', () => {
    before((browser) => {
      browser.windowMaximize('current');
      browser.url(vars.URL);
      auth.login(browser);
    });
  });

  this.tags = ['inactiveAreRed'];

  it('Test clicking the inactive button and verifying the employees are red text', (browser) => {
    browser
      .waitForElementVisible('#mdi-account-group', 30000)
      .click('#mdi-account-group')
      .waitForElementVisible('#employeesSearch', 30000)
      .click('#employeesSearch')
      .waitForElementVisible('#inactive', 30000)
      .click('#inactive') //selects inactive
      .waitForElementVisible('#part', 30000)
      .click('#part') //deselects part time
      .waitForElementVisible('#full', 30000)
      .click('#full') //deselects full time
      .waitForElementVisible('.text-start p.inactiveStyle', 30000); //checks if the class used for inactive employees is present
  });
});
