<template>
  <v-layout row justify-center>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title class="headline">
          <div class="message">
            <p class="header" v-if="notes || url">Notes</p>
            <p class="header" v-else>No Notes</p>
            <p class="notes" v-if="notes">{{ notes }}</p>
            <a v-if="url" :href="url">{{ url }}</a>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue" flat @click.native="emit(`close-notes`)">Close</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  props: ['activate', 'notes', 'url'],
  methods: {
    emit(msg, data) {
      if (data) {
        window.EventBus.$emit(msg, data);
      } else {
        window.EventBus.$emit(msg);
      }
    }
  }
};
</script>

<style>
.message {
  width: 100%;
}

.notes {
  font-size: 18px;
  color: black;
}

.message a {
  font-size: 14px;
  color: #636363;
  text-decoration: none;
}

.message a:hover {
  color: gray;
}

.header {
  text-align: center;
  font-weight: bold;
  text-decoration: underline;
}
</style>
