<template>
  <!-- Active Filter -->
  <div>
    <span class="fieldset-title mr-3">Status:</span>
    <v-btn-toggle color="primary" class="filter_color" v-model="filter" text multiple>
      <!-- Active -->
      <v-tooltip location="top" text="Active">
        <template v-slot:activator="{ props }">
          <v-btn value="active" id="full" v-bind="props" variant="text">
            <v-icon class="mr-1" color="#0f9d58" size="large">
              mdi-check-circle{{ filter.includes('active') ? '' : '-outline' }}
            </v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Unstaffed -->
      <v-tooltip location="top" text="Unstaffed">
        <template v-slot:activator="{ props }">
          <v-btn value="unstaffed" id="part" v-bind="props" variant="text">
            <v-icon color="#f4b400" size="large">
              mdi-stop-circle{{ filter.includes('unstaffed') ? '' : '-outline' }}
            </v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Closed -->
      <v-tooltip location="top" text="Closed">
        <template v-slot:activator="{ props }">
          <v-btn value="closed" id="inactive" v-bind="props" variant="text">
            <v-icon color="#db4437" size="large">
              mdi-close-circle{{ filter.includes('closed') ? '' : '-outline' }}
            </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-btn-toggle>
  </div>
</template>

<script setup>
import api from '@/shared/api';
import { ref, watch, inject } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const filter = ref(api.CONTRACT_STATUSES.ACTIVE);

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(filter, () => emitter.emit('filter', filter.value));
</script>
