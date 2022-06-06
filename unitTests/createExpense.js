describe('testing links', () => {
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
      .keys(browser.Keys.ENTER) // click login button
      .waitForElementVisible('h1.d-inline'); // wait for header text 'Case Portal'
  });

  this.tags = ['createExpense'];

  it('Test clicking on My Expenses in nav bar', (browser) => {
    browser
      .waitForElementVisible('#dollar-sign')
      .click('#dollar-sign')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]")
      .click("//*[contains(text(),'My Expenses')]")
      .useCss();
  });

  it('Test creating an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeName') // selects the Employee input box
      .setValue('#employeeName', 'Owl Tester')
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER) // enter to confirm the first auto-fill option
      .waitForElementVisible('#expenseType')
      .setValue('#expenseType', 'High Five - $100') // using High-Five as it does not require a receipt
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#notes')
      .setValue('#notes', 'test')
      .waitForElementVisible('#purchaseDate')
      .setValue('#purchaseDate', '06/05/2022') //make cause error in future bc it may be invalid
      .waitForElementVisible('#recipient')
      .setValue('#recipient', 'Charles Bias') //George Doe will receive the High Five
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER)
      .waitForElementVisible('#submitButton')
      .click('#submitButton')
      .waitForElementVisible('span.headline') //validates the confirmation pop-up after submitting
      .assert.containsText('span.headline', 'Item was successfully submitted!');
  });

  it('Test editing an expense', (browser) => {
    browser
      .waitForElementVisible('#employeeIdFilter')
      .setValue('#employeeIdFilter', 'Owl Tester') //Accessing Filter By Employee
      .keys(browser.Keys.DOWN_ARROW)
      .keys(browser.Keys.ENTER) //selects the first auto-fill option
      .waitForElementVisible('#edit') //waits for the edit icon
      .click('#edit') //clicks the edit icon
      .waitForElementVisible('#employeeName')
      .assert.attributeEquals('#employeeName', 'disabled', 'true') // ensure that the employee name field is disabled
      .assert.value('#employeeName', 'Owl Tester') // check all fields in form are exactly the same
      .assert.value('#expenseType', 'High Five - $100')
      .assert.value('#notes', 'test')
      .assert.value('#purchaseDate', '06/05/2022')
      .assert.value('#recipient', 'Charles Bias')
      .waitForElementVisible('#cancelButton')
      .click('#cancelButton'); // close out of form to continue tests
  });

  it('Test deleting an expense', (browser) => {
    browser
      .waitForElementVisible('#delete') //waits for the delete icon
      .click('#delete') //clicks the delete icon
      .waitForElementVisible('#confirmDelete') //waits for delete modal to appear
      .click('#confirmDelete'); //selects the delete button in the pop-up
  });
});
