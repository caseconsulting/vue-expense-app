/**
 * login to Google with auth0
 * @param browser - The browser object. Required.
 * @param maxWindow - Whether or not to maximize the window. Default: true
 * @param username - Username/email to input at login. Default: VUE_APP_AUTH0_EMAIL from env
 * @param password - Password to input at login. Default: VUE_APP_AUTH0_PASSWORD from env
 */
function login(browser, username = null, password = null) {
  // get defaults for unset vars
  username = username || process.env.VUE_APP_AUTH0_EMAIL;
  password = password || process.env.VUE_APP_AUTH0_PASSWORD;

  // login sequence
  // pause() statements allow for the inputs to load in fully and consistently
  browser
    .waitForElementVisible('#custom-button-color', 30000) // login button
    .pause(500)
    .click('#custom-button-color') // click login button
    .waitForElementVisible('img.auth0-lock-header-logo', 30000) // case logo is in auth0
    .waitForElementVisible('div.auth0-lock-social-button-text:not([disabled])', 30000) // auth0 login button
    .pause(500)
    .click('div.auth0-lock-social-button-text:not([disabled])') // auth0 login button
    .waitForElementVisible('input#identifierId', 30000) // email field
    .pause(500)
    .setValue('input#identifierId', username) // email input
    .keys(browser.Keys.ENTER) // continue form
    .waitForElementVisible('#password', 30000) // password field
    .pause(500)
    .setValue('input[type="password"]', password) // password input
    .keys(browser.Keys.ENTER) // submit form
    .waitForElementVisible('#home', 30000); // header text 'Case Portal'
} // login

// Export functions
exports = { login };
