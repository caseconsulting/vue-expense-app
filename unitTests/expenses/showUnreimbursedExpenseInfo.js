const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

describe('testing links', () => {
  const today = new Date();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const y = today.getFullYear();
  const data = {
    expenseDesc: 'test desc...',
    expenseDate: `${m}/${d}/${y}`,
    realDate: moment(today).format('MMM Do, YYYY')
  };

  before((browser) => {
    utils.commonBefore(browser);
    browser.waitForElementVisible('#filterEmployee', vars.WAIT_TIME); // look for unreimbursed filters
  });

  this.tags = ['expenseInfo'];

  it('Creating an expense', (browser) => {
    utils.navigate(browser, vars.nav.expenses.expenses);
    browser
      .waitForElementVisible('#employeeName', vars.WAIT_TIME) // selects the Employee input box
      .setValue('#employeeName', 'owl')
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType', vars.WAIT_TIME)
      .setValue('#expenseType', 'Activity Feed Show - $500') // using High-Five as it does not require a receipt
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#cost', vars.WAIT_TIME)
      .setValue('#cost', '11')
      .waitForElementVisible('#description', vars.WAIT_TIME)
      .setValue('#description', data.expenseDesc)
      .waitForElementVisible('#purchaseDate', vars.WAIT_TIME)
      .setValue('#purchaseDate', data.expenseDate) //make cause error in future bc it may be invalid
      .waitForElementVisible('#submitButton', vars.WAIT_TIME)
      .click('#submitButton')
      .waitForElementVisible('#submitYesBtn', vars.WAIT_TIME)
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test showing info', (browser) => {
    utils.navigate(browser, vars.nav.expenses.reimbursements);
    browser
      .pause(2000) // needed to enter value
      .waitForElementVisible('#filterEmployee', vars.WAIT_TIME)
      .setValue('#filterEmployee', 'owl') // filter user
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#filterExpense', vars.WAIT_TIME)
      .setValue('#filterExpense', 'activity') // filter expense type
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('tbody')
      .pause(3000)
      .click('tbody > tr') //selects expense
      .waitForElementVisible('#money-team', vars.WAIT_TIME)
      .assert.containsText('#money-team', '$11.00') // check cost
      .assert.containsText('#purchaseDate-team', data.realDate) // check purchase date
      .click('#subInfo tbody > tr') //clicks expense info row
      .waitForElementVisible('#expense-info', vars.WAIT_TIME) // waits for side info panel
      .assert.containsText('#expense-info', data.expenseDesc) // check description
      .assert.containsText('#expense-info', 'Nightwatch Tester') // check employee
      .assert.containsText('#expense-info', 'Activity Feed Show') // check expense type
      .assert.containsText('#expense-info', '$11.00') // check cost
      .assert.containsText('#expense-info', data.realDate); // check date
  });

  it('Deleting the expense', (browser) => {
    utils.navigate(browser, vars.nav.expenses.expenses);
    browser
      .waitForElementVisible('#employeeIdFilter', vars.WAIT_TIME)
      .setValue('#employeeIdFilter', 'owl')
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#delete:not([disabled])', vars.WAIT_TIME) //waits for the delete icon
      .execute('document.getElementById("delete").click()') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', vars.WAIT_TIME) //waits for delete modal to appear
      .click('#confirmDelete'); //selects the delete button in the pop-up
  });
});
