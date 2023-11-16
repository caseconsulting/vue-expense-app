<template>
  <!-- Download CSV Button -->
  <div>
    <v-btn
      :disabled="midAction || loading"
      @click="download()"
      elevation="2"
      class="ml-3"
      :size="isMobile || isSmallScreen ? 'small' : 'default'"
      ><i class="material-icons">file_download</i>
      Generate EEO Report
    </v-btn>
  </div>
</template>

<script>
import _ from 'lodash';
import { isMobile, isSmallScreen } from '@/utils/utils';
const eeoCsv = require('@/utils/csv/eeoCsv.js');

// Keston wrote all this crap. Please don't ask me about it.
// I don't know how it works either.
// https://3.basecamp.com/3097063/buckets/18376382/messages/4851739152
// https://www.youtube.com/watch?v=dQw4w9WgXcQ

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function download() {
  eeoCsv.download(_.cloneDeep(this.employees));
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isMobile,
    isSmallScreen
  },
  methods: {
    download
  },
  props: ['employees', 'midAction', 'loading'] // employees to export
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
