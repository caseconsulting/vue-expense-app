import utils from '../utils/utils.js';
import vars from '../utils/constants.js';

describe('testing expense type to show on feed', () => {
  const expense = {
    name: 'Feed Test',
    desc: '25 buckaroos'
  };
  const banner_time = 5500;

  describe('testing sign-in', () => {
    before((browser) => {
      utils.commonBefore(browser);
    });
  });

  this.tags = ['expenseOnFeed'];

  it('Test creating an expenseType', (browser) => {
    utils.navigate(browser, vars.nav.expenses.types);
    browser
      .waitForElementVisible('#budgetName', vars.WAIT_TIME)
      .setValue('#budgetName', expense.name)
      .execute('document.getElementById("receiptRequired").click()')
      .waitForElementVisible('#budgetAmount', vars.WAIT_TIME)
      .setValue('#budgetAmount', '200') //inputs value for the budget amount
      .waitForElementVisible('#startDate', vars.WAIT_TIME)
      .setValue('#startDate', utils.date.lastYear()) //inputs the start date
      .waitForElementVisible('#endDate', vars.WAIT_TIME)
      .setValue('#endDate', utils.date.today()) //inputs the end date
      .waitForElementVisible('#description', vars.WAIT_TIME)
      .setValue('#description', 'pls pls y u do dis') //inputs the description
      .useXpath()
      .click("//*[contains(text(),'Have this expense type show on the company feed?')]")
      .useCss()
      .waitForElementVisible('#submitButton', vars.WAIT_TIME)
      .execute('document.getElementById("submitButton").click()') //submits the expense type
      .waitForElementVisible('#submitYesBtn', vars.WAIT_TIME)
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!')
      .pause(banner_time);
  });

  it('Test creating an expense', (browser) => {
    utils.navigate(browser, vars.nav.expenses.expenses);
    browser
      .waitForElementVisible('#employeeName', vars.WAIT_TIME) // selects the Employee input box
      .setValue('#employeeName', utils.getName('nick'))
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType', vars.WAIT_TIME)
      .setValue('#expenseType', expense.name) // using new expense type
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#cost', vars.WAIT_TIME)
      .setValue('#cost', '25') //inputs the cost
      .waitForElementVisible('#description', vars.WAIT_TIME)
      .setValue('#description', expense.desc) //inputs the description
      .waitForElementVisible('#purchaseDate', vars.WAIT_TIME)
      .setValue('#purchaseDate', utils.date.today())
      .waitForElementVisible('#notes', vars.WAIT_TIME)
      .setValue('#notes', 'test') //inputs a value to the notes field
      .waitForElementVisible('#submitButton')
      .click('#submitButton') //clicks on the submit button
      .waitForElementVisible('#submitYesBtn', vars.WAIT_TIME)
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test reimbursing the created expense', (browser) => {
    utils.navigate(browser, vars.nav.expenses.reimbursements);
    browser
      .waitForElementVisible('tbody>tr>td.text-center', vars.WAIT_TIME)
      .waitForElementVisible('#filterEmployee', vars.WAIT_TIME) // selects the Employee input box
      .setValue('#filterEmployee', utils.getName('nick'))
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#filterExpense', vars.WAIT_TIME) // selects the Employee input box
      .setValue('#filterExpense', expense.name)
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .execute('document.querySelector(".itemCheckbox:first-of-type>div>div>div>input").click()') // select the checkbox
      .waitForElementVisible('#custom-button-color', vars.WAIT_TIME)
      .click('#custom-button-color')
      .waitForElementVisible('#reimburse', vars.WAIT_TIME)
      .click('#reimburse')
      .waitForElementVisible('#alert', vars.WAIT_TIME);
  });

  it('Check if the expense made it through the activity feed', (browser) => {
    utils.navigate(browser, vars.nav.home, false); // `manual` must be false to refresh feed
    browser
      .waitForElementVisible('#home', vars.WAIT_TIME)
      .useXpath()
      .waitForElementVisible(
        "//*[contains(text(),' " +
          utils.getName('nick') +
          ' used their ' +
          expense.name +
          ' budget on ' +
          expense.desc +
          " ')]",
        vars.WAIT_TIME // activity feed takes a while to load in
      )
      .useCss();
  });

  it('Deleting an expense', (browser) => {
    utils.navigate(browser, vars.nav.expenses.expenses);
    browser
      .waitForElementVisible('#bothReimbursed', vars.WAIT_TIME)
      .click('#bothReimbursed')
      .waitForElementVisible('#employeeIdFilter', vars.WAIT_TIME)
      .setValue('#employeeIdFilter', utils.getName('nick')) //Accessing Filter By Employee
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER) //selects the first auto-fill option
      .waitForElementVisible('#showPending', vars.WAIT_TIME) // this is due to a bug that needs to be fixed
      .waitForElementVisible('#bothReimbursed', vars.WAIT_TIME) // unreimbuse icons not showing up on first sort
      .click('#showPending')
      .click('#bothReimbursed')
      .waitForElementVisible('button#unreimburse', vars.WAIT_TIME)
      .click('button#unreimburse')
      .waitForElementVisible('#confirmUnreimbursed', vars.WAIT_TIME)
      .execute('document.getElementById("confirmUnreimbursed").click()')
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully unreimbursed!')
      .pause(banner_time) // allow banner to go away before continuing
      .waitForElementVisible('#delete:not([disabled])', vars.WAIT_TIME) //waits for the delete icon
      .execute('document.getElementById("delete").click()')
      .waitForElementVisible('#confirmDelete', vars.WAIT_TIME) //waits for delete modal to appear
      .click('#confirmDelete')
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully deleted!');
  });

  it('Test deleting an expense type', (browser) => {
    utils.navigate(browser, vars.nav.expenses.types);
    browser
      .waitForElementVisible('#search', vars.WAIT_TIME)
      .setValue('#search', expense.name) //Accessing Filter By Name
      .waitForElementVisible('#delete', vars.WAIT_TIME) //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', vars.WAIT_TIME) //waits for delete modal to appear
      .click('#confirmDelete') //selects the delete button in the pop-up
      .waitForElementVisible('span.headline', vars.WAIT_TIME) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully deleted!');
  });
});
