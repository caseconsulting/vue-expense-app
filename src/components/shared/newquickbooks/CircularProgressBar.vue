<template>
  <div class="wrap-circles">
    <div class="circle">
      <div class="inner">
        <div class="divider pb-1">130h</div>
        <div class="pt-1">168h</div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Mounted lifecycle hook.
 */
function mounted() {
  document.querySelector('.circle').style.backgroundImage = `conic-gradient(green ${this.percent}%, #f3f3f3 0)`;
} // mounted

export default {
  mounted,
  props: ['percent']
};
</script>

<style scoped>
.wrap-circles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.circle {
  position: relative;
  width: 125px;
  height: 125px;
  border-radius: 50%;
  overflow: hidden;
}
.circle .inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 300;
}
.divider {
  border-bottom: 1px solid gray;
}
</style>
