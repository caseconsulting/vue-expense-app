<template>
  <div>
    <!-- Github -->
    <v-text-field
      v-model.trim="editedPersonalInfo.github"
      ref="github"
      label="Github (username)"
      variant="underlined"
      data-vv-name="Github"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0" size="23">
          <v-img class="grayImage" :src="github" alt="Github icon"></v-img>
        </v-avatar>
      </template>
    </v-text-field>

    <!-- X -->
    <v-text-field
      v-model.trim="editedPersonalInfo.twitter"
      ref="x"
      label="X (username)"
      variant="underlined"
      data-vv-name="X"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0" size="23">
          <v-img class="grayImage" :src="x" alt="X icon"></v-img>
        </v-avatar>
      </template>
    </v-text-field>

    <!-- LinkedIn -->
    <v-text-field
      v-model.trim="editedPersonalInfo.linkedIn"
      label="LinkedIn (profile url)"
      variant="underlined"
      :rules="getURLRules()"
      ref="linkedin"
      data-vv-name="LinkedIn"
    >
      <template v-slot:prepend>
        <v-avatar rounded="0" size="23">
          <v-img class="grayImage" :src="linkedin" alt="Linkedin icon`"></v-img>
        </v-avatar>
      </template>
    </v-text-field>

    <!-- Personal Email -->
    <v-text-field
      prepend-icon="mdi-email"
      v-model.trim="editedPersonalInfo.personalEmail"
      label="Personal Email"
      variant="underlined"
      :rules="getEmailRules()"
      ref="personalEmail"
      data-vv-name="personal email"
    ></v-text-field>

    <!-- Phone Numbers -->
    <p class="mt-5">Phone Numbers</p>
    <div class="groove pr-0 pl-2 mb-4">
      <v-row v-for="(phoneNumber, index) in phoneNumbers" :key="index" class="d-flex align-center mt-0">
        <v-col class="pt-0" cols="12" xl="2" lg="3" md="3" sm="3">
          <v-autocomplete
            v-model="phoneNumber.type"
            label="Type"
            variant="underlined"
            :items="phoneNumberTypes"
            data-vv-name="Phone Type"
            :rules="getPhoneNumberTypeRules()"
            ref="phoneType"
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col class="pt-0" cols="12" xl="6" lg="4" md="3" sm="3">
          <v-text-field
            v-model.trim="phoneNumber.number"
            v-mask="'###-###-####'"
            hint="###-###-#### format"
            :rules="getPhoneNumberRules()"
            ref="phoneNum"
            label="Phone Number"
            variant="underlined"
            data-vv-name="Phone Number"
          >
          </v-text-field>
        </v-col>
        <v-col class="pt-0" cols="12" xl="2" lg="3" md="3" sm="3">
          <v-text-field v-model="phoneNumber.ext" v-mask="'####'" label="Ext" variant="underlined" data-vv-name="Ext">
          </v-text-field>
        </v-col>
        <v-col class="py-0 pr-0" cols="12" xl="2" lg="2" md="3" sm="3">
          <v-btn class="mr-2" @click="deletePhoneInput(index)" variant="text" icon="">
            <v-tooltip activator="parent" location="bottom">Delete Number</v-tooltip>
            <v-icon class="case-gray">mdi-delete</v-icon>
          </v-btn>
          <v-btn @click="changeNumberVisibility(index)" variant="text" icon="">
            <v-tooltip activator="parent" location="bottom">
              <span v-if="phoneNumber.private"
                >Based on user preference, this is only visible to You, Managers, and Admins</span
              >
              <span v-else>Based on user preference, this is visible to everyone</span>
            </v-tooltip>
            <v-icon v-if="phoneNumber.private" class="case-gray">mdi-shield</v-icon>
            <v-icon v-else class="case-gray">mdi-shield-outline</v-icon>
          </v-btn>
        </v-col>
        <v-col v-if="index != phoneNumbers.length - 1 && $vuetify.display.name === 'xs'" cols="12">
          <v-divider class="mb-2"></v-divider>
        </v-col>
      </v-row>
      <div align="center" class="py-2">
        <v-btn @click="addPhoneInput()">Add a Number</v-btn>
      </div>
    </div>

    <!-- Birthday Picker -->
    <v-text-field
      ref="formFields"
      v-mask="'##/##/####'"
      v-model="birthdayFormat"
      :rules="[...getDateOptionalRules(), ...getNonFutureDateRules()]"
      label="Birthday"
      variant="underlined"
      hint="MM/DD/YYYY format"
      prepend-icon="mdi-calendar"
      persistent-hint
      @update:focused="editedPersonalInfo.birthday = format(birthdayFormat, null, 'YYYY-MM-DD')"
      @click:prepend="BirthdayMenu = true"
      @keypress="BirthdayMenu = false"
      autocomplete="off"
    >
      <v-menu
        activator="parent"
        ref="BirthdayMenu"
        :close-on-content-click="false"
        v-model="BirthdayMenu"
        location="start center"
      >
        <v-date-picker
          v-model="editedPersonalInfo.birthday"
          @update:model-value="BirthdayMenu = false"
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="Birthday"
        >
        </v-date-picker>
      </v-menu>
    </v-text-field>

    <!-- Show Birthday -->
    <v-switch
      v-model="editedPersonalInfo.birthdayFeed"
      label="Have birthday (MM/DD format) recognized on company feed?"
      :disabled="disableBirthdayFeed"
      :color="caseGray"
    ></v-switch>

    <!-- Place of Birth -->
    <p>
      Place of Birth
      <v-avatar class="pb-1" variant="text" icon="">
        <v-tooltip activator="parent" location="bottom">Only Visible to You, Managers, and Admins</v-tooltip>
        <v-icon class="case-gray">mdi-shield </v-icon>
      </v-avatar>
    </p>
    <div class="groove pr-5 pl-2">
      <!-- Place of Birth: City text field -->
      <v-autocomplete
        class="pb-3 pt-0"
        @update:search="updateCityDropDown($event)"
        :items="Object.keys(predictions)"
        v-model="citySearchString"
        hide-no-data
        variant="outlined"
        persitent-hint="Search address and select option to auto-fill fields below."
        persistent-hint
      >
        <template v-slot:item="{ item, props }">
          <v-list-item @click="updateCityBoxes(item, props)">{{ item.value }}</v-list-item>
        </template>
        <v-list slot="append-item" name="joe" class="case-gray"> <span class="ml-2">Powered By Google</span> </v-list>
      </v-autocomplete>

      <v-text-field
        v-model="editedPersonalInfo.city"
        label="City"
        variant="underlined"
        data-vv-name="City"
        class="pt-0"
      ></v-text-field>

      <!-- Place of Birth: Country autocomplete -->
      <v-autocomplete
        :items="countries"
        v-model="editedPersonalInfo.country"
        item-title="text"
        label="Country"
        variant="underlined"
      ></v-autocomplete>

      <!-- Place of Birth: State autocomplete -->
      <v-autocomplete
        v-if="isUSA"
        :items="Object.values(states)"
        v-model="editedPersonalInfo.st"
        item-title="text"
        label="State"
        class="pt-0"
        variant="underlined"
      ></v-autocomplete>
    </div>
    <!-- Current Address -->
    <div v-if="userhasAdminPermissions() || userIsEmployee()">
      <p class="pt-4 mb-0 pb-0">
        Current Address
        <v-avatar class="pb-1" variant="text" icon="">
          <v-tooltip activator="parent" location="bottom">Only Visible to You, Managers, and Admins</v-tooltip>
          <v-icon class="case-gray">mdi-shield</v-icon>
        </v-avatar>
      </p>
      <v-autocomplete
        class="pb-3 pt-0"
        @update:search="updateAddressDropDown($event)"
        :items="Object.keys(placeIds)"
        v-model="searchString"
        hide-no-data
        variant="outlined"
        persitent-hint="Search address and select option to auto-fill fields below."
        persistent-hint
      >
        <template v-slot:item="{ item, props }">
          <v-list-item @click="updateAddressBoxes(item, props)">{{ item.value }}</v-list-item>
        </template>
        <v-list slot="append-item" name="joe" class="case-gray"> <span class="ml-2">Powered By Google</span> </v-list>
      </v-autocomplete>
      <div class="groove pr-5 pl-2">
        <!-- Current Address: Street 1 text field -->
        <v-text-field
          v-model.trim="editedPersonalInfo.currentStreet"
          label="Street 1"
          variant="underlined"
          data-vv-name="Street 1"
          class="pt-0"
        ></v-text-field>
        <!-- Current Address: Street 2 text field -->
        <v-text-field
          v-model.trim="editedPersonalInfo.currentStreet2"
          label="Street 2"
          variant="underlined"
          data-vv-name="Street 2"
          class="pt-0"
        ></v-text-field>
        <!-- Current Address: City text field -->
        <v-text-field
          v-model.trim="editedPersonalInfo.currentCity"
          label="City"
          variant="underlined"
          data-vv-name="Current City"
          class="pt-0"
        ></v-text-field>
        <!-- Current Address: State autocomplete -->
        <v-autocomplete
          :items="Object.values(states)"
          v-model="editedPersonalInfo.currentState"
          item-title="text"
          label="State"
          variant="underlined"
          class="pt-0"
        ></v-autocomplete>
        <!-- Current Address: ZIP text field -->
        <v-text-field
          v-model.trim="editedPersonalInfo.currentZIP"
          v-mask="'#####'"
          label="ZIP"
          variant="underlined"
          data-vv-name="Current ZIP"
          class="pt-0"
        ></v-text-field>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _forEach from 'lodash/forEach';
