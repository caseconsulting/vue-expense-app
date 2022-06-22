const auth = require('./utils/login.js');
const vars = require('./utils/constants.js');

describe('delete riembursed expense', () => {
  before((browser) => {
    browser.windowMaximize('current');
    browser.url(vars.URL);
    auth.login(browser);
  });

  this.tags = ['deleteReimbursedExpense'];

  it('Test clicking on My Expenses in nav bar', (browser) => {
    browser
      .waitForElementVisible('#mdi-currency-usd', 30000)
      .click('#mdi-currency-usd')
      .useXpath()
      .waitForElementVisible("//*[contains(text(),'My Expenses')]", 30000)
      .click("//*[contains(text(),'My Expenses')]")
      .useCss();
  });

  it('Test setting filters for expenses', (browser) => {
    browser
      .waitForElementVisible('#search', 30000) // wait for search bar to load
      .pause(500)
      .click('#search') // click on search bar (because this is not part of the shadow dom)
      .waitForElementVisible('#showReimbursed', 30000) // wait for search bar to load
      .click('#showReimbursed') // set filter to active expenses
      .waitForElementVisible('#delete', 30000) // wait for an element to be in the table
      .assert.attributeEquals('#delete', 'disabled', 'true'); // ensure that the delete button on a reimbursed expense is disabled
  });
});
