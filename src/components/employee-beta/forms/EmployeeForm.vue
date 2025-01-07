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
          <v-col class="d-inline" v-if="!isMobile() && !creatingEmployee">
            <h3 class="text-white px-2">Editing {{ isUser ? 'My Profile' : fullName }}</h3>
          </v-col>
          <v-col class="d-inline" v-else-if="creatingEmployee">
            <h3 class="text-white px-2">Create new Employee</h3>
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
          <v-col v-if="mdAndUp" cols="auto" class="pr-0">
            <v-list density="compact" nav id="edit-navigation" class="pr-0">
              <v-list-item
                @click="cardName = 'Personal'"
                link
                title="Personal"
                :class="{ invalid: validTabs.personal === false }"
                :border="cardName == 'Personal' ? (validTabs.personal === false ? 'error md' : 'md') : '0'"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Clearances'"
                link
                title="Clearances"
                :class="{ invalid: validTabs.clearance === false }"
                :border="cardName == 'Clearances' ? (validTabs.clearance === false ? 'error md' : 'md') : '0'"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Contracts'"
                link
                title="Contracts"
                :class="{ invalid: validTabs.contracts === false }"
                :border="cardName == 'Contracts' ? (validTabs.contracts === false ? 'error md' : 'md') : '0'"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Certifications & Awards'"
                link
                title="Certifications & Awards"
                :class="{ invalid: validTabs.certsAndAwards === false }"
                :border="
                  cardName == 'Certifications & Awards' ? (validTabs.certsAndAwards === false ? 'error md' : 'md') : '0'
                "
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Tech & Skills'"
                link
                title="Tech & Skills"
                :class="{ invalid: validTabs.technologies === false }"
                :border="cardName == 'Tech & Skills' ? (validTabs.technologies === false ? 'error md' : 'md') : '0'"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Languages'"
                link
                title="Foreign Languages"
                :class="{ invalid: validTabs.languages === false }"
                :border="cardName == 'Languages' ? (validTabs.languages === false ? 'error md' : 'md') : '0'"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Job Experience'"
                link
                title="Job Experience"
                :class="{ invalid: validTabs.jobExperience === false }"
                :border="cardName == 'Job Experience' ? (validTabs.jobExperience === false ? 'error md' : 'md') : '0'"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Education'"
                link
                title="Education"
                :class="{ invalid: validTabs.education === false }"
                :border="cardName == 'Education' ? (validTabs.education === false ? 'error md' : 'md') : '0'"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Customer Orgs'"
                link
                title="Customer Orgs"
                :class="{ invalid: !validTabs.customerOrgs }"
                :border="cardName == 'Customer Orgs' ? (validTabs.customerOrgs === false ? 'error md' : 'md') : '0'"
              ></v-list-item>
              <v-list-item
                @click="cardName = 'Emergency Contacts'"
                link
                title="Emergency Contacts"
                :class="{ invalid: !validTabs.emergencyContacts }"
              ></v-list-item>
            </v-list>
          </v-col>
          <v-col>
            <v-form
              ref="form"
              validate-on="lazy"
              :disabled="submitting"
              class="my-1 mx-xl-5 mx-lg-5 mx-md-0"
              @submit.prevent="submit()"
            >
              <v-expansion-panels v-model="formTabs" variant="accordion" multiple>
                <!-- personal tab -->
                <base-form
                  title="Personal"
                  tab-id="personal"
                  v-model="editedEmployee"
                  :valid="validTabs.personal"
                  @click="cardName = 'Personal'"
                >
                  <template v-slot="{ props }">
                    <personal-info-form :slot-props="props"></personal-info-form>
                  </template>
                </base-form>

                <!-- clearances tab -->
                <base-form
                  title="Clearances"
                  tab-id="clearances"
                  v-model="editedEmployee"
                  :valid="validTabs.clearances"
                  @click="cardName = 'Clearances'"
                >
                  <template v-slot="{ props }">
                    <clearance-form :slot-props="props"></clearance-form>
                  </template>
                </base-form>

                <!-- contracts tab -->
                <base-form
                  title="Contracts"
                  tab-id="contracts"
                  v-model="editedEmployee"
                  :valid="validTabs.contracts"
                  @click="cardName = 'Contracts'"
                >
                  <template v-slot="{ props }">
                    <contracts-form :slot-props="props"></contracts-form>
                  </template>
                </base-form>

                <!-- certifications and awards tab -->
                <base-form
                  title="Certifications & Awards"
                  tab-id="certsAndAwards"
                  v-model="editedEmployee"
                  :valid="validTabs.certsAndAwards"
                  @click="cardName = 'Certifications & Awards'"
                >
                  <template v-slot="{ props }">
                    <certs-and-awards-form :slot-props="props"></certs-and-awards-form>
                  </template>
                </base-form>

                <!-- tech and skills tab -->
                <base-form
                  title="Tech & Skills"
                  tab-id="technologies"
                  v-model="editedEmployee"
                  :valid="validTabs.technologies"
                  @click="cardName = 'Tech & Skills'"
                >
                  <template v-slot="{ props }">
                    <technologies-form :slot-props="props"></technologies-form>
                  </template>
                </base-form>

                <!-- languages tab -->
                <base-form
                  title="Foreign Languages"
                  tab-id="languages"
                  v-model="editedEmployee"
                  :valid="validTabs.education"
                  @click="cardName = 'Languages'"
                >
                  <template v-slot="{ props }">
                    <languages-form :slot-props="props"></languages-form>
                  </template>
                </base-form>
                <base-form
                  title="Job Experience"
                  tab-id="jobExperience"
                  v-model="editedEmployee"
                  :valid="validTabs.jobExperience"
                  @click="cardName = 'Job Experience'"
                >
                  <template v-slot="{ props }">
                    <job-experience-form :slot-props="props"></job-experience-form>
                  </template>
                </base-form>
                <base-form
                  title="Education"
                  tab-id="education"
                  v-model="editedEmployee"
                  :valid="validTabs.education"
                  @click="cardName = 'Education'"
                >
                  <template v-slot="{ props }">
                    <education-form :slot-props="props"></education-form>
                  </template>
                </base-form>
                <base-form
                  title="Customer Orgs"
                  tab-id="customerOrgs"
                  v-model="editedEmployee"
                  :valid="validTabs.customerOrgs"
                  @click="cardName = 'Customer Orgss'"
                >
                  <template v-slot="{ props }">
                    <customer-orgs-form :slot-props="props"></customer-orgs-form>
                  </template>
                </base-form>
                <base-form
                  title="Emergency Contacts"
                  tab-id="emergencyContacts"
                  v-model="editedEmployee"
                  :valid="validTabs.emergencyContacts"
                >
                  <template v-slot="{ props }">
                    <emergency-contacts-form :slot-props="props"></emergency-contacts-form>
                  </template>
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
                      <div :class="{ shake: invalidButton }">
                        <v-btn
                          id="employeeSubmitBtn"
                          variant="outlined"
                          class="ma-2"
                          :color="invalidButton ? 'error' : 'success'"
                          type="submit"
                        >
                          <v-icon class="mr-1">mdi-content-save</v-icon>Submit
                        </v-btn>
                      </div>
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
        <!-- <v-card-text v-if="numberOfChanges > 0" align="center">There are pending changes!</v-card-text> -->
      </form-cancel-confirmation>
    </v-card>
  </v-dialog>
