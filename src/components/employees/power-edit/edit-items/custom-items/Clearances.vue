<template>
  <div class="d-flex small-text">
    <!-- Type -->
    <v-autocomplete
      v-model="model['type']"
      autofocus
      :rules="getRequiredRules()"
      :items="clearanceTypes"
      label="Type"
      variant="underlined"
      class="field"
    ></v-autocomplete>
    <!-- Granted Date -->
    <v-text-field
      :model-value="format(model.grantedDate, null, FORMATTED_ISOFORMAT)"
      label="Granted Date"
      class="small-field mx-4"
      :rules="[...getDateOptionalRules()]"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      variant="underlined"
      :disabled="model.awaitingClearance"
      @update:focused="model.grantedDate = parseEventDate()"
      @keypress="showGrantedMenu = false"
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
    <!-- Submission Date -->
    <v-text-field
      :model-value="format(model.submissionDate, null, FORMATTED_ISOFORMAT)"
      label="Submission Date"
      :rules="[...getDateOptionalRules()]"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      variant="underlined"
      class="small-field"
      @update:focused="model.submissionDate = parseEventDate()"
      @keypress="model.showSubmissionMenu = false"
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
    <!-- Badge Number -->
    <v-text-field
      v-model="model.badgeNum"
      counter="5"
      label="Badge Number"
      variant="underlined"
      class="small-field mx-4"
      @update:model-value="model.badgeNum = model.badgeNum ? model.badgeNum.toUpperCase() : undefined"
    ></v-text-field>
    <!-- Badge Expiration Date -->
    <v-text-field
      :model-value="format(model.badgeExpirationDate, null, FORMATTED_ISOFORMAT)"
      label="Badge Exp. Date"
      :rules="[...getDateOptionalRules()]"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      variant="underlined"
      class="small-field"
      :disabled="model.awaitingClearance"
      @update:focused="model.badgeExpirationDate = parseEventDate()"
      @keypress="showBadgeMenu = false"
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
    <v-text-field v-model="cityModel" label="BI Dates" variant="underlined" class="field mx-4"></v-text-field>
    <!-- Adjudication Dates -->
    <v-text-field v-model="cityModel" label="Adjudication Dates" variant="underlined" class="field"></v-text-field>
    <!-- Polygraph Dates -->
    <v-text-field v-model="cityModel" label="Poly Dates" variant="underlined" class="field mx-4"></v-text-field>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';
import { mask } from 'vue-the-mask';
import { format, isBefore, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import { getDateOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');
const vMask = (a, b) => mask(a, b);
const model = ref(props.item[props.field.key]?.[0] || {});
const clearanceTypes = ref(['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret']); // autocomplete clearance type options
const showGrantedMenu = ref(false);
const showSubmissionMenu = ref(false);
const showBadgeMenu = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [model.value],
  () => {
    let val = _.cloneDeep(props.item[props.field.key]);
    if (_.isEmpty(props.item[props.field.key])) val = [model.value];
    else val[0] = model.value;
    emitter.emit('update-item', {
      field: props.field,
      item: { ...props.item, [`${props.field.key}`]: val }
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
  if (!_.isEmpty(model.value.polyDates) || !_.isEmpty(model.value.adjudicationDates)) {
    let dates = [...(model.value.polyDates ?? []), ...(model.value.adjudicationDates ?? [])];
    let earliest = _.sortBy(dates, (d) => format(d, null, DEFAULT_ISOFORMAT));
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
} // parseEventDate
</script>

<style scoped>
.field {
  width: 165px !important;
  min-width: 165px !important;
  max-width: 165px !important;
}
.small-field {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}
.small-text * {
  font-size: 14px !important;
}
</style>
