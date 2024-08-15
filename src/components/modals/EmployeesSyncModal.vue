<template>
  <v-card>
    <v-card-title class="header_style">Application Sync Results</v-card-title>
    <v-card-text class="mt-4 text-h3" v-if="isError(syncData)">
      The sync process could not finish due to an error: {{ syncData.message }}
    </v-card-text>
    <v-card-text v-else-if="syncData">
      <!-- Users Updated -->
      <div class="mt-4 text-h6 font-weight-black">User(s) Updated</div>
      <div v-if="!updatesToUsers || (updatesToUsers && Object.keys(updatesToUsers).length === 0)">No users updated</div>
      <div v-else>
        <div v-for="(records, empNum) in updatesToUsers" :key="empNum * Math.random()">
          <div class="text-subtitle-2">
            &nbsp;&nbsp;&nbsp;
            <v-icon size="small" class="mr-2" color="green">check</v-icon>
            <span>{{ getName(empNum) }}: </span>
            <span class="text-caption"> {{ Array.from(records).join(', ') }}</span>
          </div>
        </div>
      </div>
      <!-- Users created -->
      <div class="mt-4 text-h6 font-weight-black">User(s) Created</div>
      <div v-if="!creations || (creations && creations.length === 0)">No users created</div>
      <div v-else>
        <div v-for="empNum in creations" :key="empNum * Math.random()">
          <div class="text-subtitle-2">
            &nbsp;&nbsp;&nbsp;
            <v-icon size="small" class="mr-2" color="green">check</v-icon>
            <span>{{ getName(empNum) }}: </span>
            <span class="text-caption"> User was successfully created with employee number {{ empNum }}</span>
          </div>
        </div>
      </div>
      <!-- Failures -->
      <div v-if="failures && failures.length > 0" class="mt-4 text-h6 font-weight-black">Failures</div>
      <div v-for="(failure, i) in failures" :key="failure * Math.random()">
        <div class="text-subtitle-2">
          &nbsp;&nbsp;&nbsp;
          <v-icon size="small" class="mr-2" color="red">close</v-icon>
          {{ Object.keys(failures[i])[0] }} - {{ Object.values(failures[i])[0] }}
        </div>
      </div>

      <div class="mt-5">
        <v-btn v-if="!showMore" @click="showMore = true" class="ml-0 pl-0 mt-0" size="x-small" variant="plain"
          >Show More Details
          <v-icon end> mdi-menu-down </v-icon>
        </v-btn>
        <v-btn v-else @click="showMore = false" class="ml-0 pl-0 mt-0" size="x-small" variant="plain"
          >Show Less Details
          <v-icon end> mdi-menu-up </v-icon>
        </v-btn>
        <v-divider></v-divider>
        <div v-if="showMore">
          <!-- Portal To BambooHR Synced Fields -->
          <div class="mt-4 text-caption font-weight-black">
            All fields that are synced between the Portal and BambooHR
            <div class="text-caption">{{ syncData.caseAndBambooSyncResult.fields.join(', ') }}</div>
          </div>
          <!-- BambooHR To ADP Synced Fields -->
          <div class="mt-4 text-caption font-weight-black">
            All fields that are synced between BambooHR and ADP
            <div class="text-caption">{{ syncData.bambooAndADPSyncResult.fields.join(', ') }}</div>
          </div>
          <!-- Additional Information -->
          <div class="mt-4 text-caption font-weight-black">
            How the data sync works
            <div class="text-caption">
              First, fields will be synced between the Portal and BambooHR. The Portal is the central source of data, so
              any conflicts/differences found between fields will use the Portal's data. Second, fields will be synced
              between BambooHR and ADP in which BambooHR is the central source of data. Note, if there is a user that is
              not being synced, make sure their employee number matches on all applications.
            </div>
          </div>
          <!-- Icons -->
          <div class="mt-4">
            <v-icon size="large">$case</v-icon>
            <v-icon size="large" class="mx-3">mdi-arrow-right-thin</v-icon>
            <v-icon size="large">$bamboo</v-icon>
            <v-icon size="large" class="mx-3">mdi-arrow-right-thin</v-icon>
            <v-icon size="x-large">$adp</v-icon>
          </div>
        </div>
      </div>
    </v-card-text>
    <v-card-text v-else>Something went wrong... please refresh the page</v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="gray darken-1" variant="text" @click="emit('close-data-sync-results-modal')"> Close </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { nicknameAndLastName } from '@/shared/employeeUtils';
import _forEach from 'lodash/forEach';
import _find from 'lodash/find';
import { onMounted, ref, watch, inject } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const updatesToUsers = ref(null);
const creations = ref(null);
const emitter = inject('emitter');
const failures = ref(null);
const props = defineProps(['syncData']);
const showMore = ref(false);
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecycle hook
 */
onMounted(() => {
  if (props.syncData && !isError(props.syncData)) {
    setUpdates();
    setCreations();
    setFailures();
  }
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data to the event bus.
 *
 * @param msg - The message to emit
 * @param data - The data to emit
 */
function emit(msg, data) {
  emitter.emit(msg, data);
} // emit

/**
 * Converts an employee number to an employee's name.
 *
 * @param employeeNumber - An employee number
 * @returns An employee's name if the employee number exists
 */
function getName(employeeNumber) {
  let employees = store.getters.employees;
  if (employees) {
    let employee = _find(employees, (e) => e.employeeNumber === parseInt(employeeNumber));
    return employee ? nicknameAndLastName(employee) : employeeNumber;
  }
  return employeeNumber;
} // getName

/**
 * Sets up and formats updates made by the data sync function response.
 */
function setUpdates() {
  updatesToUsers.value = {};

  let bambooUpdates = props.syncData.caseAndBambooSyncResult.fieldsUpdated;
  _forEach(bambooUpdates, (record) => {
    const [eNum, fieldName] = Object.entries(record)[0];
    if (updatesToUsers.value[eNum]) {
      updatesToUsers.value[eNum].add(fieldName);
    } else {
      updatesToUsers.value[eNum] = new Set([fieldName]);
    }
  });
  let adpUpdates = props.syncData.bambooAndADPSyncResult.fieldsUpdated;
  _forEach(adpUpdates, (record) => {
    const [eNum, fieldName] = Object.entries(record)[0];
    if (updatesToUsers.value[eNum]) {
      updatesToUsers.value[eNum].add(fieldName);
    } else {
      updatesToUsers.value[eNum] = new Set([fieldName]);
    }
  });
} // setUpdates

/**
 * * Sets up and formats creations made by the data sync function response.
 */
function setCreations() {
  creations.value = props.syncData.caseAndBambooSyncResult.usersCreated;
} // setCreations

/**
 * * Sets up and formats failures found by the data sync function response.
 */
function setFailures() {
  let failures = [
    ...props.syncData.caseAndBambooSyncResult.failures,
    ...props.syncData.bambooAndADPSyncResult.failures
  ];
  failures.value = [];
  _forEach(failures, (f) => {
    const [eNum, error] = Object.entries(f)[0];
    failures.value.push({ [getName(eNum)]: error });
  });
} // setFailures

/**
 * Checks if there was a fatal error while getting the data from the data sync function.
 *
 * @param data - The data sync response
 * @returns True if there was a fatal error
 */
function isError(data) {
  return data instanceof Error;
} // isError

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Resets data when data sync was manually invoked.
 */
watch(
  () => props.syncData,
  () => {
    if (props.syncData && !isError(props.syncData)) {
      setUpdates();
      setCreations();
      setFailures();
    }
  }
); // watchSyncData
</script>
