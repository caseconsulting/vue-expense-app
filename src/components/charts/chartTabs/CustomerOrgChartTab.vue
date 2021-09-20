<template>
  <v-container>
    <v-row justify="center">
      <v-col md="6" sm="12" class="mt-4">
        <i-c-table :employees3="employees2" />
      </v-col>
      <v-col md="6" sm="12" class="mt-4">
        <customer-org-chart :employees3="employees2" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CustomerOrgChart from '../customCharts/CustomerOrgChart.vue';
import ICTable from '../customCharts/IcTable.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { CustomerOrgChart, ICTable },
  props: ['employees2']
};
</script>
