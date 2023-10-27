<template>
  <div>
    <!-- Status Alert -->
    <v-snackbar v-model="status.statusType" :color="status.color" multi-line :timeout="5000" location="bottom" vertical>
      <v-card-title headline color="white">
        <span class="text-h5">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <!-- Modal Card -->
    <v-card>
      <!-- Modal Title -->
      <v-card-title class="text-h5 header_style">Tag Manager</v-card-title>
      <!-- Modal Content -->
      <v-card-text class="mt-4">
        <tags-table></tags-table>
      </v-card-text>
      <!-- Action Button -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-3"
          variant="text"
          @click.native="
            emit(`close-tag-manager`);
            activate = false;
          "
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import TagsTable from '@/components/employees/tags/TagsTable.vue';

/**
 * beforeDestroy life cycle hook
 */
function beforeDestroy() {
  this.emitter.off('status-alert');
} // beforeDestroy

/**
 * Mounted life cycle hook
 */
function mounted() {
  this.emitter.on('status-alert', (status) => {
    this.status['statusType'] = status.statusType;
    this.status['statusMessage'] = status.statusMessage;
    this.status['color'] = status.color;
  });
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.status['statusType'] = undefined;
  this.status['statusMessage'] = '';
  this.status['color'] = '';
} // clearStatus

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    this.emitter.emit(msg, data);
  } else {
    // data does not exist
    this.emitter.emit(msg);
  }
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  components: {
    TagsTable
  },
  data() {
    return {
      activate: false, // dialog activator
      creatingTag: false,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  },
  methods: {
    clearStatus,
    emit
  },
  mounted
};
</script>
