<template>
  <v-container fluid>
    <v-row>
      <!-- Back button in upper left -->
      <v-col cols="3" align="left" justify="left">
        <v-skeleton-loader width="70%" class="pr-1" type="heading"></v-skeleton-loader>
      </v-col>
      <!-- Buttons in upper right -->
      <v-col cols="9" align="right" justify="right">
        <v-skeleton-loader width="70%" type="heading"></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row>
      <!-- Timesheets and available budgets widgets -->
      <v-col cols="12" md="5" lg="4" class="pt-0">
        <v-skeleton-loader class="mb-4" type="list-item@7"></v-skeleton-loader>
        <v-skeleton-loader class="mb-4" type="list-item@7"></v-skeleton-loader>
        <v-skeleton-loader type="list-item@7"></v-skeleton-loader>
      </v-col>
      <!-- Employee profile data -->
      <v-col cols="12" md="7" lg="8" class="pt-0">
        <v-skeleton-loader type="list-item@25"></v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>
