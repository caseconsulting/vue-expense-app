<template>
  <v-dialog max-width="300">
    <template v-slot:default>
      <v-card class="text-center">
        <v-card-title class="h-50 text-h4 beta_header_style">{{ fullName }}</v-card-title>
        <v-card-text class="pb-4">
          <v-avatar v-if="isEmpty(avatar)" :color="caseRed" :size="200">
            <span class="text-h1 display-inline-block position-absolute">{{ initials }}</span>
          </v-avatar>
          <v-avatar v-else :size="200">
            <v-img v-if="!isProfile" class="display-inline-block position-absolute" :src="avatar" :alt="altText" />
            <v-img v-else class="display-inline-block position-absolute" :src="theAvatar" :alt="altText" />
          </v-avatar>

          <v-divider class="mt-4"></v-divider>

          <p class="pt-4 pb-0">
            Want to change your picture on
            <a class="text-primary" :href="'https://3.basecamp.com/3097063'" target="_blank"><u>basecamp</u></a
            >?
          </p>
          <p class="text-start pt-2">
            Click on your profile icon → Click 'profile, password, 2FA' → Click 'Change your avatar' button
          </p>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { isEmpty } from '@/utils/utils';

const props = defineProps(['avatar', 'initials', 'altText', 'fullName', 'model']);

console.log(props.model);

const theAvatar = ref('https://i.pinimg.com/originals/dd/3f/8f/dd3f8f13aecf1c3e441facf64961423f.png');
const isProfile = ref(props.model.employeeRole === 'intern');
</script>
