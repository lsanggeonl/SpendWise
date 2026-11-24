const AuthService = require('../services/authService');
const User = require('../models/User');

class SettingController {
  static async index(req, res, next) {
    try {
      const userId = req.session.user.id;
      const user = await User.findById(userId);

      res.render('settings/index', {
        pageTitle: '회원 설정 | SpendWise',
        user,
        message: req.query.message || null,
        error: req.query.error || null
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { name, monthlyIncomeTarget, overspendingThreshold, microTxThreshold } = req.body;

      const updatedUser = await AuthService.updateProfile(userId, {
        name,
        monthlyIncomeTarget,
        overspendingThreshold,
        microTxThreshold
      });

      // Update session
      req.session.user = {
        ...req.session.user,
        name: updatedUser.name,
        monthly_income_target: updatedUser.monthly_income_target,
        overspending_threshold: updatedUser.overspending_threshold,
        micro_tx_threshold: updatedUser.micro_tx_threshold
      };

      res.redirect('/settings?message=profile_updated');
    } catch (err) {
      res.redirect(`/settings?error=${encodeURIComponent(err.message)}`);
    }
  }

  static async updatePassword(req, res, next) {
    try {
      const userId = req.session.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        throw new Error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);
      res.redirect('/settings?message=password_updated');
    } catch (err) {
      res.redirect(`/settings?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = SettingController;