</template>

<script setup>
import BaseForm from '@/components/employee-beta/forms/BaseForm.vue';
import FormCancelConfirmation from '@/components/modals/FormCancelConfirmation.vue';
import { useDisplayError } from '@/components/shared/StatusSnackbar.vue';
import api from '@/shared/api';
import { generateUUID, isMobile } from '@/utils/utils';
import _cloneDeep from 'lodash/cloneDeep';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import _forOwn from 'lodash/forOwn';
import _isEqual from 'lodash/isEqual';
import _map from 'lodash/map';
import _pickBy from 'lodash/pickBy';
import { computed, inject, onBeforeMount, onBeforeUnmount, provide, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useStore } from 'vuex';
import CertsAndAwardsForm from './CertsAndAwardsForm.vue';
import ClearanceForm from './ClearanceForm.vue';
import ContractsForm from './ContractsForm.vue';
import CustomerOrgsForm from './CustomerOrgsForm.vue';
import EducationForm from './EducationForm.vue';
import JobExperienceForm from './JobExperienceForm.vue';
import LanguagesForm from './LanguagesForm.vue';
import PersonalInfoForm from './PersonalInfoForm.vue';
import TechnologiesForm from './TechnologiesForm.vue';
import EmergencyContactsForm from './EmergencyContactsForm.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

