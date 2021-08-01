<template>
  <v-card-text class="black--text pb-1">
    <div class="savedInfo">
      <!-- For smaller screens -->
      <div v-if="useDropDown">
        <v-menu>
          <template v-slot:activator="{ on, attrs }">
            <v-btn text x-large class="pt-5 font-weight-bold" v-bind="attrs" v-on="on"
              >{{ parsedInfoTab }} <v-icon class="pb-1">expand_more</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="selectDropDown('employee')">Employee</v-list-item>
            <v-list-item @click="selectDropDown('personal')">Personal</v-list-item>
            <v-list-item @click="selectDropDown('education')">Education</v-list-item>
            <v-list-item @click="selectDropDown('jobExperience')">Job Experience</v-list-item>
            <v-list-item @click="selectDropDown('certifications')">Certifications</v-list-item>
            <v-list-item @click="selectDropDown('awards')">Awards</v-list-item>
            <v-list-item @click="selectDropDown('technologies')">Technologies</v-list-item>
            <v-list-item @click="selectDropDown('customerOrgExp')">Customer Org</v-list-item>
            <v-list-item @click="selectDropDown('contracts')">Contracts</v-list-item>
            <v-list-item @click="selectDropDown('clearance')">Clearance</v-list-item>
            <v-list-item @click="selectDropDown('languages')">Languages</v-list-item>
          </v-list>
        </v-menu>
        <hr class="my-3" />
        <employee-tab
          v-if="infoTab === 'employee'"
          :admin="hasAdminPermissions()"
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
        <education-tab v-if="infoTab === 'education'" :model="model"></education-tab>
        <job-experience-tab v-if="infoTab === 'jobExperience'" :model="model"></job-experience-tab>
        <certifications-tab v-if="infoTab === 'certifications'" :model="model"></certifications-tab>
        <awards-tab v-if="infoTab === 'awards'" :model="model"></awards-tab>
        <technologies-tab v-if="infoTab === 'technologies'" :model="model"></technologies-tab>
        <customer-org-tab v-if="infoTab === 'customerOrgExp'" :model="model"></customer-org-tab>
        <contracts-tab v-if="infoTab === 'contracts'" :model="model"></contracts-tab>
        <clearance-tab v-if="infoTab === 'clearance' && (hasAdminPermissions() || userIsEmployee())" :model="model">
        </clearance-tab>
        <languages-tab v-if="infoTab === 'languages'" :model="model"></languages-tab>
      </div>
      <!-- For larger screens -->
      <v-tabs v-if="!useDropDown" v-model="infoTab" center-active show-arrows class="ma-4">
        <v-tab href="#employee">Employee</v-tab>
        <v-tab href="#personal">Personal</v-tab>
        <v-tab href="#education">Education</v-tab>
        <v-tab href="#jobExperience">Job Experience</v-tab>
        <v-tab href="#certifications">Certifications</v-tab>
        <v-tab href="#awards">Awards</v-tab>
        <v-tab href="#technologies">Technologies</v-tab>
        <v-tab href="#customerOrgExp">Customer Org</v-tab>
        <v-tab href="#contracts">Contracts</v-tab>
        <v-tab href="#clearance" v-if="hasAdminPermissions() || userIsEmployee()">Clearance</v-tab>
        <v-tab href="#languages">Languages</v-tab>
        <v-tab-item id="employee" class="ma-6">
          <employee-tab :admin="hasAdminPermissions()" :employee="userIsEmployee()" :model="model"></employee-tab>
        </v-tab-item>
        <v-tab-item id="personal" class="ma-6">
          <personal-tab :admin="hasAdminPermissions()" :employee="userIsEmployee()" :model="model"></personal-tab>
        </v-tab-item>
        <v-tab-item id="education" class="ma-6">
          <education-tab :model="model"></education-tab>
        </v-tab-item>
        <v-tab-item id="jobExperience" class="ma-6">
          <job-experience-tab :model="model"></job-experience-tab>
        </v-tab-item>
        <v-tab-item id="certifications" class="ma-6">
          <certifications-tab :model="model"></certifications-tab>
        </v-tab-item>
        <v-tab-item id="awards" class="ma-6">
          <awards-tab :model="model"></awards-tab>
        </v-tab-item>
        <v-tab-item id="technologies" class="ma-6">
          <technologies-tab :model="model"></technologies-tab>
        </v-tab-item>
        <v-tab-item id="customerOrgExp" class="ma-6">
          <customer-org-tab :model="model"></customer-org-tab>
        </v-tab-item>
        <v-tab-item id="contracts" class="ma-6">
          <contracts-tab :model="model"></contracts-tab>
        </v-tab-item>
        <v-tab-item id="clearance" v-if="hasAdminPermissions() || userIsEmployee()" class="ma-6">
          <clearance-tab :model="model"></clearance-tab>
        </v-tab-item>
        <v-tab-item id="languages" class="ma-6">
          <languages-tab :model="model"></languages-tab>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-card-text>
