const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');

describe('testing logout from home page', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['logout'];

  it('Test clicking on Home in nav bar', (browser) => {
    utils.navigate(browser, vars.nav.home);
  });

  it('Logging out', (browser) => {
    browser
      .waitForElementVisible('#profile', vars.WAIT_TIME)
      .click('#profile') //hover over the profile icon
      .waitForElementVisible('#logoutBtn', vars.WAIT_TIME)
      .click('#logoutBtn') //click on the logout button
      .waitForElementVisible('#caseLogo', vars.WAIT_TIME) //check if we're at the login page by checking if it has the logo
      .waitForElementVisible('#custom-button-color', vars.WAIT_TIME); //check if we're at the login page by checking if it has the login button
  });
});
