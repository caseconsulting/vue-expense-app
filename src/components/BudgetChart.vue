<script>
import { Bar } from 'vue-chartjs';

export default {
  props: ['employee', 'budgets'],
  extends: Bar,
  mounted() {
    // Overwriting base render method with actual data.

    this.renderChart(
      {
        labels: this.budgets.names,
        datasets: [
          {
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
            label: 'Remaining Budget',
            backgroundColor: '#e1e7f2',
            fill: false,
            data: this.budgets.difference

          },
          {
            type: 'bar',
            label: 'Overdraft reimbursed',
            backgroundColor: 'purple',
            data: this.budgets.odReimbursed
          },
          {
            type: 'bar',
            label: 'Overdraft Unreimbursed',
            backgroundColor: 'pink',
            data: this.budgets.odUnreimbursed
          }
        ]
      },
      {
        scales: {
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                callback: function(value, index, values) {
                  return value.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  });
                }
              }
            }
          ],
          xAxes: [
            {
              stacked: true,
              categoryPercentage: 0.5,
              barPercentage: 1,
              ticks: {
                autoSkip: false
              }
            }
          ]
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return (
                '$' +
                Number(tooltipItem.yLabel)
                  .toFixed(0)
                  .replace(/./g, function(c, i, a) {
                    return i > 0 && c !== '.' && (a.length - i) % 3 === 0
                      ? ',' + c
                      : c;
                  })
              );
            }
          }
        },
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      }
    );
  }
};
</script>
