# Nightwatch Utils

You can open this readme in Github for nice formatting: https://github.com/caseconsulting/vue-expense-app/blob/master/unitTests/utils/README.md

This is a user's guide to the Nightwatch utilities. Start here, but if you are wondering about a specific aspect of a function, feel free to dive into the code yourself.
The `utils.js` functions will be referred to as `utils` and the `constants.js` variables will be referred to as vars, as these are the recomended variable names to use in your code.

## Usage

Add the below to the beginning of your Nightwatch test and you should be good to use the utils and vars as per the examples:

```
const utils = require('../utils/utils.js');
const vars = require('../utils/constants.js');
```

Change the relative path if your Nightwatch test is not in a subfolder of `unitTests`.

## Utilities

### Logging in

While utils does provide a `login` function, it is reccomended to replace the entire `before()` with the `commonBefore` as below:

```
before((browser) => {
  utils.commonBefore(browser);
});
```

However, you can use the login function by itself if you so choose:

```
utils.login(browser)
```

`login` has two optional parameters: `username` and `password`. If unset, they will default to the data in vars, which in turn pulls its data from the `.env` file. To use these optional parameters would look like this:

```
utils.login(browser, "user@consultwithcase.com", "userpassword123")
```

### Site navigation

Utils provides a `navigate` function. It is required that you use a `nav` object from vars to specify the page (see information about vars below). Note that expenses as a more complicated structure than other pages, since it is nested. The below navigates to the home page:

```
utils.navigate(browser, vars.nav.home)
```

You may optionally specify that you want to use URL replacement rather than manual navigation. This may save time, as the default manual navigation simply clicks in the menu. The below will set manual navigation to `false`, and thus navigation will be done through URL replacement instead:

```
utils.navigate(browser, vars.nav.home, false)
```

### Test user (Nightwatch Tester)

You can get the name of Nightwatch Tester through the `getName` function. This requires a type to be one of the following:

| type                                                              | return structure                                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `'real'`                                                          | firstname + lastname                                                                             |
| `'nick'`                                                          | nickname + lastname \n                                                                           |
| - If tester has no nickname, firstname will be used as a fallback |
| `'full'`                                                          | nickname + middlename + lastname                                                                 |
|                                                                   | - If the tester does not have a middlename, an extra space will be between nickname and lastname |
|                                                                   | - If the tester does not have a nickname, firstname will be used as a fallback                   |

Example:

```
utils.getName('nick')
```

### Date utilities

The `utils.date` object has functions that can provide different date formats. All functions can optionally take in a format string, which will be passed to `moment` for formatting (thus you may use any `moment` formatting). The default format is `MM/DD/YYYY` as defined in vars. The functions are aptly named:
`today`, `yesterday`, `tomorrow`, `lastMonth`, `nextMonth`, `lastYear`, `nextYear`
For example:

```
utils.yesterday()
```

or:

```
utils.lastMonth('MMM Do, YYYY')
```

You may also with to specify your own date offsets from the current date. To do this, use the `___Diff` functions, which take in a number of days/months/years to offset from today (this number may be negative):
`daysDiff`, `monthsDiff`, `yearsDiff`
For example:

```
utils.daysDiff(-30)
```

## Constants

You will have to update these as the Nightwatch Tester user updates.

### Big letter constants

The following are the definitions of the first set of constants:

| var           | value                     |
| ------------- | ------------------------- |
| `URL`         | `'http://localhost:8080'` |
| `WAIT_TIME`   | `30000`                   |
| `SMALL_PAUSE` | `500`                     |
| `LONG_PAUSE`  | `3000`                    |
| `DATE_FORMAT` | `'MM/DD/YYYY'`            |

### Test user constants

You may also access variables from the test user's information:

| var                 | value                                |
| ------------------- | ------------------------------------ |
| `tester.username`   | `process.env.VUE_APP_AUTH0_EMAIL`    |
| `tester.password`   | `process.env.VUE_APP_AUTH0_PASSWORD` |
| `tester.firstName`  | `'Nightwatch'`                       |
| `tester.middleName` | `null`                               |
| `tester.lastName`   | `'Tester'`                           |
| `tester.nickName`   | `'Owl'`                              |

### Site navigation constants

For page navigation and info, the following objects all have the properties `title`, `icon`, and `route`. (Expenses is described below)
`nav.home`, `nav.employees`, `nav.statistics`, `nav.audits`, `nav.reports`, `nav.training`, `nav.help`

The expenses dropdown contains multiple pages, so you have to specify the dropdown (`expenses`) before the page. Otherwise, the same information as above also applies here.
`nav.expenses.budgets`, `nav.expenses.expenses`, `nav.expenses.types`, `nav.expenses.reimbursements`
