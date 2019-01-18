<template>
  <v-container>
    <div>
      <h1 style="text-align:center">H<span class="e">€</span>LP</h1>
    </div>
    <br />
    <br />
    <div v-if="role !== 'user'">
      <h2>Expenses</h2>
      <div class="mb-5">
        <div class="text-xs-center mb-3"></div>
        <v-expansion-panel expand>
          <v-expansion-panel-content>
            <div slot="header">About</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="space-shuttle"/> Expenses are logged by employees and reviewed by administrators </li>
              <li><icon name="space-shuttle"/> To get to the expenses, click on the $ in the navigation menu</li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Creating an Expense</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="user-astronaut"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
              <li><icon name="user-astronaut"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Updating an Expense</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="space-shuttle"/> Select an existing expense from the list</li>
              <li><icon name="space-shuttle"/> A preview appears with the information on record</li>
              <li><icon name="space-shuttle"/> Click update to amend the desired information and click update </li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Deleting an Expense</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="user-astronaut"/> Select an existing expense from the list </li>
              <li><icon name="user-astronaut"/> A preview appears with the information on record </li>
              <li><icon name="user-astronaut"/> Click the delete button </li>
              <li><icon name="user-astronaut"/> Confirm the delete to delete the entry. This cannot be undone</li></v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </div>

      <h2>Expense Types</h2>
      <div class="mb-5">
        <div class="text-xs-center mb-3"></div>
        <v-expansion-panel expand>
          <v-expansion-panel-content>
            <div slot="header">About</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="space-shuttle"/> Expense Types are logged by employees and reviewed by administrators </li>
              <li><icon name="space-shuttle"/> To get to the expenses, click on the $ in the navigation menu</li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Creating an Expense Type</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="user-astronaut"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
              <li><icon name="user-astronaut"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Updating an Expense Type</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="space-shuttle"/> Select an existing expense type from the list</li>
              <li><icon name="space-shuttle"/> A preview appears with the information on record</li>
              <li><icon name="space-shuttle"/> Click update to amend the desired information and click update </li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Deleting an Expense Type</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="user-astronaut"/> Select an existing expense type from the list </li>
              <li><icon name="user-astronaut"/> A preview appears with the information on record </li>
              <li><icon name="user-astronaut"/> Click the delete button </li>
              <li><icon name="user-astronaut"/> Confirm the delete to delete the entry. This cannot be undone</li></v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </div>

      <h2>Employees</h2>
      <div class="mb-5">
        <div class="text-xs-center mb-3"></div>
        <v-expansion-panel expand>
          <v-expansion-panel-content>
            <div slot="header">About</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="space-shuttle"/> Expenses are logged by employees and reviewed by administrators </li>
              <li><icon name="space-shuttle"/> To get to the expenses, click on the $ in the navigation menu</li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Creating and Employees Type</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="user-astronaut"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
              <li><icon name="user-astronaut"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Updating an Employees Type</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="space-shuttle"/> Select an existing employees type from the list</li>
              <li><icon name="space-shuttle"/> A preview appears with the information on record</li>
              <li><icon name="space-shuttle"/> Click update to amend the desired information and click update </li></v-card-text>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <div slot="header">Deleting an Employees Type</div>
            <v-card>
              <v-card-text class="grey lighten-3"><li><icon name="user-astronaut"/> Select an existing employees type from the list </li>
              <li><icon name="user-astronaut"/> A preview appears with the information on record </li>
              <li><icon name="user-astronaut"/> Click the delete button </li>
              <li><icon name="user-astronaut"/> Confirm the delete to delete the entry. This cannot be undone</li></v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </div>
    </div>

    <h2>Employee Home</h2>
    <div class="mb-5">
      <div class="text-xs-center mb-3"></div>
      <v-expansion-panel expand>
        <v-expansion-panel-content v-for="(section, sectionIndex) in user" :key="`section${sectionIndex}`">
          <div slot="header">{{ section.title }}</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li v-for="(infoItem, itemIndex) in section.infoList" :key="`item${itemIndex}`">
                <icon name="space-shuttle"/>{{ infoItem }}
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </div>

    <h2>FAQ</h2>
    <div class="mb-5">
      <div class="text-xs-center mb-3"></div>
      <v-expansion-panel expand>
        <v-expansion-panel-content>
          <div slot="header">Known Issues</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li>
                <icon name="space-shuttle"/>
                Google Chrome has an issue displaying (some) attachments that are PDFs. Work-around is to tell Chrome to download PDFs. Or, use a different a browser.
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </div>
  </v-container>
</template>
<script>
import { getRole } from '@/utils/auth';

export default {
  data() {
    return {
      role: '',
      user: {
        about: {
          title: 'About',
          icon: 'space-shuttle',
          infoList: [
            'Expenses are logged by employees and reviewed by administrators',
            'To get to the expenses, click on the $ in the navigation menu'
          ]
        },
        create: {
          title: 'Creating an Expense',
          icon: 'space-shuttle',
          infoList: [
            'Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability',
            'A form appears with required fields. Be sure to fill out the information to the best of your ability'
          ]
        },
        table: {
          title: 'About the Tables',
          icon: 'user-astronaut',
          infoList: [
            `Each rectangle in the top part of Employee Home page represents data for a budget`,
            `'Budget' is the starting amount of money that can be spent for the current year`,
            `'Reimbursed' is the total amount of money that has been reimbursed to the employee who is currently logged in`,
            `'Unreimbursed' is the total amount of money that the employee has spent on the budget that has not yet been reimbursed`,
            `'Remaining Budget' is how much money is left to be spent on the budget after deducting the reimbursed and unreimbursed expenses`,
            `'Overdraft' indicates whether expenses can be assigned to the budget for next year`
          ]
        },
        chart: {
          title: 'About the Charts',
          icon: 'space-shuttle',
          infoList: [
            `Each column is representative of a particular budget with the budget's name at the bottom`,
            `Each different colored bar in a column represents the total cost of either unreimbursed, reimbursed, overdrafted unreimbursed, or overdrafted reimbursed expenses`,
            'The scale for the costs are displayed on the left vertical axis',
            `Hover your mouse over a certain colored bar to display the total expense cost of the expenses represented by that bar.`
          ]
        }
      }
    };
  },
  created() {
    this.role = getRole();
  }
};
</script>
