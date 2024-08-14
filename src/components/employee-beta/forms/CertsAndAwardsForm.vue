<template>
  <div>
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
            <date-picker-field
              v-model="certification.dateReceived"
              :rules="[...getDateRules()]"
              :max="certification.expirationDate"
              textFormat="MM/DD/YYYY"
              dateFormat="YYYY-MM-DD"
              label="Date Received"
              title="Date Received"
              clearable
            />
          </v-col>
          <!-- End Cert received date -->

          <!-- Start Cert expiration date -->
          <v-col :cols="!isMobile() ? '3' : '12'">
            <date-picker-field
              v-model="certification.expirationDate"
              :rules="[...getDateOptionalRules()]"
              textFormat="MM/DD/YYYY"
              dateFormat="YYYY-MM-DD"
              label="Expiration Date (optional)"
              title="Expiration Date"
              clearable
            />
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
        <div v-for="(award, index) in editedEmployee.awards" :key="index">
          <v-sheet min-height="100" class="fill-height">
            <v-lazy class="fill-height" :options="{ rootMargin: '500px' }">
              <v-row class="fill-height">
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
                  <date-picker-field
                    v-model="award.dateReceived"
                    :rules="getDateMonthYearRules()"
                    mask="##/####"
                    dateFormat="YYYY-MM"
                    textFormat="MM/YYYY"
                    label="Date Received"
                    title="Date Received"
                    hint="MM/YYYY format"
                    clearable
                  />
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
            </v-lazy>
          </v-sheet>
        </div>
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
  </div>
</template>

<script setup>
import { getTodaysDate } from '@/shared/dateUtils';
import { getDateMonthYearRules, getDateOptionalRules, getDateRules, getRequiredRules } from '@/shared/validationUtils';
import { isMobile } from '@/utils/utils';
import _compact from 'lodash/compact';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import _uniq from 'lodash/uniq';
import { onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import DatePickerField from '../../shared/edit-fields/DatePickerField.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();

// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);

const certificationDropDown = ref([]); // autocomplete certification name options
const employees = store.getters.employees;

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(populateDropDowns);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

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
