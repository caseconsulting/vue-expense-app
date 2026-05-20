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
      :custom-filter="filter"
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

/**
 * Custom filter to search all types
 * 
 * value: text of current item being searched
 * query: what the user is typing to search
 *  item: the object being searched; use item.raw
 * 
 */
function filter(value, query, item) {
  // exit early conditions
  if (!query || query === '') return true;

  // allows for removing entries based on criteria
  // should return true if item should be included, else false
  let filters = {
    Employee: (e) => e.workStatus > 0
  };

  // fields to search on various types
  let fields = {
    Employee: ['nickname', 'firstName', 'lastName', 'email', 'employeeNumber'],
    Tag: ['tagName'],
    Contract: ['contractName', 'primeName'],
    Project: ['projectName']
  };

  // extract object
  let { raw } = item;
  let type = getType(raw);

  // exit early on filter failure
  if (filters[type] && !filters[type](raw)) return false;

  // search for type
  if ((type?.toLowerCase() ?? '').includes(query.toLowerCase()))
    return true;

  // search for query matching some field
  for (let word of query.split(' ').filter(Boolean))
    for (let field of fields[type] ?? [])
      if (`${raw[field]}`.toLowerCase().includes(word.toLowerCase()))
        return true;

  // no match
  return false;
}
</script>
