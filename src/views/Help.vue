<template>
  <v-container>
    <!-- Help Title -->
    <div>
      <h1 style="text-align: center;">HELP</h1>
    </div>
    <br />
    <br />

    <!-- FAQ Sub-Title -->
    <h2>FAQ</h2>
    <div class="mb-5">
      <div class="text-xs-center mb-3"></div>
      <v-expansion-panels accordion :v-model="panel">
        <v-expansion-panel v-for="section in sections" :key="section[0]">
          <!-- Header -->
          <v-expansion-panel-header v-if="section[1] == role || role == 'admin' || section[1] == 'user'">
            {{ section[0] }}
          </v-expansion-panel-header>

          <!-- Content -->
          <v-expansion-panel-content v-if="section[1] == role || role == 'admin' || section[1] == 'user'">
            <v-card>
              <v-card-text class="grey lighten-3">
                <li v-for="ques in section" :key="ques.title">
                  <div v-if="ques.title" style="padding-bottom: 10px;">
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
      </v-expansion-panels>
    </div>
  </v-container>
</template>

<script>
import { getRole } from '@/utils/auth';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the user's role.
 */
async function created() {
  this.role = getRole();
  let params = this.$route.params.hoursInfo;
  console.log('param: ');
  console.log(params);
  if (params != null && params == 'hoursInfo') {
    this.panel = 0;
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      panel: null,
      role: '', // employee role
      sections: {
        tsheetsHours: [
          'Hours',
          'user',
          {
            title: 'What information is displayed in the box?',
            body: 'Hours worked for each job ending with the total hours for the month at the bottom in bold.'
          },
          {
            title: 'How is the Avg Hours/Day calculated?',
            body:
              'The Remaining hours for the month divided by the Days Remaining. This can be changed by editing the Days Remaining.'
          },
          {
            title: 'What hours fall under Completed, Today, and Futute?',
            body:
              "Completed hours are any hours logged in TSheets from the first day of the month through the end of the day yesterday. Today's hours are any hours logged in TSheet at any point today. Future hours are any hours logged in TSheets between the beginning of the day tomorrow and the last day of the month."
          },
          {
            title: 'How can I edit Days Remaining?',
            body:
              'Once you click on the number of Days Remaining on the right hand side you will be able to edit this number using your keyboard.'
          },
          {
            title: 'Why do I not see some of my hours for today?',
            body:
              'If you are using the clock in function on TSheets those hours will not show up until after you clock out. All other hours for the month should be seen on the home page.'
          }
        ],
        employeeHome: [
          'My Budgets',
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
        expenses: [
          'My Expenses',
          'user',
          {
            title: 'How do I submit an expense?',
            body:
              'In the Create New Expense tab fill in the required fields: Employee, Expense Type, Cost, Description, and Purchase Date. Depending on the Expense Type a Receipt upload might also be needed. Make sure your information is correct and then click Submit!'
          },
          {
            title: 'How do I update an expense?',
            body:
              'Select an item from the My Expenses list, the current information of the expense will then be shown on the right. You may now edit those fields!'
          },
          {
            title: 'How do I delete an expense?',
            body: 'Select an item from the My Expenses list then click the delete button.'
          },
          {
            title: 'What are categories?',
            body:
              'Some expense types will have categories associated with them. The admin will set up categories and employees are required to select one category if they exist. '
          },
          {
            title: "Why can't I upload a receipt?",
            body:
              'If the upload field is not visible when you are attempting to submit an expense, this means that this expense type does not require a receipt, and this will not allow you to upload one.'
          },
          {
            title: 'What file types can I upload as a receipt?',
            body: 'The following file formats are accepted: .pdf, .gif, .jpeg, .png, .xlsx, .xml, .doc, and .docx'
          },
          {
            title: 'How do I convert training dollars to training hours?',
            body:
              'Calculate your hourly pay rate by dividing your salary by 2080. Enter the total dollar amount (hourly salary x number of hours) as training expense in the expense app. Include a description of the training you plan to take.'
          },
          {
            title: 'How do I submit a High Five Award?',
            body:
              'In the Create New Expense tab select the expense type “High Five”, the Cost section will be automatically set to $50, and in the description be sure to specify who you are awarding and why.'
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
          },
          {
            title: 'What are the employee access options for expense types?',
            body:
              'Expense types accessible by All will provide all employees access to a prorated budget based on their work status. Expense types accessible by Full will provide both full time and part time employees will access to 100% of the budget. Expense types accessible by Full Time will provide only full time employees with access to the budget. Expense types accessible by Custom will provide the selected employees access to a prorated budget based on their work status.'
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
        forAdmins: [
          'For Admins',
          'admin',
          {
            title: 'What capabilities do Admins have?',
            body:
              "Admins may view reimbursements, reimburse expenses, and create expense types, view each employee's budget home view, create new employees, and create expenses for other employees"
          },
          {
            title: 'How do I reimburse an expense?',
            body:
              'Go to Reimbursements and select the expenses that you would like to reimburse by clicking the select box either on a row (to select all expenses for that employee under that expense type) or on each of their individual expenses. Next select the $ icon at the bottom left of the page and then confirm the reimbursement.'
          },
          {
            title: 'What are categories?',
            body:
              'Admins may create up to 10 different categories for employees to choose from when submitting and expense. Categories are unique to each expense type and users will be required to select one category if the expense type has them. '
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
      } // faq sections
    };
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
