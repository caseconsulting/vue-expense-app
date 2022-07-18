/**
 * Utilities to download EEO reports of employees
 */
import _ from 'lodash';
const csvUtils = require('./baseCsv.js');

/**
 * Downloads array of employees EEO information as csv file.
 * @param employees - array of employees objects
 */
export function download(employees) {
  let convertedEmployees = convertEmployees(employees); // convert employees into csv object (returns two arrays)
  let csvFileStringA = csvUtils.generateFrom2dArray(convertedEmployees[0]); // convert to csv file string
  let csvFileStringB = csvUtils.generateFrom2dArray(convertedEmployees[1]); // convert to csv file string
  let csvFileStringFinal = csvUtils.combine(csvFileStringA, csvFileStringB, 1);
  csvUtils.download(csvFileStringFinal, 'EEO Compliance Report.csv'); // download csv file string as .csv
} // download

/**
 * Converts employees to an array of objects to pass in to csvUtils.generate(). Expects
 * an array of employees.
 * @param employees - expense object to convert
 * @return a new object passable to csv.js
 */
// ¿TODO?: make `declinedInformation`, `jobCategories`, `racesEthnicities`, and `genders`
//         dynamic (probably api calls) to update alongside the database if it ever changes
export function convertEmployees(employees) {
  // data types
  const declinedInformation = [
    {
      name: 'Name',
      func: (e) => {
        return `${e.firstName}${e.middleName ? ` ${e.middleName} ` : ' '}${e.lastName}${
          e.nickname ? ` (${e.nickname})` : ''
        }`;
      }
    },
    {
      name: 'Employee ID',
      func: (e) => {
        return e.employeeNumber;
      }
    },
    {
      name: 'Status',
      func: (e) => {
        return e.eeoDeclineSelfIdentify ? 'Declined' : 'Incomplete';
      }
    },
    {
      name: 'Email',
      func: (e) => {
        return e.email;
      }
    }
  ];
  const jobCategories = [
    'Professional',
    'Executive/Senior Level Official and Manager',
    'First/Mid-Level Official and Manager',
    'Technician',
    'Sales Worker',
    'Administrative Support Worker',
    'Craft Worker',
    'Operative',
    'Laborer and Helper',
    'Service Worker'
  ];
  const racesEthnicities = [
    'Hispanic or Latino',
    'White',
    'Black or African American',
    'Native Hawaiian or Other Pacific Islander',
    'Asian',
    'American Indian or Alaska Native',
    'Two or More Races'
  ];
  const genders = ['Male', 'Female'];

  // evidentally the fastest way to construct a 2D array
  // access with eeoData[{jobCategoryPosition}][{racesEthnicitiesPosition * 2} + {gendersPosition}]
  let eeoData = new Array(jobCategories.length + 3);
  let temp = new Array(racesEthnicities.length * genders.length + 2);
  for (let i = 0; i < temp.length; i++) temp[i] = 0;
  for (let i = 0; i < eeoData.length; i++) eeoData[i] = temp.slice(0);

  // initialize declined data with a title and header
  let eeoDeclinedData = [new Array(declinedInformation.length), new Array(declinedInformation.length)];
  eeoDeclinedData[0][0] = 'These employees have not completed the EEO form or declined to self-identify';
  for (let i = 1; i < declinedInformation.length; i++) {
    eeoDeclinedData[0][i] = '';
  }
  for (let i = 0; i < declinedInformation.length; i++) {
    eeoDeclinedData[1][i] = declinedInformation[i].name;
  }

  // quicker referencing for position of items in array (O(1) vs O(n))
  // which might matter since we use this a lot
  const jobCategoriesPos = {};
  const racesEthnicitiesPos = {};
  const gendersPos = {};
  for (let i = 0; i < jobCategories.length; i++) jobCategoriesPos[jobCategories[i]] = i + 2;
  for (let i = 0; i < racesEthnicities.length; i++) racesEthnicitiesPos[racesEthnicities[i]] = i * genders.length + 1;
  for (let i = 0; i < genders.length; i++) gendersPos[genders[i]] = i;
  let numRows = eeoData.length;
  let numCols = eeoData[0].length;

  // add top horizontal labels (race/ethnicity and gender)
  for (let i = 0; i <= racesEthnicities.length * 2; i++) {
    let OFFSET = 1;
    if (i >= OFFSET && i % 2 == 0) {
      eeoData[0][i] = ''; // races/ethnicities row
      eeoData[1][i] = 'Female'; // gender row
    } else if (i >= OFFSET) {
      eeoData[0][i] = racesEthnicities[(i - 1) / 2]; // races/ethnicities row
      eeoData[1][i] = 'Male'; // gender row
    }
  }
  // add left vertical labels (job category)
  for (let i = 0; i < jobCategories.length; i++) {
    eeoData[i + 2][0] = jobCategories[i];
  }

  // manually blank out known unused areas
  {
    // top left
    eeoData[0][0] = '';
    eeoData[1][0] = '';
    // top right
    eeoData[0][numCols - 1] = '';
    // bottom left of regular (top) eeo data
  }
  // add titles for totals and such
  {
    eeoData[1][numCols - 1] = 'Overall Total';
    eeoData[numRows - 1][0] = 'TOTAL';
  }

  //   example of how to access:
  //   let a = jobCategoriesPos['First/Mid-Level Official and Manager'];
  //   let b = racesEthnicitiesPos['Asian'];
  //   let c = gendersPos['Female'];
  //   eeoData[a][b + c] = ...;

  // fill in EEO data
  _.forEach(employees, (employee) => {
    function nullOrUndefined(item) {
      return item == undefined || item == null;
    }

    // make sure we have all fields first
    let declined = employee.eeoDeclineSelfIdentify && !employee.eeoAdminHasFilledOutEeoForm;
    let formCompleted =
      !nullOrUndefined(employee.eeoGender) &&
      !nullOrUndefined(employee.eeoJobCategory) &&
      !nullOrUndefined(employee.eeoRaceOrEthnicity) &&
      !nullOrUndefined(employee.eeoHispanicOrLatino);

    if (!declined && formCompleted) {
      // extract value of race/ethnicity
      let raceEthnicity = 'Hispanic or Latino';
      if (employee.eeoHispanicOrLatino.text != 'Hispanic or Latino') raceEthnicity = employee.eeoRaceOrEthnicity.text;

      // add employee to tally field
      let a = jobCategoriesPos[employee.eeoJobCategory.text];
      let b = racesEthnicitiesPos[raceEthnicity] + gendersPos[employee.eeoGender.text];
      eeoData[a][b] += 1;

      // add employee to total fields
      eeoData[numRows - 1][b] += 1;
      eeoData[a][numCols - 1] += 1;
      eeoData[numRows - 1][numCols - 1] += 1;
    } else {
      // eeoDeclineSelfIdentify or form not filled
      let toPush = new Array(declinedInformation.length);
      for (let i = 0; i < declinedInformation.length; i++) {
        toPush[i] = declinedInformation[i].func(employee);
      }
      eeoDeclinedData.push(toPush);
    }
  });

  return [eeoData, eeoDeclinedData];
} // convertEmployees
