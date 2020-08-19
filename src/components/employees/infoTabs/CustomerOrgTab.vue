<template>
  <div class="infoTab">
    <!-- Employee has Customer Organization Experience -->
    <div v-if="!isEmpty(model.customerOrgExp)">
      <!-- Loop Customer Organizations -->
      <div v-for="(exp, index) in model.customerOrgExp" :key="exp.name">
        <p><b>Customer Organization Experience: </b>{{ exp.name }}</p>
        <p><b>Years of Experience: </b>{{ exp.years }}</p>
        <p><b>Current: </b>{{ exp.current | current }}</p>
        <hr v-if="index < model.customerOrgExp.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Customer Organizations -->
    </div>
    <!-- Employee does not have Customer Organization Experience -->
    <p v-else>No Customer Organization Experience Information</p>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';

export default {
  filters: {
    current: (value) => {
      return value ? 'Yes' : 'No';
    }
  },
  methods: {
    isEmpty
  },
  props: ['model']
};
</script>
