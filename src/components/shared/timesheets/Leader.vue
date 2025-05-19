<template>
  <div v-if="leader" class="d-flex align-center">
    <v-icon size="x-large" class="me-3" :class="iconClass">mdi-trophy</v-icon>
    <span class="py-1">
      <user-avatar :employee="leader" :image="leader?.avatar" :size="45" />
      <span class="ms-1">
        #{{ leader?.rank }} {{ leader?.nickname || leader?.firstName }} {{ leader?.lastName[0] }}.
      </span>
      <span class="ms-1">({{ Math.trunc(leader?.billableHours) }})</span>
    </span>
  </div>
</template>
<script setup>
const props = defineProps(['leader', 'iconClass']);
</script>
