// describe('Testing the homepage', () => {
//     before(browser => {
//         browser.url(' http://localhost:8080');
//     });

//     this.tags = ['homepage'];

//     test('checking if this will work', browser => {
//         browser
//             .waitForElementVisible('#custom-button-color')
//             .click('#custom-button-color')
//             .waitForElementVisible('div.auth0-lock-content')
//             .waitForElementVisible('div.auth0-lock-social-button-text')
//             .click('div.auth0-lock-social-button-text')
//             .assert.visible('input#identifierId')
//             .setValue('input#identifierId', process.env.VUE_APP_AUTH0_EMAIL)
//             .click('div.VfPpkd-RLmnJb')
//             .waitForElementVisible('#password')
//             .setValue('input[type="password"]', process.env.VUE_APP_AUTH0_PASSWORD)
//             .click('div.VfPpkd-RLmnJb')
//             .waitForElementVisible('h1.d-inline') // header text 'Case Portal'
//             .assert.urlEquals('http://localhost:8080/reimbursements'); //This assert will fail for users. 
//     });

//     test('checking to see if you have to navigate every time', browser => {
//         browser
//             .assert.urlEquals('http://localhost:8080/reimbursements')
//     });
// });