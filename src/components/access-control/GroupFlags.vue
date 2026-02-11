<template>
  <v-row>
      <v-checkbox
        class="d-inline-block pr-2"
        v-model="flags.showOnMemberProfile"
        label="Show on employee profile"
        v-tooltip="{text: `Show employees who their ${groupName.toLowerCase()} is`, location: 'top', offset: -10 }"
      />
        <v-checkbox
        class="d-inline-block pr-2"
        v-model="flags.contractLink"
        label="Contract link"
        disabled
        v-tooltip="{text: 'Make this group editable in contract settings', location: 'top', offset: -10 }"
      />
      <v-checkbox
        class="d-inline-block pr-2"
        v-model="flags.projectLink"
        label="Project link"
        disabled
        v-tooltip="{ text: 'Make this group editable in project settings', location: 'top', offset: -10 }"
      />
  </v-row>
</template>

<script setup>
const flags = defineModel();
const props = defineProps(['groupName']);

/**
 * TODO
 * - [ ] Add link to contracts page
 * - [ ] Add link to projects page
 */
</script>
