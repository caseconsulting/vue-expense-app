<template>
  <!-- Active Filter -->
  <div class="d-flex justify-end align-center my-0 pb-0">
    <span class="fieldset-title mr-3">Status:</span>
    <v-btn-toggle color="primary" class="filter_color" v-model="filter" text multiple>
      <!-- Active -->
      <v-tooltip location="top" text="Active">
        <template v-slot:activator="{ props }">
          <v-btn value="active" id="full" v-bind="props" variant="text">
            <v-icon class="mr-1" color="#0f9d58" size="large">mdi-check-circle-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Unstaffed -->
      <v-tooltip location="top" text="Unstaffed">
        <template v-slot:activator="{ props }">
          <v-btn value="unstaffed" id="part" v-bind="props" variant="text">
            <v-icon color="#f4b400" size="large">mdi-stop-circle-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Closed -->
      <v-tooltip location="top" text="Closed">
        <template v-slot:activator="{ props }">
          <v-btn value="closed" id="inactive" v-bind="props" variant="text">
            <v-icon color="#db4437" size="large">mdi-close-circle-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-btn-toggle>
  </div>
</template>

<script>
import api from '@/shared/api';

export default {
  data() {
    return {
      filter: [api.CONTRACT_STATUSES.ACTIVE]
    };
  },
  watch: {
    filter: function () {
      this.emitter.emit('filter', this.filter);
    }
  }
};
</script>
