/**
 * Yes the format is ugly, but it is based on a specific format that Paul needs.
 * We use the same format to avoid copy/pasting errors. Here's an image of a
 * similar form: https://image.cnbcfm.com/api/v1/image/104695920-OldEEO-1.png
 */

/**
 * Utilities to download EEO reports of employees
 */
import EmployeeCsvUtil from '@/utils/csv/employeeCsvUtil.js';
import _forEach from 'lodash/forEach';

// some useful constants as the exact strings might change
const HISPANIC_LATINO = 'Hispanic or Latino';
const HL_OFFSET = 2;
const MALE = 'Male';
const FEMALE = 'Female';

const H_HEADERS = 4; // horizontal/top headers count
const V_HEADERS = 1; // vertical/left headers count
const COLUMNS_AFTER_RACE_ETHNICITY = 2;

class EeoCsv extends EmployeeCsvUtil {
  /**
   * Returns the CSV filestring as a string.
   *
   * @param employees - array of employee objects
   * @return csv as a string
   */
  fileString(employees) {
    let convertedEmployees = convertEmployees(); // convert employees into csv object (returns two arrays)
    let csvFileStringA = CsvUtil.generateFrom2dArray(convertedEmployees[0]); // convert to csv file string
    let csvFileStringB = CsvUtil.generateFrom2dArray(convertedEmployees[1]); // convert to csv file string
    return CsvUtil.combine(csvFileStringA, csvFileStringB, 1); // combine and return results
  }

