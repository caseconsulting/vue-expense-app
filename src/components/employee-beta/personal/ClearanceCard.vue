<template>
  <v-card class="infoTab">
    <v-card-title class="d-flex align-center justify-space-between beta_header_style">
      <h3 class="text-white px-2">
        <v-icon size="small" style="margin-right: 10px" id="personal" color="white"> mdi-shield </v-icon>Clearance
      </h3>
      <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text" icon="">
        <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
        <v-icon id="edit" color="white"> mdi-pencil </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="px-7 pt-5 pb-1 text-black">
      <p v-if="!isEmpty(getClearanceType())" style="margin-bottom: 5px; font-size: 25px">
        <b>{{ getClearanceType() }}</b>
      </p>
      <div style="padding-left: 10px">
        <p v-if="!isEmpty(getSubmissionDate())" style="margin-bottom: 10px">
          <b>Submission: </b>{{ getSubmissionDate() }}
        </p>
        <p v-if="!isEmpty(getGrantedDate())" style="margin-bottom: 10px; margin-top: -5px">
          <b>Granted: </b>{{ getGrantedDate() }}
        </p>
      </div>
      <p v-if="!isEmpty(getBadgeNumber())"><b>Badge Number: </b>{{ getBadgeNumber() }}</p>
      <p v-if="!isEmpty(getBadgeExpirationDate())" style="margin-top: -5px; padding-left: 10px">
        <b>Expiration: </b>{{ getBadgeExpirationDate() }}
      </p>
      <p v-if="!isEmpty(getAdjudicationDates()) && checkAwaitingClearance()">
        <b>Adjudication Dates: </b>{{ getAdjudicationDates() }}
      </p>
      <p v-if="!isEmpty(getBiDates()) && checkAwaitingClearance()"><b>Bi Dates: </b>{{ getBiDates() }}</p>
      <p v-if="!isEmpty(getPolyDates()) && checkAwaitingClearance()"><b>Poly Dates: </b>{{ getPolyDates() }}</p>
    </v-card-text>
    <p v-if="isEmpty(clearances)" style="text-align: center">No Clearance Information</p>
    <div class="text-center">
      <v-btn size="small" variant="text">Click to view more</v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ref, inject, onBeforeMount } from 'vue';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
const clearances = ref([]);
const displayedClearance = ref([]);

onBeforeMount(() => {
  console.log(props.model);
  getClearances();
});

/**
 * Gets the employee's clearances - prioritizes granted over awaited clearances
 */
function getClearances() {
  clearances.value = props.model.clearances;
  if (!isEmpty(clearances.value)) {
    clearances.value.forEach((clearance) => {
      if (!clearance['awaitingClearance']) {
        displayedClearance.value = clearance;
        return;
      }
    });
    if (isEmpty(displayedClearance.value)) {
      displayedClearance.value = clearances.value[0];
    }
  }
}
/**
 * Returns whether or not the employee is still awaiting clearance
 *
 * @return boolean - whether or not clearance has been granted
 */
function checkAwaitingClearance() {
  return displayedClearance.value.awaitingClearance;
}

/**
 * Returns the type of clearance
 *
 * @return String - clearance type
 */
function getClearanceType() {
  if (checkAwaitingClearance()) {
    return displayedClearance.value.type + ' - Awaiting Clearance';
  }
  return displayedClearance.value.type;
}

/**
 * Returns clearance submission date
 *
 * @return String - submission date
 */
function getSubmissionDate() {
  return monthDayYearFormat(displayedClearance.value.submissionDate);
}

/**
 * Returns clearance granted date
 *
 * @return String - granted date
 */
function getGrantedDate() {
  if (!checkAwaitingClearance()) {
    return monthDayYearFormat(displayedClearance.value.grantedDate);
  } else {
    return null;
  }
}

/**
 * Returns clearance adjudication dates
 *
 * @return String - adjudication dates
 */
function getAdjudicationDates() {
  let dates = null;
  if (!isEmpty(displayedClearance.value['adjudicationDates'])) {
    displayedClearance.value['adjudicationDates'].forEach((adjudicationDate) => {
      if (isEmpty(dates)) {
        dates = monthDayYearFormat(adjudicationDate);
      } else {
        dates = dates + ', ' + monthDayYearFormat(adjudicationDate);
      }
    });
  }
  return dates;
}

/**
 * Returns clearance bi dates
 *
 * @return String - bi dates
 */
function getBiDates() {
  let dates = null;
  if (!isEmpty(displayedClearance.value['biDates'])) {
    displayedClearance.value['biDates'].forEach((biDate) => {
      if (isEmpty(dates)) {
        dates = monthDayYearFormat(biDate);
      } else {
        dates = dates + ', ' + monthDayYearFormat(biDate);
      }
    });
  }
  return dates;
}

/**
 * Returns clearance poly dates
 *
 * @return String - poly dates
 */
function getPolyDates() {
  let dates = null;
  if (!isEmpty(displayedClearance.value['adjudicationDates'])) {
    displayedClearance.value['polyDates'].forEach((polyDate) => {
      if (isEmpty(dates)) {
        dates = monthDayYearFormat(polyDate);
      } else {
        dates = dates + ', ' + monthDayYearFormat(polyDate);
      }
    });
  }
  return dates;
}

/**
 * Returns employee badge number
 *
 * @return String - badge number
 */
function getBadgeNumber() {
  if (!checkAwaitingClearance()) {
    return displayedClearance.value.badgeNum;
  } else {
    return null;
  }
}

/**
 * Returns badge expiration date
 *
 * @return String - expiration date
 */
function getBadgeExpirationDate() {
  if (!checkAwaitingClearance()) {
    return monthDayYearFormat(displayedClearance.value.badgeExpirationDate);
  } else {
    return null;
  }
}
</script>
