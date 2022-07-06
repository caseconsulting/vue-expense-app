const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');

describe('testing expense types', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['createExpenseType'];

  it('Test clicking on Expense Types in nav bar', (browser) => {
    utils.navigate(browser, vars.nav.expenses.types);
  });

  it('Test creating an expenseType', (browser) => {
    browser
      .waitForElementVisible('#budgetName')
      .setValue('#budgetName', 'Testing createExpenseType') //inputs value for the name of the budget
      .waitForElementVisible('#budgetAmount')
      .click('#budgetAmount')
      .execute('document.getElementById("receiptRequired").click()') // makes receipt not required
      .setValue('#budgetAmount', '99') //inputs value for the budget amount
      .waitForElementVisible('#startDate')
      .setValue('#startDate', utils.date.lastYear()) //inputs the start date
      .waitForElementVisible('#endDate')
      .setValue('#endDate', utils.date.tomorrow()) //inputs the end date
      .waitForElementVisible('#description')
      .setValue('#description', 'pls pls y u do dis') //inputs the description
      .waitForElementVisible('#submitButton')
      .click('#submitButton') //submits the expense type
      .waitForElementVisible('#submitYesBtn')
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test clicking on My Expenses in nav bar', (browser) => {
    utils.navigate(browser, vars.nav.expenses.expenses);
  });

  it('Test creating an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeName') // selects the Employee input box
      .setValue('#employeeName', utils.getName('nick'))
      .keys(browser.Keys.DOWN_ARROW) // select first dropdown option
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType')
      .setValue('#expenseType', 'Testing createExpenseType') // using new expense type
      .keys(browser.Keys.DOWN_ARROW) // select first dropdown option
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#cost')
      .setValue('#cost', '25') //inputs the cost
      .waitForElementVisible('#description')
      .setValue('#description', '25 buckaroos') //inputs the description
      .waitForElementVisible('#purchaseDate')
      .setValue('#purchaseDate', utils.date.today()) //make cause error in future bc it may be invalid
      .waitForElementVisible('#notes')
      .setValue('#notes', 'test') //inputs a value to the notes field
      .waitForElementVisible('#submitButton')
      .click('#submitButton') //clicks on the submit button
      .waitForElementVisible('#submitYesBtn')
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!')
      .pause(5500);
  });

  it('Test deleting an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeIdFilter', vars.WAIT_TIME)
      .setValue('#employeeIdFilter', utils.getName('nick'))
      .keys(browser.Keys.DOWN_ARROW) // select first dropdown option
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#delete', vars.WAIT_TIME) //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', vars.WAIT_TIME) //waits for delete modal to appear
      .click('#confirmDelete')
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully deleted!')
      .pause(5500); // give app time to delete expense so you can delete expense type
  });

  it('Test clicking on Expense Types in nav bar again', (browser) => {
    utils.navigate(browser, vars.nav.expenses.types);
  });

  it('Test deleting an expense type', (browser) => {
    browser
      .waitForElementVisible('#search', vars.WAIT_TIME)
      .setValue('#search', 'Testing createExpenseType') //Accessing Filter By Name
      .waitForElementVisible('#delete', vars.WAIT_TIME) //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', vars.WAIT_TIME) //waits for delete modal to appear
      .click('#confirmDelete'); //selects the delete button in the pop-up
  });
});
