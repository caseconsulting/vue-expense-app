/**
 * Utilities to convert employee objects into objects passable to
 * csv.js
 */
import _ from 'lodash';
import moment from 'moment-timezone';
const csvUtils = require('@/utils/csv.js');

/**
 * Downloads array of employees as csv file.
 * @param employees - array of employee objects
 */
export function download(employees) {
  let convertedEmployees = convertEmployees(employees); // convert employees into csv object
  let csvEmployees = csvUtils.sort(convertedEmployees, 'Employee #'); // sort by employee #
  let csvFileString = csvUtils.generate(csvEmployees); // convert to csv file string
  csvUtils.download(csvFileString); // download csv file string as .csv
} // download

/**
 * Converts employees to an array of objects to pass in to csvUtils.generate(). Expects
 * an array of employees but supports having a single employee object.
 * @param employee - employee object to convert
 * @return a new object passable to csv.js
 */
export function convertEmployees(employees) {
  if (!Array.isArray(employees)) employees = [employees];
  let tempEmployees = [];
  _.forEach(employees, (employee) => {
    let placeOfBirth = [employee.city, employee.st, employee.country].join(' ');
    tempEmployees.push({
      'Employee #': employee.employeeNumber || '',
      'First Name': employee.firstName || '',
      'Middle Name': employee.middleName || '',
      'Last Name': employee.lastName || '',
      'Birthday (yy-mm-dd)': employee.birthday || '',
      'Place of Birth': placeOfBirth || '',
      'Hire Date': employee.hireDate || '',
      'Job Role': employee.jobRole || '',
      Email: employee.email || '',
      'Mifi Status': employee.mifiStatus != undefined && employee.mifiStatus != null ? employee.mifiStatus : 'true',
      Twitter: employee.twitter || '',
      Github: employee.github || '',
      LinkedIn: employee.linkedIn || '',
      'Expense App Role': employee.employeeRole || '',
      Status: getWorkStatus(employee.workStatus) || '',
      Awards: filterUndefined(employee.awards, getAwards) || '',
      Certifications: filterUndefined(employee.certifications, getCertifications) || '',
      Clearance: filterUndefined(employee.clearances, getClearances) || '',
      Contracts: filterUndefined(employee.contracts, getContracts) || '',
      'Customer Org': filterUndefined(employee.customerOrgExp, getCustomerOrgExp) || '',
      Education: filterUndefined(employee.schools, getEducation) || '',
      'Job Experience': filterUndefined(employee.companies, getCompanies) || '',
      Technology: filterUndefined(employee.technologies, getTechnologies) || '',
      id: employee.id || ''
    });
  });
  return tempEmployees;
} // convertEmployees

/**
 * Returns a work status 'Full Time', 'Part Time', 'Inactive', or 'Invalid Status'.
 *
 * @param workStatus - employee work status
 * @return String - work status description
 */
export function getWorkStatus(workStatus) {
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
export function filterUndefined(data, func) {
  let a = '';
  if (typeof data === 'object') {
    a = func(data);
  }
  return a;
} // filterUndefined

/**
 * Returns award data for employee
 *
 * @param awards - An array of objects.
 * @return String - awards
 */
export function getAwards(awards) {
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
export function getCertifications(certification) {
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
export function getClearances(clearance) {
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
 * Converts the contracts' projects' dates to number of years on the contract
 *
 * @param contract the contract to get the info from
 * @return number - number of years on the contract
 */
export function getContractLengthInYears(contract) {
  let total = moment.duration();
  if (contract.projects) {
    contract.projects.forEach((project) => {
      total.add(moment.duration(getProjectLengthInYears(project)));
    });
  }
  return total.asYears().toFixed(1);
} // getContractLengthInYears

/**
 * Converts the intervals to length of time in years
 *
 * @param project the project to convert
 * @return number - time in years
 */
export function getProjectLengthInYears(project) {
  let startMoment = moment(project.startDate);
  let endMoment = moment(project.endDate);
  let length;
  if (project.endDate) {
    length = moment.duration(endMoment.diff(startMoment));
  } else {
    length = moment.duration(moment().diff(startMoment));
  }
  return length.add(1, 'month'); // add one month to include end month in calculation.
} // getProjectLengthInYears

/**
 * Returns contract data for employee
 *
 * @param contract - An array of objects.
 * @return String - contract
 */
export function getContracts(contracts) {
  let str = '';
  let result = [];
  if (contracts) {
    contracts.forEach((contract) => {
      str = contract.name + ' - ' + contract.prime + ' (Projects: ';
      contract.projects.forEach((project, i) => {
        if (i != 0) {
          str += ', ';
        }
        str += project.name + ' - ' + getProjectLengthInYears(project).asYears().toFixed(1) + ' years';
      });
      str += ')';
      if (contract.projects.length > 1) {
        str += ' Total Time: ' + getContractLengthInYears(contract) + ' years';
      }
      result.push(str);
    });
  }
  return result;
} // getContracts

/**
 * Returns experience data for employee
 *
 * @param exp - An array of objects.
 * @return String - experience
 */
export function getCustomerOrgExp(exp) {
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
export function getEducation(edu) {
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

        if (!_.isEmpty(degree.concentrations)) {
          str += ' (Concentrations: ';
          degree.concentrations.forEach((concentration, i) => {
            if (i != 0) {
              str += ', ';
            }
            str += concentration;
          });
          str += ')';
        }

        if (!_.isEmpty(degree.minors)) {
          str += ' (Minors: ';
          degree.minors.forEach((minor, i) => {
            if (i != 0) {
              str += ', ';
            }
            str += minor;
          });
          str += ')';
        }

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
export function getCompanies(companies) {
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
export function getTechnologies(tech) {
  let a = '';
  for (let i = 0; i < tech.length; i++) {
    a += tech[i].name;
    if (i + 1 < tech.length) {
      a += ', ';
    }
  }
  return a;
} // getTechnologies
