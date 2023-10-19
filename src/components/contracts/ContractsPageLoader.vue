<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid>
        <v-row class="d-flex justify-space-between ma-1">
          <!-- search -->
          <v-col cols="4" class="mt-6 mb-1">
            <v-skeleton-loader type="text" width="25%"></v-skeleton-loader>
            <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
          </v-col>
          <!-- filter -->
          <div class="d-flex align-center">
            <v-skeleton-loader type="text" width="40%" class="mr-3"></v-skeleton-loader>
            <v-skeleton-loader type="button" class="d-inline-block"></v-skeleton-loader>
            <v-skeleton-loader type="button" class="d-inline-block"></v-skeleton-loader>
            <v-skeleton-loader type="button" class="d-inline-block"></v-skeleton-loader>
          </div>
          <!-- action burrons -->
          <v-col cols="4" class="d-flex justify-end align-center flex-wrap">
            <v-skeleton-loader type="button" class="d-inline-block"></v-skeleton-loader>
            <v-skeleton-loader type="button" class="d-inline-block ml-4"></v-skeleton-loader>
            <v-skeleton-loader type="button" class="d-inline-block ml-4"></v-skeleton-loader>
            <v-skeleton-loader type="button" class="d-inline-block ml-4"></v-skeleton-loader>
          </v-col>
        </v-row>
        <!-- data table -->
        <v-skeleton-loader type="table-row-divider@20" class="px-4 bg-white"></v-skeleton-loader>
      </v-container>
    </v-card>
  </div>
</template>