</template>

<script>
import api from '@/shared/api';
import { getRole } from '@/utils/auth';
import _ from 'lodash';
import AwardsTab from '@/components/employees/infoTabs/AwardsTab';
import CertificationsTab from '@/components/employees/infoTabs/CertificationsTab';
import ClearanceTab from '@/components/employees/infoTabs/ClearanceTab';
import ContractsTab from '@/components/employees/infoTabs/ContractsTab';
import CustomerOrgTab from '@/components/employees/infoTabs/CustomerOrgTab';
import EducationTab from '@/components/employees/infoTabs/EducationTab';
import EmployeeTab from '@/components/employees/infoTabs/EmployeeTab';
import JobExperienceTab from '@/components/employees/infoTabs/JobExperienceTab';
import LanguagesTab from '@/components/employees/infoTabs/LanguagesTab';
import PersonalTab from '@/components/employees/infoTabs/PersonalTab';
import TechnologiesTab from '@/components/employees/infoTabs/TechnologiesTab';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

/**
 * Check if the user has admin permissions. Returns true if the user is an admin or a manager,
 * otherwise returns false.
 *
 * @return boolean - returns true if user is an admin or manager
 */
function hasAdminPermissions() {
  return getRole() === 'admin' || getRole() === 'manager';
} // hasAdminPermissions

/**
 * Check if the user the employee displayed. Returns true if the user is the employee displayed, otherwise returns false.
 *
 * @return boolean - user is the employee displayed
 */
function userIsEmployee() {
  return !_.isNil(this.model) && !_.isNil(this.user) ? this.user.employeeNumber === this.model.employeeNumber : false;
} // userIsEmployee

/**
 * This is used to select the correct tab on mobile devices
 */
function selectDropDown(name) {
  this.infoTab = name;
}

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/*
 * Get the user.
 */
async function created() {
  this.user = await api.getUser();
  Object.assign(this.model.technologies, this.user.technologies);
  this.infoTab = this.currentTab;
  this.afterCreate = true;
  this.calculateCurrentYears(this.model.technologies);
} // created

/**
 * Used to update the current technology fields total years of experience as of
 * when they enabled the toggle on the technology form
 */
function calculateCurrentYears(techs) {
  _.forEach(techs, (tech) => {
    if (tech.current) {
      let today = moment();
      let startDate = moment(tech.currentStartDate, 'YYYY-MM-DD');
      let months = Number(((today.diff(startDate, 'months') % 12) / 12).toFixed(2));
      tech.years = Number(tech.years) + moment().diff(tech.currentStartDate, 'years') + months;
    }
  });
} //calculateCurrentYears

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
    calculateCurrentYears,
    hasAdminPermissions,
    userIsEmployee,
    selectDropDown
  },
  props: ['model', 'currentTab'],
  computed: {
    useDropDown() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return true;
        default:
          return false;
      }
    },
    parsedInfoTab() {
      let parseTab = !this.infoTab ? 'Select Info' : this.infoTab;
      if (this.infoTab === 'customerOrgExp') {
        parseTab = 'Customer Org';
      } else if (this.infoTab === 'jobExperience') {
        parseTab = 'Job Experience';
      }
      return parseTab.toUpperCase();
    }
  },
  watch: {
    infoTab: function (val) {
      // track current tab when switching between info and form
      if (this.afterCreate) {
        if (!_.isEqual(val, this.currentTab)) {
          window.EventBus.$emit('tabChange', val);
        }
      }
    }
  }
};
</script>

<style scoped>
.savedInfo a {
  font-size: 14px;
  color: blue;
}

.savedInfo a:hover {
  color: #0cf;
}
</style>
