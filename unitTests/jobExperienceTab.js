describe('testing sign-in', () => {
  before((browser) => {
    browser
      .url('http://localhost:8080')
      .windowMaximize('current') // maximize window
      .waitForElementVisible('#custom-button-color', 30000) // wait for login button to load
      .pause(500)
      .click('#custom-button-color') // click that button
      .waitForElementVisible('img.auth0-lock-header-logo', 30000) // check that the case logo is there in auth0
      .waitForElementVisible('div.auth0-lock-content', 30000) // check that the auth0 login button is visible
      .pause(500)
      .click('div.auth0-lock-social-button-text') // click the button
      .waitForElementVisible('input#identifierId', 30000) // wait for email box to be visible
      .pause(500)
      .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL) // input your email
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('#password', 30000) // wait for password field to load
      .pause(500)
      .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('h1.d-inline', 30000); // wait for header text 'Case Portal'
  });

  this.tags = ['job'];

  it('Test navigating to editing the job experience tab', (browser) => {
    browser
      .waitForElementVisible('#mdi-account-group')
      .click('#mdi-account-group') //goes to employees page
      .waitForElementVisible('#employeesSearch')
      .click('#employeesSearch')
      .setValue('#employeesSearch', 'owl')
      .waitForElementVisible('tbody')
      .pause(3000)
      .click('tbody > tr') //selects user test new person
      .useXpath()
      .waitForElementVisible("//a[text()='Job Experience']", 30000)
      .click("//a[text()='Job Experience']")
      .useCss()
      .waitForElementVisible('#edit', 30000)
      .click('#edit'); //ends at the job form
  });

  it('Test adding jobs and positions', (browser) => {
    browser
      .waitForElementVisible('#add-job', 30000)
      .click('#add-job')
      .click('#add-job')
      .waitForElementVisible('#add-pos-0', 30000)
      .click('#add-pos-0')
      .waitForElementVisible('#comp-0', 30000) //first job, first position
      .click('#comp-0')
      .setValue('#comp-0', 'test inc')
      .waitForElementVisible('#pos-field-0-0', 30000)
      .click('#pos-field-0-0')
      .setValue('#pos-field-0-0', 'test1')
      .waitForElementVisible('#start-field-0-0')
      .click('#start-field-0-0')
      .setValue('#start-field-0-0', '12/2019')
      .waitForElementVisible('#end-field-0-0')
      .click('#end-field-0-0')
      .setValue('#end-field-0-0', '12/2020')
      .waitForElementVisible('#pos-field-0-1') //first job, second position
      .click('#pos-field-0-1')
      .setValue('#pos-field-0-1', 'test2')
      .waitForElementVisible('#start-field-0-1')
      .click('#start-field-0-1')
      .setValue('#start-field-0-1', '12/2018')
      .waitForElementVisible('#end-field-0-1')
      .click('#end-field-0-1')
      .setValue('#end-field-0-1', '12/2019')
      .waitForElementVisible('#comp-1') //second job, first position
      .click('#comp-1')
      .setValue('#comp-1', 'test co')
      .waitForElementVisible('#pos-field-1-0')
      .click('#pos-field-1-0')
      .setValue('#pos-field-1-0', 'test1')
      .waitForElementVisible('#start-field-1-0')
      .click('#start-field-1-0')
      .setValue('#start-field-1-0', '12/2016')
      .waitForElementVisible('#end-field-1-0')
      .click('#end-field-1-0')
      .setValue('#end-field-1-0', '12/2017')
      .click('#employeeSubmitBtn')
      .useXpath()
      .assert.visible("//*[contains(text(),'test1')]")
      .useCss();
  });

  it('testing deleting created jobs', (browser) => {
    browser
      .waitForElementVisible('#edit')
      .click('#edit') //ends at the job form
      .waitForElementVisible('.notranslate')
      .click('#delete-company') //clicks the delete icon
      .click('#delete-company') //clicks the delete icon
      .click('#employeeSubmitBtn');
  });
});
