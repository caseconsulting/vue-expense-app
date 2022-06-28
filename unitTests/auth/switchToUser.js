describe('testing logout from home page', () => {
  before((browser) => {
    browser
      .url('http://localhost:8080')
      .windowMaximize('current') // maximize window
      .waitForElementVisible('#custom-button-color', 30000) // wait for login button to load
      .pause(500)
      .click('#custom-button-color') // click that button
      .waitForElementVisible('img.auth0-lock-header-logo') // check that the case logo is there in auth0
      .waitForElementVisible('div.auth0-lock-content') // check that the auth0 login button is visible
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

  this.tags = ['switchToUser'];

  it('Clicking switch to user', (browser) => {
    browser
      .waitForElementVisible('#profile', 30000)
      .click('#profile')
      .waitForElementVisible('#switchRoleBtn', 30000)
      .click('#switchRoleBtn')
      .waitForElementVisible('.headline', 30000)
      .execute('document.getElementById("userSelector").click()')
      .waitForElementVisible('#confirmSwitch', 30000)
      .click('#confirmSwitch');
  });

  it('Verify user home page', (browser) => {
    browser.waitForElementVisible('#home-greeting', 30000); // look for Hello message
  });
});
