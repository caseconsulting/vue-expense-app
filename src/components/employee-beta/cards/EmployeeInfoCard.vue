<template>
  <div>
    <v-row class="mt-3 align-center justify-center">
      <!-- profile picture -->
      <v-col cols="4" class="display-inline fit-content">
        <v-avatar class="cursor-pointer" :color="caseRed" :size="picSize" @click="toggleModal = true">
          <span class="text-h4 display-inline-block position-absolute">{{ initials }}</span>
          <v-img class="display-inline-block position-absolute" :src="avatar" :alt="altText" />
        </v-avatar>
      </v-col>
      <!-- general info -->
      <v-col cols="8">
        <!-- first row: name and nickname -->
        <v-row class="mr-5 align-baseline" no-gutters>
          <!-- name -->
          <v-col class="mr-3 fit-content">
            <h3 class="name-text">{{ employeeName }}</h3>
          </v-col>
          <!-- nickname -->
          <v-col class="fit-content">
            <h3 class="nickname-text" :style="`color: ${caseGray}`">{{ nickname }}</h3>
          </v-col>
        </v-row>
        <!-- second row: emp id and case email -->
        <v-row class="mr-5 align-baseline" no-gutters>
          <!-- emp id -->
          <v-col class="mr-3 fit-content">
            <h3 class="other-text" :style="`color: ${caseGray}`">EMPID: {{ model.employeeNumber }}</h3>
          </v-col>
          <!-- email -->
          <v-col class="fit-content d-flex align-center">
            <a :href="`mailto:${model.email}`" class="text-caption clickable-h3">
              <v-tooltip activator="parent" location="bottom">
                <p class="ma-0 pa-0">Email {{ employeeName }}</p>
              </v-tooltip>
              <h3 v-cloak>{{ model.email }}</h3>
            </a>
            <v-btn @click="copyEmailList()" :size="isMobile() ? 'x-small' : 'x-small'" variant="text" icon="">
              <v-icon v-if="copied" color="green">mdi-check</v-icon>
              <v-icon v-else>mdi-content-copy</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <!-- third row: personal email and links -->
        <v-row class="mt-1" no-gutters>
          <!-- personal email -->
          <v-col v-if="model.personalEmail" style="max-width: fit-content">
            <a :href="`mailto:${model.personalEmail}`">
              <v-hover v-slot="{ isHovering, props }">
                <v-btn
                  v-bind="props"
                  icon=""
                  :color="isHovering ? caseRed : 'blue'"
                  :width="buttonSize"
                  :height="buttonSize"
                  variant="text"
                >
                  <v-tooltip activator="parent" location="bottom">
                    <p class="ma-0 pa-0">Email {{ employeeName }}'s personal email</p>
                  </v-tooltip>
                  <v-icon icon="mdi-email" size="28"></v-icon>
                </v-btn>
              </v-hover>
            </a>
          </v-col>
          <!-- github -->
          <v-col v-if="model.github" style="max-width: fit-content">
            <a :href="`https://github.com/${model.github}`" target="_blank">
              <v-hover v-slot="{ isHovering, props }">
                <v-btn
                  v-bind="props"
                  icon=""
                  :color="isHovering ? caseRed : 'blue'"
                  :width="buttonSize"
                  :height="buttonSize"
                  variant="text"
                >
                  <v-tooltip activator="parent" location="bottom">
                    <p class="ma-0 pa-0">Go to Github Profile</p>
                  </v-tooltip>
                  <v-icon icon="$github" size="30"></v-icon>
                </v-btn>
              </v-hover>
            </a>
          </v-col>
          <!-- linkedin -->
          <v-col v-if="model.linkedIn" style="max-width: fit-content">
            <a :href="model.linkedIn" target="_blank">
              <v-hover v-slot="{ isHovering, props }">
                <v-btn
                  v-bind="props"
                  icon=""
                  :color="isHovering ? caseRed : 'blue'"
                  :width="buttonSize"
                  :height="buttonSize"
                  variant="text"
                >
                  <v-tooltip activator="parent" location="bottom">
                    <p class="ma-0 pa-0">Go to LinkedIn Profile</p>
                  </v-tooltip>
                  <v-icon icon="$linkedin" size="33"></v-icon>
                </v-btn>
              </v-hover>
            </a>
          </v-col>
          <!-- X (the everything app you can do everything on it) -->
          <v-col v-if="model.twitter" style="max-width: fit-content">
            <a :href="`https://x.com/${model.twitter}`" target="_blank">
              <v-hover v-slot="{ isHovering, props }">
                <v-btn
                  v-bind="props"
                  icon=""
                  :color="isHovering ? caseRed : 'blue'"
                  :width="buttonSize"
                  :height="buttonSize"
                  variant="text"
                >
                  <v-tooltip activator="parent" location="bottom">
                    <p class="ma-0 pa-0">Go to X Profile</p>
                  </v-tooltip>
                  <v-icon icon="$twitter" size="23"></v-icon>
                </v-btn>
              </v-hover>
            </a>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <profile-pic-modal
      v-model="toggleModal"
      :avatar="avatar"
      :initials="initials"
      :altText="altText"
      :fullName="fullName"
      :model="model"
    ></profile-pic-modal>
  </div>
</template>

<script setup>
import _ from 'lodash';
import { computed, onMounted, ref, inject, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { isMobile } from '../../../utils/utils';
import { updateStoreAvatars } from '../../../utils/storeUtils';
import { useDisplayCustom } from '@/components/shared/StatusSnackbar.vue';
import ProfilePicModal from '../modals/ProfilePicModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const buttonSize = 34;

const emitter = inject('emitter');
const store = useStore();
const props = defineProps({
  model: {
    type: Object,
    required: true
  }
});
const avatar = ref(null);
const copied = ref(false);
const toggleModal = ref(false);

onMounted(async () => {
  if (!store.getters.basecampAvatars) await updateStoreAvatars();
  let avatars = store.getters.basecampAvatars;
  const item = _.find(avatars, ['email_address', props.model.email]);
  avatar.value = item ? item.avatar_url : null;

  emitter.on('status-close', () => {
    copied.value = false;
  });
});

onBeforeUnmount(() => {
  emitter.off('status-close');
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
  return `${employeeName.value}'s Avatar`;
});

const fullName = computed(() => {
  return props.model.nickname ? `${props.model.nickname} ${props.model.lastName}` : employeeName;
});

const picSize = computed(() => {
  if (window.innerWidth > 1660) {
    return 128;
  } else if (window.innerWidth > 500) {
    return 96;
  } else {
    return 72;
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Copyies the list of employee emails to the user's clipboard.
 */
async function copyEmailList() {
  await navigator.clipboard.writeText(props.model.email);

  //display copied status
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3000);
  useDisplayCustom('Copied email to clipboard', 'CUSTOM', 3000, 'black', 'red', 'bottom');
} // copyEmailList
</script>

<style scoped>
.fit-content {
  max-width: fit-content;
}

.name-text {
  font-size: xx-large;
  color: black;
  display: inline-block;
  white-space: nowrap;
}

.nickname-text {
  font-size: large;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
}

.other-text {
  font-size: medium;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
}

.logo-icons {
  top: -10%;
}

.clickable-h3 {
  color: #2196f3;
  text-decoration: none;
  font-weight: 200;
  display: inline-block;
  white-space: nowrap;
}

.clickable-h3:hover {
  color: #c23010;
  text-decoration: underline;
}

@media (max-width: 620px) {
}
</style>
