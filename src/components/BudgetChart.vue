<script>
import {
  Bar
} from 'vue-chartjs';

export default {
  props: ['employee', 'budgets'],
  extends: Bar,
  mounted() {
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: this.budgets.names,
       //[
      //   'AWS',
      //   'Company Phones',
      //   'Cowboy Training',
      //   'Dragon Balls',
      //   'Equipment',
      //   'Ninja Training',
      //   'Overall',
      //   'Parking',
      //   'Pirate Training',
      //   'Pokemon Training'
      // ],
      datasets: [{
          type: 'bar',
          label: 'Reimbursed',
          backgroundColor: '#12c44c',
          data: this.budgets.reimbursed
        },
        {
          type: 'bar',
          label: 'Unreimbursed',
          backgroundColor: 'red',
          data: this.budgets.unreimbursed
        },
        {
          type: 'bar',
          label: 'Budget',
          backgroundColor: '#e1e7f2',
          fill: false,
          data: this.budgets.difference
        }
      ]
    }, {
      scales: {
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [{
          stacked: true,
          categoryPercentage: 0.5,
          barPercentage: 1,
          ticks: {
            autoSkip: false
          }
        }]
      },
      legend: {
        display: true
      },
      responsive: true,
      maintainAspectRatio: false
    });
  }
};
</script>
