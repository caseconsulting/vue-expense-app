<template>
  <v-container fluid class="px-1 px-md-4">
    <v-row justify="center" class="d-flex align-center">
      <v-col cols="12" sm="12" md="6" lg="6" xl="6" xxl="6" class="mt-4">
        <i-c-table />
      </v-col>
    </v-row>

    <v-row justify="center" class="d-flex align-center">
      <v-col cols="12" sm="12" md="6" lg="6" xl="6" xxl="6" class="mt-4">
        <customer-org-chart />
      </v-col>
      <v-col cols="12" sm="12" md="6" lg="6" xl="6" xxl="6" class="mt-4">
        <employees-customer-org-chart />
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import CustomerOrgChart from '../custom-charts/CustomerOrgChart.vue';
import EmployeesCustomerOrgChart from '../custom-charts/EmployeesCustomerOrgChart.vue';
import ICTable from '../custom-charts/IcTable.vue';
</script>
