<template>
  <!-- Download CSV Button -->
  <div>
    <v-btn
      :disabled="midAction || loading"
      @click="download()"
      elevation="2"
      class="ml-3"
      :size="isMobile() || isSmallScreen() ? 'small' : 'default'"
      ><i class="material-icons">file_download</i>
      Generate EEO Report
    </v-btn>
  </div>
</template>

<script setup>
import _cloneDeep from 'lodash/cloneDeep';
import { isMobile, isSmallScreen } from '@/utils/utils';
import eeoCsv from '@/utils/csv/eeoCsv.js';

// Keston wrote all this crap. Please don't ask me about it.
// I don't know how it works either.
// https://3.basecamp.com/3097063/buckets/18376382/messages/4851739152
// https://www.youtube.com/watch?v=dQw4w9WgXcQ

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employees', 'midAction', 'loading']);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function download() {
  eeoCsv.download(_cloneDeep(props.employees));
}
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
