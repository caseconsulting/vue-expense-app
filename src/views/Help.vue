<template>
  <v-container>
    <div>
      <h1 style="text-align:center">H<span class="e">€</span>LP</h1>
    </div>
    <br />
    <br />

    <h2>FAQ</h2>
    <div class="mb-5">
      <div class="text-xs-center mb-3"></div>
      <v-expansion-panel expand>
        <v-expansion-panel-content>
          <div slot="header">Employee Home</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" /> What is budget?
                </body>
                This is the starting amount of money that can be spent for the current year
              </li>
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  What is reimbursed?
                </body>
                This is the total amount of money that has been reimbursed to the user
              </li>
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  What is unreimbursed?
                </body>
                This is the total amount of money that has yet to be reimbursed to the user
              </li>
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  What is remaining budget?
                </body>
                This is how much money the user has left to be spent for the given budget
              </li>
              <li>
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  What is overdraft?
                </body>
                This indicates whether expenses can be assigned to the budget for next year
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-if="role !== 'user'">
          <div slot="header">Admin Dashboard</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li>
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  How do I reimburse an expense?
                </body>
                select the expenses that you would like to reimburse by clicking the select box either on a row (to
                select all expenses for that employee under that expense type) or on each of their individual expenses.
                Next select the $ icon at the bottom left of the page and then confirm the reimbursement.
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Expenses</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" /> How do I submit an expense?
                </body>
                In the Create New Expense tab fill in the required fields:
                <strong>Employee, Expense Type, Cost, Description, and Purchase Date.</strong> Depending on the Expense
                Type a <strong>Receipt</strong> upload might also be needed. Make sure your information is correct and
                then click Submit!
              </li>
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  How do I update an expense?
                </body>
                Select an item from the Expenses list, the current information of the expense will then be shown on the
                right. You may now edit those fields!
              </li>
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  How do I delete an expense?
                </body>
                Select an item from the Expenses list then click the delete button.
                <strong>This action cannot be undone.</strong>
              </li>
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  How do I convert training dollars to training hours?
                </body>
                Calculate your hourly pay rate by dividing your salary by 2080. Enter the total dollar amount (hourly
                salary x number of hours) as training expense in the expense app. Include a description of the training
                you plan to take.
              </li>
              <li>
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  How do I submit a High Five Award?
                </body>
                In the Create New Expense tab select the expense type “High Five”, put $50 in Cost, and in the
                description be sure to specify who you are awarding and why.
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>

        <v-expansion-panel-content v-if="role !== 'user'">
          <div slot="header">Expense Types</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  What is a recurring expense type?
                </body>
                This is an expense type has no start and end date and will be renewed on an employees anniversary date.
              </li>
              <li>
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  What is the overdraft flag?
                </body>
                This allows an expense type to be charged up to twice the defined amount. Subtracting the overage from
                next years budget.
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>

        <v-expansion-panel-content v-if="role !== 'user'">
          <div slot="header">Employees</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  What is an Employee #?
                </body>
                An employee's ID number will be a user's hire order.
              </li>
              <li>
                <body style="font-style: italic;">
                  <icon name="space-shuttle" />
                  How do I mark an employee inactive?
                </body>
                This will freeze the user's ability to submit new expenses.
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Known Issues</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li>
                <icon name="space-shuttle" />
                Google Chrome has an issue displaying (some) attachments that are PDFs. Work-around is to tell Chrome to
                download PDFs. Or, use a different a browser.
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
        table: {}
      }
    };
  },
  created() {
    this.role = getRole();
  }
};
</script>
