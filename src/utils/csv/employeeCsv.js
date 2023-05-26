/**
 * Utilities to convert employee objects into objects passable to
 * csv.js
 */
import _ from 'lodash';
import { difference, format, getTodaysDate, minimum } from '@/shared/dateUtils';
const csvUtils = require('./baseCsv.js');

/**
 * Downloads array of employees as csv file.
 * @param employees - array of employee objects
 * @param contracts - the contracts from DyanmoDB to connect employee contract IDs to
 */
export function download(employees, contracts, tags) {
  let filename = Array.isArray(employees) ? 'employees.csv' : 'employee.csv';
  let convertedEmployees = convertEmployees(employees, contracts, tags); // convert employees into csv object
  let csvEmployees = csvUtils.sort(convertedEmployees, 'Employee #'); // sort by employee #
  let csvFileString = csvUtils.generate(csvEmployees); // convert to csv file string
  csvUtils.download(csvFileString, filename); // download csv file string as .csv
} // download

/**
 * Converts employees to an array of objects to pass in to csvUtils.generate(). Expects
 * an array of employees but supports having a single employee object.
 * @param employees - employee object to convert
 * @param contracts - the contracts from DyanmoDB to connect employee contract IDs to
 * @param tags - tags attached to employees
 * @return a new object passable to csv.js
 */
