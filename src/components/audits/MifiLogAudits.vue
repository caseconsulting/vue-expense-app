<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <pie-chart
          v-if="chartLoaded"
          chartId="mifi-audit"
          :options="mifiChartOptions"
          :chartData="mifiChartData"
        ></pie-chart>
      </v-col>
    </v-row>
    <audits-table :audits="mifiAudits"></audits-table>
  </v-container>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api';
import PieChart from '../charts/base-charts/PieChart.vue';
import AuditsTable from '@/components/audits/AuditsTable.vue';
import { storeIsPopulated } from '@/utils/utils.js';
import { format } from '../../shared/dateUtils';
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
async function created() {
  if (this.storeIsPopulated) {
    this.employees = this.$store.getters.employees; // get all employees
    await this.fillData();
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Generates chart data and table
 */
async function fillData() {
  //obtains all mifi related entries in the audits DB
  //set to null so its data is reset each time the chart renders (changing date ranges)
  let mifiData = await api.getAudits('mifi', this.queryStartDate, this.queryEndDate);

  _.forEach(mifiData, (audit) => {
    audit.dateCreated = format(audit.dateCreated, null, IsoFormat);
    let employee = _.find(this.employees, (emp) => {
      return emp.id === audit.employeeId;
    });
    //adds mifi audit object into array
    this.mifiAudits.push({
      dateCreated: audit.dateCreated,
      description: audit.description,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      nickname: employee.nickname ? employee.nickname : ''
    });
  });
  let haveMifiEnabled = mifiData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('mifi set to true');
    }
  });
  let haveMifiDisabled = mifiData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('mifi set to false');
    }
  });

  let colors;
  let data;
  let labels = [];
  let showToolTips;
  let title;

  if (haveMifiEnabled.length === 0 && haveMifiDisabled.length === 0) {
    colors = 'grey';
    data = [1];
    showToolTips = false;
    title = this.show24HourTitle ? 'No Mifi Changes In Last 24 Hours' : 'No Mifi Changes In Selected Date Range';
  } else {
    colors = ['#450084', '#CBB677'];
    data = [haveMifiEnabled.length, haveMifiDisabled.length];
    labels = ['Enabled', 'Disabled'];
    showToolTips = true;
    title = this.show24HourTitle
      ? 'Mifi Changes For Last 24 Hours'
      : `Mifi Changes From ${format(this.queryStartDate, null, 'MM/DD/YY')} to ${format(
          this.queryEndDate,
          null,
          'MM/DD/YY'
        )}`;
  }

  this.mifiChartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: colors
      }
    ]
  };

  this.mifiChartOptions = {
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 15
        }
      },
      tooltip: {
        enabled: showToolTips
      }
    },

    maintainAspectRatio: false
  };
  this.chartLoaded = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * returns the combined date range computed value
 *
 * @return - full date range
 */
function dateRange() {
  return `${this.queryStartDate} ${this.queryEndDate}`;
} // dateRange

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * fills data when dateRange changes
 */
async function watchDateRange() {
  await this.fillData();
} // watchDateRange

/**
 * fills data when store is populated since employees are needed to fill data
 */
async function watchStoreIsPopulated() {
  if (this.storeIsPopulated) {
    this.employees = this.$store.getters.employees; // get all employees
    await this.fillData();
  }
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { PieChart, AuditsTable },
  computed: {
    dateRange,
    storeIsPopulated
  },
  created,
  data() {
    return {
      chartLoaded: false,
      mifiAudits: [],
      mifiChartOptions: null,
      mifiChartData: null
    };
  },
  methods: { fillData },
  props: ['queryStartDate', 'queryEndDate', 'show24HourTitle'],
  watch: {
    dateRange: watchDateRange,
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>

<style></style>
