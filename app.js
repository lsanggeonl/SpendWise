require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');
const { setLocals } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'spendwise_default_secure_session_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Global view variables & helpers
app.use(setLocals);

// Mount Application Routes
app.use('/', routes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).render('error', {
    pageTitle: '페이지를 찾을 수 없습니다 | SpendWise',
    status: 404,
    message: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
    stack: null
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 SpendWise FinTech Server is running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
