const SavingGoal = require('../models/SavingGoal');

class ChallengeController {
  static async index(req, res, next) {
    try {
      const userId = req.session.user.id;
      const statusFilter = req.query.status || null;
      const goals = await SavingGoal.findForUser(userId, statusFilter);

      const ongoingGoals = goals.filter(g => g.status === 'ongoing');
      const completedGoals = goals.filter(g => g.status === 'completed');

      const totalTarget = ongoingGoals.reduce((s, g) => s + g.target_amount, 0);
      const totalSaved = ongoingGoals.reduce((s, g) => s + g.current_amount, 0);
      const overallProgress = totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;

      res.render('challenge/index', {
        pageTitle: '절약 챌린지 및 목표 | SpendWise',
        goals,
        ongoingGoals,
        completedGoals,
        totalTarget,
        totalSaved,
        overallProgress,
        statusFilter,
        message: req.query.message || null
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { title, targetAmount, currentAmount, startDate, endDate, category, icon } = req.body;

      if (!title || !targetAmount || !startDate || !endDate) {
        throw new Error('목표명, 목표금액, 기간을 모두 입력해주세요.');
      }

      await SavingGoal.create({
        userId,
        title: title.trim(),
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        startDate,
        endDate,
        category: category || '일반 저축',
        icon: icon || 'target'
      });

      res.redirect('/challenges?message=created');
    } catch (err) {
      next(err);
    }
  }

  static async addProgress(req, res, next) {
    try {
      const userId = req.session.user.id;
      const id = req.params.id;
      const { amount } = req.body;

      if (!amount || Number(amount) <= 0) {
        throw new Error('올바른 저축 금액을 입력해주세요.');
      }

      await SavingGoal.addProgress(id, userId, amount);
      res.redirect('/challenges?message=progress_added');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const userId = req.session.user.id;
      const id = req.params.id;
      const { title, targetAmount, currentAmount, startDate, endDate, category, icon, status } = req.body;

      await SavingGoal.update(id, userId, {
        title: title.trim(),
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        startDate,
        endDate,
        category,
        icon,
        status
      });

      res.redirect('/challenges?message=updated');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const userId = req.session.user.id;
      const id = req.params.id;
      await SavingGoal.delete(id, userId);
      res.redirect('/challenges?message=deleted');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChallengeController;
