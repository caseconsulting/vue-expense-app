import utils from '../utils/utils.js';
import vars from '../utils/constants.js';

describe('testing links', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['faqPage'];

  it('Test clicking on Employee in nav bar', (browser) => {
    utils.navigate(browser, vars.nav.help);
  });

  it('Test clicking on Hours expansion panel', (browser) => {
    browser
      .waitForElementVisible('#help-title', vars.WAIT_TIME)
      .click('#Hours')
      .waitForElementVisible('#Hours-2', vars.WAIT_TIME);
  });
});
