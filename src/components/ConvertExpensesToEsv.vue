<template>
  <v-btn @click="download()" :loading="loading"> <i class="material-icons">file_download</i> Download All</v-btn>
</template>

<script>
import api from '@/shared/api.js';

// METHODS
function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index = 0; index < array[i].length; index++) {
      if (line != '') line += ',';

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  return str;
}

async function exportCSVFile(items, fileTitle) {
  console.log(items);
  for (var i = 0; i < items.length; i++) {
    let person = items[i];
    await api.getItem(api.EMPLOYEES, person.userId).then(employee => {
      person.employeeNumber = employee.employeeNumber;
      person.lastName = employee.lastName;
      person.firstName = employee.firstName;
      if (i + 1 == items.length) {
        this.loading = false;
      }
    });

    await api.getItem(api.EXPENSE_TYPES, person.expenseTypeId).then(expenseType => {
      person.expenseType = expenseType.budgetName;
    });

    items[i] = [
      person.firstName,
      person.lastName,
      person.employeeNumber,
      person.expenseType,
      person.cost,
      person.purchaseDate,
      person.reimbursedDate || ' ',
      person.categories || ' '
    ];
  }

  this.headers = [
    'First Name',
    'Last Name',
    'Employee #',
    'Expense Type',
    'Cost',
    'Purchase Date',
    'Reimbursed Date',
    'Categories'
  ];
  items.unshift(this.headers);

  // Convert Object to JSON
  var jsonObject = JSON.stringify(items);

  var csv = this.convertToCSV(jsonObject);

  var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportedFilenmae);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function download() {
  this.loading = true;
  var fileTitle = 'expenses'; // or 'my-unique-title'
  this.expenses.then(expenses => {
    this.exportCSVFile(expenses, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
  });
}
export default {
  props: ['expenses'],
  data() {
    return {
      headers: [],
      loading: false
    };
  },
  methods: {
    convertToCSV,
    exportCSVFile,
    download
  }
};
</script>

<style>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
