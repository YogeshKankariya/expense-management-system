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
        amount: initialData.amount !== undefined ? String(initialData.amount) : "",
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
      newErrors.title = "Title is required.";
    }
    if (formData.amount === "" || formData.amount === null) {
      newErrors.amount = "Amount is required.";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      newErrors.amount = "Amount must be a number greater than or equal to 0.";
    }
    if (!formData.category) {
      newErrors.category = "Category is required.";
    }
    if (!formData.date) {
      newErrors.date = "Date is required.";
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
      <div className="form-group">
        <label htmlFor="title">Title <span className="required">*</span></label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Grocery shopping"
          className={errors.title ? "input-error" : ""}
        />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount (₹) <span className="required">*</span></label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            className={errors.amount ? "input-error" : ""}
          />
          {errors.amount && <p className="field-error">{errors.amount}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category <span className="required">*</span></label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? "input-error" : ""}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date <span className="required">*</span></label>
        <input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          className={errors.date ? "input-error" : ""}
        />
        {errors.date && <p className="field-error">{errors.date}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description <span className="optional">(optional)</span></label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add a note..."
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Update Expense" : "Add Expense"}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
