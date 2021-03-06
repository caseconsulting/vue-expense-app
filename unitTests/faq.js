describe('testing links', () => {
    before(browser => {
        browser
            .url('http://localhost:8080')
            .windowMaximize('current') // maximize window
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

    this.tags = ['faq'];


    it('Test clicking on Employee in nav bar', (browser) => {
        browser
            .waitForElementVisible('#users')
            .click('#life-ring'); // clicks the Employees button in nav bar
    });

    it('Test clicking on Hours expansion panel', (browser) => {
        browser
            .waitForElementVisible('#help-title')
            .click('#Hours')
            .waitForElementVisible('#Hours-2');
    });
});
