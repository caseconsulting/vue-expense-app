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
            <v-icon small class="mr-2" color="green">check</v-icon>
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
            <v-icon small class="mr-2" color="green">check</v-icon>
            <span>{{ getName(empNum) }}: </span>
            <span class="text-caption"> User was successfully created with employee number {{ empNum }}</span>
          </div>
        </div>
      </div>
      <!-- Failures -->
      <div v-if="failures && failures.length > 0" class="mt-4 text-h6 font-weight-black">Failures</div>
      <div v-for="failure in failures" :key="failure * Math.random()">
        <div class="text-subtitle-2">
          &nbsp;&nbsp;&nbsp;
          <v-icon small class="mr-2" color="red">close</v-icon>
          {{ failure }}
        </div>
      </div>
    </v-card-text>
    <v-card-text v-else>Something went wrong... please refresh the page</v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="gray darken-1" text @click="emit('close-data-sync-results-modal')"> Close </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { nicknameAndLastName } from '@/shared/employeeUtils';
const _ = require('lodash');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function emit(msg, data) {
  window.EventBus.$emit(msg, data);
}

function getName(employeeNumber) {
  let employees = this.$store.getters.employees;
  if (employees) {
    let employee = _.find(employees, (e) => e.employeeNumber === parseInt(employeeNumber));
    return employee ? this.nicknameAndLastName(employee) : employeeNumber;
  }
  return employeeNumber;
}

function setUpdates() {
  this.updatesToUsers = {};

  let bambooUpdates = this.syncData.caseAndBambooSyncResult.fieldsUpdated;
  _.forEach(bambooUpdates, (record) => {
    const [eNum, fieldName] = Object.entries(record)[0];
    if (this.updatesToUsers[eNum]) {
      this.updatesToUsers[eNum].add(fieldName);
    } else {
      this.updatesToUsers[eNum] = new Set([fieldName]);
    }
  });
  let adpUpdates = this.syncData.bambooAndADPSyncResult.fieldsUpdated;
  _.forEach(adpUpdates, (record) => {
    const [eNum, fieldName] = Object.entries(record)[0];
    if (this.updatesToUsers[eNum]) {
      this.updatesToUsers[eNum].add(fieldName);
    } else {
      this.updatesToUsers[eNum] = new Set([fieldName]);
    }
  });
}

function setCreations() {
  this.creations = this.syncData.caseAndBambooSyncResult.usersCreated;
}

function setFailures() {
  this.failures = [...this.syncData.caseAndBambooSyncResult.failures, ...this.syncData.bambooAndADPSyncResult.failures];
}

function isError(data) {
  return data instanceof Error;
}

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|
function watchSyncData() {
  if (this.syncData && !this.isError(this.syncData)) {
    this.setUpdates();
    this.setCreations();
    this.setFailures();
  }
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      dialog: false,
      updatesToUsers: null,
      creations: null,
      failures: null
    };
  },
  methods: {
    emit,
    getName,
    nicknameAndLastName,
    isError,
    setUpdates,
    setCreations,
    setFailures
  },
  props: ['syncData'],
  watch: {
    syncData: watchSyncData
  }
};
</script>
