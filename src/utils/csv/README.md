# CSV Utils

You can open this readme in Github for nice formatting: https://github.com/caseconsulting/vue-expense-app/blob/master/src/utils/csv/README.md
(the charts get ugly so I would reccomend this)

This is a user's guide to the CSV utilities. Start here, but if you are wondering about a specific aspect of a function, feel free to dive into the code yourself.

## Basic concept

There's two ways to generate a CSV. You can either (1) create a Javscript object or (2) create a 2D array. The object was the original design of the utilities, but a 2D array was found to be convenient for some use cases. Either way, the concept is pretty similar: a `.vue` file will import _only_ a \_\_\_\_Csv.js file, for example `expensesCsv.js`. This file will do all the filtering and converting in order to use `baseCsv.js`. This file must provide `download()` and `convert_____()` functions at minimum and can have as many helper functions as desired. Look in `expensesCsv.js` for a simple example of how this should work.

## The Base CSV utilities

Here's a short description of each utility found in `baseCsv.js`, so that you can more easily create your own importable file. They are sorted by usefulness here, but alphabetically in the actual file.

**NOTE**: A CSV string is a string that is ready to be passed into `download()`. This is references in the below. The premis is that you you generate a CSV string from a `generate` function and then pass that string into `download()`.

| Function            | Description                                                                                                                                | Input                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| download            | Downloads a given CSV string as a .csv file.                                                                                               | **csv** the csv string; **filename** _(optional)_ filename to call the csv, default is export.csv                                                             |
| generage            | Creates a CSV string out of an array of objects, where the keys are the headers. Arrays will be `.join`ed                                  | **object_array** array of objects with which to make the CSV; **delimiter** _(optional)_ string with which to `join` arrays                                   |
| generateFrom2dArray | Similar to `generate()` but takes in a 2D array. No sub-array may be longer or shorter than another. The first row will be used as headers | **arrays** array objects that will be converted to a CSV string                                                                                               |
| escape              | Looks through a string and replaces special characters with their escaped equivalent                                                       | **item** string to escape; **quotify** _(optional)_ whether or not to surround result in quotes, defaults to false                                            |
| combine             | Combines ("stacks") two CSV strings on top of each other                                                                                   | **csvA** CSV to place on top; **csvB** CSV to put on bottom; **spaceBetween** _(optional)_ number of empty lines to place between csvA and csvB, default is 0 |
| filterHeaders       | Takes in an array of objects (just like `generate`) and removes any headers not specified                                                  | **objects** array of original objects; **desired_headers**                                                                                                    |
| sort                | Sorts an object array by the given key. Basically the same as lodash's `sortBy`                                                            | **objects** array of objects to sort; **key** key in `objects` by which to sort                                                                               |
