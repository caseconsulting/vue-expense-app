import api from '@/shared/api.js';
import MobileDetect from 'mobile-detect';
import _ from 'lodash';
import { getRole } from '@/utils/auth';
import { format, getTodaysDate, isAfter, isBefore, setYear, subtract, DEFAULT_ISOFORMAT } from '@/shared/dateUtils';
import store from '../../store/index';

/**
 * Async function to loop an array.
 *
 * @param array - Array of elements to iterate over
 * @param callback - callback function
 */
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
} // asyncForEach

/**
 * Converts seconds to hours with 2 decimal places if needed.
 *
 * @param {Number} seconds - The number of seconds
 */
export function formatNumber(number) {
  return number?.toFixed(2)?.replace(/[.,]00$/, '') || null; // removes decimals if a whole number
} // convertToHours

/**
 * Gets the current active anniversary budget year starting date in isoformat.
 *
 * @param hireDate - The hire date of an employee (YYYY-MM-DD)
 * @return String - current active anniversary budget date (YYYY-MM-DD)
 */
export function getCurrentBudgetYear(hireDate) {
  if (isAfter(getTodaysDate(), hireDate)) {
    hireDate = setYear(hireDate, parseInt(getTodaysDate('YYYY')));
    if (isBefore(getTodaysDate(), hireDate)) {
      hireDate = subtract(hireDate, 1, 'years');
    }
  }
  return format(hireDate, null, DEFAULT_ISOFORMAT);
} // getCurrentBudgetYear

/**
 * Generates a random v4 UUID from the native Node.js crypto function.
 *
 * @returns String - A random v4 UUID
 */
export function generateUUID() {
  return window.crypto.randomUUID();
} // generateUUID

/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
export function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0) || (_.isArray(value) && _.isEmpty(value));
} // isEmpty

/**
 * Checks if an employee is full time. Returns true if the employee is full time, otherwise returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is full time
 */
export function isFullTime(employee) {
  return employee.workStatus == 100;
} // isFullTime

/**
 * Checks if an employee is inactive. Returns true if the employee is inactive with a work status of 0, otherwise
 * returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is inactive
 */
export function isInactive(employee) {
  return employee.workStatus == 0;
} // isInactive

/**
 * Checks if the current device used is mobile. Return true if it is mobile. Returns false if it is not mobile.
 *
 * @return boolean - if the device is mobile
 */
export function isMobile() {
  let md = new MobileDetect(window.navigator.userAgent);
  return md.os() === 'AndroidOS' || md.os() === 'iOS';
} // isMobile

/**
 * Checks if an employee is part time. Returns true if the employee is part time with a work status between 0 and 100,
 * otherwise returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is part time
 */
export function isPartTime(employee) {
  return employee.workStatus > 0 && employee.workStatus < 100;
} // isPartTime

/**
 * Checks if the window width is a small size.
 *
 * @returns Boolean - True if the window is a smaller size.
 */
export function isSmallScreen() {
  return window.innerWidth < 960;
} // isSmallScreen

/**
 * Convert a value to a 2 deciaml currency with prepended $.
 *
 * @param value - value to convert
 * @return String - money format
 */
export function convertToMoneyString(value) {
  return `${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`;
} // convertToMoneyString

/**
 * Returns a date formated as 'MMM Do, YYYY' (Aug 18th, 2020).
 *
 * @param date - date to format
 * @return String - date formated
 */
export function monthDayYearFormat(date) {
  return !isEmpty(date) ? format(date, null, 'MMM Do, YYYY') : '';
} // monthDayYearFormat

/**
 * Returns a date formated as 'MMM YYYY' (Aug 2020).
 *
 * @param date - date to format
 * @return String - date formated
 */
export function monthYearFormat(date) {
  return !isEmpty(date) ? format(date, null, 'MMM YYYY') : '';
} // monthYearFormat

/**
 * Returns a date formated as 'MMM YYYY' (Aug 2020).
 *
 * @param date - date to format in string form
 * @return String - date formated
 */
export function monthYearFormatFromString(stringDate) {
  let pieces = stringDate.split('/');
  return MONTHS[parseInt(pieces[0])] + ' ' + pieces[1];
} // monthYearFormat

/**
 * Returns a date formated as 'MMM, YYYY' (Aug, 2020).
 *
 * @param date - date to format
 * @return String - date formated
 */