export function convertEmployees(employees, contracts, tags) {
  if (!Array.isArray(employees)) employees = [employees];
  let tempEmployees = [];
  _.forEach(employees, (employee) => {
    let placeOfBirth = [employee.city, employee.st, employee.country].join(' ');
    let contractsPrimesProjects = getContractPrimeProject(employee.contracts, contracts);
    let clearanceData = getClearancesData(employee.clearances);
    tempEmployees.push({
      'Employee #': employee.employeeNumber || '',
      'First Name': employee.firstName || '',
      'Middle Name': employee.middleName || '',
      'Last Name': employee.lastName || '',
      'Birthday (yy-mm-dd)': employee.birthday || '',
      'Place of Birth': placeOfBirth || '',
      'State of Residence': employee.currentState || '',
      'Hire Date': employee.hireDate || '',
      'Job Role': employee.jobRole || '',
      AIN: employee.agencyIdentificationNumber || '',
      Email: employee.email || '',
      'Mifi Status': employee.mifiStatus != undefined && employee.mifiStatus != null ? employee.mifiStatus : 'true',
      Twitter: employee.twitter || '',
      Github: employee.github || '',
      LinkedIn: employee.linkedIn || '',
      'Expense App Role': employee.employeeRole || '',
      Status: getWorkStatus(employee.workStatus) || '',
      Awards: filterUndefined(employee.awards, getAwards) || '',
      Certifications: filterUndefined(employee.certifications, getCertifications) || '',
      Clearance: clearanceData.titles || '',
      'Submission Date': clearanceData.submissionDates || '',
      'Granted Date': clearanceData.grantedDates || '',
      'BI Dates': clearanceData.biDates || '',
      'Poly Dates': clearanceData.polyDates || '',
      'Adjudication Dates': clearanceData.adjudicationDates || '',
      'Badge Number': clearanceData.badgeNum || '',
      'Badge Expiration Date': clearanceData.badgeExpDate || '',
      Contracts: contractsPrimesProjects.contracts,
      Primes: contractsPrimesProjects.primes,
      Projects: contractsPrimesProjects.projects,
      'Customer Org': filterUndefined(employee.customerOrgExp, getCustomerOrgExp) || '',
      Education: filterUndefined(employee.education, getEducation) || '',
      'Job Experience': filterUndefined(employee.companies, getCompanies) || '',
      Technology: filterUndefined(employee.technologies, getTechnologies) || '',
      Tags: getTags(employee.id, tags) || '',
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
 * @return Object - clearance data
 */
export function getClearancesData(clearances) {
  let data = {
    titles: '',
    submissionDates: '',
    grantedDates: '',
    biDates: '',
    polyDates: '',
    adjudicationDates: '',
    badgeNum: '',
    badgeExpDate: ''
  };
  if (clearances) {
    for (let i = 0; i < clearances.length; i++) {
      data.titles += clearances[i].type + `${clearances[i].awaitingClearance ? ' (awaiting clearance)' : ''}`;
      data.submissionDates += clearances[i].submissionDate ? clearances[i].submissionDate : 'No Date';
      data.grantedDates += clearances[i].grantedDate ? clearances[i].grantedDate : 'No Date';
      data.biDates += clearances[i].biDates.length > 0 ? clearances[i].biDates.join(' & ') : 'No Dates';
      data.polyDates += clearances[i].polyDates.length > 0 ? clearances[i].polyDates.join(' & ') : 'No Dates';
      data.adjudicationDates +=
        clearances[i].adjudicationDates.length > 0 ? clearances[i].adjudicationDates.join(' & ') : 'No Dates';
      data.badgeNum += clearances[i].badgeNum ? clearances[i].badgeNum : 'No Number';
      data.badgeExpDate += clearances[i].badgeExpirationDate ? clearances[i].badgeExpirationDate : 'No Date';
      if (i + 1 < clearances.length) {
        data.titles += ', ';
        data.submissionDates += ', ';
        data.grantedDates += ', ';
        data.biDates += ', ';
        data.polyDates += ', ';
        data.adjudicationDates += ', ';
        data.badgeNum += ', ';
        data.badgeExpDate += ', ';
      }
    }
  }

  return data;
} // getClearancesData

/**
 * Converts the contracts' projects' dates to number of years on the contract
 *
 * @param contract the contract to get the info from
 * @return number - number of years on the contract
 */
export function getContractLengthInYears(contract) {
  let total = 0;
  if (contract.projects) {
    contract.projects.forEach((project) => {
      total += getProjectLengthInYears(project);
    });
  }
  return total;
} // getContractLengthInYears

/**
 * Converts the intervals to length of time in years
 *
 * @param project the project to convert
 * @return number - time in years
 */
export function getProjectLengthInYears(project) {
  let length;
  if (project.endDate) {
    length = difference(project.endDate, project.startDate, 'months');
  } else {
    length = difference(getTodaysDate(), project.startDate, 'months');
  }
  return length; // add one month to include end month in calculation.
} // getProjectLengthInYears

/**
 * Returns contract data for employee
 *
 * @param employeeContracts - An array of objects.
 * @param allContracts - the contracts from DyanmoDB to connect employee contract IDs to
 * @return String - contract
 */
export function getContractPrimeProject(employeeContracts, allContracts) {
  let result = [];
  let toReturn = {};
  let allProjects = allContracts.map((c) => c.projects).flat();
  if (employeeContracts) {
    _.forEach(employeeContracts, (contract) => {
      let earliestDate = getTodaysDate(); // keep track of earliest start date
      // create array of project strings
      let projects = [];
      _.forEach(contract.projects, (project) => {
        let p = allProjects.find((p) => p.id === project.projectId);
        projects.push(`${p.projectName} - ${(getProjectLengthInYears(project) / 12).toFixed(1)} years`);
        let endDate = format(project.endDate || getTodaysDate(), 'YYYY-MM-DD');
        earliestDate = minimum([earliestDate, endDate]);
      });
      // add current contract, attaching earliestDate for sorting
      let c = allContracts.find((c) => c.id === contract.contractId);
      result.push({
        contract: { name: c.contractName, prime: c.primeName },
        projects: projects,
        d: format(earliestDate, 'YYYYMMDD')
      });
    });
    // sort contracts by their earliest project start date
    result = _.orderBy(result, 'd', 'desc');
    // extract contracts, primes, and projects into separate strings
    toReturn = {
      contracts: _.map(result, (r) => {
        return r.contract.name;
      }).join(', '),
      primes: _.map(result, (r) => {
        return r.contract.prime;
      }).join(', '),
      projects: _.map(result, (r) => {
        return r.projects.join(', ');
      }).join(', ')
    };
  }
  return toReturn;
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
      a += ' - ' + parseFloat(exp[i].years).toFixed(1) + ' years';
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
export function getEducation(education) {
  let str = '';
  let university = [];
  let military = [];
  let highSchool = [];
  if (education) {
    _.forEach(education, (edu) => {
      // university type
      if (edu.type === 'university') {
        edu.degrees.forEach((degree) => {
          str = edu.name + ': ';

          // each major within degree
          str += degree.degreeType + ' in ';
          degree.majors.forEach((major, i) => {
            if (i != 0) {
              str += ', ';
            }
            str += major;
          });

          // add concentrations
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

          // add minors
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

          str += ' - Graduated ' + degree.completionDate;
          university.push({ str, date: degree.completeDate }); // push each degree individually
        });
      }

      // military type
      if (edu.type === 'military') {
        str = `${edu.branch}: ${edu.startDate} - ${edu.completeDate}`;
        military.push({ str, date: edu.completeDate });
      }

      // high school type
      if (edu.type === 'highSchool') {
        str = `${edu.name}: Graduated ${edu.gradDate}`;
        highSchool.push({ str, date: edu.gradDate });
      }
    });
  }
  // sort entries, filter out string, and combine
  university = _.sortBy(university, ['date']);
  military = _.sortBy(military, ['date']);
  highSchool = _.sortBy(highSchool, ['date']);
  let result = [
    ..._.map(university, (item) => {
      return item.str;
    }),
    ..._.map(military, (item) => {
      return item.str;
    }),
    ..._.map(highSchool, (item) => {
      return item.str;
    })
  ];

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
  let toPush;
  if (companies) {
    for (let i = 0; i < companies.length; i++) {
      toPush = `${companies[i].companyName} - `;
      let positions = companies[i].positions;
      let formattedPositions = [];
      for (let j = 0; j < positions.length; j++) {
        let endDate = positions[j].endDate === null ? 'present' : positions[j].endDate;
        formattedPositions.push(`${positions[j].title} (${positions[j].startDate} to ${endDate})`);
      }
      toPush += formattedPositions.join(', ');
      result.push(toPush);
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

/**
 * Returns tags assigned to employee
 * @param employeeID employeeID of employee
 * @param tags tags retrieved from db table
 * @returns String - comma separated list of tag names
 */
export function getTags(employeeID, tags) {
  let employeeTags = tags.filter((tag) => {
    if (tag.employees.includes(employeeID)) {
      return true;
    }
    return false;
  });
  return employeeTags && employeeTags.length > 0 ? employeeTags.map((t) => t.tagName).join(', ') : null;
} // getTags
