<template>
  <div v-if="model == null && !loading" class="text-center">
    <h1>Invalid Employee!</h1>
    <img
      src="https://media.giphy.com/media/fnuSiwXMTV3zmYDf6k/giphy.gif"
      alt="GIF of Kazoo Kid saying 'Wait a minute, who are you?'"
    />
  </div>
  <v-container v-else class="my-3 mx-0 px-0" fluid>
    <v-row v-if="basicEmployeeDataLoading" class="pt-0">
      <employee-page-loader></employee-page-loader>
    </v-row>
    <div v-else>
      <v-snackbar
        v-model="uploadStatus.statusType"
        :color="uploadStatus.color"
        :multi-line="true"
        :timeout="3000"
        :vertical="true"
        location="top right"
      >
        <v-card-text color="white">
          <span class="text-h6 font-weight-medium">{{ uploadStatus.statusMessage }}</span>
        </v-card-text>
        <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
      </v-snackbar>
      <v-row class="pa-0">
        <v-col cols="3" align="left" justify="left">
          <v-btn id="backBtn" elevation="2" @click="$router.back()" :size="isMobile ? 'x-small' : 'default'">
            <v-icon size="large" class="pr-1">mdi-arrow-left-thin</v-icon>
            Back
          </v-btn>
        </v-col>
        <v-col
          cols="9"
          v-if="hasAdminPermissions() || userIsEmployee()"
          align="right"
          justify="right"
          class="px-0 pr-3 ma-0"
        >
          <v-btn
            @click="toggleResumeParser = !toggleResumeParser"
            v-if="!editing"
            :size="isMobile ? 'x-small' : 'default'"
            color="#bc3825"
            class="text-white mr-1"
            ><b>Upload Resume</b></v-btn
          >
          <v-btn
            class="text-white"
            v-if="!editing"
            color="#bc3825"
            @click="toggleDeleteModal = !toggleDeleteModal"
            :size="isMobile ? 'x-small' : 'default'"
            :disabled="model.resumeUpdated == null"
            :loading="deleteLoading"
            ><b>Delete Resume</b></v-btn
          >
        </v-col>
      </v-row>
      <v-row class="pt-0">
        <!-- QuickBooks Time and Budgets-->
        <v-col v-if="displayQuickBooksTimeAndBalances" cols="12" md="5" lg="4" class="pt-0">
          <quick-books-time-data :employee="model" :key="refreshKey" class="mb-4"></quick-books-time-data>
          <available-budgets
            class="mb-4"
            v-if="model.id && !loading"
            :employee="model"
            :key="refreshKey"
            :expenses="expenses"
            :expenseTypes="expenseTypes"
            :accessibleBudgets="accessibleBudgets"
            :employeeDataLoading="loading"
            :fiscalDateView="fiscalDateView"
          ></available-budgets>
          <anniversary-card
            v-if="!loading"
            :employee="model"
            :key="refreshKey"
            :hasBudgets="hasAccessToBudgets"
            location="profile"
          ></anniversary-card>
        </v-col>

        <!-- Employee Form -->
        <v-col
          cols="12"
          :md="displayQuickBooksTimeAndBalances ? 7 : 12"
          :lg="displayQuickBooksTimeAndBalances ? 8 : 12"
          class="pt-0"
        >
          <v-card>
            <v-card-title class="d-flex align-center header_style" v-if="!editing">
              <v-btn v-if="hasAdminPermissions()" :disabled="loading" icon variant="text" density="comfortable">
                <v-tooltip activator="parent" location="top">Previous employee</v-tooltip>
                <v-icon size="large" @click="navEmployee(-1)" color="white">mdi-arrow-left-thin</v-icon>
              </v-btn>
              <v-btn
                v-if="hasAdminPermissions()"
                :disabled="loading"
                icon
                variant="text"
                density="comfortable"
                class="mr-3"
              >
                <v-tooltip activator="parent" location="top">Next employee</v-tooltip>
                <v-icon size="large" @click="navEmployee(1)" color="white">mdi-arrow-right-thin</v-icon>
              </v-btn>
              <h3 id="employeeName" v-if="userIsEmployee()">My Profile</h3>
              <h3 id="employeeName" v-else>{{ model.nickname || model.firstName }} {{ model.lastName }}</h3>
              <v-spacer></v-spacer>
              <convert-employee-to-csv
                v-if="userRoleIsAdmin()"
                :contracts="contracts"
                :key="refreshKey"
                :employee="model"
                :filename="`${model.nickname || model.firstName} ${model.lastName}`"
                :tags="$store.getters.tags"
                color="white"
              />
              <v-btn
                @click="downloadResume()"
                :disabled="!model.resumeUpdated"
                density="comfortable"
                variant="text"
                icon=""
                class="mx-1"
              >
                <v-tooltip v-if="hasAdminPermissions() || userIsEmployee()" activator="parent" location="top"
                  ><p class="ma-0 pa-0">
                    {{ model.resumeUpdated != null ? 'Download Resume' : 'No resume available' }}
                  </p>
                  <p class="ma-0 pa-0">
                    {{ model.resumeUpdated != null ? `Uploaded ${format(model.resumeUpdated, null, dateFormat)}` : '' }}
                  </p>
                </v-tooltip>
                <v-icon color="white" id="resume-download">mdi-file-download</v-icon>
              </v-btn>
              <v-btn @click="editing = true" density="comfortable" variant="text" icon="">
                <v-tooltip v-if="hasAdminPermissions() || userIsEmployee()" activator="parent" location="top">
                  Edit Profile
                </v-tooltip>
                <v-icon color="white" id="edit">mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>
            <employee-info
              :model="model"
              :key="refreshKey"
              :contracts="contracts"
              :currentTab="currentTab"
              v-if="!editing"
            ></employee-info>
          </v-card>
          <!-- Edit Info (Form) -->
          <employee-form
            :employee="model"
            :contracts="contracts"
            :currentTab="currentTab"
            v-if="editing"
          ></employee-form>
          <div class="mt-4">
            <budget-chart
              v-if="(userRoleIsAdmin() || userIsEmployee()) && hasAccessToBudgets && !loading"
              :employee="model"
              :key="refreshKey"
              :accessibleBudgets="accessibleBudgets"
              :expenses="expenses"
              :expenseTypes="expenseTypes"
              :fiscalDateView="fiscalDateView"
            ></budget-chart>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12"> </v-col>
      </v-row>
      <resume-parser
        v-if="!loading && !editing"
        :toggleResumeParser="toggleResumeParser"
        :employee="model"
        :key="refreshKey"
      ></resume-parser>
      <delete-modal :toggleDeleteModal="toggleDeleteModal" type="resume"></delete-modal>
    </div>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgets from '@/components/shared/AvailableBudgets.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import EmployeeInfo from '@/components/employees/EmployeeInfo.vue';
