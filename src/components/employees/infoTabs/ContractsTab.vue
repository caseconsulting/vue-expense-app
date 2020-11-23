<template>
  <div class="infoTab">
    <!-- Employee has Contracts -->
    <div v-if="!isEmpty(model.contracts)">
      <!-- Loop Contracts -->
      <div v-for="(contract, index) in model.contracts" :key="contract.name">
        <p><b>Contract: </b>{{ contract.name }}</p>
        <p><b>Prime: </b>{{ contract.prime }}</p>
        <p><b>Current: </b>{{ contract.current | current }}</p>
        <hr v-if="index < model.contracts.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Contracts -->
    </div>
    <!-- Employee does not have Contracts -->
    <p v-else>No Contracts Information</p>
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
