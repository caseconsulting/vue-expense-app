// |--------------------------------------------------|
// |                                                  |
// |             Update store functions               |
// |                                                  |
// |--------------------------------------------------|

import api from '@/shared/api.js';
import store from '../../store/index.js';
import { userRoleIsAdmin, userRoleIsManager, userRoleIsUser } from '@/utils/utils';
import _filter from 'lodash/filter';

let isUserLoading = false;
let isEmployeesLoading = false;
let isAvatarsLoading = false;
let isCampfiresLoading = false;
let isContractsLoading = false;
let isBudgetsLoading = false;
let isPtoCashOutsLoading = false;
let isExpenseTypesLoading = false;
let isTagsLoading = false;

let employees = null;
let user = null;
let avatars = null;
let campfires = null;
let contracts = null;
let budgets = null;
let ptoCashOuts = null;
let expenseTypes = null;
let tags = null;

/**
 * Update store with latest user data
 */
export async function updateStoreUser() {
  // getUser
  try {
    if (!isUserLoading) {
      isUserLoading = true;
      user = api.getUser();
    }
    user = await user;
    store.dispatch('setUser', { user });
    isUserLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreUser

/**
 * Update store with latest employee data
 */
export async function updateStoreEmployees() {
  try {
    if (!isEmployeesLoading) {
      // getEmployees
      isEmployeesLoading = true;
      employees = api.getItems(api.EMPLOYEES);
    }
    employees = await employees;
    employees = _filter(employees, (e) => e.email !== 'info@consultwithcase.com');
    store.dispatch('setEmployees', { employees });
    isEmployeesLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreEmployees

/**
 * Update store with latest Basecamp avatars
 */
export async function updateStoreAvatars() {
  try {
    if (!isAvatarsLoading) {
      isAvatarsLoading = true;
      avatars = api.getBasecampAvatars();
    }
    avatars = await avatars;
    store.dispatch('setBasecampAvatars', { basecampAvatars: avatars });
    isAvatarsLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreAvatars

/**
 * Update store with latest Basecamp campfires
 */
export async function updateStoreCampfires() {
  try {
    if (!isCampfiresLoading) {
      isCampfiresLoading = true;
      campfires = api.getBasecampCampfires();
    }
    campfires = await campfires;
    if (campfires instanceof Error) campfires = [];
    store.dispatch('setBasecampCampfires', { basecampCampfires: campfires });
    isCampfiresLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreCampfires

/**
 * Update store with latest contracts
 */
export async function updateStoreContracts() {
  try {
    if (!isContractsLoading) {
      isContractsLoading = true;
      contracts = api.getItems(api.CONTRACTS);
    }
    contracts = await contracts;
    store.dispatch('setContracts', { contracts });
    isContractsLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreContracts

/**
 * Update store with users budgets
 */
export async function updateStoreBudgets() {
  try {
    let user = store.getters.user;
    if (!isBudgetsLoading) {
      isBudgetsLoading = true;
      budgets = api.getAllActiveEmployeeBudgets(user.id);
    }
    budgets = await budgets;
    store.dispatch('setBudgets', { budgets: budgets });
    isBudgetsLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreBudgets

/**
 * Update store with users budgets
 */
export async function updateStorePtoCashOuts() {
  try {
    let user = store.getters.user;
    if (!isPtoCashOutsLoading) {
      isPtoCashOutsLoading = true;
      if (userRoleIsAdmin() || userRoleIsManager()) {
        ptoCashOuts = api.getItems(api.PTO_CASH_OUTS);
      } else if (userRoleIsUser()) {
        ptoCashOuts = api.getEmployeePtoCashOuts(user.id);
      }
    }
    ptoCashOuts = await ptoCashOuts;
    store.dispatch('setPtoCashOuts', { ptoCashOuts: ptoCashOuts });
    isPtoCashOutsLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreBudgets

/**
 * Update store with latest expense type data
 */
export async function updateStoreExpenseTypes() {
  try {
    // getExpenseTypes
    let user = store.getters.user;
    let employeeRole = user.employeeRole;
    if (!isExpenseTypesLoading) {
      isExpenseTypesLoading = true;
      if (employeeRole == 'admin' || employeeRole == 'manager') {
        expenseTypes = api.getItems(api.EXPENSE_TYPES);
      } else if (employeeRole == 'intern' || employeeRole == 'user') {
        expenseTypes = api.getEmployeeExpenseTypes();
      }
    }
    expenseTypes = await expenseTypes;
    store.dispatch('setExpenseTypes', { expenseTypes });
    isExpenseTypesLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreExpenseTypes

/**
 * Update store with latest tag data
 */
export async function updateStoreTags() {
  try {
    if (!isTagsLoading) {
      isTagsLoading = true;
      tags = api.getItems(api.TAGS);
    }
    tags = await tags;
    store.dispatch('setTags', { tags });
    isTagsLoading = false;
  } catch (err) {
    console.error(err);
  }
} // updateStoreTags

export default {
  updateStoreUser,
  updateStoreEmployees,
  updateStoreAvatars,
  updateStoreCampfires,
  updateStoreContracts,
  updateStoreBudgets,
  updateStorePtoCashOuts,
  updateStoreExpenseTypes,
  updateStoreTags
};
