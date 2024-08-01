<template>
  <v-form ref="form" validate-on="lazy">
    <v-row v-for="(clearance, cIndex) in editedEmployee.clearances" :key="cIndex">
      <v-col>
        <v-row v-if="!isMobile()">
          <v-col>
            <v-autocomplete
              v-model="clearance.type"
              :rules="[...getRequiredRules(), ...getDuplicateClearanceRules(editedEmployee.clearances)]"
              :items="CLEARANCE_TYPES"
              label="Type"
              data-vv-name="Type"
              clearable
            >
              <template #append>
                <!-- Awaiting Clearance -->
                <v-checkbox
                  v-model="clearance.awaitingClearance"
                  density="compact"
                  class="mx-xs-0 mx-sm-0 mx-md-5"
                  hide-details
                  label="Awaiting Clearance"
                  @update:model-value="
                    () => {
                      if (clearance.awaitingClearance) {
                        clearance.grantedDate = null;
                        clearance.badgeExpirationDate = null;
                        clearance.badgeNum = null;
                      }
                    }
                  "
                >
                  <template #label v-if="name === 'xs' || name === 'sm'">
                    <span class="small-text">Awaiting Clearance</span>
                  </template>
                </v-checkbox>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="1">
            <v-btn variant="text" icon="" @click="deleteClearance(cIndex)">
              <v-tooltip activator="parent" location="bottom">Delete Clearance</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon></v-btn
            >
          </v-col>
        </v-row>

        <!-- MOBILE LAYOUT -->
        <v-row v-else>
          <v-col cols="10">
            <v-autocomplete
              v-model="clearance.type"
              :rules="[...getRequiredRules(), ...getDuplicateClearanceRules(editedEmployee.clearances)]"
              :items="CLEARANCE_TYPES"
              label="Type"
              data-vv-name="Type"
              clearable
            ></v-autocomplete>
          </v-col>

          <v-col cols="2" class="mt-1">
            <v-btn variant="text" icon="" @click="deleteClearance(cIndex)">
              <v-tooltip activator="parent" location="bottom">Delete Clearance</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon></v-btn
            >
          </v-col>

          <v-col cols="1"></v-col>

          <v-col class="groove">
            <!-- Awaiting Clearance -->
            <v-checkbox
              v-model="clearance.awaitingClearance"
              density="compact"
              hide-details
              label="Awaiting Clearance"
              @update:model-value="
                () => {
                  if (clearance.awaitingClearance) {
                    clearance.grantedDate = null;
                    clearance.badgeExpirationDate = null;
                    clearance.badgeNum = null;
                  }
                }
              "
            >
              <template #label v-if="name === 'xs' || name === 'sm'">
                <span class="small-text">Awaiting Clearance</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
        <!-- END MOBILE LAYOUT -->

        <v-row class="mb-6">
          <v-col cols="1"></v-col>
          <v-col>
            <v-row class="groove">
              <v-col :cols="isMobile() ? '12' : '4'">
                <v-text-field
                  :model-value="format(clearance.submissionDate, null, 'MM/DD/YYYY')"
                  label="Submission Date"
                  clearable
                  :rules="[...getDateOptionalRules(), ...getDateSubmissionRules(clearance)]"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  prepend-inner-icon="mdi-calendar"
                  @click:clear="clearance.submissionDate = null"
                  @click:prepend="clearance.showSubmissionMenu = true"
                  @keypress="clearance.showSubmissionMenu = false"
                  autocomplete="off"
                >
                  <v-menu
                    activator="parent"
                    v-model="clearance.showSubmissionMenu"
                    :close-on-content-click="false"
                    location="start center"
                  >
                    <v-date-picker
                      v-model="clearance.submissionDate"
                      @update:model-value="clearance.showSubmissionMenu = false"
                      :max="maxSubmission(cIndex)"
                      show-adjacent-months
                      hide-actions
                      keyboard-icon=""
                      color="#bc3825"
                      title="Submission Date"
                    ></v-date-picker>
                  </v-menu>
                </v-text-field>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <v-menu
                  activator="parent"
                  v-model="clearance.showGrantedMenu"
                  :close-on-content-click="false"
                  location="start center"
                >
                  <v-date-picker
                    v-model="clearance.grantedDate"
                    @update:model-value="clearance.showGrantedMenu = false"
                    :min="clearance.submissionDate"
                    show-adjacent-months
                    hide-actions
                    keyboard-icon=""
                    color="#bc3825"
                    title="Granted Date"
                  ></v-date-picker>
                </v-menu>

                <v-text-field
                  :model-value="format(clearance.grantedDate, null, 'MM/DD/YYYY')"
                  label="Granted Date"
                  clearable
                  :rules="[...getDateOptionalRules(), ...getDateGrantedRules(clearance)]"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  :disabled="clearance.awaitingClearance"
                  @change="
                    () => {
                      if (clearance.grantedDate) clearance.awaitingClearance = false;
                    }
                  "
                  prepend-inner-icon="mdi-calendar"
                  @click:clear="clearance.grantedDate = null"
                  @update:focused="clearance.grantedDate = parseEventDate()"
                  @keypress="clearance.showGrantedMenu = false"
                >
                </v-text-field>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <v-text-field
                  v-model="clearance.badgeNum"
                  prepend-inner-icon="mdi-badge-account-outline"
                  clearable
                  maxlength="5"
                  counter
                  hide-details="auto"
                  :rules="[getBadgeNumberRules(clearance)]"
                  label="Badge Number"
                  :disabled="clearance.awaitingClearance"
                  @update:focused="capitalizeBadges(clearance)"
                ></v-text-field>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <v-text-field
                  :model-value="format(clearance.badgeExpirationDate, null, 'MM/DD/YYYY')"
                  label="Badge Expiration Date"
                  clearable
                  :rules="[...getDateOptionalRules(), ...getDateBadgeRules(clearance)]"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  :disabled="clearance.awaitingClearance"
                  prepend-inner-icon="mdi-calendar"
                  @click:clear="clearance.badgeExpirationDate = null"
                  @update:focused="clearance.badgeExpirationDate = parseEventDate()"
                  @keypress="clearance.showBadgeMenu = false"
                  @click:prepend="clearance.showBadgeMenu = true"
                  autocomplete="off"
                >
                  <v-menu
                    activator="parent"
                    v-model="clearance.showBadgeMenu"
                    :close-on-content-click="false"
                    location="start center"
                  >
                    <v-date-picker
                      v-model="clearance.badgeExpirationDate"
                      @update:model-value="clearance.showBadgeMenu = false"
                      :min="minExpiration(cIndex)"
                      show-adjacent-months
                      hide-actions
                      keyboard-icon=""
                      color="#bc3825"
                      title="Badge Expiration Date"
                    ></v-date-picker>
                  </v-menu>
                </v-text-field>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <v-menu
                  activator="parent"
                  ref="biMenu"
                  v-model="clearance.showBIMenu"
                  :close-on-content-click="false"
                  location="start center"
                >
                  <v-date-picker
                    v-model="clearance.biDates"
                    :min="clearance.submissionDate"
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
                  :model-value="formatDates(clearance.biDates)"
                  multiple
                  label="BI Dates"
                  readonly
                  clearable
                  prepend-inner-icon="mdi-calendar"
                  @click:clear="clearance.biDates = []"
                >
                  <template v-slot:selection="{ item }">
                    <v-chip variant="outlined" closable @click:close="removeBiDate(item, cIndex)">{{
                      item.raw
                    }}</v-chip>
                  </template>
                </v-combobox>
              </v-col>
              <v-col :cols="isMobile() ? '12' : '4'">
                <v-menu
                  activator="parent"
                  ref="adjudicationMenu"
                  v-model="clearance.showAdjudicationMenu"
                  :close-on-content-click="false"
                  location="start center"
                >
                  <v-date-picker
                    v-model="clearance.adjudicationDates"
                    :min="clearance.submissionDate"
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
                  :model-value="formatDates(clearance.adjudicationDates)"
                  multiple
                  label="Adjudication Dates"
                  clearable
                  readonly
                  prepend-inner-icon="mdi-calendar"
                  @click:clear="clearance.adjudicationDates = []"
                >
                  <template #selection="{ item }">
                    <v-chip variant="outlined" closable @click:close="removeAdjDate(item, cIndex)">{{
                      item.raw
                    }}</v-chip>
                  </template>
                </v-combobox>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <v-menu
                  activator="parent"
                  ref="polyMenu"
                  v-model="clearance.showPolyMenu"
                  :close-on-content-click="false"
                  location="start center"
                >
                  <v-date-picker
                    v-model="clearance.polyDates"
                    :min="clearance.submissionDate"
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
                  :model-value="formatDates(clearance.polyDates)"
                  multiple
                  label="Poly Dates"
                  clearable
                  readonly
                  prepend-inner-icon="mdi-calendar"
                  @click:clear="clearance.polyDates = []"
                  @click:prepend="clearance.showPolyMenu = true"
                >
                  <template #selection="{ item }">
                    <v-chip variant="outlined" closable @click:close="removePolyDate(item, cIndex)">{{
                      item.raw
                    }}</v-chip>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
      <v-divider :thickness="4" class="border-opacity-25"></v-divider>
    </v-row>
    <v-row>
      <v-col align="center">
        <v-btn @click="addClearance()"><v-icon>mdi-plus</v-icon>Clearance</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { DEFAULT_ISOFORMAT, format, FORMATTED_ISOFORMAT, isBefore } from '@/shared/dateUtils';
