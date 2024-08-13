<template>
  <v-form ref="form" v-model="valid" validate-on="lazy">
    <v-row>
      <!-- Start Certifications -->
      <v-col>
        <v-row>
          <v-col>
            <b>Certifications:</b>
          </v-col>
        </v-row>
        <!-- Start Cert Loop -->
        <v-row v-for="(certification, index) in editedEmployee.certifications" :key="index">
          <!-- Start Cert Name -->
          <v-col :cols="!isMobile() ? '5' : '10'">
            <v-combobox
              ref="formFields"
              v-model="certification.name"
              :rules="getRequiredRules()"
              :items="certificationDropDown"
              label="Certification"
              data-vv-name="Certification"
              clearable
            >
            </v-combobox>
          </v-col>
          <!-- End Cert Name -->

          <!-- Start Delete Cert MOBILE -->
          <v-col cols="2" v-if="isMobile()">
            <v-btn @click="deleteCertification(index)" icon variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Certification</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon>
            </v-btn>
          </v-col>
          <!-- Start Delete Cert MOBILE -->

          <!-- Start Cert recieved date -->
          <v-col :cols="!isMobile() ? '3' : '12'">
            <v-text-field
              ref="formFields"
              :model-value="format(certification.dateReceived, null, 'MM/DD/YYYY')"
              label="Date Received"
              :rules="[...getDateRules()]"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              persistent-hint
              clearable
              prepend-inner-icon="mdi-calendar"
              autocomplete="off"
              @update:focused="certification.dateReceived = parseEventDate($event)"
              @keypress="certification.showReceivedMenu = false"
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
          <!-- End Cert received date -->

          <!-- Start Cert expiration date -->
          <v-col :cols="!isMobile() ? '3' : '12'">
            <v-text-field
              ref="formFields"
              :model-value="format(certification.expirationDate, null, 'MM/DD/YYYY')"
              label="Expiration Date (optional)"
              :rules="[...getDateOptionalRules()]"
              hint="MM/DD/YYYY format"
              v-mask="'##/##/####'"
              clearable
              prepend-inner-icon="mdi-calendar"
              autocomplete="off"
              @update:focused="certification.expirationDate = parseEventDate($event)"
              @keypress="certification.showExpirationMenu = false"
              @focus="certificationIndex = index"
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
          <!-- End Cert expiration date -->

          <!-- Start Delete Cert NORMAL -->
          <v-col v-if="!isMobile()" cols="1">
            <v-btn @click="deleteCertification(index)" icon variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Certification</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon>
            </v-btn>
          </v-col>
          <!-- End Delete Cert NORMAL-->
          <v-divider v-if="isMobile() && index < editedEmployee.certifications.length - 1" :thickness="3"></v-divider>
        </v-row>
        <!-- End Cert Loop -->

        <!-- Start Add Cert -->
        <v-row>
          <v-col align="center">
            <v-btn @click="addCertification()" elevation="2">
              <v-icon class="pr-1">mdi-plus</v-icon>
              Certification
            </v-btn>
          </v-col>
        </v-row>
        <!-- End Add Cert -->
      </v-col>
    </v-row>
    <!-- End Certifications -->

    <v-divider :thickness="4" class="border-opacity-50 my-8"></v-divider>

    <!-- Start Awards -->
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <b>Awards:</b>
          </v-col>
        </v-row>
        <!-- Start Award Loop -->
        <v-row v-for="(award, index) in editedEmployee.awards" :key="index">
          <!-- Start Award Name -->
          <v-col :cols="!isMobile() ? '6' : '10'">
            <v-text-field
              ref="formFields"
              v-model="award.name"
              :rules="getRequiredRules()"
              label="Award"
              data-vv-name="Award"
              clearable
            >
            </v-text-field>
          </v-col>
          <!-- End Award Name -->

          <!-- Start delete award MOBILE -->
          <v-col v-if="isMobile()" cols="2">
            <v-btn @click="deleteAward(index)" icon variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Award</v-tooltip>
              <v-icon class="case-gray">mdi-delete</v-icon>
            </v-btn>
          </v-col>
          <!-- End delete award MOBILE -->

          <!-- Start Award received date -->
          <v-col :cols="!isMobile() ? '5' : '12'">
            <v-text-field
              ref="formFields"
              :model-value="format(award.dateReceived, null, 'MM/YYYY')"
              label="Date Received"
              :rules="getDateMonthYearRules()"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              persistent-hint
              clearable
              prepend-inner-icon="mdi-calendar"
              autocomplete="off"
              @update:focused="award.dateReceived = parseAwardEventDate($event)"
              @keypress="award.showReceivedMenu = false"
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
          <!-- End award recieved date -->

          <!-- Start delete award NORMAL-->
          <v-col v-if="!isMobile()" cols="1">
            <v-btn @click="deleteAward(index)" icon variant="text">
              <v-tooltip activator="parent" location="bottom">Delete Award</v-tooltip>
              <v-icon class="case-gray pr-1">mdi-delete</v-icon>
            </v-btn>
          </v-col>
          <!-- End delete award NORMAL -->
          <v-divider v-if="isMobile() && index < editedEmployee.awards.length - 1" :thickness="3"></v-divider>
        </v-row>
        <!-- End Award Loop -->

        <!-- Start Add Award -->
        <v-row>
          <v-col align="center">
            <v-btn @click="addAward()" elevation="2">
              <v-icon class="pr-1">mdi-plus</v-icon>
              Award
            </v-btn>
          </v-col>
        </v-row>
        <!-- End Add Award -->
      </v-col>
    </v-row>
    <!-- End Awards -->
  </v-form>
