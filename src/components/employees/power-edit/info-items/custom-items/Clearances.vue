<template>
  <div>{{ props.item[props.field.key]?.[0]?.type }}</div>
</template>

<script setup>
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
</script>
