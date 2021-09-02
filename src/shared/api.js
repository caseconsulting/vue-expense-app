import axios from 'axios';
import { API_CONFIG } from './api-variables';
import { getAccessToken } from '@/utils/auth';
const EXPENSE_TYPES = 'expense-types';
const EXPENSES = 'expenses';
const EMPLOYEES = 'employees';
const EMSI = 'emsi';
const TRAINING_URLS = 'training-urls';
const UTILITY = 'utility';
const BUDGETS = 'budgets';
const QUICK_BOOKS_TIME = 'tSheets';
const TWITTER = 'twitter';
const BASECAMP = 'basecamp';
const BLOG = 'blog';
const BLOG_FILE = 'blogFile';
const HIPPO_LAB = 'hippoLabs';
const GOOGLE_MAPS = 'googleMaps';
const BLOG_ATTACHMENT = 'blogAttachment';
const AUDIT = 'audits';
const RESUME = 'resume';
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

  try {
    let c = await client({
      method,
      url: resource,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return c.data;
  } catch (err) {
    return err;
  }
}

async function getCountries() {
  let countries = await client({
    method: 'get',
    url: 'https://restcountries.eu/rest/v2/all'
  });
  return countries.data;
}

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
}

async function getAllActiveEmployeeBudgets(id) {
  return await execute('get', `/${UTILITY}/getAllActiveEmployeeBudgets/${id}`);
}

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

async function getEmployeeBudget(id, expenseTypeId, date) {
  return await execute('get', `/${UTILITY}/getEmployeeBudget/${id}/${expenseTypeId}/${date}`);
}

async function getFiscalDateViewBudgets(id, fiscalDateView) {
  return await execute('get', `/${UTILITY}/getFiscalDateViewBudgets/${id}/${fiscalDateView}`);
}

async function getEmployeeBudgets(id) {
  return await execute('get', `/budgets/employee/${id}`);
}

async function getAllEvents() {
  return await execute('get', `/${UTILITY}/getAllEvents`);
}

// function getBudgetsByDate(id, date) {
//   return execute('get', `/${UTILITY}/getEmployeeBudgets/${id}/${date}`);
// }

// function getBudgetsByDateAndType(id, date, expenseTypeId) {
//   return execute('get', `/${UTILITY}/getEmployeeBudgets/${id}/${date}/${expenseTypeId}`);
// }

async function getAudits(type, startDate, endDate) {
  return await execute('get', `/${AUDIT}/${type}/${startDate}/${endDate}`);
}

async function getItems(type) {
  return await execute('get', `/${type}`);
}

async function getItem(type, id) {
  return await execute('get', `/${type}/${id}`);
}

async function getAllEmployeeExpenses(id) {
  return await execute('get', `/${UTILITY}/getAllEmployeeExpenses/${id}`);
}

async function getAllExpenseTypeExpenses(id) {
  return await execute('get', `/${UTILITY}/getAllExpenseTypeExpenses/${id}`);
}

async function getURLInfo(id, category) {
  return await execute('get', `/${TRAINING_URLS}/'${id}'/${category}`);
}

async function createItem(type, data) {
  return await execute('post', `/${type}`, data);
}

async function updateItem(type, data) {
  return await execute('put', `/${type}`, data);
}

async function deleteItem(type, id) {
  return await execute('delete', `/${type}/${id}`);
}

async function getAllAggregateExpenses() {
  return await execute('get', `/${UTILITY}/getAllAggregateExpenses`);
}

async function getAllExpenses() {
  return await execute('get', `/${UTILITY}/getAllExpenses`);
}

async function getRole() {
  return await execute('get', 'info/role');
}
async function getUser() {
  return await execute('get', 'info/me');
}

async function getAttachment(employeeId, expenseId) {
  return await execute('get', `attachment/${employeeId}/${expenseId}`);
}

async function getBlogFile(authorId, blogId) {
  return await execute('get', `${BLOG_FILE}/${authorId}/${blogId}`);
}

async function getPictureFile(authorId, blogId, mainPicture) {
  return await execute('get', `${BLOG_FILE}/${authorId}/${blogId}/${mainPicture}`);
}

async function getLocation(locationQuery) {
  return await execute('get', `${GOOGLE_MAPS}/getLocation/${locationQuery}`);
}

async function getZipCode(addressId) {
  return await execute('get', `${GOOGLE_MAPS}/getZipCode/${addressId}`);
}

async function deleteResume(employeeId) {
  return await execute('delete', `${RESUME}/${employeeId}`);
}

async function extractText(employeeId, file) {
  let formData = new FormData();
  formData.append('receipt', file);

  return await execute('put', `/attachment/${employeeId}/${file.name}`, formData);
}

async function extractResumeText(employeeId, file) {
  let formData = new FormData();
  formData.append('resume', file);

  return await execute('put', `/${RESUME}/${employeeId}`, formData);
}

