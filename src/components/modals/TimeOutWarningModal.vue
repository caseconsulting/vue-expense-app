<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-text class="font-weight-medium text-h6">Session Time Out Warning</v-card-text>
        <v-card-text>Warning: Your session will time out in 5 minutes. Please complete any progress.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" variant="text" @click="activate = false">Ok</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleWarning
 */
function watchToggleWarning() {
  this.activate = this.toggleWarning;
} // watchToggleWarning

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      activate: false // dialog activator
    };
  },
  props: ['toggleWarning'], // dialog activator
  watch: {
    toggleWarning: watchToggleWarning
  }
};
</script>
