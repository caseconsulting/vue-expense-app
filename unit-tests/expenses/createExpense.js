import utils from '../utils/utils.js';
import vars from '../utils/constants.js';

describe('testing links', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['createExpense'];

  it('Test clicking on My Expenses in nav bar', (browser) => {
    utils.navigate(browser, vars.nav.expenses.expenses);
  });

  it('Test creating an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeName', vars.WAIT_TIME) // selects the Employee input box
      .setValue('#employeeName', utils.getName('nick'))
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType', vars.WAIT_TIME)
      .setValue('#expenseType', 'High Five - $100') // using High-Five as it does not require a receipt
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#notes', vars.WAIT_TIME)
      .setValue('#notes', 'test')
      .waitForElementVisible('#purchaseDate', vars.WAIT_TIME)
      .setValue('#purchaseDate', utils.date.today())
      .waitForElementVisible('#recipient', vars.WAIT_TIME)
      .setValue('#recipient', 'Charles Bias') // Charles Bias will receive the High Five
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#submitButton', vars.WAIT_TIME)
      .click('#submitButton')
      .waitForElementVisible('#submitYesBtn', vars.WAIT_TIME)
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test editing an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeIdFilter', vars.WAIT_TIME)
      .setValue('#employeeIdFilter', utils.getName('nick')) //Accessing Filter By Employee
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER) //selects the first auto-fill option
      .waitForElementVisible('#edit', vars.WAIT_TIME) //waits for the edit icon
      .click('#edit') //clicks the edit icon
      .waitForElementVisible('#employeeName', vars.WAIT_TIME)
      .assert.attributeEquals('#employeeName', 'disabled', 'true') // ensure that the employee name field is disabled
      .assert.value('#employeeName', utils.getName('nick')) // check all fields in form are exactly the same
      .assert.value('#expenseType', 'High Five - $100')
      .assert.value('#notes', 'test')
      .assert.value('#purchaseDate', utils.date.today())
      .assert.value('#recipient', 'Charles Bias')
      .waitForElementVisible('#cancelButton', vars.WAIT_TIME)
      .pause(vars.SMALL_PAUSE) // allow UI time to update
      .click('#cancelButton') // close out of form to continue tests
      .waitForElementVisible('#submitYesBtn', vars.WAIT_TIME)
      .click('#submitYesBtn'); //confirms the submission
  });

  it('Test deleting an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeIdFilter', vars.WAIT_TIME)
      .assert.value('#employeeIdFilter', utils.getName('real')) // potentially should be a story to make this nickname in portal
      .waitForElementVisible('#delete:not([disabled])', vars.WAIT_TIME) //waits for the delete icon
      .pause(vars.SMALL_PAUSE) // allow UI to update
      .execute('document.getElementById("delete").click()') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', vars.WAIT_TIME) //waits for delete modal to appear
      .click('#confirmDelete'); //selects the delete button in the pop-up
  });
});
