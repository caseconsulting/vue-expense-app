<template>
  <v-dialog
    v-model="editing"
    persistent
    scrollable
    @click:outside="toggleCancelConfirmation = true"
    @keydown.esc="toggleCancelConfirmation = true"
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
        <v-form ref="form" v-model="valid" lazy-validation class="my-1 mx-xl-5 mx-lg-5 mx-md-0">
          <v-expansion-panels v-model="formTabs" variant="accordion" multiple>
            <base-form title="Personal" value="Personal Information">
              <personal-info-form v-model="editedEmployee"></personal-info-form>
            </base-form>
            <base-form title="Clearance" value="Clearance">
              <div>Editing: {{ formTabs }}</div>
            </base-form>
            <base-form title="Contracts" value="Contracts">
              <div>Editing: {{ formTabs }}</div>
            </base-form>
            <base-form title="Certifications + Awards" value="Certifications + Awards">
              <div>
                <certs-and-awards-tab
                  :certifications="employee.certifications"
                  :awards="employee.awards"
                  :validateCertifcations="validating.certifications"
                  :validateAwards="validating.awards"
                ></certs-and-awards-tab>
              </div>
            </base-form>
            <base-form title="Tech, Skills, and Languages" value="Tech, Skills, and Languages">
              <v-row style="overflow-x: auto">
                <v-col style="min-width: 380px">
                  <technologies-form v-model="editedEmployee"></technologies-form>
                </v-col>
                <v-divider vertical inset></v-divider>
                <v-col style="min-width: 380px">
                  <languages-form v-model="editedEmployee"></languages-form>
                </v-col>
              </v-row>
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
            <!-- Form action buttons -->
            <v-btn id="employeeCancelBtn" variant="text" class="ma-2" @click="toggleCancelConfirmation = true"
              >Cancel</v-btn
            >
            <v-btn id="employeeSubmitBtn" variant="outlined" class="ma-2" color="success" @click="submit()">
              <v-icon class="mr-1">mdi-content-save</v-icon>Submit
            </v-btn>
            <!-- End form action buttons -->
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
import { cloneDeep } from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import LanguagesForm from './LanguagesForm.vue';
import TechnologiesForm from './TechnologiesForm.vue';
import PersonalInfoForm from './PersonalInfoForm.vue';
import JobExperienceTab from '../form-tabs/JobExperienceTab.vue';
import EducationTab from '../form-tabs/EducationTab.vue';
import CertsAndAwardsTab from '../form-tabs/CertsAndAwardsTab.vue';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');

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

//TODO: submit
function submit() {}

//TODO: cancel
function cancel() {}

function collapseAllTabs() {
  formTabs.value = [];
}
</script>
