/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);
  
  const status = err.status || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(status).json({
      success: false,
      message
    });
  }

  res.status(status).render('error', {
    pageTitle: '오류 발생 | SpendWise',
    status,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
}

module.exports = errorHandler;
