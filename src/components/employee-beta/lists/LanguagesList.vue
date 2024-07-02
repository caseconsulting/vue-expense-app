<template>
  <v-list>
    <v-list-item v-for="(language, index) in list" :key="language.name + index">
      <v-row no-gutters class="d-flex align-center">
        <p class="mt-3">
          <b>{{ language.name }}</b>
        </p>
      </v-row>
      <v-row no-gutters class="mx-7">
        <p class="gray-text"><b>Fluency Level: </b>{{ shortenProficiency(language.proficiency) }}</p>
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
</style>
