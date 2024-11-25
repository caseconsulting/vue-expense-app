<template>
  <v-autocomplete
    :class="props.classProps"
    clearable
    label="Filter by Tag (click to flip)"
    v-model="tagsInfo.selected"
    :items="store.getters.tags || []"
    multiple
    variant="underlined"
    item-title="tagName"
    item-value="id"
    hide-details
    return-object
  >
    <template #chip="{ props, item }">
      <v-chip
        size="small"
        closable
        @click.stop
        v-bind="props"
        @click="negateTag(item.raw)"
        @click:close="removeTag(item.raw)"
        :color="chipColor(item.raw.id)"
      >
        {{ tagsInfo.flipped.includes(item.raw.id) ? 'NOT ' : '' }}
        {{ item.raw.tagName }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script setup>
import _forEach from 'lodash/forEach';
import { watch } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emit = defineEmits(['update:modelValue']);
const tagsInfo = defineModel({
  type: Object,
  required: true,
  validator(value) {
    return (
      value instanceof Object &&
      Object.keys(value).includes('selected') &&
      value['selected'] instanceof Array &&
      Object.keys(value).includes('flipped') &&
      value['flipped'] instanceof Array
    );
  }
});
const props = defineProps(['classProps']);

const store = useStore();
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns the color that at tag filter chip should be
 *
 * @param id ID of the tag item
 */
function chipColor(id) {
  return tagsInfo.value.flipped.includes(id) ? 'red' : 'gray';
} // chipColor

/**
 * negates a tag
 */
function negateTag(item) {
  // try to find the id in the flipped array, if it is there then remove it else add it
  const index = tagsInfo.value.flipped.indexOf(item.id);
  if (index >= 0) {
    tagsInfo.value.flipped.splice(index, 1);
  } else {
    tagsInfo.value.flipped.push(item.id);
  }
} // negateTag

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = tagsInfo.value.selected.findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    tagsInfo.value.selected.splice(selIndex, 1);
  }
} // removeTag

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
watch(
  () => tagsInfo.value.flipped,
  function watchFlipped() {
    emit('update:modelValue', tagsInfo.value); //required emit to update model
  },
  { deep: true }
); // watchflipped;

/**
 * Remove items from flipped array when they are removed from the selected
 * tags
 */
watch(
  () => tagsInfo.value.selected,
  function watchSelected() {
    let negatedTagRemoved = true;
    // use normal for loop to have the index
    for (let i = 0; i < tagsInfo.value.flipped.length; i++) {
      // try to find the current tag in the selected
      _forEach(tagsInfo.value.selected, (t) => {
        if (t.id === tagsInfo.value.flipped[i]) negatedTagRemoved = false;
      });
      // if it isn't there, remove it from flipped too
      if (negatedTagRemoved) {
        tagsInfo.value.flipped.splice(i, 1);
      }
    }
    emit('update:modelValue', tagsInfo.value); //required emit to update model
  },
  { deep: true }
); // watchSelectedTags
</script>