import { CLEARANCE_TYPES } from '@/shared/employeeUtils';
import {
  getBadgeNumberRules,
  getDateBadgeRules,
  getDateGrantedRules,
  getDateOptionalRules,
  getDateSubmissionRules,
  getDuplicateClearanceRules,
  getRequiredRules
} from '@/shared/validationUtils';
import _ from 'lodash';
import { inject, onBeforeUnmount, ref } from 'vue';
import { mask } from 'vue-the-mask';
import { useDisplay } from 'vuetify/lib/framework.mjs';
import { isMobile } from '../../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const ISOFORMAT = 'YYYY-MM-DD';

const { name } = useDisplay();
const emitter = inject('emitter');
const vMask = mask; // custom directive

const editedEmployee = defineModel({ required: true });
const form = ref(null); // template ref

defineExpose({ prepareSubmit });

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeUnmount(prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  if (form.value) {
    const result = await form.value.validate();
    emitter.emit('validating', { tab: 'clearance', valid: result.valid });
    return result;
  }
  return null;
}

/**
 * Adds a clearance.
 */
function addClearance() {
  if (!editedEmployee.value.clearances) editedEmployee.value.clearances = [];
  editedEmployee.value.clearances.push({
    adjudicationDates: [],
    awaitingClearance: false,
    biDates: [],
    badgeExpirationDate: null,
    grantedDate: null,
    polyDates: [],
    showAdjudicationMenu: false,
    showBadgeMenu: false,
    showBIMenu: false,
    showGrantedMenu: false,
    showPolyMenu: false,
    showSubmissionMenu: false,
    submissionDate: null,
    type: null
  });
} // addClearance

