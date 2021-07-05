<template>
  <div class="infoTab">
    <!-- Employee has Contracts -->
    <div v-if="!isEmpty(this.filteredList)">
      <!-- Loop Contracts -->
      <div v-for="(contract, index) in this.filteredList" :key="contract.name + index">
        <p><b>Contract: </b>{{ contract.name }}</p>
        <p><b>Prime: </b>{{ contract.prime }}</p>
        <p><b>Current: </b>{{ contract.current | current }}</p>
        <hr v-if="index < filteredList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Contracts -->
    </div>
    <!-- Employee does not have Contracts -->
    <p v-else>No Contracts Information</p>
    <div v-if="!isEmpty(this.model.contracts)" class="text-center">
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.contracts.length / 5)"
        :total-visible="8"
        @input="onPageChange"
      ></v-pagination>
    </div>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
function created() {
  if (!isEmpty(this.model.contracts)) {
    this.filteredList = this.model.contracts.slice(0, 5);
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
  var startIndex = 5 * (this.page - 1); //each page contains 5 contract entries
  var endIndex = startIndex + 5;
  this.filteredList = this.model.contracts.slice(startIndex, endIndex);
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
    current: (value) => {
      return value ? 'Yes' : 'No';
    }
  },
  methods: {
    isEmpty,
    onPageChange
  },
  props: ['model']
};
</script>
