describe('testing sign-in', () => {
    before(browser => {
        browser.url('http://localhost:8080');
        browser.windowMaximize('current') // maximize window
    });

    this.tags = ['sign-in'];

    it('Test load of Oauth sign in page and its elements', browser => {
        browser
            .assert.visible('.case_logo') // main case logo
            .assert.visible('#custom-button-color') // button to log in
            .assert.visible('h1.d-inline') // text for case
            .assert.visible('h1.my-4') // case portal text in middle of page
            .assert.visible('img.logo-bar'); // Logo on the top bar
    });

    it('Test redirect to Oauth Signin and then app', browser => {
        browser
            .waitForElementVisible('#custom-button-color') // wait for login button to load
            .click('#custom-button-color') // click that button
            .assert.visible('img.auth0-lock-header-logo') // check that the case logo is there in auth0
            .assert.visible('div.auth0-lock-content') // check that the auth0 login button is visible
            .click('div.auth0-lock-social-button-text') // click the button
            .waitForElementVisible('input#identifierId') // wait for email box to be visible
            .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL) // input your email
            .click('button.VfPpkd-LgbsSe') // click continue button
            .waitForElementVisible('#password') // wait for password field to load
            .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
            .click('button.VfPpkd-LgbsSe') // click login button
            .waitForElementVisible('h1.d-inline'); // wait for header text 'Case Portal'
    });
});