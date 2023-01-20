<template>
  <v-container fluid>
    <v-row>
      <v-col cols="6" xl="3" lg="3" md="6" class="my-3 pb-lg-2 pb-md-0">
        <v-skeleton-loader type="text" width="15%"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
      </v-col>
      <v-col cols="6" xl="3" lg="3" md="6" class="my-3 pb-lg-2 pb-md-0">
        <v-skeleton-loader type="text" width="0%"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
      </v-col>
      <v-col cols="6" xl="3" lg="3" md="6" class="my-3 pb-lg-2 pb-md-0">
        <v-skeleton-loader type="text" width="0%"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
      </v-col>
      <v-col cols="6" xl="3" lg="3" md="6" class="my-3 pb-3 pb-xl-3 pb-lg-3 pb-md-0">
        <v-skeleton-loader type="text" width="0%"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
      </v-col>
      <v-col>
        <v-skeleton-loader type="text" width="13%" class="pt-9 pb-4"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-skeleton-loader elevation="1" type="table-row-divider@20" class="px-4 white"></v-skeleton-loader>
  </v-container>
</template>
