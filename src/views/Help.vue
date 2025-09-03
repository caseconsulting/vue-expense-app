<template>
  <v-container>
    <!-- Help Title -->
    <div>
      <h1 id="help-title" class="mb-2">Help</h1>
    </div>

    <div>
      <v-expansion-panels variant="accordion" :model-value="panel">
        <v-expansion-panel v-for="section in sections" :key="section[0]">
          <!-- Header -->
          <v-expansion-panel-title v-if="canView(section[1])" :id="section[0]">
            {{ section[0] }}
          </v-expansion-panel-title>

          <!-- Content -->
          <v-expansion-panel-text v-if="section[0] === 'Role Abilities'">
            <v-data-table
              v-if="!isMobile"
              :headers="section[2].headers"
              :items="section[4].abilities"
              :items-per-page="-1"
              class="elevation-1 bg-grey-lighten-3"
              mobile-breakpoint="0"
              hide-default-footer
            >
              <template #bottom />
            </v-data-table>
            <v-data-table
              v-else
              :headers="section[3].headersMobile"
              :items="section[4].abilities"
              :items-per-page="-1"
              class="elevation-1 bg-grey-lighten-3 dataTable"
              mobile-breakpoint="0"
              hide-default-footer
            >
              <template #bottom />
            </v-data-table>
          </v-expansion-panel-text>
          <v-expansion-panel-text v-else-if="section[0] === 'Timesheet Calculations'">
            <timesheets-calculations-help></timesheets-calculations-help>
          </v-expansion-panel-text>
          <v-expansion-panel-text v-else-if="canView(section[1])">
            <v-card>
              <v-card-text class="bg-grey-lighten-3">
                <li v-for="(ques, index) in section" :key="ques.title">
                  <div v-if="ques.title && (!ques.employeeRole || canView(ques.employeeRole))" class="pb-1">
                    <body :id="section[0] + '-' + index" class="italics">
                      <v-icon>mdi-motion</v-icon> {{ ques.title }}
                    </body>
                    {{ ques.body }}
                  </div>
                </li>
              </v-card-text>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </v-container>
</template>

<script setup>
import TimesheetsCalculationsHelp from '@/components/help/TimesheetsCalculationsHelp.vue';
import { getRole } from '@/utils/auth';
import { isMobile } from '@/utils/utils';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const route = useRoute();

