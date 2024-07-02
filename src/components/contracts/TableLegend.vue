<template>
  <div class="d-flex">
    <span class="d-flex align-center pr-3" v-for="(l, index) in props.legendKey" :key="index">
      <div :style="{ 'background-color': l.color }" class="square mr-2"></div>
      <span>{{ l.status }} </span>
    </span>
  </div>
</template>
<script setup>
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|
const props = defineProps(['legendKey']);
</script>
<style lang="scss">
.square {
  height: 10px;
  width: 10px;
}
</style>
