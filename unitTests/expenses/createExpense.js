describe('testing links', () => {
  before((browser) => {
    browser.url('http://localhost:8080');
    browser.windowMaximize('current'); // maximize window
    browser
      .waitForElementVisible('#custom-button-color', 30000) // wait for login button to load
      .pause(500)
      .click('#custom-button-color') // click that button
      .waitForElementVisible('img.auth0-lock-header-logo', 30000) // check that the case logo is there in auth0
      .waitForElementVisible('div.auth0-lock-content', 30000) // check that the auth0 login button is visible
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
      .waitForElementVisible('h1.d-inline', 30000); // wait for header text 'Case Portal'
  });

  this.tags = ['createExpense'];

  it('Test clicking on My Expenses in nav bar', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd', 30000)
      .click('#mdi-currency-usd')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]", 30000)
      .click("//*[contains(text(),'My Expenses')]")
      .useCss();
  });

  it('Test creating an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeName', 30000) // selects the Employee input box
      .setValue('#employeeName', 'Owl Tester')
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType', 30000)
      .setValue('#expenseType', 'High Five - $100') // using High-Five as it does not require a receipt
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#notes', 30000)
      .setValue('#notes', 'test')
      .waitForElementVisible('#purchaseDate', 30000)
      .setValue('#purchaseDate', '06/24/2022') //make cause error in future bc it may be invalid
      .waitForElementVisible('#recipient', 30000)
      .setValue('#recipient', 'Charles Bias') //George Doe will receive the High Five
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#submitButton', 30000)
      .click('#submitButton')
      .waitForElementVisible('#submitYesBtn', 30000)
      .click('#submitYesBtn') //confirms the submission
      .waitForElementVisible('span.headline', 30000) //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test editing an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeIdFilter', 30000)
      .setValue('#employeeIdFilter', 'Owl Tester') //Accessing Filter By Employee
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER) //selects the first auto-fill option
      .waitForElementVisible('#edit', 30000) //waits for the edit icon
      .click('#edit') //clicks the edit icon
      .waitForElementVisible('#employeeName', 30000)
      .assert.attributeEquals('#employeeName', 'disabled', 'true') // ensure that the employee name field is disabled
      .assert.value('#employeeName', 'Owl Tester') // check all fields in form are exactly the same
      .assert.value('#expenseType', 'High Five - $100')
      .assert.value('#notes', 'test')
      .assert.value('#purchaseDate', '06/24/2022')
      .assert.value('#recipient', 'Charles Bias')
      .waitForElementVisible('#cancelButton', 30000)
      .pause(500) // allow UI time to update
      .click('#cancelButton') // close out of form to continue tests
      .waitForElementVisible('#submitYesBtn', 30000)
      .click('#submitYesBtn'); //confirms the submission
  });

  it('Test deleting an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeIdFilter', 30000)
      .assert.value('#employeeIdFilter', 'Nightwatch Tester')
      .waitForElementVisible('#delete:not([disabled])', 30000) //waits for the delete icon
      .pause(500) // allow UI to update
      .execute('document.getElementById("delete").click()') //clicks the delete icon
      .waitForElementVisible('#confirmDelete', 30000) //waits for delete modal to appear
      .click('#confirmDelete'); //selects the delete button in the pop-up
  });
});
