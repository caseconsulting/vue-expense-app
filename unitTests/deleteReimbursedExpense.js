describe('delete riembursed expense', () => {
  before((browser) => {
    browser
      .url('http://localhost:8080')
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

  this.tags = ['deleteRiembursed'];

  it('Test clicking on My Expenses in nav bar', (browser) => {
    browser
      .waitForElementVisible('#dollar-sign')
      .click('#dollar-sign')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]")
      .click("//*[contains(text(),'My Expenses')]")
      .useCss();
  });

  it('Test setting filters for expenses', (browser) => {
    browser
      .waitForElementVisible('#search') // wait for search bar to load
      .click('#search') // click on search bar (because this is not part of the shadow dom)
      .useXpath()
      .click("//*[@id='app']/div[1]/main/div/div/div/div[2]/div/div/fieldset/div[1]/div/button[1]") // set filter to active expenses
      .click("//*[@id='app']/div[1]/main/div/div/div/div[2]/div/div/fieldset/div[2]/div/button[1]") // set filter to reimbursed expenses
      .useCss()
      .assert.attributeEquals('#delete', 'disabled', 'true'); // ensure that the delete button on a reimbursed expense is disabled
  });
});
