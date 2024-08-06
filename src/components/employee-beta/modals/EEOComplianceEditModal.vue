<template>
  <base-info-modal v-if="!close" title="Edit EEO Compliance Form">
    <v-card>
      <v-card-text>
        <p class="mb-0 mt-5">
          EEO Compliance Reporting
          <span>
            <v-tooltip activator="parent" location="top" max-width="500">
              Data in this section is only Visible to You, Managers, and Admins. Equal Employment Opportunity (EEO)
              reporting is required for companies with more than 50 employees. <b>Note:</b> options for the fields below
              are the same as the options listed in the paper format.
            </v-tooltip>
            <v-icon class="case-gray">mdi-shield</v-icon>
          </span>
        </p>

        <!-- Gender -->
        <v-select
          label="Gender"
          v-model="editedEmployee.eeoGender"
          :items="eeoGenderItems"
          variant="underlined"
          item-title="text"
          item-value="value"
          return-object
          :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
          clearable
        >
        </v-select>
        <!-- Hispanic or Latino -->
        <v-select
          label="Hispanic or Latino"
          v-model="editedEmployee.eeoHispanicOrLatino"
          :items="eeoHispanicOrLatinoItems"
          variant="underlined"
          item-title="text"
          item-value="value"
          return-object
          :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
          clearable
        >
        </v-select>
        <!-- Race or Ethnicity -->
        <v-select
          label="Race or Ethnicity"
          v-model="editedEmployee.eeoRaceOrEthnicity"
          :items="eeoRaceOrEthnicityItems"
          variant="underlined"
          item-title="text"
          item-value="value"
          return-object
          :disabled="
            disableRaceOrEthnicity ||
            ((editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo())
          "
          clearable
        >
        </v-select>

        <div>
          <!-- Job Category -->
          <v-tooltip activator="parent" location="top" max-width="400">
            Most CASE employees are considered 'Professionals'. Please select 'Professional' unless you know you fall
            into a different category.
          </v-tooltip>
          <v-select
            label="Job Category"
            v-model="editedEmployee.eeoJobCategory"
            :items="eeoJobCategoryItems"
            variant="underlined"
            item-title="text"
            item-value="value"
            return-object
            :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
            clearable
          >
          </v-select>
        </div>

        <!-- Disability -->
        <v-radio-group
          v-model="editedEmployee.eeoHasDisability"
          :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
          inline
          hide-details
          class="mt-0"
          clearable
        >
          <span class="mt-2 mr-4">Disability:</span>
          <v-radio label="Yes" :value="true"></v-radio>
          <v-radio label="No" :value="false"></v-radio>
        </v-radio-group>

        <!-- Protected Veteran -->
        <v-radio-group
          v-model="editedEmployee.eeoIsProtectedVeteran"
          :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
          inline
          hide-details
          class="mt-2"
          clearable
        >
          <span class="mt-2 mr-4">Protected Veteran:</span>
          <v-radio label="Yes" :value="true"></v-radio>
          <v-radio label="No" :value="false"></v-radio>
        </v-radio-group>

        <!-- Decline Self-identify -->
        <v-checkbox
          class="my-1"
          label="Decline to self-identify"
          v-model="editedEmployee.eeoDeclineSelfIdentify"
          :disabled="!adminCanEditEeo() && !thisIsMyProfile()"
          hide-details
        ></v-checkbox>

        <!-- Confirm Decline Self-Identify Modal -->
        <e-e-o-decline-self-identify
          :toggleDeclineSelfIdentifyModal="toggleDeclineSelfIdentifyModal"
        ></e-e-o-decline-self-identify>
        <!-- END EEO Compliance Reporting Section -->
      </v-card-text>
      <v-card-actions>
        <!-- Form action buttons -->
        <v-btn id="employeeCancelBtn" variant="text" class="ma-2" @click="cancelA">Cancel</v-btn>
        <v-btn id="employeeSubmitBtn" variant="outlined" class="ma-2" color="success" @click="submit">
          <v-icon class="mr-1">mdi-content-save</v-icon>Submit
        </v-btn>
        <!-- End form action buttons -->
      </v-card-actions>
      <!-- Confirmation Model -->
      <form-cancel-confirmation
        :cancelling="cancelling"
        :toggleSubmissionConfirmation="confirmingValid"
        type="cancel"
      ></form-cancel-confirmation>
    </v-card>
  </base-info-modal>
</template>

<script setup>
import api from '@/shared/api.js';
import _ from 'lodash';
import { inject, onBeforeUnmount, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { isEmpty, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import BaseInfoModal from './BaseInfoModal.vue';
import EEODeclineSelfIdentify from '../../modals/EEODeclineSelfIdentify.vue';
import FormCancelConfirmation from '../../modals/FormCancelConfirmation.vue';
import { updateStoreEmployees, updateStoreUser } from '@/utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const props = defineProps(['model']);
const route = useRoute();
const store = useStore();

const cancelling = ref(false); // cancelling form
const close = ref(false);
const confirmingValid = ref(false); // confirming form submission
const disableRaceOrEthnicity = ref(false);
const editedEmployee = ref(_.cloneDeep(props.model)); //employee that can be edited
const eeoGenderItems = ref([
  {
    text: 'Male',
    value: true
  },
  { text: 'Female', value: false }
]);
const eeoHispanicOrLatinoItems = ref([
  {
    text: 'Hispanic or Latino',
    value: true
  },
  { text: 'Not Hispanic or Latino', value: false }
]);
const eeoRaceOrEthnicityItems = ref([
  { text: 'White', value: 0 },
  {
    text: 'Black or African American',
    value: 1
  },
  { text: 'Native Hawaiian or Other Pacific Islander', value: 2 },
  {
    text: 'Asian',
    value: 3
  },
  { text: 'American Indian or Alaska Native', value: 4 },
  {
    text: 'Two or More Races',
    value: 5
  },
  { text: 'Not Applicable', value: 6 }
]);
const eeoJobCategoryItems = ref([
  { text: 'Professional', value: 0 },
  {
    text: 'Executive/Senior Level Official and Manager',
    value: 1
  },
  { text: 'First/Mid Level Official and Manager', value: 2 },
  {
    text: 'Technician',
    value: 3
  },
  { text: 'Sales Worker', value: 4 },
  {
    text: 'Administrative Support Worker',
    value: 5
  },
  { text: 'Craft Worker', value: 6 },
  {
    text: 'Operative',
    value: 7
  },
  { text: 'Laborer and Helper', value: 8 },
  {
    text: 'Service Worker',
    value: 9
  }
]);
const loading = ref(true);
const status = ref('100'); // work status value
const submitting = ref(false); // submitting form
const toggleDeclineSelfIdentifyModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Turn off listeners.
 */
onBeforeUnmount(() => {
  emitter.off('cancel-decline-self-identify');
  emitter.off('confirm-decline-self-identify');
  emitter.off('open-dialog');
  emitter.off('confirmed-cancel');
  emitter.off('canceled-cancel');
}); // beforeUnmount

/**
 * Emits to parent the component was created and get data.
 */
onBeforeMount(async () => {
  emitter.emit('created', 'employee'); // emit employee tab was created
  emitter.on('cancel-decline-self-identify', () => {
    editedEmployee.value.eeoDeclineSelfIdentify = false;
    toggleDeclineSelfIdentifyModal.value = false;
  });
  emitter.on('confirm-decline-self-identify', () => {
    // clear fields
    if (thisIsMyProfile()) {
      editedEmployee.value.eeoGender = null;
      editedEmployee.value.eeoHispanicOrLatino = null;
      editedEmployee.value.eeoRaceOrEthnicity = null;
      editedEmployee.value.eeoJobCategory = null;
      editedEmployee.value.eeoHasDisability = null;
      editedEmployee.value.eeoIsProtectedVeteran = null;
    }
    // close modal
    toggleDeclineSelfIdentifyModal.value = false;
  });
  emitter.on('open-dialog', () => {
    close.value = false;
  });
  // EEO reporting section
  // disable race and ethnicity field if "Hispanic and Latino" is selected.
  if (!isEmpty(editedEmployee.value.eeoHispanicOrLatino && editedEmployee.value.eeoRaceOrEthnicity)) {
    if (editedEmployee.value.eeoHispanicOrLatino.value && editedEmployee.value.eeoRaceOrEthnicity.value === 6) {
      disableRaceOrEthnicity.value = true;
    }
  }
  loading.value = false;
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determines of a user is an admin or manager and
 * if they should be allowed to edit the eeo form.
 *
 * @return boolean - True if an admin/manager can edit an EEO
 */
function adminCanEditEeo() {
  return userRoleIsAdmin() || userRoleIsManager();
} //adminCanEditEeo

/**
 * Resets back to employee info. Also deletes resume when creating an employee if
 * you decide to cancel your submission
 */
function cancelA() {
  //creating an employee
  confirmingValid.value = true;
} // cancelA

/**
 * Submits the employee form.
 */
async function submit() {
  submitting.value = true;
  window.scrollTo(0, 0);

  emitter.emit('startAction');
  if (props.model.id) {
    // updating employee
    let updatedEmployee = await api.updateItem(api.EMPLOYEES, editedEmployee.value);
    if (updatedEmployee.id) {
      // successfully updated employee
      emitter.emit('update', updatedEmployee);
      // getEmployees and update store with latest data
      if (props.model.id === store.getters.user.id) await updateStoreUser();
      await updateStoreEmployees();
    }
  }
  submitting.value = false;
  close.value = true;
  confirmingValid.value = false;
} // submit

/**
 * Checks if the profile accessed is the signed-in user's profile,
 * specifically used to prevent a manager from editing their own role
 *
 * @return boolean - true if the profile is the user's profile
 */
function thisIsMyProfile() {
  if (route.params.id === store.getters.employeeNumber.toString()) {
    return true;
  }
  return false;
} //thisIsMyProfile

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => editedEmployee.value.eeoDeclineSelfIdentify,
  (val) => {
    if (val) {
      toggleDeclineSelfIdentifyModal.value = true;
    } else if (isEmpty(val)) {
      disableRaceOrEthnicity.value = false;
    }
  }
);

watch(
  () => editedEmployee.value.eeoHispanicOrLatino,
  () => {
    if (!isEmpty(editedEmployee.value.eeoHispanicOrLatino)) {
      if (editedEmployee.value.eeoHispanicOrLatino.value) {
        editedEmployee.value.eeoRaceOrEthnicity = eeoRaceOrEthnicityItems.value[6];
        disableRaceOrEthnicity.value = true;
      } else {
        disableRaceOrEthnicity.value = false;
        if (!isEmpty(editedEmployee.value.eeoRaceOrEthnicity) && editedEmployee.value.eeoRaceOrEthnicity.value === 6) {
          editedEmployee.value.eeoRaceOrEthnicity = null;
        }
      }
    }
  }
);

watch(
  () => status.value,
  () => {
    if (status.value) {
      editedEmployee.value.workStatus = parseInt(status.value);
    } else {
      editedEmployee.value.workStatus = null;
    }
  }
);
</script>
