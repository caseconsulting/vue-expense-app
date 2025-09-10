<template>
  <v-list>
    <v-list-item class="pr-0" v-for="(clearance, index) in list" :key="clearance + index">
      <v-row no-gutters class="pa-0">
        <v-card-text class="pb-0 pt-2">
          <p v-if="!isEmpty(getClearanceType(clearance))" class="mb-1 clearance-type-text">
            <b>{{ getClearanceType(clearance) }}</b>
          </p>
          <div>
            <p class="mb-1" v-if="!isEmpty(getReinvestigationDate(clearance))">
              <b>Reinvestigation Submission: </b>{{ getReinvestigationDate(clearance) }}
            </p>
            <p class="mb-1" v-if="!isEmpty(getSubmissionDate(clearance))">
              <b>Submission: </b>{{ getSubmissionDate(clearance) }}
            </p>
            <p class="mb-1" v-if="!isEmpty(getGrantedDate(clearance))">
              <b>Granted: </b>{{ getGrantedDate(clearance) }}
            </p>
          </div>
          <p v-if="!isEmpty(getGrantingOrg(clearance))" class="gray-text ml-6 mb-0">
            <b>Granting Org: </b>{{ getGrantingOrg(clearance) }}
          </p>
          <p v-if="!isEmpty(getBadgeNumber(clearance))" class="gray-text ml-6 mb-0">
            <b>Badge Number: </b>{{ getBadgeNumber(clearance) }}
          </p>
          <p v-if="!isEmpty(getBadgeExpirationDate(clearance))" class="gray-text ml-6 mb-0">
            <b>Badge Expiration: </b>{{ getBadgeExpirationDate(clearance) }}
          </p>
          <p class="mb-1" v-if="toggleModal && !isEmpty(getAdjudicationDates(clearance))">
            <b>Adjudication Dates: </b>{{ getAdjudicationDates(clearance) }}
          </p>
          <p class="mb-1" v-if="toggleModal && !isEmpty(getBIDates(clearance))">
            <b>BI Dates: </b>{{ getBIDates(clearance) }}
          </p>
          <p v-if="toggleModal && !isEmpty(getPolyDates(clearance))" class="pb-1">
            <b>Poly Dates: </b>{{ getPolyDates(clearance) }}
          </p>
        </v-card-text>
      </v-row>
      <v-row no-gutters class="mx-2">
        <v-divider v-if="index < list.length - 1" />
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { isEmpty, monthDayYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

defineProps({
  list: {
    type: Array,
    required: true
  },
  toggleModal: {
    type: Boolean
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns the type of clearance
 *
 * @param {*} clearance The clearance object
 * @return String - clearance type
 */
function getClearanceType(clearance) {
  return clearance.displayText;
}

/**
 * Returns clearance submission date
 *
 * @param {*} clearance The clearance object
 * @return String - submission date
 */
function getSubmissionDate(clearance) {
  return monthDayYearFormat(clearance.submissionDate);
}


/**
 * Returns clearance submission date
 *
 * @param {*} clearance The clearance object
 * @return String - submission date
 */
function getReinvestigationDate(clearance) {
  return monthDayYearFormat(clearance.reinvestigationSubmissionDate);
}

/**
 * Returns clearance granted date
 *
 * @param {*} clearance The clearance object
 * @return String - granted date
 */
function getGrantedDate(clearance) {
  if (!clearance.awaitingClearance) return monthDayYearFormat(clearance.grantedDate);
  else return null;
}

/**
 * Returns employee granting org
 *
 * @param {*} clearance The clearance object
 * @return String - badge number
 */
function getGrantingOrg(clearance) {
  return clearance.grantingOrg;
}

/**
 * Returns employee badge number
 *
 * @param {*} clearance The clearance object
 * @return String - badge number
 */
function getBadgeNumber(clearance) {
  if (!clearance.awaitingClearance) return clearance.badgeNum;
  else return null;
}

/**
 * Returns badge expiration date
 *
 * @param {*} clearance The clearance object
 * @return String - expiration date
 */
function getBadgeExpirationDate(clearance) {
  if (!clearance.awaitingClearance) return monthDayYearFormat(clearance.badgeExpirationDate);
  else return null;
}

/**
 * Returns clearance adjudication dates
 *
 * @param {*} clearance The clearance object
 * @return String - adjudication dates
 */
function getAdjudicationDates(clearance) {
  let dates = null;
  if (!isEmpty(clearance.adjudicationDates)) {
    clearance.adjudicationDates.forEach((adjudicationDate) => {
      if (isEmpty(dates)) dates = monthDayYearFormat(adjudicationDate);
      else dates = dates + '; ' + monthDayYearFormat(adjudicationDate);
    });
  }
  return dates;
}

/**
 * Returns clearance BI dates
 *
 * @param {*} clearance The clearance object
 * @return String - Bi dates
 */
function getBIDates(clearance) {
  let dates = null;
  if (!isEmpty(clearance.biDates)) {
    clearance.biDates.forEach((biDate) => {
      if (isEmpty(dates)) dates = monthDayYearFormat(biDate);
      else dates = dates + '; ' + monthDayYearFormat(biDate);
    });
  }
  return dates;
}

/**
 * Returns clearance poly dates
 *
 * @param {*} clearance The clearance object
 * @return String - poly dates
 */
function getPolyDates(clearance) {
  let dates = null;
  if (!isEmpty(clearance.adjudicationDates)) {
    clearance.polyDates.forEach((polyDate) => {
      if (isEmpty(dates)) dates = monthDayYearFormat(polyDate);
      else dates = dates + '; ' + monthDayYearFormat(polyDate);
    });
  }
  return dates;
}
</script>

<style scoped>
.clearance-type-text {
  font-size: 16px;
}
</style>
