describe('testing sign-in', () => {
  before((browser) => {
    browser.url('http://localhost:8080');
    browser.windowMaximize('current'); // maximize window
  });

  this.tags = ['training-test-link'];

  it('Test redirect to Oauth Signin and then app', (browser) => {
    browser
      .waitForElementVisible('#custom-button-color', 30000) // wait for login button to load
      .click('#custom-button-color') // click that button
      .assert.visible('img.auth0-lock-header-logo') // check that the case logo is there in auth0
      .assert.visible('div.auth0-lock-content') // check that the auth0 login button is visible
      .click('div.auth0-lock-social-button-text') // click the button
      .waitForElementVisible('input#identifierId', 30000) // wait for email box to be visible
      .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL) // input your email
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('#password', 30000) // wait for password field to load
      .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
      .keys(browser.Keys.ENTER) // click login button
      .waitForElementVisible('h1.d-inline', 30000); // wait for header text 'Case Portal'
  });

  it('Test navigate to Training', (browser) => {
    browser
      .waitForElementVisible('#mdi-fire')
      .click('#mdi-fire')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'https://vt.edu')]");
  });
});
