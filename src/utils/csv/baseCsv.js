/**
 * This CSV utils is designed to make CSV file creating and downloading easier. It is based
 * around the concept of passing through an object, where the keys are the headers and the
 * values are the data. This should work well. There is also minimal support for 2D arrays,
 * though some functionality (such as sorting) will not work. Future work could include
 * parsing a CSV file/string back into an object or working on sorting for 2D array types.
 */

// Imports and constants for all functions
import _ from 'lodash';
const Papa = require('papaparse');
const XLSX = require('xlsx');
const NEW_LINE = '\n';

/**
 * Combines two CSV strings into one (A on top of B)
 * @param csvA - CSV string to place first
 * @param csvB - CSV string to place second
 * @param spaceBetween (optional) - number of spaces to place between CSVs
 * @return a combined CSV string
 */
export function combine(csvA, csvB, spaceBetween = 0) {
  return `${csvA}\n${'""\n'.repeat(spaceBetween)}${csvB}`;
} // combine

/**
 * Downloads a given CSV string as a .csv file. Multiple CSV strings are supported
 * if downloading as xlsx (default). Multiple CSV strings must be in the following format:
 * [
 *   {
 *     name: 'Worksheet 1',
 *     csv: csvFileString1
 *   },
 *   {
 *     name: 'Worksheet 2',
 *     csv: csvFileString2
 *   },
 * ]
 *
 * @param csvText - csv text(s) to create as file, eg output of generate
 * @param filename (optional) - file name with which to download file
 * @param asXlsx (optional) - download file as xlsx? default is true, alternative is CSV
 */
export function download(csvText, filename = null, asXlsx = true) {
  // build filename
  let ext = asXlsx ? '.xlsx' : '.csv';
  if (filename == undefined || filename == null) filename = 'export';
  if (filename.substring(ext.length - 4) != ext) filename += ext;

  // build file contents (aka blob)
  let blob;
  if (!asXlsx) {
    // just chuck text contents into Blob
    blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  } else {
    // standardize structure of CSV to array structure
    if (typeof csvText === typeof 'string') csvText = [{ name: 'Sheet 1', csv: csvText }];

    // parse CSV data for xlsx
    let csvData = [];
    let text;
    for (let i = 0; i < csvText.length; i++) {
      text = csvText[i].csv;
      csvData.push(Papa.parse(text, { header: false }));
    }

    // convert parsed CSV data to XLSX sheets
    let worksheets = [];
    for (let item of csvData) {
      worksheets.push(XLSX.utils.json_to_sheet(item.data, { skipHeader: true }));
    }

    // create workbook and fill it with sheets
    const workbook = XLSX.utils.book_new();
    let sheet;
    for (let i = 0; i < worksheets.length; i++) {
      sheet = worksheets[i];
      XLSX.utils.book_append_sheet(workbook, sheet, csvText[i].name);
    }

    // convert workbook to blob
    const xlsx = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    blob = new Blob([xlsx], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // build link to "click"
  var link = document.createElement('a');
  var url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  // put link in document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} // download

/**
 * Escapes invalid characters in CSV.
 * @param item - array or string to escape
 * @param quotify (optional) - whether or not to surround result in quotes
 */
export function escape(item, quotify = false) {
  let to_return;
  if (Array.isArray(item)) {
    to_return = _.map(item, (s) => {
      s = `${s || ''}`;
      to_return = s.replaceAll('"', '""');
      if (quotify) to_return = `"${to_return}"`;
      return to_return;
    });
  } else {
    item = `${item}`;
    to_return = item.replaceAll('"', '""');
    if (quotify) to_return = `"${to_return}"`;
  }
  return to_return;
} // escape

/**
 * Non-destructively removes undesired headers (keys)
 * @param objects - old array of objects to filter
 * @param desired_headers - which headers (aka keys of objects[x]) to keep
 * @return new array of objects with only and all desired_headers keys
 */
export function filterHeaders(objects, desired_headers) {
  let new_objects = [];
  // go through each object...
  _.forEach(objects, (object) => {
    // extract headers we want
    let new_object = {};
    _.forEach(desired_headers, (h) => {
      if (object[h] != undefined) new_object[h] = object[h];
      else new_object[h] = '';
    });
    new_objects.push(new_object);
  });
  return new_objects;
} // filterHeaders

/**
 * Generates a valid CSV "file" string from an object. Object values may
 * be arrays. Object keys will be used as headers.
 * @param object_array - array of objects to make CSV
 * @param delimiter (optional) - string by which arrays will be separated
 * @return file-ready CSV string
 */
export function generate(object_array, delimiter = ', ') {
  let final_csv = '';

  // construct headers, preserving order
  let headers = [];
  let seent = new Set();
  _.forEach(object_array, (object) => {
    _.forEach(Object.keys(object), (key, index) => {
      if (!seent.has(key)) {
        seent.add(key);
        headers.splice(index + 1, 0, key);
      }
    });
  });

  // add headers to CSV
  final_csv += `${this.escape(headers, true).join(',')}${NEW_LINE}`;

  // foreach line of file...
  _.forEach(object_array, (object) => {
    let current;
    let line = [];
    // foreach item (box) in line...
    _.forEach(headers, (header) => {
      // iteration vars
      current = object[header];
      // add line, supporting arrays and escaping characters
      if (current == undefined) {
        line.push('""');
      } else if (Array.isArray(current)) {
        current = current.filter((i) => i !== undefined);
        line.push(`"${this.escape(current).join(delimiter)}"`);
      } else {
        line.push(`"${this.escape(current)}"`);
      }
    });
    final_csv += `${line.join(',')}${NEW_LINE}`;
  });

  return final_csv;
} // generate

/**
 * Generates a valid CSV "file" from a 2D array object. All values
 * will be stringified and the first row will be the headers.
 * @param array - 2D array to make CSV
 * @return file-ready CSV string
 */
export function generateFrom2dArray(arrays) {
  let linesArray = [];
  for (let i = 0; i < arrays.length; i++) {
    let line = [];
    for (let ii = 0; ii < arrays[i].length; ii++) {
      line.push(escape(arrays[i][ii], true));
    }
    linesArray.push(line.join(','));
  }
  return linesArray.join('\n');
} // generateFrom2dArray

/**
 * Non-destructively sorts an array of objects by a given key. Wrapper
 * for lodash's sort function.
 * @param objects - array of objects to sort
 * @param key - key by which to sort the `objects`, supports arrays for prioritizing
 * @return a new array of sorted `objects`
 */
export function sort(objects, key) {
  if (!Array.isArray(key)) key = [key];
  return _.sortBy(objects, key);
} // sort

export default {
  combine,
  download,
  escape,
  filterHeaders,
  generate,
  generateFrom2dArray,
  sort
};
