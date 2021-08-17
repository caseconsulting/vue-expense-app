<template>
  <v-card>
    <v-card color="#bc3825">
      <v-card-title><h2 class="white--text">Resume Audits</h2></v-card-title>
    </v-card>
    <v-container fluid>
      <v-row>
        <v-col>
          <pie-chart :options="resumeChartOptions" :chartData="resumeChartData"></pie-chart>
        </v-col>
        <v-col>
          <pie-chart :options="resumeChart2Options" :chartData="resumeChart2Data"></pie-chart>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-data-table :headers="headers" :items="resumeAudits" class="elevation-1"> </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api';
import _ from 'lodash';
import PieChart from '@/components/charts/baseCharts/PieChart.vue';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

async function fillData() {
  this.resumeAudits = [];
  let resumeAudits = await api.getAudits('resume', this.numDaysBackToQuery);

  _.forEach(resumeAudits, (audit) => {
    audit.dateCreated = moment(audit.dateCreated).format(IsoFormat);
    this.resumeAudits.push({ dateCreated: audit.dateCreated, description: audit.description });
  });

  let resumeParseSuccesses = resumeAudits.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('success') && audit.tags.includes('upload');
    }
  });
  let resumeParseFailures = resumeAudits.filter((audit) => {
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
    text = 'Proportion of Resumes Successfully Parsed';
    showToolTips = true;
  } else {
    data = [1];
    backgroundColor = ['grey'];
    text = 'No Resume Parser Audits in Time Frame';
    showToolTips = false;
  }

  this.resumeChartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColor
      }
    ]
  };

  this.resumeChartOptions = {
    title: {
      display: true,
      text: text,
      fontSize: 15
    },

    maintainAspectRatio: false,
    tooltips: {
      enabled: showToolTips
    }
  };

  // For resume chart 2
  let resumeParseSubmits = resumeAudits.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('submit');
    }
  });

  let numSubmits = resumeParseSubmits.length;

  if (successes > 0 || numSubmits > 0) {
    labels = ['Only Successful Parse', 'Submitted Changes'];
    data = [successes - numSubmits, numSubmits];
    backgroundColor = ['rgba(134, 31, 65, 1)', 'rgba(232, 119, 34, 1)'];
    text = 'Proportion of People Who Submitted Changes';
    showToolTips = true;
  } else {
    data = [1];
    backgroundColor = ['grey'];
    text = 'No Resume Parser Audits in Time Frame';
    showToolTips = false;
  }

  this.resumeChart2Data = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColor
      }
    ]
  };

  this.resumeChart2Options = {
    title: {
      display: true,
      text: text,
      fontSize: 15
    },

    maintainAspectRatio: false,
    tooltips: {
      enabled: showToolTips
    }
  };
}

export default {
  components: { PieChart },
  component: {
    PieChart
  },
  created() {
    this.fillData();
  },
  data() {
    return {
      headers: [
        {
          text: 'Event Date',
          value: 'dateCreated'
        },
        {
          text: 'Description',
          value: 'description'
        }
      ], // datatable headers
      resumeAudits: [],
      resumeChartOptions: null,
      resumeChartData: null,
      resumeChart2Options: null,
      resumeChart2Data: null
    };
  },
  methods: {
    fillData
  },
  props: ['numDaysBackToQuery'],
  watch: {
    numDaysBackToQuery() {
      this.fillData();
    }
  }
};
</script>

<style></style>
