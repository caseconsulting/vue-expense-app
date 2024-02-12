<template>
  <div>
    <h3 class="d-flex align-center"><v-icon class="mr-2">mdi-palm-tree</v-icon> PTO Balances</h3>
    <div class="d-flex justify-space-between my-3">
      <div>PTO</div>
      <div>
        <v-btn variant="text" density="compact" size="small" class="pa-0 mr-2 pto-btn" :color="this.caseRed">
          Cash Out
        </v-btn>
        175.16h
      </div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div>Holiday</div>
      <div>61h</div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div>Training</div>
      <div>4h</div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div>Case Cares</div>
      <div>4h</div>
    </div>
    <div class="d-flex justify-space-between my-3">
      <div>Case Connections</div>
      <div>4h</div>
    </div>
  </div>
</template>

<style scoped>
.pto-btn {
  margin-bottom: 2px;
}
</style>
