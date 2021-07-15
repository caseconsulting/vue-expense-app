<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" @click.stop="download" text icon>
        <i class="material-icons pt-1" :style="iconColor()">file_download</i>
      </v-btn>
    </template>
    <span>Download CSV</span>
  </v-tooltip>
</template>

<script>
import moment from 'moment-timezone';
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
  let placeOfBirth = getPlaceOfBirth(person.city, person.st, person.country);
  let education = getEducation(person.degrees);
  let jobExperience = getJobs(person.jobs);
  let certifications = getCertifications(person.certifications);
  let awards = getAwards(person.awards);
  let technologies = getTechnologies(person.technologies);
  let contracts = getContracts(person.contracts);
  let customerOrg = getCustomerOrgExp(person.customerOrgExp);
  let clearances = getClearances(person.clearances);
  let languages = getLanguages(person.languages);

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
    [getWorkStatus(person.workStatus) || ''],
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

    infoList.push(currInfo);
  });

  return infoList;
} // getInfo

/**
 * Gets the icon color depending if the page is employees or an employee profile
 */
function iconColor() {
  if (this.color) {
    return 'color: ' + this.color + ';';
  }
}

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

/**
 * Returns formatted place of birth for employee
 *
 * @param city, state, country - strings
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
} // getClearance

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
 * @return String - jobs
 */
function getJobs(job) {
  let str = '';
  let result = [];
  if (job) {
    for (let i = 0; i < job.length; i++) {
      str = job[i].company + ' - ' + job[i].position + ' - ' + job[i].startDate;
      if (job[i].endDate) {
        str += ' to ' + job[i].endDate;
      }
      result.push(str);
    }
    return result;
  }
  return result;
} // getJobs

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
      let years = 0;
      years = yearsOfExperience(tech[i]);
      str += years + ' years';
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
 * Calculates years of experience for a technology based on monthsOfExperience.
 *
 * @param technology - technology object
 * @return years of expierence (decimal with 2 decimal places)
 */
function yearsOfExperience(technology) {
  let totalMonths = 0;
  //calculates total number of months
  for (let i = 0; !isEmpty(technology.dateIntervals) && i < technology.dateIntervals.length; i++) {
    totalMonths += monthsPassed(technology.dateIntervals[i].startDate, technology.dateIntervals[i].endDate);
  }

  if (totalMonths > 0) {
    let years = totalMonths / 12; //calculates years of experience
    return Math.round((years + Number.EPSILON) * 100) / 100; //rounds to 2 decimal places
  }
  return technology.years ? technology.years : 0; //if uses old technology.years then use that or set to 0
} // yearsOfExperience

/**
 * Calculates the number of months that have passed between 2 dates in YYYY-MM format.
 *
 * @param start - the time interval starting date
 * @param end - the time interval ending date
 */
function monthsPassed(start, end) {
  let startDate = start;
  let endDate = end;
  let totalTimePassed = 0;

  //if there is no end date use interval start - now
  if (isEmpty(endDate)) {
    endDate = moment().format('YYYY-MM');
  }

  //makes sure that the start and end date are both not empty
  if (!isEmpty(startDate) && !isEmpty(endDate)) {
    let monthsStart = Number(moment(startDate, 'YYYY-MM').format('MM'));
    let yearsStart = Number(moment(startDate, 'YYYY-MM').format('YYYY'));

    let monthsEnd = Number(moment(endDate, 'YYYY-MM').format('MM'));
    let yearsEnd = Number(moment(endDate, 'YYYY-MM').format('YYYY'));

    let absoluteStartMonths = monthsStart + yearsStart * 12; //calculates absolute number of months for start date
    let absoluteEndMonths = monthsEnd + yearsEnd * 12; //calculates absolute number of years for end date

    totalTimePassed = absoluteEndMonths - absoluteStartMonths; //total number of months
  }

  return totalTimePassed;
} //monthsPassed

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
    getInfo,
    parseDateInterval,
    getAwards,
    getCertifications,
    getClearances,
    getContracts,
    getCustomerOrgExp,
    getEducation,
    getJobs,
    getTechnologies,
    getLanguages,
    iconColor,
    isEmpty,
    yearsOfExperience,
    monthsPassed
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
