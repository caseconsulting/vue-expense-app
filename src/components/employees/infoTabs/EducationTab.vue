<template>
  <div class="infoTab">
    <div v-if="model.degrees && model.degrees.length > 0">
      <div v-for="(degree, index) in model.degrees" :key="degree.name">
        <p><b>Degree: </b>{{ degree.name }}</p>
        <p><b>School: </b>{{ degree.school }}</p>
        <p><b>Completion Date: </b>{{ degree.date | dateFormat }}</p>
        <div>
          <b>Major(s): </b>
          <div v-for="major in degree.majors" :key="major">{{ major }}</div>
        </div>
        <div>
          <b v-if="degree.minors.length > 0">Minor(s):</b>
          <div v-for="minor in degree.minors" :key="minor">{{ minor }}</div>
        </div>
        <div>
          <b v-if="degree.concentrations.length > 0">Concentration(s):</b>
          <div v-for="concentration in degree.concentrations" :key="concentration">{{ concentration }}</div>
        </div>
        <hr v-if="index < model.degrees.length - 1" />
      </div>
    </div>
    <p v-else>No Education information</p>
  </div>
</template>
<script>
import moment from 'moment';
import _ from 'lodash';
/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

export default {
  filters: {
    // formats a date by month, day, year (e.g. Aug 18th, 2020)
    dateFormat: (value) => {
      if (!isEmpty(value)) {
        return moment(value).format('MMM YYYY');
      } else {
        return '';
      }
    }
  },
  methods: {
    isEmpty
  },
  props: ['admin', 'employee', 'model']
};
</script>
<style>
.infoTab {
  color: #38424d;
}
</style>
