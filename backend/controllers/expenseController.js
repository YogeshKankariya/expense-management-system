const mongoose = require("mongoose");
const Expense = require("../models/Expense");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidAmount = (amount) => {
  if (amount === undefined || amount === null || amount === "") {
    return false;
  }

  const value = Number(amount);
  return !Number.isNaN(value) && value >= 0;
};

const formatExpense = (expense) => ({
  id: expense._id,
  userId: expense.userId,
  title: expense.title,
  amount: expense.amount,
  category: expense.category,
  description: expense.description,
  date: expense.date,
  createdAt: expense.createdAt,
});

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;

    if (!title || amount === undefined || amount === null || amount === "" || !category) {
      return res.status(400).json({
        message: "Title, amount and category are required",
      });
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({
        message: "Amount must be a valid number that is 0 or greater",
      });
    }

    const expense = await Expense.create({
      userId: req.user.id,
      title,
      amount: Number(amount),
      category,
      description: description || "",
      date: date || Date.now(),
    });

    return res.status(201).json({
      message: "Expense created successfully",
      expense: formatExpense(expense),
    });
  } catch (error) {
    console.error("Create expense error:", error.message);
    return res.status(500).json({
      message: "Unable to create expense",
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Expenses fetched successfully",
      expenses: expenses.map(formatExpense),
    });
  } catch (error) {
    console.error("Get expenses error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch expenses",
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      message: "Expense fetched successfully",
      expense: formatExpense(expense),
    });
  } catch (error) {
    console.error("Get expense error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch expense",
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }

    const { title, amount, category, description, date } = req.body;

    if (amount !== undefined && amount !== null && amount !== "" && !isValidAmount(amount)) {
      return res.status(400).json({
        message: "Amount must be a valid number that is 0 or greater",
      });
    }

    const updates = {};

    if (title !== undefined) {
      updates.title = title;
    }
    if (amount !== undefined && amount !== null && amount !== "") {
      updates.amount = Number(amount);
    }
    if (category !== undefined) {
      updates.category = category;
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (date !== undefined) {
      updates.date = date;
    }

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      updates,
      { returnDocument: "after", runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      message: "Expense updated successfully",
      expense: formatExpense(expense),
    });
  } catch (error) {
    console.error("Update expense error:", error.message);
    return res.status(500).json({
      message: "Unable to update expense",
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error.message);
    return res.status(500).json({
      message: "Unable to delete expense",
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
