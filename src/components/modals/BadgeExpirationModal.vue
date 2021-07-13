<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent max-width="350">
      <v-card>
        <v-card-title v-if="badgesExpiring.length == 1" class="headline"> Your Badge is Expiring </v-card-title>
        <v-card-title v-else class="headline"> Your Badges are expiring </v-card-title>
        <v-card-text class="text--red">
          <ul>
            <li v-for="time in timesUntilExp" :key="time">You have a badge expiring in {{ time }} days</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" text @click="dialog = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      dialog: this.badgeExpiring,
      badgesExpiring: this.timesUntilExp
    };
  },
  props: ['badgeExpiring', 'timesUntilExp']
};
</script>

<style scoped>
li {
  color: red;
}
</style>
