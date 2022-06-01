<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click="populateArrays()" elevation="2"
    ><i class="material-icons">file_download</i>Generate EEO Report</v-btn
  >
</template>

<script>
import _ from 'lodash';
import moment from 'moment-timezone';

// Keston wrote all this crap. Please don't ask me about it.
// I don't know how it works either.
// https://3.basecamp.com/3097063/buckets/18376382/messages/4851739152
// https://www.youtube.com/watch?v=dQw4w9WgXcQ

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Initiates processing of data and formatting of file.
 * Filters employees into groups and totals them.
 *
 */
function populateArrays() {
  this.clonedEmployees = _.cloneDeep(this.employees);

  // groupings for job categories
  // each array represents a column and each index of that array is a job category for that column.
  this.hispanicOrLatinoMales = this.sortItems(true, true, 6);
  this.hispanicOrLatinoFemales = this.sortItems(false, true, 6);
  // not hispanic or latino, males (abbreviations used)
  this.malesWhite = this.sortItems(true, false, 0);
  this.malesBoAA = this.sortItems(true, false, 1);
  this.malesNHoOPI = this.sortItems(true, false, 2);
  this.malesAsian = this.sortItems(true, false, 3);
  this.malesAIoAN = this.sortItems(true, false, 4);
  this.malesToMR = this.sortItems(true, false, 5);
  // not hispanic or latino, females (abbreviations used)
  this.femalesWhite = this.sortItems(false, false, 0);
  this.femalesBoAA = this.sortItems(false, false, 1);
  this.femalesNHoOPI = this.sortItems(false, false, 2);
  this.femalesAsian = this.sortItems(false, false, 3);
  this.femalesAIoAN = this.sortItems(false, false, 4);
  this.femalesToMR = this.sortItems(false, false, 5);

  // create rows (in the above code, items are organized into columns because that was easiest to automate.
  // but the data needs to be converted to rows before being pushed onto the array that will be used for the CSV)
  let bodyRow1 = [
    'Professional',
    this.hispanicOrLatinoMales[0],
    this.hispanicOrLatinoFemales[0],
    this.malesWhite[0],
    this.malesBoAA[0],
    this.malesNHoOPI[0],
    this.malesAsian[0],
    this.malesAIoAN[0],
    this.malesToMR[0],
    this.femalesWhite[0],
    this.femalesBoAA[0],
    this.femalesNHoOPI[0],
    this.femalesAsian[0],
    this.femalesAIoAN[0],
    this.femalesToMR[0],
    this.rowTotal(0)
  ];
  let bodyRow2 = [
    'Executive/Senior Level Official and Manager',
    this.hispanicOrLatinoMales[1],
    this.hispanicOrLatinoFemales[1],
    this.malesWhite[1],
    this.malesBoAA[1],
    this.malesNHoOPI[1],
    this.malesAsian[1],
    this.malesAIoAN[1],
    this.malesToMR[1],
    this.femalesWhite[1],
    this.femalesBoAA[1],
    this.femalesNHoOPI[1],
    this.femalesAsian[1],
    this.femalesAIoAN[1],
    this.femalesToMR[1],
    this.rowTotal(1)
  ];
  let bodyRow3 = [
    'First/Mid-Level Official and Manager',
    this.hispanicOrLatinoMales[2],
    this.hispanicOrLatinoFemales[2],
    this.malesWhite[2],
    this.malesBoAA[2],
    this.malesNHoOPI[2],
    this.malesAsian[2],
    this.malesAIoAN[2],
    this.malesToMR[2],
    this.femalesWhite[2],
    this.femalesBoAA[2],
    this.femalesNHoOPI[2],
    this.femalesAsian[2],
    this.femalesAIoAN[2],
    this.femalesToMR[2],
    this.rowTotal(2)
  ];
  let bodyRow4 = [
    'Technician',
    this.hispanicOrLatinoMales[3],
    this.hispanicOrLatinoFemales[3],
    this.malesWhite[3],
    this.malesBoAA[3],
    this.malesNHoOPI[3],
    this.malesAsian[3],
    this.malesAIoAN[3],
    this.malesToMR[3],
    this.femalesWhite[3],
    this.femalesBoAA[3],
    this.femalesNHoOPI[3],
    this.femalesAsian[3],
    this.femalesAIoAN[3],
    this.femalesToMR[3],
    this.rowTotal(3)
  ];
  let bodyRow5 = [
    'Sales Worker',
    this.hispanicOrLatinoMales[4],
    this.hispanicOrLatinoFemales[4],
    this.malesWhite[4],
    this.malesBoAA[4],
    this.malesNHoOPI[4],
    this.malesAsian[4],
    this.malesAIoAN[4],
    this.malesToMR[4],
    this.femalesWhite[4],
    this.femalesBoAA[4],
    this.femalesNHoOPI[4],
    this.femalesAsian[4],
    this.femalesAIoAN[4],
    this.femalesToMR[4],
    this.rowTotal(4)
  ];
  let bodyRow6 = [
    'Administrative Support Worker',
    this.hispanicOrLatinoMales[5],
    this.hispanicOrLatinoFemales[5],
    this.malesWhite[5],
    this.malesBoAA[5],
    this.malesNHoOPI[5],
    this.malesAsian[5],
    this.malesAIoAN[5],
    this.malesToMR[5],
    this.femalesWhite[5],
    this.femalesBoAA[5],
    this.femalesNHoOPI[5],
    this.femalesAsian[5],
    this.femalesAIoAN[5],
    this.femalesToMR[5],
    this.rowTotal(5)
  ];
  let bodyRow7 = [
    'Craft Worker',
    this.hispanicOrLatinoMales[6],
    this.hispanicOrLatinoFemales[6],
    this.malesWhite[6],
    this.malesBoAA[6],
    this.malesNHoOPI[6],
    this.malesAsian[6],
    this.malesAIoAN[6],
    this.malesToMR[6],
    this.femalesWhite[6],
    this.femalesBoAA[6],
    this.femalesNHoOPI[6],
    this.femalesAsian[6],
    this.femalesAIoAN[6],
    this.femalesToMR[6],
    this.rowTotal(6)
  ];
  let bodyRow8 = [
    'Operative',
    this.hispanicOrLatinoMales[7],
    this.hispanicOrLatinoFemales[7],
    this.malesWhite[7],
    this.malesBoAA[7],
    this.malesNHoOPI[7],
    this.malesAsian[7],
    this.malesAIoAN[7],
    this.malesToMR[7],
    this.femalesWhite[7],
    this.femalesBoAA[7],
    this.femalesNHoOPI[7],
    this.femalesAsian[7],
    this.femalesAIoAN[7],
    this.femalesToMR[7],
    this.rowTotal(7)
  ];
  let bodyRow9 = [
    'Laborer and Helper',
    this.hispanicOrLatinoMales[8],
    this.hispanicOrLatinoFemales[8],
    this.malesWhite[8],
    this.malesBoAA[8],
    this.malesNHoOPI[8],
    this.malesAsian[8],
    this.malesAIoAN[8],
    this.malesToMR[8],
    this.femalesWhite[8],
    this.femalesBoAA[8],
    this.femalesNHoOPI[8],
    this.femalesAsian[8],
    this.femalesAIoAN[8],
    this.femalesToMR[8],
    this.rowTotal(8)
  ];
  let bodyRow10 = [
    'Service Worker',
    this.hispanicOrLatinoMales[9],
    this.hispanicOrLatinoFemales[9],
    this.malesWhite[9],
    this.malesBoAA[9],
    this.malesNHoOPI[9],
    this.malesAsian[9],
    this.malesAIoAN[9],
    this.malesToMR[9],
    this.femalesWhite[9],
    this.femalesBoAA[9],
    this.femalesNHoOPI[9],
    this.femalesAsian[9],
    this.femalesAIoAN[9],
    this.femalesToMR[9],
    this.rowTotal(9)
  ];
  let bodyRow11 = [
    'TOTAL',
    this.columnTotal(this.hispanicOrLatinoMales),
    this.columnTotal(this.hispanicOrLatinoFemales),
    this.columnTotal(this.malesWhite),
    this.columnTotal(this.malesBoAA),
    this.columnTotal(this.malesNHoOPI),
    this.columnTotal(this.malesAsian),
    this.columnTotal(this.malesAIoAN),
    this.columnTotal(this.malesToMR),
    this.columnTotal(this.femalesWhite),
    this.columnTotal(this.femalesBoAA),
    this.columnTotal(this.femalesNHoOPI),
    this.columnTotal(this.femalesAsian),
    this.columnTotal(this.femalesAIoAN),
    this.columnTotal(this.femalesToMR),
    this.totalValidation()
  ];

  // a lot of pushing but I promise there's no shoving!
  let fileContent = [];
  fileContent.push(
    bodyRow1,
    bodyRow2,
    bodyRow3,
    bodyRow4,
    bodyRow5,
    bodyRow6,
    bodyRow7,
    bodyRow8,
    bodyRow9,
    bodyRow10,
    bodyRow11
  );

  // add list of employees that have not identified or chose not to.
  let employees = this.declinedToSelfIdentify();
  employees.forEach((emp) => {
    fileContent.push(emp);
  });

  // export it!
  this.exportCSVFile(fileContent);
} // populateArrays

