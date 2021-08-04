<template>
  <v-container class="my-3" fluid>
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
    <v-row class="pl-3">
      <v-col align="left" justify="left">
        <v-btn id="backToEmployeesBtn" elevation="2" to="/employees"
          ><v-icon class="pr-1">arrow_back</v-icon>Back to Employees Page</v-btn
        >
      </v-col>
      <v-col v-if="hasAdminPermissions() || userIsEmployee()" align="right" justify="right">
        <v-btn
          @click="toggleResumeParser = !toggleResumeParser"
          v-if="!editing"
          color="#bc3825"
          class="white--text ma-2"
          ><b>Upload Resume</b></v-btn
        >
        <v-btn
          class="white--text ma-2"
          v-if="!editing"
          color="#bc3825"
          @click="toggleDeleteModal = !toggleDeleteModal"
          :disabled="!hasResume"
          :loading="deleteLoading"
          ><b>Delete Resume</b></v-btn
        >
      </v-col>
    </v-row>
    <v-row v-if="loading" class="my-10" justify="center">
      <v-progress-circular :size="70" :width="7" color="#bc3825" indeterminate></v-progress-circular>
    </v-row>
    <v-row v-else>
      <!-- QuickBooks Time and Budgets-->
      <v-col v-if="displayQuickBooksTimeAndBalances" cols="12" md="5" lg="4">
        <quick-books-time-data :employee="this.model" class="mb-6"></quick-books-time-data>
        <available-budgets class="mb-4" v-if="this.model.id" :employee="this.model"></available-budgets>
        <anniversary-card v-if="!minimizeWindow" :employee="this.model"></anniversary-card>
      </v-col>

      <!-- Employee Form -->
      <v-col cols="12" :md="displayQuickBooksTimeAndBalances ? 7 : 12" :lg="displayQuickBooksTimeAndBalances ? 8 : 12">
        <v-card class="mt-3">
          <v-card-title class="header_style" v-if="!editing">
            <h3 id="employeeName">{{ this.model.firstName }} {{ this.model.lastName }}</h3>
            <v-spacer></v-spacer>
            <convert-employee-to-csv v-if="userIsAdmin()" :employee="this.model" color="white" />
            <v-tooltip v-if="hasAdminPermissions() || userIsEmployee()" top>
              <template #activator="{ on }">
                <div v-on="on">
                  <v-icon
                    :disabled="!hasResume"
                    class="pr-2"
                    @click="downloadResume()"
                    style="color: white"
                    align="right"
                    v-on="on"
                    id="edit"
                    >sim_card_download</v-icon
                  >
                </div>
              </template>
              <span>{{ hasResume ? 'Download Resume' : 'No resume available' }}</span>
            </v-tooltip>
            <v-tooltip v-if="hasAdminPermissions() || userIsEmployee()" top>
              <template #activator="{ on }">
                <v-icon class="pr-2" @click="editing = true" style="color: white" align="right" v-on="on" id="edit"
                  >edit</v-icon
                >
              </template>
              <span>Edit Profile</span>
            </v-tooltip>
          </v-card-title>
          <employee-info :model="this.model" :currentTab="this.currentTab" v-if="!editing"></employee-info>
        </v-card>
        <!-- Edit Info (Form) -->
        <employee-form :employee="this.model" :currentTab="this.currentTab" v-if="editing"></employee-form>
        <anniversary-card v-if="minimizeWindow" :employee="this.model"></anniversary-card>
        <budget-chart
          v-if="(userIsAdmin() || userIsEmployee()) && hasAccessToBudgets"
          class="pt-4"
          :employee="this.model"
          :fiscalDateView="fiscalDateView"
        ></budget-chart>
      </v-col>
    </v-row>
    <resume-parser v-if="!loading" :toggleResumeParser="this.toggleResumeParser" :employee="this.model"></resume-parser>
    <delete-modal :toggleDeleteModal="this.toggleDeleteModal" type="resume"></delete-modal>
  </v-container>
</template>

