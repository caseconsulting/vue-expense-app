import api from '@/shared/api.js';
import dateUtils from '@/shared/dateUtils';
import MobileDetect from 'mobile-detect';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { getRole } from '@/utils/auth';
const IsoFormat = 'YYYY-MM-DD';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

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
 * Formats a date.
 *
 * @param date - date to format
 * @return Date - formatted date
 */
export function formatDate(date) {
  return dateUtils.formatDate(date);
} // formatDate

/**
 * Formats a date (dates that only have months and years).
 *
 * @param date - date to format
 * @return Date - formatted date
 */
export function formatDateMonthYear(date) {
  return dateUtils.formatDateMonthYear(date);
} // formatDate

/**
 * Returns a date formated from YYYY-MM-DD to MM/DD/YYYY.
 *
 * @param date - YYYY-MM-DD String date
 * @return String - MM/DD/YYYY date
 */
export function formatDateDashToSlash(date) {
  if (!date) {
    return null;
  }
  const [year, month, day] = date.split('-');
  return `${month}/${day}/${year}`;
} // formatDateDashToSlash

/**
 * Returns a date formated from MM/DD/YYYY to YYYY-MM-DD.
 *
 * @param date - MM/DD/YYYY String date
 * @return String - YYYY-MM-DD date
 */
export function formatDateSlashToDash(date) {
  if (!date) {
    return null;
  }
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
} // formatDateSlashToDash

/**
 * Gets the current active anniversary budget year starting date in isoformat.
 *
 * @return String - current active anniversary budget date (YYYY-MM-DD)
 */
export function getCurrentBudgetYear(hireDate) {
  let currentBudgetYear = moment(hireDate, IsoFormat);
  if (moment().isAfter(currentBudgetYear)) {
    currentBudgetYear.year(moment().year());
    if (moment().isBefore(currentBudgetYear)) {
      currentBudgetYear = currentBudgetYear.subtract(1, 'years');
    }
  }
  return currentBudgetYear.format(IsoFormat);
} // getCurrentBudgetYear

/**
 * Check if today is between a set of given dates in isoformat. Returns true if today is between the two dates,
 * otherwise returns false.
 *
 * @param start - start date
 * @param end - end date
 * @return boolean - today is in set of dates
 */
export function isBetweenDates(date, start, end) {
  let startDate = moment(start, IsoFormat);
  let endDate = moment(end, IsoFormat);
  return moment(date).isBetween(startDate, endDate, 'day', '[]');
} // betweenDates

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
 * Checks if the window width is a small sie.
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
  return !isEmpty(date) ? moment(date).format('MMM Do, YYYY') : '';
} // monthDayYearFormat

/**
 * Returns a date formated as 'MMM YYYY' (Aug 2020).
 *
 * @param date - date to format
 * @return String - date formated
 */
export function monthYearFormat(date) {
  return !isEmpty(date) ? moment(date).format('MMM YYYY') : '';
} // monthYearFormat

/**
 * Returns a date formated as 'MMM Do' (Aug 18th).
 *
 * @param date - date to format
 * @return String - date formated
 */
export function monthDayFormat(date) {
  return !isEmpty(date) ? moment(date).format('MMM Do') : '';
} // monthDayFormat

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
export function parseDate(date) {
  return dateUtils.parseDate(date);
} // parseDate

/**
 * Parse a date to isoformat (YYYY-MM).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
export function parseDateMonthYear(date) {
  return dateUtils.parseDateMonthYear(date);
} // parseDateMonthYear

/**
 * Updates the login date and creates audit for the employee.
 * @param {employee} employee the employee to update
 */
export async function updateEmployeeLogin(employee) {
  await Promise.all([
    api.updateItem(api.EMPLOYEES, employee), // updates last logged in for employee
    api.createItem(api.AUDIT, {
      id: uuid(),
      type: 'login',
      tags: ['account'],
      employeeId: employee.id,
      description: `${employee.firstName} ${employee.lastName} has logged in`,
      timeToLive: 60
    })
  ]); // Create an audit of the success
  if (this.$store.getters.employees) {
    let employees = this.$store.getters.employees;
    let i = employees.findIndex((emp) => emp.id === employee.id);
    employees[i] = employee;
    this.$store.dispatch('setLoginTime', { employees });
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
  return this.$store.getters.storeIsPopulated;
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

export const countryList = [
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