/**
 * Sort items into the arrays (indexs are like cells on the sheet)
 *
 * @param genderVal - true (male), false (female)
 * @param hispanicOrLatinoVal - hispanic or latino (true), NOT hispanic or latino (false)
 * @param raceOrEthnicityVal - race or ethnicity value (white=0, black=1, ... not applicable=6)
 */
function sortItems(genderVal, hispanicOrLatinoVal, raceOrEthnicityVal) {
  // set default length and values (was getting undefined errors)
  let array = Array(10).fill(0);

  this.clonedEmployees.forEach((emp) => {
    if ('eeoGender' in emp && 'eeoHispanicOrLatino' in emp && 'eeoRaceOrEthnicity' in emp) {
      if (
        emp.eeoGender.value == genderVal &&
        emp.eeoHispanicOrLatino.value == hispanicOrLatinoVal &&
        emp.eeoRaceOrEthnicity.value == raceOrEthnicityVal
      ) {
        // each index of the array is a job category.
        // each value in the index is the count of employees that match the criteria
        switch (emp.eeoJobCategory.value) {
          case 0:
            array[0]++;
            break;
          case 1:
            array[1]++;
            break;
          case 2:
            array[2]++;
            break;
          case 3:
            array[3]++;
            break;
          case 4:
            array[4]++;
            break;
          case 5:
            array[5]++;
            break;
          case 6:
            array[6]++;
            break;
          case 7:
            array[7]++;
            break;
          case 8:
            array[8]++;
            break;
          case 9:
            array[9]++;
            break;
          default:
            break;
        }
      }
    }
  });
  return array;
} // sortItems