import _isArray from 'lodash/isArray';
import _filter from 'lodash/filter';
import _cloneDeep from 'lodash/cloneDeep';
import github from '@/assets/img/trademarks/github.png';
import linkedin from '@/assets/img/trademarks/linkedin.png';
import x from '@/assets/img/trademarks/x.png';
import {
  getDateOptionalRules,
  getEmailRules,
  getNonFutureDateRules,
  getURLRules,
  getPhoneNumberRules,
  getPhoneNumberTypeRules
} from '@/shared/validationUtils.js';
import { asyncForEach, isEmpty, COUNTRIES, STATES } from '@/utils/utils';
import { format } from '@/shared/dateUtils';
import { mask } from 'vue-the-mask';
import { getRole } from '@/utils/auth';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'personal'); // emit personal tab was created
  // get countries
  this.countries = COUNTRIES;
  // set formatted birthday date
  this.birthdayFormat = this.format(this.editedPersonalInfo.birthday, null, 'MM/DD/YYYY') || this.birthdayFormat;
  // fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedPersonalInfo.birthday !== null && !this.format(this.editedPersonalInfo.birthday, null, 'MM/DD/YYYY')) {
    // clear birthday date if fails to format
    this.editedPersonalInfo.birthday = null;
  }

  let user = this.$store.getters.user;
  this.userId = user.employeeNumber;

  this.phoneNumbers = this.editedPersonalInfo.privatePhoneNumbers.concat(this.editedPersonalInfo.publicPhoneNumbers);
} // created

