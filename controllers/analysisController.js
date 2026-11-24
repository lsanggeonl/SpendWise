const AnalysisService = require('../services/analysisService');
const Analysis = require('../models/Analysis');

class AnalysisController {
  static async index(req, res, next) {
    try {
      const userId = req.session.user.id;
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const yearMonth = req.query.month || currentYearMonth;

      // 1. Run full monthly diagnosis & calculate habit score from real MySQL data
      const diagnosis = await AnalysisService.diagnoseMonth(userId, yearMonth);

      // 2. Fetch historical reports for trend chart
      const history = await Analysis.getHistory(userId, 6);

      res.render('analysis/index', {
        pageTitle: '소비 습관 진단 및 분석 | SpendWise',
        yearMonth,
        diagnosis,
        history,
        message: req.query.message || null
      });
    } catch (err) {
      next(err);
    }
  }

  static async recalculate(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { yearMonth } = req.body;
      await AnalysisService.diagnoseMonth(userId, yearMonth);
      res.redirect(`/analysis?month=${yearMonth}&message=refreshed`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AnalysisController;