/**
 * Capitalize all badge numbers.
 *
 * @param clearance - The clearance object of the badge to capitalize
 */
function capitalizeBadges(clearance) {
  if (clearance.badgeNum) {
    clearance.badgeNum = clearance.badgeNum.toUpperCase();
  }
} // capitalizeBadges

/**
 * Deletes a clearance.
 *
 * @param cIndex - array index of clearance to remove.
 */
function deleteClearance(cIndex) {
  editedEmployee.value.clearances.splice(cIndex, 1);
} // deleteClearance

/**
 * Formats multiple dates at once in MM/DD/YYYY format.
 * @return Array - The array of formatted dates
 */
function formatDates(array) {
  let formattedDates = [];
  array.forEach((date) => {
    formattedDates.push(format(date, null, 'MM/DD/YYYY'));
  });
  return formattedDates;
} // formatDates

/**
 * Return the maximum available date to be selected for submission date. Returns the granted date if it exists.
 * Returns null if the granted date doesn't exist.
 *
 * @param cIndex - array index of clearance
 * @return string - maximum (latest possible) date
 */
function maxSubmission(cIndex) {
  let max;
  if (editedEmployee.value.clearances[cIndex].grantedDate) {
    // submission date is before granted date
    max = format(editedEmployee.value.clearances[cIndex].grantedDate, null, DEFAULT_ISOFORMAT);
  }

  // check submission date is before any poly dates
  if (!_.isEmpty(editedEmployee.value.clearances[cIndex].polyDates)) {
    // poly dates exist
    let earliest = _.first(
      // get earliest poly date
      _.sortBy(editedEmployee.value.clearances[cIndex].polyDates, (date) => {
        // sort poly dates
        return format(date, null, ISOFORMAT);
      })
    );

    if (isBefore(earliest, max)) {
      // poly date is earliest date
      max = earliest; // update max date
    }
  }

  // check submission date is before any adjudication dates
  if (!_.isEmpty(editedEmployee.value.clearances[cIndex].adjudicationDates)) {
    // adjudication dates exist
    let earliest = _.first(
      // get earliest adjudication date
      _.sortBy(editedEmployee.value.clearances[cIndex].adjudicationDates, (date) => {
        // sort adjudication dates
        return format(date, null, ISOFORMAT);
      })
    );
    if (isBefore(earliest, max)) {
      // adjudication date is earliest date
      max = earliest; // update max date
    }
  }

  return max ? format(max, null, ISOFORMAT) : null;
} // maxSubmission

