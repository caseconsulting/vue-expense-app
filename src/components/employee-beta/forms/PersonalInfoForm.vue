<template>
  <div>
    <v-row :class="isMobile() ? 'mt-3' : ''"><h3>Basic Information</h3></v-row>
    <v-row class="groove">
      <!-- first name -->
      <v-col>
        <v-text-field
          v-model="editedEmployee.firstName"
          label="First Name *"
          :rules="getRequiredRules()"
        ></v-text-field>
      </v-col>
      <!-- middle name -->
      <v-col>
        <v-text-field
          v-model.trim="editedEmployee.middleName"
          :label="editedEmployee.noMiddleName ? 'No Middle Name' : 'Middle Name *'"
          :rules="editedEmployee.noMiddleName ? [() => true] : getRequiredRules()"
          :hide-details="editedEmployee.noMiddleName ? true : 'auto'"
          @update:model-value="if (!_isEmpty(editedEmployee.middleName)) editedEmployee.noMiddleName = false;"
        >
          <template #append-inner>
            <v-btn
              v-if="!editedEmployee.noMiddleName"
              @click="editedEmployee.noMiddleName = true"
              variant="text"
              icon=""
            >
              <v-tooltip text="Please disable if you do not have a middle name" location="top" activator="parent">
              </v-tooltip>
              <v-icon>mdi-check-circle</v-icon>
            </v-btn>
            <v-btn v-else @click="editedEmployee.noMiddleName = false" variant="text" icon="">
              <v-tooltip text="Please enable if you have a middle name" location="top" activator="parent"> </v-tooltip>
              <v-icon>mdi-close-circle</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
      <!-- last name -->
      <v-col>
        <v-text-field v-model="editedEmployee.lastName" label="Last Name *" :rules="getRequiredRules()"></v-text-field>
      </v-col>
      <!-- nickname -->
      <v-col>
        <v-text-field v-model="editedEmployee.nickname" label="Nickname"></v-text-field>
      </v-col>
    </v-row>
    <!-- CASE information -->
    <v-row class="mt-7"><h3>CASE Information</h3></v-row>
    <v-row class="groove">
      <v-col>
        <v-row>
          <!-- case email -->
          <v-col v-if="userIsAdminOrManager">
            <v-text-field
              v-model="emailUsername"
              label="CASE Email *"
              @update:model-value="emailValue()"
              :hint="CASE_EMAIL_DOMAIN"
              persistent-hint
              :rules="getCaseEmailRules()"
            ></v-text-field>
          </v-col>
          <!-- employee number / employee id -->
          <v-col v-if="userIsAdminOrManager">
            <v-text-field
              v-model="editedEmployee.employeeNumber"
              label="Employee Number *"
              :rules="employeeNumberRules"
            ></v-text-field>
          </v-col>
          <!-- hire date -->
          <v-col v-if="creatingEmployee">
            <!-- note that only admins can create an employee, so this is essentially only visible to admins -->
            <v-text-field
              id="employeeHireDateField"
              v-model="hireDateFormatted"
              :rules="getDateRules()"
              v-mask="'##/##/####'"
              prepend-inner-icon="mdi-calendar"
              label="Hire Date *"
              hint="MM/DD/YYYY format"
              persistent-hint
              @update:focused="editedEmployee.hireDate = format(hireDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
              @click:prepend="hireMenu = true"
              @keypress="hireMenu = false"
              autocomplete="off"
            >
              <v-menu activator="parent" location="start center" :close-on-content-click="false" v-model="hireMenu">
                <v-date-picker
                  v-model="editedEmployee.hireDate"
                  @update:model-value="hireMenu = false"
                  :max="editedEmployee.deptDate"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Hire Date"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
          </v-col>
          <!-- job role -->
          <v-col>
            <v-combobox v-model="editedEmployee.jobRole" label="Job Role" :items="JOB_TITLES"></v-combobox>
          </v-col>
        </v-row>
        <v-row>
          <!-- ain / agency identification number -->
          <v-col>
            <v-text-field
              v-model="editedEmployee.agencyIdentificationNumber"
              label=" Identification Number"
              :rules="getAINRules()"
              v-mask="'#######'"
            ></v-text-field>
          </v-col>
          <!-- employee role -->
          <v-col v-if="userIsAdminOrManager">
            <v-combobox
              v-model="employeeRole"
              label="Employee Role *"
              :items="EMPLOYEE_ROLES"
              :rules="getRequiredRules()"
            ></v-combobox>
          </v-col>
          <!-- tags -->
          <v-col v-if="userIsAdminOrManager">
            <v-autocomplete
              v-model="editedTags"
              label="Tags"
              :items="store.getters.tags"
              item-title="tagName"
              return-object
              multiple
              chips
              closeable-chips
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row v-if="userIsAdminOrManager">
          <v-col cols="4">
            <v-text-field
              v-model="editedEmployee.unanetPersonKey"
              label="Unanet Person Key"
              :rules="getUnanetPersonKeyRules()"
              maxLength="15"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <DatePicker
              variant="filled"
              v-model="editedEmployee.hireDate"
              label="Start Date"
            />
          </v-col>
          <v-col cols="4">
            <DatePicker
              variant="filled"
              mode="month"
              v-model="editedEmployee.internshipDate"
              label="Internship Start Date"
              returnFormat="YYYY-MM"
              displayFormat="MM/YYYY"
            />
          </v-col>
        </v-row>
        <v-row v-if="userIsAdminOrManager">
          <!-- work status / full time / part time / inactive -->
          <v-col>
            <v-radio-group v-model="workStatus" label="Work Status *" :inline="!isMobile()">
              <v-radio value="Full Time" label="Full Time"></v-radio>
              <v-radio value="Part Time" label="Part Time"></v-radio>
              <v-radio value="Inactive" label="Inactive"></v-radio>
              <v-text-field
                v-if="workStatus === 'Part Time'"
                v-model="partTimeNumber"
                :rules="getWorkStatusRules()"
                suffix="%"
                v-mask="'##'"
                hide-details="auto"
                class="work-status-box ma-4"
              ></v-text-field>
            </v-radio-group>
            <v-text-field
              v-if="workStatus === 'Inactive'"
              class="d-block"
              v-model="deptDateFormatted"
              :rules="getDateRules()"
              v-mask="'##/##/####'"
              prepend-inner-icon="mdi-calendar"
              label="Departure Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              @update:focused="editedEmployee.deptDate = format(deptDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
              @click:prepend="deptMenu = true"
              @keypress="deptMenu = false"
              autocomplete="off"
            >
              <v-menu activator="parent" location="start center" :close-on-content-click="false" v-model="deptMenu">
                <v-date-picker
                  v-model="editedEmployee.deptDate"
                  @update:model-value="deptMenu = false"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Departure Date"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <!-- current address -->
    <v-row :class="isMobile() ? 'mt-7' : ''"><h3>Current Address</h3></v-row>
    <v-row class="groove">
      <v-col>
        <!-- private icon and search bar -->
        <v-row align="center">
          <v-col class="pb-0 d-flex">
            <div class="mt-4 mb-9 ml-3 mr-7 d-inline">
              <v-icon color="black">mdi-shield</v-icon>
              <v-tooltip activator="parent" location="top" text="Address is always hidden from other users"></v-tooltip>
            </div>
            <v-autocomplete
              class="d-inline"
              prepend-inner-icon="mdi-magnify"
              label="Search Locations"
              :items="Object.keys(placeIds)"
              no-data-text="Start searching..."
              @update:search="updateAddressDropDown($event)"
              clear-on-select
              ref="addressSearch"
            >
              <template #item="{ item, props }">
                <v-list-item @click="autofillLocation(item, props)">{{ item.value }}</v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <!-- actual address fields -->
        <v-row>
          <v-col :cols="!isMobile() ? '6' : '12'">
            <v-text-field
              v-model.trim="editedEmployee.currentStreet"
              label="Street 1"
              data-vv-name="Street 1"
            ></v-text-field>
          </v-col>
          <v-col :cols="!isMobile() ? '6' : '12'">
            <v-text-field
              v-model.trim="editedEmployee.currentStreet2"
              label="Street 2"
              data-vv-name="Street 2"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field v-model.trim="editedEmployee.currentCity" label="City"></v-text-field>
          </v-col>
          <v-col>
            <v-autocomplete
              v-model="editedEmployee.currentState"
              :items="Object.values(STATES)"
              item-title="text"
              label="State"
            ></v-autocomplete>
          </v-col>
          <v-col>
            <v-text-field
              v-model.trim="editedEmployee.currentZIP"
              label="ZIP"
              data-vv-name="Current ZIP"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="mt-7"><h3>Personal Information</h3></v-row>
    <v-row>
      <v-col>
        <v-row class="groove">
          <!-- birthday -->
          <v-col :cols="!isMobile() ? '4' : '12'">
            <v-text-field
              ref="formFields"
              v-mask="'##/##/####'"
              v-model="birthdayFormat"
              :rules="[getBirthdayRules()]"
              label="Birthday"
              hint="MM/DD/YYYY format"
              prepend-inner-icon="mdi-calendar"
              clearable
              persistent-hint
              @update:focused="editedEmployee.birthday = format(birthdayFormat, null, 'YYYY-MM-DD')"
              @click:prepend="birthdayMenu = true"
              @keypress="birthdayMenu = false"
              autocomplete="off"
            >
              <v-menu activator="parent" :close-on-content-click="false" v-model="birthdayMenu" location="start center">
                <v-date-picker
                  v-model="editedEmployee.birthday"
                  @update:model-value="birthdayMenu = false"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Birthday"
                >
                </v-date-picker>
              </v-menu>
              <template #append-inner>
                <private-button v-model="birthdayHidden"></private-button>
              </template>
            </v-text-field>
          </v-col>
          <!-- personal email -->
          <v-col>
            <v-text-field
              v-model="editedEmployee.personalEmail"
              label="Personal Email"
              :rules="getEmailRules()"
              :style="!isMobile() ? 'min-width: 350px' : ''"
            >
              <template #prepend-inner><v-icon>mdi-email</v-icon></template>
              <template #append-inner>
                <private-button v-model="editedEmployee.personalEmailHidden"></private-button>
              </template>
            </v-text-field>
          </v-col>
          <!-- github -->
          <v-col>
            <v-text-field v-model="editedEmployee.github" label="Github Username">
              <template #prepend-inner><v-icon>$github</v-icon></template>
            </v-text-field>
          </v-col>
          <!-- twitter / X -->
          <v-col>
            <v-text-field v-model="editedEmployee.twitter" label="X Username">
              <template #prepend-inner><v-icon size="16">$twitter</v-icon></template>
            </v-text-field>
          </v-col>
          <!-- linkedin -->
          <v-col>
            <v-text-field v-model="editedEmployee.linkedIn" label="LinkedIn Profile URL" :rules="getURLRules()">
              <template #prepend-inner><v-icon>$linkedin</v-icon></template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>

      <!-- place of birth -->
      <v-col class="pt-0 mt-7" cols="12">
        <v-row><h3>Place of Birth</h3></v-row>
        <v-row class="groove">
          <v-col>
            <v-row align="center">
              <v-col class="d-flex pb-0">
                <div class="mt-4 mb-9 ml-3 mr-7 d-inline">
                  <v-icon color="black">mdi-shield</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    text="Place of birth is always hidden from other users"
                  ></v-tooltip>
                </div>
                <v-autocomplete
                  prepend-inner-icon="mdi-magnify"
                  label="City Locations"
                  @update:search="updateCityDropDown($event)"
                  :items="Object.keys(predictions)"
                  no-data-text="Start searching..."
                  persitent-hint="Search city and select option to auto-fill fields below."
                  persistent-hint
                  ref="birthPlaceSearch"
                >
                  <template #item="{ item, props }">
                    <v-list-item @click="updateCityBoxes(item, props)">{{ item.value }}</v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <!-- country of birth -->
              <v-col>
                <v-autocomplete
                  v-model="editedEmployee.country"
                  label="Country"
                  :items="COUNTRIES"
                  hide-details="auto"
                ></v-autocomplete>
              </v-col>
              <v-col :class="isMobile() ? 'mb-4' : ''">
                <v-autocomplete
                  v-model="editedEmployee.st"
                  label="State"
                  :items="Object.values(STATES)"
                  hide-details="auto"
                  :disabled="editedEmployee.country !== 'United States'"
                ></v-autocomplete>
              </v-col>
              <v-col :cols="!isMobile() ? '4' : '12'">
                <v-text-field v-model.trim="editedEmployee.city" label="City" data-vv-name="City"></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <!-- phone numbers -->
    <v-row class="mt-7"><h3>Phone Numbers</h3></v-row>
    <v-row class="mb-4 groove d-flex justify-center">
      <!-- phone numbers desktop -->
      <v-col cols="12" v-if="!isMobile()">
        <v-row v-for="(phoneNumber, index) in phoneNumbers" :key="phoneNumber + index">
          <v-col cols="2">
            <v-autocomplete
              v-model="phoneNumber.type"
              label="Type"
              :items="PHONE_TYPES"
              :rules="getPhoneNumberTypeRules()"
              :autofocus="phoneAutofocus"
            ></v-autocomplete>
          </v-col>
          <v-col class="flex-grow">
            <v-text-field
              v-model.trim="phoneNumber.number"
              label="Phone Number"
              v-mask="'###-###-####, ext. ######'"
              :rules="getPhoneNumberRules()"
              data-vv-name="Phone Number"
            >
              <template #append>
                <v-col class="d-flex align-center" cols="auto" style="max-height: 56px">
                  <private-button v-model="phoneNumber.private"></private-button>
                </v-col>
                <v-col class="d-flex align-center" cols="auto" style="max-height: 56px">
                  <v-tooltip text="Delete Number" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deletePhoneNumber(index)"></v-btn>
                    </template>
                  </v-tooltip>
                </v-col>
              </template>
            </v-text-field>
          </v-col>
          <v-col v-if="phoneNumber.type === 'Cell'" cols="2">
            <v-checkbox
              :model-value="!phoneNumber.smsOptedOut"
              @update:model-value="phoneNumber.smsOptedOut = !phoneNumber.smsOptedOut"
              label="Opt-in"
            >
              <v-tooltip activator="parent" location="top">
                <div>
                  I consent to receive up to two monthly text message reminders for payroll time sheets on the last work
                  day of the pay period
                </div>
                <div>Text 'HELP' for support</div>
                <div>To opt-out, uncheck the box or text 'STOP'</div>
                <div>Message and data rates may apply</div>
                <div>NOTE: Opted-out phone numbers can be opted-in only once in 30 days</div>
              </v-tooltip>
            </v-checkbox>
          </v-col>
        </v-row>
      </v-col>
      <!-- phone numbers mobile -->
      <v-col v-else>
        <v-row v-for="(phoneNumber, index) in phoneNumbers" :key="phoneNumber + index">
          <v-col cols="12">
            <v-autocomplete
              v-model="phoneNumber.type"
              label="Type"
              :items="PHONE_TYPES"
              :rules="getPhoneNumberTypeRules()"
              :autofocus="phoneAutofocus"
            >
              <template #append>
                <v-col class="d-flex align-center" cols="auto" style="max-height: 56px">
                  <private-button v-model="phoneNumber.private"></private-button>
                </v-col>
                <v-col class="d-flex align-center" cols="auto" style="max-height: 56px">
                  <v-tooltip text="Delete Number" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deletePhoneNumber(index)"></v-btn>
                    </template>
                  </v-tooltip>
                </v-col>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col v-if="phoneNumber.type === 'Cell'" cols="auto">
            <v-checkbox
              :model-value="!phoneNumber.smsOptedOut"
              @update:model-value="phoneNumber.smsOptedOut = !phoneNumber.smsOptedOut"
              label="Opt-in"
            >
              <v-tooltip activator="parent" location="top">
                <div>
                  I consent to receive up to two monthly text message reminders for payroll time sheets on the last work
                  day of the pay period
                </div>
                <div>Text 'HELP' for support</div>
                <div>To opt-out, uncheck the box or text 'STOP'</div>
                <div>Message and data rates may apply</div>
                <div>NOTE: Opted-out phone numbers can be opted-in only once in 30 days</div>
              </v-tooltip>
            </v-checkbox>
          </v-col>
          <v-col class="flex-grow">
            <v-text-field
              v-model.trim="phoneNumber.number"
              label="Phone Number"
              v-mask="'###-###-####, ext. ######'"
              :rules="getPhoneNumberRules()"
              data-vv-name="Phone Number"
            >
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addPhoneNumber()">Add Number</v-btn>
      </v-col>
    </v-row>
    <v-row><h3>Edit EEO Information</h3></v-row>
    <v-row class="groove">
      <v-col align="center">
        <v-btn @click="toggleEdit()">Click to Edit EEO Form</v-btn>
        <e-e-o-compliance-edit-modal v-model="toggleForm" :model="editedEmployee"></e-e-o-compliance-edit-modal>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import DatePicker from '@/components/shared/DatePicker.vue';
import { JOB_TITLES } from '@/components/employees/form-tabs/dropdown-info/jobTitles';
import PrivateButton from '@/components/shared/edit-fields/PrivateButton.vue';
import { usePrepareSubmit } from '@/composables/editTabCommunication';
import api from '@/shared/api';
import { format, isSame } from '@/shared/dateUtils';
import { CASE_EMAIL_DOMAIN, EMPLOYEE_ROLES, PHONE_TYPES } from '@/shared/employeeUtils';
import {
  getAINRules,
  getBirthdayRules,
  getCaseEmailRules,
  getDateRules,
  getEmailRules,
  getNumberRules,
  getPhoneNumberRules,
  getPhoneNumberTypeRules,
  getRequiredRules,
  getURLRules,
  getWorkStatusRules,
  getUnanetPersonKeyRules
} from '@/shared/validationUtils';
import { COUNTRIES, isMobile, STATES } from '@/utils/utils';
import _cloneDeep from 'lodash/cloneDeep';
import _filter from 'lodash/filter';
import _forEach from 'lodash/forEach';
import _includes from 'lodash/includes';
import _isEmpty from 'lodash/isEmpty';
import _lowerCase from 'lodash/lowerCase';
import _some from 'lodash/some';
import _startCase from 'lodash/startCase';
import _uniqBy from 'lodash/uniqBy';
import _xorBy from 'lodash/xorBy';
import { computed, inject, onBeforeMount, onBeforeUnmount, readonly, ref, watch, useTemplateRef } from 'vue';
import { mask } from 'vue-the-mask';
import { useStore } from 'vuex';
import { DEFAULT_ISOFORMAT } from '../../../shared/dateUtils';
import EEOComplianceEditModal from '../modals/EEOComplianceEditModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const emitter = inject('emitter');
const vMask = mask; // import v mask directive

// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);
// for some reason the DB doesn't save work status if it's zero, so fill it in if it should be 0
if (!editedEmployee.value.workStatus && editedEmployee.value.deptDate) editedEmployee.value.workStatus = 0;
// make it so the v-auto-complete labels fill the text box when it's empty
if (_isEmpty(editedEmployee.value.country)) editedEmployee.value.country = null;
if (_isEmpty(editedEmployee.value.st)) editedEmployee.value.st = null;
if (_isEmpty(editedEmployee.value.currentState)) editedEmployee.value.currentState = null;

const creatingEmployee = inject('creatingEmployee');
const employeeId = editedEmployee.value.id;
const uneditedTags = readonly(getEmployeeTags());
const editedTags = ref(_cloneDeep(getEmployeeTags()));
const uneditedHireDate = editedEmployee.value.hireDate;
const uneditedDeptDate = editedEmployee.value.deptDate;

// reformatted data for use in form
const emailUsername = ref(
  editedEmployee.value.email ? editedEmployee.value.email.slice(0, editedEmployee.value.email.indexOf('@')) : ''
);
const employeeRole = ref(_startCase(editedEmployee.value.employeeRole));
const partTimeNumber = ref(
  editedEmployee.value.workStatus === 100 || editedEmployee.value.workStatus === 0
    ? 50
    : editedEmployee.value.workStatus
);
const phoneNumbers = ref(initPhoneNumbers());

// other refs
const addressSearch = useTemplateRef('addressSearch'); // current address search input
const birthdayHidden = ref(!editedEmployee.value.birthdayFeed);
const birthdayFormat = ref(format(editedEmployee.value.birthday, null, 'MM/DD/YYYY')); // formatted birthday
const birthdayMenu = ref(false); // shows the birthday menu
const birthPlaceSearch = ref(null); // birth place search input
const hireDateFormatted = ref(format(editedEmployee.value.hireDate, null, 'MM/DD/YYYY')); // formatted hireDate
const deptDateFormatted = ref(format(editedEmployee.value.deptDate, null, 'MM/DD/YYYY')); // formatted deptDate
const hireMenu = ref(false); // display hire menu
const deptMenu = ref(false); // display dept menu
const placeIds = ref({}); // for address autocomplete
const predictions = ref({}); // for POB autocomplete
const toggleForm = ref(false); // for EEO data
const phoneAutofocus = ref(false);

usePrepareSubmit('personal', prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  emitter.on('confirmed-cancel-eeo', () => {
    toggleForm.value = false;
  });
});

