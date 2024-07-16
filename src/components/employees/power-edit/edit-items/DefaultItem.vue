<template>
  <v-text-field
    v-model="model"
    autofocus
    :rules="props.field.rules?.map((func) => func(model, props.item))"
    :maxLength="props.field.maxLength ?? ''"
    variant="underlined"
  >
  </v-text-field>
</template>

<script setup>
import { ref, watch, inject } from 'vue';

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
