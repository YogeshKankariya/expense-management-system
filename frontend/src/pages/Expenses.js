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
    <div className="expenses-page-container">
      {/* Page Header */}
      <div className="expenses-page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            Manage, search, and track all your logged expenses
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {error && !showForm && (
        <div className="alert alert-error" role="alert">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Inline Form Modal */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={closeForm}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-heading"
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="modal-heading" className="modal-title">
                  {editingExpense ? "Edit Expense" : "Add New Expense"}
                </h2>
                <p className="modal-subtitle">
                  {editingExpense
                    ? "Update the details of your recorded transaction."
                    : "Fill in the details below to record a new expense."}
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={closeForm}
                aria-label="Close dialog"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="alert alert-error alert-sm" role="alert">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <ExpenseForm
              initialData={editingExpense}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state-card">
          <div className="spinner" />
          <p>Loading your expenses...</p>
        </div>
      )}

      {/* Empty State when 0 expenses exist */}
      {!loading && !error && expenses.length === 0 && (
        <div className="empty-state-card">
          <div className="empty-icon-circle">💸</div>
          <h2 className="empty-title">No expenses yet</h2>
          <p className="empty-subtitle">
            Start tracking your personal spending by adding your first expense.
          </p>
          <button className="btn btn-primary" onClick={openAddForm}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Your First Expense</span>
          </button>
        </div>
      )}

      {/* Main Content when expenses exist */}
      {!loading && expenses.length > 0 && (
        <>
          {/* Search, Filter, and Sort Toolbar */}
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

          {/* Result Count and Active Filters Bar */}
          <div className="results-status-bar">
            <div className="results-count-pill">
              <span>
                Showing <strong>{filteredExpenses.length}</strong> of{" "}
                <strong>{expenses.length}</strong>{" "}
                {expenses.length === 1 ? "expense" : "expenses"}
              </span>
            </div>

            {hasActiveFilters && (
              <div className="active-filters-notice">
                <span className="active-filter-indicator"></span>
                <span>Filters Active</span>
              </div>
            )}
          </div>

          {/* Empty State when filters match 0 items */}
          {filteredExpenses.length === 0 ? (
            <div className="empty-state-card empty-state-filtered">
              <div className="empty-icon-circle">🔍</div>
              <h2 className="empty-title">No expenses match your filters.</h2>
              <p className="empty-subtitle">
                Try refining your search keyword, changing the category, or
                resetting your filters.
              </p>
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
            <div className="expense-cards-list">
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
