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
      <!-- general info -->
      <v-col class="pl-5 pt-5">
        <v-row>
          <v-col>
            <!-- h3 was an arbitrary choice. Because of the styling, it shouldn't matter which one you pick -->
            <h3 class="name-text">{{ employeeName }}</h3>
            <h3 class="nickname-text" :style="`color: ${caseGray}`">{{ nickname }}</h3>
            <!-- the div puts employee id and email on next line -->
            <div></div>
            <h3 class="other-text">EMPID: {{ model.employeeNumber }}</h3>
            <h3 v-cloak class="other-text">{{ model.email }}</h3>
          </v-col>
        </v-row>
        <!-- personal email and links -->
        <v-row class="mt-1" no-gutters>
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
                  <v-icon icon="mdi-email" size="28"></v-icon>
                </v-btn>
              </v-hover>
            </a>
          </v-col>
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
                  <v-icon icon="$github" size="30"></v-icon>
                </v-btn>
              </v-hover>
            </a>
          </v-col>
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
                  <v-icon icon="$linkedin" size="33"></v-icon>
                </v-btn>
              </v-hover>
            </a>
          </v-col>
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
                  <v-icon icon="$twitter" size="23"></v-icon>
                </v-btn>
              </v-hover>
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
  display: inline-block;
  font-size: medium;
  font-weight: 500;
  padding-right: 0.8em;
}

.logo-icons {
  top: -10%;
}
</style>
