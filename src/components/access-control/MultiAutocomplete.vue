<template>
  <div>
    <v-autocomplete
      :label="label"
      :items="items"
      :item-title="getTitle"
      :variant="variant"
      color="indigo-darken-4"
      item-value="id"
      multiple
      chips
      closable-chips
      clear-on-select
      auto-select-first
      v-model="model"
    >
      <template #chip="{ props, item }">
        <v-chip v-bind="props" label>
          {{ getTitle(item, false) }}
          <template #prepend>
            <v-icon :icon="getIcon(item)" size="small" class="cursor-help mr-2" v-tooltip="{ location: 'top', text: getType(item)}" />
          </template>
          <template #close>
            <v-icon icon="mdi-close" size="small" />
          </template>
        </v-chip>
      </template>
      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :title="getTitle(item.raw, true)"
          :subtitle="getSubtitle(item.raw)"
        ></v-list-item>
      </template>
    </v-autocomplete>
  </div>
</template>
<script setup>
const props = defineProps({
  items: { type: Array },
  pretext: { type: Boolean, default: true },
  label: { type: String, default: 'Choose items' },
  variant: { type: String, default: 'underlined' }
});
const model = defineModel();

/**
 * Helpers to check types
 */
function isTag(item) {
  return !!item.tagName;
}
function isEmployee(item) {
  return !!item.employeeNumber;
}
function isContract(item) {
  return !!item.contractName;
}
function isProject(item) {
  return !!item.projectName;
}

/**
 * Helper to get the type of an object
 */
function getType(rawItem) {
  let item = rawItem.raw ?? rawItem;
  if (isEmployee(item)) return 'Employee';
  else if (isTag(item)) return 'Tag';
  else if (isContract(item)) return 'Contract';
  else if (isProject(item)) return 'Project';
}

/**
 * Gets the title for a dropdown or chip item
 * Adds pretext if desired
 */
function getTitle(rawItem, pretext) {
  let item = rawItem.raw ?? rawItem;
  let text = pretext && props.pretext ? `${getType(item)}: ` : '';
  let primeName = pretext ? '' : `${item.primeName} `;
  if (isTag(item)) text += item.tagName;
  if (isEmployee(item)) text += `${item.nickname || item.firstName} ${item.lastName}`;
  if (isContract(item)) text += primeName + item.contractName;
  if (isProject(item)) text += item.projectName;
  return text;
}

/**
 * Gets the subtitle for a dropdown item, if exists
 */
function getSubtitle(rawItem) {
  let item = rawItem.raw ?? rawItem;
  return item.primeName;
}

/**
 * Gets the icon for a chip item
 */
function getIcon(rawItem) {
  let item = rawItem.raw ?? rawItem;
  if (isTag(item)) return 'mdi-tag';
  if (isEmployee(item)) return 'mdi-account';
  if (isContract(item)) return 'mdi-file-document-multiple';
  if (isProject(item)) return 'mdi-file-document-outline';
}
</script>
