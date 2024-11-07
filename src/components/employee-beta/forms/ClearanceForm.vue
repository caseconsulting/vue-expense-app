<template>
  <div>
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
                <date-picker
                  v-model="clearance.submissionDate"
                  :rules="[...getDateOptionalRules(), ...getDateSubmissionRules(clearance)]"
                  :max="maxSubmission(cIndex)"
                  label="Submission Date"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <date-picker
                  v-model="clearance.grantedDate"
                  :disabled="clearance.awaitingClearance"
                  :rules="[...getDateOptionalRules(), ...getDateGrantedRules(clearance)]"
                  :min="clearance.submissionDate"
                  label="Granted Date"
                  variant="filled"
                  clearable
                ></date-picker>
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
                <date-picker
                  v-model="clearance.badgeExpirationDate"
                  :disabled="clearance.awaitingClearance"
                  :rules="[...getDateOptionalRules(), ...getDateBadgeRules(clearance)]"
                  :min="minExpiration(cIndex)"
                  label="Badge Expiration Date"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <date-picker
                  v-model="clearance.biDates"
                  :min="clearance.submissionDate"
                  label="BI Dates"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <date-picker
                  v-model="clearance.adjudicationDates"
                  :min="clearance.submissionDate"
                  label="Adjudication Dates"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <date-picker
                  v-model="clearance.polyDates"
                  :min="clearance.submissionDate"
                  label="Poly Dates"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>

              <v-col :cols="isMobile() ? '12' : '4'">
                <v-combobox
                  v-model="clearance.grantingOrg"
                  prepend-inner-icon="mdi-lan"
                  :items="grantingOrgItems"
                  label="Granting Organization"
                ></v-combobox>
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
  </div>
</template>

<script setup>
import DatePicker from '@/components/shared/DatePicker.vue';
import { DEFAULT_ISOFORMAT, format, isBefore } from '@/shared/dateUtils';
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
import { isMobile } from '@/utils/utils';
import _first from 'lodash/first';
import _isEmpty from 'lodash/isEmpty';
import _sortBy from 'lodash/sortBy';
import { onMounted, ref } from 'vue';
import { useDisplay } from 'vuetify/lib/framework.mjs';

import { useStore } from 'vuex';
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const { name } = useDisplay();

// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);
const grantingOrgItems = ref(new Set());

// |--------------------------------------------------|
// |                                                  |
// |                    LIFECYCLE                     |
// |                                                  |
// |--------------------------------------------------|
onMounted(() => {
  // get granting org items
  for (let e of store.getters.employees ?? []) {
    for (let c of e.clearances ?? []) {
      if (c.grantingOrg) grantingOrgItems.value.add(c.grantingOrg);
    }
  }
  // sort granting org items a–z
  grantingOrgItems.value = Array.from(grantingOrgItems.value).sort();
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
  if (!_isEmpty(editedEmployee.value.clearances[cIndex].polyDates)) {
    // poly dates exist
    let earliest = _first(
      // get earliest poly date
      _sortBy(editedEmployee.value.clearances[cIndex].polyDates, (date) => {
        // sort poly dates
        return format(date, null, DEFAULT_ISOFORMAT);
      })
    );

    if (isBefore(earliest, max)) {
      // poly date is earliest date
      max = earliest; // update max date
    }
  }

  // check submission date is before any adjudication dates
  if (!_isEmpty(editedEmployee.value.clearances[cIndex].adjudicationDates)) {
    // adjudication dates exist
    let earliest = _first(
      // get earliest adjudication date
      _sortBy(editedEmployee.value.clearances[cIndex].adjudicationDates, (date) => {
        // sort adjudication dates
        return format(date, null, DEFAULT_ISOFORMAT);
      })
    );
    if (isBefore(earliest, max)) {
      // adjudication date is earliest date
      max = earliest; // update max date
    }
  }

  return max ? format(max, null, DEFAULT_ISOFORMAT) : null;
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
</script>
