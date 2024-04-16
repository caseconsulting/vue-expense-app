import utils from '../utils/utils.js';
import vars from '../utils/constants.js';

describe('delete reimbursed expense', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['deleteReimbursedExpense'];

  it('Test clicking on My Expenses in nav bar', (browser) => {
    utils.navigate(browser, vars.nav.expenses.expenses);
  });

  it('Test setting filters for expenses', (browser) => {
    browser
      .waitForElementVisible('#search', vars.WAIT_TIME) // wait for search bar to load
      .pause(vars.SMALL_PAUSE)
      .click('#search') // click on search bar (because this is not part of the shadow dom)
      .waitForElementVisible('#showReimbursed', vars.WAIT_TIME) // wait for search bar to load
      .click('#showReimbursed') // set filter to active expenses
      .waitForElementVisible('#delete', vars.WAIT_TIME) // wait for an element to be in the table
      .assert.attributeEquals('#delete', 'disabled', 'true'); // ensure that the delete button on a reimbursed expense is disabled
  });
});
