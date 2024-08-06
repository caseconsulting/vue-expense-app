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
 * Returns an array of employees current contracts
 *
 * @param employeeId - employee ID to find contracts for
 * @param employees - list of employees
 * @return array of contract objects
 */
export function getEmployeeCurrentContracts(employeeId, employees) {
  let currentContracts = [];
  // for some reason `employees.find()` is undefined
  let contracts = [];
  for (let e of employees) {
    if (e.id === employeeId) {
      contracts = e.contracts;
      break;
    }
  }
  // add any contract that has a current project
  for (let c of contracts ?? []) {
    for (let p of c.projects) {
      if (!p.endDate) {
        currentContracts.push(c);
        break;
      }
    }
  }
  return currentContracts;
}

/**
 * Returns an array of employees current projects
 *
 *
 * @param employeeId - employee ID to find projects for
 * @param employees - list of employees
 * @return array of contract objects
 */
export function getEmployeeCurrentProjects(employeeId, employees) {
  let currentProjects = [];
  // for some reason `employees.find()` is undefined
  let contracts = [];
  for (let e of employees) {
    if (e.id === employeeId) {
      contracts = e.contracts;
      break;
    }
  }
  // add any projects that are current
  for (let c of contracts ?? []) for (let p of c.projects) if (!p.endDate) currentProjects.push(p);
  // return :)
  return currentProjects;
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
  let inTag, tagFlipped;
  for (let i = 0; i < selected.length; i++) {
    inTag = selected[i].employees.includes(employeeId);
    tagFlipped = flipped.includes(selected[i].id);
    if (inTag != tagFlipped) {
      return true;
    }
  }
  return false;
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
  getEmployeeCurrentContracts,
  getEmployeeCurrentProjects,
  selectedTagsHasEmployee
};
