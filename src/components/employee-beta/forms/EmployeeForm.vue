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
              <v-list-item
                @click="cardName = 'Personal'"
                link
                title="Personal"
                :class="{ invalid: !validTabs.personal }"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Clearances'"
                link
                title="Clearances"
                :class="{ invalid: !validTabs.clearance }"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Contracts'"
                link
                title="Contracts"
                :class="{ invalid: !validTabs.contracts }"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Certifications & Awards'"
                link
                title="Certifications & Awards"
                :class="{ invalid: !validTabs.certsAndAwards }"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Tech & Skills'"
                link
                title="Tech & Skills"
                :class="{ invalid: !validTabs.technologies }"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Languages'"
                link
                title="Foreign Languages"
                :class="{ invalid: !validTabs.languages }"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Job Experience'"
                link
                title="Job Experience"
                :class="{ invalid: !validTabs.jobExperience }"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Education'"
                link
                title="Education"
                :class="{ invalid: !validTabs.education }"
              ></v-list-item>
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
                <base-form title="Personal" value="Personal" :valid="validTabs.personal">
                  <personal-info-form
                    ref="personalInfoRef"
                    v-model="editedEmployee"
                    v-model:valid="validTabs.personal"
                  ></personal-info-form>
                </base-form>
                <base-form title="Clearances" value="Clearances" :valid="validTabs.clearance">
                  <div>
                    <clearance-form
                      ref="clearanceRef"
                      v-model="editedEmployee"
                      v-model:valid="validTabs.clearance"
                    ></clearance-form>
                  </div>
                </base-form>
                <base-form title="Contracts" value="Contracts" :valid="validTabs.contracts">
                  <div>
                    <contracts-form
                      ref="contractsRef"
                      v-model="editedEmployee"
                      v-model:valid="validTabs.contracts"
                    ></contracts-form>
                  </div>
                </base-form>
                <base-form
                  title="Certifications & Awards"
                  value="Certifications & Awards"
                  :valid="validTabs.certsAndAwards"
                >
                  <div>
                    <certs-and-awards-form
                      ref="certsAndAwardsRef"
                      v-model="editedEmployee"
                      v-model:valid="validTabs.certsAndAwards"
                    ></certs-and-awards-form>
                  </div>
                </base-form>
                <base-form title="Tech and Skills" value="Tech & Skills" :valid="validTabs.technologies">
                  <technologies-form
                    ref="technologiesRef"
                    v-model="editedEmployee"
                    v-model:valid="validTabs.technologies"
                  ></technologies-form>
                </base-form>
                <base-form title="Foreign Languages" value="Languages" :valid="validTabs.languages">
                  <languages-form
                    ref="languagesRef"
                    v-model="editedEmployee"
                    v-model:valid="validTabs.languages"
                  ></languages-form>
                </base-form>
                <base-form title="Job Experience" value="Job Experience" :valid="validTabs.jobExperience">
                  <div>
                    <job-experience-form
                      ref="jobExperienceRef"
                      v-model="editedEmployee"
                      v-model:valid="validTabs.jobExperience"
                    ></job-experience-form>
                  </div>
                </base-form>
                <base-form title="Education" value="Education" :valid="validTabs.education">
                  <div>
                    <education-form
                      ref="educationRef"
                      v-model="editedEmployee"
                      v-model:valid="validTabs.education"
                      :allowAdditions="true"
                    ></education-form>
                  </div>
                </base-form>
              </v-expansion-panels>
              <div class="sticky-actions">
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
              </div>
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
import BaseForm from '@/components/employee-beta/forms/BaseForm.vue';
import FormCancelConfirmation from '@/components/modals/FormCancelConfirmation.vue';
import { useDisplayError } from '@/components/shared/StatusSnackbar.vue';
import api from '@/shared/api';
import { isMobile } from '@/utils/utils';
import { useStore } from 'vuex';
import { cloneDeep, find, findIndex, forOwn, isEqual, map, pickBy } from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue';
import CertsAndAwardsForm from './CertsAndAwardsForm.vue';
import ClearanceForm from './ClearanceForm.vue';
import ContractsForm from './ContractsForm.vue';
import EducationForm from './EducationForm.vue';
import JobExperienceForm from './JobExperienceForm.vue';
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
const store = useStore();

