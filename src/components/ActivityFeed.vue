<template>
  <div>
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
      <v-timeline v-else dense class="pt-0">
        <v-virtual-scroll :items="events" :item-height="this.itemHeight" height="600" bench="2">
          <template v-slot="{ item }">
            <div class="pa-4"></div>
            <v-hover v-slot:default="{ hover }" open-delay="200">
              <div>
                <v-timeline-item :color="item.color" :key="item.name">
                  <template v-slot:icon v-if="item.icon">
                    <icon class="white--text" :name="item.icon"></icon>
                  </template>
                  <h3>{{ item.date }}</h3>
                  <v-list-item class="ma-auto pa-auto" v-if="item.link" :href="item.link" target="_blank" :dense="true"
                    >{{ item.truncatedText ? item.truncatedText : item.text }}&nbsp;<icon
                      height="12"
                      width="12"
                      name="external-link-alt"
                      color="blue"
                    ></icon>
                  </v-list-item>
                  <div class="px-4" v-else>{{ item.truncatedText ? item.truncatedText : item.text }}</div>
                </v-timeline-item>
                <v-card v-if="hover && item.truncatedText" style="z-index: 10;">
                  <v-card-text>{{ item.text }}</v-card-text>
                </v-card>
              </div>
            </v-hover>
          </template>
        </v-virtual-scroll>
      </v-timeline>
    </v-card>
  </div>
</template>

<script>
//function item
function itemHeight() {
  switch (this.$vuetify.breakpoint.name) {
    case 'xs':
      return 200;
    case 'sm':
      return 200;
    case 'md':
      return 100;
    case 'lg':
      return 100;
    case 'xl':
      return 100;
  }
}
export default {
  data() {
    return {
      dense: false
    };
  },
  computed: {
    itemHeight
  },
  props: ['events', 'loading']
};
</script>