// |--------------------------------------------------|
// |                                                  |
// |                    Computed                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Function for handling if the birthdayFeed switch is disabled.
 *
 * @return boolean - birthday feed is disabled
 */
function disableBirthdayFeed() {
  if (this.editedPersonalInfo.birthday == null) {
    this.editedPersonalInfo.birthdayFeed = false;
    return true;
  }
  return false;
} // disableBirthdayFeed

/**
 * Checks to see if the country is the United States. if it is: returns true
 * otherwise clears state field and returns false.
 *
 * @return boolean - is the USA
 */
function isUSA() {
  if (this.editedPersonalInfo.country == 'United States') {
    return true;
  } else {
    this.editedPersonalInfo.st = null;
    return false;
  }
} // isUSA

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Updates the address dropdown according to the user's input.
 */
async function updateAddressDropDown(query) {
  if (query.length > 3) {
    let locations = await api.getLocation(query);
    //object used to contain addresses and their respective ID's
    //needed later to obtain the selected address's zip code
    this.placeIds = {};
    _forEach(locations.predictions, (location) => {
      this.placeIds[location.description] = location.place_id;
    });
  } else {
    this.placeIds = {};
  }
} //updateAddressDropDown

/**
 * Updates the city dropdown according to the user's input.
 */
async function updateCityDropDown(query) {
  if (query.length > 2) {
    let locations = await api.getCity(query);
    //object used to contain addresses and their respective ID's
    //needed later to obtain the selected address's zip code
    this.predictions = {};
    _forEach(locations.predictions, (location) => {
      this.predictions[location.description] = location.predictions;
    });
  } else {
    this.predictions = {};
  }
} //updateCityDropDown