/**
 * sums row
 *
 * @param i - index of arrays to sum together
 * @returns a digit
 */
function rowTotal(i) {
  let sum =
    this.hispanicOrLatinoMales[i] +
    this.hispanicOrLatinoFemales[i] +
    this.malesWhite[i] +
    this.malesBoAA[i] +
    this.malesNHoOPI[i] +
    this.malesAsian[i] +
    this.malesAIoAN[i] +
    this.malesToMR[i] +
    this.femalesWhite[i] +
    this.femalesBoAA[i] +
    this.femalesNHoOPI[i] +
    this.femalesAsian[i] +
    this.femalesAIoAN[i] +
    this.femalesToMR[i];
  this.sumOfRowTotals += sum;
  return sum;
} // rowTotal

/**
 * sums column
 * @param - array to sum
 * @returns a digit
 */
function columnTotal(array) {
  let sum = 0;
  array.forEach((val) => {
    sum += val;
  });
  this.sumOfColumnTotals += sum;
  return sum;
} // columnTotal

/**
 * ensures column and row totals are summed properly
 * @returns a digit (success) or 'ERRORS!' (error)
 */
function totalValidation() {
  return this.sumOfRowTotals === this.sumOfColumnTotals ? this.sumOfColumnTotals : 'ERRORS!';
} // totalValidation

