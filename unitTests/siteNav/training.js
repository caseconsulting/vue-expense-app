const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');

describe('testing sign-in', () => {
  before((browser) => {
    utils.commonBefore(browser);
  });

  this.tags = ['trainingPage'];

  it('Test navigate to Training', (browser) => {
    utils.navigate(browser, vars.nav.training);
  });
});