async function getResume(employeeId) {
  // inject the accessToken for each request
  let accessToken = getAccessToken();

  try {
    let c = await client({
      method: 'get',
      url: `${RESUME}/${employeeId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return c.data;
  } catch (err) {
    return null;
  }
}

async function createAttachment(expense, file) {
  let formData = new FormData();
  formData.append('receipt', file);

  return await execute('post', `/attachment/${expense.employeeId}/${expense.id}`, formData);
}

async function createBlogFile(blogPost, file, fileName) {
  let formData = new FormData();
  formData.append('blogFile', file, fileName);

  return await execute('post', `/${BLOG_FILE}/${blogPost.authorId}/${blogPost.id}`, formData);
}

async function deleteAttachment(expense) {
  return await execute('delete', `attachment/${expense.employeeId}/${expense.id}/${expense.receipt}`);
}

async function deleteBlogFile(blogPost) {
  return await execute(
    'delete',
    `${BLOG_FILE}/${blogPost.authorId}/${blogPost.id}/${blogPost.fileName}/${blogPost.mainPicture}`
  );
}

//functions for QuickBooks time
async function getPTOBalances(employeeNumber) {
  return await execute('get', `/${QUICK_BOOKS_TIME}/getPTOBalances/${employeeNumber}`);
}

async function getMonthlyHours(employeeNumber) {
  return await execute('get', `/${QUICK_BOOKS_TIME}/getMonthlyHours/${employeeNumber}`);
}
async function getTwitterToken() {
  return await execute('get', `/${TWITTER}/getTwitterToken`);
}
async function getCaseTimeline() {
  return await execute('get', `${TWITTER}/getCaseTimeline`);
}
async function getFeedEvents() {
  return await execute('get', `/${BASECAMP}/getFeedEvents`);
}
async function getModerationLabel(img) {
  return await execute('post', `${BLOG_ATTACHMENT}/getModerationLabel/${img}`);
}

async function getKeyPhrases(data) {
  return await execute('post', `${BLOG_ATTACHMENT}/getKeyPhrases`, data);
}

async function uploadResume(employeeId, file) {
  let formData = new FormData();
  formData.append('resume', file);

  return await execute('post', `/${RESUME}/${employeeId}`, formData);
}

async function uploadBlogAttachment(file) {
  let formData = new FormData();
  formData.append('image', file);

  return await execute('post', `${BLOG_ATTACHMENT}/uploadBlogAttachmentToS3/${file.name}`, formData);
}

/**
 * @param inputValue This is the query for the college
 * @returns a list of colleges that match that query
 */
async function getColleges(inputValue) {
  try {
    let response = await execute('get', `/${HIPPO_LAB}/getColleges/${inputValue}`);

    for (let i = 0; i < response.length; i++) {
      if (response[i] === 'Virginia Polytechnic Institute and State University') {
        response[i] = 'Virginia Polytechnic Institute and State University (Virginia Tech)';
      } else if (response[i] === 'University of Mississippi') {
        response[i] = 'University of Mississippi (Ole Miss)';
      } else if (response[i] === 'United States Military Academy') {
        response[i] = 'United States Military Academy (West Point)';
      } else if (response[i] === 'Northern Virginia Community College') {
        response[i] = 'Northern Virginia Community College (NoVa)';
      } else if (response[i] === 'Georgia Institute of Technology') {
        response[i] = 'Georgia Institute of Technology (Georgia Tech)';
      } else if (response[i] === 'Florida Institute of Technology') {
        response[i] = 'Florida Institute of Technology (Florida Tech)';
      } else if (response[i] === 'City University of New York') {
        response[i] = 'City University of New York (City Tech)';
      } else if (response[i] === 'California Institute of Technology') {
        response[i] = 'California Institute of Technology (Caltech)';
      }
    }
    return response;
  } catch (err) {
    return [];
  }
}

export default {
  createAttachment,
  createBlogFile,
  createItem,
  deleteAttachment,
  deleteBlogFile,
  deleteItem,
  deleteResume,
  extractText,
  extractResumeText,
  getAllActiveEmployeeBudgets,
  getAllAggregateExpenses,
  getAllEmployeeExpenses,
  getAllEvents,
  getAllExpenses,
  getAllExpenseTypeExpenses,
  getAttachment,
  getAudits,
  getBlogFile,
  getPictureFile,
  getBasecampAvatars,
  getBasecampCampfires,
  getCaseTimeline,
  getColleges,
  getCountries,
  getEmployeeBudget,
  getEmployeeBudgets,
  getFeedEvents,
  getFiscalDateViewBudgets,
  getItem,
  getItems,
  getKeyPhrases,
  getLocation,
  getModerationLabel,
  getPTOBalances,
  getResume,
  getRole,
  getMonthlyHours,
  getTechSkills,
  getTwitterToken,
  getURLInfo,
  getZipCode,
  getUser,
  updateItem,
  uploadBlogAttachment,
  uploadResume,
  EXPENSE_TYPES,
  EXPENSES,
  EMPLOYEES,
  UTILITY,
  BUDGETS,
  QUICK_BOOKS_TIME,
  TRAINING_URLS,
  TWITTER,
  BLOG,
  BLOG_ATTACHMENT,
  BLOG_FILE,
  AUDIT
};