/**
 * calculates and alphabetizes employees that either haven't filled out the EEO form or declined to self-identify
 * @returns an array
 */
function declinedToSelfIdentify() {
  let formattedEmployees = [];
  // filter only employees that have indicated they do not want to self-identify OR employees that have not filled out the form.
  let filteredEmployees = this.clonedEmployees.filter(
    (emp) =>
      emp.eeoDeclineSelfIdentify || !('eeoGender' in emp && 'eeoHispanicOrLatino' in emp && 'eeoRaceOrEthnicity' in emp)
  );
  // get the name and employee number for all employees in array
  filteredEmployees.forEach((emp, index) => {
    formattedEmployees[index] = [
      emp.firstName + ' ' + emp.lastName,
      emp.employeeNumber,
      emp.eeoDeclineSelfIdentify ? 'Declined' : 'Incomplete',
      emp.email
    ];
  });

  // sort alphabetically
  formattedEmployees.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });
  // add headers to beginning of array
  formattedEmployees.unshift(
    [''],
    ['These employees have not completed the EEO form or declined to self-identify'],
    ['Name', 'Employee ID', 'Status', 'Email']
  );
  return formattedEmployees;
} // declinedToSelfIdentify

/**
 * Exports employees to a csv file given a title.
 *
 * @param fileContent - data in the file
 */
function exportCSVFile(fileContent) {
  // push headers to begin of array
  fileContent.unshift(this.headerRows[0], this.headerRows[1], this.headerRows[2], this.headerRows[3]);

  // Convert Object to JSON
  var jsonObject = JSON.stringify(fileContent);

  var csv = this.convertToCSV(jsonObject);

  let date = moment();
  let currentYear = date.format('YYYY');
  var fileTitle = 'EEO Compliance Report - ' + currentYear; // or 'my-unique-title'
  var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportedFilenmae);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
} // exportCSVFile

/**
 * Converts an object into a csv string.
 *
 * @param objArray - Object to convert
 * @return String - csv of object
 */
function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';
  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index = 0; index < array[i].length; index++) {
      if (line != '') line += ',';

      if (Array.isArray(array[i][index])) {
        line += `"${array[i][index].join(', ')}"`;
      } else {
        line += `"${array[i][index]}"`;
      }
    }
    str += line + '\r\n';
  }
  return str;
} // convertToCSV

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      clonedEmployees: null,
      hispanicOrLatinoMale: [],
      hispanicOrLatinoFemales: [],
      malesWhite: [],
      malesBoAA: [],
      malesNHoOPI: [],
      malesAsian: [],
      malesAIoAN: [],
      malesToMR: [],
      femalesWhite: [],
      femalesBoAA: [],
      femalesNHoOPI: [],
      femalesAsian: [],
      femalesAIoAN: [],
      femalesToMR: [],
      sumOfRowTotals: 0,
      sumOfColumnTotals: 0,
      numOfSelfIdentify: 0,
      numOfDeclinedToSelfIdentify: 0,
      employeesThatDeclinedToSelfIdentify: [],
      headerRows: [
        [
          '',
          '',
          '',
          'Race/Ethnicity',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------'
        ],
        [
          '',
          '',
          '',
          'Not Hispanic or Latino',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------'
        ],
        [
          '',
          'Hispanic or Latino',
          '-----------------------------------------------',
          'Male',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          'Female',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------',
          '-----------------------------------------------'
        ],
        [
          'Job Categories',
          'Male',
          'Female',
          'White',
          'Black or African American',
          'Native Hawaiian or Other Pacific Islander',
          'Asian',
          'American Indian or Alaska Native',
          'Two or More Races',
          'White',
          'Black or African American',
          'Native Hawaiian or Other Pacific Islander',
          'Asian',
          'American Indian or Alaska Native',
          'Two or More Races',
          'Overall Total'
        ]
      ],
      bodyRows: []
    };
  },
  methods: {
    convertToCSV,
    populateArrays,
    exportCSVFile,
    sortItems,
    rowTotal,
    columnTotal,
    totalValidation,
    declinedToSelfIdentify
  },
  props: ['employees', 'midAction'] // employees to export
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
