const CATEGORIES = [
  "All Categories",
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Education",
  "Entertainment",
  "Healthcare",
  "Other",
];

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "amount-desc", label: "Amount: High to Low" },
  { value: "amount-asc", label: "Amount: Low to High" },
];

const ExpenseFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  month,
  onMonthChange,
  sort,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="filters-container">
      {/* Search Input */}
      <div className="search-bar-wrapper">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search expenses"
        />
        {search && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange("")}
            aria-label="Clear search text"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="filters-row">
        <div className="filter-item">
          <label htmlFor="filter-category" className="filter-label">
            Category
          </label>
          <select
            id="filter-category"
            className="filter-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === "All Categories" ? "" : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="filter-month" className="filter-label">
            Month
          </label>
          <input
            id="filter-month"
            type="month"
            className="filter-month-input"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="filter-sort" className="filter-label">
            Sort by
          </label>
          <select
            id="filter-sort"
            className="filter-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item filter-actions">
          <label className="filter-label filter-label-spacer">&nbsp;</label>
          <button
            type="button"
            className={`btn btn-clear-filters ${
              hasActiveFilters ? "btn-clear-active" : "btn-outline"
            }`}
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
