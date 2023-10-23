<template>
  <div class="clearanceTab">
    <!-- Employee has Clearances -->
    <div v-if="!isEmpty(model.clearances)">
      <!-- Loop Clearances -->
      <div v-for="(clearance, index) in this.filteredList" :key="index">
        <!-- Type -->
        <p>
          <b>Type: </b>{{ clearance.type }}
          <span v-if="clearance.awaitingClearance" class="font-weight-bold text-red"> (awaiting clearance)</span>
        </p>

        <!-- Submission, Granted Date -->
        <p v-if="clearance.submissionDate">
          <b>Submission Date: </b>{{ monthDayYearFormat(clearance.submissionDate) }}
        </p>
        <p v-if="clearance.grantedDate"><b>Granted Date: </b>{{ monthDayYearFormat(clearance.grantedDate) }}</p>

        <!-- Badge Number -->
        <p v-if="clearance.badgeNum"><b>Badge Number: </b>{{ clearance.badgeNum }}</p>

        <!-- Badge Expiration Date -->
        <p v-if="clearance.badgeExpirationDate">
          <b>Badge Expiration Date: </b>{{ monthDayYearFormat(clearance.badgeExpirationDate) }}
        </p>

        <!-- BI Dates -->
        <p v-if="clearance.biDates.length == 1"><b>Bi Date: </b> {{ monthDayYearFormat(clearance.biDates[0]) }}</p>
        <p v-if="clearance.biDates.length > 1" class="mb-2"><b>Bi Dates: </b></p>
        <ul v-if="clearance.biDates.length > 1" class="mb-4 ml-6">
          <li v-for="(biDate, pIndex) in clearance.biDates" :key="pIndex">{{ monthDayYearFormat(biDate) }}</li>
        </ul>

        <!-- Adjudication Dates -->
        <p v-if="clearance.adjudicationDates.length == 1" class="mb-4">
          <b>Adjudication Date: </b>{{ monthDayYearFormat(clearance.adjudicationDates[0]) }}
        </p>
        <p v-if="clearance.adjudicationDates.length > 1" class="mb-2"><b>Adjudication Dates: </b></p>
        <ul v-if="clearance.adjudicationDates.length > 1" class="mb-4 ml-6">
          <li v-for="(adjudicationDate, aIndex) in clearance.adjudicationDates" :key="aIndex">
            {{ monthDayYearFormat(adjudicationDate) }}
          </li>
        </ul>

        <!-- Poly Dates -->
        <p v-if="clearance.polyDates.length == 1">
          <b>Poly Date: </b> {{ monthDayYearFormat(clearance.polyDates[0]) }}
        </p>
        <p v-if="clearance.polyDates.length > 1" class="mb-2"><b>Poly Dates: </b></p>
        <ul v-if="clearance.polyDates.length > 1" class="mb-4 ml-6">
          <li v-for="(polyDate, pIndex) in clearance.polyDates" :key="pIndex">{{ monthDayYearFormat(polyDate) }}</li>
        </ul>
        <hr v-if="index < filteredList.length - 1" class="my-3" />
      </div>
      <!-- End Loop Clearances -->
    </div>
    <!-- Employee does not have Clearances -->
    <p v-else>No Clearance Information</p>
    <!-- Pagination -->
    <div v-if="!isEmpty(this.model.clearances) && Math.ceil(model.clearances.length / 5) != 1" class="text-center">
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.clearances.length / 5)"
        :total-visible="8"
        @update:model-value="onPageChange"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { isEmpty, monthDayYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!this.isEmpty(this.model.clearances)) {
    this.filteredList = this.model.clearances.slice(0, 5);
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * When the page is changed, grab the corresponding entries based on the page
 * number.
 */
function onPageChange() {
  var startIndex = 5 * (this.page - 1); //each page contains 5 Clearance entries
  var endIndex = startIndex + 5;
  this.filteredList = this.model.clearances.slice(startIndex, endIndex);
} // onPageChange

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      filteredList: [],
      page: 1
    };
  },
  methods: {
    isEmpty,
    monthDayYearFormat,
    onPageChange
  },
  props: ['model']
};
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