export function monthYearFormatBETA(date) {
  return !isEmpty(date) ? format(date, null, 'MMM, YYYY') : '';
} // monthYearFormat

/**
 * Opens a link in a new tab.
 *
 * @param link String - the link to open
 */
export function openLink(link) {
  window.open(link, '_blank');
} // openLink

/**
 * Updates the login date and creates audit for the employee.
 * @param {employee} employee the employee to update
 */
export async function updateEmployeeLogin(employee) {
  await Promise.all([
    api.updateItem(api.EMPLOYEES, employee), // updates last logged in for employee
    api.createItem(api.AUDIT, {
      id: generateUUID(),
      type: 'login',
      tags: ['account'],
      employeeId: employee.id,
      description: `${employee.firstName} ${employee.lastName} has logged in`,
      timeToLive: 60
    })
  ]); // Create an audit of the success
  if (store.getters.employees) {
    let employees = store.getters.employees;
    let i = employees.findIndex((emp) => emp.id === employee.id);
    employees[i] = employee;
    store.dispatch('setLoginTime', { employees });
  }
} // updateEmployee

/**
 * Checks if the state management store is populated or not.
 * Register this as a computed property.
 *
 * If JS code needs to be run when the store is populated,
 * set a watcher on this computed property.
 *
 * See Employees.vue for an example.
 *
 * @return boolean - if the store is populated
 */
export function storeIsPopulated() {
  return store.getters.storeIsPopulated;
} // storeIsPopulated

/**
 * Checks whether the current user role is admin
 *
 * @return - boolean: true if the user role is admin
 */
export function userRoleIsAdmin() {
  return getRole() === 'admin';
} //userRoleIsAdmin

/**
 * Checks whether the current user role is manager
 *
 * @return - boolean: true if the user role is manager
 */
export function userRoleIsManager() {
  return getRole() === 'manager';
} //userRoleIsManager

/**
 * Checks whether the current user role is user
 *
 * @return - boolean: true if the user role is a user
 */
export function userRoleIsUser() {
  return getRole() === 'user';
} //userRoleIsUser

/**
 * Checks whether the current user role is intern
 *
 * @return - boolean: true if the user role is intern
 */
export function userRoleIsIntern() {
  return getRole() === 'intern';
} //userRoleIsIntern

/**
 * Helper function to sort Items by their dataReceieved property
 * @param {*} items - A list of objects each incluing the dateReceived property
 * @returns sortedList - A list of items sorted by their dateReceived properties in decending order
 */
export function sortByDateReceived(items) {
  const dateToNumber = (date) => (date ? Number(format(date, null, 'YYYYMMDD')) : 0);
  const sortedItems = items.toSorted((itemA, itemB) => {
    return dateToNumber(itemB.dateReceived) - dateToNumber(itemA.dateReceived);
  });
  return sortedItems;
}

/**
 * Helper function to sort languages by proficiency, highest to lowest: Literacy, Native-like, Personal, Basic
 * @param {object[]} languages - List of known languages
 * @return filteredList - A list of languages sorted by proficiency
 */
export function sortLanguagesByProficiency(languages) {
  const levelProficiency = [
    'Literacy - fluency and broad vocabulary associated with high levels of education',
    'Native-like - ability to use the language like a native speaker',
    'Personal - words you know depending on your day-to-day activities (experiences, work, country, friends)',
    'Basic - most basic words that everyone uses'
  ];
  const compare = (languageA, languageB) => {
    return levelProficiency.indexOf(languageA.proficiency) - levelProficiency.indexOf(languageB.proficiency);
  };
  const sortedByProficiency = languages.toSorted(compare);
  return sortedByProficiency;
}

export const STATES = {
  AL: 'Alabama',
  AK: 'Alaska',
  AS: 'American Samoa',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District Of Columbia',
  FM: 'Federated States Of Micronesia',
  FL: 'Florida',
  GA: 'Georgia',
  GU: 'Guam',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MH: 'Marshall Islands',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  MP: 'Northern Mariana Islands',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PW: 'Palau',
  PA: 'Pennsylvania',
  PR: 'Puerto Rico',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VI: 'Virgin Islands',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming'
}; //states

