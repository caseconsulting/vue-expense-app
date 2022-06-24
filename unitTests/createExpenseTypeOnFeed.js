describe('testing expense type to show on feed', () => {
  const today = new Date();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const y = today.getFullYear();
  const data = {
    employeeName: 'Owl Tester',
    expenseName: 'Feed Test',
    expenseDesc: '25 buckaroos',
    expenseDate: `${m}/${d}/${y}`
  };

  describe('testing sign-in', () => {
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
  });

  this.tags = ['expenseTypeFeed'];

  it('Test creating an expenseType', (browser) => {
    browser
      .url('http://localhost:8080/expenseTypes')
      .waitForElementVisible('#budgetName', 30000)
      .setValue('#budgetName', data.expenseName)
      .execute('document.getElementById("receiptRequired").click()')
      .waitForElementVisible('#budgetAmount', 30000)
      .setValue('#budgetAmount', '200') //inputs value for the budget amount
      .waitForElementVisible('#startDate', 30000)
      .setValue('#startDate', '06/26/2021') //inputs the start date
      .waitForElementVisible('#endDate', 30000)
      .setValue('#endDate', data.expenseDate) //inputs the end date
      .waitForElementVisible('#description', 30000)
      .setValue('#description', 'pls pls y u do dis') //inputs the description
      .useXpath()
      .click("//*[contains(text(),'Have this expense type show on the company feed?')]")
      .useCss()
      .waitForElementVisible('#submitButton', 30000)
      .execute('document.getElementById("submitButton").click()') //submits the expense type
      .waitForElementVisible('#submitYesBtn', 30000)
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test creating an expense', (browser) => {
    browser
      .url('http://localhost:8080/myExpenses')
      .waitForElementVisible('#employeeName', 30000) // selects the Employee input box
      .setValue('#employeeName', data.employeeName)
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType', 30000)
      .setValue('#expenseType', data.expenseName) // using new expense type
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#cost', 30000)
      .setValue('#cost', '25') //inputs the cost
      .waitForElementVisible('#description', 30000)
      .setValue('#description', data.expenseDesc) //inputs the description
      .waitForElementVisible('#purchaseDate', 30000)
      .setValue('#purchaseDate', data.expenseDate) //make cause error in future bc it may be invalid
      .waitForElementVisible('#notes', 30000)
      .setValue('#notes', 'test') //inputs a value to the notes field
      .waitForElementVisible('#submitButton')
      .click('#submitButton') //clicks on the submit button
      .waitForElementVisible('#submitYesBtn', 30000)
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test reimbursing the created expense', (browser) => {
    browser
      .url('http://localhost:8080/reimbursements')
      .waitForElementVisible('tbody>tr>td.text-center', 30000)
      .waitForElementVisible('#filterEmployee', 30000) // selects the Employee input box
      .setValue('#filterEmployee', data.employeeName)
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#filterExpense', 30000) // selects the Employee input box
      .setValue('#filterExpense', data.expenseName)
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .execute('document.querySelector(".itemCheckbox:first-of-type>div>div>div>input").click()') // select the checkbox
      .waitForElementVisible('#custom-button-color', 30000)
      .click('#custom-button-color')
      .waitForElementVisible('#reimburse', 30000)
      .click('#reimburse')
      .waitForElementVisible('#alert', 30000);
  });

  it('Check if the expense made it through the activity feed', (browser) => {
    browser
      .url('http://localhost:8080/home')
      .waitForElementVisible('#home', 30000)
      .useXpath()
      .waitForElementVisible(
        "//*[contains(text(),' " +
          data.employeeName +
          ' used their ' +
          data.expenseName +
          ' budget on ' +
          data.expenseDesc +
          " ')]",
        30000 * 2 // activity feed takes a while to load in
      )
      .useCss();
  });

  it('Deleting an expense', (browser) => {
    browser
      .url('http://localhost:8080/myExpenses')
      .waitForElementVisible('#bothReimbursed', 30000)
      .click('#bothReimbursed')
      .waitForElementVisible('#employeeIdFilter', 30000)
      .setValue('#employeeIdFilter', data.employeeName) //Accessing Filter By Employee
      .keys(browser.Keys.ARROW_DOWN)
      .keys(browser.Keys.ENTER) //selects the first auto-fill option
      .waitForElementVisible('#showPending', 30000) // this is due to a bug that needs to be fixed
      .waitForElementVisible('#bothReimbursed', 30000) // unreimbuse icons not showing up on first sort
      .click('#showPending')
      .click('#bothReimbursed')
      .waitForElementVisible('button#unreimburse', 30000)
      .click('button#unreimburse')
      .waitForElementVisible('#confirmUnreimbursed', 30000)
      .execute('document.getElementById("confirmUnreimbursed").click()')
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully unreimbursed!')
      .pause(5000) // allow banner to go away before continuing
      .waitForElementVisible('#delete:not([disabled])', 30000) //waits for the delete icon
      .execute('document.getElementById("delete").click()')
      .waitForElementVisible('#confirmDelete', 30000) //waits for delete modal to appear
      .click('#confirmDelete')
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully deleted!');
  });

  it('Test deleting an expense type', (browser) => {
    browser
      .url('http://localhost:8080/expenseTypes')
      .waitForElementVisible('#search', 30000)
      .setValue('#search', data.expenseName) //Accessing Filter By Name
      .waitForElementVisible('#delete', 30000) //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', 30000) //waits for delete modal to appear
      .click('#confirmDelete') //selects the delete button in the pop-up
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully deleted!');
  });
});
