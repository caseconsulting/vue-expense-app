describe('testing sign-in', () => {
    before(browser => {
        browser.url('http://localhost:8080');
    });

    test('Test load of Oauth sign in page and its elements', browser => {
        browser
            .assert.visible('.case_logo') // main case logo
            .assert.visible('#custom-button-color') // button to log in
            .assert.visible('h1.d-inline') // text for case
            .assert.visible('h1.my-4') // case portal text in middle of page
            .assert.visible('img.logo-bar'); // Logo on the top bar
    });

    test('Test redirect to Oauth Signin and then app', browser => {
        browser
            .waitForElementVisible('#custom-button-color')
            .click('#custom-button-color')
            .assert.visible('img.auth0-lock-header-logo')
            .assert.visible('div.auth0-lock-content')
            .click('div.auth0-lock-social-button-text')
            .waitForElementVisible('input#identifierId')
            .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL)
            .click('div.VfPpkd-RLmnJb')
            .waitForElementVisible('#password')
            .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD)
            .click('div.VfPpkd-RLmnJb')
            .waitForElementVisible('h1.d-inline'); // header text 'Case Portal'
    });
});