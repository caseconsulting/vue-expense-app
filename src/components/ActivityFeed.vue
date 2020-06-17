<template>
  <v-flex pa-0>
    <v-card class="white--text" color="#bc3825">
      <v-card-title class="header_style">
        <h4>Activity Feed</h4>
      </v-card-title>
    </v-card>
    <v-card class="overflow-y-auto" max-height="376px">
      <!-- timeline -->
      <v-timeline dense>
        <v-timeline-item color="#bc3825" v-for="event in events" :key="event.name">
          <!-- <template v-slot:opposite>
            <icon :name="event.icon"></icon>
          </template> -->
          <template v-slot:icon v-if="event.icon">
            <icon class="white--text" :name="event.icon"></icon>
          </template>
          <h3>{{ event.date }}</h3>
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
