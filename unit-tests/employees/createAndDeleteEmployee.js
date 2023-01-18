const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');

describe('testing links', () => {
  // set vars to use throughout
  const newEmployee = {
    firstName: 'Hctawthgin',
    lastName: 'Retset',
    nickName: 'Jeff',
    fullRealName: 'Hctawthgin Retset',
    fullNickName: 'Jeff Retset',
    number: '9797979797',
    email: 'hretset',
    role: 'Software Developer',
    ain: 'A45T98'
  };

  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['createDeleteEmployee'];

  it('Test clicking on Employee in nav bar', (browser) => {
    utils.navigate(browser, vars.nav.employees);
  });

  it('Test creating an employee', (browser) => {
    browser
      .waitForElementVisible('#employeesSearch', vars.WAIT_TIME)
      .click('#employeesSearch') // clicks search bar to get rid of full nav bar view
      .waitForElementVisible('#createEmployeeBtn', vars.WAIT_TIME)
      .click('#createEmployeeBtn')
      .waitForElementVisible('#employeeFirstName', vars.WAIT_TIME)
      .setValue('#employeeFirstName', newEmployee.firstName)
      .waitForElementVisible('#employeeLastName', vars.WAIT_TIME)
      .setValue('#employeeLastName', newEmployee.lastName)
      .execute('document.getElementById("employeeMiddleBox").click()') // select no middle name
      .waitForElementVisible('#employeeNickname', vars.WAIT_TIME)
      .setValue('#employeeNickname', newEmployee.nickName)
      .waitForElementVisible('#employeeNumber', vars.WAIT_TIME)
      .setValue('#employeeNumber', newEmployee.number)
      .waitForElementVisible('#employeeEmail', vars.WAIT_TIME)
      .setValue('#employeeEmail', ['', [browser.Keys.CONTROL, 'a']]) // highlights value in field
      .keys('\uE017') // delete field using delete key
      .setValue('#employeeEmail', newEmployee.email)
      .waitForElementVisible('#employeeJobRole', vars.WAIT_TIME)
      .setValue('#employeeJobRole', newEmployee.role)
      .waitForElementVisible('#agencyIdentificationNumber', vars.WAIT_TIME)
      .setValue('#agencyIdentificationNumber', newEmployee.ain)
      .waitForElementVisible('#employeeHireDateField', vars.WAIT_TIME)
      .setValue('#employeeHireDateField', utils.date.yesterday())
      .getLocationInView('#employeeSubmitBtn')
      .waitForElementVisible('#employeeSubmitBtn', vars.WAIT_TIME)
      .click('#employeeSubmitBtn') // submit employee
      .waitForElementVisible('#employeeName', vars.WAIT_TIME)
      .assert.containsText('#employeeName', newEmployee.fullRealName); // name in the employee profile
  });

  it('Test ensuring middle name does not render when not filled out', (browser) => {
    browser.assert.containsText('#full-name', `Full Name: ${newEmployee.fullRealName}`);
  });

  it('Test deleting an employee', (browser) => {
    browser
      .waitForElementVisible('#backBtn', vars.WAIT_TIME)
      .click('#backBtn')
      .waitForElementVisible('#employeesSearch', vars.WAIT_TIME)
      .click('#employeesSearch')
      .setValue('#employeesSearch', newEmployee.firstName) // filter out all other employees
      .waitForElementVisible('#employeesDeleteBtn', vars.WAIT_TIME)
      .click('#employeesDeleteBtn') // clicks the trash icon
      .waitForElementVisible('#confirmDelete', vars.WAIT_TIME)
      .click('#confirmDelete') // selects the delete button in the pop-up
      .waitForElementVisible('span.headline', vars.WAIT_TIME) // waits for delete modal to appear
      .assert.containsText('span.headline', 'Employee was successfully deleted!'); // confirms the text for deleting employee
  });
});
