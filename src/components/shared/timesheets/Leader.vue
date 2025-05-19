<template>
  <div v-if="leader" class="d-flex align-center">
    <v-icon size="x-large" :class="iconClass">mdi-trophy</v-icon>
    <span class="py-1">
      <b v-if="(leader?.rank || 0) > 3" class="me-1">#{{ leader?.rank }}</b>
      <user-avatar :employee="leader" :image="leader?.avatar" :size="45" />
      <v-tooltip activator="parent" location="top">{{ leader?.firstName }} {{ leader?.lastName }}</v-tooltip>
      <span class="ms-1">{{ leader?.nickname || leader?.firstName }}</span>
      <span class="ms-1">({{ Math.trunc(leader?.billableHours) }})</span>
    </span>
  </div>
</template>
<script setup>
const props = defineProps(['leader', 'iconClass']);
</script>
