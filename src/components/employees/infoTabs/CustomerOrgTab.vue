<template>
  <div class="infoTab">
    <!-- Employee has Customer Organization Experience -->
    <div v-if="!isEmpty(model.customerOrgExp)">
      <!-- Loop Customer Organizations -->
      <div v-for="(exp, index) in this.filteredList" :key="exp.name + index">
        <v-row>
          <v-col>
            <p><b>Customer Organization Experience: </b>{{ exp.name }}</p>
          </v-col>
          <v-col>
            <v-tooltip v-if="exp.current" right>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">check</v-icon>
              </template>
              <span>Current Organization</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <p><b>Years of Experience: </b>{{ exp.years }}</p>
        <hr v-if="index < filteredList.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Customer Organizations -->
    </div>
    <!-- Employee does not have Customer Organization Experience -->
    <p v-else>No Customer Organization Experience Information</p>
    <div
      v-if="!isEmpty(this.model.customerOrgExp) && Math.ceil(model.customerOrgExp.length / 5) != 1"
      class="text-center"
    >
      <!-- Pagination -->
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.customerOrgExp.length / 5)"
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
  if (!isEmpty(this.model.customerOrgExp)) {
    this.filteredList = this.model.customerOrgExp.slice(0, 5);
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
  var startIndex = 5 * (this.page - 1); //each page contains 5 Customer Org entries
  var endIndex = startIndex + 5;
  this.filteredList = this.model.customerOrgExp.slice(startIndex, endIndex);
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
