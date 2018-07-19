<script>
import {
  Bar
} from 'vue-chartjs';

export default {
  extends: Bar,
  mounted() {
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: [
        'AWS',
        'Company Phones',
        'Cowboy Training',
        'Dragon Balls',
        'Equipment',
        'Ninja Training',
        'Overall',
        'Parking',
        'Pirate Training',
        'Pokemon Training'
      ],
      datasets: [{
          type: 'bar',
          label: 'Reimbursed',
          backgroundColor: '#12c44c',
          data: [1050, 900, 1000, 850, 820, 420, 700, 1010, 999, 340]
        },
        {
          type: 'bar',
          label: 'Unreimbursed',
          backgroundColor: 'red',
          data: [0, 0, 0, 0, 0, 0, 0, 800, 120, 90]
        },
        {
          type: 'bar',
          label: 'Budget',
          backgroundColor: '#e1e7f2',
          fill: false,
          data: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
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