<script>
import api from '@/shared/api.js';
import AvailableBudgets from '@/components/AvailableBudgets.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import EmployeeInfo from '@/components/employees/EmployeeInfo.vue';
import QuickBooksTimeData from '@/components/QuickBooksTimeData.vue';
import { getRole } from '@/utils/auth';
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';
import ConvertEmployeeToCsv from '../components/ConvertEmployeeToCsv.vue';
import AnniversaryCard from '@/components/AnniversaryCard.vue';
import BudgetChart from '@/components/BudgetChart.vue';
import MobileDetect from 'mobile-detect';
import ResumeParser from '@/components/modals/ResumeParser';
import DeleteModal from '@/components/modals/DeleteModal';

const moment = require('moment');
const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function clearStatus() {
  this.$set(this.uploadStatus, 'statusType', undefined);
  this.$set(this.uploadStatus, 'statusMessage', null);
  this.$set(this.uploadStatus, 'color', null);
} // clearStatus

async function downloadResume() {
  let signedURL = await api.getResume(this.$route.params.id);
  if (signedURL !== null) {
    window.open(signedURL, '_blank');
  }
}

/**
 * Checks if there is data about an employee to display. Returns true if the user is an admin or if there is data
 * on the employee's github or twitter, otherwise returns false.
 *
 * @item item - employee to check
 * @return boolean - employee has data to display
 */
function isDisplayData(item) {
  let valid = !this.userIsAdmin() && this.isEmpty(item.github) && this.isEmpty(item.twitter);
  return valid;
} // isDisplayData

/**
 * Gets the current active anniversary budget year starting date in isoformat.
 *
 * @return String - current active anniversary budget date (YYYY-MM-DD)
 */
function getCurrentBudgetYear() {
  let currentBudgetYear = moment(this.model.hireDate, IsoFormat);
  if (moment().isAfter(currentBudgetYear)) {
    currentBudgetYear.year(moment().year());
    if (moment().isBefore(currentBudgetYear)) {
      currentBudgetYear = currentBudgetYear.subtract(1, 'years');
    }
  }
  return currentBudgetYear.format(IsoFormat);
} // getCurrentBudgetYear

/**
 * Get employee data.
 */
async function getEmployee() {
  let employees = await api.getItems(api.EMPLOYEES);
  this.model = _.find(employees, (employee) => {
    return employee.employeeNumber == this.$route.params.id;
  });
} // getEmployee

/**
 * Returns Full Time, Part Time, or Inactive based on the work status
 */
function getWorkStatus(workStatus) {
  if (workStatus == 100) {
    return 'Full Time';
  } else if (workStatus == 0) {
    return 'Inactive';
  } else if (workStatus > 0 && workStatus < 100) {
    return `Part Time (${workStatus}%)`;
  } else {
    return 'Invalid Status';
  }
} // getWorkStatus

/**
 * Checks if the current device used is mobile. Return true if it is mobile. Returns false if it is not mobile.
 *
 * @return boolean - if the device is mobile
 */
function isMobile() {
  let md = new MobileDetect(window.navigator.userAgent);
  return md.os() === 'AndroidOS' || md.os() === 'iOS';
} // isMobile

function minimizeWindow() {
  switch (this.$vuetify.breakpoint.name) {
    case 'xs':
      return true;
    case 'sm':
      return true;
    default:
      return false;
  }
}

/**
 * Checks to see if the user is an admin. Returns true if the user's role is an admin, otherwise returns false.
 */
function userIsAdmin() {
  return this.role === 'admin';
} // userIsAdmin

function hasAdminPermissions() {
  return this.role === 'admin' || this.role === 'manager';
} // hasAdminPermissions
/**
 * Check if the user the employee displayed. Returns true if the user is the employee displayed, otherwise returns false.
 *
 * @return boolean - user is the employee displayed
 */
function userIsEmployee() {
  return !_.isNil(this.model) && !_.isNil(this.user) ? this.user.employeeNumber === this.model.employeeNumber : false;
} // userIsEmployee

