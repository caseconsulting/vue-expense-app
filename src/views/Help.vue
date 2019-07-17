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
              <li v-for="ques in expenses" :key="ques" style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" /> {{ ques.title }}
                </body>
                {{ ques.body }}
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content v-if="role !== 'user'">
          <div slot="header">Admin Dashboard</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li v-for="ques in adminDashboard" :key="ques" style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" /> {{ ques.title }}
                </body>
                {{ ques.body }}
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
              <li v-for="ques in expenses" :key="ques" style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" /> {{ ques.title }}
                </body>
                {{ ques.body }}
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>

        <v-expansion-panel-content v-if="role !== 'user'">
          <div slot="header">Expense Types</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li v-for="ques in expenseTypes" :key="ques" style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" /> {{ ques.title }}
                </body>
                {{ ques.body }}
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>

        <v-expansion-panel-content v-if="role !== 'user'">
          <div slot="header">Employees</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li v-for="ques in employees" :key="ques" style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" /> {{ ques.title }}
                </body>
                {{ ques.body }}
              </li>
            </v-card-text>
          </v-card>
        </v-expansion-panel-content>
        <v-expansion-panel-content>
          <div slot="header">Known Issues</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li v-for="ques in knownIssues" :key="ques" style="padding-bottom: 10px">
                <body style="font-style: italic;">
                  <icon name="space-shuttle" /> {{ ques.title }}
                </body>
                {{ ques.body }}
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
      employeeHome: [
        {
          title: 'What is budget?',
          body: 'This is the starting amount of money that can be spent for the current year'
        },
        {
          title: 'What is reimbursed?',
          body: 'This is the total amount of money that has been reimbursed to the user'
        },
        {
          title: 'What is unreimbursed?',
          body: 'This is the total amount of money that has yet to be reimbursed to the user'
        },
        {
          title: 'What is remaining budget?',
          body: 'This is how much money the user has left to be spent for the given budget'
        },
        {
          title: 'What is overdraft?',
          body: 'This indicates whether expenses can be assigned to the budget for next year'
        }
      ],
      adminDashboard: [
        {
          title: 'How do I reimburse an expense?',
          body:
            'Select the expenses that you would like to reimburse by clicking the select box either on a row (to select all expenses for that employee under that expense type) or on each of their individual expenses. Next select the $ icon at the bottom left of the page and then confirm the reimbursement.'
        }
      ],
      expenses: [
        {
          title: 'How do I update an expense?',
          body:
            'Select an item from the Expenses list, the current information of the expense will then be shown on the right. You may now edit those fields!'
        },
        {
          title: 'How do I delete an expense?',
          body: 'Select an item from the Expenses list then click the delete button.'
        },
        {
          title: 'How do I delete an expense?',
          body: 'This is the total amount of money that has yet to be reimbursed to the user'
        },
        {
          title: 'How do I convert training dollars to training hours?',
          body:
            'Calculate your hourly pay rate by dividing your salary by 2080. Enter the total dollar amount (hourly salary x number of hours) as training expense in the expense app. Include a description of the training you plan to take.'
        },
        {
          title: 'How do I submit a High Five Award?',
          body:
            'In the Create New Expense tab select the expense type “High Five”, put $50 in Cost, and in the description be sure to specify who you are awarding and why.'
        }
      ],
      expenseTypes: [
        {
          title: 'What is a recurring expense type?',
          body:
            'This is an expense type has no start and end date and will be renewed on an employees anniversary date.'
        },
        {
          title: 'What is the overdraft flag?',
          body:
            'This allows an expense type to be charged up to twice the defined amount. Subtracting the overage from next years budget.'
        }
      ],
      employees: [
        {
          title: 'What is an Employee #?',
          body: "An employee's ID number will be a user's hire order."
        },
        {
          title: 'What does it mean to mark an employee inactive?',
          body: "This will freeze the user's ability to submit new expenses."
        }
      ],
      knownIssues: [
        {
          title:
            'Google Chrome has an issue displaying (some) attachments that are PDFs. Work-around is to tell Chrome to download PDFs. Or, use a different a browser.'
        }
      ]
    };
  },
  created() {
    this.role = getRole();
  }
};
</script>
