<template>
  <div v-if="model == null && !loading" class="text-center">
    <h1>Invalid Employee!</h1>
    <img
      src="https://media.giphy.com/media/fnuSiwXMTV3zmYDf6k/giphy.gif"
      alt="GIF of Kazoo Kid saying 'Wait a minute, who are you?'"
    />
  </div>
  <v-container v-else class="my-3" fluid>
    <v-row v-if="basicEmployeeDataLoading" class="pt-0">
      <employee-page-loader></employee-page-loader>
    </v-row>
    <div v-else>
      <v-snackbar
        v-model="uploadStatus.statusType"
        :color="uploadStatus.color"
        :multi-line="true"
        :right="true"
        :timeout="3000"
        :top="true"
        :vertical="true"
      >
        <v-card-title headline color="white">
          <span class="headline">{{ uploadStatus.statusMessage }}</span>
        </v-card-title>
        <v-btn color="white" text @click="clearStatus"> Close </v-btn>
      </v-snackbar>
      <v-row class="pa-0">
        <v-col cols="3" align="left" justify="left">
          <v-btn id="backBtn" elevation="2" @click="$router.back()" :x-small="isMobile()"
            ><v-icon class="pr-1">arrow_back</v-icon>Back</v-btn
          >
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
            :x-small="isMobile()"
            color="#bc3825"
            class="white--text mr-1"
            ><b>Upload Resume</b></v-btn
          >
          <v-btn
            class="white--text"
            v-if="!editing"
            color="#bc3825"
            @click="toggleDeleteModal = !toggleDeleteModal"
            :x-small="isMobile()"
            :disabled="resumeData == null"
            :loading="deleteLoading"
            ><b>Delete Resume</b></v-btn
          >
        </v-col>
      </v-row>
      <v-row class="pt-0">
        <!-- QuickBooks Time and Budgets-->
        <v-col v-if="displayQuickBooksTimeAndBalances" cols="12" md="5" lg="4" class="pt-0">
          <quick-books-time-data :employee="this.model" class="mb-4"></quick-books-time-data>
          <available-budgets
            class="mb-4"
            v-if="this.model.id"
            :employee="this.model"
            :expenses="expenses"
            :expenseTypes="expenseTypes"
            :accessibleBudgets="accessibleBudgets"
            :employeeDataLoading="loading"
          ></available-budgets>
          <anniversary-card
            v-if="!loading"
            :employee="this.model"
            :hasBudgets="this.hasAccessToBudgets"
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
            <v-card-title class="header_style" v-if="!editing">
              <h3 id="employeeName" v-if="userIsEmployee()">My Profile</h3>
              <h3 id="employeeName" v-else>
                {{ this.model.nickname || this.model.firstName }} {{ this.model.lastName }}
              </h3>
              <v-spacer></v-spacer>
              <convert-employee-to-csv
                v-if="userRoleIsAdmin()"
                :contracts="contracts"
                :employee="this.model"
                :tags="$store.getters.tags"
                color="white"
              />
              <v-tooltip v-if="hasAdminPermissions() || userIsEmployee()" top>
                <template #activator="{ on }">
                  <div v-on="on">
                    <v-icon
                      :disabled="resumeData == null"
                      class="pr-2"
                      @click="downloadResume()"
                      color="white"
                      align="right"
                      v-on="on"
                      id="resume-download"
                      >sim_card_download</v-icon
                    >
                  </div>
                </template>
                <p class="ma-0 pa-0">{{ resumeData != null ? 'Download Resume' : 'No resume available' }}</p>
                <p class="ma-0 pa-0">
                  {{ resumeData != null ? `Uploaded ${format(resumeData.lastModified, null, dateFormat)}` : '' }}
                </p>
              </v-tooltip>
              <v-tooltip v-if="hasAdminPermissions() || userIsEmployee()" top>
                <template #activator="{ on }">
                  <v-icon class="pr-2" @click="editing = true" color="white" align="right" v-on="on" id="edit"
                    >edit</v-icon
                  >
                </template>
                <span>Edit Profile</span>
              </v-tooltip>
            </v-card-title>
            <employee-info
              :model="this.model"
              :contracts="this.contracts"
              :currentTab="this.currentTab"
              v-if="!editing"
            ></employee-info>
          </v-card>
          <!-- Edit Info (Form) -->
          <employee-form
            :employee="this.model"
            :contracts="this.contracts"
            :currentTab="this.currentTab"
            v-if="editing"
          ></employee-form>
          <div class="mt-4">
            <budget-chart
              v-if="(userRoleIsAdmin() || userIsEmployee()) && hasAccessToBudgets"
              :employee="this.model"
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
        :toggleResumeParser="this.toggleResumeParser"
        :employee="this.model"
        @resume="resumeReceived"
      ></resume-parser>
      <delete-modal :toggleDeleteModal="this.toggleDeleteModal" type="resume"></delete-modal>
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
import { format, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
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

  this.model = newEmployeeForm;
  await api.updateItem(api.EMPLOYEES, this.model);
} // resumeReceived

