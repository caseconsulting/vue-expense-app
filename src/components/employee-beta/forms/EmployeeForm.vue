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
      <v-container v-else fluid>
        <v-form
          ref="form"
          validate-on="lazy"
          :disabled="submitting"
          class="my-1 mx-xl-5 mx-lg-5 mx-md-0"
          @submit.prevent="submit($event)"
        >
          <v-expansion-panels v-model="formTabs" variant="accordion" multiple eager>
            <base-form title="Personal" value="Personal Information">
              <personal-info-form ref="personalInfoFormRef" v-model="editedEmployee"></personal-info-form>
            </base-form>
            <base-form title="Clearance" value="Clearance">
              <div>
                <clearance-tab v-model="editedEmployee" :model="employee.clearances"></clearance-tab>
              </div>
            </base-form>
            <base-form title="Contracts" value="Contracts">
              <div>
                <contracts-tab
                  ref="contractsTabRef"
                  v-model="editedEmployee"
                  :model="employee.contracts"
                ></contracts-tab>
              </div>
            </base-form>
            <base-form title="Certifications & Awards" value="Certifications & Awards">
              <div>
                <certs-and-awards-tab v-model="editedEmployee"></certs-and-awards-tab>
              </div>
            </base-form>
            <base-form title="Tech and Skills" value="Tech and Skills">
              <technologies-form ref="technologiesFormRef" v-model="editedEmployee"></technologies-form>
            </base-form>
            <base-form title="Foreign Languages" value="Languages">
              <languages-form ref="languagesFormRef" v-model="editedEmployee"></languages-form>
            </base-form>
            <base-form title="Job Experience" value="Past Experience">
              <div>
                <job-experience-tab ref="jobExperienceTabRef" v-model="editedEmployee"></job-experience-tab>
              </div>
            </base-form>
            <base-form title="Education" value="Education">
              <div>
                <education-tab
                  ref="educationTabRef"
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
import { cloneDeep, isEqual, pickBy } from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { useDisplay } from 'vuetify';
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

// template refs
const form = ref(null);
const personalInfoFormRef = ref(null);
const technologiesFormRef = ref(null);
const contractsTabRef = ref(null);
const educationTabRef = ref(null);
const jobExperienceTabRef = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const fullName = computed(() => {
  return `${props.employee.firstName} ${props.employee.lastName}`;
});

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
});

onBeforeUnmount(() => {
  emitter.off('editing');
  emitter.off('canceled-cancel');
  emitter.off('confirmed-cancel');
});

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
  const validationResult = await Promise.resolve(event);
  console.log('Validation result:', validationResult); // TODO debug

  // if form is invalid
  if (!validationResult.valid) {
    console.log('Form is invalid. Cancelling submit');
    valid.value = false;
    submitting.value = false;
    return;
  }

  valid.value = true;

  // allows other tabs to finalize data, if they're open. otherwise the data should already be finalized
  try {
    personalInfoFormRef.value?.prepareSubmit();
    technologiesFormRef.value?.prepareSubmit();
    contractsTabRef.value?.prepareSubmit();
    educationTabRef.value?.prepareSubmit();
    jobExperienceTabRef.value?.prepareSubmit();
  } catch (err) {
    console.error(err);
    submitting.value = false;
    return;
  }

  // picks out all the changed values to make the api call
  let changes = pickBy(editedEmployee.value, (value, key) => {
    const oldValue = props.employee[key];
    const newValue = value;
    const changed = !isEqual(oldValue, newValue);
    if (changed) {
      // TODO test
      console.log('Changed:', key);
      console.log('\tOld:', oldValue);
      console.log('\tNew:', newValue);
    }
    return !isEqual(oldValue, newValue);
  });

  console.log('Changed values:', changes); // TODO test
  submitting.value = false;
  // editing.value = false; // close edit modal
}

function collapseAllTabs() {
  formTabs.value = [];
}
</script>

<style scoped>
.invalid {
  color: #b00020;
}
</style>
