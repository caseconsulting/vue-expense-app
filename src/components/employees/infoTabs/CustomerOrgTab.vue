<template>
  <div class="infoTab">
    <div v-if="!isEmpty(model.customerOrgExp)">
      <div v-for="(exp, index) in model.customerOrgExp" :key="exp.name">
        <p><b>Customer Organization Experience: </b>{{ exp.name }}</p>
        <p><b>Years of Experience: </b>{{ exp.years }}</p>
        <hr v-if="index < model.customerOrgExp.length - 1" class="pb-3" />
      </div>
    </div>
    <p v-else>No Customer Organization Experience Information</p>
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
