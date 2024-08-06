<template>
  <v-list>
    <v-list-item v-for="(organization, index) in list" :key="organization.name + index" class="px-2">
      <v-row class="align-center" dense>
        <v-col :cols="!isMobile() ? 'auto' : '1'">
          <span class="d-inline" v-if="organization.current">
            <v-icon>mdi-check</v-icon>
            <v-tooltip activator="parent" location="left">Current Customer Org</v-tooltip>
          </span>
          <v-spacer v-else style="min-width: 24px"></v-spacer>
        </v-col>
        <v-col class="margin-y mx-2 align-center">
          <!-- there's margin on paragraphs that needs to be removed here -->
          <p class="d-inline title-text ma-0">
            <b>{{ organization.name }}</b>
          </p>
        </v-col>
        <v-col cols="auto">
          <p class="gray-text my-0 mx-4 d-inline">{{ Number(organization.years).toFixed(1) }} years</p>
        </v-col>
      </v-row>
      <v-row no-gutters :class="!isMobile() ? 'mx-5' : 'mx-7'">
        <v-divider v-if="index < list.length - 1" />
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { isMobile } from '../../../utils/utils';

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
