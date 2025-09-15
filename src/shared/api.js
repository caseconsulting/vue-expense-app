import axios from 'axios';
import { API_CONFIG } from './apiVariables';
import { getAccessToken } from '@/utils/auth';
const EXPENSE_TYPES = 'expense-types';
const EXPENSES = 'expenses';
const EMPLOYEES = 'employees';
const EMSI = 'emsi';
const UTILITY = 'utility';
const TIMESHEETS = 'timesheets';
const BASECAMP = 'basecamp';
const GOOGLE_MAPS = 'googleMaps';
const AUDIT = 'audits';
const RESUME = 'resume';
const CONTRACTS = 'contracts';
const HIGH_FIVES = 'highFives';
const PTO_CASH_OUTS = 'ptoCashOuts';
const SETTINGS = 'settings';
const TAGS = 'tags';
const API_HOSTNAME = API_CONFIG.apiHostname;
const API_PORT = API_CONFIG.apiPort;
const PORT = API_PORT === '443' ? '' : `:${API_PORT}`;
const PROTOCOL = API_HOSTNAME === 'localhost' ? 'http://' : 'https://';
const client = axios.create({
  baseURL: `${PROTOCOL}${API_HOSTNAME}${PORT}`,
  json: true
});

const CONTRACT_STATUSES = {
  UNSTAFFED: 'unstaffed',
  ACTIVE: 'active',
  CLOSED: 'closed'
};

/**
 * executes the api method
 *
 * @param method - the type of the api method E.G. get, put, etc.
 * @param resource - the URL for the api route to the specific function
 * @param data - data to be passed to the api function
 * @param params - params to be passed to the api function
 * @return * - the data from the response or an error
 */
