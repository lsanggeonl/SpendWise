const TransactionService = require('../services/transactionService');
const Category = require('../models/Category');

class TransactionController {
  static async index(req, res, next) {
    try {
      const userId = req.session.user.id;
      const {
        month,
        type,
        categoryId,
        keyword,
        startDate,
        endDate,
        page,
        sortBy,
        sortOrder
      } = req.query;

      const filters = {
        yearMonth: month || null,
        type: type || null,
        categoryId: categoryId || null,
        keyword: keyword || null,
        startDate: startDate || null,
        endDate: endDate || null,
        page: page || 1,
        limit: 15,
        sortBy: sortBy || 'transaction_date',
        sortOrder: sortOrder || 'DESC'
      };

      const [transactionsData, categories] = await Promise.all([
        TransactionService.getTransactions(userId, filters),
        Category.findForUser(userId)
      ]);

      res.render('transactions/index', {
        pageTitle: '수입·지출 관리 | SpendWise',
        transactions: transactionsData.items,
        pagination: transactionsData.pagination,
        categories,
        filters
      });
    } catch (err) {
      next(err);
    }
  }

  static async showCreate(req, res, next) {
    try {
      const userId = req.session.user.id;
      const categories = await Category.findForUser(userId);
      const today = new Date().toISOString().split('T')[0];

      res.render('transactions/form', {
        pageTitle: '거래 내역 등록 | SpendWise',
        transaction: null,
        categories,
        defaultDate: today,
        action: '/transactions',
        isEdit: false
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    const isAjax = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || req.body.ajax === '1';
    try {
      const userId = req.session.user.id;
      const newTxId = await TransactionService.createTransaction(userId, req.body);

      if (isAjax) {
        return res.status(201).json({
          success: true,
          id: newTxId,
          type: req.body.type,
          amount: Number(req.body.amount),
          title: req.body.title,
          message: '거래 내역이 성공적으로 저장되었습니다.'
        });
      }

      // If an income record was created from standard form, celebrate on dashboard!
      if (req.body.type === 'income') {
        const encodedTitle = encodeURIComponent(req.body.title || '수입');
        return res.redirect(`/dashboard?celebrate=income&amount=${req.body.amount}&title=${encodedTitle}`);
      }

      res.redirect('/transactions?message=created');
    } catch (err) {
      if (isAjax) {
        return res.status(400).json({
          success: false,
          error: err.message || '거래 내역 저장에 실패했습니다.'
        });
      }

      try {
        const userId = req.session.user.id;
        const categories = await Category.findForUser(userId);
        res.render('transactions/form', {
          pageTitle: '거래 내역 등록 | SpendWise',
          transaction: req.body,
          categories,
          defaultDate: req.body.transactionDate,
          action: '/transactions',
          isEdit: false,
          error: err.message
        });
      } catch (e) {
        next(e);
      }
    }
  }

  static async showEdit(req, res, next) {
    try {
      const userId = req.session.user.id;
      const id = req.params.id;
      const [transaction, categories] = await Promise.all([
        TransactionService.getTransaction(id, userId),
        Category.findForUser(userId)
      ]);

      res.render('transactions/form', {
        pageTitle: '거래 내역 수정 | SpendWise',
        transaction,
        categories,
        defaultDate: transaction.transaction_date,
        action: `/transactions/${id}/edit`,
        isEdit: true
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const userId = req.session.user.id;
      const id = req.params.id;
      await TransactionService.updateTransaction(id, userId, req.body);
      res.redirect('/transactions?message=updated');
    } catch (err) {
      try {
        const userId = req.session.user.id;
        const id = req.params.id;
        const categories = await Category.findForUser(userId);
        res.render('transactions/form', {
          pageTitle: '거래 내역 수정 | SpendWise',
          transaction: { ...req.body, id },
          categories,
          defaultDate: req.body.transactionDate,
          action: `/transactions/${id}/edit`,
          isEdit: true,
          error: err.message
        });
      } catch (e) {
        next(e);
      }
    }
  }

  static async delete(req, res, next) {
    try {
      const userId = req.session.user.id;
      const id = req.params.id;
      await TransactionService.deleteTransaction(id, userId);
      res.redirect('/transactions?message=deleted');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TransactionController;
