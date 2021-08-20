describe('testing expense types', () => {
  before((browser) => {
    browser
      .url('http://localhost:8080')
      .windowMaximize('current') // maximize window
      .waitForElementVisible('#custom-button-color') // wait for login button to load
      .click('#custom-button-color') // click that button
      .assert.visible('img.auth0-lock-header-logo') // check that the case logo is there in auth0
      .assert.visible('div.auth0-lock-content') // check that the auth0 login button is visible
      .click('div.auth0-lock-social-button-text') // click the button
      .waitForElementVisible('input#identifierId') // wait for email box to be visible
      .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL) // input your email
      .click('button.VfPpkd-LgbsSe') // click continue button
      .waitForElementVisible('#password') // wait for password field to load
      .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
      .click('button.VfPpkd-LgbsSe') // click login button
      .waitForElementVisible('h1.d-inline'); // wait for header text 'Case Portal'
  });

  this.tags = ['createExpenseType'];

  it('Test clicking on Expense Types in nav bar', (browser) => {
    browser
      .waitForElementVisible('#dollar-sign')
      .click('#dollar-sign') //expands the expenses menu
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'Expense Types')]")
      .click("//*[contains(text(),'Expense Types')]") //clicks on the expense type button
      .useCss();
  });

  it('Test creating an expenseType', (browser) => {
    browser
      .waitForElementVisible('#budgetName')
      .setValue('#budgetName', 'This is a test') //inputs value for the name of the budget
      .setValue('#budgetName', 'This is a test') //inputs value for the name of the budget
      .waitForElementVisible('#budgetAmount')
      .click('#budgetAmount')
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
      .waitForElementVisible('span.headline') //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test clicking on My Expenses in nav bar', (browser) => {
    browser
      .waitForElementVisible('#dollar-sign')
      .click('#dollar-sign')
      .click('#dollar-sign') //Expands the menu
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]")
      .click("//*[contains(text(),'My Expenses')]") //goes to the my expenses page
      .useCss();
  });

  it('Test creating an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeName') // selects the Employee input box
      .setValue('#employeeName', 'Test Guy')
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType')
      .setValue('#expenseType', 'This is a test') // using new expense type
      .keys(browser.Keys.ENTER)
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
      .waitForElementVisible('span.headline') //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test deleting an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeIdFilter')
      .setValue('#employeeIdFilter', 'Test Guy') //Accessing Filter By Employee
      .keys(browser.Keys.ENTER) //selects the first auto-fill option
      .waitForElementVisible('#delete') //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete') //waits for delete modal to appear
      .click('#confirmDelete');
  });

  it('Test clicking on Expense Types in nav bar again', (browser) => {
    browser
      .waitForElementVisible('#dollar-sign')
      .click('#dollar-sign')
      .click('#dollar-sign') //expands the expenses menu
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'Expense Types')]") //Clicks on the Expense Types button
      .click("//*[contains(text(),'Expense Types')]")
      .useCss();
  });

  it('Test deleting an expense type', (browser) => {
    browser
      .waitForElementVisible('#search')
      .setValue('#search', 'This is a test') //Accessing Filter By Name
      .waitForElementVisible('#delete') //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete') //waits for delete modal to appear
      .click('#confirmDelete'); //selects the delete button in the pop-up
  });
});