async function execute(method, resource, data, params) {
  // inject the accessToken for each request
  let accessToken = getAccessToken();
  try {
    let c = await client({
      method,
      url: resource,
      data,
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return c.data;
  } catch (err) {
    return err;
  }
} // execute

/**
 * gets list of tech skills from emsi
 *
 * @param tech - query for the tech list
 * @return - list of tech names or error
 */
async function getTechSkills(tech) {
  let techList = await execute('get', `/${EMSI}/getTechSkills/${tech}`);
  let techNames = [];
  if (techList.data) {
    techNames = techList.data.map((a) => a.name);
    //removes unnecessary paranthesis from tech name
    //ex: Java (programming language) ==> Java
    for (let i = 0; i < techNames.length; i++) {
      if (techNames[i].includes('(')) {
        techNames[i] = techNames[i].split(' (')[0];
      }
    }
  }

  return techNames;
} // getTechSkills

/**
 * gets all the active budgets for a specific employee
 *
 * @param id - the id of the employee
 * @return - the budgets data
 */
async function getAllActiveEmployeeBudgets(id) {
  return await execute('get', `/${UTILITY}/getAllActiveEmployeeBudgets/${id}`);
} // getAllActiveEmployeeBudgets

/**
 * Get basecamp avatars for all employees in the Case Consulting Basecamp.
 *
 * @return object - Employee Basecamp avatar data
 */
async function getBasecampAvatars() {
  return await execute('get', `/${BASECAMP}/getBasecampAvatars`);
} // getBasecampAvatars

/**
 * Get Basecamp Campfires the Case Consulting Info Basecamp Account.
 *
 * @return object - Basecamp Campfire data
 */
async function getBasecampCampfires() {
  return await execute('get', `/${BASECAMP}/getBasecampCampfires`);
} // getBasecampCampfires

/**
 * gets specific budget for an employee
 *
 * @param id - the id of the employee
 * @param expenseTypeId - the id of the expense type
 * @param date - the date of the budget
 * @return - the budget data
 */
async function getEmployeeBudget(id, expenseTypeId, date) {
  return execute('get', `/${UTILITY}/getEmployeeBudget/${id}/${expenseTypeId}/${date}`);
} // getEmployeeBudget

/**
 * Gets expense types for an employee
 *
 * @return - expense types for employee
 */
async function getEmployeeExpenseTypes() {
  return execute('get', `/${UTILITY}/getEmployeeExpenseTypes`);
} // getEmployeeExpenseTypes

/**
 * gets the fiscal date view of the budgets
 *
 * @param id - the budget id
 * @param fiscalDateView - iso formatted date to choose budget year
 * @return - the fiscal date view budget data
 */
async function getFiscalDateViewBudgets(id, fiscalDateView) {
  return execute('get', `/${UTILITY}/getFiscalDateViewBudgets/${id}/${fiscalDateView}`);
} // getFiscalDateViewBudgets

/**
 * gets all the budgets for a specific employee
 *
 * @param id - the id of the employee
 * @return - the budget data
 */
async function getEmployeeBudgets(id) {
  return execute('get', `/budgets/employee/${id}`);
} // getEmployeeBudgets

/**
 * Gets PTO cash outs for an employee
 *
 * @return - PTO cash outs for employee
 */
async function getEmployeePtoCashOuts(id) {
  return execute('get', `/${UTILITY}/getAllEmployeePtoCashOuts/${id}`);
} // getEmployeePtoCashOuts

/**
 * gets all the events
 *
 * @return - event data
 */
async function getAllEvents() {
  return execute('get', `/${UTILITY}/getAllEvents`);
} // getAllEvents

/**
 * gets all the audits for a specific type in a specific range
 *
 * @param type - the type of the audit
 * @param startDate - the start date of the wanted range
 * @param endDate - the end date of the wanted range
 * @return - the audit data
 */
async function getAudits(type, startDate, endDate) {
  return await execute('get', `/${AUDIT}/${type}/${startDate}/${endDate}`);
} // getAudits

/**
 * gets all items from a specific route
 *
 * @param type - the route to access
 * @return - the items
 */
async function getItems(type) {
  return await execute('get', `/${type}`);
} // getItems

/**
 * gets a specific item from a specific route
 *
 * @param type - the route to access
 * @param id - the id of the specific items
 * @return - single item object
 */
async function getItem(type, id) {
  return await execute('get', `/${type}/${id}`);
} // getItem

/**
 * get all the expenses for a specific employee
 *
 * @param id - the id of the employee
 * @return - the expenses
 */
async function getAllEmployeeExpenses(id) {
  return await execute('get', `/${UTILITY}/getAllEmployeeExpenses/${id}`);
} // getAllEmployeeExpenses

/**
 * gets all the expenses for an expenseType
 *
 * @param id - the id for the expenseType
 * @return - the expense data for the expenseType
 */
async function getAllExpenseTypeExpenses(id) {
  return await execute('get', `/${UTILITY}/getAllExpenseTypeExpenses/${id}`);
} // getAllExpenseTypeExpenses

/**
 * creates an item
 *
 * @param type - the route to denote the type of item to make
 * @param data - the data object to be created
 * @return - if it was a successful create
 */
async function createItem(type, data) {
  return await execute('post', `/${type}`, data);
} // createItem

/**
 * updates the attribute of the data object in the database based on the type
 * @param type - the route denoting the dynamodb database to change
 * @param value - the attribute value
 * @param attribute - the attribute to update
 * @return - if it was a successful update
 */
async function updateAttribute(type, value, attribute) {
  return await execute('patch', `/${type}/${attribute}`, value);
} // updateAttribute

/**
 *
 * @param {string} type - the route denoting the dynamodb database to change
 * @param {string} id - key of the object in the table
 * @param {object} values - object with attribute keys with values to update
 * @returns if it was a successful update
 */
async function updateAttributes(type, id, values) {
  return await execute('patch', `/${type}/attributes/${id}`, values);
}

/**
 * updates the item in the database based on the type
 * @param type - the route denoting the dynamodb database to change
 * @param data - the new data
 * @return - if it was a successful update
 */
async function updateItem(type, data) {
  return await execute('put', `/${type}`, data);
} // updateItem

/**
 * deletes an item form a specific table
 *
 * @param type - the route denoting the dynamodb database to delete an item from
 * @param id - the id of the item to be deleted
 * @return - if it was a successful delete
 */
async function deleteItem(type, id) {
  return await execute('delete', `/${type}/${id}`);
} // deleteItem

/**
 * gets all the expenses
 *
 * @return - the expense data
 */
async function getAllAggregateExpenses() {
  return await execute('get', `/${UTILITY}/getAllAggregateExpenses`);
} // getAllAggregateExpenses

/**
 * gets all the unreimbursed expenses
 *
 * @return - the expense data
 */
async function getUnreimbursedExpenses() {
  return await execute('get', `/${UTILITY}/getUnreimbursedExpenses`);
} // getUnreimbursedExpenses

/**
 * gets current user
 *
 * @return - get current signed in user
 */
async function getUser() {
  return await execute('get', 'info/me');
} // getUser

/**
 * gets attachement for an expense for a specific employee
 *
 * @param employeeId - the id of the employee
 * @param expenseId - the id of the expense
 * @return - the attachment
 */
async function getAttachment(employeeId, expenseId) {
  return await execute('get', `attachment/${employeeId}/${expenseId}`);
} // getAttachment

/**
 * gets a google map location
 *
 * @param locationQuery - the query text used to find the location
 * @return - the location data
 */
async function getLocation(locationQuery) {
  return await execute('get', `${GOOGLE_MAPS}/getLocation/${locationQuery}`);
} // getLocation

/**
 * gets the zip code for an address
 *
 * @param addressId - the id of the location that we are getting the zip code for
 * @return - the zip code data
 */
async function getZipCode(addressId) {
  return await execute('get', `${GOOGLE_MAPS}/getZipCode/${addressId}`);
} // getZipCode

/**
 * gets a google map location
 *
 * @param locationQuery - the query text used to find the location
 * @return - the location data
 */
async function getCity(locationQuery) {
  return await execute('get', `${GOOGLE_MAPS}/getCity/${locationQuery}`);
} // getCity

/**
 * deletes the resume
 *
 * @param employeeId - the id of the employee who we are deleting the resume for
 * @return - the status code
 */
async function deleteResume(employeeId) {
  return await execute('delete', `${RESUME}/${employeeId}`);
} // deleteResume

/**
 * extracts the text with Amazon textract service of a reciept file for an employee
 *
 * @param employeeId - the id of the employee
 * @param file - the file to extract text from
 * @return - the extracted text
 */
async function extractText(employeeId, file) {
  let formData = new FormData();
  formData.append('receipt', file);

  return await execute('put', `/attachment/${employeeId}/${file.name}`, formData);
} // extractText

/**
 * extracts the text of a resume file for a specific employee
 *
 * @param employeeId - the id of the employee
 * @param file - the file to extract text from
 * @return - the extracted text
 */
async function extractResumeText(employeeId, file) {
  let formData = new FormData();
  formData.append('resume', file);

  return await execute('put', `/${RESUME}/${employeeId}`, formData);
} // extractResumeText

/**
 * gets the resume for a specific employee
 *
 * @param employeeId - the id of the employee
 * @return - the resume file of the employee
 */
async function getResume(employeeId) {
  // inject the accessToken for each request
  let accessToken = getAccessToken();
  const resp = await client.get(`${RESUME}/${employeeId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    validateStatus: () => true
  });
  if (!resp.status || resp.status >= 300) return null;
  else return resp.data;
} // getResume

/**
 * creates a reciept attachment for an expense
 *
 * @param expense - the expense to create a receipt file for
 * @param file - the file to create
 * @return - success code
 */
async function createAttachment(expense, file) {
  let formData = new FormData();
  for (let i = 0; i < file.length; i++) {
    formData.append('receipt', file[i], file[i].name);
  }
  return await execute('post', `/attachment/${expense.employeeId}/${expense.id}`, formData);
} // createAttachment

/**
 * deletes attachment from s3
 *
 * @param expense - the expense object to build url
 * @return - success code
 */
async function deleteAttachment(expense) {
  return await execute('delete', `attachment/${expense.employeeId}/${expense.id}/${expense.receipt}`);
} // deleteAttachment

/**
 * gets the timesheets and PTO balances data for the specified timeframe for an employee
 *
 * @param employeeNumber - the number for the employee
 * @return - the timesheets data
 */
async function getTimesheetsData(employeeNumber, params) {
  return await execute('get', `/${TIMESHEETS}/${employeeNumber}`, null, params);
} // getTimesheetsData

/**
 * gets the leaderboard data
 *
 * @return - the leaderboard data
 */
async function getLeaderboard() {
  return await execute('get', `/${TIMESHEETS}/leaderboard`);
} // getLeaderboard

async function getSettings() {
  return await execute('get', `/${SETTINGS}`);
}

/**
 * Reimburses a high five, generates a gift card, emails the recipeint
 * gift card information, then stores the gift card information.
 *
 * @params - A high five expense
 * @returns - The reimbursed high five if successful
 */
async function processHighFive(highFive) {
  return await execute('post', `/${HIGH_FIVES}/process`, highFive);
} // processHighFive

/**
 * uploads the resume file for an employee
 *
 * @param employeeId - the id of the employee
 * @param file - the file of the resume
 * @return - success code
 */
async function uploadResume(employeeId, file) {
  let formData = new FormData();
  formData.append('resume', file);

  return await execute('post', `/${RESUME}/${employeeId}`, formData);
} // uploadResume

/**
 * uploads the resume file for an employee
 *
 * @param file - the file of the resume
 * @return - success code
 */
async function uploadUnanetBalances(file) {
  let formData = new FormData();
  formData.append('accruals', file);

  return await execute('post', `/${TIMESHEETS}/uploadAccruals`, formData);
} // uploadResume

/**
 * Syncs application data between the Portal, BambooHR, ADP, etc.
 *
 * @return - The response from the data sync function
 */
async function syncApplications() {
  return await execute('post', `/${UTILITY}/syncApplications`, {});
} // syncApplications

/**
 * Gets employee's ADP info
 *
 * @return - The response from the ADP get function
 */
async function getEmployeesFromAdp() {
  return await execute('get', `/${UTILITY}/getEmployeesFromAdp`);
}

export default {
  createAttachment,
  createItem,
  deleteAttachment,
  deleteItem,
  deleteResume,
  extractText,
  extractResumeText,
  getAllActiveEmployeeBudgets,
  getAllAggregateExpenses,
  getUnreimbursedExpenses,
  getAllEmployeeExpenses,
  getAllEvents,
  getAllExpenseTypeExpenses,
  getAttachment,
  getAudits,
  getBasecampAvatars,
  getBasecampCampfires,
  getCity,
  getEmployeeBudget,
  getEmployeeBudgets,
  getEmployeeExpenseTypes,
  getEmployeePtoCashOuts,
  getFiscalDateViewBudgets,
  getItem,
  getItems,
  getLocation,
  getResume,
  getTimesheetsData,
  getLeaderboard,
  getTechSkills,
  getSettings,
  getZipCode,
  getUser,
  updateAttribute,
  updateAttributes,
  updateItem,
  uploadResume,
  uploadUnanetBalances,
  processHighFive,
  syncApplications,
  getEmployeesFromAdp,
  EXPENSE_TYPES,
  EXPENSES,
  EMPLOYEES,
  CONTRACTS,
  PTO_CASH_OUTS,
  TAGS,
  UTILITY,
  TIMESHEETS,
  AUDIT,
  CONTRACT_STATUSES
};
