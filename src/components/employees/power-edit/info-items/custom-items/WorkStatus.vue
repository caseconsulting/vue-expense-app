<template>
  <div v-if="props.item.workStatus === 100">Full-Time</div>
  <div v-else-if="props.item.workStatus > 0 && props.item.workStatus < 100">
    Part-Time ({{ props.item.workStatus }}%)
  </div>
  <div v-else-if="props.item.workStatus === 0">Inactive</div>
  <div v-else>Invalid Work Status</div>
</template>

<script setup>
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
</script>
