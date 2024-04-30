<template>
  <div>
    {{ props.item.city ? `${props.item.city}, ` : '' }} {{ props.item.st ? `${props.item.st}, ` : '' }}
    {{ props.item.country }}
  </div>
</template>

<script setup>
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
</script>