onBeforeUnmount(() => {
  emitter.off('confirmed-cancel-eeo');
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const userIsAdminOrManager = computed(() => {
  const role = store.getters.user.employeeRole;
  return role === 'admin' || role === 'manager';
});

/** @type {import('vue').ComputedRef<((v: any) => true | string)[]>} */
const employeeNumberRules = computed(() => [
  ...getRequiredRules(),
  ...getNumberRules(),
  (v) => {
    let duplicate = _some(store.getters.employees, (employee) => {
      // ensures that the employee number being set is not the same as another employee
      employee.employeeNumber === Number(v) && employee.employeeNumber !== store.getters.user.employeeNumber;
    });
    return !duplicate || 'This employee id is already in use';
  }
]);

const workStatus = computed({
  get: () => {
    if (editedEmployee.value.workStatus === 100) return 'Full Time';
    if (editedEmployee.value.workStatus === 0) return 'Inactive';
    return 'Part Time';
  },
  set: (val) => {
    switch (val) {
      case 'Full Time':
        editedEmployee.value.workStatus = 100;
        break;
      case 'Part Time':
        editedEmployee.value.workStatus = partTimeNumber.value;
        break;
      case 'Inactive':
        editedEmployee.value.workStatus = 0;
        break;
    }
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Uses the formatted/transformed data from the form and loads it into the edited employee
 */
async function prepareSubmit() {
  if (!slotProps.stopPrepare) {
    await slotProps.validate();

    if (editedEmployee.value.noMiddleName) editedEmployee.value.middleName = '';

    editedEmployee.value.email = emailUsername.value + CASE_EMAIL_DOMAIN;

    // if formatting has changed but date hasn't, reset it back
    if (isSame(uneditedHireDate, editedEmployee.value.hireDate, 'day'))
      editedEmployee.value.hireDate = uneditedHireDate;
    if (isSame(uneditedDeptDate, editedEmployee.value.deptDate, 'day'))
      editedEmployee.value.deptDate = uneditedDeptDate;

    editedEmployee.value.employeeRole = _lowerCase(employeeRole.value);

    if (workStatus.value === 'Part Time') editedEmployee.value.workStatus = partTimeNumber.value;

    // the xor/symmetric difference is just the elements that have changed
    // this includes both tags the employee was added to and removed from, and no others
    editedEmployee.value.tags = _xorBy(editedTags.value, uneditedTags, 'id'); // xor by property 'id'
    editedEmployee.value.tags = _uniqBy(editedEmployee.value.tags, 'id');

    if (editedEmployee.value.country !== 'United States') editedEmployee.value.st = '';

    editedEmployee.value.birthdayFeed = !birthdayHidden.value;

    editedEmployee.value.privatePhoneNumbers = [];
    editedEmployee.value.publicPhoneNumbers = [];

    phoneNumbers.value.forEach((phoneNumber) => {
      if (phoneNumber.private) editedEmployee.value.privatePhoneNumbers.push(phoneNumber);
      else editedEmployee.value.publicPhoneNumbers.push(phoneNumber);
    });

    // extract username from github and twitter
    if (editedEmployee.value.github && editedEmployee.value.github.indexOf('/') != -1) {
      editedEmployee.value.github = editedEmployee.value.github.substring(
        editedEmployee.value.github.lastIndexOf('/') + 1
      );
    }
    if (editedEmployee.value.twitter && editedEmployee.value.twitter.indexOf('/') != -1) {
      editedEmployee.value.twitter = editedEmployee.value.twitter.substring(
        editedEmployee.value.twitter.lastIndexOf('/') + 1
      );
    }
  }
}

/**
 * Gets tags of edited employee
 *
 * @return {any} A deep clone of the employee tags
 */
function getEmployeeTags() {
  return _cloneDeep(_filter(store.getters.tags, (tag) => _includes(tag.employees, employeeId)));
}

/**
 * Sets the initial value of the list of phone numbers
 *
 * @return {any[]} A concatenated list of pubic and private phone numbers
 */
function initPhoneNumbers() {
  if (editedEmployee.value.privatePhoneNumbers === undefined) {
    editedEmployee.value.privatePhoneNumbers = [];
  }
  if (editedEmployee.value.publicPhoneNumbers === undefined) {
    editedEmployee.value.publicPhoneNumbers = [];
  }
  return editedEmployee.value.publicPhoneNumbers.concat(editedEmployee.value.privatePhoneNumbers);
}

/**
 * Adds a new empty phone number to the list for the user to fill out
 */
function addPhoneNumber() {
  phoneNumbers.value.push({ number: '', type: '', private: true });
  phoneAutofocus.value = true;
}

/**
 * Removes a phone number from the list
 * @param {number} index The index of the phone number in the list
 */
function deletePhoneNumber(index) {
  phoneNumbers.value.splice(index, 1);
}

/**
 * Updates the address dropdown according to the user's input.
 */
let timeout;
async function updateAddressDropDown(query) {
  if (query.length <3) return; // <3
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(async () => {
    let locations = await api.getLocation(query);
    let callback = (acc, { formattedAddress, ...rest }) => { acc[formattedAddress] = rest; return acc; };
    placeIds.value = locations.reduce(callback, {});
  }, 250);
}

/**
 * Finds the city, street, state, and zip code current address fields based on an address
 * @param {import('vue').Ref<any>} item The ref to the search string
 */
async function autofillLocation(item) {
  // extract address info
  let address = placeIds.value[item.value];

  // update address info
  editedEmployee.value.currentStreet = address.street1;
  editedEmployee.value.currentStreet2 = address.street2;
  editedEmployee.value.currentCity = address.city;
  editedEmployee.value.currentState = address.state;
  editedEmployee.value.currentZIP = address.zip;

  //resets addresses and ID's in dropdown
  placeIds.value = {};
  addressSearch.value.blur();
}

/**
 * Updates the city dropdown according to the user's input.
 */
async function updateCityDropDown(query) {
  if (query.length > 2) {
    let locations = await api.getCity(query);
    //object used to contain addresses and their respective ID's
    //needed later to obtain the selected address's zip code
    predictions.value = {};
    _forEach(locations.predictions, (location) => {
      predictions.value[location.description] = location.predictions;
    });
  } else {
    predictions.value = {};
  }
}

/**
 * Once a city has been selected, it will update the fields.
 */
async function updateCityBoxes(item) {
  let citySearchString = item.value;
  let country = '';
  let state = '';
  if (!_isEmpty(citySearchString)) {
    let birthInfo = citySearchString.split(', ');
    let city = birthInfo[0];

    // a city outside the US with no state/region
    if (birthInfo.length == 2) {
      country = birthInfo[1];
    } else {
      state = birthInfo[1];
      country = birthInfo[2];
    }

    if (country === 'USA') {
      country = 'United States';
    }
    //fills in the first three fields
    editedEmployee.value.city = city;
    editedEmployee.value.country = country;
    editedEmployee.value.st = STATES[state];

    //resets predictions and ID's in dropdown
    predictions.value = {};
    birthPlaceSearch.value.blur();
  }
}

/**
 * Removes any text after the '@' symbol on the email username input once the user clicks away.
 * This should help prevent any double domain issues for the CASE email.
 */
function emailValue() {
  let atIndex = emailUsername.value.indexOf('@');

  if (atIndex !== -1) {
    emailUsername.value = emailUsername.value.substring(0, atIndex).toLowerCase();
  }
} // emailValue

function toggleEdit() {
  emitter.emit('open-dialog');
  toggleForm.value = true;
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for editedEmployee.value.birthday
 */
watch(
  () => editedEmployee.value.birthday,
  () => {
    birthdayFormat.value = format(editedEmployee.value.birthday, null, 'MM/DD/YYYY') || birthdayFormat.value;
    //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
    if (editedEmployee.value.birthday !== null && !format(editedEmployee.value.birthday, null, 'MM/DD/YYYY')) {
      editedEmployee.value.birthday = null;
    }
  }
);

/**
 * watcher for editedEmployee.value.hireDate - format date on change.
 */
watch(
  () => editedEmployee.value.hireDate,
  async () => {
    hireDateFormatted.value = format(editedEmployee.value.hireDate, null, 'MM/DD/YYYY') || hireDateFormatted.value;
    //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
    if (editedEmployee.value.hireDate !== null && !format(editedEmployee.value.hireDate, null, 'MM/DD/YYYY')) {
      editedEmployee.value.hireDate = null;
    }
  }
);

/**
 * watcher for editedEmployee.value.deptDate - format date on change and set contract end date
 */
watch(
  () => editedEmployee.value.deptDate,
  async () => {
    deptDateFormatted.value = format(editedEmployee.value.deptDate, null, 'MM/DD/YYYY') || deptDateFormatted.value;
    //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
    if (editedEmployee.value.deptDate !== null && !format(editedEmployee.value.deptDate, null, 'MM/DD/YYYY')) {
      editedEmployee.value.deptDate = null;
    }
    // update the user's current contracts to have their dept date as the end date
    if (workStatus.value === 'Inactive') {
      for (let c of editedEmployee.value.contracts) {
        for (let p of c.projects) {
          // set current project to have dept date as the end date
          if (!p.endDate) p.endDate = format(deptDateFormatted.value, 'MM/DD/YYYY', DEFAULT_ISOFORMAT);
        }
      }
    }
  }
);

/**
 * Watch for work status changing and remove old data
 */
watch(
  () => editedEmployee.value.workStatus,
  async () => {
    if (editedEmployee.value.workStatus !== 'Inactive') editedEmployee.value.deptDate = null;
  }
);
</script>

<style scoped>
.v-text-field {
  min-width: 200px;
}

.v-col {
  min-width: min-content;
}

.work-status-box {
  min-width: 70px;
  max-width: fit-content;
}
</style>
