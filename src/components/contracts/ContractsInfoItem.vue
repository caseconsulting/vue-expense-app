<template>
  <span :class="`${props.header.class} ${!props.header.disableEdit ? 'pointer' : ''}`">{{
    props.item[props.header.key]
  }}</span>
</template>

<script setup>
const props = defineProps(['header', 'item']);
</script>
