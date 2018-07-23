import axios from 'axios';
import { API_CONFIG } from './api-variables';
import { getAccessToken, getIdToken } from '@/utils/auth';
const EXPENSE_TYPES = 'expense-types';
const EXPENSES = 'expenses';
const EMPLOYEES = 'employees';
const SPECIAL = 'special';
const API_HOSTNAME = API_CONFIG.apiHostname;
const API_PORT = API_CONFIG.apiPort;

const client = axios.create({
  baseURL: `http://${API_HOSTNAME}:${API_PORT}`,
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

function getItems(type) {
  return execute('get', `/${type}`);
}

function getItem(type, id) {
  return execute('get', `/${type}/${id}`);
}

function createItem(type, data) {
  return execute('post', `/${type}`, data);
}

function updateItem(type, id, data) {
  return execute('put', `/${type}/${id}`, data);
}

function deleteItem(type, id) {
  return execute('delete', `/${type}/${id}`);
}

export default {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  EXPENSE_TYPES,
  EXPENSES,
  EMPLOYEES,
  SPECIAL
};
