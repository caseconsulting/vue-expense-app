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
          v-model="valid"
          validate-on="blur"
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
                <clearance-tab :validating="validating.clearance" :model="employee.clearances"></clearance-tab>
              </div>
            </base-form>
            <base-form title="Contracts" value="Contracts">
              <div>
                <contracts-tab
                  :contracts="contracts"
                  :validating="validating.contracts"
                  :model="employee.contracts"
                ></contracts-tab>
              </div>
            </base-form>
            <base-form title="Certifications & Awards" value="Certifications & Awards">
              <div>
                <certs-and-awards-tab
                  :certifications="employee.certifications"
                  :awards="employee.awards"
                  :validateCertifcations="validating.certifications"
                  :validateAwards="validating.awards"
                ></certs-and-awards-tab>
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
                <job-experience-tab :model="model" :validating="validating.jobExperience"></job-experience-tab>
              </div>
            </base-form>
            <base-form title="Education" value="Education">
              <div>
                <education-tab
                  :model="employee.education"
                  :validating="validating.education"
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
import LanguagesForm from './LanguagesForm.vue';
import PersonalInfoForm from './PersonalInfoForm.vue';
import TechnologiesForm from './TechnologiesForm.vue';
import JobExperienceTab from '../form-tabs/JobExperienceTab.vue';
import EducationTab from '../form-tabs/EducationTab.vue';
import CertsAndAwardsTab from '../form-tabs/CertsAndAwardsTab.vue';
import ClearanceTab from '../form-tabs/ClearanceTab.vue';
import ContractsTab from '../form-tabs/ContractsTab.vue';
import _ from 'lodash';
import { useDisplay } from 'vuetify';

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
const editing = defineModel();
const formTabs = ref([]); //TODO: Sync up current tabs on edit form and info cards
const model = ref({
  agencyIdentificationNumber: null,
  awards: [],
  birthday: null,
  birthdayFeed: false,
  certifications: [],
  city: null,
  clearances: [],
  companies: [],
  contract: null,
  contracts: [],
  country: null,
  currentCity: null,
  currentState: null,
  currentStreet: null,
  currentStreet2: null,
  currentZIP: null,
  customerOrgExp: [],
  degrees: [],
  deptDate: null,
  email: '@consultwithcase.com',
  employeeNumber: null,
  employeeRole: 'user',
  firstName: null,
  github: null,
  hireDate: null,
  icTimeFrames: [],
  id: null,
  jobRole: null,
  jobs: [],
  languages: [],
  lastName: null,
  middleName: null,
  nickname: null,
  noMiddleName: false,
  personalEmail: null,
  privatePhoneNumbers: [],
  publicPhoneNumbers: [],
  prime: null,
  education: [],
  st: null,
  technologies: [],
  twitter: null,
  workStatus: 100
});
const submitting = ref(false);
const tabCreated = ref({
  awards: false,
  certifications: false,
  clearance: false,
  contracts: false,
  customerOrgExp: false,
  education: false,
  employee: false,
  jobExperience: false,
  languages: false,
  personal: false,
  technologies: false
}); // tab component created
const toggleCancelConfirmation = ref(false);
const valid = ref(false);
const validating = ref({
  awards: false,
  certifications: false,
  clearance: false,
  contracts: false,
  customerOrgExp: false,
  education: false,
  employee: false,
  jobExperience: false,
  languages: false,
  personal: false,
  technologies: false
}); // signal to child tabs to validate

// template refs
const form = ref(null);
const personalInfoFormRef = ref(null);
const technologiesFormRef = ref(null);
const languagesFormRef = ref(null);

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
    await cancel();
    editing.value = false;
  });
  emitter.on('created', (tab) => {
    tabCreated.value[tab] = true;
  });
  emitter.on('doneValidating', (params) => {
    setFormData(params.tab, params.data); // sets the form data
    validating.value[params.tab] = false;
  });
  model.value = _.cloneDeep(
    _.mergeWith(model.value, props.employee, (modelValue, employeeValue) => {
      return _.isNil(employeeValue) ? modelValue : employeeValue;
    })
  );
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

function setFormData(tab, data) {
  if (tab === 'jobExperience') {
    model.value['icTimeFrames'] = data.icTimeFrames;
    model.value['companies'] = data.companies;
  }
}

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
    submitting.value = false;
    return;
  }

  // allows other tabs to finalize data, if they're open. otherwise the data should already be finalized
  try {
    personalInfoFormRef.value?.prepareSubmit();
    technologiesFormRef.value?.prepareSubmit();
  } catch (err) {
    console.error(err);
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
  editing.value = false; // close edit modal
}

//TODO: cancel
function cancel() {}

function collapseAllTabs() {
  formTabs.value = [];
}
</script>

<style scoped>
.invalid {
  color: #b00020;
}
</style>
