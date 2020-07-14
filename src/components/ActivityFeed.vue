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
      <v-timeline v-else dense>
        <v-virtual-scroll :items="events" :item-height="100" height="600">
          <template v-slot="{ item }">
            <v-timeline-item :color="item.color" :key="item.name">
              <template v-slot:icon v-if="item.icon">
                <icon class="white--text" :name="item.icon"></icon>
              </template>
              <h3>{{ item.date }}</h3>
              <v-list-item class="ma-auto pa-auto" v-if="item.link" :href="item.link" target="_blank" :dense="true"
                >{{ item.text }}&nbsp;<icon height="12" width="12" name="external-link-alt" color="blue"></icon>
              </v-list-item>
              <div class="px-4" v-else>{{ item.text }}</div>
            </v-timeline-item>
          </template>
        </v-virtual-scroll>
      </v-timeline>
    </v-card>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      dense: false
    };
  },
  props: ['events', 'loading']
};
</script>
