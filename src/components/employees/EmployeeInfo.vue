<template>
  <v-card-text class="text-black pb-1">
    <!-- For smaller screens -->
    <div v-if="useDropDown">
      <v-row>
        <v-col cols="12" align="center">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn variant="text" size="large" class="mt-5 font-weight-bold" v-bind="props"
                >{{ parsedInfoTab }} <v-icon size="large" class="pb-1">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="selectDropDown('employee')">Employee</v-list-item>
              <v-list-item @click="selectDropDown('personal')">Personal</v-list-item>
              <v-list-item @click="selectDropDown('customerOrgExp')">Customer Org</v-list-item>
              <v-list-item @click="selectDropDown('contracts')">Contracts</v-list-item>
              <v-list-item @click="selectDropDown('clearance')">Clearance</v-list-item>
              <v-list-item @click="selectDropDown('technologies')">Tech and Skills</v-list-item>
              <v-list-item @click="selectDropDown('education')">Education</v-list-item>
              <v-list-item @click="selectDropDown('jobExperience')">Job Experience</v-list-item>
              <v-list-item @click="selectDropDown('certifications')">Certifications</v-list-item>
              <v-list-item @click="selectDropDown('awards')">Awards</v-list-item>
              <v-list-item @click="selectDropDown('languages')">Foreign Languages</v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
      <hr class="my-3" />
      <employee-tab
        v-if="infoTab === 'employee'"
        :admin="hasAdminPermissions()"
        :contracts="contracts"
        :employee="userIsEmployee()"
        :model="model"
      >
      </employee-tab>
      <personal-tab
        v-if="infoTab === 'personal'"
        :admin="hasAdminPermissions()"
        :employee="userIsEmployee()"
        :model="model"
      >
      </personal-tab>
      <customer-org-tab v-if="infoTab === 'customerOrgExp'" :model="model"></customer-org-tab>
      <contracts-tab v-if="infoTab === 'contracts'" :model="model" :contracts="contracts"></contracts-tab>
      <clearance-tab
        v-if="infoTab === 'clearance' && (hasAdminPermissions() || userIsEmployee())"
        :model="model"
      ></clearance-tab>
      <technologies-tab v-if="infoTab === 'technologies'" :model="model"></technologies-tab>
      <education-tab v-if="infoTab === 'education'" :model="model"></education-tab>
      <job-experience-tab v-if="infoTab === 'jobExperience'" :model="model"></job-experience-tab>
      <certifications-tab v-if="infoTab === 'certifications'" :model="model"></certifications-tab>
      <awards-tab v-if="infoTab === 'awards'" :model="model"></awards-tab>
      <languages-tab v-if="infoTab === 'languages'" :model="model"></languages-tab>
    </div>
    <!-- For larger screens -->
    <v-tabs v-if="!useDropDown" v-model="infoTab" center-active show-arrows color="blue" class="ma-4">
      <v-tab value="employee">Employee</v-tab>
      <v-tab value="personal">Personal</v-tab>
      <v-tab value="customerOrgExp">Customer Org</v-tab>
      <v-tab value="contracts">Contracts</v-tab>
      <v-tab value="clearance" v-if="hasAdminPermissions() || userIsEmployee()">Clearance</v-tab>
      <v-tab value="technologies">Tech and Skills</v-tab>
      <v-tab value="education">Education</v-tab>
      <v-tab value="jobExperience">Job Experience</v-tab>
      <v-tab value="certifications">Certifications</v-tab>
      <v-tab value="awards">Awards</v-tab>
      <v-tab value="languages">Foreign Languages</v-tab>
    </v-tabs>
    <v-window v-model="infoTab" v-if="!useDropDown">
      <v-window-item value="employee" class="ma-4">
        <employee-tab
          :admin="hasAdminPermissions()"
          :contracts="contracts"
          :employee="userIsEmployee()"
          :model="model"
        ></employee-tab>
      </v-window-item>
      <v-window-item value="personal" class="ma-4">
        <personal-tab :admin="hasAdminPermissions()" :employee="userIsEmployee()" :model="model"></personal-tab>
      </v-window-item>
      <v-window-item value="customerOrgExp" class="ma-4">
        <customer-org-tab :model="model"></customer-org-tab>
      </v-window-item>
      <v-window-item value="contracts" class="ma-4">
        <contracts-tab :contracts="contracts" :model="model"></contracts-tab>
      </v-window-item>
      <v-window-item value="clearance" v-if="hasAdminPermissions() || userIsEmployee()" class="ma-6">
        <clearance-tab :model="model"></clearance-tab>
      </v-window-item>
      <v-window-item value="technologies" class="ma-4">
        <technologies-tab :model="model"></technologies-tab>
      </v-window-item>
      <v-window-item value="education" class="ma-4">
        <education-tab :model="model"></education-tab>
      </v-window-item>
      <v-window-item value="jobExperience" class="ma-4">
        <job-experience-tab :model="model"></job-experience-tab>
      </v-window-item>
      <v-window-item value="certifications" class="ma-4">
        <certifications-tab :model="model"></certifications-tab>
      </v-window-item>
      <v-window-item value="awards" class="ma-4">
        <awards-tab :model="model"></awards-tab>
      </v-window-item>
      <v-window-item value="languages" class="ma-4">
        <languages-tab :model="model"></languages-tab>
      </v-window-item>
    </v-window>
  </v-card-text>
