const ExpenseRecord = require('../models/ExpenseRecord');
const ExpenseCategory = require('../models/ExpenseCategory');
const { sequelize } = require('../config/database');

// @desc    Get all expense records
// @route   GET /api/expense/expense-records
// @access  Private
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await ExpenseRecord.findAll({
      include: [{ model: ExpenseCategory, attributes: ['name', 'color'] }],
      order: [['date', 'DESC']]
    });
    
    const formatted = expenses.map(e => ({
      ...e.toJSON(),
      categoryName: e.ExpenseCategory?.name || 'Uncategorized',
      categoryColor: e.ExpenseCategory?.color || '#E5E7EB'
    }));
    
    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get expense records error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense records' });
  }
};

// @desc    Get expense record by ID
// @route   GET /api/expense/expense-records/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await ExpenseRecord.findByPk(req.params.id, {
      include: [{ model: ExpenseCategory, attributes: ['name', 'color'] }]
    });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error('Get expense record error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense record' });
  }
};

// @desc    Create expense record
// @route   POST /api/expense/expense-records
// @access  Private (Owner, Manager, Cashier)
const createExpense = async (req, res) => {
  try {
    const { categoryId, amount, description, date, paymentMethod, receipt } = req.body;
    
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }
    
    // If categoryId is provided, check if it exists
    if (categoryId) {
      const category = await ExpenseCategory.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Expense category not found' });
      }
    }
    
    const expense = await ExpenseRecord.create({
      categoryId: categoryId || null,
      amount,
      description: description || '',
      date: date || new Date(),
      paymentMethod: paymentMethod || 'cash',
      receipt: receipt || ''
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense record error:', error);
    res.status(500).json({ success: false, message: 'Failed to create expense record' });
  }
};

// @desc    Update expense record
// @route   PUT /api/expense/expense-records/:id
// @access  Private (Owner, Manager)
const updateExpense = async (req, res) => {
  try {
    const expense = await ExpenseRecord.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    await expense.update(req.body);
    res.status(200).json(expense);
  } catch (error) {
    console.error('Update expense record error:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense record' });
  }
};

// @desc    Delete expense record
// @route   DELETE /api/expense/expense-records/:id
// @access  Private (Owner, Manager)
const deleteExpense = async (req, res) => {
  try {
    const expense = await ExpenseRecord.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    await expense.destroy();
    res.status(200).json({ success: true, message: 'Expense record deleted successfully' });
  } catch (error) {
    console.error('Delete expense record error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete expense record' });
  }
};

// @desc    Get monthly expenses
// @route   GET /api/expense/monthly-expenses
// @access  Private
const getMonthlyExpenses = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const [results] = await sequelize.query(`
      SELECT 
        EXTRACT(MONTH FROM e."date") as month,
        SUM(e.amount) as amount,
        c.name as "categoryName",
        c.color as "categoryColor"
      FROM "ExpenseRecords" e
      LEFT JOIN "ExpenseCategories" c ON e."categoryId" = c.id
      WHERE EXTRACT(YEAR FROM e."date") = :year
      GROUP BY EXTRACT(MONTH FROM e."date"), c.name, c.color
      ORDER BY month ASC
    `, {
      replacements: { year }
    });
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = results.map(row => ({
      month: monthNames[parseInt(row.month) - 1],
      amount: parseFloat(row.amount) || 0,
      categoryName: row.categoryName || 'Uncategorized',
      categoryColor: row.categoryColor || '#E5E7EB'
    }));
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Get monthly expenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch monthly expenses' });
  }
};

// @desc    Get expense summary
// @route   GET /api/expense/expense-records/summary
// @access  Private
const getExpenseSummary = async (req, res) => {
  try {
    const { month, year = new Date().getFullYear() } = req.query;
    
    let whereClause = `EXTRACT(YEAR FROM e."date") = :year`;
    const replacements = { year };
    
    if (month) {
      whereClause += ` AND EXTRACT(MONTH FROM e."date") = :month`;
      replacements.month = month;
    }
    
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as "totalCount",
        SUM(e.amount) as "totalAmount",
        AVG(e.amount) as "avgAmount",
        MIN(e.amount) as "minAmount",
        MAX(e.amount) as "maxAmount"
      FROM "ExpenseRecords" e
      WHERE ${whereClause}
    `, {
      replacements
    });
    
    res.status(200).json(results[0]);
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense summary' });
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlyExpenses,
  getExpenseSummary
};