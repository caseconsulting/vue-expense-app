<template>
  <v-card>
    <v-card-text class="bg-grey-lighten-3">
      <!-- Other Variables -->
      <div>
        <div class="text-h6 text-decoration-underline">Variables</div>
        <div class="mb-3">Employee Work Status (<span class="var">EWS</span>) = 0-100 (100 being full-time)</div>
        <div class="mb-3">
          Period Work Days (<span class="var">PWD</span>) = week days from period start date to period end date
        </div>
        <div class="mb-3">
          Period Work Days Pro Rated (<span class="var">PWDPR</span>) =
          <ul>
            <li>
              Employee hire date or contract start date falls after period start date —> hire date/contract start date
              to period end date
            </li>
            <li>Otherwise —> <span>PWD</span></li>
          </ul>
        </div>
        <div class="mb-3">
          Pro Rated Hours (<span class="var">PRH</span>) =
          <ul>
            <li>Pay Period —> 8 * (<span>EWS</span> / 100)</li>
            <li>Calendar/Contract Period —> 1860 / <span>PWD</span></li>
          </ul>
        </div>
      </div>
      <!-- Donut Chart Details -->
      <div class="my-4">
        <div class="text-h6 text-decoration-underline">Donut Chart</div>
        <div class="mb-3">
          <div class="font-weight-bold d-inline-block">Period Hours Completed (<span class="var">PHC</span>)</div>
          =
          <ul>
            <li>Pay Period —> All hours inputted in Unanet during the displayed time period</li>
            <li>Calendar/Contract Period —> Billable hours inputted in Unanet during the displayed time period</li>
          </ul>
        </div>
        <div>
          <div class="font-weight-bold d-inline-block">Period Hours Needed (<span class="var">PHN</span>)</div>
          =
          <ul>
            <li>Pay Period —> <span>PWDPR</span> * <span>PRH</span></li>
            <li>Calendar/Contract Period —> ROUND(<span>PWDPR</span> * <span>PRH</span>)</li>
          </ul>
        </div>
      </div>
      <!-- Period Details -->
      <div class="my-4">
        <div class="text-h6 text-decoration-underline">Period Details</div>
        <div class="mb-3">
          <div class="font-weight-bold d-inline-block">Remaining (<span class="var">R</span>)</div>
          = <span>PHN</span> - <span>PHC</span> (minimum of 0)
        </div>
        <div class="mb-3">
          <div class="font-weight-bold d-inline-block">Remaining Avg/Day</div>
          = <span>R</span> / <span>WDR</span>
        </div>
        <div class="mb-3">
          <div class="font-weight-bold d-inline-block">Behind By / Ahead By</div>
          = <span>PHN</span> - <span>WDR</span> * <span>PRH</span> - <span>PHC</span>
        </div>
        <div class="mb-3">
          <div class="font-weight-bold d-inline-block">Work Days Remaining (<span class="var">WDR</span>)</div>
          = week days from today to the period end date - future days with time inputted in Unanet
        </div>
      </div>
      <div>Note: You can edit Work Days Remaining field by clicking on it</div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
ul {
  margin-left: 40px;
}
span {
  font-style: italic;
  font-weight: bold;
  color: #c44601;
}

.var {
  color: #0073e6;
}
</style>
