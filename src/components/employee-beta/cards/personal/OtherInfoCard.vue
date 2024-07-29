<template>
  <base-card title="Other Information">
    <template #title>
      <div class="d-flex align-center">
        <v-icon size="small" style="margin-right: 10px" id="personal" color="white"> mdi-information </v-icon>
        <h3 class="text-white">Other Information</h3>
      </div>
    </template>
    <v-card-text class="px-7 pt-5 pb-1 text-black">
      <p v-if="!isEmpty(getAIN())"><b>AIN:</b> {{ getAIN() }}</p>
      <p v-if="!isEmpty(getEmployeeRole())"><b>Employee Role:</b> {{ _.startCase(getEmployeeRole()) }}</p>
      <p><b>EEO Status:</b> {{ eeoStatus() }}</p>
      <div class="text-center" style="padding-bottom: 5px">
        <v-btn size="small" variant="tonal" @click="toggleView()" v-if="getEEOFilled()">View EEO Data</v-btn>
        <v-btn size="small" @click="toggleEdit()" v-else>Complete EEO Form</v-btn>
      </div>
      <e-e-o-compliance-edit-modal v-model="toggleForm" :model="model"></e-e-o-compliance-edit-modal>
      <e-e-o-compliance-view-modal v-model="viewForm" :model="model"></e-e-o-compliance-view-modal>
    </v-card-text>
  </base-card>
</template>

<script setup>
import _ from 'lodash';
import { inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { isEmpty } from '@/utils/utils';
import BaseCard from '../BaseCard.vue';
import EEOComplianceEditModal from '../../modals/EEOComplianceEditModal.vue';
import EEOComplianceViewModal from '../../modals/EEOComplianceViewModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const props = defineProps(['model']);

// const copy = _.cloneDeep(props.model);
const toggleForm = ref(false);
const viewForm = ref(false);

onBeforeMount(() => {
  emitter.on('edit-EEO', () => {
    viewForm.value = false;
    toggleForm.value = true;
    emitter.emit('open-dialog');
  });
  emitter.on('done', () => {
    toggleForm.value = false;
    viewForm.value = false;
  });
});

onBeforeUnmount(() => {
  emitter.off('edit-EEO');
  emitter.off('done');
});

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
  return (
    !isEmpty(props.model.eeoGender) &&
    !isEmpty(props.model.eeoHispanicOrLatino) &&
    !isEmpty(props.model.eeoRaceOrEthnicity) &&
    !isEmpty(props.model.eeoJobCategory) &&
    !isEmpty(props.model.eeoHasDisability) &&
    !isEmpty(props.model.eeoIsProtectedVeteran)
  );
}

/**
 * Returns complete/incomplete based on if EEO is filled out
 *
 * @return String - complete/incomplete EEO form
 */
function eeoStatus() {
  return getEEOFilled() ? 'Complete' : 'Incomplete';
}

function toggleEdit() {
  emitter.emit('open-dialog');
  return (toggleForm.value = !toggleForm.value);
}

function toggleView() {
  return (viewForm.value = !viewForm.value);
}
</script>
