<template>
  <div>
    <!-- Loop Clearances -->
    <div v-for="(clearance, cIndex) in editedClearances" class="gray-border ma-0 pt-3 pb-1 px-5" :key="cIndex">
      <!-- Type of Clearance -->
      <v-autocomplete
        ref="formFields"
        v-model="clearance.type"
        :rules="[...getRequiredRules(), duplicateClearanceTypes(cIndex)]"
        :items="clearanceTypeDropDown"
        label="Type"
        variant="underlined"
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
            <template v-slot:label v-if="this.$vuetify.display.name === 'xs' || this.$vuetify.display.name === 'sm'">
              <span class="small-text">Awaiting Clearance</span>
            </template>
          </v-checkbox>
        </template>
      </v-autocomplete>

      <v-row class="py-3">
        <!-- Submission Date -->
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <v-text-field
            ref="formFields"
            :model-value="format(clearance.submissionDate, null, 'MM/DD/YYYY')"
            label="Submission Date"
            clearable
            :rules="[...getDateOptionalRules(), dateSubmissionRules(cIndex)]"
            hint="MM/DD/YYYY format"
            v-mask="'##/##/####'"
            variant="underlined"
            prepend-icon="mdi-calendar"
            @click:clear="clearance.submissionDate = null"
            @update:focused="clearance.submissionDate = parseEventDate()"
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
        <!-- End Submission Date -->
        <!-- Granted Date -->
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <div>
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
              variant="underlined"
              :disabled="clearance.awaitingClearance"
              @change="
                () => {
                  if (clearance.grantedDate) clearance.awaitingClearance = false;
                }
              "
              prepend-icon="mdi-calendar"
              @click:clear="clearance.grantedDate = null"
              @update:focused="clearance.grantedDate = parseEventDate()"
              @keypress="clearance.showGrantedMenu = false"
            >
            </v-text-field>
          </div>
        </v-col>
        <!-- End Granted Date -->
      </v-row>

      <!-- Badge Number -->
      <v-text-field
        v-model="clearance.badgeNum"
        prepend-icon="mdi-badge-account-outline"
        clearable
        maxlength="5"
        counter
        hide-details="auto"
        :rules="[getBadgeNumberRules(clearance)]"
        label="Badge Number"
        variant="underlined"
        :disabled="clearance.awaitingClearance"
        @update:focused="capitalizeBadges(clearance)"
      ></v-text-field>
      <!-- End Badge Number -->

      <!-- Badge Expiration Date -->
      <v-text-field
        ref="formFields"
        :model-value="format(clearance.badgeExpirationDate, null, 'MM/DD/YYYY')"
        label="Badge Expiration Date"
        clearable
        :rules="[...getDateOptionalRules(), dateBadgeRules(cIndex)]"
        hint="MM/DD/YYYY format"
        v-mask="'##/##/####'"
        variant="underlined"
        :disabled="clearance.awaitingClearance"
        prepend-icon="mdi-calendar"
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
      <!-- End Badge Expiration Dxate -->

      <!-- Bi Dates -->
      <div>
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
          variant="underlined"
          readonly
          clearable
          prepend-icon="mdi-calendar"
          @click:clear="clearance.biDates = []"
        >
          <template v-slot:selection="{ item }">
            <v-chip variant="outlined" closable @click:close="removeBiDate(item, cIndex)">{{ item.raw }}</v-chip>
          </template>
        </v-combobox>
      </div>
      <!-- End Bi Dates -->

      <!-- Adjudication Dates -->
      <div>
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
          variant="underlined"
          clearable
          readonly
          prepend-icon="mdi-calendar"
          @click:clear="clearance.adjudicationDates = []"
        >
          <template #selection="{ item }">
            <v-chip variant="outlined" closable @click:close="removeAdjDate(item, cIndex)">{{ item.raw }}</v-chip>
          </template>
        </v-combobox>
      </div>
      <!-- End Adjudication Dates -->

      <!-- Poly Dates -->
      <div>
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
          variant="underlined"
          clearable
          readonly
          prepend-icon="mdi-calendar"
          @click:clear="clearance.polyDates = []"
          @click:prepend="clearance.showPolyMenu = true"
        >
          <template #selection="{ item }">
            <v-chip variant="outlined" closable @click:close="removePolyDate(item, cIndex)">{{ item.raw }}</v-chip>
          </template>
        </v-combobox>
      </div>
      <!-- End Poly Dates -->
      <div align="center">
        <v-btn variant="text" icon="" @click="deleteClearance(cIndex)">
          <v-tooltip activator="parent" location="bottom">Delete Clearance</v-tooltip>
          <v-icon class="case-gray">mdi-delete</v-icon></v-btn
        >
      </div>
    </div>
    <!-- End Loop Clearances -->

    <!-- Button to add Clearances -->
    <div class="pt-4" align="center">
      <v-btn @click="addClearance" elevation="2"><v-icon class="pr-1">mdi-plus</v-icon>Clearance</v-btn>
    </div>
  </div>
</template>

