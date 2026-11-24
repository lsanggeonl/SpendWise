const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

class AnalysisService {
  /**
   * Calculate Month-end expected spending
   * Uses real mathematical progression based on days passed in the target month.
   */
  static calculateExpectedMonthEndExpense(yearMonth, currentExpenseSoFar) {
    const [yearStr, monthStr] = yearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-12

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // Total days in target month
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    // If viewing a past month:
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return currentExpenseSoFar;
    }

    // If viewing a future month:
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return 0;
    }

    // Viewing current month:
    const daysElapsed = Math.max(1, currentDay);
    const dailyAverage = currentExpenseSoFar / daysElapsed;
    const remainingDays = Math.max(0, totalDaysInMonth - daysElapsed);
    const expected = Math.round(currentExpenseSoFar + (dailyAverage * remainingDays));

    return {
      expectedTotal: expected,
      dailyAverage: Math.round(dailyAverage),
      daysElapsed,
      remainingDays,
      totalDays: totalDaysInMonth
    };
  }

  /**
   * Comprehensive spending habit score (100 points maximum) and detailed rationale
   * Computed strictly from real MySQL transactions & budget records
   */
  static calculateHabitScore({
    totalIncome,
    totalExpense,
    budgetAmount,
    overspendingTransactions,
    microTransactions,
    user
  }) {
    const breakdown = {
      budgetAdherence: {
        maxScore: 35,
        score: 0,
        usageRate: 0,
        hasBudget: budgetAmount > 0,
        comment: ''
      },
      savingsRate: {
        maxScore: 25,
        score: 0,
        rate: 0,
        comment: ''
      },
      overspendingControl: {
        maxScore: 20,
        score: 0,
        count: overspendingTransactions.length,
        totalAmount: overspendingTransactions.reduce((s, t) => s + Number(t.amount), 0),
        threshold: user.overspending_threshold,
        comment: ''
      },
      microTransactionManagement: {
        maxScore: 20,
        score: 0,
        count: microTransactions.reduce((s, t) => s + Number(t.count), 0),
        totalAmount: microTransactions.reduce((s, t) => s + Number(t.total_amount), 0),
        threshold: user.micro_tx_threshold,
        comment: ''
      }
    };

    // 1. Budget Adherence (35 Points)
    if (budgetAmount > 0) {
      const usage = (totalExpense / budgetAmount) * 100;
      breakdown.budgetAdherence.usageRate = Number(usage.toFixed(1));

      if (usage <= 70) {
        breakdown.budgetAdherence.score = 35;
        breakdown.budgetAdherence.comment = `예산 대비 ${usage.toFixed(1)}% 사용하여 완벽한 한도 통제력을 발휘하고 있습니다.`;
      } else if (usage <= 85) {
        breakdown.budgetAdherence.score = 30;
        breakdown.budgetAdherence.comment = `예산 대비 ${usage.toFixed(1)}%로 안정적인 범위에서 계획 소비를 이행 중입니다.`;
      } else if (usage <= 100) {
        breakdown.budgetAdherence.score = 22;
        breakdown.budgetAdherence.comment = `예산의 ${usage.toFixed(1)}%를 사용하여 한도에 근접했습니다. 추가 소비에 주의하세요.`;
      } else if (usage <= 115) {
        breakdown.budgetAdherence.score = 12;
        breakdown.budgetAdherence.comment = `설정 예산을 ${usage.toFixed(1)}% 초과했습니다. 초과 지출 항목 분석이 시급합니다.`;
      } else {
        breakdown.budgetAdherence.score = 5;
        breakdown.budgetAdherence.comment = `예산을 ${usage.toFixed(1)}% 소진하여 대규모 초과가 발생했습니다. 지출 통제 회복이 절실합니다.`;
      }
    } else {
      // No budget set: evaluate based on expense to income ratio
      const income = totalIncome > 0 ? totalIncome : Number(user.monthly_income_target || 3500000);
      const ratio = (totalExpense / income) * 100;
      breakdown.budgetAdherence.usageRate = Number(ratio.toFixed(1));

      if (ratio <= 60) {
        breakdown.budgetAdherence.score = 28;
        breakdown.budgetAdherence.comment = '설정된 예산은 없으나, 소득 대비 지출 비율(60% 이하)이 양호합니다. 정밀 관리를 위해 예산을 등록해보세요.';
      } else if (ratio <= 80) {
        breakdown.budgetAdherence.score = 22;
        breakdown.budgetAdherence.comment = '소득의 60~80% 수준을 지출하고 있습니다. 예산 목표를 수립하여 지출 누수를 방지하세요.';
      } else {
        breakdown.budgetAdherence.score = 12;
        breakdown.budgetAdherence.comment = '소득 대비 지출이 80%를 넘어 과소비 위험이 있습니다. 월 예산 한도를 설정해주세요.';
      }
    }

    // 2. Savings / Surplus Rate (25 Points)
    const baseIncome = totalIncome > 0 ? totalIncome : Number(user.monthly_income_target || 3500000);
    const savings = baseIncome - totalExpense;
    const savingsRate = Number(((savings / baseIncome) * 100).toFixed(1));
    breakdown.savingsRate.rate = savingsRate;

    if (savingsRate >= 35) {
      breakdown.savingsRate.score = 25;
      breakdown.savingsRate.comment = `저축/잉여율 ${savingsRate}%로 최고 수준의 자산 형성 능력을 보여주고 있습니다.`;
    } else if (savingsRate >= 25) {
      breakdown.savingsRate.score = 21;
      breakdown.savingsRate.comment = `저축률 ${savingsRate}%로 매우 우수한 재무 건전성을 유지하고 있습니다.`;
    } else if (savingsRate >= 15) {
      breakdown.savingsRate.score = 16;
      breakdown.savingsRate.comment = `저축률 ${savingsRate}%로 권장 최소 저축 수준(15%)을 안정적으로 달성했습니다.`;
    } else if (savingsRate >= 5) {
      breakdown.savingsRate.score = 10;
      breakdown.savingsRate.comment = `저축률 ${savingsRate}%로 잉여 자금이 다소 부족합니다. 고정비와 변동비 절감을 권장합니다.`;
    } else if (savingsRate >= 0) {
      breakdown.savingsRate.score = 5;
      breakdown.savingsRate.comment = `간신히 수지 균형(저축률 ${savingsRate}%)을 유지하고 있습니다. 비상금 조성을 위한 지출 절감이 필요합니다.`;
    } else {
      breakdown.savingsRate.score = 0;
      breakdown.savingsRate.comment = `적자 지출(저축률 ${savingsRate}%) 상태입니다! 소득보다 지출이 많아 부채 발생 위험이 높습니다.`;
    }

    // 3. Overspending Control (20 Points)
    const overCount = breakdown.overspendingControl.count;
    if (overCount === 0) {
      breakdown.overspendingControl.score = 20;
      breakdown.overspendingControl.comment = `기준 금액(${Number(user.overspending_threshold).toLocaleString()}원) 이상의 고액 돌발 지출이 0건으로 완벽히 통제되었습니다.`;
    } else if (overCount === 1) {
      breakdown.overspendingControl.score = 16;
      breakdown.overspendingControl.comment = `고액 지출이 1건 발생했으나, 전반적인 통제 범위 내에서 관리되고 있습니다.`;
    } else if (overCount === 2) {
      breakdown.overspendingControl.score = 12;
      breakdown.overspendingControl.comment = `고액 지출이 2건 발생했습니다. 계획되지 않은 충동구매인지 점검이 필요합니다.`;
    } else if (overCount <= 4) {
      breakdown.overspendingControl.score = 7;
      breakdown.overspendingControl.comment = `고액 결제가 ${overCount}회 반복되었습니다. 큰 지출 전 24시간 숙고 규칙을 적용해보세요.`;
    } else {
      breakdown.overspendingControl.score = 2;
      breakdown.overspendingControl.comment = `고액 결제가 ${overCount}회로 과소비 패턴이 고착화되어 있습니다. 지출 한도 설정이 시급합니다.`;
    }

    // 4. Repeated Micro-transactions Management (20 Points)
    const microCount = breakdown.microTransactionManagement.count;
    if (microCount <= 5) {
      breakdown.microTransactionManagement.score = 20;
      breakdown.microTransactionManagement.comment = `소액 반복 결제(${Number(user.micro_tx_threshold).toLocaleString()}원 이하)가 ${microCount}건으로 낭비성 티끌 지출이 거의 없습니다.`;
    } else if (microCount <= 10) {
      breakdown.microTransactionManagement.score = 16;
      breakdown.microTransactionManagement.comment = `소액 결제가 ${microCount}건으로 비교적 합리적인 수준에서 관리되고 있습니다.`;
    } else if (microCount <= 15) {
      breakdown.microTransactionManagement.score = 12;
      breakdown.microTransactionManagement.comment = `소액 결제가 ${microCount}건(총 ${breakdown.microTransactionManagement.totalAmount.toLocaleString()}원) 발생했습니다. 소액이 모여 큰 금액이 되고 있습니다.`;
    } else if (microCount <= 25) {
      breakdown.microTransactionManagement.score = 7;
      breakdown.microTransactionManagement.comment = `소액 반복 결제가 ${microCount}건으로 카페, 배달팁, 편의점 등에서의 자금 누수가 심각합니다.`;
    } else {
      breakdown.microTransactionManagement.score = 2;
      breakdown.microTransactionManagement.comment = `소액 결제가 ${microCount}회(총 ${breakdown.microTransactionManagement.totalAmount.toLocaleString()}원)로 습관적 지출이 만성화되었습니다. 무지출 챌린지를 추천합니다.`;
    }

    // Total Score (0 ~ 100)
    const totalScore = breakdown.budgetAdherence.score +
                       breakdown.savingsRate.score +
                       breakdown.overspendingControl.score +
                       breakdown.microTransactionManagement.score;

    // Grade Mapping
    let grade = '위험';
    let gradeBadge = 'danger';
    if (totalScore >= 90) {
      grade = '최우수 (S)';
      gradeBadge = 'success';
    } else if (totalScore >= 80) {
      grade = '우수 (A)';
      gradeBadge = 'primary';
    } else if (totalScore >= 70) {
      grade = '양호 (B)';
      gradeBadge = 'info';
    } else if (totalScore >= 60) {
      grade = '주의 (C)';
      gradeBadge = 'warning';
    } else {
      grade = '위험 (D)';
      gradeBadge = 'danger';
    }

    // Comprehensive feedback summary
    const feedbackSummary = `SpendWise 금융 습관 진단 결과, 총점 ${totalScore}점(${grade})을 기록했습니다. ` +
      `예산 준수(${breakdown.budgetAdherence.score}/35), 저축 성향(${breakdown.savingsRate.score}/25), ` +
      `과소비 통제(${breakdown.overspendingControl.score}/20), 소액 결제 관리(${breakdown.microTransactionManagement.score}/20)로 평가되었습니다. ` +
      (totalScore >= 80
        ? '계획적인 소비 습관이 매우 잘 정착되어 있습니다. 지속적인 목표 챌린지를 통해 자산 증식을 가속화하세요.'
        : totalScore >= 60
        ? '전반적인 지출 통제력은 갖추고 있으나, 반복되는 소액 지출과 고액 결제 패턴을 재점검하면 더 많은 자금을 저축할 수 있습니다.'
        : '현재 지출 누수가 심각하여 비상금 고갈 및 적자 위험이 있습니다. 월 예산 한도를 즉시 재설정하고 지출 다이어트를 시작하세요.');

    return {
      totalScore,
      grade,
      gradeBadge,
      breakdown,
      feedbackSummary
    };
  }

  /**
   * Run full monthly diagnosis and update analysis_reports table
   */
  static async diagnoseMonth(userId, yearMonth) {
    const user = await User.findById(userId);
    const summary = await Transaction.getMonthlySummary(userId, yearMonth);
    const budgetRow = await Budget.findTotalBudget(userId, yearMonth);
    const budgetAmount = budgetRow ? Number(budgetRow.amount) : 0;

    const overspending = await Transaction.getOverspending(userId, yearMonth, user.overspending_threshold);
    const microTxs = await Transaction.getMicroTransactions(userId, yearMonth, user.micro_tx_threshold);

    const expectedExpenseData = this.calculateExpectedMonthEndExpense(yearMonth, summary.totalExpense);
    const expectedMonthEndExpense = typeof expectedExpenseData === 'object'
      ? expectedExpenseData.expectedTotal
      : expectedExpenseData;

    const budgetUsageRate = budgetAmount > 0
      ? Number(((summary.totalExpense / budgetAmount) * 100).toFixed(1))
      : 0;

    const habitResult = this.calculateHabitScore({
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      budgetAmount,
      overspendingTransactions: overspending,
      microTransactions: microTxs,
      user
    });

    const reportData = {
      habitScore: habitResult.totalScore,
      grade: habitResult.grade,
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      netSavings: summary.netSavings,
      expectedMonthEndExpense,
      budgetUsageRate,
      overspendingCount: overspending.length,
      overspendingTotal: overspending.reduce((s, t) => s + Number(t.amount), 0),
      microTransactionCount: microTxs.reduce((s, t) => s + Number(t.count), 0),
      microTransactionTotal: microTxs.reduce((s, t) => s + Number(t.total_amount), 0),
      scoreBreakdown: habitResult.breakdown,
      feedbackSummary: habitResult.feedbackSummary
    };

    await Analysis.upsertReport(userId, yearMonth, reportData);

    return {
      ...reportData,
      gradeBadge: habitResult.gradeBadge,
      expectedData: expectedExpenseData,
      overspendingList: overspending,
      microList: microTxs
    };
  }
}

module.exports = AnalysisService;
