const auth = require('./utils/login.js');
const vars = require('./utils/constants.js');

describe('testing sign-in', () => {
  before((browser) => {
    browser.windowMaximize('current');
    browser.url(vars.URL);
    auth.login(browser);
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
