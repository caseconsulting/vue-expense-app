<template>
  <!-- Button to view names of employees -->
  <v-dialog v-model="show" max-width="400px" scrollable>
    <template #activator="{ props }">
      <v-btn class="px-1 ml-3" size="x-small" variant="outlined" v-bind="props"> view </v-btn>
    </template>
    <v-card class="mt-3">
      <!-- Dialog Title -->
      <v-card-title class="d-flex align-center header-slim">
        {{ props.title }}
      </v-card-title>
      <v-divider color="black" />
      <!-- List of employee names/ISSUES -->
      <v-card-text class="pb-0">
        <v-row>
          <v-list color="#f0f0f0" width="376">
            <div v-for="employee in props.employees" :key="employee.id">
              <v-list-item>
                <!-- Employee Image -->
                <template #prepend>
                  <user-avatar :employee="employee" :image="employee.avatar" />
                </template>
                <!-- Employee Name -->
                <v-list-item-title>{{ getEmployeeName(employee.id) }}</v-list-item-title>
              </v-list-item>
            </div>
          </v-list>
        </v-row>
      </v-card-text>

      <v-divider color="black" />
      <!-- Close dialog button -->
      <v-card-actions>
        <v-spacer />
        <v-btn theme="dark" variant="text" @click="show = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import UserAvatar from '@/components/shared/UserAvatar.vue';
import { ref } from 'vue';

const props = defineProps(['employees', 'title']);

const show = ref(false);

/**
 * Get the employee name of an employee id.
 *
 * @param employeeId - employee id
 * @return String - employee full name
 */
function getEmployeeName(employeeId) {
  let localEmployee = props.employees.find((employee) => employee.id === employeeId);
  return `${localEmployee.firstName} ${localEmployee.lastName}`;
}
</script>