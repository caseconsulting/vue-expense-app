describe('testing logout from home page', () => {
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
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('h1.d-inline'); // wait for header text 'Case Portal'
  });

  this.tags = ['logout'];

  it('Test clicking on Home in nav bar', (browser) => {
    browser.waitForElementVisible('#home').click('#home'); //go to home page
  });

  it('Logging out', (browser) => {
    browser
      .waitForElementVisible('#profile')
      .click('#profile') //hover over the profile icon
      .waitForElementVisible('#logoutBtn')
      .click('#logoutBtn') //click on the logout button
      .waitForElementVisible('#caseLogo') //check if we're at the login page by checking if it has the logo
      .waitForElementVisible('#custom-button-color'); //check if we're at the login page by checking if it has the login button
  });
});
