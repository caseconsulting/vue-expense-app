<template>
  <div>
    <v-row class="justify-center">
      <v-btn class="pr-xs-1" variant="text" icon="mdi-trophy" v-bind="props">
        <v-icon size="large" class="gold">mdi-trophy</v-icon>
      </v-btn>
    </v-row>
    <v-row class="justify-space-around">
      <v-btn class="pr-xs-1" variant="text" icon="mdi-trophy" v-bind="props">
        <v-icon size="large" class="silver">mdi-trophy</v-icon>
      </v-btn>
      <v-btn class="pr-xs-1" variant="text" icon="mdi-trophy" v-bind="props">
        <v-icon size="large" class="bronze">mdi-trophy</v-icon>
      </v-btn>
    </v-row>
  </div>
</template>

<script setup></script>
