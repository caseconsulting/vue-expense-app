describe('testing links', () => {
  before((browser) => {
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
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('#password') // wait for password field to load
      .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD) // input your password
      .keys(browser.Keys.ENTER) // click continue button
      .waitForElementVisible('h1.d-inline'); // wait for header text 'Case Portal'
  });

  this.tags = ['users'];

  it('Test clicking on Employee in nav bar', (browser) => {
    browser.waitForElementVisible('#users').click('#users'); // clicks the Employees button in nav bar
  });

  it('Test creating an employee', (browser) => {
    browser
      .waitForElementVisible('#employeesSearch')
      .click('#employeesSearch') // clicks search bar to get rid of full nav bar view
      .waitForElementVisible('#createEmployeeBtn')
      .click('#createEmployeeBtn')
      .waitForElementVisible('#employeeFirstName')
      .setValue('#employeeFirstName', 'Nightwatch1')
      .waitForElementVisible('#employeeLastName')
      .setValue('#employeeLastName', 'Tester')
      .waitForElementVisible('#employeeNickname')
      .setValue('#employeeNickname', 'Jeff')
      .waitForElementVisible('#employeeNumber')
      .setValue('#employeeNumber', '9797979797')
      .waitForElementVisible('#employeeEmail')
      .setValue('#employeeEmail', ['', [browser.Keys.CONTROL, 'a']]) // highlights value in field
      .keys('\uE017') // delete field using delete key
      .setValue('#employeeEmail', 'nightwatch@consultwithcase.com')
      .waitForElementVisible('#employeePrime')
      .setValue('#employeePrime', "'Murica")
      .click('#employeeEmail') // click email to get rid of prime dropdown
      .waitForElementVisible('#employeeContract')
      .setValue('#employeeContract', 'Something Classified')
      .click('#employeeEmail') // click email to get rid of contract dropdown
      .waitForElementVisible('#employeeJobRole')
      .setValue('#employeeJobRole', 'Software Developer')
      .click('#employeeEmail') // click email to get rid of job role dropdown
      .waitForElementVisible('#employeeHireDateField')
      .setValue('#employeeHireDateField', '06/22/2021')
      .waitForElementVisible('#employeeSubmitBtn')
      .click('#employeeSubmitBtn') // submit employee
      .waitForElementVisible('#submitYesBtn')
      .click('#submitYesBtn') // click yes to confirm
      .waitForElementVisible('#employeeName')
      .assert.containsText('#employeeName', 'Nightwatch1 Tester'); // name in the employee profile
  });

  it('Test ensuring middle name does not render when not filled out', (browser) => {
    browser.assert.containsText('#full-name', 'Full Name: Nightwatch1 Tester');
  });

  it('Test deleting an employee', (browser) => {
    browser
      .waitForElementVisible('#backToEmployeesBtn')
      .click('#backToEmployeesBtn')
      .waitForElementVisible('#employeesSearch')
      .click('#employeesSearch')
      .setValue('#employeesSearch', 'Nightwatch1') // filter out all other employees
      .waitForElementVisible('#employeesDeleteBtn')
      .click('#employeesDeleteBtn') // clicks the trash icon
      .waitForElementVisible('#confirmDelete')
      .click('#confirmDelete') // selects the delete button in the pop-up
      .waitForElementVisible('span.headline') // waits for delete modal to appear
      .assert.containsText('span.headline', 'Employee was successfully deleted!'); // confirms the text for deleting employee
  });
});
