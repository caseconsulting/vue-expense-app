<template>
  <v-text-field
    v-model="model"
    autofocus
    class="power-edit-field"
    :rules="props.field.rules?.map((func) => func(model, props.item))"
    variant="underlined"
  >
  </v-text-field>
</template>

<script setup>
import { ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const model = ref(props.item[props.field.key]);
</script>