/**
 * Return the minimum available date to be selected for expiration date. Returns the granted date if it exists.
 * Returns the submission date if the submission date exists and the granted date does not exists. Returns null if
 * neither the granted date or submission date exist.
 *
 * @param cIndex - array index of clearance
 * @return string - minimum (earliest possible) date
 */
function minExpiration(cIndex) {
  if (editedEmployee.value.clearances[cIndex].grantedDate) {
    return editedEmployee.value.clearances[cIndex].grantedDate;
  } else if (editedEmployee.value.clearances[cIndex].submissionDate) {
    return editedEmployee.value.clearances[cIndex].submissionDate;
  }
} // minExpiration

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
} // parseEventDate

/**
 * Removes the desired date from the right clearance.
 *
 * @param item - the date to remove
 * @param index - the clearance index
 */
function removeAdjDate(item, index) {
  item = item.raw;
  const itemDate = format(item, null, FORMATTED_ISOFORMAT);
  editedEmployee.value.clearances[index].adjudicationDates = editedEmployee.value.clearances[
    index
  ].adjudicationDates.filter((date) => {
    let dateConvert = format(date, null, FORMATTED_ISOFORMAT);
    return dateConvert !== itemDate;
  });
} // removeAdjDate

/**
 * Removes the desired date from the right clearance.
 *
 * @param item - the date to remove
 * @param index - the clearance index
 */
function removeBiDate(item, index) {
  item = item.raw;
  const itemDate = format(item, null, FORMATTED_ISOFORMAT);
  editedEmployee.value.clearances[index].biDates = editedEmployee.value.clearances[index].biDates.filter((date) => {
    let dateConvert = format(date, null, FORMATTED_ISOFORMAT);
    return dateConvert !== itemDate;
  });
} // removeBiDate

/**
 * Removes the desired date from the right clearance.
 *
 * @param item - the date to remove
 * @param index - the clearance index
 */
function removePolyDate(item, index) {
  item = item.raw;
  const itemDate = format(item, null, FORMATTED_ISOFORMAT);
  editedEmployee.value.clearances[index].polyDates = editedEmployee.value.clearances[index].polyDates.filter((date) => {
    let dateConvert = format(date, null, FORMATTED_ISOFORMAT);
    return dateConvert !== itemDate;
  });
} // removePolyDate
</script>
