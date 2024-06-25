<template>
  <v-sheet>
    <v-row>
      <!-- profile picture -->
      <v-col class="ml-5 mt-5 display-inline" style="max-width: fit-content">
        <v-avatar :color="caseRed" :size="96">
          <span class="text-h4 display-inline-block position-absolute">{{ initials }}</span>
          <v-img class="display-inline-block position-absolute" :src="avatar" :alt="altText" />
        </v-avatar>
      </v-col>
      <!-- name, email, links -->
      <v-col class="pl-5 pt-5">
        <v-row>
          <v-col>
            <h3 class="name-text">{{ employeeName }}</h3>
            <h3 class="nickname-text" :style="`color: ${caseGray}`">{{ nickname }}</h3>
            <h2 v-cloak class="other-text">{{ model.email }}</h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <a :href="model.github">
              <github-icon width="32" height="32" color="cornflowerblue"></github-icon>
            </a>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup>
import _ from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { updateStoreAvatars } from '../../utils/storeUtils';
import GithubIcon from '../custom-icons/GithubIcon.vue';
// import { mdiGithub } from '@mdi/js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});
const avatar = ref(null);

onMounted(async () => {
  if (!store.getters.basecampAvatars) await updateStoreAvatars();
  let avatars = store.getters.basecampAvatars;
  const item = _.find(avatars, ['email_address', props.model.email]);
  avatar.value = item ? item.avatar_url : null;
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const initials = computed(() => {
  if (!props.model) return '';
  return (
    (props.model.nickname || props.model.firstName).charAt(0).toUpperCase() +
    props.model.lastName.charAt(0).toUpperCase()
  );
});

const employeeName = computed(() => {
  return !props.model ? 'unknown employee' : `${props.model.firstName} ${props.model.lastName}`;
});

const nickname = computed(() => {
  return props.model.nickname ? `aka ${props.model.nickname}` : null;
});

const altText = computed(() => {
  return `${employeeName.value}'s Avatar'`;
});
</script>

<style scoped>
.name-text {
  font-size: xx-large;
  color: black;
  display: inline-block;
}

.nickname-text {
  font-size: large;
  font-weight: 500;
  color: gray;
  display: inline-block;
  padding-left: 0.5em;
}

.other-text {
  font-size: medium;
  font-weight: 500;
}

.logo-icons {
  top: -10%;
}
</style>