/**
 * Once an address has been selected, it autofills the city, street, and state fields.
 * It also updates the zip code field making an additional Google Maps API call
 * to obtain the selected address's zip code.
 */
async function updateAddressBoxes(item) {
  this.searchString = item.value;
  if (!this.isEmpty(this.searchString)) {
    let fullAddress = this.searchString.split(', ');
    //fills in the first three fields
    this.editedPersonalInfo.currentCity = fullAddress[1];
    this.editedPersonalInfo.currentStreet = fullAddress[0];
    this.editedPersonalInfo.currentState = this.states[fullAddress[2].split(' ')[0]];

    //obtains the selected address's ID needed for the zip code API call
    let selectedAddress = this.placeIds[this.searchString];
    let res = await api.getZipCode(selectedAddress);
    //Response contains an array of objects, with each object containing
    //a field title 'type'. 'Type' is another array and we want the one
    //containing the postal_code string
    this.editedPersonalInfo.currentZIP = '';
    _forEach(res.result.address_components, (field) => {
      if (field.types.includes('postal_code')) {
        this.editedPersonalInfo.currentZIP = field.short_name;
      }
    });
    //resets addresses and ID's in dropdown
    this.placeIds = {};
    this.searchString = null;
  }
} // updateAddressBoxes

/**
 * Once a city has been selected, it will update the fields.
 */
async function updateCityBoxes(item) {
  this.citySearchString = item.value;
  let country = '';
  let state = '';
  if (!this.isEmpty(this.citySearchString)) {
    let birthInfo = this.citySearchString.split(', ');
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
    this.editedPersonalInfo.city = city;
    this.editedPersonalInfo.country = country;
    this.editedPersonalInfo.st = this.states[state];

    //resets addresses and ID's in dropdown
    this.predictions = {};
    this.citySearchString = null;
  }
} // updateCityBoxes

/**
 * Checks whether the current user role has admin permissions, used specifically
 * to prevent the manager from changing their own role on the Employee tab.
 *
 * @return boolean - true if the user role is admin
 */
function userhasAdminPermissions() {
  return this.getRole() === 'admin' || this.getRole() === 'manager';
} // userhasAdminPermissions

/**
 * Checks if the profile accessed is the signed-in user's profile.
 *
 * @return boolean - true if the profile is the user's profile
 */
function userIsEmployee() {
  if (this.$route.params.id == this.userId) {
    return true;
  }
  return false;
} // userIsEmployee

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
async function validateFields() {
  this.sortPhoneNumbers();

  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;

  // for some reason, this page didn't overwrote the elements as formFields like the other pages did so
  // we added individual refs and put them into the components list manually
  components = [
    ...components,
    this.$refs.x,
    this.$refs.github,
    this.$refs.linkedin,
    this.$refs.personalEmail,
    ...(this.$refs.phoneNum || []),
    ...(this.$refs.phoneType || [])
  ];
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });

  this.emitter.emit('personalStatus', errorCount); // emit error status
  this.emitter.emit('doneValidating', { tab: 'personal', data: this.editedPersonalInfo }); // emit done validating
} // validateFields

