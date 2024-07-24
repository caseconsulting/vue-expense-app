<template>
  <v-container fluid>
    <v-row justify="space-between">
      <!-- Back button in upper left -->
      <v-col cols="3" align="left" justify="left">
        <v-skeleton-loader width="70%" class="pr-1" type="heading"></v-skeleton-loader>
      </v-col>
      <!-- Buttons in upper right -->
      <v-col cols="6" align="center" justify="left">
        <v-skeleton-loader width="45%" type="heading"></v-skeleton-loader>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row>
      <!-- Quickbooks and available budgets widgets -->
      <v-col cols="12" lg="4" class="pt-0">
        <v-skeleton-loader class="mb-4" type="list-item@12"></v-skeleton-loader>
        <v-skeleton-loader class="mb-4" type="list-item@20"></v-skeleton-loader>
      </v-col>
      <!-- Employee profile data -->
      <v-col cols="12" lg="8" class="pa-0">
        <v-container class="d-flex ma-0" fluid>
          <v-skeleton-loader v-if="display.lgAndUp.value" type="list-item@14" width="70%"></v-skeleton-loader>
          <v-skeleton-loader type="list-item@14" class="w-100"></v-skeleton-loader>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify';
const display = useDisplay();
</script>
