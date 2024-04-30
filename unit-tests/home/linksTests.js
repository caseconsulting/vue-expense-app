import utils from '../utils/utils.js';
import vars from '../utils/constants.js';

describe('testing links', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['links'];

  it('Test Link for basecamp in dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME) //waiting for Link dropdown button to render
      .click('#links-btn')
      .waitForElementVisible('a[id="https://3.basecamp.com/3097063"]', vars.WAIT_TIME)
      .click('a[id="https://3.basecamp.com/3097063"]') //clicks Basecamp link
      .windowHandles(function (result) {
        //switches window
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://launchpad.37signals.com/bc3/3078589/signin');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for Fidelity in dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://nb.fidelity.com/public/nb/default/home"]', vars.WAIT_TIME)
      .click('a[id="https://nb.fidelity.com/public/nb/default/home"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://nb.fidelity.com/public/nb/default/home');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for health insurance dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#links-btn')
      .waitForElementVisible(
        'a[id="https://3.basecamp.com/3097063/buckets/179119/messages/4799723388"]',
        vars.WAIT_TIME
      )
      .click('a[id="https://3.basecamp.com/3097063/buckets/179119/messages/4799723388"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://launchpad.37signals.com/bc3/3078589/signin');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for QuickBooks Time dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://tsheets.intuit.com/page/login_oii"]', vars.WAIT_TIME)
      .click('a[id="https://tsheets.intuit.com/page/login_oii"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://tsheets.intuit.com/page/login_oii');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      })
      .pause(400);
  });

  it('Test Link for ADP dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://my.adp.com/"]', vars.WAIT_TIME)
      .click('a[id="https://my.adp.com/"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals(
          'https://online.adp.com/signin/v1/?APPID=RDBX&productId=80e309c3-70c6-bae1-e053-3505430b5495&returnURL=https://my.adp.com/&callingAppId=RDBX&TARGET=-SM-https://my.adp.com/static/redbox/'
        );
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      })
      .pause(400);
  });

  it('Test Link for Life Insurance dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://www.reliancestandard.com/home/"]', vars.WAIT_TIME)
      .click('a[id="https://www.reliancestandard.com/home/"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://www.reliancestandard.com/home/');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for Red Mine dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://redmine.consultwithcase.com"]', vars.WAIT_TIME)
      .click('a[id="https://redmine.consultwithcase.com"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals(
          'https://redmine.consultwithcase.com/login?back_url=https%3A%2F%2Fredmine.consultwithcase.com%2F'
        );
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for Workspaces at Reston Town Center dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#links-btn')
      .waitForElementVisible('#floorPlan', vars.WAIT_TIME)
      .click('#floorPlan')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('http://localhost:8080/img/MakeOfficesfloorplan.14b8e1a3.jpg');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for GitHub', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#Github')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://github.com/caseconsulting');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for LinkedIn', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#LinkedIn')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlContains('case-consulting-inc');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for Youtube', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#Youtube')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlContains('https://www.youtube.com/channel/UC_oJY4OrOpLNrIBAN7Y-9fA');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for Twitter', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#Twitter')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://twitter.com/consultwithcase?lang=en');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });

  it('Test Link for Facebook', (browser) => {
    browser
      .waitForElementVisible('#links-btn', vars.WAIT_TIME)
      .click('#Facebook')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://www.facebook.com/ConsultwithCase/');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        utils.navigate(browser, vars.nav.home, false);
      });
  });
});
