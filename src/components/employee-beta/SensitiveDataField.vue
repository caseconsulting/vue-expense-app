<template>
  <div class="field-container">
    <v-row no-gutters>
      <v-col :cols="!isMobile() ? '10' : '8'">
        <p @click="emitter.emit('click')">
          <b v-if="label">{{ label }}:</b> {{ show ? value : '*****' }}
        </p>
      </v-col>
      <v-col>
        <v-btn
          class="font-weight-bold text-caption text-blue"
          :density="btnDensity"
          variant="plain"
          @click="show = !show"
          >{{ show ? 'Hide' : 'Show' }}</v-btn
        >
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { inject, onBeforeUnmount, ref } from 'vue';
import { onBeforeMount } from 'vue';
import { isMobile } from '../../utils/utils';
import { computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
defineProps(['label', 'value']);

const show = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                LIFESTYLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
onBeforeMount(() => {
  emitter.on('show-all', (val) => {
    show.value = val;
  });
}); // created

onBeforeUnmount(() => {
  emitter.off('show-all');
});

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

const btnDensity = computed(() => {
  return isMobile() ? 'compact' : 'default';
});
</script>

<style scoped>
.field-container {
  position: relative;
  margin-bottom: 0;
}
</style>
