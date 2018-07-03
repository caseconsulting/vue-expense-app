<template>
  <v-container>
    <div>
      <h1 style="text-align:center">H<span class="e">€</span>LP</h1>
    </div>
    <br />
    <br />
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
    <v-expansion-panel
      expand
    >
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
  <div>
    <div class="text-xs-center mb-3"></div>
    <v-expansion-panel
      expand
    >
    <v-expansion-panel-content>
      <div slot="header">About</div>
      <v-card>
        <v-card-text class="grey lighten-3"><li><icon name="space-shuttle"/> Employees are logged by employees and reviewed by administrators </li>
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
</v-container>

</template>
