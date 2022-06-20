describe('testing links', () => {
  before((browser) => {
    browser
      .url('http://localhost:8080')
      .waitForElementVisible('#custom-button-color', 30000) // wait for login button to load
      .click('#custom-button-color') // click that button
      .waitForElementVisible('img.auth0-lock-header-logo', 30000) // check that the case logo is there in auth0
      .waitForElementVisible('div.auth0-lock-content', 30000) // check that the auth0 login button is visible
      .click('div.auth0-lock-social-button-text') // click the button
      .waitForElementVisible('input#identifierId', 30000) // wait for email box to be visible
      .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL) // input your email
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('#password', 30000) // wait for password field to load
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
      .waitForElementVisible('#employeesSearch', 30000) // ----- PERSONAL SECTION ----- //
      .click('#employeesSearch') // clicks search bar to get rid of full nav bar view
      .waitForElementVisible('#createEmployeeBtn', 30000)
      .click('#createEmployeeBtn')
      .waitForElementVisible('#employeeFirstName', 30000)
      .setValue('#employeeFirstName', 'Nightwatch1')
      .waitForElementVisible('#employeeLastName', 30000)
      .setValue('#employeeLastName', 'Tester')
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
      .click('#employeeEmail') // click email to get rid of job role dropdown
      .waitForElementVisible('#agencyIdentificationNumber', 30000)
      .setValue('#agencyIdentificationNumber', 'A45T98')
      .waitForElementVisible('#employeeHireDateField', 30000)
      .setValue('#employeeHireDateField', '06/22/2021')
      .waitForElementVisible('#contractsTab', 30000) // ----- CONTRACTS SECTION ----- //
      .click('#contractsTab')
      .waitForElementVisible('#addContractButton', 30000)
      .click('#addContractButton')
      .waitForElementVisible('#employeePrime', 30000)
      .setValue('#employeePrime', "'Murica")
      .click('#employeeEmail') // click email to get rid of prime dropdown
      .waitForElementVisible('#employeeContract', 30000)
      .setValue('#employeeContract', 'Something Classified')
      .click('#employeeEmail') // click email to get rid of contract dropdown

      .waitForElementVisible('#employeeSubmitBtn', 30000)
      .click('#employeeSubmitBtn') // submit employee
      .waitForElementVisible('#submitYesBtn', 30000)
      .click('#submitYesBtn') // click yes to confirm
      .waitForElementVisible('#employeeName', 30000)
      .assert.containsText('#employeeName', 'Nightwatch1 Tester'); // name in the employee profile
  });

  it('Test ensuring middle name does not render when not filled out', (browser) => {
    browser.assert.containsText('#full-name', 'Full Name: Nightwatch1 Tester');
  });

  it('Test deleting an employee', (browser) => {
    browser
      .waitForElementVisible('#backToEmployeesBtn', 30000)
      .click('#backToEmployeesBtn')
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
