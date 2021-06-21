<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">Errors found across multiple tabs</v-card-title>
        <v-card-text>
          Errors Found
          <!-- <ul>
                <li v-for="tab in errorTabs" :key="tab">{{ tab }}</li>
            </ul> -->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click.native="
              emit('canceled');
              activate = false;
            "
            >Ok</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/**
 * Emits a message and data if it exists.
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
  data() {
    return {
      activate: false // dialog activator
    };
  },
  methods: {
    emit
  },
  props: [
    'toggleSubmissionConfirmation' // dialog activator
  ],
  watch: {
    toggleSubmissionConfirmation: function () {
      this.activate = true;
    }
  }
};
</script>
