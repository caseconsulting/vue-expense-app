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
      .click('button.VfPpkd-LgbsSe') // click continue button
      .waitForElementVisible('#password') // wait for password field to load
      .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
      .click('button.VfPpkd-LgbsSe') // click login button
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
      .waitForElementVisible('#showOnFeed')
      .click('#showOnFeed')
      .pause(5000);
    //   .waitForElementVisible('#submitButton')
    //   .click('#submitButton') //submits the expense type
    //   .waitForElementVisible('#submitYesBtn')
    //   .click('#submitYesBtn') //confirms the submission
    //   .waitForElementVisible('span.headline') //validates the confirmation pop-up after submitting
    //   .assert.containsText('span.headline', 'Item was successfully submitted!');
  });
});
