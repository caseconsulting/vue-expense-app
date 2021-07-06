<template>
  <v-container>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <customer-org-chart />
      </v-col>
      <v-col md="6" sm="12" class="mt-4">
        <i-c-table />
      </v-col>
    </v-row>
    <v-row>
      <v-col md="6" sm="12" class="mt-4">
        <certification-chart />
      </v-col>
      <v-col md="6" sm="12" class="my-4">
        <certification-chart />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ICTable from '../customCharts/IcTable.vue';
import CertificationChart from '../customCharts/CertificationChart.vue';
import CustomerOrgChart from '../customCharts/CustomerOrgChart.vue';

export default {
  components: { CertificationChart, ICTable, CustomerOrgChart }
};
</script>
