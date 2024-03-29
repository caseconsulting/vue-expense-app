<template>
  <div class="infoTab">
    <!-- Employee has Certifications -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Certifications -->
      <div v-for="(certification, index) in this.filteredList" :key="certification.name + index">
        <p><b>Certification: </b>{{ certification.name }}</p>
        <p><b>Date Received: </b>{{ monthDayYearFormat(certification.dateReceived) }}</p>
        <p v-if="certification.expirationDate">
          <b>Expiration Date: </b>{{ monthDayYearFormat(certification.expirationDate) }}
        </p>
        <hr v-if="index < filteredList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Certifications -->
    </div>
    <!-- Employee does not have Certifications -->
    <p v-else>No Certification Information</p>
    <div
      v-if="!isEmpty(this.model.certifications) && Math.ceil(model.certifications.length / 5) != 1"
      class="text-center"
    >
      <!-- Pagination -->
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.certifications.length / 5)"
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
  if (!this.isEmpty(this.model.certifications)) {
    this.filteredList = this.model.certifications.slice(0, 5);
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
  var startIndex = 5 * (this.page - 1); //each page contains 5 certification entries
  var endIndex = startIndex + 5;
  this.filteredList = this.model.certifications.slice(startIndex, endIndex);
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
