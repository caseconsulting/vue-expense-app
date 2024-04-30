<template>
  <div class="tech-field">
    {{ techString }}
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import _ from 'lodash';

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
  _.forEach(elements, (e) => {
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
  let techs = _.cloneDeep(props.item.technologies);
  techs = _.sortBy(techs, (t) => t.name);
  _.forEach(techs, (t) => {
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
