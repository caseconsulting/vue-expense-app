<template>
  <div class="d-flex">
    <span class="d-flex align-center pr-3" v-for="(l, index) in legendKey" :key="index">
      <div :style="{ 'background-color': l.color }" class="square mr-2"></div>
      <span>{{ l.status }} </span>
    </span>
  </div>
</template>
<script>
// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|
export default {
  props: ['legendKey']
};
</script>
<style lang="scss">
.square {
  height: 10px;
  width: 10px;
}
</style>
