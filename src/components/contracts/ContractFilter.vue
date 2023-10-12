<template>
  <!-- Active Filter -->
  <div class="d-flex justify-end align-center my-0 pb-0">
    <span class="fieldset-title mr-3">Status:</span>
    <v-btn-toggle class="filter_color" v-model="filter" text multiple>
      <!-- Active -->
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn value="active" id="full" v-on="on" text>
            <v-icon class="mr-1" color="#0f9d58">mdi-check-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>Active</span>
      </v-tooltip>

      <!-- Unstaffed -->
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn value="unstaffed" id="part" v-on="on" text>
            <v-icon color="#f4b400">mdi-stop-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>Unstaffed</span>
      </v-tooltip>

      <!-- Closed -->
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn value="closed" id="inactive" v-on="on" text>
            <v-icon color="#db4437">mdi-close-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>Closed</span>
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
