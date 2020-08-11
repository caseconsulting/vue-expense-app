<template>
  <v-card-text class="px-7 pt-5 pb-1 black--text">
    <div class="savedInfo">
      <v-tabs v-model="infoTab" center-active show-arrows class="pb-4">
        <v-tab href="#employee">Employee</v-tab>
        <v-tab href="#personal">Personal</v-tab>
        <v-tab href="#education">Education</v-tab>
        <v-tab href="#jobExperience">Job Experience</v-tab>
        <v-tab href="#certifications">Certifications</v-tab>
        <v-tab href="#awards">Awards</v-tab>
        <v-tab href="#technologies">Technologies</v-tab>
        <v-tab href="#customerOrgExp">Customer Org</v-tab>
        <v-tab-item id="employee">
          <employee-tab :admin="userIsAdmin()" :employee="userIsEmployee()" :model="model"></employee-tab>
        </v-tab-item>
        <v-tab-item id="personal">
          <personal-tab :admin="userIsAdmin()" :employee="userIsEmployee()" :model="model"></personal-tab>
        </v-tab-item>
        <v-tab-item id="education">
          <education-tab :model="model"></education-tab>
        </v-tab-item>
        <v-tab-item id="certifications">
          <certifications-tab :model="model"></certifications-tab>
        </v-tab-item>
        <v-tab-item id="jobExperience">
          <job-experience-tab :model="model"></job-experience-tab>
        </v-tab-item>
        <v-tab-item id="customerOrgExp">
          <customer-org-tab :model="model"></customer-org-tab>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-card-text>
</template>

<script>
import api from '@/shared/api';
import { getRole } from '@/utils/auth';
import _ from 'lodash';
import CertificationsTab from '@/components/employees/infoTabs/CertificationsTab';
import CustomerOrgTab from '@/components/employees/infoTabs/CustomerOrgTab';
import EducationTab from '@/components/employees/infoTabs/EducationTab';
import EmployeeTab from '@/components/employees/infoTabs/EmployeeTab';
import JobExperienceTab from '@/components/employees/infoTabs/JobExperienceTab';
import PersonalTab from '@/components/employees/infoTabs/PersonalTab';

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
    CertificationsTab,
    CustomerOrgTab,
    EducationTab,
    EmployeeTab,
    JobExperienceTab,
    PersonalTab
  },
  created,
  data() {
    return {
      afterCreate: false,
      infoTab: null,
      user: null
    };
  },
  methods: {
    userIsAdmin,
    userIsEmployee
  },
  props: ['model', 'currentTab'],
  watch: {
    infoTab: function (val) {
      if (this.afterCreate) {
        if (!_.isEqual(val, this.currentTab)) {
          window.EventBus.$emit('tabChange', val);
        }
      }
    }
  }
};
</script>

<style>
.savedInfo a {
  font-size: 14px;
  color: blue;
}

.savedInfo a:hover {
  color: #0cf;
}
</style>