/** @type {import('mitt').Emitter} */
const emitter = inject('emitter');
const store = useStore();
const { mdAndUp } = useDisplay();

const router = useRouter();
const props = defineProps(['employee']);
const editedEmployee = ref(_cloneDeep(props.employee));
const isUser = inject('isUser');

// state
const cardName = ref('');
const creatingEmployee = ref(false);
provide('creatingEmployee', creatingEmployee);
const editing = defineModel();
const formTabs = ref([]);
const submitting = ref(false);
const toggleCancelConfirmation = ref(false);
const valid = ref(true);
const invalidButton = ref(false);
const numberOfChanges = ref(0);

const validTabs = reactive({
  certsAndAwards: true,
  clearances: true,
  contracts: true,
  customerOrgs: true,
  education: true,
  jobExperience: true,
  languages: true,
  personal: true,
  technologies: true,
  emergencyContacts: true
});

// template refs
const form = ref(null);

// tabs can emit an object when they are opened, and that object will be stored here. this is used to pass data and
// methods to this file, like `prepareSubmit()`
const tabs = reactive({
  certsAndAwards: null,
  clearances: null,
  contracts: null,
  customerOrgs: null,
  education: null,
  jobExperience: null,
  languages: null,
  personal: null,
  technologies: null,
  emergencyContacts: null
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  emitter.on('editing', (card) => {
    cardName.value = card;
    submitting.value = false;
    editing.value = true;
  });

  emitter.on('edit-tab-opened', (event) => {
    tabs[event.name] = event.value;
  });

  emitter.on('edit-tab-closed', (event) => {
    tabs[event.name] = null;
  });

  // Starts listener to see if the user cancelled to submit the form
  emitter.on('canceled-cancel', () => {
    toggleCancelConfirmation.value = false;
  });

  emitter.on('confirmed-cancel', () => {
    // signals to tabs to NOT prepare, and provides them with the unedited employee object
    // this is to fix a bug where tabs would prepare after the edit modal closed, causing editedEmployee
    // to be overwritten with the edited data, even though we want to discard all edits
    emitter.emit('discard-edits', props.employee);

    // reset editedEmployee and validation
    editedEmployee.value = _cloneDeep(props.employee);
    Object.keys(validTabs).forEach((key) => (validTabs[key] = true));

    // close modals
    toggleCancelConfirmation.value = false;
    editing.value = false;
  });

  emitter.on('validating', (event) => {
    validTabs[event.tab] = event.valid;
  });

  emitter.on('create-new-employee', () => {
    creatingEmployee.value = true;
    emitter.emit('editing', 'Personal'); // opens the personal tab when creating a new employee
  });
});

