<template>
  <div>
    <!-- Navigation Links -->
    <v-list class="pt-0" density="compact">
      <v-divider></v-divider>
      <div v-for="(item, i) in visibleTiles" :key="i">
        <!-- Grouped Navigation Links -->
        <v-list-group v-if="item.subItems" color="red">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              active-class="case-red-text"
              :color="item.active ? caseRed : caseGray"
              :class="item.active ? 'case-red-text' : ''"
            >
              <!-- Parent Item Icon -->
              <template v-slot:prepend>
                <v-icon :id="item.icon" :color="item.active ? caseRed : caseGray" class="navbar-icons">
                  {{ item.icon }}
                </v-icon>
              </template>
              <!-- Parent Item Title -->
              <v-list-item-title class="nav-item">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item
            v-for="subItem in item.subItems"
            :key="subItem.title"
            :color="'#bc3825'"
            :class="subItem.active ? 'case-red-text' : ''"
            @click="handleNavigation(subItem)"
          >
            <!-- SubItems Title -->
            <v-list-item-title class="nav-item">{{ subItem.title }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
        <!-- End Grouped Navigation Links -->

        <!-- Individual Navavigation Links -->
        <v-list-item
          v-else
          :id="item.icon"
          :color="item.active ? caseRed : caseGray"
          :class="item.active ? 'case-red-text' : ''"
          @click="handleNavigation(item)"
        >
          <!--NavBar icons-->
          <!-- Item Icon -->
          <template v-slot:prepend>
            <v-icon :id="item.icon" :color="item.active ? caseRed : caseGray" class="navbar-icons">
              {{ item.icon }}
            </v-icon>
          </template>
          <!-- Item mTitle -->
          <v-list-item-title class="nav-item">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </div>
    </v-list>
    <!-- End Navigation Links -->
  </div>
</template>

<script setup>
// @ is an alias to /src
import { getRole } from '@/utils/auth';
import _isNil from 'lodash/isNil';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _includes from 'lodash/includes';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

// would call it 'route' normally, but that name is already taken
const route = useRoute();
const router = useRouter();

const items = ref([
  {
    title: 'Home',
    icon: 'mdi-home',
    route: 'home',
    permission: ['user', 'admin', 'intern', 'manager'],
    active: false
  },
  {
    title: 'Expenses',
    icon: 'mdi-currency-usd',
    subItems: [
      {
        title: 'My Budgets',
        icon: 'mdi-hand-coin',
        route: 'myBudgets',
        permission: ['user', 'admin', 'intern', 'manager'],
        active: false
      },
      {
        title: 'My Expenses',
        icon: 'mdi-currency-usd',
        route: 'expenses',
        permission: ['admin', 'user', 'intern', 'manager'],
        active: false
      },
      {
        title: 'Expense Types',
        icon: 'mdi-book',
        route: 'expenseTypes',
        permission: ['admin', 'user', 'manager'],
        active: false
      },
      {
        title: 'Reimbursements',
        icon: 'mdi-monitor',
        route: 'reimbursements',
        permission: ['admin', 'manager'],
        active: false
      }
    ],
    permission: ['user', 'admin', 'intern', 'manager'],
    active: false
  },
  {
    title: 'PTO Cash Outs',
    icon: 'mdi-cash',
    route: 'ptoCashOuts',
    permission: ['admin', 'user', 'manager'],
    active: false
  },
  {
    title: 'Employees',
    alias: ['employee'],
    icon: 'mdi-account-group',
    route: 'employees',
    permission: ['admin', 'user', 'intern', 'manager'],
    active: false
  },
  {
    title: 'Statistics Dashboard',
    alias: ['stats'],
    icon: 'mdi-chart-bar',
    route: 'stats',
    permission: ['admin', 'user', 'intern', 'manager'],
    active: false
  },
  {
    title: 'Audits',
    alias: ['audit'],
    icon: 'mdi-clipboard-check',
    route: 'audits',
    subItems: [
      {
        title: 'Old Audits',
        icon: 'mdi-abacus',
        route: 'old-audits',
        permission: ['admin', 'manager'],
        active: false
      },
      {
        title: 'Something idk',
        icon: 'mdi-clipboard-multiple',
        route: 'audits',
        permission: ['admin', 'manager'],
        active: false
      },
      {
        title: 'Expense History',
        icon: 'mdi-clipboard-text-multiple',
        route: 'expenseHistory',
        permission: ['admin', 'manager'],
        active: false
      },
      {
        title: 'Employee History',
        icon: 'mdi-clipboard-play-multiple',
        route: 'employeeHistory',
        permission: ['admin', 'manager'],
        active: false
      }
    ],
    permission: ['admin', 'manager'],
    active: false
  },
  {
    title: 'Contracts',
    icon: 'mdi-file-document-edit',
    route: 'contracts',
    permission: ['admin', 'manager'],
    active: false
  },
  {
    title: 'Reports',
    alias: ['reports'],
    icon: 'mdi-clipboard-list',
    route: 'reports',
    permission: ['admin', 'user', 'intern', 'manager'],
    active: false
  },
  {
    title: 'Training',
    icon: 'mdi-fire',
    route: 'training',
    permission: ['admin', 'user', 'intern', 'manager'],
    active: false
  },
  {
    title: 'Help',
    icon: 'mdi-lifebuoy',
    route: 'help',
    permission: ['admin', 'user', 'intern', 'manager'],
    active: false
  }
]); // navigation options
const permissions = ref(''); // user role
const visibleTiles = ref([]);

// Set permissions by user role.
permissions.value = getRole();
visibleTiles.value = getVisibleTiles();

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

// Updates active field of item with subItems.
watch(
  () => route.name,
  () => {
    var isAnyActive;
    for (var i in items.value) {
      if (items.value[i].subItems) {
        isAnyActive = false;
        for (var j in items.value[i].subItems) {
          if (items.value[i].subItems[j].route == route.name) {
            items.value[i].subItems[j].active = true;
            isAnyActive = true;
          } else {
            items.value[i].subItems[j].active = false;
          }
        }
        items.value[i].active = isAnyActive;
      } else {
        items.value[i].active = route.name
          ? route.name.includes(items.value[i].route) ||
            !_isNil(
              _find(items.value[i].alias, (alias) => {
                return route.name.includes(alias);
              })
            )
          : null;
      }
    }
  },
  { immediate: true }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Scrolls up the page.
 */
function handleNavigation(item) {
  router.push({ name: item.route });
  window.scrollTo(0, 0);
} // scrollUp

/**
 * Filter items by user permissions.
 *
 * @return Array - Filtered items
 */
function getVisibleTiles() {
  return _filter(items.value, (item) => {
    if (item.subItems) {
      if (_includes(item.permission, permissions.value)) {
        item.subItems = _filter(item.subItems, (subItem) => {
          {
            return _includes(subItem.permission, permissions.value);
          }
        });
        return true;
      } else {
        return false;
      }
    } else {
      return _includes(item.permission, permissions.value);
    }
  });
} // visibleTiles
</script>

<style lang="scss" scoped>
.case-red-text {
  color: #bc3825;
}

.navbar-icons {
  vertical-align: middle;
  text-align: center;
  opacity: 1 !important;
}

.list-icons {
  width: 24px;
}

.nav-item {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1rem;
}
</style>