</template>

<script setup>
import { format, getTodaysDate } from '@/shared/dateUtils';
import { getDateMonthYearRules, getDateOptionalRules, getDateRules, getRequiredRules } from '@/shared/validationUtils';
import _compact from 'lodash/compact';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import _uniq from 'lodash/uniq';
import { inject, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import { mask } from 'vue-the-mask';
import { useStore } from 'vuex';
import { isMobile } from '../../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const emitter = inject('emitter');
const vMask = mask;

const editedEmployee = defineModel({ required: true });
const valid = defineModel('valid', { required: true });
const form = ref(null); // template ref

const certificationDropDown = ref([]); // autocomplete certification name options
const certificationIndex = ref(0);
const employees = store.getters.employees;

defineExpose({ prepareSubmit });

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(populateDropDowns);
onMounted(prepareSubmit);
onBeforeUnmount(prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

async function prepareSubmit() {
  if (form.value) {
    const result = await form.value.validate();
    emitter.emit('validating', { tab: 'certsAndAwards', valid: result.valid });
    return result;
  }
  return null;
}

/**
 * Add an award.
 */
function addAward() {
  if (!editedEmployee.value.awards) editedEmployee.value.awards = [];
  editedEmployee.value.awards.push({
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
  if (!editedEmployee.value.certifications) editedEmployee.value.certifications = [];
  editedEmployee.value.certifications.push({
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
  editedEmployee.value.awards.splice(index, 1);
} // deleteAward

/**
 * Deletes a certification.
 *
 * @param index - array index of certification to delete
 */
function deleteCertification(index) {
  editedEmployee.value.certifications.splice(index, 1);
} // deleteCertification

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate(event) {
  return format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
} // parseEventDate

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseAwardEventDate(event) {
  return format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} // parseAwardEventDate

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesCertifications = _map(employees, (employee) => employee.certifications); // extract certifications
  employeesCertifications = _compact(employeesCertifications); // remove falsey values
  // loop employees
  _forEach(employeesCertifications, (certifications) => {
    // loop certifications
    _forEach(certifications, (certification) => {
      certificationDropDown.value.push(certification.name); // add certification name
    });
  });
  // remove duplicates
  certificationDropDown.value = _uniq(certificationDropDown.value);
} // populateDropDowns
</script>
