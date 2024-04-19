<template>
  <v-row class="pa-0 ma-0">
    <v-col cols="3">
      <v-avatar
        v-if="props.item['github']"
        rounded="0"
        size="25"
        @click="openLink(`https://github.com/${props.item['github']}`)"
      >
        <v-img class="grayImage" :src="github" alt="Github icon"></v-img>
      </v-avatar>
    </v-col>
    <v-col cols="3">
      <v-avatar
        v-if="props.item['twitter']"
        rounded="0"
        size="25"
        @click="openLink(`https://twitter.com/${props.item['twitter']}`)"
      >
        <v-img class="grayImage" :src="x" alt="X icon"></v-img>
      </v-avatar>
    </v-col>
    <v-col cols="3">
      <v-avatar v-if="props.item['linkedIn']" rounded="0" size="25" @click="openLink(props.item['linkedIn'])">
        <v-img class="grayImage" :src="linkedin" alt="LinkedIn icon"></v-img>
      </v-avatar>
    </v-col>
  </v-row>
</template>

<script setup>
import github from '@/assets/img/trademarks/github.png';
import linkedin from '@/assets/img/trademarks/linkedin.png';
import x from '@/assets/img/trademarks/x.png';
import { openLink } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
</script>

<style scoped>
.tmp {
  width: 200px;
}
.grayImage {
  -webkit-filter: brightness(0) opacity(55%);
  filter: brightness(0) opacity(55%);
}
</style>
