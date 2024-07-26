<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <v-dialog
    v-model="editing"
    persistent
    scrollable
    @click:outside="toggleCancelConfirmation = true"
    @keydown.esc="toggleCancelConfirmation = true"
    id="employee-form"
    :width="smAndDown ? '100%' : '70%'"
  >
    <v-card>
      <v-card-title
        class="d-flex align-center justify-space-between beta_header_style"
        style="position: sticky; top: 0; z-index: 2"
      >
        <v-row class="d-flex align-center">
          <v-col>
            <h3 class="text-white px-2">Editing {{ isUser ? 'My Profile' : fullName }}</h3>
          </v-col>
          <v-col class="d-flex align-center" cols="auto">
            <v-btn size="36" variant="text" icon @click="collapseAllTabs()">
              <v-icon>mdi-format-vertical-align-center</v-icon>
            </v-btn>
            <v-btn id="modalCloseBtn" size="36" variant="text" icon="" @click="toggleCancelConfirmation = true"
              ><v-icon>mdi-window-close</v-icon></v-btn
            >
          </v-col>
        </v-row>
      </v-card-title>
      <div v-if="submitting" class="py-10 px-6">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <v-container v-show="!submitting" fluid>
        <v-form
          ref="form"
          validate-on="lazy"
          :disabled="submitting"
          class="my-1 mx-xl-5 mx-lg-5 mx-md-0"
          @submit.prevent="submit($event)"
        >
          <v-expansion-panels v-model="formTabs" variant="accordion" multiple>
            <base-form title="Personal" value="Personal Information">
              <personal-info-form ref="personalInfoRef" v-model="editedEmployee"></personal-info-form>
            </base-form>
            <base-form title="Clearance" value="Clearance">
              <div>
                <clearance-tab ref="clearanceRef" v-model="editedEmployee" :model="employee.clearances"></clearance-tab>
              </div>
            </base-form>
            <base-form title="Contracts" value="Contracts">
              <div>
                <contracts-tab ref="contractsRef" v-model="editedEmployee" :model="employee.contracts"></contracts-tab>
              </div>
            </base-form>
            <base-form title="Certifications & Awards" value="Certifications & Awards">
              <div>
                <certs-and-awards-tab ref="certsAndAwardsRef" v-model="editedEmployee"></certs-and-awards-tab>
              </div>
            </base-form>
            <base-form title="Tech and Skills" value="Tech and Skills">
              <technologies-form ref="technologiesRef" v-model="editedEmployee"></technologies-form>
            </base-form>
            <base-form title="Foreign Languages" value="Languages">
              <languages-form ref="languagesRef" v-model="editedEmployee"></languages-form>
            </base-form>
            <base-form title="Job Experience" value="Past Experience">
              <div>
                <job-experience-tab ref="jobExperienceRef" v-model="editedEmployee"></job-experience-tab>
              </div>
            </base-form>
            <base-form title="Education" value="Education">
              <div>
                <education-tab
                  ref="educationRef"
                  v-model="editedEmployee"
                  :model="employee.education"
                  :allowAdditions="true"
                ></education-tab>
              </div>
            </base-form>
          </v-expansion-panels>
          <v-card-actions>
            <v-row class="d-flex align-center">
              <!-- Form action buttons -->
              <v-col cols="auto">
                <v-btn id="employeeCancelBtn" variant="text" class="ma-2" @click="toggleCancelConfirmation = true"
                  >Cancel</v-btn
                >
              </v-col>
              <v-col cols="auto">
                <v-btn id="employeeSubmitBtn" variant="outlined" class="ma-2" color="success" type="submit">
                  <v-icon class="mr-1">mdi-content-save</v-icon>Submit
                </v-btn>
              </v-col>
              <!-- End form action buttons -->
              <v-col cols="auto">
                <p v-if="!valid" class="invalid mb-0">Cannot submit, there are invalid fields!</p>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-form>
      </v-container>
      <form-cancel-confirmation
        :toggleSubmissionConfirmation="toggleCancelConfirmation"
        type="cancel"
      ></form-cancel-confirmation>
    </v-card>
  </v-dialog>
</template>

<script setup>
import BaseForm from '@/components/employee-beta/forms/BaseForm.vue';
import FormCancelConfirmation from '@/components/modals/FormCancelConfirmation.vue';
import api from '@/shared/api';
import { cloneDeep, forOwn, isEqual, isUndefined, pickBy } from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';
import { useDisplay } from 'vuetify/lib/framework.mjs';
import CertsAndAwardsTab from '../form-tabs/CertsAndAwardsTab.vue';
import ClearanceTab from '../form-tabs/ClearanceTab.vue';
import ContractsTab from '../form-tabs/ContractsTab.vue';
import EducationTab from '../form-tabs/EducationTab.vue';
import JobExperienceTab from '../form-tabs/JobExperienceTab.vue';
import LanguagesForm from './LanguagesForm.vue';
import PersonalInfoForm from './PersonalInfoForm.vue';
import TechnologiesForm from './TechnologiesForm.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

