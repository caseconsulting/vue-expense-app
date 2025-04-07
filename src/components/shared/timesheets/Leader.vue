<template>
  <div class="d-flex align-center">
    <v-icon v-if="trophy" size="x-large" class="me-3" :class="iconClass">mdi-trophy</v-icon>
    <v-skeleton-loader v-if="loading" type="list-item-avatar" width="225"></v-skeleton-loader>
    <span v-else class="py-1">
      <user-avatar :employee="leader" :image="leader?.avatar" :size="45" />
      <span class="ms-1">{{ leader?.nickname || leader?.firstName }}</span>
      <span class="ms-1">({{ leader?.billableTimesheet }})</span>
    </span>
  </div>
</template>
<script setup>
const props = defineProps(['leader', 'iconClass', 'loading', 'trophy']);
</script>
