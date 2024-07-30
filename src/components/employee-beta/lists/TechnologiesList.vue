<template>
  <v-list>
    <v-list-item v-for="(technology, index) in list" :key="technology.name + index" class="px-2">
      <v-row class="align-center" dense>
        <v-col cols="auto">
          <span class="d-inline" v-if="technology.current">
            <v-icon>mdi-check</v-icon>
            <v-tooltip activator="parent" location="left">Current Skill</v-tooltip>
          </span>
          <v-spacer v-else style="min-width: 24px"></v-spacer>
        </v-col>
        <v-col class="margin-y mx-2 align-center">
          <!-- there's margin on paragraphs that needs to be removed here -->
          <p class="d-inline title-text ma-0">
            <b>{{ technology.name }}</b>
          </p>
        </v-col>
        <v-col cols="4">
          <p class="gray-text my-0 mx-4 d-inline">{{ Number(technology.years).toFixed(1) }} years</p>
        </v-col>
      </v-row>
      <v-row no-gutters class="mx-5">
        <v-divider v-if="index < list.length - 1" />
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
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
