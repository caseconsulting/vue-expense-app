<template>
  <div>
    <!-- Loop Awards -->
    <div
      v-for="(award, index) in editedAwards"
      style="border: 1px solid grey"
      class="pt-3 pb-1 px-5"
      :key="'award: ' + award.name + index"
    >
      <!-- Name of Award -->
      <v-combobox
        ref="formFields"
        v-model="award.name"
        :rules="requiredRules"
        label="Award"
        data-vv-name="Award"
        append-outer-icon="delete"
        @click:append-outer="deleteAward(index)"
      >
      </v-combobox>

      <v-row>
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <!-- Received Date -->
          <v-menu
            v-model="award.showReceivedMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="formatDateDashToSlash(award.dateReceived)"
                label="Date Received"
                prepend-icon="event_available"
                :rules="dateRules"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="award.dateReceived"
              no-title
              @input="award.showReceivedMenu = false"
            ></v-date-picker>
          </v-menu>
          <!-- End Received Date -->
        </v-col>
      </v-row>
    </div>
    <!-- Loop Awards -->

    <!-- Button to Add Awards -->
    <div class="pt-4" align="center">
      <v-btn @click="addAward()"><v-icon class="pr-1">add</v-icon>Award</v-btn>
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
  window.EventBus.$emit('created', 'awards'); // emit awards tab was created
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add an award.
 */
function addAward() {
  this.editedAwards.push({
    name: null,
    dateReceived: null,
    expirationDate: null,
    showReceivedMenu: false,
    showExpirationMenu: false
  });
} // addAward

/**
 * Delete an award.
 */
function deleteAward(index) {
  this.editedAwards.splice(index, 1);
} // deleteAward

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;

  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    let error = _.find(this.$refs.formFields, (field) => {
      return !field.validate();
    });
    hasErrors = _.isNil(error) ? false : true;
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'awards', this.editedAwards); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('awardStatus', hasErrors); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for a required date
      editedAwards: _.cloneDeep(this.model), // stores edited awards info
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for a required field
    };
  },
  methods: {
    addAward,
    deleteAward,
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
