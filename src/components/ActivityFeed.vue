<template>
  <v-flex pa-0>
    <!-- title -->
    <v-card class="white--text" color="#bc3825">
      <v-card-title class="header_style">
        <h4>Activity Feed</h4>
      </v-card-title>
    </v-card>
    <!-- loading bar -->
    <v-card class="overflow-y-auto" max-height="676px">
      <div v-if="this.loading" class="py-4">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <!-- timeline -->
      <div v-else>
        <v-timeline dense>
          <v-timeline-item color="#bc3825" v-for="event in events" :key="event.name">
            <template v-slot:icon v-if="event.icon">
              <icon class="white--text" :name="event.icon"></icon>
            </template>
            <h3>{{ event.date }}</h3>
            <div class="px-4">{{ event.text }}</div>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  props: ['events', 'loading']
};
</script>
