import axios from 'axios';
import { API_CONFIG } from './api-variables';
import { getAccessToken } from '@/utils/auth';
const EXPENSE_TYPES = 'expense-types';
const EXPENSES = 'expenses';
const EMPLOYEES = 'employees';
const UTILITY = 'utility';
const BUDGETS = 'budgets';
const URLS = 'training-urls';
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
    .then(response => {
      return response.data;
    })
    .catch(err => {
      return err;
    });
}

function getCountries() {
  return client({
    method: 'get',
    url: 'https://restcountries.eu/rest/v2/all'
  })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      return err;
    });
}

function getBudgetItem(id) {
  return execute('get', `/budgets/user/${id}`);
}

function getBudgetsByDate(id, date) {
  return execute('get', `/utility/${id}/${date}`);
}

function getBudgetsByDateAndType(id, date, expenseTypeId) {
  return execute('get', `/utility/${id}/${date}/${expenseTypeId}`);
}

function getItems(type) {
  return execute('get', `/${type}`);
}

function getItem(type, id) {
  return execute('get', `/${type}/${id}`);
}

function getAllEmployeeExpenses(id) {
  return execute('get', `/utility/getAllEmployeeExpenses/${id}`);
}

function getAllExpenseTypeExpenses(id) {
  return execute('get', `/utility/getAllExpenseTypeExpenses/${id}`);
}

function getURLInfo(id, category) {
  return execute('get', `/utility/getURLInfo/'${id}'/${category}`);
}

function createItem(type, data) {
  return execute('post', `/${type}`, data);
}

function updateItem(type, id, data) {
  return execute('put', `/${type}/${id}`, data);
}

function updateURL(type, id, category, data) {
  return execute('put', `/${type}/${id}/${category}`, data);
}

function deleteItem(type, id) {
  return execute('delete', `/${type}/${id}`);
}

function getAggregate() {
  return execute('get', `/utility/getAllExpenses`);
}

function getRole() {
  return execute('get', 'info/role');
}
function getUser() {
  return execute('get', 'info/me');
}

function getAttachment(userId, expenseId) {
  return execute('get', `attachment/${userId}/${expenseId}`);
}

async function createAttachment(expense, file) {
  let formData = new FormData();
  formData.append('receipt', file);

  // inject the accessToken for each request
  let accessToken = getAccessToken();
  return client({
    method: 'post',
    url: `/attachment/${expense.userId}/${expense.id}`,
    data: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      return err;
    });
}

function deleteAttachment(expense) {
  return execute('delete', `attachment/${expense.userId}/${expense.id}/${expense.receipt}`);
}

export default {
  // getCanDelete,
  getBudgetItem,
  getAllEmployeeExpenses,
  getAllExpenseTypeExpenses,
  getBudgetsByDate,
  getBudgetsByDateAndType,
  getItems,
  getItem,
  getAttachment,
  createAttachment,
  getURLInfo,
  createItem,
  updateItem,
  updateURL,
  deleteAttachment,
  deleteItem,
  getAggregate,
  getCountries,
  getRole,
  getUser,
  EXPENSE_TYPES,
  EXPENSES,
  EMPLOYEES,
  UTILITY,
  BUDGETS,
  URLS
};
