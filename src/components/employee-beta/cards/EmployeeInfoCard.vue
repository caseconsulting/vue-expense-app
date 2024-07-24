<template>
  <div>
    <v-row class="mt-3 align-center justify-center">
      <!-- profile picture -->
      <v-col cols="4" class="display-inline fit-content">
        <v-avatar :color="caseRed" :size="96">
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
          <v-col class="fit-content">
            <a :href="`mailto:${model.email}`" class="text-caption clickable-h3">
              <v-tooltip activator="parent" location="bottom">
                <p class="ma-0 pa-0">Email {{ employeeName }}</p>
              </v-tooltip>
              <h3 v-cloak>{{ model.email }}</h3>
            </a>
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
  </div>
</template>

<script setup>
import _ from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { updateStoreAvatars } from '../../../utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const buttonSize = 34;

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