import QuickBooksTimeData from '@/components/shared/quickbooks/QuickBooksTimeData.vue';
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
import { format, getTodaysDate, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import _ from 'lodash';
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
    this.displayMessage('SUCCESS', `Added ${changes} change(s) to profile!`, 'green');
  }
  if (newEmployeeForm) {
    this.model = newEmployeeForm;
    this.model['resumeUpdated'] = getTodaysDate();
    await api.updateItem(api.EMPLOYEES, this.model);
  }
} // resumeReceived

/**
 * Clears the status message of the uploadStatus
 */
function clearStatus() {
  this.uploadStatus['statusType'] = undefined;
  this.uploadStatus['statusMessage'] = null;
  this.uploadStatus['color'] = null;
} // clearStatus

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
    this.model = _.find(employees, (employee) => {
      return employee.employeeNumber == this.$route.params.id;
    });
  }
  this.user = this.$store.getters.user;
  this.contracts = this.$store.getters.contracts;
  this.displayQuickBooksTimeAndBalances = this.userRoleIsAdmin() || this.userIsEmployee();
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
  return !_.isNil(this.model) && !_.isNil(this.user) ? this.user.employeeNumber === this.model.employeeNumber : false;
} // userIsEmployee

/**
 * Displays the message
 *
 * @param type - the type of message
 * @param msg - the message to display
 * @param color - the color of the banner
 */
function displayMessage(type, msg, color) {
  this.uploadStatus['statusType'] = type;
  this.uploadStatus['statusMessage'] = msg;
  this.uploadStatus['color'] = color;
} // displayMessage

/**
 * Deletes the resume
 */
async function deleteResume() {
  this.deleteLoading = true;
  let deleteResult = await api.deleteResume(this.model.id);
  let updateEmpRes = await api.updateItem(api.EMPLOYEES, { ...this.model, resumeUpdated: null });
  if (!(deleteResult instanceof Error) || !(updateEmpRes instanceof Error)) {
    this.model.resumeUpdated = null;
    this.displayMessage('SUCCESS', 'Successfully deleted resume', 'green');
  } else {
    this.displayMessage('ERROR', 'Failure to delete resume', 'red');
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
 * Navigates to an employee
 * TODO: support custom loops
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
  loop = _.sortBy(loop, ['employeeNumber']);

  // get the employee we're currently at and grab the employee `num` after in
  // the loop (this can be negative to go backwards, and can be more than 1)
  pos = _.findIndex(loop, (e) => e.employeeNumber == currId);
  res = (pos + num) % loop.length;
  if (res < 0) res = loop.length - 1;
  this.model = _.cloneDeep(loop[res]); // this updates everything

  // budget information needs to be reloaded specifically as it does not update
  // when the model does
  await this.refreshExpenseData();

  // update the URL so that it makes sense
  history.pushState({}, null, this.model.employeeNumber);
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
  this.hasAccessToBudgets = this.accessibleBudgets && this.accessibleBudgets.length !== 0; // enable budget chart
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
    if (displayMessage) this.displayMessage('SUCCESS', 'Successfully uploaded resume', 'green');
    this.model.resumeUpdated = getTodaysDate();
    this.model = _.cloneDeep(this.model); // force vue to reload the object
    await api.updateItem(api.EMPLOYEES, this.model);
  });

  this.emitter.on('tabChange', (tab) => {
    this.currentTab = tab;
  });

  this.emitter.on('selected-budget-year', (date) => {
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
  this.emitter.off('selected-budget-year');
} // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

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
  beforeUnmount,
  components: {
    AvailableBudgets,
    DeleteModal,
    EmployeeForm,
    EmployeeInfo,
    QuickBooksTimeData,
    ConvertEmployeeToCsv,
    AnniversaryCard,
    BudgetChart,
    ResumeParser,
    EmployeePageLoader
  },
  created,
  data() {
    return {
      basicEmployeeDataLoading: true,
      currentTab: null,
      contracts: null,
      dateFormat: FORMATTED_ISOFORMAT,
      deleteLoading: false,
      displayQuickBooksTimeAndBalances: false,
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
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snackbar action status
      toggleDeleteModal: false,
      toggleResumeParser: false,
      uploadStatus: {
        statusType: undefined,
        statusMessage: null,
        color: null
      },
      user: null,
      hasAccessToBudgets: false
    };
  },
  methods: {
    clearStatus,
    deleteResume,
    displayMessage,
    downloadResume,
    format,
    hasAdminPermissions,
    getProfileData,
    getCurrentBudgetYear,
    isEmpty,
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
  },
  computed: {
    isMobile,
    minimizeWindow,
    refreshKey,
    storeIsPopulated
  },
  mounted,
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>
