const auth = require('./utils/login.js');
const vars = require('./utils/constants.js');

describe('testing logout from home page', () => {
  before((browser) => {
    browser.windowMaximize('current');
    browser.url(vars.URL);
    auth.login(browser);
  });

  this.tags = ['logout'];

  it('Test clicking on Home in nav bar', (browser) => {
    browser.waitForElementVisible('#home', 30000).click('#home'); //go to home page
  });

  it('Logging out', (browser) => {
    browser
      .waitForElementVisible('#profile', 30000)
      .click('#profile') //hover over the profile icon
      .waitForElementVisible('#logoutBtn', 30000)
      .click('#logoutBtn') //click on the logout button
      .waitForElementVisible('#caseLogo', 30000) //check if we're at the login page by checking if it has the logo
      .waitForElementVisible('#custom-button-color', 30000); //check if we're at the login page by checking if it has the login button
  });
});
