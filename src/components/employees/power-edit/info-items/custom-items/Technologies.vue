<template>
  <div class="tech-field">
    {{ techString }}
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import _forEach from 'lodash/forEach';
import _cloneDeep from 'lodash/cloneDeep';
import _sortBy from 'lodash/sortBy';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);

// |--------------------------------------------------|
// |                                                  |
// |                  LIFECYCLE HOOKS                 |
// |                                                  |
// |--------------------------------------------------|

onMounted(() => {
  let elements = document.getElementsByClassName('tech-field');
  _forEach(elements, (e) => {
    e.style.maxWidth = props.field.maxWidth;
  });
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const techString = computed(() => {
  let str = '';
  let techs = _cloneDeep(props.item.technologies);
  techs = _sortBy(techs, (t) => t.name);
  _forEach(techs, (t) => {
    if (str.length > 0) str += ` & ${t.name}`;
    else if (str.length === 0) str += t.name;
  });
  return str;
});
</script>

<style scoped>
.tech-field {
  scrollbar-color: rgb(228, 228, 228) transparent;
  scrollbar-width: thin;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}
</style>
