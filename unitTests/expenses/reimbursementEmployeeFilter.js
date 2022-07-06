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
    browser.url('http://localhost:8080');
    browser.windowMaximize('current'); // maximize window
    browser
      .waitForElementVisible('#custom-button-color', 30000) // wait for login button to load
      .pause(500)
      .click('#custom-button-color') // click that button
      .waitForElementVisible('img.auth0-lock-header-logo', 30000) // check that the case logo is there in auth0
      .waitForElementVisible('div.auth0-lock-social-button-text:not([disabled])', 30000) // check that the auth0 login button is visible
      .pause(500)
      .click('div.auth0-lock-social-button-text') // click the button
      .waitForElementVisible('input#identifierId', 30000) // wait for email box to be visible
      .pause(500)
      .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL) // input your email
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('#password', 30000) // wait for password field to load
      .pause(500)
      .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('#home', 30000); // wait for header text 'Case Portal'
  });

  this.tags = ['reimbursementFilter'];

  it('Creating an expense', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd', 30000)
      .click('#mdi-currency-usd')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]", 30000)
      .click("//*[contains(text(),'My Expenses')]")
      .useCss()
      .waitForElementVisible('#employeeName', 30000) // selects the Employee input box
      .setValue('#employeeName', 'owl')
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType', 30000)
      .setValue('#expenseType', 'Activity Feed Show - $500') // using High-Five as it does not require a receipt
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#cost', 30000)
      .setValue('#cost', '11')
      .waitForElementVisible('#description', 30000)
      .setValue('#description', data.expenseDesc)
      .waitForElementVisible('#purchaseDate', 30000)
      .setValue('#purchaseDate', data.expenseDate) //make cause error in future bc it may be invalid
      .waitForElementVisible('#submitButton', 30000)
      .click('#submitButton')
      .waitForElementVisible('#submitYesBtn', 30000)
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test filter right employee', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd', 30000)
      .click('#mdi-currency-usd')
      .click('#mdi-currency-usd') // needed to click correctly
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'Reimbursements')]", 30000)
      .click("//*[contains(text(),'Reimbursements')]")
      .useCss()
      .pause(2000) // needed to enter value
      .waitForElementVisible('#filterEmployee', 30000)
      .setValue('#filterEmployee', 'owl') // filter user
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('tbody')
      .pause(3000)
      .assert.containsText('tbody', 'Nightwatch Tester'); // check employee name
  });

  it('Deleting the expense', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd', 30000)
      .click('#mdi-currency-usd')
      .click('#mdi-currency-usd') // needed to click correctly
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]", 30000)
      .click("//*[contains(text(),'My Expenses')]")
      .useCss()
      .waitForElementVisible('#employeeIdFilter', 30000)
      .setValue('#employeeIdFilter', 'owl')
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#delete:not([disabled])', 30000) //waits for the delete icon
      .execute('document.getElementById("delete").click()') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', 30000) //waits for delete modal to appear
      .click('#confirmDelete'); //selects the delete button in the pop-up
  });
});
