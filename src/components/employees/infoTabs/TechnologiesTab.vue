<template>
  <div class="infoTab">
    <div v-if="!isEmpty(model.technologies)">
      <div v-for="(technology, index) in model.technologies" :key="technology.name">
        <p><b>Technology: </b>{{ technology.name }}</p>
        <p><b>Years of Experience: </b>{{ technology.years }}</p>
        <p><b>Current: </b>{{ technology.current | current }}</p>
        <hr v-if="index < model.technologies.length - 1" class="mb-3" />
      </div>
    </div>
    <p v-else>No Technology Information</p>
  </div>
</template>

<script>
import _ from 'lodash';
/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0) || (_.isArray(value) && _.isEmpty(value));
} // isEmpty

export default {
  filters: {
    current: (value) => {
      if (value == true) {
        return 'Yes';
      } else {
        return 'No';
      }
    }
  },
  methods: {
    isEmpty
  },
  props: ['model']
};
</script>
<style>
.infoTab {
  color: #38424d;
}
</style>
