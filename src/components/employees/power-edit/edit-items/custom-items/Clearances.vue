<template>
  <div class="d-flex clearance-power-edit">
    <!-- Type -->
    <v-autocomplete
      v-model="model.type"
      :rules="getRequiredRules()"
      :items="clearanceTypes"
      label="Type"
      variant="underlined"
      class="field"
    ></v-autocomplete>
    <!-- Submission Date -->
    <v-text-field
      :model-value="format(model.submissionDate, null, FORMATTED_ISOFORMAT)"
      label="Submission Date"
      :rules="[...getDateOptionalRules(), ...getDateSubmissionRules(model)]"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      variant="underlined"
      class="small-field mx-4"
      @update:focused="model.submissionDate = parseEventDate()"
      @keypress="showSubmissionMenu = false"
      autocomplete="off"
    >
      <v-menu activator="parent" v-model="showSubmissionMenu" :close-on-content-click="false" location="start center">
        <v-date-picker
          v-model="model.submissionDate"
          @update:model-value="showSubmissionMenu = false"
          :max="maxSubmission()"
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="Submission Date"
        ></v-date-picker>
      </v-menu>
    </v-text-field>
    <!-- Granted Date -->
    <v-text-field
      :model-value="format(model.grantedDate, null, FORMATTED_ISOFORMAT)"
      label="Granted Date"
      class="small-field"
      :rules="[...getDateOptionalRules(), ...getDateGrantedRules(model)]"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      variant="underlined"
      :disabled="model.awaitingClearance"
      @update:focused="model.grantedDate = parseEventDate()"
      @keypress="showGrantedMenu = false"
      autocomplete="off"
    >
      <v-menu activator="parent" v-model="showGrantedMenu" :close-on-content-click="false" location="start center">
        <v-date-picker
          v-model="model.grantedDate"
          @update:model-value="showGrantedMenu = false"
          :min="model.submissionDate"
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="Granted Date"
        ></v-date-picker>
      </v-menu>
    </v-text-field>
    <!-- Badge Number -->
    <v-text-field
      v-model="model.badgeNum"
      maxlength="5"
      counter
      hide-details="auto"
      :rules="[getBadgeNumberRules(model)]"
      label="Badge Number"
      variant="underlined"
      class="small-field mx-4"
      :disabled="model.awaitingClearance"
      @update:focused="model.badgeNum = model.badgeNum ? model.badgeNum.toUpperCase() : undefined"
    ></v-text-field>
    <!-- Badge Expiration Date -->
    <v-text-field
      :model-value="format(model.badgeExpirationDate, null, FORMATTED_ISOFORMAT)"
      label="Badge Exp. Date"
      :rules="[...getDateOptionalRules(), ...getDateBadgeRules(model)]"
      validate-on="input"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      variant="underlined"
      class="small-field"
      :disabled="model.awaitingClearance"
      @update:focused="model.badgeExpirationDate = parseEventDate()"
      @keypress="showBadgeMenu = false"
      autocomplete="off"
    >
      <v-menu activator="parent" v-model="showBadgeMenu" :close-on-content-click="false" location="start center">
        <v-date-picker
          v-model="model.badgeExpirationDate"
          @update:model-value="showBadgeMenu = false"
          :min="minExpiration()"
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="Badge Expiration Date"
        ></v-date-picker>
      </v-menu>
    </v-text-field>
    <!-- Background Investigation Dates -->
    <div class="large-field mx-4">
      <v-menu activator="parent" v-model="showBIMenu" :close-on-content-click="false" location="start center">
        <v-date-picker
          v-model="model.biDates"
          :min="model.submissionDate"
          multiple
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="BI Dates"
        >
        </v-date-picker>
      </v-menu>
      <v-combobox
        v-model="model.biDates"
        :model-value="formatDates(model.biDates)"
        :rules="[...getDatesArrayOptionalRules(), ...getAfterSubmissionRules(model)]"
        multiple
        label="BI Dates"
        v-mask="'##/##/####'"
        variant="underlined"
        @keypress="showBIMenu = false"
        @update:modelValue="model.biDates = parseDates(model.biDates)"
      >
        <template v-slot:selection="{ item }">
          <v-chip variant="outlined" size="x-small" closable @click:close="removeDate(item, 'biDates')">{{
            item.raw
          }}</v-chip>
        </template>
      </v-combobox>
    </div>
    <!-- Adjudication Dates -->
    <div class="large-field">
      <v-menu activator="parent" v-model="showAdjudicationMenu" :close-on-content-click="false" location="start center">
        <v-date-picker
          v-model="model.adjudicationDates"
          :min="model.submissionDate"
          multiple
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="Adjudication Dates"
        >
        </v-date-picker>
      </v-menu>
      <v-combobox
        v-model="model.adjudicationDates"
        :model-value="formatDates(model.adjudicationDates)"
        :rules="[...getDatesArrayOptionalRules(), ...getAfterSubmissionRules(model)]"
        multiple
        v-mask="'##/##/####'"
        label="Adjudication Dates"
        variant="underlined"
        @keypress="showAdjudicationMenu = false"
        @update:modelValue="model.adjudicationDates = parseDates(model.adjudicationDates)"
      >
        <template v-slot:selection="{ item }">
          <v-chip variant="outlined" size="x-small" closable @click:close="removeDate(item, 'adjudicationDates')">{{
            item.raw
          }}</v-chip>
        </template>
      </v-combobox>
    </div>
    <!-- Polygraph Dates -->
    <div class="large-field mx-4">
      <v-menu activator="parent" v-model="showPolyMenu" :close-on-content-click="false" location="start center">
        <v-date-picker
          v-model="model.polyDates"
          :min="model.submissionDate"
          multiple
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          title="Poly Dates"
        >
        </v-date-picker>
      </v-menu>
      <v-combobox
        v-model="model.polyDates"
        :model-value="formatDates(model.polyDates)"
        :rules="[...getDatesArrayOptionalRules(), ...getAfterSubmissionRules(model)]"
        multiple
        v-mask="'##/##/####'"
        label="Poly Dates"
        variant="underlined"
        @keypress="showPolyMenu = false"
        @update:modelValue="model.polyDates = parseDates(model.polyDates)"
      >
        <template v-slot:selection="{ item }">
          <v-chip variant="outlined" size="x-small" closable @click:close="removeDate(item, 'polyDates')">{{
            item.raw
          }}</v-chip>
        </template>
      </v-combobox>
    </div>
    <!-- Awaiting Clearance -->
    <v-checkbox
      v-model="model.awaitingClearance"
      hide-details
      class="field"
      label="Awaiting Clearance"
      @update:model-value="
        () => {
          if (model.awaitingClearance) {
            model.grantedDate = null;
            model.badgeExpirationDate = null;
            model.badgeNum = null;
          }
        }
      "
    >
    </v-checkbox>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { mask } from 'vue-the-mask';
