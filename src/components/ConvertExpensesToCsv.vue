<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click="download()" elevation="2">
    <i class="material-icons">file_download</i> Download All</v-btn
  >
</template>

<script>
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
async function download() {
  var fileTitle = 'expenses'; // or 'my-unique-title'

  // call the exportCSVFile() function to process the JSON and trigger the download
  await this.exportCSVFile(_.cloneDeep(this.expenses), fileTitle);
} // download

/**
 * Set data for employees and expense types.
 */
async function getData() {
  this.employees = this.$store.getters.employees;
  this.expenseTypes = this.$store.getters.expenseTypes;
} // getData

/**
 * Exports expenses to a csv file given a title.
 *
 * @param items - expenses to export
 * @param fileTitle - title of csv file
 */
async function exportCSVFile(items, fileTitle) {
  // get employees and expense types from store
  await this.getData();

  // go through expenses to download
  for (var i = 0; i < items.length; i++) {
    let person = items[i];

    // add first/last name and employee # keys to object
    for (let employee of this.employees) {
      if (employee.id === person.employeeId) {
        person.employeeNumber = employee.employeeNumber;
        person.lastName = employee.lastName;
        person.firstName = employee.firstName;
        continue;
      }
    }

    // add expenseType to person, extracting from budgetName
    for (let expT of this.expenseTypes) {
      if (expT.id === person.expenseTypeId) {
        person.expenseType = expT.budgetName;
        continue;
      }
    }

    // put all above together into one object
    items[i] = [
      person.firstName || '',
      person.lastName || '',
      person.employeeNumber || '',
      person.expenseType || '',
      person.cost || '',
      person.purchaseDate || '',
      person.reimbursedDate || '',
      person.category || ''
    ];
  }

  // create headers for csv
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
} // exportCSVFile

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
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
  },
  props: ['expenses', 'midAction'] // expenses to export
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
