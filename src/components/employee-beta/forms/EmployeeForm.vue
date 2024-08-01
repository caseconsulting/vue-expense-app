<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <v-dialog
    v-model="editing"
    persistent
    scrollable
    @click:outside="cancel()"
    @keydown.esc="cancel()"
    id="employee-form"
    :width="isMobile() ? '100%' : '80%'"
  >
    <v-card id="employee-card">
      <v-card-title
        class="d-flex align-center justify-space-between beta_header_style"
        style="position: sticky; top: 0; z-index: 2"
      >
        <v-row class="align-center">
          <v-col class="d-inline" v-if="!isMobile()">
            <h3 class="text-white px-2">Editing {{ isUser ? 'My Profile' : fullName }}</h3>
          </v-col>
          <v-col class="d-inline" v-else>
            <h3 class="text-white px-2">Editing</h3>
          </v-col>
          <v-spacer></v-spacer>
          <v-col class="d-inline align-center" cols="auto">
            <v-btn size="36" variant="text" icon @click="collapseAllTabs()">
              <v-icon>mdi-format-vertical-align-center</v-icon>
            </v-btn>
            <v-btn id="modalCloseBtn" size="36" variant="text" icon="" @click="cancel()"
              ><v-icon>mdi-window-close</v-icon></v-btn
            >
          </v-col>
        </v-row>
      </v-card-title>
      <div v-if="submitting" class="py-10 px-6">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <v-container v-show="!submitting" fluid class="pt-0">
        <v-row>
          <v-col v-if="!isMobile()" cols="2">
            <v-list density="compact" nav id="edit-navigation">
              <v-list-item @click="selectTab('Personal', 0)" link title="Personal"></v-list-item>
              <v-list-item @click="selectTab('Clearances', 1)" link title="Clearances"></v-list-item>
              <v-list-item @click="selectTab('Contracts', 2)" link title="Contracts"></v-list-item>
              <v-list-item
                @click="selectTab('Certifications & Awards', 3)"
                link
                title="Certifications & Awards"
              ></v-list-item>
              <v-list-item @click="selectTab('Tech & Skills', 4)" link title="Tech & Skills"></v-list-item>
              <v-list-item @click="selectTab('Languages', 5)" link title="Foreign Languages"></v-list-item>
              <v-list-item @click="selectTab('Job Experience', 6)" link title="Job Experience"></v-list-item>
              <v-list-item @click="selectTab('Education', 7)" link title="Education"></v-list-item>
            </v-list>
          </v-col>
          <v-divider v-if="!isMobile()" vertical thickness="1"></v-divider>
          <v-col>
            <v-form
              ref="form"
              validate-on="lazy"
              :disabled="submitting"
              class="my-1 mx-xl-5 mx-lg-5 mx-md-0"
              @submit.prevent="submit()"
            >
              <v-expansion-panels v-model="formTabs" variant="accordion" multiple>
                <base-form title="Personal" value="Personal">
                  <personal-info-form ref="personalInfoRef" v-model="editedEmployee"></personal-info-form>
                </base-form>
                <base-form title="Clearances" value="Clearances">
                  <div>
                    <clearance-tab
                      ref="clearanceRef"
                      v-model="editedEmployee"
                      :model="employee.clearances"
                    ></clearance-tab>
                  </div>
                </base-form>
                <base-form title="Contracts" value="Contracts">
                  <div>
                    <contracts-tab
                      ref="contractsRef"
                      v-model="editedEmployee"
                      :model="employee.contracts"
                    ></contracts-tab>
                  </div>
                </base-form>
                <base-form title="Certifications & Awards" value="Certifications & Awards">
                  <div>
                    <certs-and-awards-tab ref="certsAndAwardsRef" v-model="editedEmployee"></certs-and-awards-tab>
                  </div>
                </base-form>
                <base-form title="Tech and Skills" value="Tech & Skills">
                  <technologies-form ref="technologiesRef" v-model="editedEmployee"></technologies-form>
                </base-form>
                <base-form title="Foreign Languages" value="Languages">
                  <languages-form ref="languagesRef" v-model="editedEmployee"></languages-form>
                </base-form>
                <base-form title="Job Experience" value="Job Experience">
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
                    <v-btn id="employeeCancelBtn" variant="text" class="ma-2" @click="cancel()">Cancel</v-btn>
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
          </v-col>
        </v-row>
      </v-container>
      <form-cancel-confirmation :toggleSubmissionConfirmation="toggleCancelConfirmation" type="cancel">
        <!-- in the future this could display the number of changes, but with the current logic the number can be confusing -->
        <!-- (especially with arrays and nested objects) -->
        <v-card-text v-if="numberOfChanges > 0" align="center">There are pending changes!</v-card-text>
      </form-cancel-confirmation>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { isMobile } from '../../../utils/utils';
