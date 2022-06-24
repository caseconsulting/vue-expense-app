describe('testing links', () => {
  before((browser) => {
    browser
      .url('http://localhost:8080')
      .windowMaximize('current') // maximize window
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

  this.tags = ['links'];

  it('Test Link for basecamp in dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000) //waiting for Link dropdown button to render
      .click('#links-btn')
      .waitForElementVisible('a[id="https://3.basecamp.com/3097063"]', 30000)
      .click('a[id="https://3.basecamp.com/3097063"]') //clicks Basecamp link
      .windowHandles(function (result) {
        //switches window
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://launchpad.37signals.com/bc3/3078589/signin');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for Fidelity in dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://nb.fidelity.com/public/nb/default/home"]', 30000)
      .click('a[id="https://nb.fidelity.com/public/nb/default/home"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://nb.fidelity.com/public/nb/default/home');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for health insurance dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://3.basecamp.com/3097063/buckets/179119/messages/4799723388"]', 30000)
      .click('a[id="https://3.basecamp.com/3097063/buckets/179119/messages/4799723388"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://launchpad.37signals.com/bc3/3078589/signin');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for QuickBooks Time dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://tsheets.intuit.com/page/login_oii"]', 30000)
      .click('a[id="https://tsheets.intuit.com/page/login_oii"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://tsheets.intuit.com/page/login_oii');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      })
      .pause(400);
  });

  it('Test Link for ADP dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://my.adp.com/"]', 30000)
      .click('a[id="https://my.adp.com/"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals(
          'https://online.adp.com/signin/v1/?APPID=RDBX&productId=80e309c3-70c6-bae1-e053-3505430b5495&returnURL=https://my.adp.com/&callingAppId=RDBX&TARGET=-SM-https://my.adp.com/static/redbox/'
        );
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      })
      .pause(400);
  });

  it('Test Link for Life Insurance dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://www.reliancestandard.com/home/"]', 30000)
      .click('a[id="https://www.reliancestandard.com/home/"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://www.reliancestandard.com/home/');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for Red Mine dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#links-btn')
      .waitForElementVisible('a[id="https://redmine.consultwithcase.com"]', 30000)
      .click('a[id="https://redmine.consultwithcase.com"]')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals(
          'https://redmine.consultwithcase.com/login?back_url=https%3A%2F%2Fredmine.consultwithcase.com%2F'
        );
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for Workspaces at Reston Town Center dropdown menu', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#links-btn')
      .waitForElementVisible('#floorPlan', 30000)
      .click('#floorPlan')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('http://localhost:8080/img/MakeOfficesfloorplan.0d9c2602.jpg');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for GitHub', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#Github')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://github.com/caseconsulting');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for LinkedIn', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#LinkedIn')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlContains('case-consulting-inc');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for Youtube', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#Youtube')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlContains('https://www.youtube.com/channel/UC_oJY4OrOpLNrIBAN7Y-9fA');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for Twitter', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#Twitter')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://twitter.com/consultwithcase?lang=en');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });

  it('Test Link for Facebook', (browser) => {
    browser
      .waitForElementVisible('#links-btn', 30000)
      .click('#Facebook')
      .windowHandles(function (result) {
        browser.switchWindow(result.value[1]);
        browser.assert.urlEquals('https://www.facebook.com/ConsultwithCase/');
        browser.closeWindow();
        browser.switchWindow(result.value[0]);
        browser.assert.urlEquals('http://localhost:8080/home');
      });
  });
});
