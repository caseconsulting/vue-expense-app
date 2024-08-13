<template>
  <div v-if="model == null && !loading" class="text-center">
    <h1>Invalid Employee!</h1>
    <v-container class="invalid-results-gif">
      <v-img
        src="https://media.giphy.com/media/fnuSiwXMTV3zmYDf6k/giphy.gif"
        alt="GIF of Kazoo Kid saying 'Wait a minute, who are you?'"
        aspect-ratio="4/3"
      ></v-img>
    </v-container>
  </div>
  <v-container v-else class="my-3 mx-0 px-0" fluid>
    <v-row v-if="basicEmployeeDataLoading" class="pt-0">
      <employee-page-loader />
    </v-row>
    <div v-else>
      <v-row class="pa-0">
        <v-col cols="3" align="left" justify="left">
          <v-btn id="backBtn" elevation="2" :size="isMobile ? 'x-small' : 'default'" @click="$router.back()">
            <v-icon size="large" class="pr-1"> mdi-arrow-left-thin </v-icon>
            Back
          </v-btn>
        </v-col>
        <v-col
          v-if="hasAdminPermissions() || userIsEmployee()"
          cols="9"
          align="right"
          justify="right"
          class="px-0 pr-3 ma-0"
        >
          <v-btn
            v-if="!editing"
            :size="isMobile ? 'x-small' : 'default'"
            color="#bc3825"
            class="text-white mr-1"
            @click="toggleResumeParser = !toggleResumeParser"
          >
            <b>Upload Resume</b>
          </v-btn>
          <v-btn
            v-if="!editing"
            class="text-white"
            color="#bc3825"
            :size="isMobile ? 'x-small' : 'default'"
            :disabled="model.resumeUpdated == null"
            :loading="deleteLoading"
            @click="toggleDeleteModal = !toggleDeleteModal"
          >
            <b>Delete Resume</b>
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="pt-0">
        <!-- Timesheets and Budgets-->
        <v-col v-if="displayTimeAndBalances" cols="12" md="5" lg="5" class="pt-0">
          <time-data :key="model" :employee="model" class="mb-4" />
          <available-budgets
            :key="refreshKey"
            class="mb-4"
            :employee="model"
            :expenses="expenses"
            :expense-types="expenseTypes"
            :accessible-budgets="accessibleBudgets"
            :employee-data-loading="loading"
            :fiscal-date-view="fiscalDateView"
          />
          <anniversary-card :employee="model" emit-catcher="employee-page" :key="refreshKey.a.id" location="profile" />
        </v-col>

        <!-- Employee Form -->
        <v-col cols="12" :md="displayTimeAndBalances ? 7 : 12" :lg="displayTimeAndBalances ? 7 : 12" class="pt-0">
          <v-card>
            <v-card-title v-if="!editing" class="d-flex align-center header_style">
              <v-btn
                v-if="hasAdminPermissions()"
                :disabled="loading"
                icon
                variant="text"
                density="comfortable"
                @click="navEmployee(-1)"
              >
                <v-tooltip activator="parent" location="top"> Previous employee </v-tooltip>
                <v-icon size="large" color="white"> mdi-arrow-left-thin </v-icon>
              </v-btn>
              <v-btn
                v-if="hasAdminPermissions()"
                :disabled="loading"
                icon
                variant="text"
                density="comfortable"
                class="mr-3"
                @click="navEmployee(1)"
              >
                <v-tooltip activator="parent" location="top"> Next employee </v-tooltip>
                <v-icon size="large" color="white"> mdi-arrow-right-thin </v-icon>
              </v-btn>
              <div v-if="hasAdminPermissions()">
                <v-autocomplete
                  v-model="dropdownEmployee"
                  class="employee-dropdown"
                  density="compact"
                  :items="dropdownEmployees"
                  :custom-filter="employeeFilter"
                  hide-details
                  item-title="itemTitle"
                  return-object
                  rounded
                  bg-color="rgba(255,255,255,0.075)"
                  variant="plain"
                  @update:model-value="
                    dropdownEmployee ? (model = dropdownEmployee) : _;
                    pushHistoryState(model.employeeNumber);
                    refreshExpenseData();
                  "
                />
              </div>
              <div v-else>
                <h3 v-if="userIsEmployee()" id="employeeName">My Profile</h3>
                <h3 v-else id="employeeName">{{ model.nickname || model.firstName }} {{ model.lastName }}</h3>
              </div>
              <v-spacer />
              <convert-employee-to-csv
                v-if="userRoleIsAdmin()"
                :key="refreshKey.a.id"
                :contracts="contracts"
                :employee="model"
                :filename="`${model.nickname || model.firstName} ${model.lastName}`"
                :tags="$store.getters.tags"
                color="white"
              />
              <v-btn
                v-if="hasAdminPermissions() || userIsEmployee()"
                :disabled="!model.resumeUpdated"
                density="comfortable"
                variant="text"
                icon=""
                class="mx-1"
                @click="downloadResume()"
              >
                <v-tooltip activator="parent" location="top">
                  <p class="ma-0 pa-0">
                    {{ model.resumeUpdated != null ? 'Download Resume' : 'No resume available' }}
                  </p>
                  <p class="ma-0 pa-0">
                    {{ model.resumeUpdated != null ? `Uploaded ${format(model.resumeUpdated, null, dateFormat)}` : '' }}
                  </p>
                </v-tooltip>
                <v-icon id="resume-download" color="white"> mdi-file-download </v-icon>
              </v-btn>
              <v-btn
                v-if="hasAdminPermissions() || userIsEmployee()"
                density="comfortable"
                variant="text"
                icon=""
                @click="editing = true"
              >
                <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
                <v-icon id="edit" color="white"> mdi-pencil </v-icon>
              </v-btn>
            </v-card-title>
            <employee-info
              v-if="!editing"
              :key="refreshKey.a.id"
              :model="model"
              :contracts="contracts"
              :current-tab="currentTab"
            />
          </v-card>
          <!-- Edit Info (Form) -->
          <employee-form v-if="editing" :employee="model" :contracts="contracts" :current-tab="currentTab" />
          <div v-if="userRoleIsAdmin() || userIsEmployee()" class="mt-4">
            <budget-chart
              v-if="!loading"
              :key="refreshKey.e"
              :employee="model"
              :accessible-budgets="accessibleBudgets"
              :expenses="expenses"
              :expense-types="expenseTypes"
              :fiscal-date-view="fiscalDateView"
            />
            <v-card v-else class="pa-6">
              <v-skeleton-loader width="40%" class="px-5 mx-auto" type="heading" />
              <v-skeleton-loader type="image" />
              <v-skeleton-loader width="60%" class="px-5" type="text" />
            </v-card>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" />
      </v-row>
      <resume-parser
        v-if="!loading && !editing"
        :key="refreshKey.a.id"
        :toggle-resume-parser="toggleResumeParser"
        :employee="model"
      />
      <delete-modal :toggle-delete-modal="toggleDeleteModal" type="resume" />
    </div>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgets from '@/components/shared/AvailableBudgets.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import EmployeeInfo from '@/components/employees/EmployeeInfo.vue';
