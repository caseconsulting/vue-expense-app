<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click.stop="download()" text icon><i class="material-icons">file_download</i></v-btn>
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
  var fileTitle = this.employee.firstName + '_' + this.employee.lastName; // or 'my-unique-title'

  // call the exportCSVFile() function to process the JSON and trigger the download
  this.exportCSVFile(this.employee, fileTitle);
} // download

/**
 * Exports employees to a csv file given a title.
 *
 * @param items - employees to export
 * @param fileTitle - title of csv file
 */
function exportCSVFile(person, fileTitle) {
  let placeOfBirth = (person.city || ' ') + ' ' + (person.st || ' ') + ' ' + (person.country || ' ');
  let tempEmployees = [];

  let education = getInfo(person.degrees);
  let jobExperience = getInfo(person.jobs);
  let certifications = getInfo(person.certifications);
  let awards = getInfo(person.awards);
  let technologies = getInfo(person.technologies);
  let customerOrg = getInfo(person.customerOrgExp);
  let clearances = getInfo(person.clearances);
  let languages = getInfo(person.languages);

  console.log(technologies);

  let tempEmployee = [
    person.firstName || '', //Start of employee
    person.middleName || '',
    person.lastName || '',
    person.employeeNumber || '',
    person.email || '',
    person.prime || '',
    person.contract || '',
    person.jobRole || '',
    person.employeeRole || '',
    person.hireDate || '',
    getWorkStatus(person.workStatus) || '',
    person.github || '', //Start of personal
    person.twitter || '',
    person.linkedIn || '',
    person.birthday || '',
    placeOfBirth || '',
    ...education,
    ...jobExperience,
    ...certifications,
    ...awards,
    ...technologies,
    ...customerOrg,
    ...clearances,
    ...languages,
    person.id || ''
  ];

  let educationHeader = _.map(education, (value, index) => {
    return 'Degree ' + (index + 1);
  });
  let jobExperienceHeader = _.map(jobExperience, (value, index) => {
    return 'Job ' + (index + 1);
  });
  let certificationsHeader = _.map(certifications, (value, index) => {
    return 'Certification ' + (index + 1);
  });
  let awardsHeader = _.map(awards, (value, index) => {
    return 'Awards ' + (index + 1);
  });
  let technologiesHeader = _.map(technologies, (value, index) => {
    return 'Technology ' + (index + 1);
  });
  let customerOrgHeader = _.map(customerOrg, (value, index) => {
    return 'Customer Org Exp ' + (index + 1);
  });
  let clearancesHeader = _.map(clearances, (value, index) => {
    return 'Clearance ' + (index + 1);
  });
  let languagesHeader = _.map(languages, (value, index) => {
    return 'Language ' + (index + 1);
  });

  this.headers = [
    'First Name',
    'Middle Name',
    'Last Name',
    'Employee #',
    'Email',
    'Prime',
    'Contract',
    'Job Role',
    'Expense App Role',
    'Hire Date',
    'Status',
    'Github',
    'Twitter',
    'LinkedIn',
    'Birthday (yy-mm-dd)',
    'Place of Birth',
    ...educationHeader,
    ...jobExperienceHeader,
    ...certificationsHeader,
    ...awardsHeader,
    ...technologiesHeader,
    ...customerOrgHeader,
    ...clearancesHeader,
    ...languagesHeader,
    'id'
  ];

  tempEmployees.push(this.headers);
  tempEmployees.push(tempEmployee);

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
 * Returns the JSON version of all elements in the current info.
 * For example, the employee info would have an array of different
 * employers in JSON form.
 *
 * @param degrees - employee's degrees
 * @return Array - array of JSONs of the type of info
 */
function getInfo(info) {
  if (!info) {
    return '';
  }

  let infoList = [];
  info.forEach((currInfo) => {
    currInfo = Object.entries(currInfo);
    for (let i = 0; i < currInfo.length; i++) {
      if (currInfo[i][1].length === 0) {
        currInfo[i][1] = 'N/A';
      }
      if (currInfo[i][0] === 'dateIntervals') {
        currInfo[i][1] = parseDateInterval(currInfo[i][1]);
      }
    }

    console.log(currInfo);
    infoList.push(currInfo);
  });

  return infoList;
} // getInfo

/**
 * Parses the dateInterval object into a string to be put into the excel
 * file
 *
 * @param dateInterval - The date interval being parsed
 * @return String - the parsed date interval
 */
function parseDateInterval(dateInterval) {
  let out = '';
  if (dateInterval) {
    dateInterval.forEach((interval, index) => {
      out += 'Interval ' + (index + 1) + ': Start: ' + interval.startDate + ' End: ' + interval.endDate + ' ';
    });
  }

  return out;
} // parseDateInterval

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
    getWorkStatus,
    getInfo,
    parseDateInterval
  },
  props: ['employee', 'midAction'] // employees to export
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
