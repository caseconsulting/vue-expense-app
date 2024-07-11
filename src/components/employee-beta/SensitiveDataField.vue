<template>
  <div class="field-container">
    <p @click="emitter.emit('click')">
      <b v-if="label">{{ label }}:</b> {{ show ? value : '*****' }}
    </p>
    <v-btn class="show font-weight-bold text-caption text-blue" variant="plain" @click="show = !show">{{
      show ? 'Hide' : 'Show'
    }}</v-btn>
  </div>
</template>

<script setup>
import { inject, onBeforeUnmount, ref } from 'vue';
import { onBeforeMount } from 'vue';

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
</script>

<style scoped>
.field-container {
  position: relative;
}

.show {
  position: absolute;
  top: 16px;
}
</style>
