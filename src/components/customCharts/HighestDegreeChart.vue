<template>
  <pie-chart v-if="dataReceived" :options="options" :chartData="chartData" />
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';
import api from '@/shared/api.js';

function fillData() {
  this.employees.forEach((emp) => {
    if (emp.degrees) {
      console.log(emp);
    }
  });
  this.dataReceived = false;
}
export default {
  components: { PieChart },
  data() {
    return {
      dataReceived: false,
      options: null,
      chartData: null
    };
  },
  methods: {
    fillData
  },
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES);
    this.fillData();
  }
};
</script>

<style></style>
