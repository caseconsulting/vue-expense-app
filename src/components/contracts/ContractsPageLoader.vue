<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid>
        <v-row class="flex justify-spacebetween ma-1">
          <!-- search -->
          <v-col cols="6" xl="6" lg="6" md="6" class="mt-6 mb-1">
            <v-skeleton-loader type="text" width="25%"></v-skeleton-loader>
            <v-skeleton-loader type="text" width="100%"></v-skeleton-loader>
          </v-col>
          <!-- check box -->
          <v-col cols="6" xl="6" lg="6" md="6" sm="6" class="mt-7 mb-1">
            <v-skeleton-loader type="text" width="40%"></v-skeleton-loader>
          </v-col>
        </v-row>
        <!-- data table -->
        <v-skeleton-loader type="table-row-divider@20" class="px-4 white"></v-skeleton-loader>
      </v-container>
    </v-card>
  </div>
</template>
