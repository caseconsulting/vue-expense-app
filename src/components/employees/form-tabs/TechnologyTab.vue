<template>
  <div>
    <p class="emsi">
      *List of Technologies and Skills provided by
      <a href="https://lightcast.io/open-skills" target="_blank">EMSI</a>. Additions made by users are not endorsed by
      EMSI.
    </p>
    <!-- Loop Technologies -->
    <div
      v-for="(technology, index) in editedTechnologies"
      class="gray-border ma-0 pt-3 pb-1 px-5"
      :key="'technology: ' + index"
    >
      <!-- Name of Technology -->
      <v-autocomplete
        class="pb-5"
        ref="formFields"
        v-model="technology.name"
        @update:search="updateTechDropDown($event)"
        :rules="[duplicateRules(technology.name), ...getRequiredRules()]"
        :items="technologyDropDown"
        label="Technology or Skill*"
        variant="underlined"
        data-vv-name="Technology"
        clearable
      >
      </v-autocomplete>
      <!-- Time Intervals -->
      <v-row justify="center">
        <!-- Current Switch -->
        <v-col cols="10" sm="6" md="6" lg="6" class="ml-3 ml-sm-0">
          <div>
            <v-tooltip activator="parent" location="top">
              Enabling this will auto-increment the years of experience every month
            </v-tooltip>
            <v-switch
              v-model="technology.current"
              :color="caseGray"
              label="Currently working with this technology / skill"
            ></v-switch>
          </div>
        </v-col>

        <!-- Years of Experience -->
        <v-col
          cols="8"
          sm="4"
          md="4"
          lg="4"
          class="px-0 px-sm-0 pb-0"
          :class="{ 'px-4': $vuetify.display.sm, 'px-4': $vuetify.display.lg }"
        >
          <v-text-field
            ref="formFields"
            v-model="technology.years"
            flat
            :rules="[...getRequiredRules(), experienceRequired[0](technology.years, index), experienceRequired[1]]"
            single-line
            max="99"
            min="0"
            suffix="years"
            density="compact"
            type="number"
            variant="outlined"
            @update:model-value="technology.years = Number(technology.years)"
          >
          </v-text-field>
        </v-col>
        <v-col cols="2" class="mt-0 mb-5 text-center">
          <v-btn variant="text" icon @click="deleteTechnology(index)">
            <v-tooltip activator="parent" location="bottom">Delete Technology</v-tooltip>
            <v-icon class="case-gray">mdi-delete</v-icon></v-btn
          >
        </v-col>
      </v-row>
      <!-- End Loop Technologies -->
    </div>
    <!-- Button to Add Technologies -->
    <div class="pt-4" align="center">
      <v-btn @click="addTechnology()" elevation="2">
        <v-icon class="pr-1">mdi-plus</v-icon>
        Technology
      </v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _isArray from 'lodash/isArray';
import _map from 'lodash/map';
import _compact from 'lodash/compact';
import _forEach from 'lodash/forEach';
import _uniq from 'lodash/uniq';
import _cloneDeep from 'lodash/cloneDeep';
import { asyncForEach } from '@/utils/utils';
import { getRequiredRules } from '@/shared/validationUtils.js';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'technologies'); // emit technologies tab was created
  this.employees = this.$store.getters.employees; // get all employees
  this.populateDropDowns();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add a Technology.
 */
function addTechnology() {
  if (!this.editedTechnologies) this.editedTechnologies = [];
  this.editedTechnologies.push({
    name: null,
    years: 0,
    current: false
  });
} // addTechnology

/**
 * Deletes a Technology.
 *
 * @param index - array index of technology to delete
 */
function deleteTechnology(index) {
  this.editedTechnologies.splice(index, 1);
} // deleteTechnology

/**
 * Creates an array of all technologies that a user has entered multiple times (based on name).
 *
 * @return array - an array of technology names that a user has entered multiple times
 */
function duplicateTechEntries() {
  //declares function to count unique name properties of js objects
  const count = (names) =>
    names.reduce((acc, it) => {
      if (it.name !== '') {
        acc[it.name] = acc[it.name] + 1 || 1;
      }
      return acc;
    }, {});

  //returns an array of objects that had a count of over 1
  const duplicates = (dict) => Object.keys(dict).filter((a) => dict[a] > 1);
  return this.editedTechnologies ? duplicates(count(this.editedTechnologies)) : [];
} // duplicateTechEntries

/**
 * Checks to see if a technology is a duplicate of one that is already entered by a user.
 *
 * @param tech - the string name of the technology
 * @return boolean - true if technology was already entered by user (duplicate) false otherwise
 */
function isDuplicate(tech) {
  let duplicates = this.duplicateTechEntries();

  //checks to see if tech is in duplicates array
  if (duplicates && _isArray(duplicates) && duplicates.length > 0) {
    return duplicates.includes(tech);
  }
  return false;
} // isDuplicate

/**
 * Gets information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesTechnology = _map(this.employees, (employee) => employee.technologies); //extract technology
  employeesTechnology = _compact(employeesTechnology); //remove falsey values
  // loop employees
  _forEach(employeesTechnology, (technologies) => {
    // loop technologies
    _forEach(technologies, (technology) => {
      this.technologyDropDown.push(technology.name); // add technology name
    });
    this.technologyDropDown = _uniq(this.technologyDropDown);
  });
  this.technologyDropDown.sort((a, b) => a.length - b.length);
} // populateDropDowns

/**
 * Retrieves list of skills to display a dropdown
 * related to what the user just typed in.
 */
async function updateTechDropDown(query) {
  if (query.length > 0) {
    let techList = await api.getTechSkills(query);
    this.technologyDropDown = techList;
    this.populateDropDowns();
  } else if (this.technologyDropDown.length >= 0) {
    this.technologyDropDown = [];
  }
  if (query.length === 0) {
    this.populateDropDowns();
  }
} //updateTechDropDown

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) {
      errorCount++;
    }
  });
  //emit error status with a custom message
  // emit error status
  this.emitter.emit('technologiesStatus', errorCount);
  this.emitter.emit('doneValidating', { tab: 'technologies', data: this.editedTechnologies }); // emit done validating
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields.
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
  data() {
    return {
      technologyDropDown: [], // autocomplete technology name options
      editedTechnologies: _cloneDeep(this.model), //stores edited technology info
      duplicateRules: (tech) => {
        return !this.isDuplicate(tech) || 'Duplicate technology found, please remove duplicate entries';
      },
      experienceRequired: [
        (v, index) => v > 0 || this.editedTechnologies[index].current || 'Value must be greater than 0',
        (v) => v < 100 || 'Value must be less than 100'
      ]
    };
  },
  methods: {
    addTechnology,
    deleteTechnology,
    duplicateTechEntries,
    getRequiredRules,
    isDuplicate,
    populateDropDowns,
    updateTechDropDown,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
<style>
.emsi {
  font-size: small;
}
</style>
