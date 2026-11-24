/**
 * Analysis & Habit Diagnosis Visualizations
 */
function initAnalysisCharts(scoreBreakdown, dailyTrend) {
  Chart.defaults.color = '#94A3B8';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';

  // 1. Radar Chart: 4 Pillars of Spending Habit
  const radarCtx = document.getElementById('habitRadarChart');
  if (radarCtx && scoreBreakdown) {
    const b = scoreBreakdown;
    
    // Normalized to 100% for radar comparison
    const budgetPct = b.budgetAdherence ? (b.budgetAdherence.score / b.budgetAdherence.maxScore) * 100 : 0;
    const savingsPct = b.savingsRate ? (b.savingsRate.score / b.savingsRate.maxScore) * 100 : 0;
    const overspendPct = b.overspendingControl ? (b.overspendingControl.score / b.overspendingControl.maxScore) * 100 : 0;
    const microPct = b.microTransactionManagement ? (b.microTransactionManagement.score / b.microTransactionManagement.maxScore) * 100 : 0;

    new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: ['예산 준수도 (35점)', '저축/잉여율 (25점)', '과소비 억제도 (20점)', '소액 결제 관리 (20점)'],
        datasets: [
          {
            label: '나의 소비 습관 달성률 (%)',
            data: [budgetPct, savingsPct, overspendPct, microPct],
            backgroundColor: 'rgba(99, 102, 241, 0.25)',
            borderColor: '#6366F1',
            borderWidth: 2,
            pointBackgroundColor: '#818CF8',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#6366F1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: '#CBD5E1',
              font: { size: 12, weight: '600' }
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              display: false,
              stepSize: 20
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` 달성률: ${ctx.raw.toFixed(1)}%`
            }
          }
        }
      }
    });
  }

  // 2. Daily Expense Trend Line Chart
  const dailyCtx = document.getElementById('dailyTrendChart');
  if (dailyCtx && dailyTrend && dailyTrend.length > 0) {
    const labels = dailyTrend.map(d => `${d.day}일`);
    const data = dailyTrend.map(d => d.amount);

    new Chart(dailyCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '일별 지출액',
            data: data,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#F59E0B'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` 지출: ${Number(ctx.raw).toLocaleString()}원`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              callback: (val) => (val >= 10000 ? (val / 10000).toLocaleString() + '만' : val.toLocaleString())
            }
          }
        }
      }
    });
  }
}
