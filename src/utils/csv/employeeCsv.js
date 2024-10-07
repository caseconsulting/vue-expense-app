/**
 * Utilities to convert employee objects into objects passable to
 * csv.js
 */
import _forEach from 'lodash/forEach';
import _orderBy from 'lodash/orderBy';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _sortBy from 'lodash/sortBy';
import { difference, format, getTodaysDate, minimum } from '@/shared/dateUtils';
import { getEmployeeCurrentAddress } from '@/shared/employeeUtils.js';
import csvUtils from './baseCsv.js';

/**
 * Returns the CSV filestring as a string.
 *
 * @param employees - array of employee objects
 * @param contracts - contracts from DynamoDB to connect employee contract IDs to
 * @param tags - tags to connect employee tag IDs to
 * @return csv as a string
 */
export function fileString(employees, contracts, tags, includeEeoData = false) {
  let convertedEmployees = convertEmployees(employees, contracts, tags, includeEeoData); // convert employees into csv object
  let csvEmployees = csvUtils.sort(convertedEmployees, 'Employee #'); // sort by employee #
  return csvUtils.generate(csvEmployees); // convert to csv file string
}

/**
 * Downloads array of employees as csv file.
 * @param employees - array of employee objects
 * @param contracts - the contracts from DyanmoDB to connect employee contract IDs to
 */
