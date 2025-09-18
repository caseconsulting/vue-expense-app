import _isEmpty from 'lodash/isEmpty';
import { getTodaysDate } from '@/shared/dateUtils';

export const EMPLOYEE_ROLES = ['Admin', 'User', 'Intern', 'Manager'];
export const PHONE_TYPES = ['Home', 'Cell', 'Work'];
export const CASE_EMAIL_DOMAIN = '@consultwithcase.com';

export const LANGUAGES = [
  'Afrikaans',
  'Arabic',
  'Bengali',
  'Catalan',
  'Cantonese',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'Lithuanian',
  'Malay',
  'Malayalam',
  'Panjabi',
  'Tamil',
  'Finnish',
  'French',
  'German',
  'Greek',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Indonesian',
  'Italian',
  'Japanese',
  'Javanese',
  'Korean',
  'Norwegian',
  'Polish',
  'Portuguese',
  'Romanian',
  'Russian',
  'Serbian',
  'Slovak',
  'Slovene',
  'Spanish',
  'Swedish',
  'Telugu',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Vietnamese',
  'Welsh',
  'Sign language',
  'Algerian',
  'Aramaic',
  'Armenian',
  'Berber',
  'Burmese',
  'Bosnian',
  'Brazilian',
  'Bulgarian',
  'Cypriot',
  'Corsica',
  'Creole',
  'Scottish',
  'Egyptian',
  'Esperanto',
  'Estonian',
  'Finn',
  'Flemish',
  'Georgian',
  'Hawaiian',
  'Indonesian',
  'Inuit',
  'Irish',
  'Icelandic',
  'Latin',
  'Mandarin',
  'Nepalese',
  'Sanskrit',
  'Tagalog',
  'Tahitian',
  'Tibetan',
  'Gypsy',
  'Wu'
];

export const PROFICIENCIES = [
  'Basic - most basic words that everyone uses',
  'Personal - words you know depending on your day-to-day activities (experiences, work, country, friends)',
  'Native-like - ability to use the language like a native speaker',
  'Literacy - fluency and broad vocabulary associated with high levels of education'
];

export const CLEARANCE_TYPES = ['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret'];

export const CUSTOMER_ORGS = [
  'DIR',
  'DDI',
  'DDI/ITE',
  'DDI/ADO',
  'DDI/OSE',
  'DDI/CCI',
  'DA',
  'DO',
  'DST',
  'DS',
  'Talent',
  'Mission Center',
  'DNI',
  'NGA',
  'NRO',
  'DoD',
  'Other'
];

/**
 * Given an employee returns the employee's full name. Ex. John Jacob Doe
 * @param {JSON} employee - employee object
 * @return Employee name in format First Middle Last
 */
export function fullName(employee) {
  const middleName = employee.middleName ? employee.middleName.trim() : '';
  return `${employee.firstName} ${middleName ? middleName + ' ' : ''}${employee.lastName}`;
} // fullName

/**
 * Given an employee returns the employee first and last name. Ex. John Jacob Doe -> John Doe
 * @param {JSON} employee - employee object
 * @return Employee name in format First Last
 */
export function firstAndLastName(employee) {
  return `${employee.firstName}` + ' ' + `${employee.lastName}`;
} // firstAndLastName

/**
 * Given an employee returns the employee nickname (when available) and last name
 * @param {JSON} employee - employee object
 * @return Employee nick name in format First Last
 */
export function nicknameAndLastName(employee) {
  let firstName = employee.nickname ? employee.nickname : employee.firstName;
  return `${firstName}` + ' ' + `${employee.lastName}`;
} // nicknameAndLastName

/**
 * Gets an employee object based on the employee ID parameter
 * @param {Number} employeeId - employee ID
 * @param {Array} employees - list of employees
 * @returns Employee object
 */
export function getEmployeeByID(employeeId, employees) {
  return employees.find((e) => e.id == employeeId);
} // getEmployeeByID

/**
 * Returns Employee's Current Address.
 *
 * @return String - current address.
 */
export function getEmployeeCurrentAddress(employee) {
  let currentAddress = '';
  if (!_isEmpty(employee.currentStreet)) {
    if (!_isEmpty(employee.currentStreet2)) {
      currentAddress += `${employee.currentStreet} ${employee.currentStreet2}, `;
    } else {
      currentAddress += `${employee.currentStreet}, `;
    }
  }
  if (!_isEmpty(employee.currentCity)) {
    currentAddress += `${employee.currentCity}, `;
  }
  if (!_isEmpty(employee.currentState)) {
    currentAddress += `${employee.currentState} `;
  }
  if (!_isEmpty(employee.currentZIP)) {
    currentAddress += `${employee.currentZIP} `;
  }
  if (currentAddress[currentAddress.length - 2] === ',') {
    currentAddress = currentAddress.slice(0, -2);
  } else {
    currentAddress = currentAddress.slice(0, -1);
  }
  return currentAddress;
} // getCurrentAddress

/**
 * Returns an array of employees current contracts
 *
 * @param employeeId - employee ID to find contracts for
 * @param employees - list of employees
 * @return array of contract objects
 */
export function getEmployeeCurrentContracts(employee) {
  return getEmployeeCurrentProjects(employee, true);
}

/**
 * Returns an array of employees current projects
 *
 *
 * @param employee - employee to get contracts for
 * @param returnContracts - whether to return contracts instead of projects
 * @return array of project objects (or contracts if specified)
 */
export function getEmployeeCurrentProjects(employee, returnContracts = false) {
  let currentContracts = [];
  let currentProjects = [];
  for (let c of employee.contracts ?? []) {
    for (let p of c.projects) {
      if (!p.endDate || p.endDate > getTodaysDate()) {
        currentProjects.push(p);
        currentContracts.push(c);
      }
    }
  }
  return returnContracts ? currentContracts : currentProjects;
}

/**
 * helper function: return true if any selected tag has employee listed under it.
 *
 * @param employeeId - the employee's ID
 * @param {Object} tagsInfo - object of selected tags array and flipped tags array
 * NOTE: make sure tagsInfo is the value object not the ref!
 *
 * @return true if the employee has a tag selected in filters
 */
export function selectedTagsHasEmployee(employeeId, tagsInfo) {
  const { selected, flipped } = tagsInfo;
  if (selected.length === flipped.length) {
    // all tags are flipped, include everyone by default
    // return false for employee if they are on ANY tag
    for (let tag of selected) {
      let inTag = tag.employees.includes(employeeId);
      if (inTag) return false;
    }
    return true;
  } else {
    // at least some tags are not flipped
    // return employees on unflipped tags, removing ones on flipped ones
    let inTag, tagFlipped;
    let includeInList = false;
    for (let tag of selected) {
      inTag = tag.employees.includes(employeeId);
      tagFlipped = flipped.includes(tag.id);
      if (inTag) includeInList = true;
      if (inTag && tagFlipped) return false;
    }
    return includeInList;
  }
} // selectedTagsHasEmployee

export default {
  CASE_EMAIL_DOMAIN,
  CLEARANCE_TYPES,
  EMPLOYEE_ROLES,
  LANGUAGES,
  PHONE_TYPES,
  PROFICIENCIES,
  fullName,
  firstAndLastName,
  nicknameAndLastName,
  getEmployeeByID,
  getEmployeeCurrentAddress,
  getEmployeeCurrentContracts,
  getEmployeeCurrentProjects,
  selectedTagsHasEmployee
};