import TimeData from '@/components/shared/timesheets/TimeData.vue';
import {
  getCurrentBudgetYear,
  isEmpty,
  isMobile,
  storeIsPopulated,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils.js';
import {
  updateStoreBudgets,
  updateStoreContracts,
  updateStoreEmployees,
  updateStoreExpenseTypes,
  updateStoreUser,
  updateStoreTags
} from '@/utils/storeUtils';
import { employeeFilter } from '@/shared/filterUtils';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';
import { format, getTodaysDate, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import _find from 'lodash/find';
import _isNil from 'lodash/isNil';
import _sortBy from 'lodash/sortBy';
import _cloneDeep from 'lodash/cloneDeep';
import _findIndex from 'lodash/findIndex';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import ConvertEmployeeToCsv from '@/components/employees/csv/ConvertEmployeeToCsv.vue';
import AnniversaryCard from '@/components/shared/AnniversaryCard.vue';
import BudgetChart from '@/components/charts/custom-charts/BudgetChart.vue';
import ResumeParser from '@/components/modals/ResumeParser';
import DeleteModal from '@/components/modals/DeleteModal';
import EmployeePageLoader from '@/components/employees/EmployeePageLoader';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Event called when a resume is submitted
 *
 * @param newEmployeeForm is the new employee model after parsing the resume
 * @param changes - number of changes that were made
 */
async function resumeReceived(newEmployeeForm, changes) {
  if (changes && changes > 0) {
    useDisplaySuccess(`Added ${changes} change(s) to profile!`);
  }
  if (newEmployeeForm) {
    this.model = newEmployeeForm;
    this.model['resumeUpdated'] = getTodaysDate();
    await api.updateItem(api.EMPLOYEES, this.model);
  }
} // resumeReceived

/**
 * Downloads the resume of the employee
 */
async function downloadResume() {
  let res = await api.getResume(this.model.id);
  window.open(res.data, '_blank');
} // downloadResume

/**
 * Get employee data.
 */
async function getProfileData() {
  this.loading = true;
  this.basicEmployeeDataLoading = true;
  await Promise.all([
    !this.$store.getters.employees ? this.updateStoreEmployees() : '',
    !this.$store.getters.user ? this.updateStoreUser() : '',
    !this.$store.getters.contracts ? this.updateStoreContracts() : '',
    this.hasAdminPermissions() && !this.$store.getters.tags ? this.updateStoreTags() : ''
  ]);
  if (this.$store.getters.user.employeeNumber == this.$route.params.id) {
    // user looking at their own profile
    this.model = this.$store.getters.user;
  } else {
    // user looking at another employees profile
    let employees = this.$store.getters.employees;
    this.model = _find(employees, (employee) => {
      return employee.employeeNumber == this.$route.params.id;
    });
  }
  this.user = this.$store.getters.user;
  this.contracts = this.$store.getters.contracts;
  this.displayTimeAndBalances = this.userRoleIsAdmin() || this.userIsEmployee();
  this.basicEmployeeDataLoading = false;
  if (this.model) {
    await this.refreshExpenseData(true);
  }
  this.loading = false;
} // getProfileData

/**
 * checks window size and if it is xs or s minimize the window
 *
 * @return boolean - whether or not to minimize window
 */
function minimizeWindow() {
  switch (this.$vuetify.display.name) {
    case 'xs':
      return true;
    case 'sm':
      return true;
    default:
      return false;
  }
} // minimizeWindow

/**
 * checks to see if the user has admin permissions
 *
 * @return boolean - whether the user is an admin or manager
 */
function hasAdminPermissions() {
  return this.userRoleIsAdmin() || this.userRoleIsManager();
} // hasAdminPermissions

/**
 * Check if the user the employee that is displayed. Returns true if the user is the employee displayed, otherwise returns false.
 *
 * @return boolean - user is the employee that is displayed
 */
function userIsEmployee() {
  return !_isNil(this.model) && !_isNil(this.user) ? this.user.employeeNumber === this.model.employeeNumber : false;
} // userIsEmployee

/**
 * Deletes the resume
 */
async function deleteResume() {
  this.deleteLoading = true;
  let deleteResult = await api.deleteResume(this.model.id);
  let updateEmpRes = await api.updateItem(api.EMPLOYEES, { ...this.model, resumeUpdated: null });
  if (!(deleteResult instanceof Error) || !(updateEmpRes instanceof Error)) {
    this.model.resumeUpdated = null;
    useDisplaySuccess('Successfully deleted resume');
  } else {
    useDisplayError('Failure to delete resume');
  }
  this.deleteLoading = false;
} // deleteResume

/**
 * Checks if the user has access to any budgets
 */
async function checkForBudgetAccess() {
  if (this.userIsEmployee()) {
    if (!this.$store.getters.budgets) {
      await this.updateStoreBudgets();
    }
    this.accessibleBudgets = this.$store.getters.budgets;
  } else if (this.hasAdminPermissions()) {
    this.accessibleBudgets = await api.getAllActiveEmployeeBudgets(this.model.id);
  }
} // checkForBudgetAccess

/**
 * Replaces the new employee number in the url.
 *
 * @param employeeNumber - The employee number
 */
function pushHistoryState(employeeNumber) {
  history.pushState({}, null, employeeNumber);
} // pushHistoryState

/**
 * Navigates to an employee
 * future: support custom loops
 *
 * @input num - amount of employees to move fowards (may be negative for backwards)
 */
async function navEmployee(num) {
  // set vars
  let loop, pos, res;
  let currId = this.model.employeeNumber;

  // create 'loop' of employees in order of their employee number
  loop = this.$store.getters.employees || (await this.updateStoreEmployees());
  loop = loop.filter((e) => e.workStatus !== 0);
  loop = _sortBy(loop, ['employeeNumber']);

  // get the employee we're currently at and grab the employee `num` after in
  // the loop (this can be negative to go backwards, and can be more than 1)
  pos = _findIndex(loop, (e) => e.employeeNumber == currId);
  res = (pos + num) % loop.length;
  if (res < 0) res = loop.length - 1;
  this.model = _cloneDeep(loop[res]); // this updates everything

  // budget information needs to be reloaded specifically as it does not update
  // when the model does
  await this.refreshExpenseData();

  // update the URL so that it makes sense
  this.pushHistoryState(this.model.employeeNumber);
} // navEmployee

/**
 * Refreshes expense data based on the model, including: accessibleBudgets, expenses, expenseTypes, and fiscalDateView
 */
async function refreshExpenseData(full = false) {
  this.loading = true;
  // these are aggregated so it probably doesn't need to be updated
  if (full) {
    [this.expenses] = await Promise.all([
      this.hasAdminPermissions() || this.userIsEmployee() ? api.getAllAggregateExpenses() : '', // only load if needed
      !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : ''
    ]);
    this.expenseTypes = this.$store.getters.expenseTypes;
  }
  await this.checkForBudgetAccess();
  this.fiscalDateView = this.getCurrentBudgetYear(this.model.hireDate);
  this.loading = false;
} // refreshExpenseData

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Adjust datatable header for user view.
 */
async function created() {
  this.emitter.on('confirm-delete-resume', async () => {
    await this.deleteResume();
  });
  this.emitter.on('canceled-delete-resume', () => {
    this.midAction = false;
  });
  this.emitter.on('resume', async (result) => {
    await this.resumeReceived(result.newEmployeeForm, result.totalChanges);
    this.midAction = false;
  });
  this.emitter.on('profile-clicked', async () => {
    this.model = _cloneDeep(this.$store.getters.user);
    await this.refreshExpenseData();
    this.pushHistoryState(this.$store.getters.user.employeeNumber);
  });

  this.storeIsPopulated ? await this.getProfileData() : (this.loading = true);
  if (!this.$store.getters.employees) await this.updateStoreEmployees();
} // created

/**
 * Mount event listeners.
 */
function mounted() {
  this.emitter.on('cancel-form', () => {
    this.editing = false;
  });

  this.emitter.on('update', (updatedEmployee) => {
    if (updatedEmployee) {
      this.model = updatedEmployee;
    }
  });

  this.emitter.on('uploaded', async (displayMessage) => {
    if (displayMessage) useDisplaySuccess('Successfully uploaded resume');
    this.model.resumeUpdated = getTodaysDate();
    this.model = _cloneDeep(this.model); // force vue to reload the object
    await api.updateItem(api.EMPLOYEES, this.model);
  });

  this.emitter.on('tabChange', (tab) => {
    this.currentTab = tab;
  });

  this.emitter.on('change-budget-year-employee-page', (date) => {
    if (date != this.fiscalDateView) {
      this.fiscalDateView = date;
    }
  });
} // mounted

/**
 * destroy listeners
 */
function beforeUnmount() {
  this.emitter.off('delete-resume');
  this.emitter.off('confirm-delete-resume');
  this.emitter.off('canceled-delete-resume');
  this.emitter.off('cancel-form');
  this.emitter.off('resume');
  this.emitter.off('update');
  this.emitter.off('uploaded');
  this.emitter.off('tabChange');
  this.emitter.off('change-budget-year-employee-page');
  this.emitter.off('profile-clicked');
} // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns all employees with an item title for the autocomplete
 */
function dropdownEmployees() {
  let employees = _filter(this.$store.getters.employees, (e) => e.workStatus > 0);
  return _map(employees, (e) => {
    return {
      ...e,
      itemTitle: `${e.lastName}, ${e.nickname || e.firstName}`
    };
  });
} // dropdownEmployees

/**
 * Used to refresh components
 */
function refreshKey() {
  return {
    a: this.model,
    b: this.expenses,
    c: this.expenseTypes,
    e: this.accessibleBudgets
  };
} // refreshKey

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Updates the dropdown employee when the employee model changes.
 */
function watchModel() {
  if (!this.model) return;
  this.dropdownEmployee = {
    ..._cloneDeep(this.model),
    itemTitle: `${this.model.lastName}, ${this.model.nickname || this.model.firstName}`
  };
} // watchModel

/**
 * Load the profile data if the page is refreshed.
 */
async function watchStoreIsPopulated() {
  if (this.storeIsPopulated) await this.getProfileData();
} // watchStoreisPopulated

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    AvailableBudgets,
    DeleteModal,
    EmployeeForm,
    EmployeeInfo,
    TimeData,
    ConvertEmployeeToCsv,
    AnniversaryCard,
    BudgetChart,
    ResumeParser,
    EmployeePageLoader
  },
  data() {
    return {
      basicEmployeeDataLoading: true,
      currentTab: null,
      contracts: null,
      dateFormat: FORMATTED_ISOFORMAT,
      deleteLoading: false,
      displayTimeAndBalances: false,
      dropdownEmployee: null,
      editing: false,
      expenses: null,
      expenseTypes: null,
      accessibleBudgets: null,
      filter: {
        active: ['full', 'part'] // default only shows full and part time employees
      }, // datatable filter
      fiscalDateView: '',
      loading: false, // loading status
      model: {
        awards: [],
        birthday: '',
        birthdayFeed: false,
        certifications: [],
        city: '',
        contract: '',
        country: '',
        currentCity: '',
        currentState: '',
        currentStreet: '',
        currentStreet2: '',
        currentZIP: '',
        degrees: [],
        deptDate: '',
        email: '@consultwithcase.com',
        employeeNumber: null,
        employeeRole: '',
        firstName: '',
        fiscalDateView: '',
        github: '',
        hireDate: null,
        id: null,
        jobRole: '',
        lastName: '',
        middleName: '',
        nickname: '',
        noMiddleName: false,
        personalEmail: '',
        phoneNumber: '',
        prime: '',
        st: '',
        technologies: [],
        twitter: '',
        workStatus: 100
      }, // selected employee
      search: '', // query text for datatable search field
      toggleDeleteModal: false,
      toggleResumeParser: false,
      user: null
    };
  },
  computed: {
    dropdownEmployees,
    isMobile,
    minimizeWindow,
    refreshKey,
    storeIsPopulated
  },
  watch: {
    'model.id': watchModel,
    storeIsPopulated: watchStoreIsPopulated
  },
  beforeUnmount,
  created,
  mounted,
  methods: {
    deleteResume,
    downloadResume,
    employeeFilter,
    format,
    hasAdminPermissions,
    getProfileData,
    getCurrentBudgetYear,
    isEmpty,
    pushHistoryState,
    resumeReceived,
    updateStoreBudgets,
    updateStoreContracts,
    updateStoreEmployees,
    updateStoreExpenseTypes,
    updateStoreUser,
    updateStoreTags,
    userRoleIsAdmin,
    userRoleIsManager,
    userIsEmployee,
    checkForBudgetAccess,
    navEmployee,
    refreshExpenseData
  }
};
</script>

<style>
.employee-dropdown {
  width: 300px;
}

.employee-dropdown > * {
  font-family: 'Avenir', Helvetica, Arial, sans-serif !important;
  font-weight: bolder !important;
}

.employee-dropdown .v-field__input,
.employee-dropdown .v-field__append-inner {
  padding-left: 15px !important;
  padding-top: 2px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 20px !important;
  opacity: 1 !important;
}
</style>

<style scoped>
.invalid-results-gif {
  max-width: 80%;
}
</style>
