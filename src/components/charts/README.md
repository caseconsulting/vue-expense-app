# Making and Using Charts after July 2022

You can open this readme in Github for nice formatting: https://github.com/caseconsulting/vue-expense-app/blob/master/src/components/charts/README.md
(the charts get ugly so I would reccomend this)

This is a user's guide to making and using charts.

## Drop the Base

In the charts folder, you'll find a baseChart folder. This contains all the simplest forms of the kinds of portal charts. You won't have to edit these, only use them as a child component wherever you need to make the chart. The things each base chart needs are:

- the data _the information to show in the chart_
- the options _the titles, plugins, click functions, etc_
- the chartId _unique identifier to use as the HTML id_

## Add a Little Bit of Spice

### aka Making the Chart

Now you're ready to create a chart.

- Start by creating a component in custom-charts to serve as the main chart component. Set this up as normal with template and scripts.
- You'll probably need `import { storeIsPopulated } from '@/utils/utils';` to wait until loading the data.
- In a `mounted` hook, use a structure like:
  ```javascript
  async function mounted() {
    if (this.storeIsPopulated) {
      await this.fetchData();
      await this.drawChart();
    }
  }
  ```
  This will first get all the data from the store needed to use the chart and store it in a `data` variable. Then you separately draw the chart which you can see next...
- Now we draw. The things you'll need to define are...
  - labels _array_
  - data _object_ (see https://www.chartjs.org/docs/latest/getting-started/usage.html) which includes
    - labels: the labels from above
    - datasets _array_ with object containing the data from the fetchData variable and any colors or border styles
  - `options` _object_ which includes
    - scales _object_ defining what the x and y axis look like (see https://www.chartjs.org/docs/latest/axes/labelling.html for more)
    - plugins _object_ with objects like legend or title (see examples from files in custom-charts)
    - (if the chart is clickable) onClick _function_ (see below section on making chart clickable)
  - maintainAspectRatio: false to use a different aspect ratio when resizing
- Once you have both these methods fleshed out, create the base chart child component in the template. Also import and include it in the export.
- Pass the chartId prop, options, and chartData variables. **IMPORTANT** You also need to create a ref attribute in the tag. This will be used to destroy the chart like so...
  ```javascript
  function beforeUnmount() {
    // this.$refs.barChart.destroyChart();
  }
  ```
  This calls the destroyChart function found in the base chart which deletes the chart instance and prevents errors in the console.

## Click me Baby One More Time

### aka Making the Chart Clickable

Here is what goes into the chart's options object:

- ```javascript
  onClick: (x, y) => {
    if (_.first(y)) {
      let index = _.first(y).index;
      localStorage.setItem('requestedDataType', 'jobRoles');
      localStorage.setItem('requestedFilter', this.chartData.labels[index]);
      this.$router.push({
        path: '/reports',
        name: 'reports'
      });
    }
  };
  ```

  Most of the clickable charts will route to another page on the portal. This uses a router function going to the desired path and passes along any paramaters the page needs to load. You get the specific bar/slice using the x and y coordinates. Index of `_.first(y)` corresponds to the appropriate spot in the labels array for that bar/slice. You can then pass the text of that label through using `this.chartData.labels[index]` (though chartData may change depending on what you named it). In this example, the jobRoles chart also sends the dataType to filter the reports page by and the value to put in that autocomplete. Other pages may send employee info, lists, etc.

  This code gets the coordinates for a bar/slice and sends the label along. But if you also want the overall chart to be clickable (like the `BudgetsChart.vue`) then do something like this:

  ```javascript
  onClick: (x, y) => {
      if (_.first(y)) {
        let index = _.first(y).index;
        let routeData = {
          defaultEmployee: employee,
          defaultFilterReimbursed: 'both',
          defaultSearch: this.chartData.labels[index]
        };
        // redirect to expenses page
        router.push({
          name: 'expenses',
          params: routeData
        });
      } else {
        router.push({
          name: 'expenses',
          params: {
            defaultEmployee: employee,
            defaultFilterReimbursed: 'both'
          }
        });
      }
  ```

  This checks to see if the clicked point is actually a bar/slice. If you just click the general area of the chart, it goes into the else statement. In this case, we don't want to filter the employee's expenses by something specific so we just route the employee and reimbursement filter.

You also need to include some things in the destination file. See the Reports.vue file and EmployeeReportsTable.vue for an example. In the created hook, see if `this.$route.params` has any values you want. I created a wasRedirected variable to true and scrolled to the top but that's not required. This boolean was used to show a back button for better usability.

The real routing happens in the child, EmployeeReportsTable, though it isn't required to have a child. In the created hook I again checked if the `this.$route.params` had anything in it. If so, I assigned the appropriate variables the value of the `this.$route.params`. There may be more things you have to handle but this is the basics.

```javascript
if (this.$route.params.requestedDataType) {
  this.dataType = this.$route.params.requestedDataType;
  if (this.$route.params.requestedDataType === 'contracts') {
    this.prime = this.$route.params.requestedFilter;
  } else if (this.$route.params.requestedDataType === 'jobRoles') {
    this.dataTypeSearch = this.$route.params.requestedFilter;
  }
}
```

## In Case of Errors

One last note is things we stumbled upon that created errors with the charts.

- If the chart has a different animation after viewing a second time, make sure your fetchingData and drawing the chart are two separate functions and both async. This will ensure the data is completely loaded in before rendering the chart.
- If a clickable chart is throwing errors in the console onClick, make sure you have a beforeUnmount hook that calls the destroyChart function in the base chart. If the chart instance is not properly destroyed sometimes vue looks for things that aren't there after leaving the chart.
