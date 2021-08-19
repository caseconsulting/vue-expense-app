<template>
  <v-card>
    <v-container fluid>
      <v-row>
        <bar-chart :options="loginChartOptions" :chartData="loginChartData"></bar-chart>
      </v-row>
      <audit-table :audits="loginAudits"></audit-table>
    </v-container>
  </v-card>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api';
import BarChart from '../charts/baseCharts/BarChart.vue';
import AuditTable from '@/components/AuditTable';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

async function fillData() {
  this.loginAudits = [];
  let loginAudits = await api.getAudits('login', this.queryStartDate, this.queryEndDate);
  _.forEach(loginAudits, (audit) => {
    audit.dateCreated = moment(audit.dateCreated).format(IsoFormat);
    let employee = _.find(this.employees, (emp) => {
      return emp.id === audit.employeeId;
    });

    this.loginAudits.push({
      dateCreated: audit.dateCreated,
      description: audit.description,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      nickname: employee.nickname ? employee.nickname : ''
    });
  });
}

export default {
  components: { BarChart, AuditTable },
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES); // get all employees
    this.fillData();
  },
  data() {
    return {
      loginAudits: [],
      loginChartOptions: null
    };
  },
  methods: { fillData },
  props: ['queryStartDate', 'queryEndDate'],
  watch: {
    queryStartDate() {
      this.fillData();
    },
    queryEndDate() {
      this.fillData();
    }
  }
};
</script>

<style></style>