const panel = ref(null);
const role = ref(''); // employee role
const sections = ref({
  timeHours: ['Timesheet Calculations', 'user', {}],
  myBudgets: [
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
      body: 'In the Create New Expense tab fill in the required fields: Employee, Expense Type, Cost, Description, and Purchase Date. Depending on the Expense Type a Receipt upload might also be needed. Make sure your information is correct and then click Submit!'
    },
    {
      title: 'How do I update an expense?',
      body: 'Select an item from the My Expenses list, the current information of the expense will then be shown on the right. You may now edit those fields!'
    },
    {
      title: 'How do I delete an expense?',
      body: 'Select an item from the My Expenses list then click the delete button.'
    },
    {
      title: 'What are categories?',
      body: 'Some expense types will have categories associated with them. The admin will set up categories and employees are required to select one category if they exist. '
    },
    {
      title: "Why can't I upload a receipt?",
      body: 'If the upload field is not visible when you are attempting to submit an expense, this means that this expense type does not require a receipt, and this will not allow you to upload one.'
    },
    {
      title: 'What file types can I upload as a receipt?',
      body: 'The following file formats are accepted: .pdf, .gif, .jpeg, .png, .bmp, .xlsx, .doc, and .docx'
    },
    {
      title: 'How do I convert training dollars to training hours?',
      body: 'Calculate your hourly pay rate by dividing your salary by 2080. Enter the total dollar amount (hourly salary x number of hours) as training expense in the expense app. Include a description of the training you plan to take.'
    },
    {
      title: 'How do I submit a High Five Award?',
      body: 'In the Create New Expense tab select the expense type “High Five”, the Cost section will be automatically set to $50, and in the description be sure to specify who you are awarding and why.'
    },
    {
      title: "Why can't I delete an expense?",
      body: 'An expense cannot be deleted if it has been reimbursed or you are editing an expense.'
    },
    {
      title: 'How to back-out of an expense',
      body: 'Admins may create expenses with a negative dollar amount. Negative expenses can be used as a short-cut way to unreimburse an expense that has already been reimbursed in a previous anniversary year and was overdrafted. All expenses to be unreimbursed in the current anniversary year however, should be unreimbursed using the unriembursed button on the expense page. ',
      employeeRole: 'admin'
    }
  ],
  expenseTypes: [
    'Expense Types',
    'user',
    {
      title: 'What is a recurring expense type?',
      body: 'This is an expense type has no start and end date and will be renewed on an employees anniversary date.'
    },
    {
      title: 'What is the overdraft flag?',
      body: 'This allows an expense type to be charged up to twice the defined amount. Subtracting the overage from next years budget.'
    },
    {
      title: 'What are categories?',
      body: 'Admins may create up to 10 different categories for employees to choose from when submitting and expense. Categories are unique to each expense type and users will be required to select one category if the expense type has them. ',
      employeeRole: 'admin'
    },
    {
      title: "Why can't I delete an expense type?",
      body: 'An expense type cannot be deleted if there are expenses for that expense type or you are editing an expense type.',
      employeeRole: 'admin'
    },
    {
      title: 'What are the employee access options for expense types?',
      body: 'There are 4 available employee access options to choose from, Full-time, Part-time, Intern, and Custom. The Full-time access option allow the expense type to be viewed and accessed by all employees that are full time. The Part-time option enables the expense type to be used for those who are part-time and have a percentage less than 100%. The Intern option allows the expense type to be viewed to those that have the Intern role. Finally, the Custom option allows you to pick one or more individuals to view the expense type regardless of their role.',
      employeeRole: 'admin'
    },
    {
      title: 'What does the "Should the expense be pro-rated?" switch mean?',
      body: 'By toggling this switch, it would mean that all part-time employees that can access the expense type would have a percentage of the budget amount based on their part-time percentage.',
      employeeRole: 'admin'
    },
    {
      title: 'What does the "Does this expense type have a recipient?" switch mean?',
      body: 'This would mean that upon creating an expense for this expense type, the user would have to assign someone else within the company to receive the amount provided within the expense.',
      employeeRole: 'admin'
    },
    {
      title: 'What does the "Have this expense type show on the company feed?" switch mean?',
      body: 'When a user creates an expense and after being reimbursed, it will display info about the expense on the activity feed in the Home page. This feature can be toggled off by the user when creating an expense or by the person reimbursing the expense.',
      employeeRole: 'admin'
    },
    {
      title: 'What does the "Require a url for this expense?" switch mean?',
      body: 'When a user creates an expense, by default entering a url is optional. However, by enabling this feature, this would make entering a url mandatory.',
      employeeRole: 'admin'
    }
  ],
  reimbursements: [
    'Reimbursements',
    'admin',
    {
      title: 'How do I reimburse an expense?',
      body: 'Select the expenses that you would like to reimburse by clicking the select box either on a row (to select all expenses for that employee under that expense type) or on each of their individual expenses. Next select the $ icon at the bottom left of the page and then confirm the reimbursement.'
    }
  ],
  employees: [
    'Employees',
    'user',
    {
      title: 'What is the manager role for?',
      body: 'Managers have the same access as a user but can also edit or view any employee data. They should have the same access as admins on the employee pages.',
      employeeRole: 'manager'
    },
    {
      title: 'What capabilities do Admins have?',
      body: "Admins may create expenses for other employees, create expense types, view each employee's budget home view, create new employees, and have acess to view and create expense reimbursements ",
      employeeRole: 'admin'
    },
    {
      title: 'What does it mean to mark an employee inactive?',
      body: "This will freeze the user's ability to submit new expenses.",
      employeeRole: 'manager'
    },
    {
      title: "Why can't I delete an employee?",
      body: 'An employee cannot be deleted if the employee has expenses or you are editing an employee.',
      employeeRole: 'manager'
    }
  ],
  roleAbilities: [
    // different structure here
    'Role Abilities',
    'user',
    {
      headers: [
        { title: 'Ability', sortable: false, divider: true, value: 'ability' },
        { title: 'Admin', sortable: false, value: 'admin', align: 'center' },
        { title: 'Manager', sortable: false, value: 'manager', align: 'center' },
        { title: 'User', sortable: false, value: 'user', align: 'center' },
        { title: 'Intern', sortable: false, value: 'intern', align: 'center' }
      ]
    },
    {
      headersMobile: [
        { title: 'Ability', sortable: false, value: 'ability', width: '32%' },
        { title: 'Admin', sortable: false, value: 'admin', width: '17%', align: 'right' },
        { title: 'Manager', sortable: false, value: 'manager', width: '20%', align: 'right' },
        { title: 'User', sortable: false, value: 'user', width: '14%', align: 'right' },
        { title: 'Intern', sortable: false, value: 'intern', width: '17%', align: 'right' }
      ]
    },
    {
      abilities: [
        { ability: 'View/update personal profile data', admin: 'X', manager: 'X', user: 'X', intern: 'X' },
        { ability: 'Add/edit personal expenses', admin: 'X', manager: 'X', user: 'X', intern: 'X' },
        { ability: 'Add/edit personal PTO cash out requests', admin: 'X', manager: 'X', user: 'X', intern: '' },
        { ability: 'View other’s profile data', admin: 'X', manager: 'X', user: 'X', intern: '' },
        { ability: 'Create employees', admin: 'X', manager: 'X', user: '', intern: '' },
        { ability: 'Edit other’s profile data', admin: 'X', manager: 'X', user: '', intern: '' },
        { ability: 'View audits', admin: 'X', manager: 'X', user: '', intern: '' },
        { ability: 'Reimburse expenses', admin: 'X', manager: 'X', user: '', intern: '' },
        { ability: 'Approve PTO cash out requests', admin: 'X', manager: 'X', user: '', intern: '' },
        { ability: "View other's expenses", admin: 'X', manager: 'X', user: '', intern: '' },
        { ability: 'Create/update other’s expenses', admin: 'X', manager: 'X', user: '', intern: '' },
        { ability: "View other's PTO cash out requests", admin: 'X', manager: 'X', user: '', intern: '' },
        {
          ability: "Create/update other's PTO cash out requests",
          admin: 'X',
          manager: 'X',
          user: '',
          intern: ''
        },
        { ability: 'Create/update expense types', admin: 'X', manager: '', user: '', intern: '' },
        { ability: 'Download employee CSV’s', admin: 'X', manager: '', user: '', intern: '' },
        { ability: 'View login dates', admin: 'X', manager: '', user: '', intern: '' }
      ]
    }
  ]
});

role.value = getRole();
if (route.name === 'help2') {
  panel.value = 0;
}
if (route.name === 'help3') {
  panel.value = 3;
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determine if user can view.
 *
 * @param qRole - role of the question
 * @return boolean - whether the user can view the component
 */
function canView(qRole) {
  return qRole == role.value || role.value == 'admin' || qRole == 'user';
} // canView
</script>

<style>
.dataTable table {
  table-layout: fixed;
}
</style>
