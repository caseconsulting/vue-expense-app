<template>
  <div>
    <v-card>
      <v-card-title class="header_style">
        <v-icon class="mr-2" color="white">{{ item.icon }}</v-icon>
        <span class="text-h6">{{ item.date }}</span>
      </v-card-title>
      <v-card-text>
        <v-list-item-group>
          <v-list-item v-for="event in item.events" :key="event.text" :ripple="false" inactive :three-line="isMobile">
            <v-list-item-icon>
              <v-icon color="blue">mdi-calendar-today</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ event.date }}</v-list-item-title>
              <v-list-item-subtitle>{{ event.text }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="gray darken-1" text @click="emit('close-anniversaries-modal')"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { format } from '@/shared/dateUtils';
import { isMobile } from '../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isMobile
  },
  methods: {
    emit,
    format
  },
  props: [
    'item' // the passed event item
  ]
};
</script>
