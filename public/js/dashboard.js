/**
 * SpendWise - Dashboard Chart.js Visualizations & 3D Robot Interactions
 */

// Global Chart references for dynamic updates
let monthlyTrendsChartInstance = null;
let categoryDonutChartInstance = null;

/**
 * 1. Initialize Dashboard Charts
 */
function initDashboardCharts(monthlyTrends, categoryExpenses) {
  // Chart.js default dark theme settings
  Chart.defaults.color = '#94A3B8';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
  Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif';

  // 1. Monthly Trends Chart (Recent 6 Months Bar/Line)
  const trendsCtx = document.getElementById('monthlyTrendsChart');
  if (trendsCtx && monthlyTrends && monthlyTrends.length > 0) {
    const labels = monthlyTrends.map(t => t.year_month);
    const incomeData = monthlyTrends.map(t => t.total_income);
    const expenseData = monthlyTrends.map(t => t.total_expense);

    monthlyTrendsChartInstance = new Chart(trendsCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '총 수입',
            data: incomeData,
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderColor: '#10B981',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.6
          },
          {
            label: '총 지출',
            data: expenseData,
            backgroundColor: 'rgba(239, 68, 68, 0.85)',
            borderColor: '#EF4444',
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 16,
              color: '#CBD5E1'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#F8FAFC',
            bodyColor: '#E2E8F0',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()}원`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
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

  // 2. Category Expenses Donut Chart
  const categoryCtx = document.getElementById('categoryDoughnutChart');
  if (categoryCtx && categoryExpenses && categoryExpenses.length > 0) {
    const labels = categoryExpenses.map(c => c.category_name);
    const data = categoryExpenses.map(c => c.total_amount);
    const colors = categoryExpenses.map(c => c.category_color || '#6366F1');

    categoryDonutChartInstance = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderColor: '#131B2E',
            borderWidth: 3,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 10,
              padding: 12,
              font: { size: 12 },
              color: '#CBD5E1'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#F8FAFC',
            bodyColor: '#E2E8F0',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => {
                const val = Number(ctx.raw);
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${ctx.label}: ${val.toLocaleString()}원 (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }
}

/**
 * 2. Play celebratory harmonic chime synthesizer via Web Audio API
 */
function playCelebrationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Melodic arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.001, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.65);
    });
  } catch (err) {
    // Graceful fallback if audio is not permitted by browser policy
  }
}

/**
 * 3. 3D Robot Head Heart Celebration Animation
 * Overlay positioned over the robot head (approx 50% left, 30% top of viewport)
 */
function triggerRobotHeartCelebration(amount, title) {
  const overlay = document.getElementById('robotCelebrationOverlay');
  if (!overlay) return;

  // 1. Play synthesized cheerful chime
  playCelebrationChime();

  // 2. Display the celebration toast banner
  const toast = document.getElementById('celebrationToast');
  const toastTitle = document.getElementById('celebrationToastTitle');
  const toastDesc = document.getElementById('celebrationToastDesc');

  if (toast) {
    if (toastTitle && title) {
      toastTitle.innerText = `수입 등록 완료: ${title}`;
    }
    if (toastDesc && amount) {
      toastDesc.innerText = `+${Number(amount).toLocaleString()}원이 MySQL에 안전하게 저장되었습니다! 💕`;
    }
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // 3. Clear any existing children before bursting
  overlay.innerHTML = '';

  // 4. Create central glowing halo pulse around robot head
  const halo = document.createElement('div');
  halo.className = 'robot-heart-halo';
  overlay.appendChild(halo);

  // 5. Spawn floating celebration hearts & sparkles
  const heartIcons = ['💖', '💕', '💗', '💓', '❤️', '✨', '⭐', '✨'];
  const particleCount = 22;

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    el.className = 'robot-flying-heart';
    el.innerText = heartIcons[i % heartIcons.length];

    // Trajectory calculations (fanning upward and outward from robot's head)
    const angle = (Math.PI * 0.2) + (Math.random() * Math.PI * 0.6); // upward arc
    const distance = 80 + Math.random() * 140;
    const dx = Math.cos(angle) * distance * (Math.random() > 0.5 ? 1 : -1);
    const dy = -(Math.sin(angle) * distance + 40);
    const rot = -30 + Math.random() * 60;
    const size = 18 + Math.random() * 24;
    const duration = 1.4 + Math.random() * 1.0;
    const delay = Math.random() * 0.5;

    el.style.setProperty('--dx', `${dx.toFixed(1)}px`);
    el.style.setProperty('--dy', `${dy.toFixed(1)}px`);
    el.style.setProperty('--rot', `${rot.toFixed(1)}deg`);
    el.style.fontSize = `${size.toFixed(1)}px`;
    el.style.animation = `robotHeartFly ${duration.toFixed(2)}s cubic-bezier(0.22, 1, 0.36, 1) ${delay.toFixed(2)}s forwards`;

    overlay.appendChild(el);
  }

  // 6. Clean up elements after animation ends
  setTimeout(() => {
    overlay.innerHTML = '';
  }, 3500);
}

/**
 * 4. Quick Income Modal Handlers
 */
function openQuickIncomeModal() {
  const modal = document.getElementById('quickIncomeModal');
  const alertBox = document.getElementById('quickIncomeAlert');
  const form = document.getElementById('quickIncomeForm');

  if (alertBox) alertBox.style.display = 'none';
  if (form) {
    form.reset();
    const dateInput = document.getElementById('qiTransactionDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }
  openModal('quickIncomeModal');
}

/**
 * 5. Handle Async Quick Income Form Submission
 */
async function handleQuickIncomeSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = document.getElementById('qiSubmitBtn');
  const alertBox = document.getElementById('quickIncomeAlert');
  const alertMsg = document.getElementById('quickIncomeAlertMsg');

  const amount = Number(document.getElementById('qiAmount').value);
  const title = document.getElementById('qiTitle').value.trim();
  const categoryId = document.getElementById('qiCategoryId').value;
  const transactionDate = document.getElementById('qiTransactionDate').value;
  const paymentMethod = document.getElementById('qiPaymentMethod').value;
  const isFixed = document.getElementById('qiIsFixed').checked ? 1 : 0;
  const description = document.getElementById('qiDescription').value.trim();

  if (!amount || amount <= 0 || !title || !categoryId || !transactionDate) {
    if (alertBox && alertMsg) {
      alertMsg.innerText = '필수 항목(금액, 명칭, 카테고리, 거래 일자)을 모두 올바르게 입력해주세요.';
      alertBox.style.display = 'flex';
    }
    return;
  }

  // Disable button during submission
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ 저장 중...</span>';
  }
  if (alertBox) alertBox.style.display = 'none';

  try {
    const payload = {
      type: 'income',
      amount,
      title,
      categoryId,
      transactionDate,
      paymentMethod,
      isFixed,
      description,
      ajax: '1'
    };

    const response = await fetch('/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // 1. Close modal
      closeModal('quickIncomeModal');

      // 2. Trigger Celebration Heart Animation on Robot Head
      triggerRobotHeartCelebration(amount, title);

      // 3. Update dynamic stats on dashboard
      const incomeEl = document.getElementById('statTotalIncome');
      const netSavingsEl = document.getElementById('statNetSavings');

      if (incomeEl) {
        const curIncome = parseInt(incomeEl.innerText.replace(/[^0-9]/g, ''), 10) || 0;
        const newIncome = curIncome + amount;
        incomeEl.innerText = `${newIncome.toLocaleString()}원`;
      }

      if (netSavingsEl) {
        const curSavings = parseInt(netSavingsEl.innerText.replace(/[^0-9-]/g, ''), 10) || 0;
        const newSavings = curSavings + amount;
        netSavingsEl.innerText = `${newSavings.toLocaleString()}원`;
      }

      // 4. Prepend transaction to recent table if present
      const tbody = document.getElementById('recentTransactionsTbody');
      if (tbody) {
        const newRow = document.createElement('tr');
        newRow.className = 'newly-added-row';
        newRow.innerHTML = `
          <td style="color: var(--text-muted); font-size: 0.82rem;">${transactionDate}</td>
          <td><span class="badge badge-success">수입</span></td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10B981;"></span>
              수입
            </span>
          </td>
          <td>
            <strong style="color: #fff;">${title}</strong>
            ${isFixed ? '<span class="badge badge-info" style="font-size: 0.68rem; margin-left: 4px;">고정</span>' : ''}
          </td>
          <td style="color: var(--text-muted); font-size: 0.82rem;">${paymentMethod}</td>
          <td>
            <span class="amount-income">+${amount.toLocaleString()}원</span>
          </td>
        `;
        tbody.insertBefore(newRow, tbody.firstChild);
      }
    } else {
      // Failure branch: DO NOT trigger heart animation (requirement: "저장 실패 시 축하 애니메이션을 실행하지 말 것")
      if (alertBox && alertMsg) {
        alertMsg.innerText = data.error || '저장에 실패했습니다. 입력값을 확인해주세요.';
        alertBox.style.display = 'flex';
      }
    }
  } catch (err) {
    if (alertBox && alertMsg) {
      alertMsg.innerText = '네트워크 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      alertBox.style.display = 'flex';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>💾 수입 저장 & 로봇 축하 반응</span>';
    }
  }
}

/**
 * 6. Page Load Listener: Check for URL celebration parameters and bind interactive test button
 */
document.addEventListener('DOMContentLoaded', () => {
  // Test heart button interaction
  const testHeartBtn = document.getElementById('testHeartBtn');
  if (testHeartBtn) {
    testHeartBtn.addEventListener('click', () => {
      triggerRobotHeartCelebration(1000000, '로봇 상호작용');
    });
  }

  // Check URL parameters for celebration redirect from /transactions/new
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('celebrate') === 'income') {
    const amount = urlParams.get('amount') || 0;
    const title = decodeURIComponent(urlParams.get('title') || '수입');
    
    // Slight delay to allow Spline iframe to settle
    setTimeout(() => {
      triggerRobotHeartCelebration(amount, title);
    }, 600);

    // Clean URL query without page reload
    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
  }
});
