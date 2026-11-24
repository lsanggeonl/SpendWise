/**
 * Automated Verification Script for SpendWise
 */
require('dotenv').config();
const pool = require('./config/db');
const AuthService = require('./services/authService');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const AnalysisService = require('./services/analysisService');
const SavingGoal = require('./models/SavingGoal');

async function runTests() {
  console.log('🧪 Starting SpendWise Automated Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: DB Connection
    const [dbTest] = await pool.execute('SELECT 1 + 1 AS result');
    assert(dbTest[0].result === 2, 'MySQL2 Database pool connected successfully');

    // Test 2: Auth Service (Login with demo user)
    const user = await AuthService.login('demo@spendwise.com', 'password123');
    assert(user && user.id === 1 && user.email === 'demo@spendwise.com', 'Demo user bcrypt authentication successful');

    // Test 3: Monthly Summary calculation for 2026-11
    const summary = await Transaction.getMonthlySummary(1, '2026-11');
    assert(summary.totalIncome > 0, `Monthly total income calculated from DB: ${summary.totalIncome.toLocaleString()}원`);
    assert(summary.totalExpense > 0, `Monthly total expense calculated from DB: ${summary.totalExpense.toLocaleString()}원`);
    assert(summary.netSavings === (summary.totalIncome - summary.totalExpense), `Net savings calculated correctly: ${summary.netSavings.toLocaleString()}원`);

    // Test 4: Budget & Tier Warning Calculation (70%, 90%, 100%)
    const budgetComparison = await Budget.getComparison(1, '2026-11');
    assert(budgetComparison.totalBudget === 2500000, `Total budget fetched correctly: ${budgetComparison.totalBudget.toLocaleString()}원`);
    assert(budgetComparison.usageRate > 0, `Usage rate calculated: ${budgetComparison.usageRate}%`);
    assert(['safe', 'warning_70', 'warning_90', 'danger_100'].includes(budgetComparison.warningTier.level),
      `Warning tier correctly identified: ${budgetComparison.warningTier.label} (${budgetComparison.warningTier.level})`);

    // Test 5: Month-End Expected Spending Calculation
    const expected = AnalysisService.calculateExpectedMonthEndExpense('2026-11', summary.totalExpense);
    assert(typeof expected === 'object' && expected.expectedTotal >= summary.totalExpense,
      `Month-end expected spending formula verified: ${expected.expectedTotal.toLocaleString()}원 (일평균: ${expected.dailyAverage.toLocaleString()}원, 잔여: ${expected.remainingDays}일)`);

    // Test 6: 100-Point Habit Score Calculation & Rationale
    const diagnosis = await AnalysisService.diagnoseMonth(1, '2026-11');
    assert(diagnosis.habitScore >= 0 && diagnosis.habitScore <= 100, `100-Point habit score calculated: ${diagnosis.habitScore}점 (등급: ${diagnosis.grade})`);
    assert(diagnosis.scoreBreakdown && diagnosis.scoreBreakdown.budgetAdherence.maxScore === 35, '4-Pillar rationale breakdown: Budget Adherence (35 pts)');
    assert(diagnosis.scoreBreakdown.savingsRate.maxScore === 25, '4-Pillar rationale breakdown: Savings Rate (25 pts)');
    assert(diagnosis.scoreBreakdown.overspendingControl.maxScore === 20, '4-Pillar rationale breakdown: Overspending Control (20 pts)');
    assert(diagnosis.scoreBreakdown.microTransactionManagement.maxScore === 20, '4-Pillar rationale breakdown: Micro-transactions (20 pts)');

    // Test 7: Overspending & Repeated Micro-transactions Detection
    assert(diagnosis.overspendingCount > 0, `Overspending items detected: ${diagnosis.overspendingCount}건, 총 ${diagnosis.overspendingTotal.toLocaleString()}원`);
    assert(diagnosis.microTransactionCount > 0, `Repeated micro-transactions detected: ${diagnosis.microTransactionCount}건, 총 ${diagnosis.microTransactionTotal.toLocaleString()}원`);

    // Test 8: Saving Goals Management
    const goals = await SavingGoal.findForUser(1);
    assert(goals.length > 0, `Saving goals retrieved: ${goals.length}개`);
    assert(goals[0].progress >= 0 && goals[0].progress <= 100, `Goal progress calculation: ${goals[0].progress}%`);

    // Test 9: Transaction CRUD Cycle
    const newTxId = await Transaction.create({
      userId: 1,
      categoryId: 6,
      type: 'expense',
      amount: 15000,
      title: '테스트 점심 식사',
      description: '단위 테스트 자동 생성',
      transactionDate: '2026-11-24',
      paymentMethod: '신용카드',
      isFixed: 0
    });
    assert(newTxId > 0, `Transaction created successfully with ID: ${newTxId}`);

    const fetchedTx = await Transaction.findById(newTxId, 1);
    assert(fetchedTx && fetchedTx.title === '테스트 점심 식사', 'Created transaction fetched successfully');

    await Transaction.update(newTxId, 1, {
      categoryId: 6,
      type: 'expense',
      amount: 16000,
      title: '테스트 점심 식사 (수정)',
      description: '수정 완료',
      transactionDate: '2026-11-24',
      paymentMethod: '체크카드',
      isFixed: 0
    });
    const updatedTx = await Transaction.findById(newTxId, 1);
    assert(updatedTx && updatedTx.amount === 16000 && updatedTx.title === '테스트 점심 식사 (수정)', 'Transaction updated successfully');

    await Transaction.delete(newTxId, 1);
    const deletedTx = await Transaction.findById(newTxId, 1);
    assert(deletedTx === null, 'Transaction deleted successfully');

    // Test 10: Total Budget Update & Persistence
    await Budget.upsertTotalBudget(2, '2026-11', 3000000);
    let u2Budget = await Budget.getComparison(2, '2026-11');
    assert(u2Budget.totalBudget === 3000000, `User total budget updated to 3,000,000: ${u2Budget.totalBudget.toLocaleString()}원`);

    await Budget.upsertTotalBudget(2, '2026-11', 2000000);
    u2Budget = await Budget.getComparison(2, '2026-11');
    assert(u2Budget.totalBudget === 2000000, `User total budget changed to 2,000,000: ${u2Budget.totalBudget.toLocaleString()}원`);

    const [rowsU2] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM budgets WHERE user_id = 2 AND \`year_month\` = '2026-11' AND category_id IS NULL`
    );
    assert(rowsU2[0].cnt === 1, `Single total budget row maintained without duplicates: ${rowsU2[0].cnt}`);

    // Restore user 2 back to 1000000
    await Budget.upsertTotalBudget(2, '2026-11', 1000000);

    console.log(`\n========================================`);
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
