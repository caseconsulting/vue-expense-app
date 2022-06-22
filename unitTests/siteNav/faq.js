const auth = require('./utils/login.js');
const vars = require('./utils/constants.js');

describe('testing links', () => {
  before((browser) => {
    browser.windowMaximize('current');
    browser.url(vars.URL);
    auth.login(browser);
  });

  this.tags = ['faqPage'];

  it('Test clicking on Employee in nav bar', (browser) => {
    browser.waitForElementVisible('#mdi-account-group').click('#mdi-lifebuoy'); // clicks the Employees button in nav bar
  });

  it('Test clicking on Hours expansion panel', (browser) => {
    browser.waitForElementVisible('#help-title').click('#Hours').waitForElementVisible('#Hours-2');
  });
});
