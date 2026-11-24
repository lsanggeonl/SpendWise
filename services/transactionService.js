const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

class TransactionService {
  static async getTransactions(userId, filters = {}) {
    const page = Math.max(1, parseInt(filters.page || '1', 10));
    const limit = Math.max(1, parseInt(filters.limit || '15', 10));
    const offset = (page - 1) * limit;

    const filterParams = {
      yearMonth: filters.yearMonth || null,
      type: filters.type || null,
      categoryId: filters.categoryId ? parseInt(filters.categoryId, 10) : null,
      keyword: filters.keyword || null,
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
      sortBy: filters.sortBy || 'transaction_date',
      sortOrder: filters.sortOrder || 'DESC',
      limit,
      offset
    };

    const [items, totalCount] = await Promise.all([
      Transaction.findWithFilters(userId, filterParams),
      Transaction.countWithFilters(userId, filterParams)
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  static async getTransaction(id, userId) {
    const tx = await Transaction.findById(id, userId);
    if (!tx) {
      throw new Error('거래 내역을 찾을 수 없거나 접근 권한이 없습니다.');
    }
    return tx;
  }

  static async createTransaction(userId, data) {
    const { categoryId, type, amount, title, description, transactionDate, paymentMethod, isFixed } = data;

    if (!categoryId || !type || !amount || !title || !transactionDate) {
      throw new Error('필수 거래 정보(분류, 유형, 금액, 거래명, 일자)를 모두 입력해주세요.');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('올바른 거래 금액을 입력해주세요.');
    }

    return await Transaction.create({
      userId,
      categoryId: parseInt(categoryId, 10),
      type,
      amount: numAmount,
      title: title.trim(),
      description: description ? description.trim() : null,
      transactionDate,
      paymentMethod: paymentMethod || '신용카드',
      isFixed: !!isFixed
    });
  }

  static async updateTransaction(id, userId, data) {
    const { categoryId, type, amount, title, description, transactionDate, paymentMethod, isFixed } = data;

    if (!categoryId || !type || !amount || !title || !transactionDate) {
      throw new Error('필수 거래 정보(분류, 유형, 금액, 거래명, 일자)를 모두 입력해주세요.');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('올바른 거래 금액을 입력해주세요.');
    }

    const updated = await Transaction.update(id, userId, {
      categoryId: parseInt(categoryId, 10),
      type,
      amount: numAmount,
      title: title.trim(),
      description: description ? description.trim() : null,
      transactionDate,
      paymentMethod: paymentMethod || '신용카드',
      isFixed: !!isFixed
    });

    if (!updated) {
      throw new Error('거래 내역 수정에 실패했거나 수정 권한이 없습니다.');
    }
    return true;
  }

  static async deleteTransaction(id, userId) {
    const deleted = await Transaction.delete(id, userId);
    if (!deleted) {
      throw new Error('거래 내역 삭제에 실패했거나 삭제 권한이 없습니다.');
    }
    return true;
  }

  static async getCategories(userId, type = null) {
    return await Category.findForUser(userId, type);
  }
}

module.exports = TransactionService;
