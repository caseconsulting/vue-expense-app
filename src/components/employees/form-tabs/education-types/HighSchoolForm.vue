<template>
  <div :class="parser ? 'gray-border py-3' : ''">
    <div v-for="i in [0]" :key="i">
      <!-- Name of School -->
      <v-text-field
        ref="formFields"
        v-model="highSchool.name"
        :rules="getRequiredRules()"
        variant="underlined"
        label="High School"
        clearable
      ></v-text-field>
      <!-- Received Date -->
      <v-menu
        v-model="highSchool.showReceivedMenu"
        :close-on-content-click="false"
        :attach="isAttached"
        location="start center"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            :model-value="format(highSchool.gradDate, null, 'MM/YYYY')"
            ref="formFields"
            :rules="getDateMonthYearOptionalRules()"
            label="Graduation Date"
            hint="MM/YYYY format"
            v-mask="'##/####'"
            persistent-hint
            variant="underlined"
            @blur="highSchool.gradDate = parseEventDate($event)"
            clearable
            @click:prepend="highSchool.showReceivedMenu = true"
            @click:control="highSchool.showReceivedMenu = false"
          >
            <template v-slot:prepend>
              <div v-bind="props" class="pointer">
                <v-icon :color="caseGray">mdi-calendar</v-icon>
              </div>
            </template>
          </v-text-field>
        </template>
        <v-date-picker
          v-model="highSchool.gradDate"
          @update:model-value="highSchool.showReceivedMenu = false"
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="Graduation Date"
        ></v-date-picker>
      </v-menu>
      <!-- End Received Date -->
      <!-- Resume Parser Buttons -->
      <div v-if="parser" class="center">
        <v-btn icon="" variant="text">
          <v-tooltip activator="parent" location="top">Ignore Pending Change</v-tooltip>
          <v-icon size="large" color="red" @click="emitToParser(false)">mdi-close</v-icon>
        </v-btn>
        <v-btn icon="" variant="text">
          <v-tooltip activator="parent" location="top">Add Pending Change</v-tooltip>
          <v-icon size="large" color="green" @click="emitToParser(true)">mdi-check</v-icon>
        </v-btn>
      </div>
      <!-- End Resume Parser Buttons -->
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { format } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits confirmation to resume parser.
 *
 * @param include - whether or not to include this education
 */
function emitToParser(include) {
  this.emitter.emit(include ? 'confirm' : 'deny', {
    index: this.schoolIndex,
    value: include ? this.highSchool : undefined
  });
} // emitToParser

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.format(event.target.value, 'MM/YYYY', 'YYYY-MM');
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

  this.emitter.emit('doneValidatingEducation', {
    content: this.highSchool,
    index: this.schoolIndex,
    errors: errorCount
  }); // emit done validating
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determines if the fields are in modals and should be assign the attached prop.
 */
function isAttached() {
  return this.attach;
} // isAttached

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields.
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
  props: ['parser', 'school', 'schoolIndex', 'validating', 'attach'],
  directives: { mask },
  computed: {
    isAttached
  },
  methods: {
    emitToParser,
    format,
    parseEventDate,
    validateFields,
    getDateMonthYearOptionalRules,
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
