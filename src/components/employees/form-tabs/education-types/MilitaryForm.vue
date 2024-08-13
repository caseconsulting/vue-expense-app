<template>
  <div :class="parser ? 'gray-border py-3' : ''">
    <div v-for="i in [0]" :key="i">
      <!-- Name of Branch -->
      <v-autocomplete
        ref="formFields"
        :items="dodForces"
        v-model="military.branch"
        :rules="getRequiredRules()"
        label="Military Branch"
        variant="underlined"
        auto-select-first
        clearable
      ></v-autocomplete>
      <v-row>
        <v-col cols="12" sm="6">
          <!-- Starting Date -->
          <v-text-field
            ref="formFields"
            :model-value="format(military.startDate, null, 'MM/YYYY')"
            :rules="getDateMonthYearOptionalRules()"
            label="Starting Date"
            hint="MM/YYYY format"
            v-mask="'##/####'"
            variant="underlined"
            prepend-icon="mdi-calendar"
            @update:focused="military.startDate = parseEventDate($event)"
            @click:prepend="military.showStartMenu = true"
            @keypress="military.showStartMenu = false"
            clearable
            persistent-hint
            autocomplete="off"
          >
            <v-menu
              activator="parent"
              v-model="military.showStartMenu"
              :close-on-content-click="false"
              :attach="isAttached"
              location="start center"
            >
              <v-date-picker
                v-model="military.startDate"
                @update:model-value="military.showStartMenu = false"
                show-adjacent-months
                hide-actions
                keyboard-icon=""
                color="#bc3825"
                title="Starting Date"
              ></v-date-picker>
            </v-menu>
          </v-text-field>
          <!-- End Starting Date -->
        </v-col>

        <!-- Completed Date -->
        <v-col cols="12" sm="6">
          <v-text-field
            ref="formFields"
            :model-value="format(military.completeDate, null, 'MM/YYYY')"
            :rules="getDateMonthYearOptionalRules()"
            label="Completion Date"
            hint="MM/YYYY format"
            v-mask="'##/####'"
            variant="underlined"
            prepend-icon="mdi-calendar"
            @update:focused="military.completeDate = parseEventDate($event)"
            @click:prepend="military.showCompleteMenu = true"
            @keypress="military.showCompleteMenu = false"
            clearable
            persistent-hint
            autocomplete="off"
          >
            <v-menu
              activator="parent"
              v-model="military.showCompleteMenu"
              :close-on-content-click="false"
              :attach="isAttached"
              location="start center"
            >
              <v-date-picker
                v-model="military.completeDate"
                @update:model-value="military.showCompleteMenu = false"
                show-adjacent-months
                hide-actions
                keyboard-icon=""
                color="#bc3825"
                title="Completion Date"
              ></v-date-picker>
            </v-menu>
          </v-text-field>
        </v-col>
        <!-- End Completed Date -->
      </v-row>
    </div>
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
</template>

<script>
import _isArray from 'lodash/isArray';
import _cloneDeep from 'lodash/cloneDeep';
import { mask } from 'vue-the-mask';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { format, isBefore } from '@/shared/dateUtils';
import { asyncForEach } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Rules for submitting dates relative to each other, for
 * start and end dates of service.
 *
 * @return String if the completion date is before the start date
 */
function dateSubmissionRules() {
  return this.military.startDate && this.military.completeDate
    ? isBefore(this.military.startDate, this.military.completeDate) || 'Completion date must be after start date'
    : true;
}

/**
 * Emits confirmation to resume parser.
 *
 * @param include - whether or not to include this education
 */
function emitToParser(include) {
  this.emitter.emit(include ? 'confirm' : 'deny', {
    index: this.militaryIndex,
    value: include ? this.military : undefined
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
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });
  this.emitter.emit('doneValidatingEducation', {
    content: this.military,
    index: this.militaryIndex,
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
  props: ['parser', 'service', 'militaryIndex', 'validating', 'attach', 'index'],
  directives: { mask },
  computed: {
    isAttached
  },
  methods: {
    dateSubmissionRules,
    emitToParser,
    format,
    getDateMonthYearOptionalRules,
    getRequiredRules,
    isBefore,
    parseEventDate,
    validateFields
  },
  data() {
    return {
      dodForces: ['Army', 'Marine Corps', 'Navy', 'Air Force', 'Space Force', 'Coast Guard', 'National Guard'], // subject to change per Paul
      military: { ..._cloneDeep(this.$props.service), showStartMenu: false, showCompleteMenu: false }
    };
  },
  watch: {
    validating: watchValidating
  }
};
</script>
