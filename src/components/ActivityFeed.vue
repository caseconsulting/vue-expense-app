<template>
  <v-flex pa-0>
    <v-card class="white--text" color="#bc3825">
      <v-card-title class="header_style">Activity Feed</v-card-title>
    </v-card>
    <v-card class="overflow-y-auto" max-height="376px">
      <!-- timeline -->
      <v-timeline dense>
        <v-timeline-item color="#bc3825" v-for="event in events" :key="event.name">
          <!-- <template v-slot:opposite>
            <icon :name="event.icon"></icon>
          </template> -->
          <template v-slot:icon v-if="event.employeeAvatar">
            <icon class="white--text" :name="event.icon"></icon>
          </template>
          <div>{{ event.text }}</div>
        </v-timeline-item>
      </v-timeline>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  props: ['events']
};
</script>