onBeforeUnmount(() => {
  emitter.off('editing');
  emitter.off('edit-tab-opened');
  emitter.off('edit-tab-closed');
  emitter.off('canceled-cancel');
  emitter.off('confirmed-cancel');
  emitter.off('validating');
  emitter.off('create-new-employee');
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

  //if updating a current employee
  if (!creatingEmployee.value) {
    // scans for all changed attributes
    const changes = getChanges();

    // if there are any changes
    if (!isEmpty(Object.keys(changes))) {
      if (changes.tags) {
        await submitTags(changes.tags);
        delete changes.tags; // remove when we are done, we don't want to send this in api call
      }

      const updated = await api.updateAttributes(api.EMPLOYEES, props.employee.id, changes);

      // if a valid employee is returned
      if (updated.id) {
        // getEmployees and update store with latest data
        if (editedEmployee.value.id === store.getters.user.id) store.dispatch('setUser', { user: updated });
        let employees = store.getters.employees;
        let employeeIdx = _findIndex(employees, (e) => e.id === updated.id);
        employees[employeeIdx] = updated;
        store.dispatch('setEmployees', { employees });
        emitter.emit('update', updated);
      } else {
        emitter.emit('discard-edits', props.employee);
        useDisplayError(updated.response.data.message || updated.response.data.Error.message);
      }
    }
  } else {
    //creating a new employee
    editedEmployee.value.id = generateUUID();
    let newEmployee = await api.createItem(api.EMPLOYEES, editedEmployee.value);
    // update the store with the latest data
    let employees = store.getters.employees;
    employees.push(editedEmployee.value);
    store.dispatch('setEmployees', { employees });
    //reroute to the newly created employee
    if (newEmployee.id) {
      router.push(`/employee/${newEmployee.employeeNumber}`);
    } else {
      // shows an error message with why the employee creation was failed
      emitter.emit('error', newEmployee.response.data.message);
      useDisplayError(newEmployee.response.data.message);
      editedEmployee.value.id = null; // reset id
    }
  }
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

  for (let tag of editedTags) {
    // finds employee id on the given tag
    const index = _findIndex(tag.employees, (empId) => empId === employeeId);

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
  let updatedStoreTags = _map(store.getters.tags, (tag) => {
    let foundTag = _find(editedTags, (t) => t.id === tag.id);
    return foundTag ? foundTag : tag;
  });
  store.dispatch('setTags', { tags: updatedStoreTags });
} // submitTags

/**
 * Validates each currently open tab and prepares/reformats data if applicable. Closed tabs should be
 * validated/prepared before unmounting.
 */
async function prepareTabs() {
  await Promise.allSettled([
    tabs.certsAndAwards?.prepareSubmit(),
    tabs.clearances?.prepareSubmit(),
    tabs.contracts?.prepareSubmit(),
    tabs.customerOrgs?.prepareSubmit(),
    tabs.education?.prepareSubmit(),
    tabs.jobExperience?.prepareSubmit(),
    tabs.languages?.prepareSubmit(),
    tabs.personal?.prepareSubmit(),
    tabs.technologies?.prepareSubmit(),
    tabs.emergencyContacts?.prepareSubmit()
  ]);
}

/**
 * Checks validation of all tabs
 */
async function validate() {
  await prepareTabs();

  let valid = true;

  // iterates through each tab to make sure they are all valid
  _forOwn(validTabs, (value) => {
    valid = valid && value;
  });
  return valid;
}

/**
 * Gets an object containing only the fields that were edited by the user
 */
function getChanges() {
  let changes = _pickBy(editedEmployee.value, (value, key) => {
    const oldValue = props.employee[key];
    const newValue = value;

    if (key === 'tags') return false; // tags are handled after the pickBy

    // if both values are empty (i.e. empty string, null, or undefined) they are treated as equal
    return !_isEqual(oldValue, newValue) && !(isEmpty(oldValue) && isEmpty(newValue));
  });

  const editedTags = editedEmployee.value.tags;
  if (editedTags && !isEmpty(editedTags)) changes.tags = _cloneDeep(editedTags);

  return changes;
}

/**
 * Called if the form is invalid after trying to submit
 */
function cancelSubmit() {
  valid.value = false;
  invalidButton.value = true;
  setTimeout(() => {
    invalidButton.value = false;
  }, 820);
  submitting.value = false;
}

/**
 * Brings up the cancel confirmation modal
 */
async function cancel() {
  await prepareTabs(); // need to prepare tabs to get the changes
  const changes = getChanges();
  numberOfChanges.value = Object.keys(changes).length;
  toggleCancelConfirmation.value = true;
}

function collapseAllTabs() {
  formTabs.value = [];
}

/**
 * Returns true only if the value is undefined, null, an empty string, or an empty array
 */
function isEmpty(value) {
  return value === undefined || value === null || value === '' || value?.length === 0;
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
    case 'Current Contract Info':
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
      card = 'Foreign Languages';
      break;
    case 'Job Experience':
    case 'Job Experience & Education':
    case 'Past Job Experience':
      num = 6;
      card = 'Job Experience';
      break;
    case 'Education':
    case 'All Education':
      num = 7;
      card = 'Education';
      break;
    case 'Customer Orgs':
    case 'Customer Org Experience':
    case 'Customer Org Exp':
      num = 8;
      card = 'Customer Orgs';
      break;
    case 'Emergency Contacts':
      num = 9;
      card = 'Emergency Contacts';
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
  e?.scrollTo({ top: tabHeight * num, behavior: 'smooth' });
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(validTabs, () => {
  if (Object.values(validTabs).every((tab) => tab === true)) {
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

.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}
@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
