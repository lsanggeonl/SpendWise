const AuthService = require('../services/authService');

class AuthController {
  static showLogin(req, res) {
    res.render('auth/login', {
      pageTitle: '로그인 | SpendWise',
      error: req.query.error || null,
      message: req.query.message || null
    });
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);
      req.session.user = user;

      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    } catch (err) {
      res.render('auth/login', {
        pageTitle: '로그인 | SpendWise',
        error: err.message,
        message: null,
        email: req.body.email
      });
    }
  }

  static showSignup(req, res) {
    res.render('auth/signup', {
      pageTitle: '회원가입 | SpendWise',
      error: null
    });
  }

  static async signup(req, res) {
    try {
      const { email, password, passwordConfirm, name, monthlyIncomeTarget } = req.body;

      if (password !== passwordConfirm) {
        throw new Error('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      }

      const user = await AuthService.register({
        email,
        password,
        name,
        monthlyIncomeTarget
      });

      req.session.user = user;
      res.redirect('/dashboard?welcome=1');
    } catch (err) {
      res.render('auth/signup', {
        pageTitle: '회원가입 | SpendWise',
        error: err.message,
        formData: req.body
      });
    }
  }

  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) console.error('Logout session destroy error:', err);
      res.redirect('/auth/login?message=logged_out');
    });
  }
}

module.exports = AuthController;
