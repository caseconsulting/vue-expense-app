describe('testing links', () => {
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

  this.tags = ['users'];

  it('Test clicking on Employee in nav bar', (browser) => {
    browser.waitForElementVisible('#mdi-account-group', 30000).click('#mdi-account-group'); // clicks the Employees button in nav bar
  });

  it('Test creating an employee', (browser) => {
    browser
      .waitForElementVisible('#employeesSearch', 30000)
      .click('#employeesSearch') // clicks search bar to get rid of full nav bar view
      .waitForElementVisible('#createEmployeeBtn', 30000)
      .click('#createEmployeeBtn')
      .waitForElementVisible('#employeeFirstName', 30000)
      .setValue('#employeeFirstName', 'Nightwatch1')
      .waitForElementVisible('#employeeLastName', 30000)
      .setValue('#employeeLastName', 'Tester')
      .execute('document.getElementById("employeeMiddleBox").click()') // select no middle name
      .waitForElementVisible('#employeeNickname', 30000)
      .setValue('#employeeNickname', 'Jeff')
      .waitForElementVisible('#employeeNumber', 30000)
      .setValue('#employeeNumber', '9797979797')
      .waitForElementVisible('#employeeEmail', 30000)
      .setValue('#employeeEmail', ['', [browser.Keys.CONTROL, 'a']]) // highlights value in field
      .keys('\uE017') // delete field using delete key
      .setValue('#employeeEmail', 'nightwatch')
      .waitForElementVisible('#employeeJobRole', 30000)
      .setValue('#employeeJobRole', 'Software Developer')
      // .click('#employeeEmail') // click email to get rid of job role dropdown
      .waitForElementVisible('#agencyIdentificationNumber', 30000)
      .setValue('#agencyIdentificationNumber', 'A45T98')
      .waitForElementVisible('#employeeHireDateField', 30000)
      .setValue('#employeeHireDateField', '06/22/2021')
      .getLocationInView('#employeeSubmitBtn')
      .waitForElementVisible('#employeeSubmitBtn', 30000)
      .click('#employeeSubmitBtn') // submit employee
      .waitForElementVisible('#employeeName', 30000)
      .assert.containsText('#employeeName', 'Nightwatch1 Tester'); // name in the employee profile
  });

  it('Test ensuring middle name does not render when not filled out', (browser) => {
    browser.assert.containsText('#full-name', 'Full Name: Nightwatch1 Tester');
  });

  it('Test deleting an employee', (browser) => {
    browser
      .waitForElementVisible('#backBtn', 30000)
      .click('#backBtn')
      .waitForElementVisible('#employeesSearch', 30000)
      .click('#employeesSearch')
      .setValue('#employeesSearch', 'Nightwatch1') // filter out all other employees
      .waitForElementVisible('#employeesDeleteBtn', 30000)
      .click('#employeesDeleteBtn') // clicks the trash icon
      .waitForElementVisible('#confirmDelete', 30000)
      .click('#confirmDelete') // selects the delete button in the pop-up
      .waitForElementVisible('span.headline', 30000) // waits for delete modal to appear
      .assert.containsText('span.headline', 'Employee was successfully deleted!'); // confirms the text for deleting employee
  });
});
