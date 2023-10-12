<template>
  <div>
    <!-- Loop Customer Organization -->
    <div
      v-for="(exp, index) in editedCustomerOrgExp"
      class="gray-border ma-0 pt-3 pb-1 px-5"
      :key="'exp: ' + exp.name + index"
    >
      <!-- Name of Customer Organization -->
      <v-autocomplete
        ref="formFields"
        v-model="exp.name"
        :rules="[duplicateCustomerOrg(exp.name), ...getRequiredRules()]"
        :items="experienceDropDown"
        label="Customer Organization Experience"
        data-vv-name="Customer Organization Experience"
        clearable
        :error="isDuplicate(exp.name)"
      >
      </v-autocomplete>

      <v-row align="center" class="py-3" justify="center">
        <!-- Current Switch -->
        <v-col cols="6" sm="7" md="6" lg="7">
          <v-tooltip top nudge-left="75" nudge-bottom="10" max-width="300">
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-switch v-model="exp.current" label="Currently working with this customer organization"></v-switch>
              </div>
            </template>
            <span>Enabling this will auto-increment the years of experience every month</span>
          </v-tooltip>
        </v-col>

        <!-- Years of Experience -->
        <v-col
          cols="4"
          sm="3"
          md="4"
          lg="3"
          class="px-0 pb-0"
          :class="{ 'px-4': $vuetify.display.sm, 'px-4': $vuetify.display.lg }"
        >
          <v-text-field
            ref="formFields"
            v-model="exp.years"
            flat
            :rules="[...getRequiredRules(), experienceRequired[0](exp.years, index), experienceRequired[1]]"
            single-line
            max="99"
            min="0"
            suffix="years"
            dense
            type="number"
            outlined
            @input="exp.years = Number(exp.years)"
          ></v-text-field>
        </v-col>

        <!-- Button to Delete Customer Organization -->
        <v-col cols="2" class="mb-3" align="center">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="deleteExperience(index)" text icon
                ><v-icon class="case-gray pr-1">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Experience</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
    <!-- End Loop Customer Organization -->

    <!-- Button to Add Customer Organization -->
    <div class="pt-4" align="center">
      <v-btn @click="addExperience()" elevation="2"><v-icon class="pr-1">add</v-icon>Experience</v-btn>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
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
  this.emitter.emit('created', 'customerOrgExp'); // emit customer organization tab was created
  this.employees = this.$store.getters.employees; // get all employees
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds a Customer Organization.
 */
function addExperience() {
  if (!this.editedCustomerOrgExp) this.editedCustomerOrgExp = [];
  this.editedCustomerOrgExp.push({
    name: '',
    years: 0,
    current: false
  });
} // addExperience

/**
 * Deletes a Customer Organization.
 *
 * @param index - array index of customer organization to delete
 */
function deleteExperience(index) {
  this.editedCustomerOrgExp.splice(index, 1);
} // deleteExperience

/**
 * Checks if a customer org name is duplicated.
 */
function isDuplicate(custOrgName) {
  return _.filter(this.editedCustomerOrgExp, (custOrg) => custOrg.name === custOrgName).length > 1;
} // isDuplicate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  this.emitter.emit('doneValidating', 'customerOrgExp', this.editedCustomerOrgExp); // emit done validating and send edited data to parent
  this.emitter.emit('customerOrgExpStatus', errorCount); // emit error status
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
      duplicateCustomerOrg: (customerOrgName) => {
        return !this.isDuplicate(customerOrgName) || 'Duplicate Customer Org';
      },
      experienceDropDown: [
        'DIR',
        'DDI',
        'DDI/ITE',
        'DDI/ADO',
        'DDI/OSE',
        'DDI/CCI',
        'DA',
        'DO',
        'DST',
        'DS',
        'Talent',
        'Mission Center',
        'DNI',
        'NGA',
        'NRO',
        'DoD',
        'Other'
      ], // autocomplete customer organization name options
      editedCustomerOrgExp: _.cloneDeep(this.model), //stores edited customer orgs info
      experienceRequired: [
        (v, index) => v > 0 || this.editedCustomerOrgExp[index].current || 'Value must be greater than 0',
        (v) => v < 100 || 'Value must be less than 100'
      ] // rules for years of experience
    };
  },
  methods: {
    addExperience,
    deleteExperience,
    getRequiredRules,
    isDuplicate,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
