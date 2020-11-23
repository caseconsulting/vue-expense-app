<template>
  <div class="infoTab">
    <!-- Employee has Technology Experience -->
    <div v-if="!isEmpty(model.technologies)">
      <!-- Loop Technologies -->
      <div v-for="(technology, index) in model.technologies" :key="technology.name">
        <p><b>Technology: </b>{{ technology.name }}</p>
        <p><b>Years of Experience: </b>{{ technology.years }}</p>
        <p><b>Current: </b>{{ technology.current | current }}</p>
        <hr v-if="index < model.technologies.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Technologies -->
    </div>
    <!-- Employee does not have Technology Experience -->
    <p v-else>No Technology Information</p>
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
