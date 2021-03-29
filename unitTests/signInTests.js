describe('testing sign-in', () => {
    before(browser => {
        browser.url('http://localhost:8080');
    });

    test('Test load of Oauth sign in page and its elements', browser => {
        browser
            .assert.visible('.case_logo')
            .assert.visible('#custom-button-color')
            .assert.visible('h1.d-inline')
            .assert.visible('h1.my-4')
            .assert.visible('img.logo-bar');
    });

    test('Test redirect to Oath Signin and then app', browser => {
        browser
            .waitForElementVisible('#custom-button-color')
            .click('#custom-button-color')
            .assert.visible('img.auth0-lock-header-logo')
            .assert.visible('div.auth0-lock-content')
            .click('div.auth0-lock-social-button-text')
            .waitForElementVisible('input#identifierId')
            .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL)
            .click('#identifierNext > div > button')
            .waitForElementVisible('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input')
            .setValue('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input', process.env.VUE_APP_AUTH0_PASSWORD)
            .click('#passwordNext > div > button > div.VfPpkd-RLmnJb')
            .waitForElementVisible('#app > div > header > div > div.v-toolbar__title > h1');
    });
});