describe('testing expense type to show on feed', () => {
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
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('#password') // wait for password field to load
      .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('h1.d-inline'); // wait for header text 'Case Portal'
  });

  this.tags = ['expenseTypeFeed'];

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
      .pause(550)
      .waitForElementVisible('#budgetName')
      .setValue('#budgetName', 'Feed Test') //inputs value for the name of the budget
      //.setValue('#budgetName', 'Feed Test') //inputs value for the name of the budget
      // .pause(50)
      .waitForElementVisible('#budgetAmount')
      //.click('#budgetAmount')
      .setValue('#budgetAmount', '200') //inputs value for the budget amount
      .waitForElementVisible('#startDate')
      .setValue('#startDate', '06/26/2021') //inputs the start date
      .waitForElementVisible('#endDate')
      .setValue('#endDate', '10/25/2021') //inputs the end date
      .waitForElementVisible('#description')
      .setValue('#description', 'pls pls y u do dis') //inputs the description
      .useXpath()
      .click("//*[contains(text(),'Have this expense type show on the company feed?')]")
      .useCss()
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
      .setValue('#expenseType', 'Feed Test') // using new expense type
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#cost')
      .setValue('#cost', '25') //inputs the cost
      .waitForElementVisible('#description')
      .setValue('#description', '25 buckaroos') //inputs the description
      .waitForElementVisible('#purchaseDate')
      .setValue('#purchaseDate', '06/28/2021') //make cause error in future bc it may be invalid
      .waitForElementVisible('#notes')
      .setValue('#notes', 'test') //inputs a value to the notes field
      .waitForElementVisible('#submitButton')
      .click('#submitButton') //clicks on the submit button
      .waitForElementVisible('span.headline') //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test clicking on Reimbursements in nav bar', (browser) => {
    browser
      .waitForElementVisible('#dollar-sign')
      .click('#dollar-sign')
      .click('#dollar-sign') //Expands the menu
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'Reimbursements')]")
      .click("//*[contains(text(),'Reimbursements')]") //goes to the my expenses page
      .useCss();
  });

  it('Test reimbursing the created expense', (browser) => {
    browser
      .waitForElementVisible('#filterEmployee') // selects the Employee input box
      .setValue('#filterEmployee', 'Test Guy')
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .click(
        'td.text-start > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3)'
      )
      .waitForElementVisible('#custom-button-color')
      .click('#custom-button-color')
      .waitForElementVisible('#reimburse')
      .click('#reimburse')
      .waitForElementVisible('#alert');
  });

  it('Check if the expense made it through the activity feed', (browser) => {
    browser
      .waitForElementVisible('#home')
      .click('#home')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),' Test Guy used their Feed Test budget on 25 buckaroos ')]")
      .useCss();
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

  it('Deleting an expense', (browser) => {
    browser
      .waitForElementVisible('#bothReimbursed')
      .click('#bothReimbursed')
      .waitForElementVisible('#employeeIdFilter')
      .setValue('#employeeIdFilter', 'Test Guy') //Accessing Filter By Employee
      .keys(browser.Keys.ENTER) //selects the first auto-fill option
      .waitForElementVisible('#unreimburse')
      .click('#unreimburse')
      .waitForElementVisible('#confirmUnreimbursed')
      .click('#confirmUnreimbursed')
      .waitForElementVisible('#delete') //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete') //waits for delete modal to appear
      .click('#confirmDelete')
      .waitForElementVisible('span.headline') //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully deleted!');
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
      .setValue('#search', 'Feed Test') //Accessing Filter By Name
      .waitForElementVisible('#delete') //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete') //waits for delete modal to appear
      .click('#confirmDelete') //selects the delete button in the pop-up
      .waitForElementVisible('span.headline') //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully deleted!');
  });
});
