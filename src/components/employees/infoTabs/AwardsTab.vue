<template>
  <div class="infoTab">
    <!-- Employee has Awards -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Awards -->
      <div v-for="(award, index) in this.filteredList" :key="award.name + index">
        <p><b>Award: </b>{{ award.name }}</p>
        <p><b>Date Received: </b>{{ award.dateReceived | monthYearFormat }}</p>
        <hr v-if="index < filteredList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Awards -->
    </div>
    <!-- Employee does not have Awards -->
    <p v-else>No Award Information</p>
    <!-- Pagination -->
    <div v-if="!isEmpty(this.model.awards) && Math.ceil(model.awards.length / 5) != 1" class="text-center">
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.awards.length / 5)"
        :total-visible="8"
        @input="onPageChange"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { isEmpty, monthYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!this.isEmpty(this.model.awards)) {
    this.filteredList = this.model.awards.slice(0, 5);
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
  var startIndex = 5 * (this.page - 1); //each page contains 5 award entries
  var endIndex = startIndex + 5;
  this.filteredList = this.model.awards.slice(startIndex, endIndex);
}

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
    onPageChange
  },
  filters: {
    monthYearFormat
  },
  props: ['model']
};
</script>