export function download(employees, contracts, tags, filename = null) {
  if (!filename) filename = Array.isArray(employees) ? 'employees.csv' : 'employee.csv';
  let csvFileString = fileString(employees, contracts, tags);
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
export function convertEmployees(employees, contracts, tags, includeEeoData = false) {
  if (!Array.isArray(employees)) employees = [employees];
  let tempEmployees = [];
  _forEach(employees, (employee) => {
    try {
      let placeOfBirth = [employee.city, employee.st, employee.country];
      let contractsInfo = getContractsInfo(employee, contracts);
      let clearanceData = getClearancesData(employee.clearances);
      let data = {
        // NOTE: if you change this, please also change in the catch{} below
        'Employee #': employee.employeeNumber || '',
        'First Name': employee.firstName || '',
        'Middle Name': employee.middleName || '',
        'Last Name': employee.lastName || '',
        'Birthday (yyyy-mm-dd)': format(employee.birthday, null, 'YYYY-MM-DD') || '',
        'Place of Birth': placeOfBirth || '',
        'State of Residence': employee.currentState || '',
        'Hire Date': format(employee.hireDate, null, 'YYYY-MM-DD') || '',
        'Job Role': employee.jobRole || '',
        AIN: employee.agencyIdentificationNumber || '',
        'Resume Updated': format(employee.resumeUpdated, null, 'YYYY-MM-DD') || '',
        Email: employee.email || '',
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
        Contracts: contractsInfo.contracts || '',
        Primes: contractsInfo.primes || '',
        Projects: contractsInfo.projects || '',
        'Work Locations': contractsInfo.workLocations || '',
        'Work Types': contractsInfo.workTypes || '',
        'Customer Org': filterUndefined(employee.customerOrgExp, getCustomerOrgExp) || '',
        Education: filterUndefined(employee.education, getEducation) || '',
        'Job Experience': filterUndefined(employee.companies, getCompanies) || '',
        Technology: filterUndefined(employee.technologies, getTechnologies) || '',
        Tags: getTags(employee.id, tags) || '',
        id: employee.id || ''
      };
      if (includeEeoData) {
        data = {
          ...data,
          'Admin filled out form?': employee.eeoAdminHasFilledOutEeoForm ? 'Yes' : 'No',
          'Declined to self-identify?': employee.eeoDeclineSelfIdentify ? 'Yes' : 'No',
          Gender: employee.eeoGender?.text,
          'Has Disability?': employee.eeoHasDisability ? 'Yes' : 'No',
          'Hispanic or Latino?': employee.eeoHispanicOrLatino.value ? 'Yes' : 'No',
          'Protected Veteran?': employee.eeoIsProtectedVeteran ? 'Yes' : 'No',
          'Job Category': employee.eeoJobCategory?.text,
          'Race/Ethnicity': employee.eeoRaceOrEthnicity?.text
        };
      }
      tempEmployees.push(data);
    } catch (e) {
      console.log(
        `Error converting employee ${employee.firstName} ${employee.lastName} to CSV, skipping. Error message:`
      );
      console.log(e);
      let data = {
        'Employee #': `(ERROR) ${employee.employeeNumber}` || '',
        'First Name': '---',
        'Middle Name': '---',
        'Last Name': '---',
        'Birthday (yyyy-mm-dd)': '---',
        'Place of Birth': '---',
        'State of Residence': '---',
        'Hire Date': '---',
        'Job Role': '---',
        AIN: '---',
        'Resume Updated': '---',
        Email: '---',
        Twitter: '---',
        Github: '---',
        LinkedIn: '---',
        'Expense App Role': '---',
        Status: '---',
        Awards: '---',
        Certifications: '---',
        Clearance: '---',
        'Submission Date': '---',
        'Granted Date': '---',
        'BI Dates': '---',
        'Poly Dates': '---',
        'Adjudication Dates': '---',
        'Badge Number': '---',
        'Badge Expiration Date': '---',
        Contracts: '---',
        Primes: '---',
        Projects: '---',
        'Customer Org': '---',
        Education: '---',
        'Job Experience': '---',
        Technology: '---',
        Tags: '---',
        id: '---'
      };

      if (includeEeoData) {
        data = {
          ...data,
          'Admin filled out form?': '---',
          'Declined to self-identify?': '---',
          Gender: '---',
          'Has Disability?': '---',
          'Hispanic or Latino?': '---',
          'Protected Veteran?': '---',
          'Job Category': '---',
          'Race/Ethnicity': '---'
        };
      }

      tempEmployees.push(data);
    }
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
    a += awards[i].name + ' - ' + format(awards[i].dateReceived, null, 'YYYY-MM');
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
    a += certification[i].name + ' - ' + format(certification[i].dateReceived, null, 'YYYY-MM-DD');
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
  // formats dates when joining. assumes there is at least
  // one date in the `items` array.
  function joinAndFormat(items, glue = '', dateFormat = 'YYYY-MM-DD') {
    let product = format(items[0], null, dateFormat);
    let item;
    for (let i in items) {
      if (i == 0) continue;
      item = format(items[i], null, dateFormat);
      product += `${glue}${item}`;
    }
    return product;
  }

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
      data.submissionDates += clearances[i].submissionDate
        ? format(clearances[i].submissionDate, null, 'YYYY-MM-DD')
        : 'No Date';
      data.grantedDates += clearances[i].grantedDate
        ? format(clearances[i].grantedDate, null, 'YYYY-MM-DD')
        : 'No Date';
      data.biDates += clearances[i].biDates.length > 0 ? joinAndFormat(clearances[i].biDates, ' & ') : 'No Dates';
      data.polyDates += clearances[i].polyDates.length > 0 ? joinAndFormat(clearances[i].polyDates, ' & ') : 'No Dates';
      data.adjudicationDates +=
        clearances[i].adjudicationDates.length > 0 ? joinAndFormat(clearances[i].adjudicationDates, ' & ') : 'No Dates';
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
 * @param
 * @return String - contract
 */
export function getContractsInfo(employee, allContracts) {
  let result = [];
  let toReturn = {};
  let allProjects = allContracts.map((c) => c.projects).flat();
  if (employee.contracts) {
    _forEach(employee.contracts, (contract) => {
      let earliestDate = getTodaysDate(); // keep track of earliest start date
      // create array of project strings
      let projects = [];
      let workLocations = [];
      let workTypes = [];
      _forEach(contract.projects, (project) => {
        let p = allProjects.find((p) => p.id === project.projectId);
        projects.push(`${p.projectName} - ${(getProjectLengthInYears(project) / 12).toFixed(1)} years`);
        workLocations.push(
          project.workType === 'Remote' || (!project.workType && p.workType === 'Remote')
            ? getEmployeeCurrentAddress(employee)
            : project.location || p.location || 'No Location'
        );
        workTypes.push(project.workType || p.workType || 'No Work Type');
        let endDate = format(project.endDate || getTodaysDate(), null, 'YYYY-MM-DD');
        earliestDate = minimum([earliestDate, endDate]);
      });
      // add current contract, attaching earliestDate for sorting
      let c = allContracts.find((c) => c.id === contract.contractId);
      result.push({
        contract: { name: c.contractName, prime: c.primeName },
        projects: projects,
        workLocations: workLocations,
        workTypes: workTypes,
        d: format(earliestDate, null, 'YYYYMMDD')
      });
    });
    // sort contracts by their earliest project start date
    result = _orderBy(result, 'd', 'desc');
    // extract contracts, primes, and projects into separate strings
    toReturn = {
      contracts: _map(result, (r) => {
        return r.contract.name;
      }).join(', '),
      primes: _map(result, (r) => {
        return r.contract.prime;
      }).join(', '),
      projects: _map(result, (r) => {
        return r.projects.join(', ');
      }).join(', '),
      workLocations: _map(result, (r) => {
        return r.workLocations.join(', ');
      }).join(', '),
      workTypes: _map(result, (r) => {
        return r.workTypes.join(', ');
      }).join(', ')
    };
  }
  if (!employee.contracts || employee.contracts?.length === 0) {
    // employees not on a contract are assumed to be remote
    toReturn = {
      workLocations: getEmployeeCurrentAddress(employee),
      workTypes: 'Remote'
    };
  }
  return toReturn;
} // getContractsInfo

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
    _forEach(education, (edu) => {
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
          if (!_isEmpty(degree.concentrations)) {
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
          if (!_isEmpty(degree.minors)) {
            str += ' (Minors: ';
            degree.minors.forEach((minor, i) => {
              if (i != 0) {
                str += ', ';
              }
              str += minor;
            });
            str += ')';
          }

          if (degree.completionDate) str += ' - Graduated ' + format(degree.completionDate, null, 'YYYY-MM');
          university.push({ str, date: degree.completeDate }); // push each degree individually
        });
      }

      // military type
      if (edu.type === 'military') {
        str = `${edu.branch}${edu.startDate || edu.endDate ? ' ' : ''}`;
        if (edu.startDate) str += `${format(edu.startDate, null, 'YYYY-MM')}`;
        if (edu.startDate && edu.completeDate) str += ' - ';
        if (edu.completeDate) str += `${format(edu.completeDate, null, 'YYYY-MM')}`;
        military.push({ str, date: edu.completeDate });
      }

      // high school type
      if (edu.type === 'highSchool') {
        str = `${edu.name}`;
        if (edu.gradDate) str += `: Graduated ${format(edu.gradDate, null, 'YYYY-MM')}`;
        highSchool.push({ str, date: edu.gradDate });
      }
    });
  }
  // sort entries, filter out string, and combine
  university = _sortBy(university, ['date']);
  military = _sortBy(military, ['date']);
  highSchool = _sortBy(highSchool, ['date']);
  let result = [
    ..._map(university, (item) => {
      return item.str;
    }),
    ..._map(military, (item) => {
      return item.str;
    }),
    ..._map(highSchool, (item) => {
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
        let endDate = positions[j].endDate === null ? 'present' : format(positions[j].endDate, null, 'YYYY-MM-DD');
        formattedPositions.push(
          `${positions[j].title} (${format(positions[j].startDate, null, 'YYYY-MM-DD')} to ${endDate})`
        );
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

export default {
  download,
  fileString,
  convertEmployees,
  getWorkStatus,
  filterUndefined,
  getAwards,
  getCertifications,
  getClearancesData,
  getContractLengthInYears,
  getProjectLengthInYears,
  getContractsInfo,
  getCustomerOrgExp,
  getCompanies,
  getEducation,
  getTechnologies,
  getTags
};
