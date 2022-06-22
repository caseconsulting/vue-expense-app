const auth = require('./utils/login.js');
const vars = require('./utils/constants.js');

describe('testing expense types', () => {
  before((browser) => {
    browser.windowMaximize('current');
    browser.url(vars.URL);
    auth.login(browser);
  });

  this.tags = ['createExpenseType'];

  it('Test clicking on Expense Types in nav bar', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd')
      .click('#mdi-currency-usd') //expands the expenses menu
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'Expense Types')]")
      .click("//*[contains(text(),'Expense Types')]") //clicks on the expense type button
      .useCss();
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
      .setValue('#startDate', '06/02/2021') //inputs the start date
      .waitForElementVisible('#endDate')
      .setValue('#endDate', '06/15/2021') //inputs the end date
      .waitForElementVisible('#description')
      .setValue('#description', 'pls pls y u do dis') //inputs the description
      .waitForElementVisible('#submitButton')
      .click('#submitButton') //submits the expense type
      .waitForElementVisible('#submitYesBtn')
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test clicking on My Expenses in nav bar', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd')
      .click('#mdi-currency-usd')
      .click('#mdi-currency-usd') //expands the expenses menu
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]")
      .click("//*[contains(text(),'My Expenses')]") //goes to the my expenses page
      .useCss();
  });

  it('Test creating an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeName') // selects the Employee input box
      .setValue('#employeeName', 'Owl Tester')
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
      .setValue('#purchaseDate', '06/10/2021') //make cause error in future bc it may be invalid
      .waitForElementVisible('#notes')
      .setValue('#notes', 'test') //inputs a value to the notes field
      .waitForElementVisible('#submitButton')
      .click('#submitButton') //clicks on the submit button
      .waitForElementVisible('#submitYesBtn')
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test deleting an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeIdFilter', 30000)
      .setValue('#employeeIdFilter', 'Owl Tester')
      .keys(browser.Keys.DOWN_ARROW) // select first dropdown option
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#delete', 30000) //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', 30000) //waits for delete modal to appear
      .click('#confirmDelete')
      .pause(3000); // give app time to delete expense so you can delete expense type
  });

  it('Test clicking on Expense Types in nav bar again', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd', 30000)
      .click('#mdi-currency-usd')
      .click('#mdi-currency-usd') //expands the expenses menu
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'Expense Types')]", 30000) //Clicks on the Expense Types button
      .click("//*[contains(text(),'Expense Types')]")
      .useCss();
  });

  it('Test deleting an expense type', (browser) => {
    browser
      .waitForElementVisible('#search', 30000)
      .setValue('#search', 'Testing createExpenseType') //Accessing Filter By Name
      .waitForElementVisible('#delete', 30000) //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', 30000) //waits for delete modal to appear
      .click('#confirmDelete'); //selects the delete button in the pop-up
  });
});
