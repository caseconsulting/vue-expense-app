<template>
  <v-row>
    <v-col>
      <personal-info-card style="padding-bottom: 10px" :model="props.model"></personal-info-card>
    </v-col>
    <v-col>
      <other-info-card style="padding-bottom: 10px" :model="props.model"></other-info-card>
    </v-col>
    <v-col v-if="isUser || isAdmin">
      <clearance-card style="padding-bottom: 10px" :model="props.model"></clearance-card>
    </v-col>
  </v-row>
</template>

<script setup>
import PersonalInfoCard from '@/components/employee-beta/personal/PersonalInfoCard.vue';
import OtherInfoCard from '@/components/employee-beta/personal/OtherInfoCard.vue';
import ClearanceCard from '@/components/employee-beta/personal/ClearanceCard.vue';
import { inject } from 'vue';

const props = defineProps(['model']);
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
</script>