<script>
import _isEmpty from 'lodash/isEmpty';
import _first from 'lodash/first';
import _sortBy from 'lodash/sortBy';
import _isArray from 'lodash/isArray';
import _cloneDeep from 'lodash/cloneDeep';
import _map from 'lodash/map';
import { getDateOptionalRules, getRequiredRules, getBadgeNumberRules } from '@/shared/validationUtils.js';
import { asyncForEach, isEmpty } from '@/utils/utils';
import { format, isAfter, isBefore, DEFAULT_ISOFORMAT, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import { mask } from 'vue-the-mask';

const ISOFORMAT = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'clearance'); // emit clearance tab was created
  this.employees = this.$store.getters.employees; // get all employees
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds a clearance.
 */
function addClearance() {
  if (!this.editedClearances) this.editedClearances = [];
  this.editedClearances.push({
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
  this.editedClearances.splice(cIndex, 1);
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
  if (this.editedClearances[cIndex].grantedDate) {
    // submission date is before granted date
    max = format(this.editedClearances[cIndex].grantedDate, null, DEFAULT_ISOFORMAT);
  }

  // check submission date is before any poly dates
  if (!_isEmpty(this.editedClearances[cIndex].polyDates)) {
    // poly dates exist
    let earliest = _first(
      // get earliest poly date
      _sortBy(this.editedClearances[cIndex].polyDates, (date) => {
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
  if (!_isEmpty(this.editedClearances[cIndex].adjudicationDates)) {
    // adjudication dates exist
    let earliest = _first(
      // get earliest adjudication date
      _sortBy(this.editedClearances[cIndex].adjudicationDates, (date) => {
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
  if (this.editedClearances[cIndex].grantedDate) {
    return this.editedClearances[cIndex].grantedDate;
  } else if (this.editedClearances[cIndex].submissionDate) {
    return this.editedClearances[cIndex].submissionDate;
  }
} // minExpiration

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return this.format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
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
  this.editedClearances[index].adjudicationDates = this.editedClearances[index].adjudicationDates.filter((date) => {
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
  this.editedClearances[index].biDates = this.editedClearances[index].biDates.filter((date) => {
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
  this.editedClearances[index].polyDates = this.editedClearances[index].polyDates.filter((date) => {
    let dateConvert = format(date, null, FORMATTED_ISOFORMAT);
    return dateConvert !== itemDate;
  });
} // removePolyDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });

  await this.editedClearances.forEach((clearance) => {
    //goes through each clearance and ensures it follows validation
    let badgeValidation = getBadgeNumberRules(clearance);
    if (badgeValidation(clearance) === 'Invalid Badge #, Must be 5 characters') errorCount++;
  });

  this.emitter.emit('doneValidating', { tab: 'clearance', data: this.editedClearances }); // emit done validating and sends edited data back to parent
  this.emitter.emit('clearanceStatus', errorCount); // emit error status
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
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                     FILTERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Formats multiple dates at once in MM/DD/YYYY format.
 * @return Array - The array of formatted dates
 */
function formatDates(array) {
  let formattedDates = [];
  array.forEach((date) => {
    formattedDates.push(this.format(date, null, 'MM/DD/YYYY'));
  });
  return formattedDates;
} // formatDates

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      clearanceTypeDropDown: ['TS/SCI - Full Scope', 'TS/SCI - CI Poly', 'TS/SCI - No Poly', 'Top Secret', 'Secret'], // autocomplete clearance type options
      dateBadgeRules: (index) => {
        let currClearance = this.editedClearances[index];
        return currClearance.grantedDate && currClearance.badgeExpirationDate && currClearance.submissionDate
          ? (isAfter(currClearance.badgeExpirationDate, currClearance.grantedDate) &&
              isAfter(currClearance.badgeExpirationDate, currClearance.submissionDate)) ||
              'Badge expiration date must come after grant and submission date'
          : true;
      },
      dateSubmissionRules: (index) => {
        let currClearance = this.editedClearances[index];
        return currClearance.grantedDate && currClearance.submissionDate
          ? isBefore(currClearance.submissionDate, currClearance.grantedDate) ||
              'Submission date must be before grant date'
          : true;
      },
      editedClearances: _cloneDeep(this.model), // stores edited clearances info
      dateGrantedRules: (index) => {
        let currClearance = this.editedClearances[index];
        return currClearance.grantedDate && currClearance.submissionDate
          ? isAfter(currClearance.grantedDate, currClearance.submissionDate) ||
              'Grant date must be after the submission date'
          : true;
      },
      duplicateClearanceTypes: (cIndex) => {
        let clearanceNames = _map(this.editedClearances, (clearance) => clearance.type);
        let clearanceName = clearanceNames[cIndex];
        clearanceNames.splice(cIndex, 1);
        return !clearanceNames.includes(clearanceName) || 'Duplicate clearance name';
      },
      requiredRules: [(v) => !this.isEmpty(v) || 'This field is required'] // rules for a required field
    };
  },
  directives: { mask },
  methods: {
    addClearance,
    capitalizeBadges,
    format,
    formatDates,
    deleteClearance,
    getDateOptionalRules,
    getRequiredRules,
    isAfter,
    isBefore,
    isEmpty,
    maxSubmission,
    minExpiration,
    parseEventDate,
    removeAdjDate,
    removeBiDate,
    removePolyDate,
    validateFields,
    getBadgeNumberRules
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>

<style scoped>
.small-text {
  font-size: 8px;
}
</style>
