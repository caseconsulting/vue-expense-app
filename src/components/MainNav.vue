<template>
  <div>
    <!-- Navigation Links -->
    <v-list class="pt-0" dense>
      <v-divider></v-divider>
      <div v-for="(item, i) in visibleTiles" :key="i">
        <v-list-group v-if="item.subItems" :key="item.title" no-action active-class="v-list__tile--active">
          <template v-slot:activator>
            <!-- Parent Item Icon -->
            <v-list-item-icon style="width: 24px;">
              <icon :name="item.icon" class="navbar-icons"></icon>
            </v-list-item-icon>

            <!-- Parent Item Title -->
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="subItem in item.subItems"
            :key="subItem.title"
            active-class="red--text v-list__tile--active"
            :to="{ name: subItem.route }"
            @click="
              scrollUp;
              close;
            "
          >
            <!-- SubItems Title -->
            <v-list-item-content style="margin-left: 75px;">
              <v-list-item-title>{{ subItem.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-item
          v-else
          :key="item.title"
          active-class="red--text v-list__tile--active"
          :to="{ name: item.route }"
          @click="scrollUp"
        >
          <!--NavBar icons-->
          <!-- Item Icon -->

          <v-list-item-icon style="width: 24px;">
            <icon :name="item.icon" class="navbar-icons"></icon>
          </v-list-item-icon>

          <!-- Item mTitle -->
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-list>
    <!-- End Navigation Links -->
  </div>
</template>

<script>
// @ is an alias to /src
import { getRole } from '@/utils/auth';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Filter items by user permissions.
 *
 * @return Array - Filtered items
 */
function visibleTiles() {
  return _.filter(this.items, (item) => {
    if (item.subItems) {
      if (_.includes(item.permission, this.permissions)) {
        item.subItems = _.filter(item.subItems, (subItem) => {
          {
            return _.includes(subItem.permission, this.permissions);
          }
        });
        return true;
      } else {
        return false;
      }
    } else {
      return _.includes(item.permission, this.permissions);
    }
  });
} // visibleTiles

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function scrollUp() {
  this.$vuetify.goTo(0);
} // scrollUp

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set permissions by user role.
 */
async function created() {
  this.permissions = getRole();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    visibleTiles
  },
  created,
  data() {
    return {
      items: [
        {
          title: 'Home',
          icon: 'home',
          route: 'home',
          permission: ['user', 'admin']
        },
        {
          title: 'Expenses',
          icon: 'dollar-sign',
          subItems: [
            {
              title: 'My Budgets',
              icon: 'hand-holding-usd',
              route: 'myBudgets',
              permission: ['user', 'admin']
            },
            {
              title: 'My Expenses',
              icon: 'dollar-sign',
              route: 'expenses',
              permission: ['admin', 'user']
            },
            {
              title: 'Expense Types',
              icon: 'book',
              route: 'expenseTypes',
              permission: ['admin', 'user']
            },
            {
              title: 'Reimbursements',
              icon: 'desktop',
              route: 'reimbursements',
              permission: ['admin']
            }
          ],
          permission: ['user', 'admin']
        },
        {
          title: 'Employees',
          icon: 'users',
          route: 'employees',
          permission: ['admin', 'user']
        },
        {
          title: 'Training',
          icon: 'fire',
          route: 'training',
          permission: ['admin', 'user']
        },
        {
          title: 'Help',
          icon: 'life-ring',
          route: 'help',
          permission: ['admin', 'user']
        }
      ], // navigation options
      permissions: '' // user role
    };
  },
  methods: {
    scrollUp,
    close
  }
};
</script>

<style lang="scss">
.e {
  color: #68caa6;
}

#main-header {
  font-family: 'Quicksand', sans-serif;
  font-weight: bold;
  font-size: 48px;
  color: #38424d;
  padding-top: 1%;
  padding-bottom: 2%;
}

.navbar-icons,
.icon-text {
  vertical-align: middle;
}

.navbar-icons {
  color: #646460;
  text-align: center;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

#nav-button {
  float: left;
}

#nav-button :focus {
  outline: none;
}

#slider-logo {
  margin-bottom: 5px;
}
</style>
