import axios from 'axios';
import { API_CONFIG } from './api-variables';
import { getAccessToken } from '@/utils/auth';
const EXPENSE_TYPES = 'expense-types';
const EXPENSES = 'expenses';
const EMPLOYEES = 'employees';
const TRAINING_URLS = 'training-urls';
const UTILITY = 'utility';
const BUDGETS = 'budgets';
const URLS = 'training-urls';
const TSHEETS = 'tSheets';
const TWITTER = 'twitter';
const BASECAMP = 'basecamp';
const API_HOSTNAME = API_CONFIG.apiHostname;
const API_PORT = API_CONFIG.apiPort;
const PORT = API_PORT === '443' ? '' : `:${API_PORT}`;
const PROTOCOL = API_HOSTNAME === 'localhost' ? 'http://' : 'https://';
const client = axios.create({
  baseURL: `${PROTOCOL}${API_HOSTNAME}${PORT}`,
  json: true
});

async function execute(method, resource, data) {
  // inject the accessToken for each request
  let accessToken = getAccessToken();
  return client({
    method,
    url: resource,
    data,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return err;
    });
}

function getCountries() {
  return client({
    method: 'get',
    url: 'https://restcountries.eu/rest/v2/all'
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return err;
    });
}

function getAllActiveEmployeeBudgets(id) {
  return execute('get', `/${UTILITY}/getAllActiveEmployeeBudgets/${id}`);
}

/**
 * Get basecamp avatars for all employees in the Case Consulting Basecamp.
 *
 * @return object - Employee Basecamp avatar data
 */
function getBasecampAvatars() {
  return execute('get', `/${BASECAMP}/getBasecampAvatars`);
} // getBasecampAvatars

/**
 * Get Basecamp Campfires the Case Consulting Info Basecamp Account.
 *
 * @return object - Basecamp Campfire data
 */
function getBasecampCampfires() {
  return execute('get', `/${BASECAMP}/getBasecampCampfires`);
} // getBasecampCampfires

function getEmployeeBudget(id, expenseTypeId, date) {
  return execute('get', `/${UTILITY}/getEmployeeBudget/${id}/${expenseTypeId}/${date}`);
}

function getFiscalDateViewBudgets(id, fiscalDateView) {
  return execute('get', `/${UTILITY}/getFiscalDateViewBudgets/${id}/${fiscalDateView}`);
}

function getEmployeeBudgets(id) {
  return execute('get', `/budgets/employee/${id}`);
}

function getAllEvents() {
  return execute('get', `/${UTILITY}/getAllEvents`);
}

// function getBudgetsByDate(id, date) {
//   return execute('get', `/${UTILITY}/getEmployeeBudgets/${id}/${date}`);
// }

// function getBudgetsByDateAndType(id, date, expenseTypeId) {
//   return execute('get', `/${UTILITY}/getEmployeeBudgets/${id}/${date}/${expenseTypeId}`);
// }

function getItems(type) {
  return execute('get', `/${type}`);
}

function getItem(type, id) {
  return execute('get', `/${type}/${id}`);
}

function getAllEmployeeExpenses(id) {
  return execute('get', `/${UTILITY}/getAllEmployeeExpenses/${id}`);
}

function getAllExpenseTypeExpenses(id) {
  return execute('get', `/${UTILITY}/getAllExpenseTypeExpenses/${id}`);
}

function getURLInfo(id, category) {
  return execute('get', `/${TRAINING_URLS}/'${id}'/${category}`);
}

function createItem(type, data) {
  return execute('post', `/${type}`, data);
}

function updateItem(type, data) {
  return execute('put', `/${type}`, data);
}

function deleteItem(type, id) {
  return execute('delete', `/${type}/${id}`);
}

function getAllAggregateExpenses() {
  return execute('get', `/${UTILITY}/getAllAggregateExpenses`);
}

function getAllExpenses() {
  return execute('get', `/${UTILITY}/getAllExpenses`);
}

function getRole() {
  return execute('get', 'info/role');
}
function getUser() {
  return execute('get', 'info/me');
}

function getAttachment(employeeId, expenseId) {
  return execute('get', `attachment/${employeeId}/${expenseId}`);
}

async function extractText(file) {
  let formData = new FormData();
  formData.append('receipt', file);

  // inject the accessToken for each request
  let accessToken = getAccessToken();

  return client({
    method: 'put',
    url: `/attachment/${file.name}`,
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return err;
    });
}

async function createAttachment(expense, file) {
  let formData = new FormData();
  formData.append('receipt', file);

  // inject the accessToken for each request
  let accessToken = getAccessToken();
  return client({
    method: 'post',
    url: `/attachment/${expense.employeeId}/${expense.id}`,
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return err;
    });
}

function deleteAttachment(expense) {
  return execute('delete', `attachment/${expense.employeeId}/${expense.id}/${expense.receipt}`);
}

//functions for tSheets
function getPTOBalances(employeeNumber) {
  return execute('get', `/${TSHEETS}/getPTOBalances/${employeeNumber}`);
}

function getMonthlyHours(employeeNumber) {
  return execute('get', `/${TSHEETS}/getMonthlyHours/${employeeNumber}`);
}
function getTwitterToken() {
  return execute('get', `/${TWITTER}/getTwitterToken`);
}
function getCaseTimeline() {
  return execute('get', `${TWITTER}/getCaseTimeline`);
}
function getFeedEvents() {
  return execute('get', `/${BASECAMP}/getFeedEvents`);
}
function getModerationLabel(img) {
  return execute('post', `blog/getModerationLabel/${img}`);
}

function getKeyPhrases(data) {
  return execute('post', `blog/getKeyPhrases`, data);
}

async function uploadBlogAttachment(file) {
  let formData = new FormData();
  formData.append('image', file);

  // inject the accessToken for each request
  let accessToken = getAccessToken();
  return client({
    method: 'post',
    url: `blog/uploadBlogAttachmentToS3/${file.name}`,
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return err;
    });
}

export default {
  createAttachment,
  createItem,
  deleteAttachment,
  deleteItem,
  extractText,
  getAllActiveEmployeeBudgets,
  getAllAggregateExpenses,
  getAllEmployeeExpenses,
  getAllEvents,
  getAllExpenses,
  getAllExpenseTypeExpenses,
  getAttachment,
  getBasecampAvatars,
  getBasecampCampfires,
  getCaseTimeline,
  getCountries,
  getEmployeeBudget,
  getEmployeeBudgets,
  getFeedEvents,
  getFiscalDateViewBudgets,
  getItem,
  getItems,
  getKeyPhrases,
  getModerationLabel,
  getPTOBalances,
  getRole,
  getMonthlyHours,
  getTwitterToken,
  getURLInfo,
  getUser,
  updateItem,
  uploadBlogAttachment,
  EXPENSE_TYPES,
  EXPENSES,
  EMPLOYEES,
  UTILITY,
  BUDGETS,
  URLS,
  TSHEETS,
  TWITTER
};
