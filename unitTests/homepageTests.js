describe('Testing the homepage', () => {
    before(browser => {
        browser.url(' http://localhost:8080');
    });

    test('checking if this will work', browser => {
        browser
            .waitForElementVisible('#custom-button-color')
            .click('#custom-button-color')
            .waitForElementVisible('div.auth0-lock-content')
            .waitForElementVisible('div.auth0-lock-social-button-text')
            .click('div.auth0-lock-social-button-text')
            .assert.visible('input#identifierId')
            .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL)
            .click('#identifierNext > div > button')
            .waitForElementVisible('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input')
            .setValue('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input', process.env.VUE_APP_AUTH0_PASSWORD)
            .click('#passwordNext > div > button > div.VfPpkd-RLmnJb')
            .waitForElementVisible('#app > div > header > div > div.v-toolbar__title > h1')
            .assert.urlEquals('http://localhost:8080/reimbursements');

            // browser
            //     .perform(() => {
            //         console.info('uhhhh');
            //      })
            //     .pause(10000000);
            
    });

    test('checking to see if you have to navigate every time', browser => {
        browser
            .assert.urlEquals('http://localhost:8080/reimbursements')
    });
});