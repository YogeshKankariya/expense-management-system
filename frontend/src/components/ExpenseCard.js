const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚌",
  Shopping: "🛍️",
  Bills: "💡",
  Education: "📚",
  Entertainment: "🎬",
  Healthcare: "🏥",
  Other: "📦",
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
  const icon = CATEGORY_ICONS[category] || "📦";

  const handleDelete = () => {
    if (window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      onDelete(expense.id);
    }
  };

  return (
    <div className="expense-card">
      <div className="expense-card-left">
        <span className="expense-icon">{icon}</span>
        <div className="expense-info">
          <h3 className="expense-title">{title}</h3>
          <span className="expense-category-badge">{category}</span>
          {description && (
            <p className="expense-description">{description}</p>
          )}
          <p className="expense-date">{formatDate(date)}</p>
        </div>
      </div>
      <div className="expense-card-right">
        <p className="expense-amount">{formatAmount(amount)}</p>
        <div className="expense-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => onEdit(expense)}
            aria-label={`Edit ${title}`}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={handleDelete}
            aria-label={`Delete ${title}`}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
