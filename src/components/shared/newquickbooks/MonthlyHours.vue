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
        <timesheets-chart></timesheets-chart>
      </v-col>
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" md="6" lg="6" xl="6" xxl="6">
        <h3 class="d-flex align-center mb-3 mt-1">
          <v-icon class="mr-2">mdi-book-open-variant-outline</v-icon>
          Monthly Details
        </h3>

        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Remaining</div>
          <div class="dotted-line"></div>
          <div class="ml-3">38h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Remaining Avg/Day</div>
          <div class="dotted-line"></div>
          <div class="text-red font-weight-bold ml-3">10.5h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Behind By</div>
          <div class="dotted-line"></div>
          <div class="text-red font-weight-bold ml-3">8h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Days Remaining</div>
          <div class="dotted-line"></div>
          <div class="ml-3">16</div>
        </div>
      </v-col>
      <v-col :order="$vuetify.display.mdAndUp ? 3 : 2" cols="12">
        <h3 class="d-flex align-center"><v-icon class="mr-2">mdi-briefcase-outline</v-icon>Monthly Job Codes</h3>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Case Portal/Expense App/Website</div>
          <div class="dotted-line"></div>
          <div class="ml-3">100h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">R&D - Delphi</div>
          <div class="dotted-line"></div>
          <div class="ml-3">22h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Holiday</div>
          <div class="dotted-line"></div>
          <div class="ml-3">8h</div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import TimesheetsChart from '@/components/charts/custom-charts/TimesheetsChart.vue';

export default {
  components: {
    TimesheetsChart
  }
};
</script>

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
