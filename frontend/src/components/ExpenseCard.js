const CATEGORY_META = {
  Food: { icon: "🍔", color: "#f59e0b", bg: "#fef3c7" },
  Transport: { icon: "🚌", color: "#3b82f6", bg: "#dbeafe" },
  Shopping: { icon: "🛍️", color: "#ec4899", bg: "#fce7f3" },
  Bills: { icon: "💡", color: "#ef4444", bg: "#fee2e2" },
  Education: { icon: "📚", color: "#8b5cf6", bg: "#ede9fe" },
  Entertainment: { icon: "🎬", color: "#10b981", bg: "#d1fae5" },
  Healthcare: { icon: "🏥", color: "#06b6d4", bg: "#cffafe" },
  Other: { icon: "📦", color: "#64748b", bg: "#f1f5f9" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const { title, amount, category, description, date } = expense;
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;

  const handleDelete = () => {
    if (window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      onDelete(expense.id);
    }
  };

  return (
    <div className="expense-card">
      {/* Left info area */}
      <div className="expense-card-left">
        <div
          className="expense-category-avatar"
          style={{ backgroundColor: meta.bg }}
          aria-hidden="true"
        >
          <span className="expense-icon">{meta.icon}</span>
        </div>

        <div className="expense-info">
          <div className="expense-header-line">
            <h3 className="expense-title" title={title}>
              {title}
            </h3>
            <span
              className="expense-category-badge"
              style={{
                backgroundColor: meta.bg,
                color: meta.color,
                borderColor: meta.bg,
              }}
            >
              {category}
            </span>
          </div>

          {description && (
            <p className="expense-description" title={description}>
              {description}
            </p>
          )}

          <div className="expense-date-row">
            <svg
              className="calendar-icon"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="expense-date">{formatDate(date)}</span>
          </div>
        </div>
      </div>

      {/* Right amount and actions area */}
      <div className="expense-card-right">
        <span className="expense-amount">{formatAmount(amount)}</span>

        <div className="expense-actions">
          <button
            type="button"
            className="btn-action btn-action-edit"
            onClick={() => onEdit(expense)}
            title={`Edit ${title}`}
            aria-label={`Edit ${title}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>

          <button
            type="button"
            className="btn-action btn-action-delete"
            onClick={handleDelete}
            title={`Delete ${title}`}
            aria-label={`Delete ${title}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
