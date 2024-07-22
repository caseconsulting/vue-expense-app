<template>
  <v-container>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <b>Certifications:</b>
          </v-col>
        </v-row>
        <v-row v-for="(certification, index) in editedCertifications" :key="index">
          <v-col cols="5">
            <v-combobox
              ref="formFields"
              v-model="certification.name"
              :rules="getRequiredRules()"
              :items="certificationDropDown"
              label="Certification"
              variant="underlined"
              data-vv-name="Certification"
              clearable
            >
            </v-combobox>
          </v-col>

          <v-col cols="3">
            <v-text-field
              ref="formFields"
              :model-value="format(certification.dateReceived, null, 'MM/DD/YYYY')"
              label="Date Received"
              :rules="[...getDateRules()]"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              variant="underlined"
              prepend-icon="mdi-calendar"
              @update:focused="certification.dateReceived = parseEventDate()"
              @focus="certificationIndex = index"
              @click:prepend="certification.showReceivedMenu = true"
              @keypress="certification.showReceivedMenu = false"
              clearable
              autocomplete="off"
            >
              <v-menu
                activator="parent"
                v-model="certification.showReceivedMenu"
                :close-on-content-click="false"
                location="start center"
              >
                <v-date-picker
                  v-model="certification.dateReceived"
                  :max="certification.expirationDate"
                  @update:model-value="certification.showReceivedMenu = false"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Date Received"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
          </v-col>

          <v-col cols="3">
            <v-text-field
              ref="formFields"
              :model-value="format(certification.expirationDate, null, 'MM/DD/YYYY')"
              label="Expiration Date (optional)"
              :rules="[...getDateOptionalRules()]"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              variant="underlined"
              clearable
              prepend-icon="mdi-calendar"
              @update:focused="certification.expirationDate = parseEventDate()"
              @click:prepend="certification.showExpirationMenu = true"
              @keypress="certification.showExpirationMenu = false"
              @focus="certificationIndex = index"
              autocomplete="off"
            >
              <v-menu
                activator="parent"
                v-model="certification.showExpirationMenu"
                :close-on-content-click="false"
                location="start center"
              >
                <v-date-picker
                  v-model="certification.expirationDate"
                  :min="certification.dateReceived"
                  @update:model-value="certification.showExpirationMenu = false"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Expiration Date"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
          </v-col>
          <v-col>
            <v-btn @click="deleteCertification(index)" icon variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Certification</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center">
            <v-btn @click="addCertification()" elevation="2">
              <v-icon class="pr-1">mdi-plus</v-icon>
              Certification
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <b>Awards:</b>
          </v-col>
        </v-row>
        <v-row v-for="(award, index) in editedAwards" :key="index">
          <v-col cols="6">
            <v-text-field
              ref="formFields"
              v-model="award.name"
              :rules="getRequiredRules()"
              label="Award"
              variant="underlined"
              data-vv-name="Award"
              clearable
            >
            </v-text-field>
          </v-col>

          <v-col cols="5">
            <v-text-field
              ref="formFields"
              :model-value="format(award.dateReceived, null, 'MM/YYYY')"
              label="Date Received"
              :rules="getDateMonthYearRules()"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              variant="underlined"
              persistent-hint
              @update:focused="award.dateReceived = parseAwardEventDate()"
              clearable
              prepend-icon="mdi-calendar"
              @click:prepend="award.showReceivedMenu = true"
              @keypress="award.showReceivedMenu = false"
              autocomplete="off"
            >
              <v-menu
                activator="parent"
                v-model="award.showReceivedMenu"
                :close-on-content-click="false"
                location="start center"
              >
                <v-date-picker
                  v-model="award.dateReceived"
                  @update:model-value="award.showReceivedMenu = false"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Date Received"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
          </v-col>

          <v-col>
            <v-btn @click="deleteAward(index)" icon variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Award</v-tooltip>
              <v-icon class="case-gray pr-1">mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center">
            <v-btn @click="addAward()" elevation="2">
              <v-icon class="pr-1">mdi-plus</v-icon>
              Award
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import _ from 'lodash';
import { inject, onBeforeMount, ref } from 'vue';
import {
  getDateMonthYearRules,
  getDateOptionalRules,
  getDateRules,
  getRequiredRules
} from '../../../shared/validationUtils';
import { mask } from 'vue-the-mask';
import { format, getTodaysDate } from '../../../shared/dateUtils';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const props = defineProps(['certifications', 'awards', 'validateCertifications', 'validateAwards']);
const store = useStore();
const vMask = mask;

const certificationDropDown = ref([]); // autocomplete certification name options
const certificationIndex = ref(0);
const editedAwards = ref(_.cloneDeep(props.awards)); // stores edited awards info
const editedCertifications = ref(_.cloneDeep(props.certifications));
const employees = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  emitter.emit('created', 'certifications'); // emit certifications tab was created
  emitter.emit('created', 'awards'); // emit awards tab was created
  employees.value = store.getters.employees; // get all employees
  populateDropDowns(); // get autocomplete drop down data
});

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add an award.
 */
function addAward() {
  if (!editedAwards.value) editedAwards.value = [];
  editedAwards.value.push({
    name: null,
    dateReceived: null,
    expirationDate: null,
    dateSubmitted: getTodaysDate(),
    showReceivedMenu: false,
    showExpirationMenu: false
  });
} // addAward

/**
 * Adds a certification.
 */
function addCertification() {
  if (!editedCertifications.value) editedCertifications.value = [];
  editedCertifications.value.push({
    name: null,
    dateReceived: null,
    dateSubmitted: getTodaysDate(),
    expirationDate: null,
    showReceivedMenu: false,
    showExpirationMenu: false
  });
} // addCertification

/**
 * Delete an award.
 *
 * @param index - The index of the award to delete
 */
function deleteAward(index) {
  editedAwards.value.splice(index, 1);
} // deleteAward

/**
 * Deletes a certification.
 *
 * @param index - array index of certification to delete
 */
function deleteCertification(index) {
  editedCertifications.value.splice(index, 1);
} // deleteCertification

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
} //parseEventDate

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseAwardEventDate() {
  return this.format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} // parseEventDate

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesCertifications = _.map(employees.value, (employee) => employee.certifications); // extract certifications
  employeesCertifications = _.compact(employeesCertifications); // remove falsey values
  // loop employees
  _.forEach(employeesCertifications, (certifications) => {
    // loop certifications
    _.forEach(certifications, (certification) => {
      certificationDropDown.value.push(certification.name); // add certification name
    });
  });
} // populateDropDowns
</script>
