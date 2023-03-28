<template>
  <div class="field-container">
    <p @click="$emit('click')">
      <b v-if="label">{{ label }}:</b> {{ show ? value : '*****' }}
    </p>
    <a
      class="show font-weight-bold text-caption"
      @click="
        () => {
          show = !show;
        }
      "
      >{{ show ? 'Hide' : 'Show' }}</a
    >
  </div>
</template>
<script>
/**
 * Created lifecycle hook
 */
function created() {
  window.EventBus.$on('show-all', (val) => {
    this.show = val;
  });
} // created

export default {
  created,
  data() {
    return {
      show: false
    };
  },
  props: ['label', 'value']
};
</script>
<style scoped>
.field-container {
  position: relative;
}

.show {
  position: absolute;
  top: 16px;
}
</style>
