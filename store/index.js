/**
 * Helpful references
 * https://vuejs-tips.github.io/vuex-cheatsheet/
 * https://vuex.vuejs.org/
 *
 * Once the app is working with all the changes, I want to restructure this file
 * and split it into multiple files based on use case.
 * e.g. all current user data in one file
 *      all expense data in one file
 *      all employees/basecamp
 *      meta data/other supporting stuff?
 *
 */
import { createStore } from 'vuex';

export default createStore({
  state() {
    return {
      basecampAvatars: null,
      basecampCampfires: null,
      budgets: null,
      contracts: null,
      employees: null,
      employeeNumber: null,
      events: null,
      expenseTypes: null,
      fiscalDateView: null,
      loginTime: null,
      ptoCashOuts: null,
      user: null,
      userRole: null,
      storeIsPopulated: false,
      tags: null,
      accessRoles: null
    };
  },
  mutations: {
    setBasecampAvatars(state, payload) {
      state.basecampAvatars = payload.basecampAvatars;
    },
    setBasecampCampfires(state, payload) {
      state.basecampCampfires = payload.basecampCampfires;
    },
    setContracts(state, payload) {
      state.contracts = payload.contracts;
    },
    setEmployees(state, payload) {
      state.employees = payload.employees;
    },
    setExpenseTypes(state, payload) {
      state.expenseTypes = payload.expenseTypes;
    },
    setStoreIsPopulated(state, payload) {
      state.storeIsPopulated = payload.populated;
    },
    setUser(state, payload) {
      state.user = payload.user;
      state.userRole = payload.user.employeeRole;
      state.employeeNumber = payload.user.employeeNumber;
    },
    setEvents(state, payload) {
      state.events = payload.events;
    },
    setBudgets(state, payload) {
      state.budgets = payload.budgets;
    },
    setLoginTime(state, payload) {
      state.loginTime = payload.loginTime;
    },
    setPtoCashOuts(state, payload) {
      state.ptoCashOuts = payload.ptoCashOuts;
    },
    setTags(state, payload) {
      state.tags = payload.tags;
    },
    setAccessRoles(state, payload) {
      state.accessRoles = payload.accessRoles;
    }
  },
  actions: {
    setBasecampAvatars(context, payload) {
      context.commit('setBasecampAvatars', payload);
    },
    setBasecampCampfires(context, payload) {
      context.commit('setBasecampCampfires', payload);
    },
    setContracts(context, payload) {
      context.commit('setContracts', payload);
    },
    setEmployees(context, payload) {
      context.commit('setEmployees', payload);
    },
    setExpenseTypes(context, payload) {
      context.commit('setExpenseTypes', payload);
    },
    setStoreIsPopulated(context, payload) {
      context.commit('setStoreIsPopulated', payload);
    },
    setUser(context, payload) {
      context.commit('setUser', payload);
    },
    setEvents(context, payload) {
      context.commit('setEvents', payload);
    },
    setBudgets(context, payload) {
      context.commit('setBudgets', payload);
    },
    setLoginTime(context, payload) {
      context.commit('setLoginTime', payload);
    },
    setPtoCashOuts(context, payload) {
      context.commit('setPtoCashOuts', payload);
    },
    setTags(context, payload) {
      context.commit('setTags', payload);
    },
    setAccessRoles(context, payload) {
      context.commit('setAccessRoles', payload);
    }
  },
  getters: {
    basecampAvatars(state) {
      return state.basecampAvatars;
    },
    basecampCampfires(state) {
      return state.basecampCampfires;
    },
    contracts(state) {
      return state.contracts;
    },
    employees(state) {
      return state.employees;
    },
    employeeNumber(state) {
      return state.employeeNumber;
    },
    expenseTypes(state) {
      return state.expenseTypes;
    },
    storeIsPopulated(state) {
      return state.storeIsPopulated;
    },
    user(state) {
      return state.user;
    },
    userRole(state) {
      return state.userRole;
    },
    events(state) {
      return state.events;
    },
    budgets(state) {
      return state.budgets;
    },
    loginTime(state) {
      return state.loginTime;
    },
    ptoCashOuts(state) {
      return state.ptoCashOuts;
    },
    tags(state) {
      return state.tags;
    },
    accessRoles(state) {
      return state.accessRoles;
    }
  }
});