/**
 * Clears the status message of the uploadStatus
 */
function clearStatus() {
  this.$set(this.uploadStatus, 'statusType', undefined);
  this.$set(this.uploadStatus, 'statusMessage', null);
  this.$set(this.uploadStatus, 'color', null);
} // clearStatus

/**
 * Downloads the resume of the employee
 */
async function downloadResume() {
  if (this.resumeData.data) {
    window.open(this.resumeData.data, '_blank');
  }
} // downloadResume

/**
 * Get employee data.
 */
async function getProfileData() {
  this.loading = true;
  await Promise.all([
    !this.$store.getters.employees ? this.updateStoreEmployees() : _,
    !this.$store.getters.user ? this.updateStoreUser() : _,
    !this.$store.getters.contracts ? this.updateStoreContracts() : _,
    this.hasAdminPermissions() && !this.$store.getters.tags ? this.updateStoreTags() : _
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
    [this.resumeData, this.expenses] = await Promise.all([
      this.hasAdminPermissions() || this.userIsEmployee() ? api.getResume(this.$route.params.id) : '',
      this.hasAdminPermissions() || this.userIsEmployee() ? api.getAllAggregateExpenses() : '', // only load if neededapi.getAllAggregateExpenses(),
      !this.$store.getters.expenseTypes ? this.updateStoreExpenseTypes() : '',
      this.checkForBudgetAccess()
    ]);
    this.expenseTypes = this.$store.getters.expenseTypes;
    this.fiscalDateView = this.getCurrentBudgetYear(this.model.hireDate);
    this.hasAccessToBudgets = this.accessibleBudgets && this.accessibleBudgets.length !== 0; // enable budget chart
  }
  this.loading = false;
} // getProfileData

/**
 * checks window size and if it is xs or s minimize the window
 *
 * @return boolean - whether or not to minimize window
 */
function minimizeWindow() {
  switch (this.$vuetify.breakpoint.name) {
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
  this.$set(this.uploadStatus, 'statusType', type);
  this.$set(this.uploadStatus, 'statusMessage', msg);
  this.$set(this.uploadStatus, 'color', color);
} // displayMessage

/**
 * Deletes the resume
 */
async function deleteResume() {
  this.deleteLoading = true;
  let deleteResult = await api.deleteResume(this.$route.params.id);
  if (!(deleteResult instanceof Error)) {
    this.resumeData = null;
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

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Adjust datatable header for user view.
 */
async function created() {
  window.EventBus.$on('confirm-delete-resume', async () => {
    await this.deleteResume();
  });

  window.EventBus.$on('canceled-delete-resume', () => {
    this.midAction = false;
  });

  window.EventBus.$on('delete-resume', (newResume) => {
    if (newResume != null) {
      this.resumeData = newResume;
    }
  });
  window.EventBus.$on('upload-resume-complete', (newResume) => {
    if (newResume != null) {
      this.resumeData = newResume;
    }
  });
  this.basicEmployeeDataLoading = true;
  this.storeIsPopulated ? await this.getProfileData() : (this.loading = true);
} // created

/**
 * Mount event listeners.
 */
function mounted() {
  window.EventBus.$on('cancel-form', () => {
    this.editing = false;
  });

  window.EventBus.$on('update', (updatedEmployee) => {
    if (updatedEmployee) {
      this.model = updatedEmployee;
    }
  });

  window.EventBus.$on('uploaded', async (isUploaded, displayMessage) => {
    if (displayMessage) {
      this.resumeData = await api.getResume(this.$route.params.id);
      this.displayMessage('SUCCESS', 'Successfully uploaded resume', 'green');
    }
  });

  window.EventBus.$on('tabChange', (tab) => {
    this.currentTab = tab;
  });

  window.EventBus.$on('selected-budget-year', (date) => {
    if (date != this.fiscalDateView) {
      this.fiscalDateView = date;
    }
  });
} // mounted

/**
 * destroy listeners
 */
function beforeDestroy() {
  window.EventBus.$off('delete-resume');
  window.EventBus.$off('upload-resume-complete');
  window.EventBus.$off('confirm-delete-resume');
  window.EventBus.$off('canceled-delete-resume');
  window.EventBus.$off('cancel-form');
  window.EventBus.$off('update');
  window.EventBus.$off('uploaded');
  window.EventBus.$off('tabChange');
  window.EventBus.$off('selected-budget-year');
} // beforeDestroy

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
  beforeDestroy,
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
      resumeData: null,
      loading: false, // loading status
      model: {
        awards: [],
        basicEmployeeDataLoading: false,
        birthday: '',
        birthdayFeed: false,
        certifications: [],
        city: '',
        contract: '',
        country: '',
        currentCity: '',
        currentState: '',
        currentStreet: '',
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
    isMobile,
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
    checkForBudgetAccess
  },
  computed: {
    minimizeWindow,
    storeIsPopulated
  },
  mounted,
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>
