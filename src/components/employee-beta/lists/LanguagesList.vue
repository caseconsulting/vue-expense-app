<template>
  <v-list>
    <v-list-item v-for="(language, index) in list" :key="language.name + index">
      <v-row no-gutters>
        <v-col :cols="isMobile() ? '6' : ''">
          <p class="mt-3" :class="isMobile() ? 'ml-4 mobile-view' : ''">
            <b>{{ language.name }}</b>
          </p>
        </v-col>
        <v-col :cols="isMobile() ? '5' : ''">
          <p class="gray-text mt-3" :class="isMobile() ? 'mobile-view' : ''">
            <b>Fluency: </b>{{ shortenProficiency(language.proficiency) }}
          </p>
        </v-col>
      </v-row>
      <v-row no-gutters class="my-2 mx-0">
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
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Removes the description from the fluency level text
 * @param {String} proficiency
 * @return {String} the shortened string
 */
function shortenProficiency(proficiency) {
  return proficiency.split(' - ')[0];
}
</script>

<style scoped>
.gray-text {
  color: #828282;
  text-wrap: nowrap;
}

.mobile-view {
  font-size: 13px;
}
</style>
