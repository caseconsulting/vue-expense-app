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
      person.email || '',
      person.mifiStatus != undefined && person.mifiStatus != null ? person.mifiStatus : 'true',
      person.twitter || '',
      person.github || '',
      person.linkedIn || '',
      person.employeeRole || '',
      this.getWorkStatus(person.workStatus) || '',
      this.filterUndefined(person.awards, getAwards) || '',
      this.filterUndefined(person.certifications, getCertifications) || '',
      this.filterUndefined(person.clearances, getClearances) || '',
      this.filterUndefined(person.contracts, getContracts) || '',
      this.filterUndefined(person.customerOrgExp, getCustomerOrgExp) || '',
      this.filterUndefined(person.schools, getEducation) || '',
      this.filterUndefined(person.companies, getCompanies) || '',
      this.filterUndefined(person.technologies, getTechnologies) || '',
      person.id || ''
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
    'Email',
    'Mifi Status',
    'Twitter',
    'Github',
    'LinkedIn',
    'Expense App Role',
    'Status',
    'Awards',
    'Certifications',
    'Clearance',
    'Contract',
    'Customer Org',
    'Education',
    'Job Experience',
    'Technology',
    'id'
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
  if (typeof data === 'object') {
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

/**
 * Returns certification data for employee
 *
 * @param certification - An array of objects.
 * @return String - certifications
 */
function getCertifications(certification) {
  let a = '';
  for (let i = 0; i < certification.length; i++) {
    a += certification[i].name + ' - ' + certification[i].dateReceived;
    if (certification[i].expirationDate) {
      a += ' to ' + certification[i].expirationDate;
    }
    if (i + 1 < certification.length) {
      a += ', ';
    }
  }
  return a;
} // getCertifications

/**
 * Returns clearance data for employee
 *
 * @param clearance - An array of objects.
 * @return String - clearance
 */
function getClearances(clearance) {
  let a = '';
  for (let i = 0; i < clearance.length; i++) {
    a += clearance[i].type;
    if (typeof clearance[i].grantedDate !== 'undefined') {
      a += ' - ' + clearance[i].grantedDate;
    }
    if (typeof clearance[i].expirationDate !== 'undefined') {
      a += ' to ' + clearance[i].expirationDate;
    }
    if (i + 1 < clearance.length) {
      a += ', ';
    }
  }
  return a;
} // getClearance

/**
 * Returns contract data for employee
 *
 * @param contract - An array of objects.
 * @return String - contract
 */
function getContracts(contract) {
  let a = '';
  for (let i = 0; i < contract.length; i++) {
    a += contract[i].name + ' - ' + contract[i].prime;
    if (typeof contract[i].years !== 'undefined') {
      a += ' - ' + contract[i].years + ' years';
    }
    if (i + 1 < contract.length) {
      a += ', ';
    }
  }
  return a;
} // getContracts

/**
 * Returns experience data for employee
 *
 * @param exp - An array of objects.
 * @return String - experience
 */
function getCustomerOrgExp(exp) {
  let a = '';
  for (let i = 0; i < exp.length; i++) {
    a += exp[i].name;
    if (typeof exp[i].years !== 'undefined') {
      a += ' - ' + exp[i].years + ' years';
    }
    if (i + 1 < exp.length) {
      a += ', ';
    }
  }
  return a;
} // getCustomerOrgExp

/**
 * Returns education data for employee
 *
 * @param edu - An array of objects.
 * @return String - education
 */
function getEducation(edu) {
  let str = '';
  let result = [];
  if (edu) {
    // each school
    for (let i = 0; i < edu.length; i++) {
      // each degree within school
      edu[i].degrees.forEach((degree) => {
        str = edu[i].name + ': ';

        // each major within degree
        str += degree.degreeType + ' in ';
        degree.majors.forEach((major, i) => {
          if (i != 0) {
            str += ', ';
          }
          str += major;
        });

        str += ' - ' + degree.completionDate;
        result.push(str); // push each degree individually
      });
    }
  }
  return result;
} // getEducation

/**
 * Returns job data for employee
 *
 * @param job - An array of objects.
 * @return String - companies
 */
function getCompanies(companies) {
  let result = [];
  if (companies) {
    for (let i = 0; i < companies.length; i++) {
      result.push(`${companies[i].companyName}`);
      let positions = companies[i].positions;
      let pos;
      for (let j = 0; j < positions.length; j++) {
        pos = `    ${positions[j].title} - ${positions[j].startDate}`;
        if (positions[j].endDate !== null) {
          pos += ` to ${positions[j].endDate}`;
        } else {
          pos += ' to present';
        }
        result.push(pos);
      }
    }
  }
  return result;
} // getCompanies

/**
 * Returns tech data for employee
 *
 * @param tech - An array of objects.
 * @return String - technologies
 */
function getTechnologies(tech) {
  let a = '';
  for (let i = 0; i < tech.length; i++) {
    a += tech[i].name;
    if (i + 1 < tech.length) {
      a += ', ';
    }
  }
  return a;
} // getTechnologies

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
    filterUndefined,
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
