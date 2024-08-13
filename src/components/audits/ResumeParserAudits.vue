<template>
  <v-container fluid>
    <v-row v-if="chartsLoaded">
      <v-col sm="12" md="6">
        <pie-chart chartId="resume-1" :options="resumeChartOptions" :chartData="resumeChartData"></pie-chart>
      </v-col>
      <v-col sm="12" md="6">
        <pie-chart chartId="resume-2" :options="resumeChart2Options" :chartData="resumeChart2Data"></pie-chart>
      </v-col>
    </v-row>
    <v-divider class="mt-5"></v-divider>
    <audits-table :audits="resumeAudits"></audits-table>
  </v-container>
</template>

<script setup>
import api from '@/shared/api';
import _forEach from 'lodash/forEach';
import _find from 'lodash/find';
import PieChart from '@/components/charts/base-charts/PieChart.vue';
import AuditsTable from '@/components/audits/AuditsTable.vue';
import { storeIsPopulated } from '@/utils/utils.js';
import { format } from '../../shared/dateUtils';
import { onBeforeMount, ref, watch } from 'vue';
import { computed } from 'vue';
import { useStore } from 'vuex';
import { updateStoreEmployees } from '../../utils/storeUtils';
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|
const props = defineProps(['queryStartDate', 'queryEndDate', 'show24HourTitle']);
const store = useStore();

const chartsLoaded = ref(false);
const employees = ref([]);
const resumeAudits = ref([]);
const resumeChartOptions = ref(null);
const resumeChartData = ref(null);
const resumeChart2Options = ref(null);
const resumeChart2Data = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Generates chart data and table
 */
async function fillData() {
  let resumeData = await api.getAudits('resume', props.queryStartDate, props.queryEndDate);

  _forEach(resumeData, (audit) => {
    audit.dateCreated = format(audit.dateCreated, null, IsoFormat);
    let employee = _find(employees.value, (emp) => {
      return emp.id === audit.employeeId;
    });

    resumeAudits.value.push({
      dateCreated: audit.dateCreated,
      description: audit.description,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      nickname: employee.nickname ? employee.nickname : ''
    });
  });

  let resumeParseSuccesses = resumeData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('success') && audit.tags.includes('upload');
    }
  });
  let resumeParseFailures = resumeData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('failure') && audit.tags.includes('upload');
    }
  });

  // For resume chart 1
  let successes = resumeParseSuccesses.length;
  let failures = resumeParseFailures.length;

  let labels = [];
  let data;
  let backgroundColor;
  let text;
  let showToolTips;

  if (successes > 0 || failures > 0) {
    labels = ['Successful', 'Failed'];
    data = [successes, failures];
    backgroundColor = ['rgba(50, 168, 82, 1)', 'rgba(230, 61, 55, 1)'];
    text = props.show24HourTitle
      ? 'Proportion of Resumes Successfully Parsed In Last 24 Hours'
      : 'Proportion of Resumes Successfully Parsed';
    showToolTips = true;
  } else {
    data = [1];
    backgroundColor = ['grey'];
    text = props.show24HourTitle ? 'No Resume Parser Audits In Last 24 Hours' : 'No Resume Parser Audits in Date Range';
    showToolTips = false;
  }

  resumeChartData.value = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColor
      }
    ]
  };

  resumeChartOptions.value = {
    plugins: {
      title: {
        display: true,
        text: text,
        font: {
          size: 15
        }
      },
      tooltip: {
        enabled: false
      }
    },
    maintainAspectRatio: false
  };

  // For resume chart 2
  let resumeParseSubmits = resumeData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('submit');
    }
  });

  let numSubmits = resumeParseSubmits.length;

  if (successes > 0 || numSubmits > 0) {
    labels = ['Only Successful Parse', 'Submitted Changes'];
    data = [successes - numSubmits, numSubmits];
    backgroundColor = ['rgba(134, 31, 65, 1)', 'rgba(232, 119, 34, 1)'];
    text = props.show24HourTitle
      ? 'Proportion of People Who Submitted Changes In Last 24 Hours'
      : 'Proportion of People Who Submitted Changes';
    showToolTips = true;
  } else {
    data = [1];
    backgroundColor = ['grey'];
    text = props.show24HourTitle ? 'No Resume Parser Audits In Last 24 Hours' : 'No Resume Parser Audits Date Range';
    showToolTips = false;
  }

  resumeChart2Data.value = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColor
      }
    ]
  };

  resumeChart2Options.value = {
    plugins: {
      title: {
        display: true,
        text: text,
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
  chartsLoaded.value = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(async () => {
  if (!store.getters.employees) {
    await updateStoreEmployees();
  }
  employees.value = store.getters.employees; // get all employees
  await fillData();
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * returns the combined date range computed value
 */
const dateRange = computed(() => `${props.queryStartDate} ${props.queryEndDate}`);

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

// fills data when dateRange changes
watch(
  () => dateRange,
  async () => {
    await this.fillData();
  }
);

// fills data when store is populated since employees are needed to fill data
watch(
  () => storeIsPopulated,
  async () => {
    if (this.storeIsPopulated) {
      employees.value = store.getters.employees; // get all employees
      await this.fillData();
    }
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|
</script>
