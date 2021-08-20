describe('testing sign-in', () => {
    before((browser) => {
      browser.url('http://localhost:8080');
      browser.windowMaximize('current'); // maximize window
    });
  
    this.tags = ['job'];
  
    it('Test redirect to Oauth Signin and then app', (browser) => {
      browser
        .waitForElementVisible('#custom-button-color') // wait for login button to load
        .click('#custom-button-color') // click that button
        .assert.visible('img.auth0-lock-header-logo') // check that the case logo is there in auth0
        .assert.visible('div.auth0-lock-content') // check that the auth0 login button is visible
        .click('div.auth0-lock-social-button-text') // click the button
        .waitForElementVisible('input#identifierId') // wait for email box to be visible
        .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL) // input your email
        .click('button.VfPpkd-LgbsSe') // click continue button
        .waitForElementVisible('#password', 7500) // wait for password field to load
        .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
        .click('button.VfPpkd-LgbsSe') // click login button
        .waitForElementVisible('h1.d-inline'); // wait for header text 'Case Portal'
    });

    it('Test navigating to editing the job experience tab', (browser) => {
        browser
            .waitForElementVisible('#users')
            .click('#users') //goes to employees page
            .waitForElementVisible('#employeesSearch')
            .click('#employeesSearch')
            .setValue('#employeesSearch', 'person')
            .waitForElementVisible('tbody') //selects user test new person
            .click("tbody")
            .useXpath()
            .waitForElementVisible("//a[text()='Job Experience']")
            .click("//a[text()='Job Experience']")
            .useCss()
            .waitForElementVisible('#edit')
            .click('#edit') //ends at the job form
    });

    it('Test adding jobs and positions', (browser) => {
        browser
            .waitForElementVisible('#add-job')
            .click('#add-job')
            .click('#add-job')
            .waitForElementVisible('#add-pos-0')
            .click('#add-pos-0')
            .waitForElementVisible('#comp-0') //first job, first position
            .click('#comp-0')
            .setValue('#comp-0', 'test inc')
            .waitForElementVisible('#pos-field-0-0')
            .click('#pos-field-0-0')
            .setValue('#pos-field-0-0', 'test1')
            .waitForElementVisible('#start-field-0-0')
            .click('#start-field-0-0')
            .setValue('#start-field-0-0', '12/25/2019')
            .waitForElementVisible('#end-field-0-0')
            .click('#end-field-0-0')
            .setValue('#end-field-0-0', '12/25/2020')
            .waitForElementVisible('#pos-field-0-1' )//first job, second position
            .click('#pos-field-0-1')
            .setValue('#pos-field-0-1', 'test2')
            .waitForElementVisible('#start-field-0-1')
            .click('#start-field-0-1')
            .setValue('#start-field-0-1', '12/25/2018')
            .waitForElementVisible('#end-field-0-1')
            .click('#end-field-0-1')
            .setValue('#end-field-0-1', '12/25/2019')
            .waitForElementVisible('#comp-1') //second job, first position
            .click('#comp-1')
            .setValue('#comp-1', 'test co')
            .waitForElementVisible('#pos-field-1-0')
            .click('#pos-field-1-0')
            .setValue('#pos-field-1-0', 'test1')
            .waitForElementVisible('#start-field-1-0')
            .click('#start-field-1-0')
            .setValue('#start-field-1-0', '12/25/2016')
            .waitForElementVisible('#end-field-1-0')
            .click('#end-field-1-0')
            .setValue('#end-field-1-0', '12/25/2017')
            .click('#employeeSubmitBtn')
            .waitForElementVisible('#submitYesBtn')
            .click('#submitYesBtn')
            .useXpath()
            .assert.visible("//*[contains(text(),'test1')]") 
            .useCss()
    });

    it('testing deleting created jobs', (browser) => {
        browser
            .waitForElementVisible('#edit')
            .click('#edit') //ends at the job form
            .waitForElementVisible('.notranslate')
            .useXpath()
            .click('//button[contains(@class,"notranslate")][1]') //clicks the delete icon
            .click('//button[contains(@class,"notranslate")][1]')
            .useCss()
            .click('#employeeSubmitBtn')
            .waitForElementVisible('#submitYesBtn')
            .click('#submitYesBtn')
    })
});