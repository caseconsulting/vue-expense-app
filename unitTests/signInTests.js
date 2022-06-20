describe('testing sign-in', () => {
  before((browser) => {
    browser.url('http://localhost:8080');
    browser.windowMaximize('current'); // maximize window
  });

  this.tags = ['sign-in'];

  it('Test load of Oauth sign in page and its elements', (browser) => {
    browser.assert
      .visible('.case_logo') // main case logo
      .assert.visible('#custom-button-color') // button to log in
      .assert.visible('h1.d-inline') // text for case
      .assert.visible('h1.my-4') // case portal text in middle of page
      .assert.visible('img.logo-bar'); // Logo on the top bar
  });

  it('Test redirect to Oauth Signin and then app', (browser) => {
    browser
      .waitForElementVisible('#custom-button-color', 30000) // wait for login button to load
      .click('#custom-button-color') // click that button
      .assert.visible('img.auth0-lock-header-logo') // check that the case logo is there in auth0
      .assert.visible('div.auth0-lock-content') // check that the auth0 login button is visible
      .pause(1000)
      .click('div.auth0-lock-social-button-text') // click the button
      .waitForElementVisible('input#identifierId', 30000) // wait for email box to be visible
      .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL) // input your email
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('#password', 30000) // wait for password field to load
      .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
      .keys(browser.Keys.ENTER) // click login button
      .waitForElementVisible('h1.d-inline', 30000); // wait for header text 'Case Portal'
  });

  it('Test home page loaded after sign-in for users', (browser) => {
    browser
      .waitForElementVisible('#home-greeting', 30000)
      .assert.urlEquals('http://localhost:8080/home')
      .assert.visible('#home-greeting')
      .assert.visible('#t-sheets-data')
      .assert.visible('#home-available-budgets')
      .assert.visible('#home-anniversary')
      .assert.visible('#home-activity-feed')
      .assert.visible('#home-twitter-feed');
  });
});
