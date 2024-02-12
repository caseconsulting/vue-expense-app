<template>
  <div>
    <v-row>
      <v-col order="1" cols="12" sm="12" md="6" lg="6" xl="6" xxl="6">
        <div class="d-flex justify-space-evenly align-center mb-1">
          <v-btn icon="" variant="text" size="large" density="compact">
            <v-tooltip activator="parent" location="top">Previous Month</v-tooltip>
            <v-icon size="x-large"> mdi-arrow-left-thin </v-icon>
          </v-btn>
          <h3>February</h3>
          <v-btn disabled icon="" variant="text" size="large" density="compact">
            <v-tooltip activator="parent" location="top">Next Month</v-tooltip>
            <v-icon size="x-large"> mdi-arrow-right-thin </v-icon>
          </v-btn>
        </div>
        <circular-progress-bar :percent="77.9"></circular-progress-bar>
        <!-- <v-progress-linear model-value="70" :color="this.caseGray" height="30">
          <template v-slot:default>
            <span class="text-white font-weight-black">130h / 168h</span>
          </template>
        </v-progress-linear> -->
      </v-col>
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" sm="12" md="6" lg="6" xl="6" xxl="6">
        <h3 class="d-flex align-center mb-3"><v-icon class="mr-2">mdi-book-open-variant-outline</v-icon>Details</h3>
        <div class="d-flex justify-space-between my-3">
          <div>
            <span>Remaining</span>
          </div>
          <div>38h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div>
            <span>Remaining Avg/Day</span>
          </div>
          <div class="text-red">10.5h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div>Behind By</div>
          <div class="text-red">8h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div>Days Remaining</div>
          <div>16</div>
        </div>
      </v-col>
      <v-col :order="$vuetify.display.mdAndUp ? 3 : 2" cols="12">
        <h3 class="d-flex align-center"><v-icon class="mr-2">mdi-briefcase-outline</v-icon>Job Codes</h3>
        <div class="d-flex justify-space-between my-3">
          <div>Case Portal/Expense App/Website</div>
          <div>100h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div>R&D - Delphi</div>
          <div>22h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div>Holiday</div>
          <div>8h</div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import CircularProgressBar from '@/components/shared/newquickbooks/CircularProgressBar.vue';

export default {
  components: {
    CircularProgressBar
  }
};
</script>
