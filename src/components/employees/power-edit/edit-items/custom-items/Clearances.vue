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
    />
    <!-- Submission Date -->
    <date-picker
      v-model="model.submissionDate"
      :max="maxSubmission()"
      :rules="[...getDateOptionalRules(), ...getDateSubmissionRules(model)]"
      :icon="null"
      label="Submission Date"
      class="small-field mx-4"
      show-adjacent-months
      hide-actions
    />
    <!-- Granted Date -->
     <date-picker
      v-model="model.grantedDate"
      :min="model.submissionDate"
      :rules="[...getDateOptionalRules(), ...getDateGrantedRules(model)]"
      :disabled="model.awaitingClearance"
      :icon="null"
      label="Granted Date"
      class="small-field"
      show-adjacent-months
      hide-actions
    />
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
    />
    <!-- Badge Expiration Date -->
    <!-- :model-value="format(model.badgeExpirationDate, null, FORMATTED_ISOFORMAT)" -->
    <date-picker
      v-model="model.badgeExpirationDate"
      label="Badge Exp. Date"
      :min="minExpiration()"
      :rules="[...getDateOptionalRules(), ...getDateBadgeRules(model)]"
      :disabled="model.awaitingClearance"
      :icon="null"
      validate-on="input"
      class="small-field"
      show-adjacent-months
      hide-actions
    />
    <!-- Background Investigation Dates -->
    <div class="large-field mx-4">
      <date-picker
        v-model="model.biDates"
        label="BI Dates"
        :min="model.submissionDate"
        :rules="[...getDatesArrayOptionalRules(), ...getAfterSubmissionRules(model)]"
        :icon="null"
        show-adjacent-months
        closeable-chips
        hide-actions
        multiple
      />
    </div>
    <!-- Adjudication Dates -->
    <div class="large-field">
      <date-picker
        v-model="model.adjudicationDates"
        label="Adjudication Dates"
        :min="model.submissionDate"
        :rules="[...getDatesArrayOptionalRules(), ...getAfterSubmissionRules(model)]"
        :icon="null"
        show-adjacent-months
        closeable-chips
        hide-actions
        multiple
      />
    </div>
    <!-- Polygraph Dates -->
    <div class="large-field mx-4">
      <date-picker
        v-model="model.polyDates"
        label="Poly Dates"
        :min="model.submissionDate"
        :rules="[...getDatesArrayOptionalRules(), ...getAfterSubmissionRules(model)]"
        :icon="null"
        show-adjacent-months
        closeable-chips
        hide-actions
        multiple
      />
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
    />
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { mask } from 'vue-the-mask';
import { format, isBefore, isValid, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import DatePicker from '@/components/shared/DatePicker.vue';
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
import { Clearance } from '@/models/clearance/clearance.js';
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
const model = ref(new Clearance(props.item[props.field.key]?.[0] || {}));
const clearanceTypes = ref(['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret']); // autocomplete clearance type options

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
