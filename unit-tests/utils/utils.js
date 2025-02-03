import vars from './constants.js';
import dateUtils from '@/shared/dateUtils';

/**
 * Utilities for automation
 */

/**
 * executes the "before" stuff for you. purely convention.
 * @param browser - The browser object. Required.
 * @param after - Function to execute after common parts. Optional.
 */
function commonBefore(browser, after = null) {
  browser.windowMaximize('current');
  browser.url(vars.URL);
  login(browser);
  if (after != null) after();
} // commonBefore

/**
 * Date utilities
 */
function diff(num, type) {
  if (num < 0) return dateUtils.subtract(dateUtils.getTodaysDate(), -1 * num, type);
  else return dateUtils.add(dateUtils.getTodaysDate(), num, type);
}
const date = {
  // now
  today: (format = vars.DATE_FORMAT) => {
    return dateUtils.format(dateUtils.getTodaysDate(), null, format);
  },
  // days
  yesterday: (format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(-1, 'days'), null, format);
  },
  tomorrow: (format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(1, 'days'), null, format);
  },
  daysDiff: (num, format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(num, 'days'), null, format);
  },
  // months
  lastMonth: (format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(-1, 'months'), null, format);
  },
  nextMonth: (format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(1, 'months'), null, format);
  },
  monthsDiff: (num, format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(num, 'months'), null, format);
  },
  // years
  lastYear: (format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(-1, 'years'), null, format);
  },
  nextYear: (format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(1, 'years'), null, format);
  },
  yearsDiff: (num, format = vars.DATE_FORMAT) => {
    return dateUtils.format(diff(num, 'years'), null, format);
  }
};

/**
 * gets the name of the test user.
 * @param type - choose one of: "real", "nick", "full"
 * @return the test user's name in the given format
 */
function getName(type) {
  switch (type.substring(0, 4)) {
    case 'real':
      return `${vars.tester.firstName} ${vars.tester.lastName}`;
    case 'nick':
      return `${vars.tester.nickName || vars.tester.firstName} ${vars.tester.lastName}`;
    case 'full':
      return `${vars.tester.firstName} ${vars.tester.middleName} ${vars.tester.lastName}`;
    default:
      return `${vars.tester.nickName || vars.tester.firstName} ${vars.tester.lastName}`;
  }
} // getName

/**
 * login to Google with auth0
 * @param browser - The browser object. Required.
 * @param maxWindow - Whether or not to maximize the window. Default: true
 * @param username - Username/email to input at login. Default: VITE_AUTH0_EMAIL from env
 * @param password - Password to input at login. Default: VITE_AUTH0_PASSWORD from env
 */
function login(browser, username = null, password = null) {
  // get defaults for unset vars
  if (username) {
    username = username.toLowerCase();
    //sets the username to lower case to fix capital letters breaking email logins
  }
  username = username || vars.tester.username;
  password = password || vars.tester.password;

  // login sequence
  // pause() statements allow for the inputs to load in fully and consistently
  browser
    .waitForElementVisible('#custom-button-color', vars.WAIT_TIME) // login button
    .pause(vars.SMALL_PAUSE)
    .click('#custom-button-color') // click login button
    .waitForElementVisible('img.auth0-lock-header-logo', vars.WAIT_TIME) // case logo is in auth0
    .waitForElementVisible('div.auth0-lock-social-button-text:not([disabled])', 30000) // auth0 login button
    .pause(vars.SMALL_PAUSE)
    .click('div.auth0-lock-social-button-text:not([disabled])') // auth0 login button
    .waitForElementVisible('input#identifierId', vars.WAIT_TIME) // email field
    .pause(vars.SMALL_PAUSE)
    .setValue('input#identifierId', username) // email input
    .keys(browser.Keys.ENTER) // continue form
    .waitForElementVisible('#password', vars.WAIT_TIME) // password field
    .pause(vars.SMALL_PAUSE)
    .setValue('input[type="password"]', password) // password input
    .keys(browser.Keys.ENTER) // submit form
    .waitForElementVisible('#home', vars.WAIT_TIME); // header text 'CASE Portal'
} // login

/**
 * navigates to a given page. use the page object in constants.nav
 * @param browser - The browser object
 * @param location - Object of page to navigate to (ie: vars.nav.home)
 *                   For expense pages, use the expenses.__ object
 * @param manual - Set to false to use routing instead of manual clicking. Optional
 */
function navigate(browser, location, manual = true) {
  // do nonmanual first if possible (it is easier)
  if (!manual) {
    browser.url(`${vars.URL}/${location.route}`);
    return;
  }

  // special case for expense pages
  // this may be somewhat unreliable, which is why manual can be set to false
  const e = vars.nav.expenses;
  const expensePageTitles = [e.budgets.title, e.expenses.title, e.types.title, e.reimbursements.title];
  if (expensePageTitles.includes(location.title)) {
    browser
      .waitForElementVisible(vars.nav.expenses.icon, vars.WAIT_TIME)
      .click(vars.nav.expenses.icon)
      .useXpath()
      .waitForElementVisible(`//*[contains(text(),'${location.title}')]`, vars.WAIT_TIME)
      .click(`//*[contains(text(),'${location.title}')]`)
      .useCss();
    // close the expenses menu to avoid error if using this function twice
    browser.waitForElementVisible(vars.nav.expenses.icon, vars.WAIT_TIME).click(vars.nav.expenses.icon);
    return;
  }

  // default
  browser.waitForElementVisible(location.icon).click(location.icon);
}

// Export functions
module.exports = { commonBefore, date, getName, login, navigate };