import { format, isBefore, isValid, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import {
  getBadgeNumberRules,
  getAfterSubmissionRules,
  getDateBadgeRules,
  getDateGrantedRules,
  getDateOptionalRules,
  getDateSubmissionRules,
  getDatesArrayOptionalRules,
  getRequiredRules
} from '@/shared/validationUtils.js';
import { isEmpty } from '@/utils/utils.js';
import _cloneDeep from 'lodash/cloneDeep';
import _sortBy from 'lodash/sortBy';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');
const vMask = (a, b) => mask(a, b);
const model = ref(
  props.item[props.field.key]?.[0] || {
    adjudicationDates: [],
    awaitingClearance: false,
    badgeExpirationDate: null,
    biDates: [],
    grantedDate: null,
    polyDates: [],
    reinvestigation: false,
    reinvestigationSubmissionDate: null,
    submissionDate: null,
    type: null
  }
);
const clearanceTypes = ref(['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret']); // autocomplete clearance type options
const showGrantedMenu = ref(false);
const showSubmissionMenu = ref(false);
const showReinvestigationMenu = ref(false);
const showBadgeMenu = ref(false);
const showBIMenu = ref(false);
const showAdjudicationMenu = ref(false);
const showPolyMenu = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [model.value],
  () => {
    let clearances = _cloneDeep(props.item[props.field.key]);
    if (isEmpty(props.item[props.field.key])) clearances = [model.value];
    else clearances[0] = model.value;
    emitter.emit('update-item', {
      field: props.field,
      item: { ...props.item, [`${props.field.key}`]: clearances }
    });
  },
  { deep: true }
);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Formats multiple dates at once in MM/DD/YYYY format.
 * @return Array - The array of formatted dates
 */
function formatDates(array) {
  let formattedDates = [];
  array.forEach((date) => {
    formattedDates.push(format(date, null, FORMATTED_ISOFORMAT));
  });
  return formattedDates;
}

function maxSubmission() {
  let max;
  if (model.value.grantedDate) max = format(model.value.grantedDate, null, DEFAULT_ISOFORMAT);
  if (!isEmpty(model.value.polyDates) || !isEmpty(model.value.adjudicationDates)) {
    let dates = [...(model.value.polyDates ?? []), ...(model.value.adjudicationDates ?? [])];
    let earliest = _sortBy(dates, (d) => format(d, null, DEFAULT_ISOFORMAT));
    if (isBefore(earliest, max)) max = earliest;
  }
  return max;
}

function minExpiration() {
  if (model.value.grantedDate) return model.value.grantedDate;
  else if (model.value.submissionDate) return model.value.submissionDate;
}

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return format(event.target.value, FORMATTED_ISOFORMAT, DEFAULT_ISOFORMAT);
}

/**
 * Parse the dates after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseDates(array) {
  let validDates = array.filter((d) => isValid(d, FORMATTED_ISOFORMAT));
  return validDates.map((date) => format(date, FORMATTED_ISOFORMAT, DEFAULT_ISOFORMAT));
}

/**
 * Removes the desired BI date from the clearance.
 *
 * @param item - the date to remove
 * @param items - the array of dates
 */
function removeDate(item, key) {
  item = item.raw;
  const itemDate = format(item, null, FORMATTED_ISOFORMAT);
  model.value[key] = model.value[key].filter((date) => {
    let dateConvert = format(date, null, FORMATTED_ISOFORMAT);
    return dateConvert !== itemDate;
  });
}
</script>

<style scoped>
.field {
  width: 165px !important;
  min-width: 165px !important;
  max-width: 165px !important;
}
.large-field {
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
}
.small-field {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}
.small-text .v-field__input {
  font-size: 10px !important;
}
</style>

<style>
.clearance-power-edit .v-field__input {
  font-size: 14px !important;
}
.clearance-power-edit .v-label {
  font-size: 13px !important;
}
</style>
