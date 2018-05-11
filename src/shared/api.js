import axios from 'axios';

const EXPENSE_TYPES = 'expense-types';
const EXPENSES = 'expenses';
const EMPLOYEES = 'employees';

const client = axios.create({
  baseURL: 'http://localhost:3000/',
  json: true
});

async function execute(method, resource, data) {
  // inject the accessToken for each request
  //let accessToken = await Vue.prototype.$auth.getAccessToken()
  return client({
    method,
    url: resource,
    data
    // headers: {
    //   Authorization: `Bearer ${accessToken}`
    // }
  }).then(response => {
    return response.data;
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

export default { getItems, getItem, createItem, updateItem, deleteItem, EXPENSE_TYPES, EXPENSES, EMPLOYEES };
