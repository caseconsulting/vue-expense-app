<template>
  <div>
    <v-menu transition="slide-y-transition" location="bottom" theme="light" open-on-click>
      <template v-slot:activator="{ props }">
        <v-btn color="white" class="pr-xs-1" variant="text" icon="mdi-trophy" v-bind="props">
          <v-icon size="large">mdi-trophy</v-icon>
        </v-btn>
      </template>

      <bonus-1860-leaderboard-card :rows="6" />
    </v-menu>
  </div>
</template>
<script setup>
import Bonus1860LeaderboardCard from '@/components/shared/Bonus1860LeaderboardCard';
</script>
