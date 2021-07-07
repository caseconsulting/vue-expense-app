<template>
  <div class="clearanceTab">
    <!-- Employee has Clearances -->
    <div v-if="!isEmpty(model.clearances)">
      <!-- Loop Clearances -->
      <div v-for="(clearance, index) in this.filteredList" :key="index">
        <!-- Type -->
        <p><b>Type: </b>{{ clearance.type }}</p>

        <!-- Submission, Granted, Expiration Date -->
        <p v-if="clearance.submissionDate">
          <b>Submission Date: </b>{{ clearance.submissionDate | monthDayYearFormat }}
        </p>
        <p v-if="clearance.grantedDate"><b>Granted Date: </b>{{ clearance.grantedDate | monthDayYearFormat }}</p>
        <p v-if="clearance.expirationDate">
          <b>Expiration Date: </b>{{ clearance.expirationDate | monthDayYearFormat }}
        </p>

        <!-- Poly Dates -->
        <p v-if="clearance.polyDates.length > 0" class="mb-2"><b>Poly Dates: </b></p>
        <ul v-if="clearance.polyDates.length > 0" class="mb-4">
          <li v-for="(polyDate, pIndex) in clearance.polyDates" :key="pIndex">{{ polyDate | monthDayYearFormat }}</li>
        </ul>

        <!-- Adjudication Dates -->
        <p v-if="clearance.adjudicationDates.length > 0" class="mb-2"><b>Adjudication Dates: </b></p>
        <ul v-if="clearance.adjudicationDates.length > 0" class="mb-4">
          <li v-for="(adjudicationDate, aIndex) in clearance.adjudicationDates" :key="aIndex">
            {{ adjudicationDate | monthDayYearFormat }}
          </li>
        </ul>

        <!-- Badge Expiration Date -->
        <p v-if="clearance.badgeExpirationDate">
          <b>Badge Expiration Date: </b>{{ clearance.badgeExpirationDate | monthDayYearFormat }}
        </p>

        <!-- BI Dates -->
        <p v-if="clearance.biDates.length > 0" class="mb-2"><b>BI Dates: </b></p>
        <ul v-if="clearance.biDates.length > 0" class="mb-4">
          <li v-for="(biDates, biIndex) in clearance.biDates" :key="biIndex">
            <div v-if="biDates.range.length > 1">
              {{ biDates.range[0] | monthDayYearFormat }} - {{ biDates.range[1] | monthDayYearFormat }}
            </div>
            <div v-else>On-going ({{ biDates.range[0] | monthDayYearFormat }})</div>
          </li>
        </ul>
        <hr v-if="index < filteredList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Clearances -->
    </div>
    <!-- Employee does not have Clearances -->
    <p v-else>No Clearance Information</p>
    <div v-if="!isEmpty(this.model.clearances)" class="text-center">
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.clearances.length / 5)"
        :total-visible="8"
        @input="onPageChange"
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
  if (!isEmpty(this.model.clearances)) {
    this.filteredList = this.model.clearances.slice(0, 5);
  }
}

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
}

export default {
  created,
  data() {
    return {
      filteredList: [],
      page: 1
    };
  },
  filters: {
    monthDayYearFormat
  },
  methods: {
    isEmpty,
    onPageChange
  },
  props: ['model']
};
</script>
