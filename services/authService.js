const bcrypt = require('bcrypt');
const User = require('../models/User');

class AuthService {
  static async login(email, password) {
    if (!email || !password) {
      throw new Error('이메일과 비밀번호를 모두 입력해주세요.');
    }

    const user = await User.findByEmail(email.trim());
    if (!user) {
      throw new Error('등록되지 않은 이메일 주소이거나 비밀번호가 일치하지 않습니다.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('등록되지 않은 이메일 주소이거나 비밀번호가 일치하지 않습니다.');
    }

    // Return safe user object (exclude password hash)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      monthly_income_target: Number(user.monthly_income_target || 0),
      overspending_threshold: Number(user.overspending_threshold || 100000),
      micro_tx_threshold: Number(user.micro_tx_threshold || 10000)
    };
  }

  static async register({ email, password, name, monthlyIncomeTarget = 3500000 }) {
    if (!email || !password || !name) {
      throw new Error('모든 필수 정보를 입력해주세요.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findByEmail(cleanEmail);
    if (existing) {
      throw new Error('이미 사용 중인 이메일 주소입니다.');
    }

    if (password.length < 6) {
      throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      name: name.trim(),
      monthlyIncomeTarget: Number(monthlyIncomeTarget) || 3500000,
      overspendingThreshold: 100000,
      microTxThreshold: 10000
    });

    return {
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      monthly_income_target: Number(monthlyIncomeTarget) || 3500000,
      overspending_threshold: 100000,
      micro_tx_threshold: 10000
    };
  }

  static async updateProfile(userId, { name, monthlyIncomeTarget, overspendingThreshold, microTxThreshold }) {
    if (!name || name.trim() === '') {
      throw new Error('이름을 입력해주세요.');
    }

    await User.updateProfile(userId, {
      name: name.trim(),
      monthlyIncomeTarget: Math.max(0, Number(monthlyIncomeTarget || 0)),
      overspendingThreshold: Math.max(10000, Number(overspendingThreshold || 100000)),
      microTxThreshold: Math.max(1000, Number(microTxThreshold || 10000))
    });

    const updated = await User.findById(userId);
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      monthly_income_target: Number(updated.monthly_income_target),
      overspending_threshold: Number(updated.overspending_threshold),
      micro_tx_threshold: Number(updated.micro_tx_threshold)
    };
  }

  static async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new Error('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
    }
    if (newPassword.length < 6) {
      throw new Error('새 비밀번호는 최소 6자 이상이어야 합니다.');
    }

    const user = await User.findById(userId);
    const fullUser = await User.findByEmail(user.email);

    const isMatch = await bcrypt.compare(currentPassword, fullUser.password);
    if (!isMatch) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedPassword);
    return true;
  }
}

module.exports = AuthService;
