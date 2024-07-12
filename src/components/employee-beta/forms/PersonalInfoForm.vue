<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field v-model="editedEmployee.firstName" label="First Name"></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const editedEmployee = defineModel();

class SecurableField {
  constructor(value, isVisible) {
    value: value;
    isVisible: false;
  }
}

class ClearanceField {
  construcor() {
    type: '';
    awaiting: false;
    submissionDate: '';
    grantedDate: '';
    badgeNumber: '';
    badgeExpiraitonDate: '';
    biDates: [];
    adjudicationDates: [];
    polyDates: [];
  }
}

// const fields = ref({
//   firstName: '',
//   middleName: '',
//   lastName: '',
//   nickname: '',
//   personalEmail: new SecurableField(),
//   github: new SecurableField('', false),
//   twitter: new SecurableField('', false),
//   linkedin: new SecurableField('', false),
//   placeOfBirth: new SecurableField('', false),
//   currentAddress: new SecurableField('', false),
//   birthday: new SecurableField('', false),
//   /** @type { Array<SecurableField> } */ phoneNumbers: [],
//   employeeNumber: 0,
//   caseEmail: '',
//   jobRole: '',
//   ain: 0,
//   tags: [],
//   employeeRole: '',
//   fullTimeStatus: '',
//   /** @type {Array<ClearanceField>} */ clearances: []
// });
</script>
