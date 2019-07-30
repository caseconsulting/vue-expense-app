<template>
  <div @click="download()">
    <p class="download"><i class="material-icons">file_download</i> Download</p>
  </div>
</template>

<script>
import api from '@/shared/api.js';

// METHODS
function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    // console.log(array[i]);
    for (var index in array[i]) {
      if (line != '') line += ',';

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  return str;
}

async function exportCSVFile(items, fileTitle) {
  items.then(items => {
    for (var k in items[1]) {
      if (k != 'description' && k != 'receipt' && k != 'id') {
        this.headers.push(k);
      }
    }

    items.forEach(person => {
      let employee = api.getItem(api.EMPLOYEES, person.userId);
      api.getItem(api.EMPLOYEES, person.userId).then(employee => {
        person.firstName = employee.firstName;
        if (!this.headers.includes('First Name')) {
          this.headers.push('First Name');
        }
        person.lastName = employee.lastName;
        if (!this.headers.includes('Last Name')) {
          this.headers.push('Last Name');
        }
        person.employeeNumber = employee.employeeNumber;
        if (!this.headers.includes('Employee #')) {
          this.headers.push('Employee #');
        }
      });
      if (!person.reimbursedDate) {
        person.reimbursedDate = ' ';
      }
      delete person.description;
      delete person.receipt;
      delete person.id;
    });
    console.log(items);

    if (this.headers) {
      items.unshift(this.headers);
    }
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
}

function download() {
  var fileTitle = 'expenses'; // or 'my-unique-title'

  this.exportCSVFile(this.expenses, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}
export default {
  props: ['expenses'],
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