import BaseForm from '@/components/employee-beta/forms/BaseForm.vue';
import FormCancelConfirmation from '@/components/modals/FormCancelConfirmation.vue';
import api from '@/shared/api';
import { cloneDeep, forOwn, isEqual, pickBy } from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';
import CertsAndAwardsTab from '../form-tabs/CertsAndAwardsTab.vue';
import ClearanceTab from '../form-tabs/ClearanceTab.vue';
import ContractsTab from '../form-tabs/ContractsTab.vue';
import EducationTab from '../form-tabs/EducationTab.vue';
import JobExperienceTab from '../form-tabs/JobExperienceTab.vue';
import LanguagesForm from './LanguagesForm.vue';
import PersonalInfoForm from './PersonalInfoForm.vue';
import TechnologiesForm from './TechnologiesForm.vue';
import { useDisplayError } from '../../shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

/** @type {import('mitt').Emitter} */
const emitter = inject('emitter');

const props = defineProps(['employee', 'contracts']);
const editedEmployee = ref(cloneDeep(props.employee));
const isUser = inject('isUser');

// state
const editing = defineModel();
const formTabs = ref([]);
const submitting = ref(false);
const toggleCancelConfirmation = ref(false);
const valid = ref(true);
const numberOfChanges = ref(0);

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
    if (cardName === 'Personal Information' || cardName === 'Employee' || cardName === 'Other Information') {
      cardName = 'Personal';
    } else if (cardName === 'Clearance' || cardName === 'Clearances') {
      cardName = 'Clearances';
    } else if (cardName === 'Contracts' || cardName === 'All Contract Info') {
      cardName = 'Contracts';
    } else if (cardName === 'Job Experience') {
      cardName = 'Job Experience';
    } else if (cardName === 'Certifications' || cardName === 'Awards') {
      cardName = 'Certifications & Awards';
    } else if (cardName === 'Education' || cardName === 'All Education') {
      cardName = 'Education';
    } else if (cardName === 'Technologies and Skills' || cardName === 'Tech and Skills') {
      cardName = 'Tech & Skills';
    } else if (cardName === 'Foreign Languages') {
      cardName = 'Languages';
    } else {
      cardName = 'Personal';
    }
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
    editedEmployee.value = cloneDeep(props.employee); // clears all changes
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
 */
async function submit() {
  submitting.value = true;

  valid.value = await validate();
  if (!valid.value) return cancelSubmit();

  // scans for all changed attributes
  const changes = getChanges();

  // if there are any changes
  if (!isEmpty(Object.keys(changes))) {
    const updated = await api.updateAttributes(api.EMPLOYEES, props.employee.id, changes);
    if (updated.id) {
      emitter.emit('update', updated);
    } else {
      useDisplayError(updated.response.data.message);
    }
  }
  submitting.value = false;
  editing.value = false; // close edit modal
}

/**
 * Validates each currently open tab and prepares/reformats data if applicable. Closed tabs should be
 * validated/prepared before unmounting.
 */
async function prepareTabs() {
  return Promise.allSettled([
    certsAndAwardsRef.value?.prepareSubmit(),
    clearanceRef.value?.prepareSubmit(),
    contractsRef.value?.prepareSubmit(),
    educationRef.value?.prepareSubmit(),
    jobExperienceRef.value?.prepareSubmit(),
    languagesRef.value?.prepareSubmit(),
    personalInfoRef.value?.prepareSubmit(),
    technologiesRef.value?.prepareSubmit()
  ]);
}

/**
 * Checks validation of all tabs
 * @param {SubmitEvent} event The submit event
 */
async function validate() {
  await prepareTabs();

  let valid = true;

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
  console.log('Cannot submit, form is invalid!'); // TODO test
  valid.value = false;
  submitting.value = false;
}

/**
 * Brings up the cancel confirmation modal
 */
async function cancel() {
  await prepareTabs(); // need to prepare tabs to get the changes
  numberOfChanges.value = Object.keys(getChanges()).length;
  toggleCancelConfirmation.value = true;
}

function collapseAllTabs() {
  formTabs.value = [];
}

function selectTab(tabName, num) {
  formTabs.value = [tabName];
  let e = document.getElementById('employee-card');
  let tabHeight = 60;
  e.scroll({ top: tabHeight * num, behavior: 'smooth' });
}

/**
 * Returns true only if the value is undefined, null, or an empty string
 */
function isEmpty(value) {
  return value === undefined || value === null || value === '' || value == [];
}
</script>

<style scoped>
.invalid {
  color: #b00020;
}
#edit-navigation {
  position: sticky;
  top: 45px;
  z-index: 2;
}
</style>
