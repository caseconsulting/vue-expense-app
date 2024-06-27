<template>
  <v-card class="infoTab">
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <h3 class="text-white px-2">
        <v-icon size="small" style="margin-right: 10px" id="personal" color="white"> mdi-information </v-icon>Other
        Information
      </h3>
      <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text" icon="">
        <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
        <v-icon id="edit" color="white"> mdi-pencil </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="px-7 pt-5 pb-1 text-black">
      <p v-if="!isEmpty(getAIN())"><b>AIN:</b> {{ getAIN() }}</p>
      <p v-if="!isEmpty(getEmployeeRole())"><b>EMP ROLE:</b> {{ _.startCase(getEmployeeRole()) }}</p>
      <p><b>EEO Status:</b> {{ eeoStatus() }}</p>
      <div class="text-center" style="padding-bottom: 5px">
        <v-btn size="small" variant="tonal" v-if="getEEOFilled()">View Now</v-btn>
        <v-btn size="small" v-else>Complete Now</v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import _ from 'lodash';
import { ref, inject } from 'vue';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
const eeoFilledOut = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns AIN of employee
 *
 * @return String - AIN of Employee
 */
function getAIN() {
  return props.model.agencyIdentificationNumber;
}

/**
 * Returns the employee role
 *
 * @return String - Employee Role
 */
function getEmployeeRole() {
  return props.model.employeeRole;
}

/**
 * Returns whether or not the EEO has been filled out
 *
 * @return boolean - if the EEO is filled out
 */
function getEEOFilled() {
  eeoFilledOut.value = props.model.eeoAdminHasFilledOutEeoForm;
  return eeoFilledOut.value;
}

/**
 * Returns complete/incomplete based on if EEO is filled out
 *
 * @return String - complete/incomplete EEO form
 */
function eeoStatus() {
  return eeoFilledOut.value ? 'Complete' : 'Incomplete';
}
</script>
