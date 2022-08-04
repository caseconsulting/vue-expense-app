# Making and Using Charts after July 2022

You can open this readme in Github for nice formatting: https://github.com/caseconsulting/vue-expense-app/blob/master/src/utils/csv/README.md
(the charts get ugly so I would reccomend this)

This is a user's guide to making and using charts.

## Drop the Base

In the charts folder, you'll find a baseChart folder. This contains all the simplist forms of the kinds of portal charts. You won't have to edit these, only use them as a child component wherever you need to make the chart. The things each base chart needs are:

- the data _the information to show in the chart_
- the options _the titles, plugins, click functions, etc_
- the chartId _unique identifier to use as the HTML id_

## Add a Little Bit of Spice

### aka Making the Chart

Now you're ready to create a chart.

- Start by creating a component in customCharts to serve as the main chart component. Set this up as normal with template and scripts.
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
  This will first get all the data from the store needed to use the chart and store it in a data variable. Then you separately draw the chart which you can see next...
- Now we draw. The things you'll need to define are...
  - labels _array_
  - data _object_ which includes
    - labels: the labels from above
    - datasets _array_ with object containing the data from the fetchData variable and any colors or border styles
  - options _object_ which includes
    - scales _object_ defining what the x and y axis look like (see https://www.chartjs.org/docs/latest/axes/labelling.html for more)
    - plugins _object_ with objects like legend or title (see examples from customCharts)
    - (if the chart is clickable) onClick _function_ example:
      - ```javascript
        onClick: (x, y) => {
          if (_.first(y)) {
            let index = _.first(y).index;
            this.$router.push({
              path: '/reports',
              name: 'reports',
              params: { requestedDataType: 'Job Roles', requestedFilter: this.chartData.labels[index] }
            });
          }
        };
        ```
  - maintainAspectRatio: false to use a different aspect ratio when resizing
