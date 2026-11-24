/**
 * SpendWise End-to-End HTTP Endpoints Test
 */
const http = require('http');
const app = require('./app');

async function testHttpEndpoints() {
  console.log('🌐 Testing SpendWise HTTP Server Endpoints...\n');

  const server = http.createServer(app);
  const PORT = 3001; // Use test port to avoid conflict
  
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Server listening on http://127.0.0.1:${PORT}`);

  let cookie = '';

  async function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const reqOptions = {
        hostname: '127.0.0.1',
        port: PORT,
        path: path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(cookie ? { 'Cookie': cookie } : {}),
          ...(options.headers || {})
        }
      };

      const req = http.request(reqOptions, (res) => {
        let body = '';
        if (res.headers['set-cookie']) {
          cookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      });

      req.on('error', reject);
      if (options.body) req.write(options.body);
      req.end();
    });
  }

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
    // 1. GET / (redirects to /auth/login for guest)
    const resRoot = await request('/');
    assert(resRoot.statusCode === 302 && resRoot.headers.location === '/auth/login', 'GET / redirects unauthenticated visitor to /auth/login');

    // 2. GET /auth/login
    const resLogin = await request('/auth/login');
    assert(resLogin.statusCode === 200 && resLogin.body.includes('SpendWise'), 'GET /auth/login renders login page successfully');

    // 3. POST /auth/login (Login demo user)
    const resPostLogin = await request('/auth/login', {
      method: 'POST',
      body: 'email=demo%40spendwise.com&password=password123'
    });
    assert(resPostLogin.statusCode === 302 && resPostLogin.headers.location === '/dashboard', 'POST /auth/login validates credentials and redirects to /dashboard');

    // 4. GET /dashboard (with session)
    const resDashboard = await request('/dashboard');
    assert(resDashboard.statusCode === 200 && resDashboard.body.includes('대시보드') && resDashboard.body.includes('월말 예상 지출액'),
      'GET /dashboard renders complete dashboard with metrics');

    // 5. GET /transactions
    const resTx = await request('/transactions');
    assert(resTx.statusCode === 200 && resTx.body.includes('수입·지출 거래 원장'), 'GET /transactions renders transaction ledger');

    // 6. GET /budget
    const resBudget = await request('/budget');
    assert(resBudget.statusCode === 200 && resBudget.body.includes('총 지출 예산 한도 관리'), 'GET /budget renders budget management page');

    // 6-1. POST /budget/total (Update total budget)
    const resPostBudget = await request('/budget/total', {
      method: 'POST',
      body: 'yearMonth=2026-11&amount=2800000'
    });
    assert(resPostBudget.statusCode === 302 && resPostBudget.headers.location.includes('/budget'), 'POST /budget/total successfully updates budget and redirects');

    const resBudgetAfter = await request('/budget');
    assert(resBudgetAfter.statusCode === 200 && resBudgetAfter.body.includes('2,800,000'), 'GET /budget renders newly updated total budget amount 2,800,000원');

    // Restore demo user budget back to 2500000
    await request('/budget/total', {
      method: 'POST',
      body: 'yearMonth=2026-11&amount=2500000'
    });

    // 7. GET /analysis (Habit Diagnosis tab)
    const resAnalysis = await request('/analysis');
    assert(resAnalysis.statusCode === 200 && resAnalysis.body.includes('소비 습관 정밀 진단') && resAnalysis.body.includes('4대 평가 영역별 채점 결과'),
      'GET /analysis renders 100-point habit diagnosis report');

    // 8. GET /analysis?tab=patterns (Spending Patterns tab)
    const resPatterns = await request('/analysis?tab=patterns');
    assert(resPatterns.statusCode === 200 && resPatterns.body.includes('과소비 탐지 리포트') && resPatterns.body.includes('반복 소액 결제 탐지'),
      'GET /analysis?tab=patterns renders overspending and micro-transaction detection reports');

    // 9. GET /challenges
    const resChallenges = await request('/challenges');
    assert(resChallenges.statusCode === 200 && resChallenges.body.includes('절약 목표 및 금융 챌린지'), 'GET /challenges renders challenges page');

    // 10. GET /settings
    const resSettings = await request('/settings');
    assert(resSettings.statusCode === 200 && resSettings.body.includes('회원 정보 및 소비 습관 분석 기준 설정'), 'GET /settings renders user settings page');

    // 11. GET /auth/logout
    const resLogout = await request('/auth/logout');
    assert(resLogout.statusCode === 302 && resLogout.headers.location.includes('/auth/login'), 'GET /auth/logout destroys session and redirects');

    console.log(`\n========================================`);
    console.log(`HTTP Endpoints Result: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    server.close();
    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('HTTP Test Error:', err);
    server.close();
    process.exit(1);
  }
}

testHttpEndpoints();
