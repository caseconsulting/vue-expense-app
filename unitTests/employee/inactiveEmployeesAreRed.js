const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');

describe('testing sign-in', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['inactiveAreRed'];

  it('Test clicking the inactive button and verifying the employees are red text', (browser) => {
    utils.navigate(browser, vars.nav.employees);
    browser
      .waitForElementVisible('#employeesSearch', vars.WAIT_TIME)
      .click('#employeesSearch')
      .waitForElementVisible('#inactive', vars.WAIT_TIME)
      .click('#inactive') //selects inactive
      .waitForElementVisible('#part', vars.WAIT_TIME)
      .click('#part') //deselects part time
      .waitForElementVisible('#full', vars.WAIT_TIME)
      .click('#full') //deselects full time
      .waitForElementVisible('.text-start p.inactiveStyle', vars.WAIT_TIME); //checks if the class used for inactive employees is present
  });
});