/** @type {import('mitt').Emitter} */
const emitter = inject('emitter');
const { smAndDown } = useDisplay();

const props = defineProps(['employee', 'contracts']);
const editedEmployee = ref(cloneDeep(props.employee));
const isUser = inject('isUser');

// state
const editing = defineModel();
const formTabs = ref([]); //TODO: Sync up current tabs on edit form and info cards
const submitting = ref(false);
const toggleCancelConfirmation = ref(false);
const valid = ref(true);

const validTabs = reactive({
  personal: true,
  certsAndAwards: true,
  clearance: true,
  contracts: true,
  education: true,
  jobExperience: true,
  technologies: true,
  languages: true
});

// template refs
const form = ref(null);
const certsAndAwardsRef = ref(null);
const clearanceRef = ref(null);
const contractsRef = ref(null);
const educationRef = ref(null);
const jobExperienceRef = ref(null);
const languagesRef = ref(null);
const personalInfoRef = ref(null);
const technologiesRef = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  emitter.on('editing', (cardName) => {
    formTabs.value = [cardName];
    editing.value = true;
  });

  // Starts listener to see if the user cancelled to submit the form
  emitter.on('canceled-cancel', () => {
    toggleCancelConfirmation.value = false;
  });

  emitter.on('confirmed-cancel', async () => {
    toggleCancelConfirmation.value = false;
    editing.value = false;
  });

  emitter.on('validating', (event) => {
    validTabs[event.tab] = event.valid;
  });
});

onBeforeUnmount(() => {
  emitter.off('editing');
  emitter.off('canceled-cancel');
  emitter.off('confirmed-cancel');
  emitter.off('validating');
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const fullName = computed(() => `${props.employee.firstName} ${props.employee.lastName}`);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Submits!!
 *
 * @param {SubmitEvent} event the SubmitEvent
 */
async function submit(event) {
  submitting.value = true;

  // validate each tab
  await Promise.allSettled([
    certsAndAwardsRef.value?.prepareSubmit(),
    clearanceRef.value?.prepareSubmit(),
    contractsRef.value?.prepareSubmit(),
    educationRef.value?.prepareSubmit(),
    jobExperienceRef.value?.prepareSubmit(),
    languagesRef.value?.prepareSubmit(),
    personalInfoRef.value?.prepareSubmit(),
    technologiesRef.value?.prepareSubmit()
  ]);

  // validating the whole form (even after validating the tabs) is still needed. it doesn't work otherwise
  valid.value = await validate(event);
  if (!valid.value) return cancelSubmit();

  // picks out all the changed values to make the api call
  let changes = getChanges();

  console.log('Changed values:', changes); // TODO test

  // if there are any changes
  if (!isEmpty(Object.keys(changes))) {
    const updated = await api.updateAttributes(api.EMPLOYEES, props.employee.id, changes);
    emitter.emit('update', updated);
  }

  submitting.value = false;
  editing.value = false; // close edit modal
}

/**
 * Checks validation of all tabs
 * @param {SubmitEvent} event The submit event
 */
async function validate(event) {
  const result = await Promise.resolve(event);
  let valid = result.valid;

  // iterates through each tab to make sure they are all valid
  forOwn(validTabs, (value) => {
    valid = valid && value;
  });
  return valid;
}

/**
 * Gets an object containing only the fields that were edited by the user
 */
function getChanges() {
  return pickBy(editedEmployee.value, (value, key) => {
    const oldValue = props.employee[key];
    const newValue = value;

    // if both values are empty (i.e. empty string, null, or undefined) they are treated as equal
    let changed = !isEqual(oldValue, newValue) && !(isEmpty(oldValue) && isEmpty(newValue));

    if (changed) {
      // TODO test
      console.log('Changed:', key);
      console.log('\tOld:', oldValue);
      console.log('\tNew:', newValue);
    }
    return changed;
  });
}

/**
 * Called if the form is invalid after trying to submit
 */
function cancelSubmit() {
  console.log('Form is invalid. Cancelling submit'); // TODO test
  valid.value = false;
  submitting.value = false;
}

function collapseAllTabs() {
  formTabs.value = [];
}

/**
 * Returns true only if the value is undefined, null, or empty string
 */
function isEmpty(value) {
  return isUndefined(value) || value === null || value === '';
}
</script>

<style scoped>
.invalid {
  color: #b00020;
}
</style>
