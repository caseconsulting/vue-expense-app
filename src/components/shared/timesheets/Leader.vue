<template>
  <div class="ma-1" v-if="leader">
    <v-icon size="x-large" :class="iconClass">mdi-trophy</v-icon>
    <span>
      <b v-if="leader.rank > 3" class="me-1">#{{ leader.rank }}</b>
      <user-avatar :employee="leader" :image="leader.avatar" :size="35" />
      <v-tooltip activator="parent" location="top">{{ leader.firstName }} {{ leader.lastName }}</v-tooltip>
      <span class="ms-1">{{ leader.nickname || leader.firstName }}</span>
      <span v-if="!isMobile()" class="ms-1">({{ Math.trunc(leader.billableHours) }})</span>
    </span>
  </div>
</template>
<script setup>
import { isMobile } from '@/utils/utils';

const props = defineProps(['leader']);
let iconClass = '';
switch (props.leader.rank) {
  case 1:
    iconClass = 'gold';
    break;
  case 2:
    iconClass = 'silver';
    break;
  case 3:
    iconClass = 'bronze';
    break;
}
</script>