</template>

<script>
import { getRole } from '@/utils/auth';
import _isNil from 'lodash/isNil';
import _isEqual from 'lodash/isEqual';
import AwardsTab from '@/components/employees/info-tabs/AwardsTab';
import CertificationsTab from '@/components/employees/info-tabs/CertificationsTab';
import ClearanceTab from '@/components/employees/info-tabs/ClearanceTab';
import ContractsTab from '@/components/employees/info-tabs/ContractsTab';
import CustomerOrgTab from '@/components/employees/info-tabs/CustomerOrgTab';
import EducationTab from '@/components/employees/info-tabs/EducationTab';
import EmployeeTab from '@/components/employees/info-tabs/EmployeeTab';
import JobExperienceTab from '@/components/employees/info-tabs/JobExperienceTab';
import LanguagesTab from '@/components/employees/info-tabs/LanguagesTab';
import PersonalTab from '@/components/employees/info-tabs/PersonalTab';
import TechnologiesTab from '@/components/employees/info-tabs/TechnologiesTab';

/**
 * Check if the user has admin permissions. Returns true if the user is an admin or a manager,
 * otherwise returns false.
 *
 * @return boolean - returns true if user is an admin or manager
 */
function hasAdminPermissions() {
  return this.getRole() === 'admin' || this.getRole() === 'manager';
} // hasAdminPermissions

/**
 * Check if the user the employee displayed. Returns true if the user is the employee displayed, otherwise returns false.
 *
 * @return boolean - user is the employee displayed
 */
function userIsEmployee() {
  return !_isNil(this.model) && !_isNil(this.user) ? this.user.employeeNumber === this.model.employeeNumber : false;
} // userIsEmployee

/**
 * This is used to select the correct tab on mobile devices.
 */
function selectDropDown(name) {
  this.infoTab = name;
} // selectDropDown

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/*
 * Get the user.
 */
async function created() {
  this.user = this.$store.getters.user;
  this.infoTab = this.currentTab;
  this.afterCreate = true;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * computed boolean to decide whether or not to use dropdown.
 *
 * @return boolean - returns true for small screens
 */
function useDropDown() {
  switch (this.$vuetify.display.name) {
    case 'xs':
      return true;
    default:
      return false;
  }
} // useDropDown

/**
 * computed value for selected info tab.
 */
function parsedInfoTab() {
  let parseTab = !this.infoTab ? 'Select Info' : this.infoTab;
  if (this.infoTab === 'customerOrgExp') {
    parseTab = 'Customer Org';
  } else if (this.infoTab === 'jobExperience') {
    parseTab = 'Job Experience';
  } else if (this.infoTab === 'languages') {
    parseTab = 'Foreign Languages';
  }
  return parseTab.toUpperCase();
} // parsedInfoTab

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for infoTab - track and emit tab when switching.
 *
 * @param val - tab being tracked
 */
function watchInfoTab(val) {
  // track current tab when switching between info and form
  if (this.afterCreate) {
    if (!_isEqual(val, this.currentTab)) {
      this.emitter.emit('tabChange', val);
    }
  }
} // watchInfoTab

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    AwardsTab,
    CertificationsTab,
    ClearanceTab,
    ContractsTab,
    CustomerOrgTab,
    EducationTab,
    EmployeeTab,
    JobExperienceTab,
    LanguagesTab,
    PersonalTab,
    TechnologiesTab
  },
  created,
  data() {
    return {
      afterCreate: false, // component has been created
      infoTab: null, // currently active tab
      user: null // user logged-in
    };
  },
  methods: {
    getRole,
    hasAdminPermissions,
    userIsEmployee,
    selectDropDown
  },
  props: ['model', 'contracts', 'currentTab'],
  computed: {
    useDropDown,
    parsedInfoTab
  },
  watch: {
    infoTab: watchInfoTab
  }
};
</script>
