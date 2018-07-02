<template>
  <v-container>
  <div>
    <h2>Expenses</h2>
  <div class="mb-5">
    <div class="text-xs-center mb-3"></div>
    <v-expansion-panel
      expand
    >
      <v-expansion-panel-content>
        <div slot="header">About</div>
        <v-card>
          <v-card-text class="grey lighten-3"><li><icon name="code"/> Expenses are logged by employees and reviewed by administrators </li>
          <li><icon name="code"/> To get to the expenses, click on the $ in the navigation menu</li></v-card-text>
        </v-card>
      </v-expansion-panel-content>
      <v-expansion-panel-content>
        <div slot="header">Creating an Expense</div>
        <v-card>
          <v-card-text class="grey lighten-3"><li><icon name="code"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
          <li><icon name="code"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li></v-card-text>
        </v-card>
      </v-expansion-panel-content>
      <v-expansion-panel-content>
        <div slot="header">Updating an Expense</div>
        <v-card>
          <v-card-text class="grey lighten-3"><li><icon name="code"/> Select an existing expense from the list</li>
          <li><icon name="code"/> A preview appears with the information on record</li>
          <li><icon name="code"/> Click update to amend the desired information and click update </li></v-card-text>
        </v-card>
      </v-expansion-panel-content>
      <v-expansion-panel-content>
        <div slot="header">Deleting an Expense</div>
        <v-card>
          <v-card-text class="grey lighten-3"><li><icon name="code"/> Select an existing expense from the list </li>
          <li><icon name="code"/> A preview appears with the information on record </li>
          <li><icon name="code"/> Click the delete button </li>
          <li><icon name="code"/> Confirm the delete to delete the entry. This cannot be undone</li></v-card-text>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
  <h2>Expense Types</h2>
  <div class="mb-5">
    <div class="text-xs-center mb-3"></div>
    <v-expansion-panel
      expand
    >
    <v-expansion-panel-content>
      <div slot="header">About</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="code"/> Expense Types are logged by employees and reviewed by administrators </li>
        <li><icon name="code"/> To get to the expenses, click on the $ in the navigation menu</li></v-card-text>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content>
      <div slot="header">Creating an Expense Type</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="code"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
        <li><icon name="code"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li></v-card-text>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content>
      <div slot="header">Updating an Expense Type</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="code"/> Select an existing expense type from the list</li>
        <li><icon name="code"/> A preview appears with the information on record</li>
        <li><icon name="code"/> Click update to amend the desired information and click update </li></v-card-text>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content>
      <div slot="header">Deleting an Expense Type</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="code"/> Select an existing expense type from the list </li>
        <li><icon name="code"/> A preview appears with the information on record </li>
        <li><icon name="code"/> Click the delete button </li>
        <li><icon name="code"/> Confirm the delete to delete the entry. This cannot be undone</li></v-card-text>
      </v-card>
    </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
  <h2>Employees</h2>
  <div>
    <div class="text-xs-center mb-3"></div>
    <v-expansion-panel
      expand
    >
    <v-expansion-panel-content>
      <div slot="header">About</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="code"/> Employees are logged by employees and reviewed by administrators </li>
        <li><icon name="code"/> To get to the expenses, click on the $ in the navigation menu</li></v-card-text>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content>
      <div slot="header">Creating and Employees Type</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="code"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
        <li><icon name="code"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li></v-card-text>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content>
      <div slot="header">Updating an Employees Type</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="code"/> Select an existing employees type from the list</li>
        <li><icon name="code"/> A preview appears with the information on record</li>
        <li><icon name="code"/> Click update to amend the desired information and click update </li></v-card-text>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content>
      <div slot="header">Deleting an Employees Type</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="code"/> Select an existing employees type from the list </li>
        <li><icon name="code"/> A preview appears with the information on record </li>
        <li><icon name="code"/> Click the delete button </li>
        <li><icon name="code"/> Confirm the delete to delete the entry. This cannot be undone</li></v-card-text>
      </v-card>
    </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
  </div>
</v-container>



    <!-- <div class="container">
        <h2 class="text-center subheading">Good help is so hard to find these days</h2>
        <hr />
        <h2 class="text-center"><i class='fa fa-life-ring fa-5x'></i></h2>
        <br>
        <div class="row">
            <ul class="list-unstyled col-md-4">
                <h3>Expenses</h3>
                <br>
                <li><icon name="code"/> Expenses are logged by employees and reviewed by administrators </li>
                <li><icon name="code"/> To get to the expenses, click on the $ in the navigation menu</li>
                <br />

                <h5>Creating an expense</h5>
                <li><icon name="code"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
                <li><icon name="code"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li>
                <br />

                <h5>Updating an expense</h5>
                <li><icon name="code"/> Select an existing expense from the list</li>
                <li><icon name="code"/> A preview appears with the information on record</li>
                <li><icon name="code"/> Click update to amend the desired information and click update </li>
                <br>

                <h5>Deleting an expense</h5>
                <li><icon name="code"/> Select an existing expense from the list </li>
                <li><icon name="code"/> A preview appears with the information on record </li>
                <li><icon name="code"/> Click the delete button </li>
                <li><icon name="code"/> Confirm the delete to delete the entry. This cannot be undone</li>
            </ul>

            <ul id="expenseType" class="list-unstyled col-md-4">
                <h3>Expense Types</h3>
                <br>
                <li><icon name="code"/> Expense Types are logged by employees and reviewed by administrators </li>
                <li><icon name="code"/> To get to the expenses, click on the $ in the navigation menu</li>
                <br />

                <h5>Creating an expense type</h5>
                <li><icon name="code"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
                <li><icon name="code"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li>
                <br />

                <h5>Updating an expense type</h5>
                <li><icon name="code"/> Select an existing expense type from the list</li>
                <li><icon name="code"/> A preview appears with the information on record</li>
                <li><icon name="code"/> Click update to amend the desired information and click update </li>
                <br>

                <h5>Deleting an expense type</h5>
                <li><icon name="code"/> Select an existing expense type from the list </li>
                <li><icon name="code"/> A preview appears with the information on record </li>
                <li><icon name="code"/> Click the delete button </li>
                <li><icon name="code"/> Confirm the delete to delete the entry. This cannot be undone</li>
            </ul>

            <ul class="list-unstyled col-md-4">
                <h3>Employees</h3>
                <br>
                <li><icon name="code"/> Employees are logged by employees and reviewed by administrators </li>
                <li><icon name="code"/> To get to the expenses, click on the $ in the navigation menu</li>
                <br />

                <h5>Creating an employees type</h5>
                <li><icon name="code"/> Click on the "new" button. A form appears with required fields. Be sure to fill out the information to the best of your ability</li>
                <li><icon name="code"/> A form appears with required fields. Be sure to fill out the information to the best of your ability </li>
                <br />

                <h5>Updating an employees type</h5>
                <li><icon name="code"/> Select an existing employees type from the list</li>
                <li><icon name="code"/> A preview appears with the information on record</li>
                <li><icon name="code"/> Click update to amend the desired information and click update </li>
                <br>

                <h5>Deleting an employees type</h5>
                <li><icon name="code"/> Select an existing employees type from the list </li>
                <li><icon name="code"/> A preview appears with the information on record </li>
                <li><icon name="code"/> Click the delete button </li>
                <li><icon name="code"/> Confirm the delete to delete the entry. This cannot be undone</li>
            </ul>
        </div>
    </div> -->
</template>