const props = defineProps(['employee', 'contracts']);
const editedEmployee = ref(cloneDeep(props.employee));
const isUser = inject('isUser');

// state
const cardName = ref('');
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
  emitter.on('editing', (card) => {
    cardName.value = card;
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
    if (changes.tags) {
      submitTags(changes.tags);
      delete changes.tags; // remove when we are done, we don't want to send this in api call
    }

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
 * Updates the tags that the employee was added to and removed from.
 * If the employee is in a tag, they need to be removed.
 * If the employee is not in a tag, they need to be added.
 */
async function submitTags(editedTags) {
  let employeeId = props.employee.id;
  let promises = [];

  console.log(editedTags);

  for (let tag of editedTags) {
    // finds employee id on the given tag
    const index = findIndex(tag.employees, (empId) => empId === employeeId);

    // if desired id is found
    if (index > -1) {
      tag.employees.splice(index, 1); // remove employee from tag
    } else {
      tag.employees.push(employeeId); // add employee to tag
    }

    promises.push(api.updateItem(api.TAGS, tag));
  }

  await Promise.all(promises);

  // update store tags
  let updatedStoreTags = map(store.getters.tags, (tag) => {
    let foundTag = find(editedTags, (t) => t.id === tag.id);
    return foundTag ? foundTag : tag;
  });
  store.dispatch('setTags', { tags: updatedStoreTags });
} // submitTags

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
  let changes = pickBy(editedEmployee.value, (value, key) => {
    const oldValue = props.employee[key];
    const newValue = value;

    // if both values are empty (i.e. empty string, null, or undefined) they are treated as equal
    let changed = !isEqual(oldValue, newValue) && !(isEmpty(oldValue) && isEmpty(newValue));

    if (key === 'tags') return false; // tags are handled further down

    if (changed) {
      // TODO test
      console.log('Changed:', key);
      console.log('\tOld:', oldValue);
      console.log('\tNew:', newValue);
    }
    return changed;
  });

  const editedTags = editedEmployee.value.tags;
  if (editedTags && !isEmpty(editedTags)) changes.tags = cloneDeep(editedTags);

  return changes;
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

/**
 * Returns true only if the value is undefined, null, or an empty string
 */
function isEmpty(value) {
  return value === undefined || value === null || value === '' || value == [];
}

/**
 * Opens only cardName tab and scrolls to tab header
 */
async function selectTab() {
  let num = 0;
  let card = '';
  switch (cardName.value) {
    case 'Personal':
    case 'Personal Information':
    case 'Employee':
    case 'Other Information':
    case 'Select Info':
      num = 0;
      card = 'Personal';
      break;
    case 'Clearance':
    case 'Clearances':
      num = 1;
      card = 'Clearances';
      break;
    case 'Contracts':
    case 'All Contract Info':
      num = 2;
      card = 'Contracts';
      break;
    case 'Certifications':
    case 'Awards':
    case 'Certifications & Awards':
      num = 3;
      card = 'Certifications & Awards';
      break;
    case 'Technologies and Skills':
    case 'Tech and Skills':
    case 'Tech, Skills, & Languages':
    case 'Tech & Skills':
      num = 4;
      card = 'Tech & Skills';
      break;
    case 'Languages':
    case 'Foreign Languages':
      num = 5;
      card = 'Languages';
      break;
    case 'Job Experience':
    case 'Job Experience & Education':
      num = 6;
      card = 'Job Experience';
      break;
    case 'Education':
    case 'All Education':
      num = 7;
      card = 'Education';
      break;
    default:
      num = 0;
      card = 'Personal';
  }
  cardName.value = card;
  formTabs.value = [card];
  // wait for element to exist https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
  function waitForElm(selector) {
    return new Promise((resolve) => {
      if (document.getElementById(selector)) {
        return resolve(document.getElementById(selector));
      }

      const observer = new MutationObserver(() => {
        if (document.getElementById(selector)) {
          observer.disconnect();
          resolve(document.getElementById(selector));
        }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }
  let e = await waitForElm('employee-card');
  let tabHeight = 60;
  e?.scroll({ top: tabHeight * num, behavior: 'smooth' });
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(validTabs, () => {
  if (Object.values(validTabs).every((tab) => tab == true)) {
    valid.value = true;
  }
});

watch(cardName, () => {
  selectTab();
});
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
.sticky-actions {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
}
</style>