/**
 * Adds a template data block for phone input field.
 */
function addPhoneInput() {
  this.phoneNumbers.push({
    type: null,
    number: null,
    private: true,
    valid: true
  });
} // addPhoneInput

/**
 * Sorts phone numbers into two lists based on private or public.
 */
function sortPhoneNumbers() {
  this.editedPersonalInfo.privatePhoneNumbers = _filter(this.phoneNumbers, (num) => num.private);
  this.editedPersonalInfo.publicPhoneNumbers = _filter(this.phoneNumbers, (num) => !num.private);
} // sortPhoneNumbers

/**
 * Removes a phone input at given index.
 *
 * @param index - the array index of the phone number to delete
 */
function deletePhoneInput(index) {
  this.phoneNumbers.splice(index, 1);
} // deletePhoneInput

/**
 * Changes the visibility of the given number.
 *
 * @param index - the index of the number to change
 */
function changeNumberVisibility(index) {
  this.phoneNumbers[index].private = !this.phoneNumbers[index].private;
  if (this.phoneNumbers[index].private) {
    this.phonePrivacyBadgeIcon = 'mdi-shield';
  } else {
    this.phonePrivacyBadgeIcon = 'mdi-shield-outline';
  }
} // changeNumberVisibility

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model.id - update edited personal info
 */
function watchModelID() {
  //when select an employee with a different ID the personal info reflects the employee that was chosen
  this.editedPersonalInfo = _cloneDeep(this.model);
} // watchModelID

/**
 * watcher for editedPersonalInfo.birthday
 */
function watchEditedPersonalInfoBirthday() {
  this.birthdayFormat = this.format(this.editedPersonalInfo.birthday, null, 'MM/DD/YYYY') || this.birthdayFormat;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedPersonalInfo.birthday !== null && !this.format(this.editedPersonalInfo.birthday, null, 'MM/DD/YYYY')) {
    this.editedPersonalInfo.birthday = null;
  }
} // watchEditedPersonalInfoBirthday

/**
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  computed: {
    disableBirthdayFeed,
    isUSA
  },
  data() {
    return {
      editedPersonalInfo: _cloneDeep(this.model), //employee personal info that can be edited
      addressDropDown: [],
      birthdayFormat: null, // formatted birthday
      BirthdayMenu: false, // display birthday menu
      citySearchString: null, // user input for searching POB
      countries: [], // list of countries
      phoneNumbers: [],
      phonePrivacyBadgeIcon: 'mdi-shield-outline',
      phoneNumberTypes: ['Home', 'Cell', 'Work'],
      searchString: null, // user input for address searching
      placeIds: {},
      predictions: {},
      userId: null,
      github,
      linkedin,
      x,
      states: STATES
    };
  },
  directives: { mask },
  methods: {
    format,
    getDateOptionalRules,
    getEmailRules,
    getNonFutureDateRules,
    getPhoneNumberRules,
    getPhoneNumberTypeRules,
    getURLRules,
    getRole,
    isEmpty,
    updateAddressDropDown,
    updateCityDropDown,
    updateAddressBoxes,
    updateCityBoxes,
    userhasAdminPermissions,
    userIsEmployee,
    validateFields,
    addPhoneInput,
    deletePhoneInput,
    changeNumberVisibility,
    sortPhoneNumbers
  },
  props: ['model', 'validating'],
  watch: {
    'model.id': watchModelID,
    'editedPersonalInfo.birthday': watchEditedPersonalInfoBirthday,
    validating: watchValidating
  }
};
</script>

<style scoped>
.grayImage {
  -webkit-filter: brightness(0) opacity(55%);
  filter: brightness(0) opacity(55%);
}
</style>
