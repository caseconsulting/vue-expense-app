<template>
  <v-container>
    <h1>Employee Statistics Dashboard</h1>
    <job-experience-histogram> :options="" :chart-data="" </job-experience-histogram>
  </v-container>
</template>
<script>
import api from '@/shared/api.js';
import JobExperienceHistogram from '@/components/JobExperienceHistogram.vue';
//import _ from 'lodash';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

function jobExperienceData() {
  // //init the jobExperience array
  // for (let i = 0; i < MAXIMUM_INDEX; i++) {
  //   this.jobExperience[i] = 0;
  // }
  // this.employees.forEach((employee, index) => {
  //   if (employee.hireDate !== 'undefined') {
  //     // find time at case
  //     let amOfYears = calculateTimeDifference(hireDate, todaysDate);
  //     if (employee.jobs !== 'undefined') {
  //       //we do a for each on the jobs array
  //       //calculate the difference in the startDate and the endDate (today's date if endDate is undefined)
  //       //maybe write a function for the above
  //       //after the function
  //       emplyee.jobs.forEach((job, index) => {
  //         amOfYears += calculateTimeDifference(job[index].startDate, job[index].endDate);
  //       });
  //     }
  //     // push time to array
  //     if (amOfYears > 50) amOfYears = 50;
  //     this.jobExperience[amOfYears / 5] += 1
  //   }
  // });
}

async function created() {
  this.employees = await api.getItems(api.EMPLOYEES);
  jobExperienceData();
  console.log(this.employees);
}

function stringToDate(dateAsString) {
  var date = moment(dateAsString).format('YYYY-MM-DD');
  return date;
}

export default {
  components: {
    JobExperienceHistogram
  },
  created,
  computed: {},
  data() {
    return {
      employees: [],
      jobExperience: []
    };
  },
  methods: {
    jobExperienceData,
    stringToDate
  }
};
</script>

<style></style>
