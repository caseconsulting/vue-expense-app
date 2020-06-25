<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click="download()"> <i class="material-icons">file_download</i> Download All</v-btn>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Converts an object into a csv string.
 *
 * @param objArray - Object to convert
 * @return String - csv of object
 */
function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';
  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index = 0; index < array[i].length; index++) {
      if (line != '') line += ',';

      line += `"${array[i][index]}"`;
    }
    str += line + '\r\n';
  }
  return str;
} // convertToCSV

/**
 * Exports expenses to a csv file titled expenses
 */
function download() {
  var fileTitle = 'expenses'; // or 'my-unique-title'

  // call the exportCSVFile() function to process the JSON and trigger the download
  this.exportCSVFile(_.cloneDeep(this.expenses), fileTitle);
} // download

/**
 * Set data for employees and expense types.
 */
async function getData() {
  await api.getItems(api.EMPLOYEES).then((emp) => {
    this.employees = emp;
  });

  await api.getItems(api.EXPENSE_TYPES).then((expT) => {
    this.expenseTypes = expT;
  });
} // getData

/**
 * Exports expenses to a csv file given a title.
 *
 * @param items - expenses to export
 * @param fileTitle - title of csv file
 */
function exportCSVFile(items, fileTitle) {
  this.getData().then(() => {
    for (var i = 0; i < items.length; i++) {
      let person = items[i];

      for (let employee of this.employees) {
        if (employee.id === person.employeeId) {
          person.employeeNumber = employee.employeeNumber;
          person.lastName = employee.lastName;
          person.firstName = employee.firstName;
          continue;
        }
      }

      for (let expT of this.expenseTypes) {
        if (expT.id === person.expenseTypeId) {
          person.expenseType = expT.budgetName;
          continue;
        }
      }

      items[i] = [
        person.firstName,
        person.lastName,
        person.employeeNumber,
        person.expenseType,
        person.cost,
        person.purchaseDate,
        person.reimbursedDate || ' ',
        person.category || ' '
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
      'Category'
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
  });
} // exportCSVFile

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  props: ['expenses', 'midAction'], // expenses to export
  data() {
    return {
      employees: [],
      expenseTypes: [],
      headers: []
    };
  },
  methods: {
    convertToCSV,
    download,
    getData,
    exportCSVFile
  }
};
</script>

<style>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
