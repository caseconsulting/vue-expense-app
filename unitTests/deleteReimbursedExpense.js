describe('delete riembursed expense', () => {
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

  this.tags = ['deleteReimbursed'];

  it('Test clicking on My Expenses in nav bar', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd', 30000)
      .click('#mdi-currency-usd')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]", 30000)
      .click("//*[contains(text(),'My Expenses')]")
      .useCss();
  });

  it('Test setting filters for expenses', (browser) => {
    browser
      .waitForElementVisible('#search', 30000) // wait for search bar to load
      .pause(500)
      .click('#search') // click on search bar (because this is not part of the shadow dom)
      .waitForElementVisible('#showReimbursed', 30000) // wait for search bar to load
      .click('#showReimbursed') // set filter to active expenses
      .waitForElementVisible('#delete', 30000) // wait for an element to be in the table
      .assert.attributeEquals('#delete', 'disabled', 'true'); // ensure that the delete button on a reimbursed expense is disabled
  });
});
