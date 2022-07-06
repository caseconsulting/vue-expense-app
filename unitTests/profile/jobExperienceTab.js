const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');

describe('testing sign-in', () => {
  before((browser) => {
    browser.windowMaximize('current');
    browser.url(vars.URL);
    utils.login(browser);
  });

  this.tags = ['job'];

  it('Test navigating to editing the job experience tab', (browser) => {
    utils.navigate(browser, vars.nav.employees);
    browser
      .waitForElementVisible('#employeesSearch')
      .click('#employeesSearch')
      .setValue('#employeesSearch', vars.tester.nickName)
      .waitForElementVisible('tbody > tr', vars.WAIT_TIME)
      .pause(vars.LONG_PAUSE)
      .click('tbody > tr') //selects user test new person
      .useXpath()
      .waitForElementVisible("//a[text()='Job Experience']", vars.WAIT_TIME)
      .click("//a[text()='Job Experience']")
      .useCss()
      .waitForElementVisible('#edit', vars.WAIT_TIME)
      .click('#edit'); //ends at the job form
  });

  it('Test adding jobs and positions', (browser) => {
    browser
      .waitForElementVisible('#add-job', vars.WAIT_TIME)
      .click('#add-job')
      .click('#add-job')
      .waitForElementVisible('#add-pos-0', vars.WAIT_TIME)
      .click('#add-pos-0')
      .waitForElementVisible('#comp-0', vars.WAIT_TIME) //first job, first position
      .click('#comp-0')
      .setValue('#comp-0', 'test inc')
      .waitForElementVisible('#pos-field-0-0', vars.WAIT_TIME)
      .click('#pos-field-0-0')
      .setValue('#pos-field-0-0', 'test1')
      .waitForElementVisible('#start-field-0-0')
      .click('#start-field-0-0')
      .setValue('#start-field-0-0', utils.date.yearsDiff(-3))
      .waitForElementVisible('#end-field-0-0')
      .click('#end-field-0-0')
      .setValue('#end-field-0-0', utils.date.yearsDiff(-2))
      .waitForElementVisible('#pos-field-0-1') //first job, second position
      .click('#pos-field-0-1')
      .setValue('#pos-field-0-1', 'test2')
      .waitForElementVisible('#start-field-0-1')
      .click('#start-field-0-1')
      .setValue('#start-field-0-1', utils.date.yearsDiff(-4))
      .waitForElementVisible('#end-field-0-1')
      .click('#end-field-0-1')
      .setValue('#end-field-0-1', utils.date.yearsDiff(-3))
      .waitForElementVisible('#comp-1') //second job, first position
      .click('#comp-1')
      .setValue('#comp-1', 'test co')
      .waitForElementVisible('#pos-field-1-0')
      .click('#pos-field-1-0')
      .setValue('#pos-field-1-0', 'test1')
      .waitForElementVisible('#start-field-1-0')
      .click('#start-field-1-0')
      .setValue('#start-field-1-0', utils.date.yearsDiff(-6))
      .waitForElementVisible('#end-field-1-0')
      .click('#end-field-1-0')
      .setValue('#end-field-1-0', utils.date.yearsDiff(-5))
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
