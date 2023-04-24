<template>
  <v-container fluid>
    <v-row>
      <v-col cols="3" align="left" justify="left">
        <v-skeleton-loader class="pr-1" type="button"></v-skeleton-loader>
      </v-col>
      <v-col cols="9" align="right" justify="right">
        <v-skeleton-loader class="d-inline-block mr-1" type="button"></v-skeleton-loader>
        <v-skeleton-loader class="d-inline-block" type="button"></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="5" lg="4" class="pt-0">
        <v-skeleton-loader class="mb-4" type="card-heading, list-item@5"></v-skeleton-loader>
        <v-skeleton-loader type="card-heading, list-item@5"></v-skeleton-loader>
      </v-col>
      <v-col cols="12" :md="7" :lg="8" class="pt-0">
        <v-skeleton-loader type="card-heading, list-item@25"></v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>
