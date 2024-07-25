<template>
  <v-container>
    <v-row v-for="(clearance, cIndex) in editedClearances" :key="cIndex">
      <v-col>
        <v-row>
          <v-col>
            <v-autocomplete
              ref="formFields"
              v-model="clearance.type"
              :rules="[...getRequiredRules(), duplicateClearanceTypes(cIndex)]"
              :items="clearanceTypeDropDown"
              label="Type"
              data-vv-name="Type"
              clearable
            >
              <template v-slot:append>
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
                  <template v-slot:label v-if="name === 'xs' || name === 'sm'">
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

        <v-row>
          <v-col cols="1"></v-col>
          <v-col class="groove">
            <v-text-field
              ref="formFields"
              :model-value="format(clearance.submissionDate, null, 'MM/DD/YYYY')"
              label="Submission Date"
              clearable
              :rules="[...getDateOptionalRules(), dateSubmissionRules(cIndex)]"
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

          <v-col>
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
              ref="formFields"
              :model-value="format(clearance.grantedDate, null, 'MM/DD/YYYY')"
              label="Granted Date"
              clearable
              :rules="[...getDateOptionalRules(), dateGrantedRules(cIndex)]"
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
        </v-row>

        <v-row>
          <v-col cols="1"></v-col>
          <v-col class="groove">
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

          <v-col>
            <v-text-field
              ref="formFields"
              :model-value="format(clearance.badgeExpirationDate, null, 'MM/DD/YYYY')"
              label="Badge Expiration Date"
              clearable
              :rules="[...getDateOptionalRules(), dateBadgeRules(cIndex)]"
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
        </v-row>

        <v-row>
          <v-col cols="1"></v-col>
          <v-col class="groove mb-4">
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
                <v-chip variant="outlined" closable @click:close="removeBiDate(item, cIndex)">{{ item.raw }}</v-chip>
              </template>
            </v-combobox>
          </v-col>

          <v-col>
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
                <v-chip variant="outlined" closable @click:close="removeAdjDate(item, cIndex)">{{ item.raw }}</v-chip>
              </template>
            </v-combobox>
          </v-col>

          <v-col>
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
                <v-chip variant="outlined" closable @click:close="removePolyDate(item, cIndex)">{{ item.raw }}</v-chip>
              </template>
            </v-combobox>
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
  </v-container>
</template>

<script setup>
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import { DEFAULT_ISOFORMAT, format, FORMATTED_ISOFORMAT, isAfter, isBefore } from '../../../shared/dateUtils';
import { getBadgeNumberRules, getDateOptionalRules, getRequiredRules } from '../../../shared/validationUtils';
import { useDisplay } from 'vuetify/lib/framework.mjs';
import { inject, onBeforeMount, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { asyncForEach } from '../../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const ISOFORMAT = 'YYYY-MM-DD';

const emitter = inject('emitter');
const { name } = useDisplay();
const props = defineProps(['model', 'validating']);
const store = useStore();
const vMask = mask; // custom directive

const clearanceTypeDropDown = ['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret']; // autocomplete clearance type options
const editedClearances = ref(_.cloneDeep(props.model));
const employees = ref(null);
const formFields = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                    RULES                         |
// |                                                  |
// |--------------------------------------------------|

const dateBadgeRules = (index) => {
  let currClearance = editedClearances.value[index];
  return currClearance.grantedDate && currClearance.badgeExpirationDate && currClearance.submissionDate
    ? (isAfter(currClearance.badgeExpirationDate, currClearance.grantedDate) &&
        isAfter(currClearance.badgeExpirationDate, currClearance.submissionDate)) ||
        'Badge expiration date must come after grant and submission date'
    : true;
};
const dateSubmissionRules = (index) => {
  let currClearance = editedClearances.value[index];
  return currClearance.grantedDate && currClearance.submissionDate
    ? isBefore(currClearance.submissionDate, currClearance.grantedDate) || 'Submission date must be before grant date'
    : true;
};

const dateGrantedRules = (index) => {
  let currClearance = editedClearances.value[index];
  console.log(currClearance.grantedDate);
  console.log(currClearance.submissionDate);
  return currClearance.grantedDate && currClearance.submissionDate
    ? isAfter(currClearance.grantedDate, currClearance.submissionDate) || 'Grant date must be after the submission date'
    : true;
};

const duplicateClearanceTypes = (cIndex) => {
  let clearanceNames = _.map(editedClearances.value, (clearance) => clearance.type);
  let clearanceName = clearanceNames[cIndex];
  clearanceNames.splice(cIndex, 1);
  return !clearanceNames.includes(clearanceName) || 'Duplicate clearance name';
};

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
onBeforeMount(async () => {
  emitter.emit('created', 'clearance'); // emit clearance tab was created
  employees.value = store.getters.employees; // get all employees
}); // onBeforeMount

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds a clearance.
 */
function addClearance() {
  if (!editedClearances.value) editedClearances.value = [];
  editedClearances.value.push({
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
  editedClearances.value.splice(cIndex, 1);
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
  if (editedClearances.value[cIndex].grantedDate) {
    // submission date is before granted date
    max = format(editedClearances.value[cIndex].grantedDate, null, DEFAULT_ISOFORMAT);
  }

  // check submission date is before any poly dates
  if (!_.isEmpty(editedClearances.value[cIndex].polyDates)) {
    // poly dates exist
    let earliest = _.first(
      // get earliest poly date
      _.sortBy(editedClearances.value[cIndex].polyDates, (date) => {
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
  if (!_.isEmpty(editedClearances.value[cIndex].adjudicationDates)) {
    // adjudication dates exist
    let earliest = _.first(
      // get earliest adjudication date
      _.sortBy(editedClearances.value[cIndex].adjudicationDates, (date) => {
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
  if (editedClearances.value[cIndex].grantedDate) {
    return editedClearances.value[cIndex].grantedDate;
  } else if (editedClearances.value[cIndex].submissionDate) {
    return editedClearances.value[cIndex].submissionDate;
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
  editedClearances.value[index].adjudicationDates = editedClearances.value[index].adjudicationDates.filter((date) => {
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
  editedClearances.value[index].biDates = editedClearances.value[index].biDates.filter((date) => {
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
  editedClearances.value[index].polyDates = editedClearances.value[index].polyDates.filter((date) => {
    let dateConvert = format(date, null, FORMATTED_ISOFORMAT);
    return dateConvert !== itemDate;
  });
} // removePolyDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 *
 * TODO: I included this in hopes that it would help with submission... IDK if we actually need it
 */
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(formFields.value) ? [formFields.value] : formFields.value;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });

  await editedClearances.value.forEach((clearance) => {
    //goes through each clearance and ensures it follows validation
    let badgeValidation = getBadgeNumberRules(clearance);
    if (badgeValidation(clearance) === 'Invalid Badge #, Must be 5 characters') errorCount++;
  });

  emitter.emit('doneValidating', { tab: 'clearance', data: editedClearances.value }); // emit done validating and sends edited data back to parent
  emitter.emit('clearanceStatus', errorCount); // emit error status
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 */
watch(
  () => props.validating,
  () => {
    // parent component triggers validation
    validateFields();
  }
); // watchValidating
</script>
