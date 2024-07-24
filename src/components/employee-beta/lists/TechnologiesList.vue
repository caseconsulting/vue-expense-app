<template>
  <v-list>
    <v-list-item v-for="(technology, index) in list" :key="technology.name + index" class="px-2">
      <v-row class="align-center" dense>
        <v-col cols="auto">
          <span v-if="technology.current">
            <v-icon>mdi-check</v-icon>
            <v-tooltip activator="parent" location="left">Current Skill</v-tooltip>
          </span>
          <v-spacer v-else style="min-width: 24px"></v-spacer>
        </v-col>
        <v-col v-if="isModal && !isMobile()" class="margin-y ml-2 align-center" cols="10" style="width: 375px">
          <!-- there's margin on paragraphs that needs to be removed here -->
          <p class="title-text ma-0">
            <b>{{ technology.name }}</b>
          </p>
        </v-col>
        <v-col v-else class="margin-y ml-2 d-flex align-center justify-space-between" cols="9">
          <!-- if a skill/tech has a long name then it gets cut off with a ... -->
          <p class="title-text ma-0" style="width: 16ch; overflow: hidden; text-overflow: ellipsis">
            <b>{{ technology.name }}</b>
          </p>
          <p class="gray-text ma-0">{{ Number(technology.years).toFixed(1) }} years</p>
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

.margin-y {
  margin-top: 18px;
  margin-bottom: 18px;
}
</style>
