describe('testing sign-in', () => {
  describe('testing sign-in', () => {
    before((browser) => {
      browser.url('http://localhost:8080');
      browser.windowMaximize('current'); // maximize window
      browser
        .waitForElementVisible('#custom-button-color', 30000) // wait for login button to load
        .pause(500)
        .click('#custom-button-color') // click that button
        .waitForElementVisible('img.auth0-lock-header-logo', 30000) // check that the case logo is there in auth0
        .waitForElementVisible('div.auth0-lock-content', 30000) // check that the auth0 login button is visible
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
  });

  this.tags = ['inactive'];

  it('Test clicking the inactive button and verifying the employees are red text', (browser) => {
    browser
      .waitForElementVisible('#mdi-account-group', 30000)
      .click('#mdi-account-group')
      .waitForElementVisible('#employeesSearch', 30000)
      .click('#employeesSearch')
      .waitForElementVisible('#inactive', 30000)
      .click('#inactive') //selects inactive
      .waitForElementVisible('#part', 30000)
      .click('#part') //deselects part time
      .waitForElementVisible('#full', 30000)
      .click('#full') //deselects full time
      .waitForElementVisible('.text-start p.inactiveStyle', 30000); //checks if the class used for inactive employees is present
  });
});
