<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" @click.stop="download" text icon>
        <icon class="mx-2 mt-1" scale="1.5" :color="iconColor()" name="cloud-download-alt"></icon>
      </v-btn>
    </template>
    <span>Download CSV</span>
  </v-tooltip>
</template>

<script>
import { isEmpty } from '@/utils/utils';
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Converts an object into a csv string.
 *
 * @param objArray - Object to convert
 *  The format for objArray is as follows:
 *    -The first dimension is the type of info, i.e. technology, education, etc
 *    -The second dimension is the instance of that type of info in string form, i.e. tech 1, tech 2, etc
 * @return String - csv of object
 */
function convertToCSV(objArray) {
  //Get max length
  let maxLength = 0;
  for (let i = 0; i < objArray.length; i++) {
    if (maxLength < objArray[i].length) {
      maxLength = objArray[i].length;
    }
  }
  let outString = '';
  for (let i = 0; i < maxLength; i++) {
    let currLine = '';
    for (let j = 0; j < objArray.length; j++) {
      if (i < objArray[j].length) {
        currLine += `"${objArray[j][i]}"`;
      } else {
        currLine += '""';
      }
      if (j != objArray.length - 1) {
        currLine += ',';
      }
    }
    outString += currLine + '\r\n';
  }
  return outString;
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
  let placeOfBirth = this.getPlaceOfBirth(person.city, person.st, person.country);
  let education = this.getEducation(person.degrees);
  let jobExperience = this.getCompanies(person.companies);
  let certifications = this.getCertifications(person.certifications);
  let awards = this.getAwards(person.awards);
  let technologies = this.getTechnologies(person.technologies);
  let contracts = this.getContracts(person.contracts);
  let customerOrg = this.getCustomerOrgExp(person.customerOrgExp);
  let clearances = this.getClearances(person.clearances);
  let languages = this.getLanguages(person.languages);

  let tempEmployee = [
    [person.firstName || ''], //Start of employee
    [person.middleName || ''],
    [person.lastName || ''],
    [person.employeeNumber || ''],
    [person.email || ''],
    [person.prime || ''],
    [person.contract || ''],
    [person.jobRole || ''],
    [person.employeeRole || ''],
    [person.hireDate || ''],
    [this.getWorkStatus(person.workStatus) || ''],
    [person.mifiStatus != undefined && person.mifiStatus != null ? person.mifiStatus : 'true'],
    [person.github || ''], //Start of personal
    [person.twitter || ''],
    [person.linkedIn || ''],
    [person.birthday || ''],
    [placeOfBirth || ''],
    education,
    jobExperience,
    certifications,
    awards,
    technologies,
    contracts,
    customerOrg,
    clearances,
    languages,
    [person.id || '']
  ];

  this.headers = [
    ['First Name'],
    ['Middle Name'],
    ['Last Name'],
    ['Employee #'],
    ['Email'],
    ['Prime'],
    ['Contract'],
    ['Job Role'],
    ['Expense App Role'],
    ['Hire Date (yyyy-mm-dd)'],
    ['Status'],
    ['Mifi Status'],
    ['Github'],
    ['Twitter'],
    ['LinkedIn'],
    ['Birthday (yyyy-mm-dd)'],
    ['Place of Birth'],
    ['Education'],
    ['Job Experience'],
    ['Certifications'],
    ['Awards'],
    ['Technologies'],
    ['Contracts'],
    ['Customer Organization Experience'],
    ['Clearances'],
    ['Languages'],
    ['id']
  ];

  tempEmployee.forEach((employeeInfo, index) => {
    employeeInfo.unshift(this.headers[index]);
  });

  var csv = this.convertToCSV(tempEmployee);

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
 * Gets the icon color depending if the page is employees or an employee profile
 */
function iconColor() {
  if (this.color) {
    return this.color;
  }
  return '#3f3f3c';
} // iconColor

/**
 * Returns formatted place of birth for employee
 *
 * @param city
 * @param state
 * @param country
 * @return result - string
 */
function getPlaceOfBirth(city, state, country) {
  let result = '';
  if (city && state && country) {
    result = city + ', ' + state + ', ' + country;
  } else if (!city && state && country) {
    result = state + ', ' + country;
  } else if (!city && !state && country) {
    result = country;
  } else if (city && !state && country) {
    result = city + ', ' + country;
  } else if (city && !state && !country) {
    result = city;
  }
  return result;
} // getPlaceOfBirth

/**
 * Returns award data for employee
 *
 * @param awards - An array of objects.
 * @return String - awards
 */
function getAwards(awards) {
  let str = '';
  let result = [];
  if (awards) {
    for (let i = 0; i < awards.length; i++) {
      str = awards[i].name + ' - ' + awards[i].dateReceived;
      result.push(str);
    }
    return result;
  }
  return result;
} // getAwards

/**
 * Returns certification data for employee
 *
 * @param certification - An array of objects.
 * @return String - certifications
 */
function getCertifications(certification) {
  let str = '';
  let result = [];
  if (certification) {
    for (let i = 0; i < certification.length; i++) {
      str = certification[i].name + ' - ' + certification[i].dateReceived;
      if (certification[i].expirationDate) {
        str += ' to ' + certification[i].expirationDate;
      } else {
        str += ' to present';
      }
      result.push(str);
    }
    return result;
  }
  return result;
} // getCertifications

/**
 * Returns clearance data for employee
 *
 * @param clearance - An array of objects.
 * @return String - clearance
 */
function getClearances(clearance) {
  let str = '';
  let result = [];
  if (clearance) {
    for (let i = 0; i < clearance.length; i++) {
      str = clearance[i].type;
      if (clearance[i].grantedDate) {
        str += ': granted on ' + clearance[i].grantedDate;
      }
      if (clearance[i].expirationDate) {
        str += ', expires on ' + clearance[i].expirationDate;
      }
      if (clearance.length[i + 1]) {
        str += ', ';
      }
      result.push(str);
    }
    return result;
  }
  return result;
} // getClearances

/**
 * Returns contract data for employee
 *
 * @param contract - An array of objects.
 * @return String - contract
 */
function getContracts(contract) {
  let str = '';
  let result = [];
  if (contract) {
    for (let i = 0; i < contract.length; i++) {
      str = contract[i].name + ' - ' + contract[i].prime;
      if (contract[i].years) {
        str += ' - ' + contract[i].years + ' years';
      }
      if (contract[i].current) {
        str += ', Current';
      }
      result.push(str);
    }
    return result;
  }
  return result;
} // getContracts

/**
 * Returns experience data for employee
 *
 * @param exp - An array of objects.
 * @return String - experience
 */
function getCustomerOrgExp(exp) {
  let str = '';
  let result = [];
  if (exp) {
    for (let i = 0; i < exp.length; i++) {
      str = exp[i].name + ' - ' + exp[i].years + ' years';
      if (exp[i].current) {
        str += ', current';
      }
      result.push(str);
    }
    return result;
  }
  return result;
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
    for (let i = 0; i < edu.length; i++) {
      str = edu[i].school + ' - ' + edu[i].name;
      for (let j = 0; j < edu[i].majors.length; j++) {
        str += ' - ' + edu[i].majors[j];
      }
      str += ' - ' + edu[i].date;
      result.push(str);
    }
    return result;
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
  return result;
} // getCompanies

/**
 * Returns tech data for employee
 *
 * @param tech - An array of objects.
 * @return String - technologies
 */
function getTechnologies(tech) {
  let str = '';
  let result = [];
  if (tech) {
    for (let i = 0; i < tech.length; i++) {
      str = tech[i].name + ' - ';
      str += tech[i].years + ' years';
      if (tech[i].current) {
        str += ' - current';
      }
      result.push(str);
    }
    return result;
  }
  return result;
} // getTechnologies

/**
 * Returns language data for employee
 *
 * @param lang - An array of objects.
 * @return String - language
 */
function getLanguages(lang) {
  let str = '';
  let result = [];
  if (lang) {
    for (let i = 0; i < lang.length; i++) {
      str = lang[i].name + ': ' + lang[i].proficiency;
      result.push(str);
    }
    return result;
  }
  return result;
} // getLanguages

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
    getAwards,
    getCertifications,
    getClearances,
    getContracts,
    getCustomerOrgExp,
    getEducation,
    getPlaceOfBirth,
    getCompanies,
    getTechnologies,
    getLanguages,
    iconColor,
    isEmpty
  },
  props: ['employee', 'midAction', 'color'] // employees to export
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}

.icon-white {
  color: white;
}
</style>
