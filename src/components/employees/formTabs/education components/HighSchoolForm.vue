<template>
  <div :class="parser ? 'gray-border py-3' : ''">
    <div v-for="i in [0]" :key="i">
      <!-- Name of School -->
      <v-text-field
        ref="formFields"
        v-model="highSchool.name"
        :rules="getRequiredRules()"
        label="High School"
        clearable
      ></v-text-field>
      <!-- Received Date -->
      <v-menu
        v-model="highSchool.showReceivedMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            :value="highSchool.gradDate | formatDateMonthYear"
            ref="formFields"
            :rules="getDateMonthYearRules()"
            label="Graduation Date"
            prepend-icon="event_available"
            hint="MM/YYYY format"
            v-mask="'##/####'"
            persistent-hint
            v-on="on"
            @blur="highSchool.gradDate = parseEventDate($event)"
            clearable
            @input="highSchool.showReceivedMenu = false"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="highSchool.gradDate"
          no-title
          @input="highSchool.showReceivedMenu = false"
          type="month"
        ></v-date-picker>
      </v-menu>
      <!-- End Received Date -->
      <!-- Resume Parser Buttons -->
      <div v-if="parser" class="center">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" large right color="red" @click="emitToParser(false)">close</v-icon>
          </template>
          <span>Ignore Pending Change</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" large left color="green" @click="emitToParser(true)">done</v-icon>
          </template>
          <span>Add Pending Change</span>
        </v-tooltip>
      </div>
      <!-- End Resume Parser Buttons -->
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import { getDateMonthYearRules, getRequiredRules } from '@/shared/validationUtils.js';
import { formatDateMonthYear, parseDateMonthYear } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits confirmation to resume parser
 *
 * @input include - whether or not to include this education
 */
function emitToParser(include) {
  this.$emit(include ? 'confirm' : 'deny', include ? this.highSchool : undefined);
} // emitToParser

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.parseDateMonthYear(event.target.value);
} // parseEventDate

/**
 * Validate all input fields are valid.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  window.EventBus.$emit('doneValidatingEducation', this.highSchool, this.schoolIndex, errorCount); // emit done validating
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating() {
  if (this.validating) this.validateFields();
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                     EXPORT                       |
// |                                                  |
// |--------------------------------------------------|

export default {
  props: ['parser', 'school', 'schoolIndex', 'validating'],
  directives: { mask },
  filters: {
    formatDateMonthYear
  },
  methods: {
    emitToParser,
    parseDateMonthYear,
    parseEventDate,
    validateFields,
    getDateMonthYearRules,
    getRequiredRules
  },
  data() {
    return {
      highSchool: { ..._.cloneDeep(this.$props.school), showReceivedMenu: false }
    };
  },
  watch: {
    validating: watchValidating
  }
};
</script>
