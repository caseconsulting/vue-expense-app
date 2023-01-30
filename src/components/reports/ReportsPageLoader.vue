<template>
  <v-container fluid>
    <v-row>
      <!-- tabs -->
      <v-col cols="3" class="my-1 py-0">
        <v-skeleton-loader type="text" width="25%" class="center"></v-skeleton-loader>
      </v-col>
      <v-col cols="3" class="my-1 py-0">
        <v-skeleton-loader type="text" width="40%" class="center"></v-skeleton-loader>
      </v-col>
      <v-col cols="3" class="my-1 py-0">
        <v-skeleton-loader type="text" width="25%" class="center"></v-skeleton-loader>
      </v-col>
      <v-col cols="3" class="my-1 py-0">
        <v-skeleton-loader type="text" width="35%" class="center"></v-skeleton-loader>
      </v-col>
      <!-- filters -->
      <v-col cols="12" xl="3" lg="3" md="3" sm="12" class="my-12 pb-lg-2 pb-md-0 mb-sm-2">
        <v-skeleton-loader type="text" width="62%"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
      </v-col>
      <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-12 pb-lg-2 pb-md-0 mt-md-12 mt-sm-0 mb-sm-2">
        <v-skeleton-loader type="text" width="43%"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
      </v-col>
      <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-12 pb-lg-2 pb-md-0 mt-md-12 mt-sm-0 mb-sm-2">
        <v-skeleton-loader type="text" width="35%"></v-skeleton-loader>
        <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
      </v-col>
      <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-12 pb-lg-2 pb-md-0 mt-md-12 mt-sm-0 mb-sm-2">
        <v-skeleton-loader type="text" width="53%"></v-skeleton-loader>
      </v-col>
    </v-row>
    <!-- data table -->
    <v-skeleton-loader elevation="1" type="table-row-divider@20" class="px-4 white"></v-skeleton-loader>
  </v-container>
</template>

<style scoped>
.center {
  margin: 0 auto;
}
</style>
