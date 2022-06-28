const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');

describe('Login and confirm reimbursements', () => {
  before((browser) => {
    utils.commonBefore(browser);
    browser.waitForElementVisible('#filterEmployee', vars.WAIT_TIME); // look for unreimbursed filters
  });
});

this.tags = ['switchToUser'];

it('Clicking switch to user', (browser) => {
  browser
    .waitForElementVisible('#profile', vars.WAIT_TIME)
    .click('#profile')
    .waitForElementVisible('#switchRoleBtn', vars.WAIT_TIME)
    .click('#switchRoleBtn')
    .waitForElementVisible('.headline', vars.WAIT_TIME)
    .execute('document.getElementById("userSelector").click()')
    .waitForElementVisible('#confirmSwitch', vars.WAIT_TIME)
    .click('#confirmSwitch');
});

it('Verify user home page', (browser) => {
  browser.waitForElementVisible('#home-greeting', vars.WAIT_TIME); // look for Hello message
});
