<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click="download()" elevation="2"
    ><i class="material-icons">file_download</i>Download All</v-btn
  >
</template>

<script>
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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

      line += `"${array[i][index]}"`;
    }
    str += line + '\r\n';
  }
  return str;
} // convertToCSV

/**
 * Exports employees to a csv file titled employees
 */
function download() {
  var fileTitle = 'employees'; // or 'my-unique-title'

  // call the exportCSVFile() function to process the JSON and trigger the download
  this.exportCSVFile(_.cloneDeep(this.employees), fileTitle);
} // download

/**
 * Exports employees to a csv file given a title.
 *
 * @param items - employees to export
 * @param fileTitle - title of csv file
 */
function exportCSVFile(items, fileTitle) {
  let tempEmployees = [];
  for (var i = 0; i < items.length; i++) {
    let person = items[i];
    console.log(person);
    let placeOfBirth = (person.city || ' ') + ' ' + (person.st || ' ') + ' ' + (person.country || ' ');
    tempEmployees[i] = [
      person.employeeNumber || '',
      person.firstName || '',
      person.middleName || '',
      person.lastName || '',
      person.birthday || '',
      placeOfBirth || '',
      person.hireDate || '',
      person.jobRole || '',
      person.prime || '',
      person.contract || '',
      person.email || '',
      person.twitter || '',
      person.github || '',
      person.employeeRole || '',
      getWorkStatus(person.workStatus) || '',
      person.id || '',
      filterUndefined(person.awards, getAwards) || ''
      // certifications || '',
      // clearance || '',
      // contract || '',
      // customerOrg || '',
      // education || '',
      // employee || '',
      // jobExperience || '',
      // personal || '',
      // technology || ''
    ];
  }

  this.headers = [
    'Employee #',
    'First Name',
    'Middle Name',
    'Last Name',
    'Birthday (yy-mm-dd)',
    'Place of Birth',
    'Hire Date',
    'Job Role',
    'Prime',
    'Contract',
    'Email',
    'Twitter',
    'Github',
    'Expense App Role',
    'Status',
    'id',
    'Awards',
    'Certifications',
    'Clearance',
    'Contract',
    'Customer Org',
    'Education',
    'Employee',
    'Job Experience',
    'Personal',
    'Technology'
  ];

  tempEmployees.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });

  tempEmployees.unshift(this.headers);

  // Convert Object to JSON
  var jsonObject = JSON.stringify(tempEmployees);

  var csv = this.convertToCSV(jsonObject);

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
 * Returns a work status 'Full Time', 'Part Time', 'Inactive', or 'Invalid Status'.
 *
 * @param workStatus - employee work status
 * @return String - work status description
 */
function getWorkStatus(workStatus) {
  if (workStatus == 100) {
    return `Full Time`;
  } else if (workStatus == 0) {
    return `Inactive`;
  } else if (workStatus > 0 && workStatus < 100) {
    return `Part Time (${workStatus}%)`;
  } else {
    return 'Invalid Status';
  }
} // getWorkStatus

/**
 * Filters out undefined elements of employee data
 *
 * @param data - An array of objects. Some will be undefined.
 * @return String - specific employee data
 */
function filterUndefined(data, func) {
  let a = '';
  if (typeof data !== 'undefined') {
    a = func(data);
  }
  return a;
}

/**
 * Returns award data for employee
 *
 * @param awards - An array of objects.
 * @return String - awards
 */
function getAwards(awards) {
  let a = '';
  for (let i = 0; i < awards.length; i++) {
    a += awards[i].name + ' - ' + awards[i].dateReceived;
    if (i + 1 < awards.length) {
      a += ', ';
    }
  }
  return a;
} // getAwards

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      headers: []
    };
  },
  methods: {
    convertToCSV,
    download,
    exportCSVFile,
    getWorkStatus
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
