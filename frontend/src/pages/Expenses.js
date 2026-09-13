import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ExpenseCard from "../components/ExpenseCard";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseFilters from "../components/ExpenseFilters";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expenseService";

const Expenses = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Search, filter, and sort state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [sort, setSort] = useState("date-desc");

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        navigate("/login");
        return;
      }
      setError(
        status === 500
          ? "Server error. Please try again later."
          : err.response?.data?.message || "Failed to load expenses."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle navigation with state { openAdd: true } from Dashboard
  useEffect(() => {
    if (location.state?.openAdd) {
      openAddForm();
    }
  }, [location.state]);

  const openAddForm = () => {
    setEditingExpense(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (expense) => {
    setEditingExpense(expense);
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    setFormError("");
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setFormError("");
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
      } else {
        await createExpense(data);
      }
      closeForm();
      await fetchExpenses();
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        navigate("/login");
        return;
      }
      if (status === 404) {
        setFormError("Expense not found.");
      } else if (status === 400) {
        setFormError(
          err.response?.data?.message || "Validation error. Check your inputs."
        );
      } else {
        setFormError("Server error. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      await fetchExpenses();
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        navigate("/login");
        return;
      }
      if (status === 404) {
        setError("Expense not found.");
      } else {
        setError("Server error while deleting. Please try again.");
      }
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setMonth("");
    setSort("date-desc");
  };

  const hasActiveFilters = Boolean(
    search.trim() || category || month || sort !== "date-desc"
  );

  // Filter and sort expenses locally on frontend
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // 1. Search against title and description (case-insensitive)
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((exp) => {
        const titleMatch = exp.title?.toLowerCase().includes(query);
        const descMatch = exp.description?.toLowerCase().includes(query);
        return Boolean(titleMatch || descMatch);
      });
    }

    // 2. Category filter
    if (category && category !== "All Categories") {
      result = result.filter((exp) => exp.category === category);
    }

    // 3. Month filter (YYYY-MM)
    if (month) {
      result = result.filter((exp) => {
        if (!exp.date) return false;
        const d = new Date(exp.date);
        if (isNaN(d.getTime())) return false;
        const localYearMonth = `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`;
        const isoYearMonth = d.toISOString().slice(0, 7);
        return localYearMonth === month || isoYearMonth === month;
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sort === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sort === "amount-desc") {
        return b.amount - a.amount;
      }
      if (sort === "amount-asc") {
        return a.amount - b.amount;
      }
      // Default: "date-desc" (Newest First)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [expenses, search, category, month, sort]);

  return (
    <div className="expenses-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Expenses</h1>
          <p className="page-subtitle">Track and manage all your expenses</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          + Add Expense
        </button>
      </div>

      {/* Inline Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExpense ? "Edit Expense" : "Add New Expense"}</h2>
              <button
                className="modal-close"
                onClick={closeForm}
                aria-label="Close form"
              >
                ✕
              </button>
            </div>
            {formError && <p className="alert alert-error">{formError}</p>}
            <ExpenseForm
              initialData={editingExpense}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* Global error */}
      {error && !showForm && <p className="alert alert-error">{error}</p>}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading expenses...</p>
        </div>
      )}

      {/* When user has no expenses at all */}
      {!loading && !error && expenses.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">💸</span>
          <h2>No expenses yet</h2>
          <p>Start tracking your spending by adding your first expense.</p>
          <button className="btn btn-primary" onClick={openAddForm}>
            + Add Your First Expense
          </button>
        </div>
      )}

      {/* Main content when expenses exist */}
      {!loading && expenses.length > 0 && (
        <>
          {/* Search, Filter, and Sort Controls */}
          <ExpenseFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            month={month}
            onMonthChange={setMonth}
            sort={sort}
            onSortChange={setSort}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Result Count */}
          <div className="results-header">
            <p className="results-count">
              Showing {filteredExpenses.length} of {expenses.length}{" "}
              {expenses.length === 1 ? "expense" : "expenses"}
            </p>
          </div>

          {/* Empty state when filters yield no results */}
          {filteredExpenses.length === 0 ? (
            <div className="empty-state empty-state-filtered">
              <span className="empty-icon">🔍</span>
              <h2>No expenses match your filters.</h2>
              <p>Try adjusting your search terms or clearing your filters.</p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Expense List */
            <div className="expense-list">
              {filteredExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Expenses;
