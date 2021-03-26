<template>
  <v-card-text class="black--text pb-1">
    <div class="savedInfo">
      <v-tabs v-model="infoTab" center-active show-arrows class="ma-4">
        <v-tab href="#employee">Employee</v-tab>
        <v-tab href="#personal">Personal</v-tab>
        <v-tab href="#education">Education</v-tab>
        <v-tab href="#jobExperience">Job Experience</v-tab>
        <v-tab href="#certifications">Certifications</v-tab>
        <v-tab href="#awards">Awards</v-tab>
        <v-tab href="#technologies">Technologies</v-tab>
        <v-tab href="#customerOrgExp">Customer Org</v-tab>
        <v-tab href="#contracts">Contracts</v-tab>
        <v-tab href="#clearance" v-if="userIsAdmin() || userIsEmployee()">Clearance</v-tab>
        <v-tab-item id="employee" class="ma-6">
          <employee-tab :admin="userIsAdmin()" :employee="userIsEmployee()" :model="model"></employee-tab>
        </v-tab-item>
        <v-tab-item id="personal" class="ma-6">
          <personal-tab :admin="userIsAdmin()" :employee="userIsEmployee()" :model="model"></personal-tab>
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
        <v-tab-item id="clearance" v-if="userIsAdmin() || userIsEmployee()" class="ma-6">
          <clearance-tab :model="model"></clearance-tab>
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
import PersonalTab from '@/components/employees/infoTabs/PersonalTab';
import TechnologiesTab from '@/components/employees/infoTabs/TechnologiesTab';

/**
 * Check if the user is an admin. Returns true if the user is an admin, otherwise returns false.
 *
 * @return boolean - user is an admin
 */
function userIsAdmin() {
  return getRole() === 'admin';
} // userIsAdmin

/**
 * Check if the user the employee displayed. Returns true if the user is the employee displayed, otherwise returns false.
 *
 * @return boolean - user is the employee displayed
 */
function userIsEmployee() {
  return !_.isNil(this.model) && !_.isNil(this.user) ? this.user.employeeNumber === this.model.employeeNumber : false;
} // userIsEmployee

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
  this.infoTab = this.currentTab;
  this.afterCreate = true;
} // created

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
    userIsAdmin,
    userIsEmployee
  },
  props: ['model', 'currentTab'],
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
