<template>
  <div>
    <div class="d-flex justify-space-between">
      <h3 class="d-flex align-center"><v-icon class="mr-2">mdi-palm-tree</v-icon> PTO Balances</h3>
      <v-btn variant="outlined" density="compact" class="px-2" :color="this.caseRed"> Cash Out PTO </v-btn>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div class="mr-3">PTO</div>
      <div class="dotted-line"></div>
      <div class="ml-3">175.16h</div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div class="mr-3">Holiday</div>
      <div class="dotted-line"></div>
      <div class="ml-3">61h</div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div class="mr-3">Training</div>
      <div class="dotted-line"></div>
      <div class="ml-3">4h</div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div class="mr-3">Case Cares</div>
      <div class="dotted-line"></div>
      <div class="ml-3">4h</div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div class="mr-3">Case Connections</div>
      <div class="dotted-line"></div>
      <div class="ml-3">4h</div>
    </div>
  </div>
</template>

<style scoped>
.dotted-line {
  height: 0.8em;
  background-image: linear-gradient(to right, rgb(210, 210, 210) 33%, rgba(184, 184, 184, 0) 0%);
  background-position: bottom;
  background-size: 7px 1px;
  background-repeat: repeat-x;
  flex-grow: 2;
}
</style>
