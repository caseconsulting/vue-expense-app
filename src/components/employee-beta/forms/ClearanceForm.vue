<template>
  <div>
    <v-row v-for="(clearance, cIndex) in editedEmployee.clearances" :key="cIndex">
      <v-col>
        <v-row>
          <v-col>
            <v-autocomplete
              v-model="clearance.type"
              :rules="[...getRequiredRules(), ...getDuplicateClearanceRules(editedEmployee.clearances)]"
              :items="CLEARANCE_TYPES"
              label="Type"
              data-vv-name="Type"
              clearable
            >
            </v-autocomplete>
          </v-col>

          <v-col cols="1">
            <v-btn variant="text" icon="" @click="deleteClearance(cIndex)">
              <v-tooltip activator="parent" location="bottom">Delete Clearance</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon></v-btn
            >
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="1"></v-col>
          <v-col>
            <v-row class="groove">
              <v-col class="small" :cols="isMobile() ? '12' : '4'">
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
              </v-col>
              <v-col class="small" :cols="isMobile() ? '12' : '4'">
                <date-picker
                  v-model="clearance.submissionDate"
                  :rules="[...getDateOptionalRules(), ...getDateSubmissionRules(clearance)]"
                  :max="maxSubmission(cIndex)"
                  label="Submission Date"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>

              <v-col class="small" :cols="isMobile() ? '12' : '4'">
                <v-combobox
                  v-model="clearance.grantingOrg"
                  prepend-inner-icon="mdi-lan"
                  :items="grantingOrgItems"
                  label="Granting Organization"
                ></v-combobox>
              </v-col>

              <v-col class="small" :cols="isMobile() ? '12' : '4'">
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

              <v-col class="small" :cols="isMobile() ? '12' : '4'">
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

              <v-col class="small" :cols="isMobile() ? '12' : '4'">
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

              <v-col class="small" :cols="isMobile() ? '12' : '4'">
                <date-picker
                  v-model="clearance.biDates"
                  :min="clearance.submissionDate"
                  label="BI Dates"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>

              <v-col class="small" :cols="isMobile() ? '12' : '4'">
                <date-picker
                  v-model="clearance.adjudicationDates"
                  :min="clearance.submissionDate"
                  label="Adjudication Dates"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>

              <v-col class="small" :cols="isMobile() ? '12' : '4'">
                <date-picker
                  v-model="clearance.polyDates"
                  :min="clearance.submissionDate"
                  label="Poly Dates"
                  variant="filled"
                  clearable
                ></date-picker>
              </v-col>
            </v-row>
            <v-row class="groove">
              <v-col cols="12" align="center" class="py-2">
                <v-btn @click="addReinvestigation(clearance)" variant="outlined" size="small">Add Reinvestigation</v-btn>
              </v-col>
            </v-row>
            <v-row v-for="(reinvestigation, rIndex) in clearance.reinvestigations" :key="rIndex" class="groove">
              <v-col class="small" :cols="isMobile() ? '12' : '4'">
                <v-checkbox
                    v-model="reinvestigation.underReinvestigation"
                    density="compact"
                    class="mx-xs-0 mx-sm-0 mx-md-5"
                    hide-details
                    label="Under Reinvestigation"
                    disabled
                  >
                    <template #label v-if="name === 'xs' || name === 'sm'">
                      <span class="small-text">Under Reinvestigation</span>
                    </template>
                  </v-checkbox>
                </v-col>
                <v-col class="small" :cols="isMobile() ? '12' : '4'">
                  <date-picker
                    v-model="reinvestigation.submissionDate"
                    :rules="[...getDateOptionalRules()]"
                    :min="clearance.grantedDate"
                    label="Submission Date"
                    variant="filled"
                    clearable
                  ></date-picker>
                </v-col>
                <v-col class="small" :cols="isMobile() ? '12' : '4'">
                  <date-picker
                    v-model="reinvestigation.completionDate"
                    :rules="[...getDateOptionalRules()]"
                    :min="reinvestigation.submissionDate"
                    label="Completion Date"
                    variant="filled"
                    clearable
                  ></date-picker>
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
import { DEFAULT_ISOFORMAT, format, isBefore, minimum } from '@/shared/dateUtils';
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
import { isMobile, isEmpty } from '@/utils/utils';
import { onMounted, ref } from 'vue';
import { useDisplay } from 'vuetify/lib/framework.mjs';

import { useStore } from 'vuex';
import { Clearance } from '@/shared/models/clearance/clearance';
import { Reinvestigation } from '@/shared/models/clearance/reinvestigation';
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
  editedEmployee.value.clearances.push(new Clearance({}));
}

/**
 * Add reinvestigation.
 */
function addReinvestigation(clearance) {
  clearance.reinvestigations.push(new Reinvestigation({}));
}

/**
 * Capitalize all badge numbers.
 *
 * @param clearance - The clearance object of the badge to capitalize
 */
function capitalizeBadges(clearance) {
  if (clearance.badgeNum) {
    clearance.badgeNum = clearance.badgeNum.toUpperCase();
  }
}

/**
 * Deletes a clearance.
 *
 * @param cIndex - array index of clearance to remove.
 */
function deleteClearance(cIndex) {
  editedEmployee.value.clearances.splice(cIndex, 1);
}

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
  if (!isEmpty(editedEmployee.value.clearances[cIndex].polyDates)) {
    // poly dates exist
    let earliest = minimum(editedEmployee.value.clearances[cIndex].polyDates);

    if (isBefore(earliest, max)) {
      // poly date is earliest date
      max = earliest; // update max date
    }
  }

  // check submission date is before any adjudication dates
  if (!isEmpty(editedEmployee.value.clearances[cIndex].adjudicationDates)) {
    // adjudication dates exist
    let earliest = minimum(editedEmployee.value.clearances[cIndex].adjudicationDates);
    if (isBefore(earliest, max)) {
      // adjudication date is earliest date
      max = earliest; // update max date
    }
  }

  return max ? format(max, null, DEFAULT_ISOFORMAT) : null;
}

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
}
</script>
