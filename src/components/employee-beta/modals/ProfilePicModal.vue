<template>
  <v-dialog max-width="300">
    <template v-slot:default>
      <v-card class="text-center">
        <v-card-title class="pa-3 h-50 beta_header_style header-style no-overflow">{{ fullName }}</v-card-title>
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
            <a class="text-primary" :href="'https://3.basecamp.com/3097063/my/profile'" target="_blank"
              ><u>basecamp</u></a
            >?
          </p>
          <p class="text-start pt-2">
            <b><u>How To:</u></b> Click the above link → Click 'Change your avatar' button
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

const theAvatar = ref('https://i.pinimg.com/originals/dd/3f/8f/dd3f8f13aecf1c3e441facf64961423f.png');
const isProfile = ref(props.model.employeeRole === 'intern');
</script>

<style scoped>
.header-style {
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.25 !important;
  letter-spacing: 0.0073529412em;
}
.no-overflow {
  white-space: initial;
}
</style>
