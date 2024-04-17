<template>
  <div>
    {{ getCurrentAddress }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

const getCurrentAddress = computed(() => {
  let address = '';
  if (props.item.currentStreet) {
    if (props.item.currentStreet2) {
      address += `${props.item.currentStreet} ${props.item.currentStreet2}`;
    } else {
      address += `${props.item.currentStreet}`;
    }
    if (props.item.currentCity) address += `, ${props.item.currentCity}`;
    if (props.item.currentState) address += `, ${props.item.currentState}`;
    if (props.item.currentZIP) address += `, ${props.item.currentZIP}`;
  }
  return address;
});
</script>
