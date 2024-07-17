<template>
  <v-list>
    <v-list-item v-for="(technology, index) in list" :key="technology.name + index">
      <v-row no-gutters class="fit-content align-center">
        <v-col class="d-flex">
          <v-col>
            <span v-if="technology.current">
              <v-icon>mdi-check</v-icon>
              <v-tooltip activator="parent" location="left">Current Skill</v-tooltip>
            </span>
          </v-col>
          <v-col cols="9" style="width: 375px" class="align-left" v-if="isModal && !isMobile()">
            <!-- there's margin on paragraphs that needs to be removed here -->
            <p class="title-text ma-0">
              <b>{{ technology.name }}</b>
            </p>
          </v-col>
          <v-col v-else>
            <!-- if a skill/tech has a long name then it gets cut off with a ... -->
            <p class="title-text ma-0" style="width: 15ch; overflow: hidden; text-overflow: ellipsis">
              <b>{{ technology.name }}</b>
            </p>
          </v-col>
          <v-col>
            <p class="gray-text">{{ Number(technology.years).toFixed(1) }} years</p>
          </v-col>
        </v-col>
      </v-row>
      <v-row no-gutters class="mx-5">
        <v-divider v-if="index < list.length - 1" />
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { isMobile } from '@/utils/utils';
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

defineProps({
  list: {
    type: Array,
    required: true
  },
  isModal: {
    type: Boolean
  }
});
</script>

<style scoped>
.title-text {
  color: black;
  text-wrap: nowrap;
}

.gray-text {
  color: #828282;
  text-wrap: nowrap;
}
</style>
