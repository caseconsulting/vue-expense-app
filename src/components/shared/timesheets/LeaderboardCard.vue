<template>
  <v-card>
    <template v-slot:title>
      <span class="font-16 font-weight-black" style="height: 20px">1860 Leaderboard</span>
    </template>
    <v-table class="table" density="compact">
      <tbody>
        <tr v-for="(leader, index) in leaders" :key="index" :class="leader.class">
          <th scope="row">{{ leader.rank }}</th>
          <td>
            <span class="ms-1">{{ leader.name }}</span>
          </td>
          <td>{{ leader.percent }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import ProjectsEmployeesAssignedModal from '../../modals/ProjectsEmployeesAssignedModal.vue';

const store = useStore();
const props = defineProps(['rows']);

const leaderboardData = ref([
  { rank: 1, name: 'Caty Vincent', percent: '22.1', employeeNumber: 'XXX' },
  { rank: 2, name: 'Alissa Bendele', percent: '20.7', employeeNumber: 'XXX' },
  { rank: 3, name: 'Luke Ogburn', percent: '20.5', employeeNumber: 'XXX' },
  { rank: 4, name: 'Max Danh', percent: '20.1', employeeNumber: 'XXX' },
  { rank: 5, name: 'Amy Farmer', percent: '20.0', employeeNumber: 'XXX' },
  { rank: 6, name: 'XXX', percent: '20.0', employeeNumber: 'XXX' },
  { rank: 7, name: 'XXX', percent: '20.0', employeeNumber: 'XXX' },
  { rank: 8, name: 'Rachel Litscher', percent: '16.8', employeeNumber: 10065, class: 'highlight-row' }
]);
const userData = leaderboardData.value.find((l) => l.employeeNumber == store.getters.employeeNumber);
const leaders = ref(leaderboardData.value.slice(0, props.rows));
if (userData.rank > leaders.value.length && userData.rank <= leaderboardData.value.length) {
  leaders.value = leaders.value.slice(0, props.rows - 1).concat([userData]);
}
</script>
