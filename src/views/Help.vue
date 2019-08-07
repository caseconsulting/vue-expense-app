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
      <v-expansion-panel expand v-for="section in sections" :key="section[0]">
        <v-expansion-panel-content v-if="section[1] == role || role == 'admin' || section[1] == 'user'">
          <div slot="header">{{ section[0] }}</div>
          <v-card>
            <v-card-text class="grey lighten-3">
              <li v-for="ques in section" :key="ques.title">
                <div v-if="ques.title" style="padding-bottom: 10px">
                  <body style="font-style: italic;">
                    <icon name="space-shuttle" /> {{ ques.title }}
                  </body>
                  {{ ques.body }}
                </div>
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
      sections: {
        employeeHome: [
          'Employee Home',
          'user',
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
        forAdmins: [
          'For Admins',
          'admin',
          {
            title: 'What capabilities do Admins have?',
            body:
              "Admins may view the admin dashboard, reimburse expenses, and create expense types, view each employee's budget home view, create new employees, and create expenses for other employees"
          },
          {
            title: 'How do I reimburse an expense?',
            body:
              'Go to the Admin Dashboard and select the expenses that you would like to reimburse by clicking the select box either on a row (to select all expenses for that employee under that expense type) or on each of their individual expenses. Next select the $ icon at the bottom left of the page and then confirm the reimbursement.'
          },
          {
            title: 'What are categories?',
            body:
              'Admins may create up to 10 different categories for employees to choose from when submitting and expense. Categories are unique to each expense type and users will be required to select one category if the expense type has them. '
          }
        ],
        expenses: [
          'Expenses',
          'user',
          {
            title: 'How do I submit an expense?',
            body:
              'In the Create New Expense tab fill in the required fields: Employee, Expense Type, Cost, Description, and Purchase Date. Depending on the Expense Type a Receipt upload might also be needed. Make sure your information is correct and then click Submit!'
          },
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
            title: 'What are categories?',
            body:
              'Some expense types will have categories associated with them. The admin will set up categories and employees are required to select one category if they exist. '
          },
          {
            title: "Why can't I upload a  receipt?",
            body:
              'If the upload field is not visible when you are attempting to submit an expense, this means that this expense type does not require a receipt, and this will not allow you to upload one.'
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
          },
          {
            title: "Why can't I delete an expense?",
            body: 'An expense cannot be deleted if it has been reimbursed or you are editing an expense.'
          }
        ],
        expenseTypes: [
          'Expense Types',
          'admin',
          {
            title: 'What is a recurring expense type?',
            body:
              'This is an expense type has no start and end date and will be renewed on an employees anniversary date.'
          },
          {
            title: 'What is the overdraft flag?',
            body:
              'This allows an expense type to be charged up to twice the defined amount. Subtracting the overage from next years budget.'
          },
          {
            title: "Why can't I delete an expense type?",
            body:
              'An expense type cannot be deleted if there are expenses for that expense type or you are editing an expense type.'
          }
        ],
        employees: [
          'Employees',
          'admin',
          {
            title: 'What is an Employee #?',
            body: "An employee's ID number will be a user's hire order."
          },
          {
            title: 'What does it mean to mark an employee inactive?',
            body: "This will freeze the user's ability to submit new expenses."
          },
          {
            title: "Why can't I delete an employee?",
            body: 'An employee cannot be deleted if the employee has expenses or you are editing an employee.'
          }
        ],
        knownIssues: [
          'Known Issues',
          'user',
          {
            title:
              'Google Chrome has an issue displaying (some) attachments that are PDFs. Work-around is to tell Chrome to download PDFs. Or, use a different a browser.'
          }
        ]
      }
    };
  },
  created() {
    this.role = getRole();
  }
};
</script>

<style scoped>
.e {
  -webkit-animation: color-change 1s infinite alternate both;
  -moz-animation: color-change 10s infinite alternate both;
  -o-animation: color-change 10s infinite alternate both;
  -ms-animation: color-change 10s infinite alternate both;
  animation: color-change 5s infinite alternate both;
}

@-webkit-keyframes color-change {
  0% {
    color: #3f3f3c;
  }

  100% {
    color: gold;
  }
}

@-moz-keyframes color-change {
  0% {
    color: #3f3f3c;
  }

  100% {
    color: gold;
  }
}

@-ms-keyframes color-change {
  0% {
    color: #3f3f3c;
  }

  100% {
    color: gold;
  }
}

@-o-keyframes color-change {
  0% {
    color: #3f3f3c;
  }

  100% {
    color: gold;
  }
}

@keyframes color-change {
  0% {
    color: #3f3f3c;
  }

  100% {
    color: gold;
  }
}
</style>
