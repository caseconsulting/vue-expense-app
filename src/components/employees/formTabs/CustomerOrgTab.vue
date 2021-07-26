<template>
  <div>
    <!-- Loop Customer Organization -->
    <div
      v-for="(exp, index) in editedCustomerOrgExp"
      class="pt-3 pb-1 px-5"
      :key="'exp: ' + exp.name + index"
      style="border: 1px solid grey"
    >
      <!-- Name of Customer Organization -->
      <v-autocomplete
        ref="formFields"
        v-model="exp.name"
        :rules="requiredRules"
        :items="experienceDropDown"
        label="Customer Organization Experience"
        data-vv-name="Customer Organization Experience"
        clearable
      >
      </v-autocomplete>

      <v-row align="center" class="py-3" justify="center">
        <!-- Current Switch -->
        <v-col cols="6" sm="7" md="6" lg="7">
          <v-switch v-model="exp.current" label="Currently working with this customer organization"></v-switch>
        </v-col>

        <!-- Years of Experience -->
        <v-col
          cols="4"
          sm="3"
          md="4"
          lg="3"
          class="px-0 pb-0"
          :class="{ 'px-4': $vuetify.breakpoint.sm, 'px-4': $vuetify.breakpoint.lg }"
        >
          <v-text-field
            ref="formFields"
            v-model="exp.years"
            flat
            :rules="experienceRequired"
            single-line
            max="99"
            min="0"
            suffix="years"
            dense
            type="number"
            outlined
          ></v-text-field>
        </v-col>

        <!-- Button to Delete Customer Organization -->
        <v-col cols="2" class="mb-3" align="center">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="deleteExperience(index)" text icon
                ><v-icon style="color: grey" class="pr-1">delete</v-icon></v-btn
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
import api from '@/shared/api.js';
import _ from 'lodash';
import { formatDateDashToSlash, formatDateSlashToDash, isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'customerOrgExp'); // emit customer organization tab was created
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
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
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let errorCount = 0;
  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    _.forEach(this.$refs.formFields, (field) => {
      if (!field.validate()) {
        errorCount++;
      }
    });
  }
  window.EventBus.$emit('doneValidating', 'customerOrgExp', this.editedCustomerOrgExp); // emit done validating and send edited data to parent
  window.EventBus.$emit('customerOrgExpStatus', errorCount); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
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
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for a required date
      editedCustomerOrgExp: _.cloneDeep(this.model), //stores edited customer orgs info
      experienceRequired: [
        (v) => !isEmpty(v) || 'This field is required',
        (v) => v >= 0 || 'Value cannot be negative',
        (v) => v < 100 || 'Value must be less than 100'
      ], // rules for years of experience
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for a required field
    };
  },
  methods: {
    addExperience,
    deleteExperience,
    formatDateSlashToDash,
    formatDateDashToSlash,
    isEmpty,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: function (val) {
      if (val) {
        // parent component triggers validation
        this.validateFields();
      }
    }
  }
};
</script>
