/**
 * Utilities to convert employee objects into objects passable to
 * csv.js
 */
import EmployeeCsvUtil from '@/utils/csv/employeeCsvUtil.js';
import _forEach from 'lodash/forEach';
import _orderBy from 'lodash/orderBy';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _sortBy from 'lodash/sortBy';
import { difference, format, getTodaysDate, minimum } from '@/shared/dateUtils';
import { getEmployeeCurrentAddress } from '@/shared/employeeUtils.js';

class EmployeeCsv extends EmployeeCsvUtil {

  /**
   * Gets employee date attribute
   *
   * @param employee
   * @param dateAttribute
   * @returns date attribute value in YYYY-MM-DD format
   */
  static getDate(employee, dateAttribute) {
    return format(employee[dateAttribute], null, 'YYYY-MM-DD') || '';
  } // getDate

  static getPlaceOfBirth(employee) {
    return [employee.city, employee.st, employee.country];
  } // getPlaceOfBirth

  /**
   * Returns phone numbers of a particular type. Returns both private and public numbers. This
   * will give you all numbers you have access to.
   *
   * @param e - employee object
   * @param type - type of phone number (probably 'Cell'/'Home'/'Work')
   */
  static getPhoneNumbers(e, type) {
    let combinedNumbers = [...(e.privatePhoneNumbers || []), ...(e.publicPhoneNumbers || [])];
    let matchedNumbers = [];
    for (let number of combinedNumbers) {
      if (number.type === type) matchedNumbers.push(number.number.replace(',', ''));
    }

    if (matchedNumbers.length === 0) return '';
    return matchedNumbers.join(', ');
  } // getPhoneNumbers

  /**
   * Returns a work status 'Full Time', 'Part Time', 'Inactive', or 'Invalid Status'.
   *
   * @param employee
   * @return String - work status description
   */
  static getWorkStatus(employee) {
    let workStatus = employee.workStatus;
    if (workStatus == 100) {
      return 'Full Time';
    } else if (workStatus == 0) {
      return 'Inactive';
    } else if (workStatus > 0 && workStatus < 100) {
      return `Part Time (${workStatus}%)`;
    } else {
      return 'Invalid Status';
    }
  } // getWorkStatus

  /**
   * Returns award data for employee
   *
   * @param employee
   * @return String - awards
   */
  static getAwards(employee) {
    let awards = employee.awards || [];
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
   * @param employee
   * @return String - certifications
   */
  static getCertifications(employee) {
    let certifications = employee.certifications || [];
    let a = '';
    for (let i = 0; i < certifications.length; i++) {
      a += certifications[i].name + ' - ' + format(certifications[i].dateReceived, null, 'YYYY-MM-DD');
      if (certifications[i].expirationDate) {
        a += ' to ' + certifications[i].expirationDate;
      }
      if (i + 1 < certifications.length) {
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
  static getClearancesData(clearances) {
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
  static getContractLengthInYears(contract) {
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
  static getProjectLengthInYears(project) {
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
  static getContractsInfo(employee, allContracts) {
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
          projects.push(`${p.projectName} - ${(this.getProjectLengthInYears(project) / 12).toFixed(1)} years`);
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
  static getCustomerOrgExp(employee) {
    let exp = employee.customerOrgExp || [];
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
  static getEducation(employee) {
    let education = employee.education || [];
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
  static getCompanies(employee) {
    let companies = employee.companies || [];
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
  static getTechnologies(employee) {
    let tech = employee.tech || [];
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
   * @param employee
   * @param tags tags retrieved from db table
   * @returns String - comma separated list of tag names
   */
  static getTags(employee, tags) {
    let employeeID = employee.id;
    let employeeTags = tags.filter((tag) => {
      if (tag.employees.includes(employeeID)) {
        return true;
      }
      return false;
    });
    return employeeTags && employeeTags.length > 0 ? employeeTags.map((t) => t.tagName).join(', ') : null;
  } // getTags

  static columns() {
    return [
      { title: 'First Name', attribute: 'firstName' },
      { title: 'Middle Name', attribute: 'middleName' },
      { title: 'Last Name', attribute: 'lastName' },
      { title: 'Birthday (yyyy-mm-dd)', date: 'birthday' },
      { title: 'Place of Birth', getter: this.getPlaceOfBirth },
      { title: 'State of Residence', attribute: 'currentState' },
      { title: 'Hire Date', date: 'hireDate' },
      { title: 'Job Role', attribute: 'jobRole' },
      { title: 'AIN', attribute: 'agencyIdentificationNumber' },
      { title: 'Resume Updated', date: 'resumeUpdated' },
      { title: 'Email', attribute: 'email' },
      { title: 'Phone (Cell)', phone: 'Cell' },
      { title: 'Phone (Home)', phone: 'Home' },
      { title: 'Phone (Work)', phone: 'Work' },
      { title: 'Twitter', attribute: 'twitter' },
      { title: 'Github', attribute: 'github' },
      { title: 'LinkedIn', attribute: 'linkedIn' },
      { title: 'Expense App Role', attribute: 'employeeRole' },
      { title: 'Status', getter: this.getWorkStatus },
      { title: 'Awards', getter: this.getAwards },
      { title: 'Certifications', getter: this.getCertifications },
      { title: 'Clearance', clearance: 'titles' },
      { title: 'Submission Date', clearance: 'submissionDates' },
      { title: 'Granted Date', clearance: 'grantedDates' },
      { title: 'BI Dates', clearance: 'biDates' },
      { title: 'Poly Dates', clearance: 'polyDates' },
      { title: 'Adjudication Dates', clearance: 'adjudicationDates' },
      { title: 'Badge Number', clearance: 'badgeNum' },
      { title: 'Badge Expiration Date', clearance: 'badgeExpDate' },
      { title: 'Contracts', contract: 'contracts' },
      { title: 'Primes', contract: 'primes' },
      { title: 'Projects', contract: 'projects' },
      { title: 'Work Locations', contract: 'workLocations' },
      { title: 'Work Types', contract: 'workTypes' },
      { title: 'Customer Org', getter: this.getCustomerOrgExp },
      { title: 'Education', getter: this.getEducation },
      { title: 'Job Experience', getter: this.getCompanies },
      { title: 'Technology', getter: this.getTechnologies },
      { title: 'Tags', tags: true },
      { title: 'id', attribute: 'id' },
    ];
  }
}

export default EmployeeCsv;
