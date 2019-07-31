<template>
  <v-btn @click="download()"> <i class="material-icons">file_download</i> Download All</v-btn>
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

function exportCSVFile(items, fileTitle) {
  console.log(items);
  let tempEmployees = [];
  for (var i = 0; i < items.length; i++) {
    let person = items[i];

    tempEmployees[i] = [
      person.employeeNumber,
      person.firstName,
      person.middleName,
      person.lastName,
      person.birthday || ' ',
      person.placeOfBirth || ' ',
      person.hireDate,
      person.jobRole || ' ',
      person.prime || ' ',
      person.contract || ' ',
      person.email,
      person.twitter || ' ',
      person.github || ' ',
      person.employeeRole,
      person.isActive,
      person.id
    ];
  }

  this.headers = [
    'Employee #',
    'First Name',
    'Middle Name',
    'Last Name',
    'Birthday (yy-mm-dd)',
    'Place of Birth',
    'Hire Date',
    'Job Role',
    'Prime',
    'Contract',
    'Email',
    'Twitter',
    'Github',
    'Expense App Role',
    'Is Active?',
    'id'
  ];

  tempEmployees.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });

  tempEmployees.unshift(this.headers);

  // Convert Object to JSON
  var jsonObject = JSON.stringify(tempEmployees);

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
  var fileTitle = 'employees'; // or 'my-unique-title'
  this.exportCSVFile(this.employees, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}
export default {
  props: ['employees'],
  data() {
    return {
      headers: []
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
