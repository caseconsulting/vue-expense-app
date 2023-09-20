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
        data-vv-name="Type"
        clearable
      >
      </v-autocomplete>
      <!-- Awaiting Clearance -->
      <v-checkbox
        v-model="clearance.awaitingClearance"
        label="Awaiting Clearance"
        @change="
          () => {
            if (clearance.awaitingClearance) {
              clearance.grantedDate = null;
              clearance.badgeExpirationDate = null;
              clearance.badgeNum = null;
            }
          }
        "
      ></v-checkbox>
      <v-row class="py-3">
        <!-- Granted Date -->
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <v-menu
            v-model="clearance.showGrantedMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="format(clearance.grantedDate, null, 'MM/DD/YYYY')"
                label="Granted Date"
                prepend-icon="event_available"
                clearable
                :rules="[...getDateOptionalRules(), dateGrantedRules(cIndex)]"
                hint="MM/DD/YYYY format"
                v-mask="'##/##/####'"
                v-bind="attrs"
                v-on="on"
                :disabled="clearance.awaitingClearance"
                @change="
                  () => {
                    if (clearance.grantedDate) clearance.awaitingClearance = false;
                  }
                "
                @click:clear="clearance.grantedDate = null"
                @blur="clearance.grantedDate = parseEventDate($event)"
                @input="clearance.showGrantedMenu = false"
                @focus="clearanceElement = clearance"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="clearance.grantedDate"
              :min="clearance.submissionDate"
              no-title
              @input="clearance.showGrantedMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <!-- End Granted Date -->
        <!-- Submission Date -->
        <v-col cols="12" sm="6" md="12" lg="6" class="pt-0">
          <v-menu
            v-model="clearance.showSubmissionMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="formFields"
                :value="format(clearance.submissionDate, null, 'MM/DD/YYYY')"
                label="Submission Date"
                prepend-icon="event_note"
                clearable
                :rules="[...getDateOptionalRules(), dateSubmissionRules(cIndex)]"
                hint="MM/DD/YYYY format"
                v-mask="'##/##/####'"
                v-bind="attrs"
                v-on="on"
                @click:clear="clearance.submissionDate = null"
                @blur="clearance.submissionDate = parseEventDate($event)"
                @input="clearance.showSubmissionMenu = false"
                @focus="clearanceElement = clearance"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="clearance.submissionDate"
              :max="maxSubmission(cIndex)"
              no-title
              @input="clearance.showSubmissionMenu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <!-- End Submission Date -->
      </v-row>

      <!-- Badge Number -->
      <v-text-field
        v-model="clearance.badgeNum"
        prepend-icon="mdi-badge-account-outline"
        counter="5"
        label="Badge Number"
        clearable
        :disabled="clearance.awaitingClearance"
        @blur="capitalizeBadges(clearance)"
      ></v-text-field>
      <!-- End Badge Number -->

      <!-- Badge Expiration Date -->
      <v-menu
        v-model="clearance.showBadgeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            ref="formFields"
            :value="format(clearance.badgeExpirationDate, null, 'MM/DD/YYYY')"
            label="Badge Expiration Date"
            prepend-icon="event_busy"
            clearable
            :rules="[...getDateOptionalRules(), dateBadgeRules(cIndex)]"
            hint="MM/DD/YYYY format"
            v-mask="'##/##/####'"
            v-bind="attrs"
            v-on="on"
            :disabled="clearance.awaitingClearance"
            @click:clear="clearance.badgeExpirationDate = null"
            @blur="clearance.badgeExpirationDate = parseEventDate($event)"
            @input="clearance.showBadgeMenu = false"
            @focus="clearanceElement = clearance"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="clearance.badgeExpirationDate"
          :min="minExpiration(cIndex)"
          no-title
          @input="clearance.showBadgeMenu = false"
        ></v-date-picker>
      </v-menu>
      <!-- End Badge Expiration Dxate -->

      <!-- Bi Dates -->
      <v-menu
        ref="biMenu"
        v-model="clearance.showBIMenu"
        :close-on-content-click="false"
        :return-value.sync="clearance.biDates"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-combobox
            :value="formatDates(clearance.biDates)"
            multiple
            label="BI Dates"
            prepend-icon="event"
            readonly
            clearable
            v-bind="attrs"
            v-on="on"
            @click:clear="clearance.biDates = []"
          >
            <template #selection="{ item }">
              <v-chip outlined close @click:close="removeBiDate(item, cIndex)">{{ item }}</v-chip>
            </template>
          </v-combobox>
        </template>
        <v-date-picker v-model="clearance.biDates" :min="clearance.submissionDate" multiple no-title scrollable>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="clearance.showBIMenu = false">Cancel</v-btn>
          <v-btn text color="primary" @click="$refs.biMenu[cIndex].save(clearance.biDates)">OK</v-btn>
        </v-date-picker>
      </v-menu>
      <!-- End Bi Dates -->

      <!-- Adjudication Dates -->
      <v-menu
        ref="adjudicationMenu"
        v-model="clearance.showAdjudicationMenu"
        :close-on-content-click="false"
        :return-value.sync="clearance.adjudicationDates"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-combobox
            :value="formatDates(clearance.adjudicationDates)"
            multiple
            label="Adjudication Dates"
            prepend-icon="event"
            clearable
            readonly
            v-bind="attrs"
            v-on="on"
            @click:clear="clearance.adjudicationDates = []"
          >
            <template #selection="{ item }">
              <v-chip outlined close @click:close="removeAdjDate(item, cIndex)">{{ item }}</v-chip>
            </template>
          </v-combobox>
        </template>
        <v-date-picker
          v-model="clearance.adjudicationDates"
          :min="clearance.submissionDate"
          multiple
          no-title
          scrollable
        >
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="clearance.showAdjudicationMenu = false">Cancel</v-btn>
          <v-btn text color="primary" @click="$refs.adjudicationMenu[cIndex].save(clearance.adjudicationDates)"
            >OK</v-btn
          >
        </v-date-picker>
      </v-menu>
      <!-- End Adjudication Dates -->

      <!-- Poly Dates -->
      <v-menu
        ref="polyMenu"
        v-model="clearance.showPolyMenu"
        :close-on-content-click="false"
        :return-value.sync="clearance.polyDates"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-combobox
            :value="formatDates(clearance.polyDates)"
            multiple
            label="Poly Dates"
            prepend-icon="event"
            clearable
            readonly
            v-bind="attrs"
            v-on="on"
            @click:clear="clearance.polyDates = []"
            @input="clearance.showPolyMenu = false"
          >
            <template #selection="{ item }">
              <v-chip outlined close @click:close="removePolyDate(item, cIndex)">{{ item }}</v-chip>
            </template>
          </v-combobox>
        </template>
        <v-date-picker v-model="clearance.polyDates" :min="clearance.submissionDate" multiple no-title scrollable>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="clearance.showPolyMenu = false">Cancel</v-btn>
          <v-btn text color="primary" @click="$refs.polyMenu[cIndex].save(clearance.polyDates)">OK</v-btn>
        </v-date-picker>
      </v-menu>
      <!-- End Poly Dates -->
      <div align="center">
        <v-tooltip bottom slot="append-outer">
          <template v-slot:activator="{ on }">
            <v-btn text icon v-on="on" @click="deleteClearance(cIndex)"
              ><v-icon class="case-gray">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Clearance</span>
        </v-tooltip>
      </div>
    </div>
    <!-- End Loop Clearances -->

    <!-- Button to add Clearances -->
    <div class="pt-4" align="center">
      <v-btn @click="addClearance" elevation="2"><v-icon class="pr-1">add</v-icon>Clearance</v-btn>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { getDateOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { isEmpty } from '@/utils/utils';
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
  window.EventBus.$emit('created', 'clearance'); // emit clearance tab was created
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
  if (!_.isEmpty(this.editedClearances[cIndex].polyDates)) {
    // poly dates exist
    let earliest = _.first(
      // get earliest poly date
      _.sortBy(this.editedClearances[cIndex].polyDates, (date) => {
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
  if (!_.isEmpty(this.editedClearances[cIndex].adjudicationDates)) {
    // adjudication dates exist
    let earliest = _.first(
      // get earliest adjudication date
      _.sortBy(this.editedClearances[cIndex].adjudicationDates, (date) => {
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
  const itemDate = format(item, null, FORMATTED_ISOFORMAT);
  this.editedClearances[index].polyDates = this.editedClearances[index].polyDates.filter((date) => {
    let dateConvert = format(date, null, FORMATTED_ISOFORMAT);
    return dateConvert !== itemDate;
  });
} // removePolyDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  window.EventBus.$emit('doneValidating', 'clearance', this.editedClearances); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('clearanceStatus', errorCount); // emit error status
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
      clearanceElement: {},
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
      editedClearances: _.cloneDeep(this.model), // stores edited clearances info
      dateGrantedRules: (index) => {
        let currClearance = this.editedClearances[index];
        return currClearance.grantedDate && currClearance.submissionDate
          ? isAfter(currClearance.grantedDate, currClearance.submissionDate) ||
              'Grant date must be after the submission date'
          : true;
      },
      duplicateClearanceTypes: (cIndex) => {
        let clearanceNames = _.map(this.editedClearances, (clearance) => clearance.type);
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
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
