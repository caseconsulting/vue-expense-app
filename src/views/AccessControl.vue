<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center header_style">Access Control</v-card-title>
      <v-container fluid>
        <h1>Assignments</h1>
        <v-data-table
          :headers="[
            { title: 'Name', value: 'name' },
            { title: 'Access Level', value: 'access' }
          ]"
          :items="[
            { name: 'Paul Farmer', access: 'Admin' },
            { name: 'Amy Farmer', access: 'User' },
            { name: 'Caty Vincent', access: 'User' },
            { name: 'Alissa Bendele', access: 'Admin' }
          ]"
          class="elevation-1"
        />
        <br />
        <br />
        <hr />
        <br />
        <h1>Groups</h1>
        <h3>Admin</h3>
        <br />
        <!-- <v-row>
          <v-col>
            <v-combobox :items="employees" v-model="adminAccess" variant="outlined" label="Employees" class="mx-4" density="compact" multiple chips closable-chips />
          </v-col>
          <v-col>
            <v-combobox :items="tags" v-model="tagAccess" variant="outlined" label="Tags" class="mx-4" density="compact" multiple chips closable-chips />
          </v-col>
        </v-row> -->
        <v-row>
          <v-col>
            <v-card variant="outlined">
              <h4>Data</h4>
              <ul>
                <li v-for="i in 10" :key="i">{{ i }}</li>
              </ul>
            </v-card>
          </v-col>
          <v-col>
            <v-card variant="outlined">
              <h4>Portal Pages</h4>
              <ul>
                <li v-for="i in 10" :key="i">{{ i }}</li>
              </ul>
            </v-card>
          </v-col>
          <v-col>
            <v-card variant="outlined">
              <h4>Workflows</h4>
              <ul>
                <li v-for="i in 10" :key="i">{{ i }}</li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// employee picker
const employees = ref([
  'Paul Farmer',
  'Amy Farmer',
  'Caty Vincent',
  'Alissa Bendele',
  'Mike Frank',
  'Chad Martin',
  'Luke Ogburn',
  'Max Danh'
]);
const adminAccess = ref(['Paul Farmer', 'Amy Farmer']);

const tags = ref([
  'Admin',
  'Cool Peeps',
  'Trustworthy Folk',
  'Sketchy Employees'
]);
const tagAccess = ref(['Admin', 'Cool Peeps'])
</script>
