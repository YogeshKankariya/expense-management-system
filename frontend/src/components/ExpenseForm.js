import { useState, useEffect } from "react";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Entertainment",
  "Healthcare",
  "Other",
];

const today = () => new Date().toISOString().slice(0, 10);

const ExpenseForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    date: today(),
  });
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount:
          initialData.amount !== undefined ? String(initialData.amount) : "",
        category: initialData.category || "",
        description: initialData.description || "",
        date: initialData.date
          ? new Date(initialData.date).toISOString().slice(0, 10)
          : today(),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Please enter an expense title.";
    }
    if (formData.amount === "" || formData.amount === null) {
      newErrors.amount = "Please specify an amount.";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      newErrors.amount = "Amount must be a valid number (0 or greater).";
    }
    if (!formData.category) {
      newErrors.category = "Please select an expense category.";
    }
    if (!formData.date) {
      newErrors.date = "Please select a date.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      title: formData.title.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description.trim(),
      date: formData.date,
    });
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      {/* Title Field */}
      <div className="form-group">
        <label htmlFor="form-title" className="form-label">
          Title <span className="required-indicator">*</span>
        </label>
        <input
          id="form-title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Grocery shopping, Metro pass"
          className={`form-input ${errors.title ? "input-has-error" : ""}`}
          autoFocus={!initialData}
        />
        {errors.title && (
          <p className="field-error-msg" role="alert">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errors.title}
          </p>
        )}
      </div>

      {/* Amount and Category Fields */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="form-amount" className="form-label">
            Amount (₹) <span className="required-indicator">*</span>
          </label>
          <div className="input-currency-wrapper">
            <span className="input-currency-prefix">₹</span>
            <input
              id="form-amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={`form-input form-input-with-prefix ${
                errors.amount ? "input-has-error" : ""
              }`}
            />
          </div>
          {errors.amount && (
            <p className="field-error-msg" role="alert">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.amount}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="form-category" className="form-label">
            Category <span className="required-indicator">*</span>
          </label>
          <select
            id="form-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-select ${errors.category ? "input-has-error" : ""}`}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="field-error-msg" role="alert">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.category}
            </p>
          )}
        </div>
      </div>

      {/* Date Field */}
      <div className="form-group">
        <label htmlFor="form-date" className="form-label">
          Date <span className="required-indicator">*</span>
        </label>
        <input
          id="form-date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className={`form-input ${errors.date ? "input-has-error" : ""}`}
        />
        {errors.date && (
          <p className="field-error-msg" role="alert">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errors.date}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="form-group">
        <label htmlFor="form-description" className="form-label">
          Description <span className="optional-badge">(optional)</span>
        </label>
        <textarea
          id="form-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add optional context or notes..."
          rows={3}
          className="form-textarea"
        />
      </div>

      {/* Action Buttons */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="btn-spinner" aria-hidden="true"></span>
              <span>Saving...</span>
            </>
          ) : initialData ? (
            "Update Expense"
          ) : (
            "Add Expense"
          )}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
