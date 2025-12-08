<template>
  <date-picker
    :icon="null"
    class="w-75"
    v-model="model"
    :label="''"
    :rules="props.field.rules"
    persistent-hint
    show-adjacent-months
    hide-actions
    autofocus
  />
</template>

<script setup>
import DatePicker from '@/components/shared/DatePicker.vue';
import { inject, ref, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');
const model = ref(props.item[props.field.key]);

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => model.value,
  () => {
    emitter.emit('update-item', {
      field: props.field,
      item: { ...props.item, [`${props.field.key}`]: model.value }
    });
  }
);
</script>