export const COUNTRIES = [
  'United States',
  'Afghanistan',
  'Akrotiri',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antarctica',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Aruba',
  'Ashmore and Cartier Islands',
  'Australia',
  'Austria',
  'Azerbaijan',
  '"Bahamas, The"',
  'Bahrain',
  'Baker Island',
  'Bangladesh',
  'Barbados',
  'Bassas da India',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia',
  '"Bonaire, Sint Eustatius, and Saba"',
  'Bosnia and Herzegovina',
  'Botswana',
  'Bouvet Island',
  'Brazil',
  'British Indian Ocean Territory',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burma',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cayman Islands',
  'Central Africa Republic',
  'Chad',
  'Chile',
  'China',
  'Christmas Island',
  'Clipperton Island',
  'Cocos (Keeling) Islands',
  'Colombia',
  'Comoros',
  'Congo (Brazzaville)',
  'Congo (Kinshasa)',
  'Cook Islands',
  'Coral Sea Islands',
  'Costa Rica',
  'Côte d’Ivoire',
  'Croatia',
  'Cuba',
  'Curaçao',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Dhekelia',
  'Diego Garcia',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Ethiopia',
  'Europa Island',
  'Falkland Islands (Islas Malvinas)',
  'Faroe Islands',
  'Fiji',
  'Finland',
  'France',
  'French Guiana',
  'French Polynesia',
  'French Southern and Antarctic Lands',
  'Gabon',
  '"Gambia, the"',
  'Gaza Strip',
  'Georgia',
  'Germany',
  'Ghana',
  'Gibraltar',
  'Glorioso Islands',
  'Greece',
  'Greenland',
  'Grenada',
  'Guadeloupe',
  'Guam',
  'Guantanamo Bay Naval Base',
  'Guatemala',
  'Guernsey',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Heard Island and McDonald Islands',
  'Honduras',
  'Hong Kong',
  'Howland Island',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Isle of Man',
  'Israel',
  'Italy',
  'Jamaica',
  'Jan Mayen',
  'Japan',
  'Jarvis Island',
  'Jersey',
  'Johnston Atoll',
  'Jordan',
  'Juan de Nova Island',
  'Kazakhstan',
  'Kenya',
  'Kingman Reef',
  'Kiribati',
  '"Korea, North"',
  '"Korea, South"',
  'Kosovo',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Macau',
  'Macedonia',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall',
  'Martinique',
  'Mauritania',
  'Mauritius',
  'Mayotte',
  'Mexico',
  '"Micronesia, Federated States of"',
  'Midway Islands',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Montserrat',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Nauru',
  'Navassa Island',
  'Nepal',
  'Netherlands',
  'New Caledonia',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Niue',
  'Norfolk Island',
  'Northern Mariana Islands',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palmyra Atoll',
  'Panama',
  'Papua New Guinea',
  'Paracel Islands',
  'Paraguay',
  'Peru',
  'Philippines',
  'Pitcairn Islands',
  'Poland',
  'Portugal',
  'Puerto Rico',
  'Qatar',
  'Reunion',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Barthelemy',
  '"Saint Helena, Ascension, and Tristan da Cunha"',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Martin',
  'Saint Pierre and Miquelon',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Sint Maarten',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Georgia and South Sandwich Islands',
  'South Sudan',
  'Spain',
  'Spratly Islands',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Svalbard',
  'Swaziland',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tokelau',
  'Tonga',
  'Trinidad and Tobago',
  'Tromelin Island',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Turks and Caicos Islands',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'Unknown',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  '"Virgin Islands, British"',
  '"Virgin Islands, U.S."',
  'Wake Island',
  'Wallis and Futuna',
  'West Bank',
  'Western Sahara',
  'Yemen',
  'Zambia',
  'Zimbabwe'
]; //countries list

export const MONTHS = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec'
};

export default {
  asyncForEach,
  formatNumber,
  getCurrentBudgetYear,
  generateUUID,
  isEmpty,
  isFullTime,
  isInactive,
  isMobile,
  isPartTime,
  isSmallScreen,
  convertToMoneyString,
  monthDayYearFormat,
  monthYearFormat,
  openLink,
  updateEmployeeLogin,
  storeIsPopulated,
  sortByDateReceived,
  sortLanguagesByProficiency,
  userRoleIsAdmin,
  userRoleIsManager,
  userRoleIsUser,
  userRoleIsIntern,
  COUNTRIES,
  MONTHS
};