function displayMessage(type, msg, color) {
  this.$set(this.uploadStatus, 'statusType', type);
  this.$set(this.uploadStatus, 'statusMessage', msg);
  this.$set(this.uploadStatus, 'color', color);
}

async function deleteResume() {
  this.deleteLoading = true;
  let deleteResult = await api.deleteResume(this.$route.params.id);
  if (!(deleteResult instanceof Error)) {
    this.hasResume = false;
    this.displayMessage('SUCCESS', 'Successfully deleted resume', 'green');
  } else {
    this.displayMessage('ERROR', 'Failure to delete resume', 'red');
  }
  this.deleteLoading = false;
} //deleteResume

/**
 * Checks if the user has access to any budgets
 */
async function checkForBudgetAccess() {
  let accessibleBudgets = await api.getAllActiveEmployeeBudgets(this.user.id);
  if (accessibleBudgets.length == 0) {
    // does not have access to any budgets
    this.hasAccessToBudgets = false; // disable budget chart
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

  window.EventBus.$on('delete-resume', (newResume) => {
    if (newResume != null) {
      this.hasResume = newResume;
    }
  });
  window.EventBus.$on('upload-resume-complete', (newResume) => {
    if (newResume != null) {
      this.hasResume = newResume;
    }
  });
  this.loading = true;
  await this.getEmployee();
  this.user = await api.getUser();
  this.checkForBudgetAccess();
  this.role = getRole();
  this.displayQuickBooksTimeAndBalances = this.userIsAdmin() || this.userIsEmployee();
  this.loading = false;
  this.fiscalDateView = this.getCurrentBudgetYear();
  this.hasResume = (await api.getResume(this.$route.params.id)) != null;
} // created

/**
 * Mount event listeners.
 */
async function mounted() {
  window.EventBus.$on('cancel-form', () => {
    this.editing = false;
  });

  window.EventBus.$on('update', (updatedEmployee) => {
    if (updatedEmployee) {
      this.model = updatedEmployee;
    }
  });

  window.EventBus.$on('uploaded', (isUploaded) => {
    this.hasResume = isUploaded;
    this.displayMessage('SUCCESS', 'Successfully uploaded resume', 'green');
  });

  window.EventBus.$on('tabChange', (tab) => {
    this.currentTab = tab;
  });

  window.EventBus.$on('selected-budget-year', (data) => {
    if (data.format(IsoFormat) != this.fiscalDateView) {
      this.fiscalDateView = data.format(IsoFormat);
    }
  });

  window.EventBus.$on('resume', async (newEmployeeForm) => {
    this.model = newEmployeeForm;
    await api.updateItem(api.EMPLOYEES, this.model);
  });
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy() {
    window.EventBus.$off('delete-resume');
    window.EventBus.$off('upload-resume-complete');
  },
  components: {
    AvailableBudgets,
    DeleteModal,
    EmployeeForm,
    EmployeeInfo,
    QuickBooksTimeData,
    ConvertEmployeeToCsv,
    AnniversaryCard,
    BudgetChart,
    ResumeParser
  },
  created,
  data() {
    return {
      currentTab: null,
      deleteLoading: false,
      displayQuickBooksTimeAndBalances: true,
      editing: false,
      filter: {
        active: ['full', 'part'] // default only shows full and part time employees
      }, // datatable filter
      fiscalDateView: '',
      hasResume: false,
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
        phoneNumber: '',
        prime: '',
        st: '',
        technologies: [],
        twitter: '',
        workStatus: 100
      }, // selected employee
      role: null, // user role
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
      hasAccessToBudgets: true
    };
  },
  methods: {
    clearStatus,
    deleteResume,
    displayMessage,
    downloadResume,
    hasAdminPermissions,
    isDisplayData,
    isEmpty,
    isMobile,
    getEmployee,
    getCurrentBudgetYear,
    getWorkStatus,
    userIsAdmin,
    userIsEmployee,
    checkForBudgetAccess
  },
  computed: {
    minimizeWindow
  },
  mounted
};
</script>
