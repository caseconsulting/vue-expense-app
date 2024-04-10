<template>
  <div v-if="item.workStatus === 100">Full-Time</div>
  <div v-else-if="item.workStatus > 0 && item.workStatus < 100">Part-Time ({{ item.workStatus }}%)</div>
  <div v-else-if="item.workStatus === 0">Inactive</div>
  <div v-else>Invalid Work Status</div>
</template>

<script>
export default {
  props: ['field', 'item']
};
</script>
