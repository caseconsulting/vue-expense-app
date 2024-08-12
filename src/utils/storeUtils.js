// |--------------------------------------------------|
// |                                                  |
// |             Update store functions               |
// |                                                  |
// |--------------------------------------------------|

import api from '@/shared/api.js';
import store from '../../store/index.js';
import { userRoleIsAdmin, userRoleIsManager, userRoleIsUser } from '@/utils/utils';
import _filter from 'lodash/filter';

/**
 * Update store with latest user data
 */
export async function updateStoreUser() {
  // getUser
  try {
    let user = await api.getUser();
    store.dispatch('setUser', { user });
  } catch (err) {
    console.error(err);
  }
} // updateStoreUser

/**
 * Update store with latest employee data
 */
export async function updateStoreEmployees() {
  try {
    // getEmployees
    let employees = await api.getItems(api.EMPLOYEES);
    employees = _filter(employees, (e) => e.email !== 'info@consultwithcase.com');
    store.dispatch('setEmployees', { employees });
  } catch (err) {
    console.error(err);
  }
} // updateStoreEmployees

/**
 * Update store with latest Basecamp avatars
 */
export async function updateStoreAvatars() {
  try {
    let avatars = await api.getBasecampAvatars();
    store.dispatch('setBasecampAvatars', { basecampAvatars: avatars });
  } catch (err) {
    console.error(err);
  }
} // updateStoreAvatars

/**
 * Update store with latest Basecamp campfires
 */
export async function updateStoreCampfires() {
  try {
    let campfires = await api.getBasecampCampfires();
    if (campfires instanceof Error) campfires = [];
    store.dispatch('setBasecampCampfires', { basecampCampfires: campfires });
  } catch (err) {
    console.error(err);
  }
} // updateStoreCampfires

/**
 * Update store with latest contracts
 */
export async function updateStoreContracts() {
  try {
    let contracts = await api.getItems(api.CONTRACTS);
    store.dispatch('setContracts', { contracts });
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
    let budgets = await api.getAllActiveEmployeeBudgets(user.id);
    store.dispatch('setBudgets', { budgets: budgets });
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
    let ptoCashOuts = [];
    if (userRoleIsAdmin() || userRoleIsManager()) {
      ptoCashOuts = await api.getItems(api.PTO_CASH_OUTS);
    } else if (userRoleIsUser()) {
      ptoCashOuts = await api.getEmployeePtoCashOuts(user.id);
    }
    store.dispatch('setPtoCashOuts', { ptoCashOuts: ptoCashOuts });
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
    if (employeeRole == 'admin' || employeeRole == 'manager') {
      let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
      store.dispatch('setExpenseTypes', { expenseTypes });
    } else if (employeeRole == 'intern' || employeeRole == 'user') {
      let expenseTypes = await api.getEmployeeExpenseTypes();
      store.dispatch('setExpenseTypes', { expenseTypes });
    }
  } catch (err) {
    console.error(err);
  }
} // updateStoreExpenseTypes

/**
 * Update store with latest tag data
 */
export async function updateStoreTags() {
  try {
    let tags = await api.getItems(api.TAGS);
    store.dispatch('setTags', { tags });
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