  /**
   * Converts employees to an array of objects.
   * Expects an array of employees.
   * @param employees - expense object to convert
   * @return a new object passable to csv.js
   */
  convertEmployees() {
    /**
     * gets the y, x position in `eeoData` based on inputs
     * @param givenRaceEth - employee's race/ethnicity
     * @param givenGender - employee's gender
     * @param givenJobCat - employee's job category
     * @returns y, x position
     */
    function position(givenRaceEth, givenGender, givenJobCat) {
      let gender_offset = givenGender == MALE ? 0 : 1;
      let x, y;
      // quicker referencing for position of items in array (O(1) vs O(n))
      // which might matter since we use this a lot. this is only the position
      // in the **array**, not in the table. do the math yourself.
      const jobCategoriesPos = {};
      const racesEthnicitiesPos = {};
      const gendersPos = {};
      for (let i = 0; i < jobCategories.length; i++) jobCategoriesPos[jobCategories[i]] = i + H_HEADERS;
      for (let i = 0; i < racesEthnicities.length; i++) racesEthnicitiesPos[racesEthnicities[i]] = i + V_HEADERS;
      for (let i = 0; i < genders.length; i++) gendersPos[genders[i]] = i;

      // ez pz for 'Hispanic or Latino', slightly harder for everyone else
      if (givenRaceEth == HISPANIC_LATINO) {
        x = 1 + gender_offset;
        y = jobCategoriesPos[givenJobCat];
      } else {
        x = HL_OFFSET + racesEthnicities.length * gender_offset + racesEthnicitiesPos[givenRaceEth];
        y = jobCategoriesPos[givenJobCat];
      }
      return [y, x];
    } // convertEmployees

    /**
     * fills in empty values in `eeoData` within the range with `filler`. will skip
     * over items that have values (ie, only null, undefined, or '' values will be
     * replaced). this function is agnostic of any offsets so you must specify the
     * start/end y/x values with absolute positioning. the range is inclusive of the
     * first value, and exclusive of the second; note the brackets: [(y, x), (y, x))
     * @param startY starting Y
     * @param startX starting X
     * @param endY ending Y
     * @param endX ending X
     * @param filler value to fill
     * @param override (optional) override the safety mechanism
     */
    function fill(startY, startX, endY, endX, filler, override = false) {
      const replaceableValues = ['', null, undefined];
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          if (override || replaceableValues.includes(eeoData[y][x])) {
            eeoData[y][x] = filler;
          }
        }
      }
    } // fill

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
      'First/Mid Level Official and Manager',
      'Technician',
      'Sales Worker',
      'Administrative Support Worker',
      'Craft Worker',
      'Operative',
      'Laborer and Helper',
      'Service Worker'
    ];
    // 'Hispanic or Latino' is removed from this list because it is a special case
    // in every situation, thus having the HL_OFFSET is more useful
    const racesEthnicities = [
      'White',
      'Black or African American',
      'Native Hawaiian or Other Pacific Islander',
      'Asian',
      'American Indian or Alaska Native',
      'Two or More Races'
    ];
    const genders = [MALE, FEMALE];

    // evidentally the fastest way to construct a 2D array
    // access with eeoData[{jobCategoryPosition}][{racesEthnicitiesPosition * 2} + {gendersPosition}]
    let eeoData = new Array(jobCategories.length + H_HEADERS + 1); // + 1 for the total column
    let temp = new Array(
      racesEthnicities.length * genders.length + V_HEADERS + HL_OFFSET + COLUMNS_AFTER_RACE_ETHNICITY + 1
    ); // + 1 for the total column
    for (let i = 0; i < temp.length; i++) temp[i] = '';
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

    // add top horizontal labels (race/ethnicity and gender)
    // special case of 'Hispanic or Latino' first
    eeoData[2][1] = HISPANIC_LATINO;
    eeoData[3][1] = MALE;
    eeoData[3][2] = FEMALE;
    // male/female
    eeoData[2][V_HEADERS + HL_OFFSET] = MALE;
    eeoData[2][V_HEADERS + HL_OFFSET + racesEthnicities.length] = FEMALE;
    // races and ethnicities other than 'Hispanic or Latino'
    for (let i = 0; i < genders.length; i++) {
      for (let ii = 0; ii < racesEthnicities.length; ii++) {
        let y = H_HEADERS - 1;
        let x = V_HEADERS + HL_OFFSET + ii + racesEthnicities.length * i;
        eeoData[y][x] = racesEthnicities[ii];
      }
    }
    // race/ethnicity topical headers
    eeoData[0][3] = 'Race/Ethnicity';
    eeoData[1][3] = `Not ${HISPANIC_LATINO}`;

    // total
    eeoData[H_HEADERS - 1][V_HEADERS + racesEthnicities.length * genders.length + HL_OFFSET] = 'Overall Total';

    // COLUMNS AFTER RACE/ETHNICITY

    // disability
    eeoData[0][genders.length * racesEthnicities.length + V_HEADERS + HL_OFFSET + 1] = 'Disability';

    // protected veteran
    eeoData[0][genders.length * racesEthnicities.length + V_HEADERS + HL_OFFSET + 2] = 'Protected Veteran';

    // add left vertical labels (job category)
    for (let i = 0; i < jobCategories.length; i++) {
      eeoData[i + 4][0] = jobCategories[i];
    }
    // total
    eeoData[H_HEADERS + jobCategories.length][0] = 'TOTAL';

    // zero out data
    fill(
      H_HEADERS,
      V_HEADERS,
      H_HEADERS + jobCategories.length + 1,
      V_HEADERS + HL_OFFSET + racesEthnicities.length * genders.length + COLUMNS_AFTER_RACE_ETHNICITY + 1, // plus 1 for the totals
      0
    );

    // add dashes to header
    fill(0, 1, H_HEADERS, eeoData[0].length, '----------------------');
    // undash small corner in top left
    fill(0, 1, 2, 3, '', true);

    // fill in EEO data
    _forEach(this.employees, (employee) => {
      function nullOrUndefined(item) {
        return item == undefined || item == null;
      }
      // make sure we have all fields first
      // let declined = employee.eeoDeclineSelfIdentify && !employee.eeoAdminHasFilledOutEeoForm;
      let formCompleted =
        !nullOrUndefined(employee.eeoGender) &&
        !nullOrUndefined(employee.eeoJobCategory) &&
        !nullOrUndefined(employee.eeoRaceOrEthnicity) &&
        !nullOrUndefined(employee.eeoHispanicOrLatino) &&
        !nullOrUndefined(employee.eeoHasDisability) &&
        !nullOrUndefined(employee.eeoIsProtectedVeteran);
      if (formCompleted) {
        // extract value of race/ethnicity
        let raceEthnicity = HISPANIC_LATINO;
        if (!employee.eeoHispanicOrLatino.value) raceEthnicity = employee.eeoRaceOrEthnicity.text;
        // tally up
        let [y, x] = position(raceEthnicity, employee.eeoGender.text, employee.eeoJobCategory.text);
        eeoData[y][x] += 1; // specific box in middle of csv
        eeoData[y][eeoData[0].length - COLUMNS_AFTER_RACE_ETHNICITY - 1] += 1; // totals on right of csv
        eeoData[eeoData.length - 1][x] += 1; // totals at bottom of csv
        eeoData[eeoData.length - 1][eeoData[0].length - COLUMNS_AFTER_RACE_ETHNICITY - 1] += 1; // total total in bottom right of csv
        if (employee.eeoHasDisability) {
          eeoData[y][eeoData[0].length - 2] += 1;
          eeoData[eeoData.length - 1][eeoData[0].length - COLUMNS_AFTER_RACE_ETHNICITY] += 1; // disability total in bottom right of csv
        }
        if (employee.eeoIsProtectedVeteran) {
          eeoData[y][eeoData[0].length - 1] += 1;
          eeoData[eeoData.length - 1][eeoData[0].length - COLUMNS_AFTER_RACE_ETHNICITY + 1] += 1; // protected vet total in bottom right of csv
        }
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
}
export default EeoCsv;
